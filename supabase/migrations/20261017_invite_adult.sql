-- ============================================================================
-- HomeFlow — Owner Invites Adult + Adult Joins (Login MVP STEP 2B)
-- Run this entire file in: Supabase Dashboard -> SQL Editor -> New query -> Run
-- Requires 20261017_household_foundation.sql to have been applied first.
-- Idempotent: safe to run more than once.
-- ============================================================================

-- ---------------------------------------------------------------------------
-- 1. HOUSEHOLD INVITATIONS
--    A secret token (never the household_id) is the join key. The invited
--    email must match the accepting Google account. Households are never
--    publicly discoverable.
-- ---------------------------------------------------------------------------
create table if not exists public.household_invitations (
  id uuid primary key default gen_random_uuid(),
  household_id uuid not null references public.households(id) on delete cascade,
  invited_email text not null,
  token text not null unique,
  status text not null default 'pending' check (status in ('pending','accepted','cancelled','expired')),
  created_by uuid references auth.users(id) on delete set null,
  accepted_by uuid references auth.users(id) on delete set null,
  created_at timestamptz not null default now(),
  expires_at timestamptz not null default (now() + interval '7 days')
);

-- ---------------------------------------------------------------------------
-- 2. LINK AUTHENTICATED USER <-> FAMILY MEMBER PROFILE
--    Distinct concepts: authenticated user, household membership, family
--    member profile. A family member may be linked to at most one user.
-- ---------------------------------------------------------------------------
alter table public.family_members
  add column if not exists linked_user_id uuid references auth.users(id) on delete set null;

create unique index if not exists family_members_linked_user_idx
  on public.family_members (linked_user_id)
  where linked_user_id is not null;

-- ---------------------------------------------------------------------------
-- 3. HELPERS
-- ---------------------------------------------------------------------------

-- True when the caller is the OWNER of the given household
create or replace function public.is_household_owner(hid uuid)
returns boolean language sql stable security definer set search_path = public as $$
  select exists (
    select 1 from public.household_memberships hm
    where hm.household_id = hid and hm.user_id = auth.uid() and hm.role = 'owner'
  );
$$;

-- Create an invitation (owner only). Returns the secret token.
create or replace function public.create_invitation(invited_email text)
returns uuid language plpgsql security definer set search_path = public as $$
declare
  hid uuid;
  tok uuid;
begin
  select public.current_household_id() into hid;
  if hid is null then
    raise exception 'no household';
  end if;
  if not public.is_household_owner(hid) then
    raise exception 'only the owner can invite';
  end if;
  if invited_email is null or trim(invited_email) = '' then
    raise exception 'email is required';
  end if;
  -- expire any previous pending invite for the same email
  update public.household_invitations
     set status = 'expired'
   where household_id = hid and lower(invited_email) = lower(trim(invited_email)) and status = 'pending';
  tok := gen_random_uuid();
  insert into public.household_invitations (household_id, invited_email, token)
  values (hid, trim(invited_email), tok);
  return tok;
end;
$$;

-- Cancel an invitation (owner only)
create or replace function public.cancel_invitation(inv_id uuid)
returns void language plpgsql security definer set search_path = public as $$
declare
  hid uuid;
begin
  select household_id into hid from public.household_invitations where id = inv_id;
  if hid is null then
    raise exception 'invitation not found';
  end if;
  if not public.is_household_owner(hid) then
    raise exception 'only the owner can cancel';
  end if;
  update public.household_invitations set status = 'cancelled' where id = inv_id;
end;
$$;

-- Accept an invitation: validates token + expiry + email match + one-household
-- rule, then creates an ADULT membership and returns the household.
create or replace function public.accept_invitation(inv_token uuid)
returns table (household_id uuid, name text)
language plpgsql security definer set search_path = public as $$
declare
  inv public.household_invitations%rowtype;
begin
  select * into inv from public.household_invitations where token = inv_token;
  if inv is null then
    raise exception 'invitation not found';
  end if;
  if inv.status <> 'pending' then
    raise exception 'invitation is no longer valid';
  end if;
  if inv.expires_at < now() then
    update public.household_invitations set status = 'expired' where id = inv.id;
    raise exception 'invitation has expired';
  end if;
  if lower(inv.invited_email) <> lower(coalesce(auth.jwt()->>'email', '')) then
    raise exception 'this invitation was issued for a different email';
  end if;
  if exists (select 1 from public.household_memberships where user_id = auth.uid()) then
    raise exception 'this account already belongs to a household';
  end if;
  insert into public.household_memberships (household_id, user_id, role)
  values (inv.household_id, auth.uid(), 'adult');
  update public.household_invitations set status = 'accepted', accepted_by = auth.uid() where id = inv.id;
  return query select h.id, h.name from public.households h where h.id = inv.household_id;
