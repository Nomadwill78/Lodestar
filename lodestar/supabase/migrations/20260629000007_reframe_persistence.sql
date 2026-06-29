-- =====================================================================
-- Lodestar / Vega  |  Migration 007: Reframe persistence
-- A journal entry is always logged. If it's classified as a setback and
-- a reframe is produced, the reframe is logged too and the related
-- blocker (if any) is marked reframed. Crisis-classified entries are
-- logged but never reframed. All member-scoped, RLS enforced.
-- =====================================================================

-- ---------------------------------------------------------------------
-- log_journal_entry()
-- Saves a free-text journal entry under the member's active goal context.
-- Returns the new entry id so the Edge Function can thread a reframe to it.
-- ---------------------------------------------------------------------
create or replace function log_journal_entry(
  p_content text,
  p_type log_type default 'reflection',
  p_sentiment log_sentiment default null
)
returns uuid
language plpgsql
security invoker          -- runs as the member; RLS applies
set search_path = public
as $$
declare
  v_member uuid := auth.uid();
  v_goal   uuid;
  v_id     uuid;
begin
  if v_member is null then
    raise exception 'not authenticated';
  end if;
  if coalesce(trim(p_content), '') = '' then
    raise exception 'content is required';
  end if;

  -- Attach to the member's active life_map's first active goal, if any.
  select g.id into v_goal
  from life_maps lm
  join goals g on g.life_map_id = lm.id and g.status in ('active','stalled')
  where lm.member_id = v_member and lm.status = 'active'
  order by g.created_at asc
  limit 1;

  insert into log_entries (member_id, goal_id, type, content, sentiment, source)
  values (v_member, v_goal, p_type, p_content, p_sentiment, 'freeform')
  returning id into v_id;

  return v_id;
end;
$$;

-- ---------------------------------------------------------------------
-- record_reframe()
-- Logs Vega's reframe as its own entry and marks the most relevant active
-- blocker as reframed. Best-effort on the blocker: a reframe without a
-- matching blocker still records fine.
-- ---------------------------------------------------------------------
create or replace function record_reframe(p_reframe text)
returns uuid
language plpgsql
security invoker
set search_path = public
as $$
declare
  v_member uuid := auth.uid();
  v_map    uuid;
  v_goal   uuid;
  v_id     uuid;
begin
  if v_member is null then
    raise exception 'not authenticated';
  end if;

  select lm.id into v_map
  from life_maps lm
  where lm.member_id = v_member and lm.status = 'active'
  limit 1;

  select g.id into v_goal
  from goals g
  where g.life_map_id = v_map and g.status in ('active','stalled')
  order by g.created_at asc
  limit 1;

  insert into log_entries (member_id, goal_id, type, content, sentiment, source)
  values (v_member, v_goal, 'reframe', p_reframe, 'neutral', 'reframe')
  returning id into v_id;

  -- Mark the oldest active blocker on this map as reframed.
  update blockers
    set status = 'reframed'
    where id = (
      select b.id from blockers b
      where b.life_map_id = v_map and b.status = 'active'
      order by b.created_at asc
      limit 1
    );

  return v_id;
end;
$$;
