-- =====================================================================
-- Lodestar / Vega  |  Migration 004: Automation
-- 1. Auto-create a members row when a new auth user signs up
-- 2. Context-builder function the API layer calls before each Vega call
-- 3. Nightly pattern-detection job (pg_cron)
-- =====================================================================

-- ---------------------------------------------------------------------
-- 1. Auto-provision a members row on signup
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
  return new;
end;
$$;

create trigger on_auth_user_created
  after insert on auth.users
  for each row execute function handle_new_auth_user();

-- ---------------------------------------------------------------------
-- 2. Context builder
-- Assembles the lean JSON payload injected after Vega's system prompt.
-- Caps recent evidence so calls stay cheap as history grows.
-- Call: select build_vega_context('<member_uuid>');
-- ---------------------------------------------------------------------
create or replace function build_vega_context(p_member uuid)
returns jsonb
language sql
stable
as $$
  with active_map as (
    select * from life_maps
    where member_id = p_member and status = 'active'
    limit 1
  )
  select jsonb_build_object(
    'member', (
      select jsonb_build_object('name', display_name, 'tier', tier)
      from members where id = p_member
    ),
    'northStar',       (select north_star      from active_map),
    'why',             (select why             from active_map),
    'limitingBelief',  (select limiting_belief from active_map),
    'anchorEvidence',  (select anchor_evidence from active_map),
    'activeGoals', coalesce((
      select jsonb_agg(jsonb_build_object(
        'title', title, 'metric', metric,
        'current', current_value, 'status', status))
      from goals
      where life_map_id = (select id from active_map)
        and status in ('active','stalled')
    ), '[]'::jsonb),
    'activeBlockers', coalesce((
      select jsonb_agg(jsonb_build_object(
        'obstacle', practical_obstacle, 'belief', underlying_belief))
      from blockers
      where life_map_id = (select id from active_map)
        and status = 'active'
    ), '[]'::jsonb),
    'activePatterns', coalesce((
      select jsonb_agg(observation order by last_seen desc)
      from patterns
      where member_id = p_member and active = true
    ), '[]'::jsonb),
    'recentWins', coalesce((
      select jsonb_agg(content) from (
        select content from log_entries
        where member_id = p_member and type = 'win'
        order by created_at desc limit 5
      ) w
    ), '[]'::jsonb)
  );
$$;

-- ---------------------------------------------------------------------
-- 3. Nightly pattern detection
-- Heuristic v1: flag task avoidance when a member logs 3+ setbacks in the
-- last 21 days. Upserts so a recurring pattern bumps its evidence_count
-- and last_seen instead of duplicating. Patterns not seen in 21 days are
-- retired (active = false). Replace the heuristic body as you learn more.
-- ---------------------------------------------------------------------
create or replace function run_nightly_pattern_scan()
returns void
language plpgsql
security definer
set search_path = public
as $$
begin
  -- Retire stale patterns first.
  update patterns
    set active = false
    where active = true
      and last_seen < now() - interval '21 days';

  -- Detect recurring setbacks per member in the trailing 21 days.
  with recent_setbacks as (
    select member_id, count(*) as cnt
    from log_entries
    where type = 'setback'
      and created_at >= now() - interval '21 days'
    group by member_id
    having count(*) >= 3
  )
  insert into patterns (member_id, observation, evidence_count, category, active, last_seen)
  select
    rs.member_id,
    'Logging repeated setbacks lately (' || rs.cnt || ' in the last three weeks)',
    rs.cnt,
    'task_avoidance',
    true,
    now()
  from recent_setbacks rs
  on conflict (member_id, category) where active = true
  do update set
    evidence_count = excluded.evidence_count,
    observation    = excluded.observation,
    last_seen      = now();
end;
$$;

-- Partial unique index enabling the upsert above (one active pattern per
-- member per category).
create unique index patterns_one_active_per_category
  on patterns (member_id, category)
  where active = true;

-- ---------- Schedule it ----------
-- Requires pg_cron (enable once in the Supabase dashboard:
-- Database > Extensions > pg_cron). Runs daily at 03:00 UTC.
create extension if not exists pg_cron;

select cron.schedule(
  'lodestar-nightly-pattern-scan',
  '0 3 * * *',
  $$ select run_nightly_pattern_scan(); $$
);
