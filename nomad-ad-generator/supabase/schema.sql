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

create index if not exists generations_user_created_idx
  on public.generations (user_id, created_at desc);

alter table public.generations enable row level security;

drop policy if exists "Users can read own generations" on public.generations;
create policy "Users can read own generations"
  on public.generations for select
  using (auth.uid() = user_id);

drop policy if exists "Users can insert own generations" on public.generations;
create policy "Users can insert own generations"
  on public.generations for insert
  with check (auth.uid() = user_id);