end;
$$;

-- Link the authenticated user to an adult family member profile (joining flow)
create or replace function public.link_family_member(member_id uuid)
returns void language plpgsql security definer set search_path = public as $$
declare
  hid uuid;
  m public.family_members%rowtype;
begin
  select public.current_household_id() into hid;
  if hid is null then
    raise exception 'no household';
  end if;
  select * into m from public.family_members where id = member_id and household_id = hid;
  if m is null then
    raise exception 'family member not found in this household';
  end if;
  if m.kind = 'kid' then
    raise exception 'cannot link an adult account to a child profile';
  end if;
  if m.linked_user_id is not null and m.linked_user_id <> auth.uid() then
    raise exception 'this family member is already linked to another account';
  end if;
  update public.family_members set linked_user_id = auth.uid() where id = member_id;
end;
$$;

-- Remove an ADULT membership (owner only). The owner themselves cannot be removed.
create or replace function public.remove_member(user_id uuid)
returns void language plpgsql security definer set search_path = public as $$
declare
  hid uuid;
  m public.household_memberships%rowtype;
begin
  select public.current_household_id() into hid;
  if hid is null then
    raise exception 'no household';
  end if;
  if not public.is_household_owner(hid) then
    raise exception 'only the owner can remove members';
  end if;
  select * into m from public.household_memberships
   where household_id = hid and user_id = remove_member.user_id;
  if m is null then
    raise exception 'member not found';
  end if;
  if m.role = 'owner' then
    raise exception 'cannot remove the owner';
  end if;
  delete from public.household_memberships where id = m.id;
end;
$$;

-- Remove an ADULT membership by email (owner only). The owner cannot be removed.
create or replace function public.remove_member_by_email(invited_email text)
returns void language plpgsql security definer set search_path = public as $$
declare
  hid uuid;
  target uuid;
  m public.household_memberships%rowtype;
begin
  select public.current_household_id() into hid;
  if hid is null then
    raise exception 'no household';
  end if;
  if not public.is_household_owner(hid) then
    raise exception 'only the owner can remove members';
  end if;
  select id into target from auth.users where lower(email) = lower(trim(invited_email));
  if target is null then
    raise exception 'user not found';
  end if;
  select * into m from public.household_memberships
   where household_id = hid and user_id = target;
  if m is null then
    raise exception 'member not found';
  end if;
  if m.role = 'owner' then
    raise exception 'cannot remove the owner';
  end if;
  delete from public.household_memberships where id = m.id;
end;
$$;

-- ---------------------------------------------------------------------------
-- 4. RLS: ENABLE + POLICIES
-- ---------------------------------------------------------------------------
alter table public.household_invitations enable row level security;

-- Invitations: members of the household can view; only the owner can create/cancel
drop policy if exists invites_select_member on public.household_invitations;
create policy invites_select_member on public.household_invitations
  for select using (household_id = public.current_household_id());

drop policy if exists invites_insert_owner on public.household_invitations;
create policy invites_insert_owner on public.household_invitations
  for insert with check (public.is_household_owner(household_id));

drop policy if exists invites_update_owner on public.household_invitations;
create policy invites_update_owner on public.household_invitations
  for update using (public.is_household_owner(household_id));

drop policy if exists invites_delete_owner on public.household_invitations;
create policy invites_delete_owner on public.household_invitations
  for delete using (public.is_household_owner(household_id));

-- family_members: allow linking the authenticated user to their own profile row
drop policy if exists fm_link_self on public.family_members;
create policy fm_link_self on public.family_members
  for update using (household_id = public.current_household_id())
  with check (household_id = public.current_household_id());

-- household_memberships: only the owner may delete a membership (remove adult)
drop policy if exists memberships_delete_owner on public.household_memberships;
create policy memberships_delete_owner on public.household_memberships
  for delete using (public.is_household_owner(household_id));

-- ---------------------------------------------------------------------------
-- 5. SANITY
-- ---------------------------------------------------------------------------
select 'household_invitations' as tbl, count(*) from public.household_invitations
union all
select 'family_members.linked_user_id' , 0;