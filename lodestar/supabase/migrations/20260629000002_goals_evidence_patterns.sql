-- =====================================================================
-- Lodestar / Vega  |  Migration 002: Goals, evidence, patterns, briefs
-- =====================================================================

-- ---------- goals ----------
-- Moving parts under a life_map's north star.
create table goals (
  id            uuid primary key default gen_random_uuid(),
  life_map_id   uuid not null references life_maps (id) on delete cascade,
  title         text not null,
  target_date   date,
  metric        text,            -- what "done" looks like numerically
  current_value text,            -- progress toward the metric
  status        goal_status not null default 'active',
  created_at    timestamptz not null default now(),
  updated_at    timestamptz not null default now()
);

create index goals_life_map_idx on goals (life_map_id);
create index goals_status_idx   on goals (status);

create trigger goals_set_updated_at
  before update on goals
  for each row execute function set_updated_at();

-- ---------- blockers ----------
-- Each blocker pairs a practical obstacle with the belief beneath it.
-- The reframe prompt reads underlying_belief.
create table blockers (
  id                 uuid primary key default gen_random_uuid(),
  life_map_id        uuid not null references life_maps (id) on delete cascade,
  goal_id            uuid references goals (id) on delete set null,  -- nullable: some blockers are global
  practical_obstacle text not null,
  underlying_belief  text,
  status             blocker_status not null default 'active',
  created_at         timestamptz not null default now(),
  updated_at         timestamptz not null default now()
);

create index blockers_life_map_idx on blockers (life_map_id);
create index blockers_status_idx   on blockers (status);

create trigger blockers_set_updated_at
  before update on blockers
  for each row execute function set_updated_at();

-- ---------- log_entries ----------
-- Accumulating evidence layer. Highest-volume, append-only. Raw material
-- for pattern detection and reframe counter-evidence. Timestamp matters.
create table log_entries (
  id         uuid primary key default gen_random_uuid(),
  member_id  uuid not null references members (id) on delete cascade,
  goal_id    uuid references goals (id) on delete set null,
  type       log_type not null,
  content    text not null,           -- member's or Vega's words, verbatim
  sentiment  log_sentiment,           -- nullable; set by classifier for pattern analysis
  source     log_source not null default 'freeform',
  created_at timestamptz not null default now()
);

-- Composite index built for the nightly pattern job and recent-evidence
-- lookups: "this member's entries, newest first, by type".
create index log_entries_member_created_idx on log_entries (member_id, created_at desc);
create index log_entries_member_type_idx    on log_entries (member_id, type);

-- ---------- patterns ----------
-- Derived insights written by the nightly job. Lets the morning brief and
-- reframe read a few summary lines instead of re-scanning the whole log.
create table patterns (
  id             uuid primary key default gen_random_uuid(),
  member_id      uuid not null references members (id) on delete cascade,
  observation    text not null,
  evidence_count int  not null default 1,
  category       pattern_category,
  active         boolean not null default true,
  last_seen      timestamptz not null default now(),
  created_at     timestamptz not null default now()
);

create index patterns_member_active_idx on patterns (member_id, active);

-- ---------- daily_briefs ----------
-- Record of each morning brief sent. Prevents repetition, measures opens.
create table daily_briefs (
  id              uuid primary key default gen_random_uuid(),
  member_id       uuid not null references members (id) on delete cascade,
  focus_line      text not null,
  intention_line  text not null,
  affirmation_line text not null,
  opened          boolean not null default false,
  sent_at         timestamptz not null default now()
);

create index daily_briefs_member_sent_idx on daily_briefs (member_id, sent_at desc);
