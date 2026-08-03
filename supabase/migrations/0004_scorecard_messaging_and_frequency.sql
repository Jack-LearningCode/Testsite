-- Custom messages shown by the embedded widget, and per-visitor display
-- frequency controls (tracked client-side, since the visitor isn't
-- authenticated — see embed.js).
alter table public.scorecards
  add column if not exists thank_you_message text not null default 'Thanks for your feedback!',
  add column if not exists dismiss_message text not null default 'No worries — maybe next time!',
  add column if not exists repeat_after_days integer not null default 90,
  add column if not exists dismiss_snooze_days integer not null default 30;

alter table public.scorecards
  add constraint scorecards_repeat_after_days_check check (repeat_after_days > 0);

alter table public.scorecards
  add constraint scorecards_dismiss_snooze_days_check check (dismiss_snooze_days > 0);

create or replace view public.scorecard_public as
  select
    id, question, color, low_label, high_label, position,
    thank_you_message, dismiss_message, repeat_after_days, dismiss_snooze_days
  from public.scorecards;
