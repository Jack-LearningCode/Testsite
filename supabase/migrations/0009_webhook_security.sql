-- Hardens webhooks: signed payloads (so receivers can verify a request
-- genuinely came from us), HTTPS-only URLs, and a basic block on obviously
-- internal/private targets to reduce SSRF risk from a server-side POST.
create extension if not exists pgcrypto;

alter table public.webhooks
  add column secret text not null default encode(gen_random_bytes(32), 'hex');

alter table public.webhooks
  add constraint webhooks_url_https_check check (url ~ '^https://');

-- Best-effort host blocklist: catches the obvious cases (localhost, private
-- IP ranges, cloud metadata endpoints) via string matching. This can't
-- catch a hostname that only resolves to an internal IP at request time
-- (true SSRF protection needs a DNS-aware proxy), but it stops the
-- straightforward mistakes and attacks.
create or replace function public.is_public_webhook_host(target_url text)
returns boolean
language plpgsql
immutable
as $$
declare
  host text;
begin
  host := lower(regexp_replace(target_url, '^https?://([^/:?#]+).*$', '\1'));

  if host is null or host = '' then
    return false;
  end if;

  if host = 'localhost' or host = '0.0.0.0' or host = '::1' then
    return false;
  end if;

  if host ~ '^127\.' then return false; end if;
  if host ~ '^10\.' then return false; end if;
  if host ~ '^172\.(1[6-9]|2[0-9]|3[0-1])\.' then return false; end if;
  if host ~ '^192\.168\.' then return false; end if;
  if host ~ '^169\.254\.' then return false; end if;
  if host ~ '^fe80:' then return false; end if;
  if host ~ '^f[cd][0-9a-f]{2}:' then return false; end if;

  return true;
end;
$$;

alter table public.webhooks
  add constraint webhooks_url_not_internal_check check (public.is_public_webhook_host(url));

-- Re-fire with a signature header: X-Simple-NPS-Signature: sha256=<hex>,
-- an HMAC-SHA256 of the JSON body using the webhook's own secret.
create or replace function public.fire_response_webhooks()
returns trigger
language plpgsql
security definer
set search_path = public, extensions
as $$
declare
  wh record;
  sc record;
  category text;
  payload jsonb;
  signature text;
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
    signature := encode(hmac(payload::text, wh.secret, 'sha256'), 'hex');

    perform net.http_post(
      url := wh.url,
      body := payload,
      headers := jsonb_build_object(
        'Content-Type', 'application/json',
        'X-Simple-NPS-Signature', 'sha256=' || signature
      )
    );
  end loop;

  return new;
end;
$$;
