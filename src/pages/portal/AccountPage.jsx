import { useAuth } from '../../AuthContext'

export function AccountPage() {
  const { user } = useAuth()

  const memberSince = new Date(user.created_at).toLocaleDateString(undefined, {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  })

  return (
    <main className="portal-content">
      <h1>Account</h1>
      <p className="portal-subtitle">Plan, billing, and who has access to this account.</p>

      <div className="account-card">
        <h2>Account details</h2>
        <dl>
          <dt>Plan</dt>
          <dd><span className="plan-badge">Simple NPS — £50/month</span></dd>

          <dt>Account created</dt>
          <dd>{memberSince}</dd>
        </dl>
      </div>

      <h2 className="portal-section-title">Team members</h2>
      <div className="account-card">
        <div className="team-member-row">
          <div className="avatar avatar-sm">{user.email.charAt(0).toUpperCase()}</div>
          <div className="team-member-info">
            <strong>{user.email}</strong>
            <span>Owner</span>
          </div>
        </div>

        <button className="cta-button secondary" disabled title="Coming soon">
          Invite teammate
        </button>
        <p className="field-hint">Adding more users to this account is coming soon.</p>
      </div>
    </main>
  )
}
