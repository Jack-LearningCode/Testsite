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

`migrations/0002_scorecards_and_responses.sql` creates `scorecards` (one row
per NPS survey an account configures) and `responses` (one row per end-user
submission), plus a `scorecard_public` view that exposes only the
question/color/labels an embedded widget needs — never the owning user_id.
Scorecards and responses are readable/writable only by their owner; anyone
can INSERT a response, since that's what the public embed widget does on a
customer's own website. Apply it the same way as 0001.
