-- =====================================================================
-- Lodestar / Vega  |  Migration 005: commit_life_map RPC
-- One transactional entry point that writes a complete Life Map across
-- life_maps, goals, blockers, and log_entries. Either all rows land or
-- none do. Called by the onboarding Edge Function with the member's JWT,
-- so it runs as the authenticated member and RLS still applies.
-- =====================================================================

create or replace function commit_life_map(payload jsonb)
returns jsonb
language plpgsql
security invoker          -- runs as the calling member; RLS enforced
set search_path = public
as $$
declare
  v_member      uuid := auth.uid();
  v_map_id      uuid;
  v_goal_id     uuid;
  v_morning     time;
  v_evening     time;
begin
  if v_member is null then
    raise exception 'not authenticated';
  end if;

  -- ---- Required fields ----
  if coalesce(trim(payload ->> 'northStar'), '') = '' then
    raise exception 'northStar is required';
  end if;

  -- ---- Ritual times: parse, fall back to sane defaults ----
  begin
    v_morning := (payload #>> '{ritualTimes,morning}')::time;
  exception when others then v_morning := '07:00'::time;
  end;
  begin
    v_evening := (payload #>> '{ritualTimes,evening}')::time;
  exception when others then v_evening := '21:00'::time;
  end;

  -- ---- Archive any existing active map (one active per member) ----
  update life_maps
    set status = 'archived'
    where member_id = v_member and status = 'active';

  -- ---- Insert the new life_map ----
  insert into life_maps (member_id, north_star, why, anchor_evidence, limiting_belief, status)
  values (
    v_member,
    payload ->> 'northStar',
    nullif(payload ->> 'why', ''),
    nullif(payload ->> 'anchorEvidence', ''),
    nullif(payload ->> 'limitingBelief', ''),
    'active'
  )
  returning id into v_map_id;

  -- ---- Seed the first goal from the north star ----
  insert into goals (life_map_id, title, status)
  values (v_map_id, payload ->> 'northStar', 'active')
  returning id into v_goal_id;

  -- ---- Insert the blocker, pairing obstacle with belief ----
  if coalesce(trim(payload ->> 'primaryBlocker'), '') <> '' then
    insert into blockers (life_map_id, goal_id, practical_obstacle, underlying_belief, status)
    values (
      v_map_id,
      v_goal_id,
      payload ->> 'primaryBlocker',
      nullif(payload ->> 'limitingBelief', ''),
      'active'
    );
  end if;

  -- ---- Record the anchor evidence as the first logged win ----
  if coalesce(trim(payload ->> 'anchorEvidence'), '') <> '' then
    insert into log_entries (member_id, goal_id, type, content, sentiment, source)
    values (
      v_member, v_goal_id, 'win',
      payload ->> 'anchorEvidence', 'positive', 'freeform'
    );
  end if;

  -- ---- Record the first action as a reflection to surface tomorrow ----
  if coalesce(trim(payload ->> 'firstAction'), '') <> '' then
    insert into log_entries (member_id, goal_id, type, content, source)
    values (
      v_member, v_goal_id, 'reflection',
      'First action: ' || (payload ->> 'firstAction'), 'freeform'
    );
  end if;

  -- ---- Apply ritual times to the member record ----
  update members
    set morning_time = v_morning,
        evening_time = v_evening
    where id = v_member;

  return jsonb_build_object(
    'lifeMapId', v_map_id,
    'goalId',    v_goal_id,
    'status',    'committed'
  );
end;
$$;
