-- Nomad Ad Generator — database schema
-- Run in the Supabase SQL editor (idempotent).

-- Profiles: one row per auth user, carries the subscription plan.
create table if not exists public.profiles (
  id uuid primary key references auth.users (id) on delete cascade,
  full_name text,
  plan text not null default 'free' check (plan in ('free', 'starter', 'pro', 'agency')),
  stripe_customer_id text,
  created_at timestamptz not null default now()
);

alter table public.profiles enable row level security;

drop policy if exists "Users can read own profile" on public.profiles;
create policy "Users can read own profile"
  on public.profiles for select
  using (auth.uid() = id);

-- Plan changes are made by the Stripe webhook via the service role; users
-- cannot change their own plan.

-- Auto-create a profile on signup.
create or replace function public.handle_new_user()
returns trigger
language plpgsql
security definer set search_path = public
as $$
begin
  insert into public.profiles (id, full_name)
  values (new.id, new.raw_user_meta_data ->> 'full_name')
  on conflict (id) do nothing;
  return new;
end;
$$;

drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created
  after insert on auth.users
  for each row execute function public.handle_new_user();

-- Generations: one row per generate call, variants stored as JSON.
create table if not exists public.generations (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users (id) on delete cascade,
  product text not null,
  audience text,
  tone text,
  stage text not null check (stage in ('TOF', 'MOF', 'BOF')),
  variants jsonb not null,
  created_at timestamptz not null default now()
);

-- create table if not exists is a no-op on a table that already exists, so
-- new columns need an explicit, idempotent alter for anyone re-running this
-- against a live database.
alter table public.generations add column if not exists winner_index integer;

create index if not exists generations_user_created_idx
  on public.generations (user_id, created_at desc);

create index if not exists generations_user_winner_idx
  on public.generations (user_id, created_at desc)
  where winner_index is not null;

alter table public.generations enable row level security;

drop policy if exists "Users can read own generations" on public.generations;
create policy "Users can read own generations"
  on public.generations for select
  using (auth.uid() = user_id);

drop policy if exists "Users can insert own generations" on public.generations;
create policy "Users can insert own generations"
  on public.generations for insert
  with check (auth.uid() = user_id);

-- Atomic "count this month's generations, then insert" so concurrent
-- requests from the same user (double-click, multiple tabs, a script)
-- can't each read the same under-limit count and all slip through.
-- pg_advisory_xact_lock serializes calls per user for the life of this
-- transaction (auto-released on commit/rollback), so the count and the
-- insert below are effectively one atomic step instead of two round trips
-- with a race window between them. p_limit = -1 means unlimited.
create or replace function public.create_generation_if_within_limit(
  p_limit integer,
  p_product text,
  p_audience text,
  p_tone text,
  p_stage text,
  p_variants jsonb
)
returns table (id uuid, created_at timestamptz)
language plpgsql
security definer set search_path = public
as $$
declare
  v_user_id uuid := auth.uid();
  v_month_start timestamptz := date_trunc('month', now() at time zone 'utc') at time zone 'utc';
  v_count integer;
begin
  if v_user_id is null then
    raise exception 'not_authenticated';
  end if;

  perform pg_advisory_xact_lock(hashtextextended(v_user_id::text, 0));

  if p_limit >= 0 then
    select count(*) into v_count
    from public.generations g
    where g.user_id = v_user_id
      and g.created_at >= v_month_start;

    if v_count >= p_limit then
      raise exception 'generation_limit_reached';
    end if;
  end if;

  return query
    insert into public.generations (user_id, product, audience, tone, stage, variants)
    values (v_user_id, p_product, p_audience, p_tone, p_stage, p_variants)
    returning generations.id, generations.created_at;
end;
$$;

revoke all on function public.create_generation_if_within_limit(integer, text, text, text, text, jsonb) from public;
grant execute on function public.create_generation_if_within_limit(integer, text, text, text, text, jsonb) to authenticated;

-- Marks (or clears, with p_winner_index = null) which variant actually won
-- in the user's real ad testing. A dedicated function rather than a plain
-- UPDATE + RLS policy so a client can only ever touch winner_index, never
-- rewrite its own product/variants/etc., and so the index is bounds-checked
-- against the row's actual variant count rather than trusted blindly.
create or replace function public.set_generation_winner(
  p_generation_id uuid,
  p_winner_index integer
)
returns void
language plpgsql
security definer set search_path = public
as $$
declare
  v_user_id uuid := auth.uid();
  v_variant_count integer;
begin
  if v_user_id is null then
    raise exception 'not_authenticated';
  end if;

  select jsonb_array_length(variants) into v_variant_count
  from public.generations
  where id = p_generation_id and user_id = v_user_id;

  if v_variant_count is null then
    raise exception 'generation_not_found';
  end if;

  if p_winner_index is not null and (p_winner_index < 0 or p_winner_index >= v_variant_count) then
    raise exception 'winner_index_out_of_range';
  end if;

  update public.generations
  set winner_index = p_winner_index
  where id = p_generation_id and user_id = v_user_id;
end;
$$;

revoke all on function public.set_generation_winner(uuid, integer) from public;
grant execute on function public.set_generation_winner(uuid, integer) to authenticated;
