-- =====================================================================
-- Lodestar / Vega  |  Migration 017: Pending entitlement cleanup
-- Web-first purchases that are never claimed (the buyer never signs up)
-- leave a pending_entitlements row. Drop anything untouched for 90 days so
-- the table stays tidy. Pure DB delete, run nightly by pg_cron.
-- =====================================================================

create or replace function cleanup_pending_entitlements()
returns void
language sql
security definer
set search_path = public
as $$
  delete from pending_entitlements
  where updated_at < now() - interval '90 days';
$$;

select cron.schedule(
  'lodestar-pending-entitlements-cleanup',
  '30 3 * * *',                       -- nightly at 03:30 UTC
  $$ select cleanup_pending_entitlements(); $$
);
