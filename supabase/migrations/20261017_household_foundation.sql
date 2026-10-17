-- ============================================================================
-- HomeFlow — Household Foundation (Login MVP STEP 2A)
-- Run this entire file in: Supabase Dashboard -> SQL Editor -> New query -> Run
-- Idempotent: safe to run more than once.
-- ============================================================================

-- ---------------------------------------------------------------------------
-- 1. PROFILES (mirror of auth.users, one row per authenticated user)
-- ---------------------------------------------------------------------------
create table if not exists public.profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  email text,
  display_name text,
  avatar_url text,
  created_at timestamptz not null default now()
);

-- ---------------------------------------------------------------------------
-- 2. HOUSEHOLDS
-- ---------------------------------------------------------------------------
create table if not exists public.households (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  avatar text,
  created_by uuid references auth.users(id) on delete set null,
  settings jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now()
);

-- ---------------------------------------------------------------------------
-- 3. HOUSEHOLD MEMBERSHIPS (one membership per user in this MVP)
-- ---------------------------------------------------------------------------
create table if not exists public.household_memberships (
  id uuid primary key default gen_random_uuid(),
  household_id uuid not null references public.households(id) on delete cascade,
  user_id uuid not null references auth.users(id) on delete cascade,
  role text not null check (role in ('owner','adult')),
  created_at timestamptz not null default now(),
  unique (user_id),
  unique (household_id, user_id)
);

-- ---------------------------------------------------------------------------
-- 4. FAMILY MEMBERS (children + adult profiles inside a household)
-- ---------------------------------------------------------------------------
create table if not exists public.family_members (
  id uuid primary key default gen_random_uuid(),
  household_id uuid not null references public.households(id) on delete cascade,
  kind text not null check (kind in ('adult','kid')),
  name text not null,
  short text,
  emoji text,
  color text,
  dob date,
  created_at timestamptz not null default now()
);

-- ---------------------------------------------------------------------------
-- 5. TASKS (Kids' Missions reuse this table — a mission is a task whose
--    owner is a kid family member; Family Planner is a VIEW of these rows)
-- ---------------------------------------------------------------------------
create table if not exists public.tasks (
  id uuid primary key default gen_random_uuid(),
  household_id uuid not null references public.households(id) on delete cascade,
  title text not null,
  cat text not null default 'home',
  due date,
  time text,
  owner_id uuid references public.family_members(id) on delete set null,
  planner_id uuid references public.family_members(id) on delete set null,
  shared boolean not null default false,
  mental boolean not null default false,
  status text not null default 'open' check (status in ('open','done')),
  pts integer not null default 1,
  kid_ok boolean not null default false,
  note text,
  src text,
  created_by uuid references auth.users(id) on delete set null,
  created_at timestamptz not null default now(),
  done_at timestamptz
);

-- ---------------------------------------------------------------------------
-- 6. EXPENSES
-- ---------------------------------------------------------------------------
create table if not exists public.expenses (
  id uuid primary key default gen_random_uuid(),
  household_id uuid not null references public.households(id) on delete cascade,
  title text not null,
  amount numeric not null,
  date date not null,
  category text not null,
  member_id uuid references public.family_members(id) on delete set null,
  status text not null default 'pending' check (status in ('pending','paid')),
  note text,
  created_by uuid references auth.users(id) on delete set null,
  created_at timestamptz not null default now()
);

-- ---------------------------------------------------------------------------
-- 7. CHILD GROWTH RECORDS
-- ---------------------------------------------------------------------------
create table if not exists public.child_growth_records (
  id uuid primary key default gen_random_uuid(),
  household_id uuid not null references public.households(id) on delete cascade,
  kid_id uuid not null references public.family_members(id) on delete cascade,
  date date not null,
  weight numeric,
  height numeric,
  note text,
  created_at timestamptz not null default now()
);

-- ---------------------------------------------------------------------------
-- 8. HEALTH RECORDS
-- ---------------------------------------------------------------------------
create table if not exists public.health_records (
  id uuid primary key default gen_random_uuid(),
  household_id uuid not null references public.households(id) on delete cascade,
  kid_id uuid not null references public.family_members(id) on delete cascade,
  date date not null,
  note text,
  created_at timestamptz not null default now()
);

-- ---------------------------------------------------------------------------
-- 9. EDUCATION RECORDS
-- ---------------------------------------------------------------------------
create table if not exists public.education_records (
  id uuid primary key default gen_random_uuid(),
  household_id uuid not null references public.households(id) on delete cascade,
  kid_id uuid not null references public.family_members(id) on delete cascade,
  date date not null,
  subject text,
  grade text,
  note text,
  created_at timestamptz not null default now()
);

-- ---------------------------------------------------------------------------
-- 10. HELPER FUNCTIONS
-- ---------------------------------------------------------------------------

-- Current user's household id (NULL if none)
create or replace function public.current_household_id()
returns uuid language sql stable security definer set search_path = public as $$
  select household_id from public.household_memberships where user_id = auth.uid() limit 1;
$$;

