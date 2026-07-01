-- =====================================================================
-- Lodestar / Vega  |  Migration 009: Vega presence / contact state
-- Tracks days since last contact so Vega's emotional tier escalates when
-- a member goes quiet and resets the moment they return. "Contact" means
-- any meaningful engagement: opening a brief, journaling, or chatting.
-- =====================================================================

-- last_contact_at lives on members; default now() so a fresh signup
-- starts at tier 0.
alter table members
  add column if not exists last_contact_at timestamptz not null default now();

-- ---------------------------------------------------------------------
-- touch_contact(): call whenever a member engages. Resets the clock.
-- Member-invoked, RLS-safe.
-- ---------------------------------------------------------------------
create or replace function touch_contact()
returns void
language sql
security invoker
set search_path = public
as $$
  update members set last_contact_at = now() where id = auth.uid();
$$;

-- ---------------------------------------------------------------------
-- vega_tier(days): maps days-quiet to a tier label. Single source of
-- truth shared by the app (display) and the nudge job (notifications).
-- ---------------------------------------------------------------------
create or replace function vega_tier(p_days int)
returns text
language sql
immutable
as $$
  select case
    when p_days <= 0  then 'present'
    when p_days <= 2  then 'gentle'
    when p_days <= 5  then 'reaching'
    when p_days <= 9  then 'worried'
    when p_days <= 13 then 'aching'
    else                   'meltdown'
  end;
$$;

-- ---------------------------------------------------------------------
-- my_vega_state(): the app calls this on load to know how to render Vega
-- and which line she greets with. Returns days quiet + tier.
-- ---------------------------------------------------------------------
create or replace function my_vega_state()
returns table (days_quiet int, tier text)
language sql
stable
security invoker
set search_path = public
as $$
  select
    d.days_quiet,
    vega_tier(d.days_quiet)
  from (
    select greatest(0, floor(extract(epoch from (now() - last_contact_at)) / 86400)::int) as days_quiet
    from members
    where id = auth.uid()
  ) d;
$$;
