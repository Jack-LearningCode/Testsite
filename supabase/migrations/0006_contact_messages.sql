-- Submissions from the public "Contact us" page. There's no admin/owner
-- concept in this app's data model (every other table is scoped to the
-- account that owns it), so this is intentionally insert-only via the API —
-- view submissions in the Supabase Table Editor, which uses the service
-- role and bypasses RLS.
create table if not exists public.contact_messages (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  email text not null,
  message text not null,
  created_at timestamptz not null default now()
);

alter table public.contact_messages enable row level security;

create policy "Anyone can submit a contact message"
  on public.contact_messages for insert
  with check (true);
