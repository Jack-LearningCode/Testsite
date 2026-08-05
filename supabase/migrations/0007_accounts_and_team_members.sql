-- Accounts: the entity that owns scorecards, replacing direct per-user
-- ownership so multiple people can share access to the same scorecards.
create table public.accounts (
  id uuid primary key default gen_random_uuid(),
  name text not null default 'My account',
  created_at timestamptz not null default now()
);

-- account_members: who belongs to an account, and with what role.
-- user_id is null for a pending invite until the invitee accepts it.
create table public.account_members (
  id uuid primary key default gen_random_uuid(),
  account_id uuid not null references public.accounts (id) on delete cascade,
  user_id uuid references auth.users (id) on delete cascade,
  email text not null,
  role text not null default 'admin' check (role in ('admin', 'analytics')),
  status text not null default 'pending' check (status in ('pending', 'active')),
  invite_token uuid not null default gen_random_uuid(),
  invited_at timestamptz not null default now(),
  joined_at timestamptz,
  unique (account_id, email)
);

alter table public.accounts enable row level security;
alter table public.account_members enable row level security;

-- Backfill: give every existing user their own account as its admin, so
-- nothing that already exists loses access when scorecards move over.
with new_accounts as (
  insert into public.accounts (id, name, created_at)
  select gen_random_uuid(), u.email, u.created_at
  from auth.users u
  returning id, name, created_at
)
insert into public.account_members (account_id, user_id, email, role, status, joined_at)
select na.id, u.id, u.email, 'admin', 'active', u.created_at
from auth.users u
join new_accounts na on na.name = u.email;

-- Move scorecards from direct user ownership to account ownership.
alter table public.scorecards add column account_id uuid references public.accounts (id);

update public.scorecards s
set account_id = m.account_id
from public.account_members m
where m.user_id = s.user_id and m.role = 'admin';

-- Membership-check helpers, SECURITY DEFINER so policies that call them
-- don't hit RLS recursion against account_members itself.
create or replace function public.is_account_member(target_account_id uuid)
returns boolean
language sql
security definer
set search_path = public
stable
as $$
  select exists (
    select 1 from public.account_members
    where account_id = target_account_id
    and user_id = auth.uid()
    and status = 'active'
  );
$$;

create or replace function public.is_account_admin(target_account_id uuid)
returns boolean
language sql
security definer
set search_path = public
stable
as $$
  select exists (
    select 1 from public.account_members
    where account_id = target_account_id
    and user_id = auth.uid()
    and status = 'active'
    and role = 'admin'
  );
$$;

grant execute on function public.is_account_member(uuid) to authenticated;
grant execute on function public.is_account_admin(uuid) to authenticated;

-- Drop every old ownership-based policy that still references
-- scorecards.user_id before we drop that column.
drop policy "Owners can view their own scorecards" on public.scorecards;
drop policy "Owners can create scorecards" on public.scorecards;
drop policy "Owners can update their own scorecards" on public.scorecards;
drop policy "Owners can delete their own scorecards" on public.scorecards;
drop policy "Owners can view responses to their scorecards" on public.responses;
drop policy "Owners can delete responses to their scorecards" on public.responses;
drop policy "Owners can update responses to their scorecards" on public.responses;

-- Now safe to finish the column swap.
alter table public.scorecards alter column account_id set not null;
alter table public.scorecards drop column user_id;

-- accounts / account_members RLS

create policy "Members can view their account"
  on public.accounts for select
  using (public.is_account_member(id));

create policy "Members can view their fellow members"
  on public.account_members for select
  using (public.is_account_member(account_id));

create policy "Admins can invite members"
  on public.account_members for insert
  with check (public.is_account_admin(account_id));

create policy "Admins can update members"
  on public.account_members for update
  using (public.is_account_admin(account_id))
  with check (public.is_account_admin(account_id));

create policy "Admins can remove members"
  on public.account_members for delete
  using (public.is_account_admin(account_id));

-- scorecards RLS: replace direct ownership with account membership/role.

create policy "Account members can view scorecards"
  on public.scorecards for select
  using (public.is_account_member(account_id));

