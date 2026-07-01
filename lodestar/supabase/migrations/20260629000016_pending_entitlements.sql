-- =====================================================================
-- Lodestar / Vega  |  Migration 016: Web-first purchase reconciliation
-- A Stripe purchase made on the website before the buyer has an account
-- cannot map to a member yet. The stripe-webhook stashes it here, keyed by
-- email. It is applied the moment that email creates an account (signup
-- trigger) or via reconcile_my_entitlements() the app calls on load.
-- =====================================================================

create table if not exists pending_entitlements (
  email              text primary key,        -- lowercased billing email
  tier               member_tier not null,
  provider           text not null default 'stripe',
  status             text,
  period_end         timestamptz,
  stripe_customer_id text,
  created_at         timestamptz not null default now(),
  updated_at         timestamptz not null default now()
);

-- Service-role only: the webhook writes it, the definer functions below
-- read and clear it. No member-facing policies.
alter table pending_entitlements enable row level security;

-- ---------------------------------------------------------------------
-- Apply (and clear) a pending entitlement for a given member + email.
-- Shared by the signup trigger and the self-reconcile RPC.
-- ---------------------------------------------------------------------
create or replace function apply_pending_for(p_member uuid, p_email text)
returns boolean
language plpgsql
security definer
set search_path = public
as $$
declare
  v_pending pending_entitlements%rowtype;
begin
  select * into v_pending from pending_entitlements where email = lower(p_email);
  if not found then
    return false;
  end if;

  update members
     set tier                    = v_pending.tier,
         subscription_provider   = v_pending.provider,
         subscription_status     = v_pending.status,
         subscription_period_end = v_pending.period_end,
         stripe_customer_id      = coalesce(v_pending.stripe_customer_id, stripe_customer_id)
   where id = p_member;

  delete from pending_entitlements where email = lower(p_email);
  return true;
end;
$$;

-- Service-role only: it writes tier/subscription state, so a member client
-- must not be able to call it directly. The signup trigger and the
-- reconcile RPC below invoke it as definer, so this revoke does not affect
-- them.
revoke execute on function apply_pending_for(uuid, text) from public, anon, authenticated;
grant  execute on function apply_pending_for(uuid, text) to service_role;

-- ---------------------------------------------------------------------
-- Self-reconcile: the app calls this once a session exists, as a backstop
-- to the signup trigger (covers any email-casing or timing edge case).
-- ---------------------------------------------------------------------
create or replace function reconcile_my_entitlements()
returns boolean
language plpgsql
security definer
set search_path = public
as $$
declare
  v_email text;
begin
  if auth.uid() is null then
    return false;
  end if;
  select email into v_email from members where id = auth.uid();
  if v_email is null then
    return false;
  end if;
  return apply_pending_for(auth.uid(), v_email);
end;
$$;

-- ---------------------------------------------------------------------
-- Reconcile at signup: extend the existing new-user handler so a member
-- created after a web purchase inherits their paid tier immediately.
-- ---------------------------------------------------------------------
create or replace function handle_new_auth_user()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  insert into public.members (id, email, display_name)
  values (
    new.id,
    new.email,
    coalesce(new.raw_user_meta_data ->> 'display_name', split_part(new.email, '@', 1))
  )
  on conflict (id) do nothing;

  -- Apply any web-first purchase made before signup, matched by email.
  perform public.apply_pending_for(new.id, new.email);

  return new;
end;
$$;
