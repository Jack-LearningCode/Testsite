# Supabase setup

`migrations/0001_create_profiles.sql` creates a `profiles` table (one row per
`auth.users` row) with Row Level Security enabled and policies scoped to
`auth.uid()`, plus a trigger that inserts a profile row on signup.

To apply it, either:

- Paste the file contents into the Supabase Dashboard's SQL Editor and run it, or
- Run it with the Supabase CLI: `supabase db push` (requires linking the CLI
  to the project first with `supabase link --project-ref cwpyhcvqvazbboervbky`).

In email/password auth mode, `auth.users` rows exist even before email
confirmation, so the trigger fires at signup, not at first login.
