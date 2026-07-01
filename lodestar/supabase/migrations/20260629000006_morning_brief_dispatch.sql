-- =====================================================================
-- Lodestar / Vega  |  Migration 006: Morning brief dispatch
-- A 15-minute sweep finds members whose local morning time has just
-- arrived, the Edge Function generates each brief through Vega, and the
-- result is recorded. Dedup guarantees one brief per member per local day.
-- =====================================================================

-- ---------------------------------------------------------------------
-- 1. Dedup guard: one brief per member per local calendar day.
-- We store the member's local date the brief was sent for, so a retry or
-- an overlapping sweep can't double-send.
-- ---------------------------------------------------------------------
alter table daily_briefs
  add column if not exists local_date date;

create unique index if not exists daily_briefs_one_per_local_day
  on daily_briefs (member_id, local_date);

-- ---------------------------------------------------------------------
-- 2. due_for_morning_brief()
-- Returns members whose local time falls in [morning_time, morning_time +
-- 15 min) right now AND who have an active life_map AND who have not yet
-- received a brief for their local day. service_role calls this.
-- ---------------------------------------------------------------------
create or replace function due_for_morning_brief()
returns table (member_id uuid, local_date date)
language sql
stable
security definer
set search_path = public
as $$
  select m.id, (now() at time zone m.timezone)::date as local_date
  from members m
  join life_maps lm
    on lm.member_id = m.id and lm.status = 'active'
  where
    -- member's current local clock time, as minutes since midnight
    (extract(hour   from (now() at time zone m.timezone)) * 60
     + extract(minute from (now() at time zone m.timezone)))
    between
    (extract(hour from m.morning_time) * 60 + extract(minute from m.morning_time))
    and
    (extract(hour from m.morning_time) * 60 + extract(minute from m.morning_time) + 14)
    -- not already sent for this local day
    and not exists (
      select 1 from daily_briefs db
      where db.member_id = m.id
        and db.local_date = (now() at time zone m.timezone)::date
    );
$$;

-- ---------------------------------------------------------------------
-- 3. record_morning_brief()
-- Inserts the generated brief. Returns false if a brief for this local
-- day already exists (lost a race), true if recorded. service_role calls
-- this from the Edge Function after generation.
-- ---------------------------------------------------------------------
create or replace function record_morning_brief(
  p_member uuid,
  p_local_date date,
  p_focus text,
  p_intention text,
  p_affirmation text
)
returns boolean
language plpgsql
security definer
set search_path = public
as $$
begin
  insert into daily_briefs (member_id, local_date, focus_line, intention_line, affirmation_line)
  values (p_member, p_local_date, p_focus, p_intention, p_affirmation)
  on conflict (member_id, local_date) do nothing;

  return found;   -- true if the row was inserted, false if deduped
end;
$$;

-- ---------------------------------------------------------------------
-- 4. Schedule the sweep every 15 minutes. The cron job calls the Edge
-- Function over HTTP via pg_net so generation happens off-database.
-- The project ref below is set to rjucvqthsseegxlwryru; update it if you
-- deploy to a different Supabase project, and set the service key in Vault.
-- ---------------------------------------------------------------------
create extension if not exists pg_net;

-- Helper that pings the Edge Function. Reads the service key from Vault
-- so it never sits in plaintext in the schedule definition.
create or replace function trigger_morning_sweep()
returns void
language plpgsql
security definer
set search_path = public, vault
as $$
declare
  v_key text;
begin
  select decrypted_secret into v_key
  from vault.decrypted_secrets
  where name = 'service_role_key'
  limit 1;

  perform net.http_post(
    url     := 'https://rjucvqthsseegxlwryru.functions.supabase.co/morning-brief',
    headers := jsonb_build_object(
      'Content-Type', 'application/json',
      'Authorization', 'Bearer ' || v_key
    ),
    body    := '{}'::jsonb
  );
end;
$$;

select cron.schedule(
  'lodestar-morning-brief-sweep',
  '*/15 * * * *',
  $$ select trigger_morning_sweep(); $$
);
