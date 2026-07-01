-- =====================================================================
-- Lodestar / Vega  |  Migration 008: push_tokens
-- One Expo push token per member. The morning-brief function reads this
-- (service_role). Members manage only their own row.
-- =====================================================================

create table push_tokens (
  member_id  uuid primary key references members (id) on delete cascade,
  token      text not null,
  updated_at timestamptz not null default now()
);

create trigger push_tokens_set_updated_at
  before update on push_tokens
  for each row execute function set_updated_at();

alter table push_tokens enable row level security;

create policy push_tokens_all_own on push_tokens
  for all
  using      (member_id = auth.uid())
  with check (member_id = auth.uid());
