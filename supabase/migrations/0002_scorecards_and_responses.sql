-- Scorecards: one row per NPS survey an account has configured.
create table if not exists public.scorecards (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users (id) on delete cascade,
  name text not null default 'Untitled scorecard',
  question text not null default 'How likely are you to recommend us to a friend or colleague?',
  color text not null default '#7c3aed',
  low_label text not null default 'Not likely',
  high_label text not null default 'Very likely',
  created_at timestamptz not null default now()
);

alter table public.scorecards enable row level security;

create policy "Owners can view their own scorecards"
  on public.scorecards for select
  using (auth.uid() = user_id);

create policy "Owners can create scorecards"
  on public.scorecards for insert
  with check (auth.uid() = user_id);

create policy "Owners can update their own scorecards"
  on public.scorecards for update
  using (auth.uid() = user_id)
  with check (auth.uid() = user_id);

create policy "Owners can delete their own scorecards"
  on public.scorecards for delete
  using (auth.uid() = user_id);

-- Public, read-only view exposing just the display config an embedded
-- widget needs (question/color/labels) — never the owning user_id.
-- Views run with the owner's privileges by default, so this deliberately
-- bypasses the owner-only RLS above for these specific columns.
create or replace view public.scorecard_public as
  select id, question, color, low_label, high_label
  from public.scorecards;

grant select on public.scorecard_public to anon, authenticated;

-- Responses: one row per end-user submission on a scorecard.
create table if not exists public.responses (
  id uuid primary key default gen_random_uuid(),
  scorecard_id uuid not null references public.scorecards (id) on delete cascade,
  name text,
  email text,
  score smallint not null check (score between 0 and 10),
  comment text,
  page_url text,
  created_at timestamptz not null default now()
);

alter table public.responses enable row level security;

create policy "Owners can view responses to their scorecards"
  on public.responses for select
  using (
    exists (
      select 1 from public.scorecards
      where scorecards.id = responses.scorecard_id
      and scorecards.user_id = auth.uid()
    )
  );

create policy "Owners can delete responses to their scorecards"
  on public.responses for delete
  using (
    exists (
      select 1 from public.scorecards
      where scorecards.id = responses.scorecard_id
      and scorecards.user_id = auth.uid()
    )
  );

-- Anonymous visitors can't SELECT from scorecards (owner-only RLS above), so
-- a plain EXISTS subquery in the insert check below would always see zero
-- rows for them. This function runs as its owner, bypassing that RLS, just
-- to answer "does this scorecard exist" without exposing the table itself.
create or replace function public.scorecard_exists(target_id uuid)
returns boolean
language sql
security definer
set search_path = public
as $$
  select exists (select 1 from public.scorecards where id = target_id);
$$;

grant execute on function public.scorecard_exists(uuid) to anon, authenticated;

-- Anyone (including anonymous end-users on a customer's website) can submit
-- a response, as long as it's tied to a scorecard that actually exists.
create policy "Anyone can submit a response to a real scorecard"
  on public.responses for insert
  with check (public.scorecard_exists(scorecard_id));
