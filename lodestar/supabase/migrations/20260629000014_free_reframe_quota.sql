-- =====================================================================
-- Lodestar / Vega  |  Migration 014: Free-tier reframe quota
-- The reframe (the expensive, magical feature) is metered on the Free
-- tier and unlimited on paid tiers. The weekly count is derived from
-- log_entries (type 'reframe'), which record_reframe already writes, so
-- no separate counter is needed. This is the product paywall, distinct
-- from the abuse rate limit in migration 013.
-- =====================================================================

create or replace function free_reframe_check(p_weekly_max int)
returns jsonb
language plpgsql
security definer
set search_path = public
as $$
declare
  v_member uuid := auth.uid();
  v_tier   member_tier;
  v_used   int;
begin
  if v_member is null then
    return jsonb_build_object('allowed', false, 'unlimited', false);
  end if;

  select tier into v_tier from members where id = v_member;

  -- Paid tiers are never metered.
  if v_tier is distinct from 'free' then
    return jsonb_build_object('allowed', true, 'unlimited', true);
  end if;

  -- Free tier: count reframes produced in the last 7 days.
  select count(*) into v_used
  from log_entries
  where member_id = v_member
    and type = 'reframe'
    and created_at > now() - interval '7 days';

  return jsonb_build_object(
    'allowed',   v_used < p_weekly_max,
    'unlimited', false,
    'used',      v_used,
    'limit',     p_weekly_max,
    'remaining', greatest(0, p_weekly_max - v_used)
  );
end;
$$;
