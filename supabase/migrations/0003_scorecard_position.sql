-- Where the embedded floating widget appears on the customer's page.
alter table public.scorecards
  add column if not exists position text not null default 'bottom-right';

alter table public.scorecards
  add constraint scorecards_position_check
  check (position in ('bottom-left', 'bottom-middle', 'bottom-right'));

create or replace view public.scorecard_public as
  select id, question, color, low_label, high_label, position
  from public.scorecards;