-- Current user's household + role (NULL row if none)
create or replace function public.get_my_household()
returns table (household_id uuid, name text, role text)
language sql stable security definer set search_path = public as $$
  select h.id, h.name, hm.role
  from public.households h
  join public.household_memberships hm on hm.household_id = h.id
  where hm.user_id = auth.uid()
  limit 1;
$$;

-- Atomically create a household and make the caller its OWNER (one per user)
create or replace function public.create_household(h_name text)
returns uuid language plpgsql security definer set search_path = public as $$
declare
  new_hid uuid;
begin
  if h_name is null or trim(h_name) = '' then
    raise exception 'household name is required';
  end if;
  if exists (select 1 from public.household_memberships where user_id = auth.uid()) then
    raise exception 'user already has a household';
  end if;
  insert into public.households (name, created_by)
  values (trim(h_name), auth.uid())
  returning id into new_hid;
  insert into public.household_memberships (household_id, user_id, role)
  values (new_hid, auth.uid(), 'owner');
  return new_hid;
end;
$$;

-- Auto-create a profile row when a user signs up
create or replace function public.handle_new_user()
returns trigger language plpgsql security definer set search_path = public as $$
begin
  insert into public.profiles (id, email, display_name, avatar_url)
  values (
    new.id,
    new.email,
    coalesce(new.raw_user_meta_data->>'name', new.raw_user_meta_data->>'full_name', new.email),
    new.raw_user_meta_data->>'avatar_url'
  )
  on conflict (id) do nothing;
  return new;
end;
$$;

drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created
  after insert on auth.users
  for each row execute function public.handle_new_user();

-- ---------------------------------------------------------------------------
-- 11. ENABLE ROW LEVEL SECURITY on every household-owned table
-- ---------------------------------------------------------------------------
alter table public.profiles              enable row level security;
alter table public.households            enable row level security;
alter table public.household_memberships enable row level security;
alter table public.family_members        enable row level security;
alter table public.tasks                 enable row level security;
alter table public.expenses              enable row level security;
alter table public.child_growth_records  enable row level security;
alter table public.health_records        enable row level security;
alter table public.education_records     enable row level security;

-- ---------------------------------------------------------------------------
-- 12. RLS POLICIES
-- ---------------------------------------------------------------------------

-- profiles: a user manages only their own profile row
drop policy if exists profiles_select_own on public.profiles;
create policy profiles_select_own on public.profiles for select using (id = auth.uid());
drop policy if exists profiles_insert_own on public.profiles;
create policy profiles_insert_own on public.profiles for insert with check (id = auth.uid());
drop policy if exists profiles_update_own on public.profiles;
create policy profiles_update_own on public.profiles for update using (id = auth.uid());

-- households: creator can insert; members can read; owner can update
drop policy if exists households_insert_creator on public.households;
create policy households_insert_creator on public.households
  for insert with check (auth.uid() is not null);
drop policy if exists households_select_member on public.households;
create policy households_select_member on public.households
  for select using (public.current_household_id() = id);
drop policy if exists households_update_owner on public.households;
create policy households_update_owner on public.households
  for update using (
    exists (
      select 1 from public.household_memberships hm
      where hm.household_id = households.id and hm.user_id = auth.uid() and hm.role = 'owner'
    )
  );

-- household_memberships: a user reads their own membership; the OWNER role is
-- granted only through create_household() (invitation flow arrives in STEP 2B)
drop policy if exists memberships_select_own on public.household_memberships;
create policy memberships_select_own on public.household_memberships
  for select using (user_id = auth.uid());
drop policy if exists memberships_insert_owner on public.household_memberships;
create policy memberships_insert_owner on public.household_memberships
  for insert with check (auth.uid() is not null and user_id = auth.uid() and role = 'owner');

-- Household-owned tables: access ONLY rows of the caller's own household.
-- This is enforced in the database — not by the frontend.
drop policy if exists fm_all on public.family_members;
create policy fm_all on public.family_members
  for all using (household_id = public.current_household_id())
  with check (household_id = public.current_household_id());

drop policy if exists tasks_all on public.tasks;
create policy tasks_all on public.tasks
  for all using (household_id = public.current_household_id())
  with check (household_id = public.current_household_id());

drop policy if exists expenses_all on public.expenses;
create policy expenses_all on public.expenses
  for all using (household_id = public.current_household_id())
  with check (household_id = public.current_household_id());

drop policy if exists growth_all on public.child_growth_records;
create policy growth_all on public.child_growth_records
  for all using (household_id = public.current_household_id())
  with check (household_id = public.current_household_id());

drop policy if exists health_all on public.health_records;
create policy health_all on public.health_records
  for all using (household_id = public.current_household_id())
  with check (household_id = public.current_household_id());

drop policy if exists education_all on public.education_records;
create policy education_all on public.education_records
  for all using (household_id = public.current_household_id())
  with check (household_id = public.current_household_id());

-- ---------------------------------------------------------------------------
-- 13. SANITY: list all RLS-enabled tables
-- ---------------------------------------------------------------------------
select tablename
from pg_tables
where schemaname = 'public'
order by tablename;