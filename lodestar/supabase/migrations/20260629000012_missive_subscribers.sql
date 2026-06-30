-- =====================================================================
-- Lodestar / Vega  |  Migration 012: Missive newsletter subscribers
-- Captures email signups from the marketing site's "Missive" form.
-- RLS is insert-only for the anon/authenticated roles: a visitor can add
-- their email but can never read, change, or enumerate the list. Reads
-- happen with the service role (dashboard or an export job).
-- =====================================================================

-- Email is stored lowercased by the API route, so a plain unique on the
-- column gives case-insensitive dedupe and lets the insert use ON CONFLICT.
create table if not exists missive_subscribers (
  id         uuid primary key default gen_random_uuid(),
  email      text not null unique,
  source     text not null default 'website',
  created_at timestamptz not null default now()
);

alter table missive_subscribers enable row level security;

-- Insert only, and only a well-formed email. No select/update/delete
-- policies exist, so those are denied for anon and authenticated callers.
drop policy if exists missive_insert_public on missive_subscribers;
create policy missive_insert_public on missive_subscribers
  for insert
  to anon, authenticated
  with check (email ~* '^[^@[:space:]]+@[^@[:space:]]+\.[^@[:space:]]+$');
