import { useEffect, useState } from 'react'
import { useSearchParams } from 'react-router-dom'
import { useAccount } from '../../AccountContext'
import { supabase } from '../../supabaseClient'

const STATUS_LABELS = {
  active: { label: 'Active', className: 'status-active' },
  trialing: { label: 'Trial', className: 'status-active' },
  past_due: { label: 'Payment failed', className: 'status-warning' },
  unpaid: { label: 'Payment failed', className: 'status-warning' },
  incomplete: { label: 'Payment incomplete', className: 'status-warning' },
  incomplete_expired: { label: 'Never completed', className: 'status-warning' },
  canceled: { label: 'Cancelled', className: 'status-muted' },
  paused: { label: 'Paused', className: 'status-muted' },
}

export function AccountOverviewPage() {
  const { accountCreatedAt, subscriptionStatus, currentPeriodEnd, cancelAtPeriodEnd, isAdmin, loading, refresh } = useAccount()
  const [searchParams, setSearchParams] = useSearchParams()
  const [billingLoading, setBillingLoading] = useState(false)
  const [error, setError] = useState(null)

  const checkoutResult = searchParams.get('checkout')
  const returnedFromBilling = searchParams.get('billing') === 'updated'

  useEffect(() => {
    if (!checkoutResult && !returnedFromBilling) return

    // Landing back here from Stripe (checkout or the billing portal) means
    // something may have just changed — the webhook that syncs it can land
    // a beat after the redirect, so give it a moment before refreshing.
    const shouldRefresh = checkoutResult === 'success' || returnedFromBilling
    const timer = shouldRefresh ? setTimeout(() => refresh(), 2000) : null

    setSearchParams((params) => {
      params.delete('checkout')
      params.delete('billing')
      return params
    }, { replace: true })

    return () => { if (timer) clearTimeout(timer) }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [checkoutResult, returnedFromBilling])

  async function handleSubscribe() {
    setBillingLoading(true)
    setError(null)
    const { data, error } = await supabase.functions.invoke('create-checkout-session')
    setBillingLoading(false)
    if (error || data?.error) {
      setError(error?.message ?? data.error)
      return
    }
    window.location.href = data.url
  }

  async function handleManageBilling() {
    setBillingLoading(true)
    setError(null)
    const { data, error } = await supabase.functions.invoke('create-portal-session')
    setBillingLoading(false)
    if (error || data?.error) {
      setError(error?.message ?? data.error)
      return
    }
    window.location.href = data.url
  }

  if (loading) return <p className="status-message">Loading...</p>

  const createdDate = accountCreatedAt
    ? new Date(accountCreatedAt).toLocaleDateString(undefined, {
        year: 'numeric',
        month: 'long',
        day: 'numeric',
      })
    : '—'

  const periodEndDate = currentPeriodEnd
    ? new Date(currentPeriodEnd).toLocaleDateString(undefined, {
        year: 'numeric',
        month: 'long',
        day: 'numeric',
      })
    : null

  const isEndingSoon = cancelAtPeriodEnd && (subscriptionStatus === 'active' || subscriptionStatus === 'trialing')
  const status = isEndingSoon
    ? { label: 'Cancelling', className: 'status-warning' }
    : STATUS_LABELS[subscriptionStatus] ?? null
  const hasSubscription = Boolean(subscriptionStatus)

  return (
    <>
      <div className="account-card">
        <h2>Account details</h2>
        <dl>
          <dt>Plan</dt>
          <dd><span className="plan-badge">Simple NPS — £100/month</span></dd>

          <dt>Account created</dt>
          <dd>{createdDate}</dd>
        </dl>
      </div>

      <div className="account-card">
        <h2>Billing</h2>

        {checkoutResult === 'success' && (
          <p className="status-message">Payment received — finalizing your subscription...</p>
        )}

        <dl>
          <dt>Status</dt>
          <dd>
            {status ? (
              <span className={`plan-badge ${status.className}`}>{status.label}</span>
            ) : (
              <span className="plan-badge status-muted">No active subscription</span>
            )}
          </dd>

          {periodEndDate && (
            <>
              <dt>{subscriptionStatus === 'canceled' || isEndingSoon ? 'Access ends' : 'Renews'}</dt>
              <dd>{periodEndDate}</dd>
            </>
          )}
        </dl>

        {isEndingSoon && (
          <p className="field-hint">
            Your subscription is cancelled — you'll keep full access until {periodEndDate}, then it won't renew.
            You can resume anytime before then from "Manage billing" below.
          </p>
        )}

        {!isAdmin && (
          <p className="field-hint">Only account admins can manage billing.</p>
        )}

        {isAdmin && (
          <>
            {error && <p className="error-message">{error}</p>}

            {hasSubscription ? (
              <button className="cta-button secondary" onClick={handleManageBilling} disabled={billingLoading}>
                {billingLoading ? 'Loading...' : 'Manage billing'}
              </button>
            ) : (
              <button className="cta-button" onClick={handleSubscribe} disabled={billingLoading}>
                {billingLoading ? 'Loading...' : 'Subscribe — £100/month'}
              </button>
            )}
            <p className="field-hint">
              {hasSubscription
                ? 'Update your card, view invoices, or cancel your subscription.'
                : 'You\'ll be taken to Stripe\'s secure checkout to add a payment method.'}
            </p>
          </>
        )}
      </div>
    </>
  )
}
