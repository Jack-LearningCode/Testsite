-- Score-based follow-up prompts, shown by the widget instead of one
-- generic comment prompt.
alter table public.scorecards
  add column if not exists promoter_followup_prompt text not null default 'What do you love most?',
  add column if not exists passive_followup_prompt text not null default 'What would make you more likely to recommend us?',
  add column if not exists detractor_followup_prompt text not null default 'Sorry to hear that — what can we do better?';

-- URL targeting: plain text, one pattern per line, matched as a substring
-- against the page URL by the widget. Empty include list = show everywhere.
alter table public.scorecards
  add column if not exists include_paths text not null default '',
  add column if not exists exclude_paths text not null default '';

-- Close-the-loop tracking on responses.
alter table public.responses
  add column if not exists status text not null default 'new',
  add column if not exists notes text;

alter table public.responses
  add constraint responses_status_check check (status in ('new', 'in_progress', 'resolved'));

-- Owners could previously only select/delete responses, never update them —
-- needed now so they can set status/notes on their own scorecards' responses.
create policy "Owners can update responses to their scorecards"
  on public.responses for update
  using (
    exists (
      select 1 from public.scorecards
      where scorecards.id = responses.scorecard_id
      and scorecards.user_id = auth.uid()
    )
  )
  with check (
    exists (
      select 1 from public.scorecards
      where scorecards.id = responses.scorecard_id
      and scorecards.user_id = auth.uid()
    )
  );

create or replace view public.scorecard_public as
  select
    id, question, color, low_label, high_label, position,
    thank_you_message, dismiss_message, repeat_after_days, dismiss_snooze_days,
    promoter_followup_prompt, passive_followup_prompt, detractor_followup_prompt,
    include_paths, exclude_paths
  from public.scorecards;