create policy "Account admins can create scorecards"
  on public.scorecards for insert
  with check (public.is_account_admin(account_id));

create policy "Account admins can update scorecards"
  on public.scorecards for update
  using (public.is_account_admin(account_id))
  with check (public.is_account_admin(account_id));

create policy "Account admins can delete scorecards"
  on public.scorecards for delete
  using (public.is_account_admin(account_id));

-- responses RLS: viewing is any active member (including analytics-role,
-- who are read-only everywhere); changing status/notes or deleting is
-- admin-only. The public "anyone can insert" policy is unaffected.

create policy "Account members can view responses"
  on public.responses for select
  using (
    exists (
      select 1 from public.scorecards
      where scorecards.id = responses.scorecard_id
      and public.is_account_member(scorecards.account_id)
    )
  );

create policy "Account admins can update responses"
  on public.responses for update
  using (
    exists (
      select 1 from public.scorecards
      where scorecards.id = responses.scorecard_id
      and public.is_account_admin(scorecards.account_id)
    )
  )
  with check (
    exists (
      select 1 from public.scorecards
      where scorecards.id = responses.scorecard_id
      and public.is_account_admin(scorecards.account_id)
    )
  );

create policy "Account admins can delete responses"
  on public.responses for delete
  using (
    exists (
      select 1 from public.scorecards
      where scorecards.id = responses.scorecard_id
      and public.is_account_admin(scorecards.account_id)
    )
  );

-- Public, token-scoped invite lookup — lets someone see what they're being
-- invited to before they've signed up or logged in.
create or replace function public.get_invite_by_token(token uuid)
returns table (account_id uuid, account_name text, email text, role text, status text)
language sql
security definer
set search_path = public
stable
as $$
  select m.account_id, a.name, m.email, m.role, m.status
  from public.account_members m
  join public.accounts a on a.id = m.account_id
  where m.invite_token = token;
$$;

grant execute on function public.get_invite_by_token(uuid) to anon, authenticated;

-- Claims a pending invite for the currently authenticated user. Requires
-- the logged-in email to match the invited email, so a leaked link can't
-- be used to join someone else's account under a different identity.
create or replace function public.accept_invite(token uuid)
returns uuid
language plpgsql
security definer
set search_path = public
as $$
declare
  invite_email text;
  invite_status text;
  target_account_id uuid;
  caller_email text;
begin
  select email, status, account_id into invite_email, invite_status, target_account_id
  from public.account_members
  where invite_token = token;

  if target_account_id is null then
    raise exception 'Invite not found';
  end if;

  if invite_status != 'pending' then
    raise exception 'This invite has already been used';
  end if;

  select email into caller_email from auth.users where id = auth.uid();

  if lower(caller_email) != lower(invite_email) then
    raise exception 'This invite was sent to a different email address';
  end if;

  update public.account_members
  set user_id = auth.uid(), status = 'active', joined_at = now()
  where invite_token = token;

  return target_account_id;
end;
$$;

grant execute on function public.accept_invite(uuid) to authenticated;

-- Creates a personal account for a brand-new signup (not one accepting an
-- invite). Idempotent: if the user is already an active member somewhere,
-- just returns that account instead of creating a duplicate.
create or replace function public.create_my_account()
returns uuid
language plpgsql
security definer
set search_path = public
as $$
declare
  existing_account_id uuid;
  new_account_id uuid;
  user_email text;
begin
  select account_id into existing_account_id
  from public.account_members
  where user_id = auth.uid() and status = 'active'
  limit 1;

  if existing_account_id is not null then
    return existing_account_id;
  end if;

  select email into user_email from auth.users where id = auth.uid();

  insert into public.accounts (name) values (user_email) returning id into new_account_id;

  insert into public.account_members (account_id, user_id, email, role, status, joined_at)
  values (new_account_id, auth.uid(), user_email, 'admin', 'active', now());

  return new_account_id;
end;
$$;

grant execute on function public.create_my_account() to authenticated;

-- scorecard_public view is unaffected (never referenced user_id/account_id).
