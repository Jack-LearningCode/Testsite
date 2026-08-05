import { useAccount } from '../../AccountContext'

export function AccountOverviewPage() {
  const { accountCreatedAt, loading } = useAccount()

  if (loading) return <p className="status-message">Loading...</p>

  const createdDate = accountCreatedAt
    ? new Date(accountCreatedAt).toLocaleDateString(undefined, {
        year: 'numeric',
        month: 'long',
        day: 'numeric',
      })
    : '—'

  return (
    <div className="account-card">
      <h2>Account details</h2>
      <dl>
        <dt>Plan</dt>
        <dd><span className="plan-badge">Simple NPS — £50/month</span></dd>

        <dt>Account created</dt>
        <dd>{createdDate}</dd>
      </dl>
    </div>
  )
}
