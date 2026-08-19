// Creates a Stripe Checkout Session for the caller's account and returns
// the hosted payment page URL to redirect to. Admin-only — billing is
// account configuration, same trust level as everything else in Account
// settings.
//
// Uses plain fetch() against Stripe's REST API rather than the Stripe SDK,
// so this file has no import/bundling dependencies and can be pasted
// straight into the Supabase Dashboard's Edge Function editor.

import { createClient } from 'jsr:@supabase/supabase-js@2'

// STRIPE_MODE picks which key pair to use — flip this one secret to swap
// the whole integration between Stripe's test and live environments
// without re-entering keys each time.
const STRIPE_MODE = Deno.env.get('STRIPE_MODE') ?? 'test'
const STRIPE_SECRET_KEY = Deno.env.get(
  STRIPE_MODE === 'live' ? 'STRIPE_SECRET_KEY_LIVE' : 'STRIPE_SECRET_KEY_TEST'
)!
const STRIPE_PRICE_ID = Deno.env.get(
  STRIPE_MODE === 'live' ? 'STRIPE_PRICE_ID_LIVE' : 'STRIPE_PRICE_ID_TEST'
)!
const SITE_URL = Deno.env.get('SITE_URL') ?? 'https://simplenps.com'

const SUPABASE_URL = Deno.env.get('SUPABASE_URL')!
const SUPABASE_ANON_KEY = Deno.env.get('SUPABASE_ANON_KEY')!
const SUPABASE_SERVICE_ROLE_KEY = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!

const CORS_HEADERS = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
  'Access-Control-Allow-Methods': 'POST, OPTIONS',
}

async function stripeRequest(path: string, body: Record<string, string>) {
  const response = await fetch(`https://api.stripe.com/v1/${path}`, {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${STRIPE_SECRET_KEY}`,
      'Content-Type': 'application/x-www-form-urlencoded',
    },
    body: new URLSearchParams(body),
  })

  const data = await response.json()
  if (!response.ok) {
    throw new Error(data.error?.message ?? 'Stripe request failed')
  }
  return data
}

Deno.serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: CORS_HEADERS })
  }

  try {
    const authHeader = req.headers.get('Authorization') ?? ''
    const userClient = createClient(SUPABASE_URL, SUPABASE_ANON_KEY, {
      global: { headers: { Authorization: authHeader } },
    })

    const { data: { user } } = await userClient.auth.getUser()
    if (!user) {
      return new Response(JSON.stringify({ error: 'Not authenticated' }), {
        status: 401,
        headers: { ...CORS_HEADERS, 'Content-Type': 'application/json' },
      })
    }

    const { data: membership } = await userClient
      .from('account_members')
      .select('account_id, role')
      .eq('user_id', user.id)
      .eq('status', 'active')
      .maybeSingle()

    if (!membership || membership.role !== 'admin') {
      return new Response(JSON.stringify({ error: 'Admin access required' }), {
        status: 403,
        headers: { ...CORS_HEADERS, 'Content-Type': 'application/json' },
      })
    }

    const adminClient = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY)

    const { data: account } = await adminClient
      .from('accounts')
      .select('id, stripe_customer_id')
      .eq('id', membership.account_id)
      .single()

    let customerId = account?.stripe_customer_id

    if (!customerId) {
      const customer = await stripeRequest('customers', {
        email: user.email ?? '',
        'metadata[account_id]': membership.account_id,
      })
      customerId = customer.id

      await adminClient
        .from('accounts')
        .update({ stripe_customer_id: customerId })
        .eq('id', membership.account_id)
    }

    const session = await stripeRequest('checkout/sessions', {
      mode: 'subscription',
      customer: customerId,
      'line_items[0][price]': STRIPE_PRICE_ID,
      'line_items[0][quantity]': '1',
      success_url: `${SITE_URL}/portal/account?checkout=success`,
      cancel_url: `${SITE_URL}/portal/account?checkout=cancelled`,
      allow_promotion_codes: 'true',
      'metadata[account_id]': membership.account_id,
      'subscription_data[metadata][account_id]': membership.account_id,
    })

    return new Response(JSON.stringify({ url: session.url }), {
      headers: { ...CORS_HEADERS, 'Content-Type': 'application/json' },
    })
  } catch (err) {
    return new Response(JSON.stringify({ error: err.message }), {
      status: 500,
      headers: { ...CORS_HEADERS, 'Content-Type': 'application/json' },
    })
  }
})
