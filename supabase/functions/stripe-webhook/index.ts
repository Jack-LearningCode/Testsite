// Public endpoint Stripe calls directly — not something a browser invokes.
// Verifies the Stripe-Signature header itself (no Stripe SDK dependency,
// same reasoning as the other billing functions: paste-able straight into
// the Supabase Dashboard editor) and syncs subscription state onto the
// matching account using the service role key, since accounts has no
// client-writable update policy.
//
// Unlike the other two functions, this one can't just read STRIPE_MODE —
// Stripe pushes events to us, so whichever environment (test or live) has
// a webhook configured pointing here can send at any time. We try both
// signing secrets and use whichever one matches to know which Stripe
// environment (and secret key) to use for the follow-up API call.

import { createClient } from 'jsr:@supabase/supabase-js@2'

const STRIPE_SECRET_KEY_TEST = Deno.env.get('STRIPE_SECRET_KEY_TEST')!
const STRIPE_SECRET_KEY_LIVE = Deno.env.get('STRIPE_SECRET_KEY_LIVE')!
const STRIPE_WEBHOOK_SECRET_TEST = Deno.env.get('STRIPE_WEBHOOK_SECRET_TEST')!
const STRIPE_WEBHOOK_SECRET_LIVE = Deno.env.get('STRIPE_WEBHOOK_SECRET_LIVE')!
const SUPABASE_URL = Deno.env.get('SUPABASE_URL')!
const SUPABASE_SERVICE_ROLE_KEY = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!

const TOLERANCE_SECONDS = 300

function safeEqual(a: string, b: string) {
  if (a.length !== b.length) return false
  let mismatch = 0
  for (let i = 0; i < a.length; i++) {
    mismatch |= a.charCodeAt(i) ^ b.charCodeAt(i)
  }
  return mismatch === 0
}

async function computeSignature(secret: string, timestamp: string, rawBody: string) {
  const key = await crypto.subtle.importKey(
    'raw',
    new TextEncoder().encode(secret),
    { name: 'HMAC', hash: 'SHA-256' },
    false,
    ['sign']
  )
  const signatureBytes = await crypto.subtle.sign(
    'HMAC',
    key,
    new TextEncoder().encode(`${timestamp}.${rawBody}`)
  )
  return [...new Uint8Array(signatureBytes)].map((b) => b.toString(16).padStart(2, '0')).join('')
}

// Returns 'test' | 'live' | null depending on which secret (if either)
// matches the incoming signature.
async function detectStripeMode(rawBody: string, signatureHeader: string | null) {
  if (!signatureHeader) return null

  const parts = Object.fromEntries(
    signatureHeader.split(',').map((part) => part.split('=') as [string, string])
  )
  const timestamp = parts.t
  const expectedSig = parts.v1
  if (!timestamp || !expectedSig) return null

  if (Math.abs(Date.now() / 1000 - Number(timestamp)) > TOLERANCE_SECONDS) {
    return null
  }

  const testSig = await computeSignature(STRIPE_WEBHOOK_SECRET_TEST, timestamp, rawBody)
  if (safeEqual(testSig, expectedSig)) return 'test'

  const liveSig = await computeSignature(STRIPE_WEBHOOK_SECRET_LIVE, timestamp, rawBody)
  if (safeEqual(liveSig, expectedSig)) return 'live'

  return null
}

async function fetchSubscription(subscriptionId: string, stripeSecretKey: string) {
  const response = await fetch(`https://api.stripe.com/v1/subscriptions/${subscriptionId}`, {
    headers: { Authorization: `Bearer ${stripeSecretKey}` },
  })
  return response.json()
}

// Recent Stripe API versions moved current_period_end off the top-level
// Subscription object and onto each subscription item instead (to support
// items with different billing cycles). Check both so this keeps working
// regardless of which shape the account's API version returns.
function getCurrentPeriodEnd(subscription: any): string | null {
  const seconds = subscription.current_period_end ?? subscription.items?.data?.[0]?.current_period_end
  return typeof seconds === 'number' ? new Date(seconds * 1000).toISOString() : null
}

// Newer Stripe API versions (flexible billing mode) represent a scheduled
// cancellation via a specific cancel_at timestamp rather than the classic
// cancel_at_period_end boolean, even when it lands on the same date as the
// period end. Treat either signal as "this subscription is ending."
function isScheduledToCancel(subscription: any): boolean {
  return Boolean(subscription.cancel_at_period_end || subscription.cancel_at)
}

Deno.serve(async (req) => {
  const rawBody = await req.text()
  const mode = await detectStripeMode(rawBody, req.headers.get('Stripe-Signature'))

  if (!mode) {
    return new Response('Invalid signature', { status: 400 })
  }

  const stripeSecretKey = mode === 'live' ? STRIPE_SECRET_KEY_LIVE : STRIPE_SECRET_KEY_TEST
  const event = JSON.parse(rawBody)
  const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY)

  try {
    switch (event.type) {
      case 'checkout.session.completed': {
        const session = event.data.object
        const accountId = session.metadata?.account_id
        if (accountId && session.subscription) {
          const subscription = await fetchSubscription(session.subscription, stripeSecretKey)
          await supabase
            .from('accounts')
            .update({
              stripe_customer_id: session.customer,
              stripe_subscription_id: subscription.id,
              subscription_status: subscription.status,
              current_period_end: getCurrentPeriodEnd(subscription),
              cancel_at_period_end: isScheduledToCancel(subscription),
            })
            .eq('id', accountId)
        }
        break
      }

      case 'customer.subscription.updated':
      case 'customer.subscription.deleted': {
        const subscription = event.data.object
        await supabase
          .from('accounts')
          .update({
            subscription_status: subscription.status,
            current_period_end: getCurrentPeriodEnd(subscription),
            cancel_at_period_end: isScheduledToCancel(subscription),
          })
          .eq('stripe_subscription_id', subscription.id)
        break
      }

      default:
        break
    }

    return new Response(JSON.stringify({ received: true }), {
      headers: { 'Content-Type': 'application/json' },
    })
  } catch (err) {
    return new Response(JSON.stringify({ error: err.message }), { status: 500 })
  }
})
