-- =====================================================================
-- Lodestar / Vega  |  Migration 015: Billing state
-- Tracks subscription state on the member so the store webhooks
-- (RevenueCat for mobile, Stripe for web) can flip members.tier and we
-- can reason about renewals and cancellations. The webhooks run with the
-- service role, so they bypass RLS to write these fields.
-- =====================================================================

alter table members
  add column if not exists subscription_provider    text,        -- 'revenuecat' | 'stripe'
  add column if not exists subscription_status       text,        -- 'active' | 'canceled' | 'expired' | ...
  add column if not exists subscription_period_end   timestamptz, -- current paid-through time
  add column if not exists stripe_customer_id        text;

create index if not exists members_stripe_customer_idx
  on members (stripe_customer_id);

-- ---------------------------------------------------------------------
-- apply_subscription_state(): single, audited path the billing webhooks
-- call (as service role) to set a member's tier and subscription fields.
-- Keeps the mapping logic in one place and validates the tier value.
-- ---------------------------------------------------------------------
create or replace function apply_subscription_state(
  p_member             uuid,
  p_tier               member_tier,
  p_provider           text,
  p_status             text,
  p_period_end         timestamptz,
  p_stripe_customer_id text default null
)
returns void
language plpgsql
security definer
set search_path = public
as $$
begin
  update members
     set tier                    = p_tier,
         subscription_provider   = p_provider,
         subscription_status     = p_status,
         subscription_period_end = p_period_end,
         stripe_customer_id      = coalesce(p_stripe_customer_id, stripe_customer_id)
   where id = p_member;
end;
$$;

-- This RPC must only ever run from the billing webhooks (service role).
-- Postgres grants EXECUTE to PUBLIC by default and Supabase exposes public
-- functions to anon/authenticated, so without this a member client could call
-- it directly to self-upgrade. Lock it to the service role.
revoke execute on function apply_subscription_state(uuid, member_tier, text, text, timestamptz, text) from public, anon, authenticated;
grant  execute on function apply_subscription_state(uuid, member_tier, text, text, timestamptz, text) to service_role;

-- Members may edit their own profile, but tier and subscription state are set
-- ONLY by the webhooks. RLS gates rows, not columns, and a table-level UPDATE
-- grant overrides any column-level revoke, so we drop the blanket UPDATE and
-- grant back exactly the non-billing columns the app and its invoker-security
-- RPCs write. A direct PATCH of members.tier by an authenticated client is then
-- rejected; tier/subscription_* remain writable only by the service role and
-- the SECURITY DEFINER reconcile functions.
revoke update on members from anon, authenticated;
grant update (display_name, morning_time, evening_time, timezone, calendar_connected, last_contact_at, country_code)
  on members to authenticated;
