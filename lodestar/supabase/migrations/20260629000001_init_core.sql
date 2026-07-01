-- =====================================================================
-- Lodestar / Vega  |  Migration 001: Core identity layer
-- Extensions, enums, members, life_maps
-- =====================================================================

-- ---------- Extensions ----------
create extension if not exists "pgcrypto";        -- gen_random_uuid()

-- ---------- Enums ----------
create type member_tier      as enum ('free', 'aligned', 'founder');
create type life_map_status  as enum ('active', 'achieved', 'archived');
create type goal_status      as enum ('active', 'stalled', 'done', 'dropped');
create type blocker_status   as enum ('active', 'reframed', 'resolved');
create type log_type         as enum ('win', 'setback', 'reflection', 'reframe', 'brief_response');
create type log_sentiment    as enum ('positive', 'neutral', 'negative');
create type log_source       as enum ('morning_brief', 'evening_review', 'reframe', 'freeform');
create type pattern_category as enum ('task_avoidance', 'momentum', 'belief_recurrence');

-- ---------- Shared trigger: keep updated_at fresh ----------
create or replace function set_updated_at()
returns trigger
language plpgsql
as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

-- ---------- members ----------
-- Account-level record. Mirrors auth.users one-to-one.
create table members (
  id                 uuid primary key references auth.users (id) on delete cascade,
  email              text not null,
  display_name       text,
  tier               member_tier  not null default 'free',
  morning_time       time         not null default '07:00',
  evening_time       time         not null default '21:00',
  timezone           text         not null default 'UTC',
  calendar_connected boolean      not null default false,
  created_at         timestamptz  not null default now(),
  updated_at         timestamptz  not null default now()
);

create trigger members_set_updated_at
  before update on members
  for each row execute function set_updated_at();

-- ---------- life_maps ----------
-- Stable identity layer. One ACTIVE map per member; old maps are
-- archived rather than overwritten so history stays as anchor evidence.
create table life_maps (
  id              uuid primary key default gen_random_uuid(),
  member_id       uuid not null references members (id) on delete cascade,
  north_star      text not null,
  why             text,
  anchor_evidence text,
  limiting_belief text,
  vision          text,
  status          life_map_status not null default 'active',
  created_at      timestamptz not null default now(),
  updated_at      timestamptz not null default now()
);

create index life_maps_member_idx on life_maps (member_id);

-- Enforce: at most one active life_map per member.
create unique index life_maps_one_active_per_member
  on life_maps (member_id)
  where status = 'active';

create trigger life_maps_set_updated_at
  before update on life_maps
  for each row execute function set_updated_at();
