-- Subscription state for an account, kept in sync from Stripe via webhook.
-- No update policy is defined on public.accounts (see 0007), so these
-- columns are only ever writable by server-side code using the service
-- role key — a client can't self-grant an active subscription.
alter table public.accounts
  add column stripe_customer_id text unique,
  add column stripe_subscription_id text,
  add column subscription_status text,
  add column current_period_end timestamptz;
