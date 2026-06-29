-- =====================================================================
-- Lodestar / Vega  |  Migration 003: Row-Level Security
-- Every table is member-scoped. A member can touch only their own rows.
-- The nightly pattern job runs with the service_role key, which bypasses
-- RLS automatically, so no extra policy is needed for it.
-- =====================================================================

-- ---------- Enable RLS everywhere ----------
alter table members      enable row level security;
alter table life_maps    enable row level security;
alter table goals        enable row level security;
alter table blockers     enable row level security;
alter table log_entries  enable row level security;
alter table patterns     enable row level security;
alter table daily_briefs enable row level security;

-- ---------- members ----------
-- A member's id IS their auth.uid().
create policy members_select_own on members
  for select using (id = auth.uid());
create policy members_update_own on members
  for update using (id = auth.uid());
create policy members_insert_self on members
  for insert with check (id = auth.uid());

-- ---------- life_maps ----------
create policy life_maps_all_own on life_maps
  for all
  using      (member_id = auth.uid())
  with check (member_id = auth.uid());

-- ---------- goals ----------
-- Ownership is one hop away: a goal belongs to a life_map that belongs
-- to the member. We check the chain.
create policy goals_all_own on goals
  for all
  using (
    exists (
      select 1 from life_maps
      where life_maps.id = goals.life_map_id
        and life_maps.member_id = auth.uid()
    )
  )
  with check (
    exists (
      select 1 from life_maps
      where life_maps.id = goals.life_map_id
        and life_maps.member_id = auth.uid()
    )
  );

-- ---------- blockers ----------
create policy blockers_all_own on blockers
  for all
  using (
    exists (
      select 1 from life_maps
      where life_maps.id = blockers.life_map_id
        and life_maps.member_id = auth.uid()
    )
  )
  with check (
    exists (
      select 1 from life_maps
      where life_maps.id = blockers.life_map_id
        and life_maps.member_id = auth.uid()
    )
  );

-- ---------- log_entries ----------
create policy log_entries_all_own on log_entries
  for all
  using      (member_id = auth.uid())
  with check (member_id = auth.uid());

-- ---------- patterns ----------
-- Members read their own patterns; only the service_role (nightly job)
-- writes them, so no member insert/update policy is granted.
create policy patterns_select_own on patterns
  for select using (member_id = auth.uid());

-- ---------- daily_briefs ----------
-- Members read their own briefs and may flag one as opened. Briefs are
-- created server-side by the morning job (service_role), so no member
-- insert policy. Update is scoped to the opened flag in app logic.
create policy daily_briefs_select_own on daily_briefs
  for select using (member_id = auth.uid());
create policy daily_briefs_update_own on daily_briefs
  for update using (member_id = auth.uid());
