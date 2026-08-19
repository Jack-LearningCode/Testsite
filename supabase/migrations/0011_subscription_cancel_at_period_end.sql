-- Cancelling via the Stripe Customer Portal defaults to "cancel at period
-- end" rather than immediate cancellation, so subscription_status stays
-- 'active' right up until the period actually ends. Track this separately
-- so the UI can tell a customer "you're cancelled, access ends on [date]"
-- instead of just showing Active with no context.
alter table public.accounts
  add column cancel_at_period_end boolean not null default false;
