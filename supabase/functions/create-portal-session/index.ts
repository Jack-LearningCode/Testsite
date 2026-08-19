// Creates a Stripe Billing Portal session for the caller's account and
// returns the URL to redirect to. This hosted page is where customers
// cancel their subscription, swap or remove their card, and see past
// invoices — no custom UI needed on our side. Admin-only.

import { createClient } from 'jsr:@supabase/supabase-js@2'

// STRIPE_MODE picks which key pair to use — flip this one secret to swap
// the whole integration between Stripe's test and live environments
// without re-entering keys each time.
const STRIPE_MODE = Deno.env.get('STRIPE_MODE') ?? 'test'
const STRIPE_SECRET_KEY = Deno.env.get(
  STRIPE_MODE === 'live' ? 'STRIPE_SECRET_KEY_LIVE' : 'STRIPE_SECRET_KEY_TEST'
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
      .select('stripe_customer_id')
      .eq('id', membership.account_id)
      .single()

    if (!account?.stripe_customer_id) {
      return new Response(JSON.stringify({ error: 'No billing account yet — subscribe first.' }), {
        status: 400,
        headers: { ...CORS_HEADERS, 'Content-Type': 'application/json' },
      })
    }

    const response = await fetch('https://api.stripe.com/v1/billing_portal/sessions', {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${STRIPE_SECRET_KEY}`,
        'Content-Type': 'application/x-www-form-urlencoded',
      },
      body: new URLSearchParams({
        customer: account.stripe_customer_id,
        return_url: `${SITE_URL}/portal/account?billing=updated`,
      }),
    })

    const session = await response.json()
    if (!response.ok) {
      throw new Error(session.error?.message ?? 'Stripe request failed')
    }

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
