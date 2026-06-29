-- =====================================================================
-- Lodestar / Vega  |  Migration 010: Re-engagement nudge dispatch
-- A daily sweep finds members who have gone quiet and returns their tier
-- so the vega-nudge Edge Function can send the matching push. One nudge
-- per member per local day, only for tiers above 'present'.
-- =====================================================================

-- Track the last local day we nudged, to dedupe.
alter table members
  add column if not exists last_nudge_date date;

-- ---------------------------------------------------------------------
-- due_for_nudge(): members whose local time is near their evening hour
-- (a calm moment to reach out), who are at tier 'gentle' or worse, and
-- who haven't been nudged yet today. service_role calls this.
-- We anchor nudges to ~30 min before the member's evening_time.
-- ---------------------------------------------------------------------
create or replace function due_for_nudge()
returns table (member_id uuid, days_quiet int, tier text, local_date date)
language sql
stable
security definer
set search_path = public
as $$
  with calc as (
    select
      m.id as member_id,
      (now() at time zone m.timezone)::date as local_date,
      greatest(0, floor(extract(epoch from (now() - m.last_contact_at)) / 86400)::int) as days_quiet,
      (extract(hour from (now() at time zone m.timezone)) * 60
        + extract(minute from (now() at time zone m.timezone))) as now_min,
      (extract(hour from m.evening_time) * 60 + extract(minute from m.evening_time)) as eve_min,
      m.last_nudge_date
    from members m
    join life_maps lm on lm.member_id = m.id and lm.status = 'active'
  )
  select member_id, days_quiet, vega_tier(days_quiet) as tier, local_date
  from calc
  where days_quiet >= 1                               -- quiet at least a day
    and now_min between (eve_min - 30) and (eve_min - 16)  -- one 15-min window
    and (last_nudge_date is distinct from local_date);     -- not nudged today
$$;

-- ---------------------------------------------------------------------
-- mark_nudged(): record that we nudged this member today. Returns false
-- if already marked (race guard). service_role calls this.
-- ---------------------------------------------------------------------
create or replace function mark_nudged(p_member uuid, p_local_date date)
returns boolean
language plpgsql
security definer
set search_path = public
as $$
begin
  update members
    set last_nudge_date = p_local_date
    where id = p_member
      and (last_nudge_date is distinct from p_local_date);
  return found;
end;
$$;

-- ---------------------------------------------------------------------
-- Schedule the nudge sweep every 15 minutes (mirrors the brief sweep).
-- ---------------------------------------------------------------------
create or replace function trigger_nudge_sweep()
returns void
language plpgsql
security definer
set search_path = public, vault
as $$
declare v_key text;
begin
  select decrypted_secret into v_key from vault.decrypted_secrets where name = 'service_role_key' limit 1;
  perform net.http_post(
    url     := 'https://<PROJECT_REF>.functions.supabase.co/vega-nudge',
    headers := jsonb_build_object('Content-Type','application/json','Authorization','Bearer ' || v_key),
    body    := '{}'::jsonb
  );
end;
$$;

select cron.schedule(
  'lodestar-vega-nudge-sweep',
  '*/15 * * * *',
  $$ select trigger_nudge_sweep(); $$
);
