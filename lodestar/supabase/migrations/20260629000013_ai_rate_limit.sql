-- =====================================================================
-- Lodestar / Vega  |  Migration 013: Per-member AI rate limiting
-- A lightweight guard so a single member cannot run up the Anthropic bill
-- by hammering the expensive AI functions (reframe, onboarding). The
-- crisis path is never rate limited; safety always runs.
-- =====================================================================

create table if not exists ai_rate_events (
  id         uuid primary key default gen_random_uuid(),
  member_id  uuid not null references members (id) on delete cascade,
  action     text not null,
  created_at timestamptz not null default now()
);

create index if not exists ai_rate_events_lookup_idx
  on ai_rate_events (member_id, action, created_at desc);

-- Locked down: only the SECURITY DEFINER function below touches this table.
alter table ai_rate_events enable row level security;

-- ---------------------------------------------------------------------
-- consume_ai_rate_limit(action, max, window_seconds)
-- Returns true if the call is allowed (and records it), false if the
-- member has already hit the limit in the window. Runs as definer but
-- keys everything to auth.uid(), so a member can only spend their own
-- budget. Unauthenticated callers are denied.
-- ---------------------------------------------------------------------
create or replace function consume_ai_rate_limit(
  p_action text,
  p_max int,
  p_window_seconds int
)
returns boolean
language plpgsql
security definer
set search_path = public
as $$
declare
  v_member uuid := auth.uid();
  v_count  int;
begin
  if v_member is null then
    return false;
  end if;

  -- Opportunistic cleanup of this member's old rows for the action.
  delete from ai_rate_events
  where member_id = v_member
    and action = p_action
    and created_at < now() - make_interval(secs => p_window_seconds * 3);

  select count(*) into v_count
  from ai_rate_events
  where member_id = v_member
    and action = p_action
    and created_at > now() - make_interval(secs => p_window_seconds);

  if v_count >= p_max then
    return false;
  end if;

  insert into ai_rate_events (member_id, action) values (v_member, p_action);
  return true;
end;
$$;
