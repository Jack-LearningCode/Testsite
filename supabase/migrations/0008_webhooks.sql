-- Lets an account fire an HTTP POST whenever someone submits an NPS
-- response, either for one specific scorecard or every scorecard in the
-- account (scorecard_id null = all).
create extension if not exists pg_net;

create table public.webhooks (
  id uuid primary key default gen_random_uuid(),
  account_id uuid not null references public.accounts (id) on delete cascade,
  scorecard_id uuid references public.scorecards (id) on delete cascade,
  name text not null default 'My webhook',
  url text not null,
  enabled boolean not null default true,
  created_at timestamptz not null default now()
);

alter table public.webhooks enable row level security;

-- Webhooks are account configuration (a URL something external listens on),
-- same trust level as scorecard settings — admin-only, like everything else
-- an analytics-role member can view but not manage.
create policy "Account admins can view webhooks"
  on public.webhooks for select
  using (public.is_account_admin(account_id));

create policy "Account admins can create webhooks"
  on public.webhooks for insert
  with check (public.is_account_admin(account_id));

create policy "Account admins can update webhooks"
  on public.webhooks for update
  using (public.is_account_admin(account_id))
  with check (public.is_account_admin(account_id));

create policy "Account admins can delete webhooks"
  on public.webhooks for delete
  using (public.is_account_admin(account_id));

-- Fires on every new response, regardless of who inserted it (almost always
-- an anonymous end-user via the embed widget) — SECURITY DEFINER so it can
-- see the scorecard/webhooks rows even though anon can't read those tables
-- directly.
create or replace function public.fire_response_webhooks()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
declare
  wh record;
  sc record;
  category text;
  payload jsonb;
begin
  select id, account_id, name, question, low_label, high_label
  into sc
  from public.scorecards
  where id = new.scorecard_id;

  category := case
    when new.score >= 9 then 'promoter'
    when new.score >= 7 then 'passive'
    else 'detractor'
  end;

  payload := jsonb_build_object(
    'event', 'response.created',
    'account_id', sc.account_id,
    'scorecard', jsonb_build_object(
      'id', sc.id,
      'name', sc.name,
      'question', sc.question,
      'low_label', sc.low_label,
      'high_label', sc.high_label
    ),
    'response', jsonb_build_object(
      'id', new.id,
      'score', new.score,
      'nps_category', category,
      'name', new.name,
      'email', new.email,
      'comment', new.comment,
      'page_url', new.page_url,
      'status', new.status,
      'notes', new.notes,
      'created_at', new.created_at
    )
  );

  for wh in
    select * from public.webhooks
    where account_id = sc.account_id
    and enabled = true
    and (scorecard_id is null or scorecard_id = new.scorecard_id)
  loop
    perform net.http_post(
      url := wh.url,
      body := payload,
      headers := jsonb_build_object('Content-Type', 'application/json')
    );
  end loop;

  return new;
end;
$$;

create trigger on_response_created_fire_webhooks
  after insert on public.responses
  for each row execute function public.fire_response_webhooks();
