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
  p_member        uuid,
  p_tier          member_tier,
  p_provider      text,
  p_status        text,
  p_period_end    timestamptz
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
         subscription_period_end = p_period_end
   where id = p_member;
end;
$$;
