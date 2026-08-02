import { useAuth } from '../../AuthContext'

export function ProfilePage() {
  const { user } = useAuth()

  const memberSince = new Date(user.created_at).toLocaleDateString(undefined, {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  })

  const initial = user.email.charAt(0).toUpperCase()

  return (
    <main className="portal-content">
      <div className="portal-greeting">
        <div className="avatar">{initial}</div>
        <div>
          <h1>Your profile</h1>
          <p>{user.email}</p>
        </div>
      </div>

      <div className="account-card">
        <h2>Account details</h2>
        <dl>
          <dt>Email</dt>
          <dd>{user.email}</dd>

          <dt>Member since</dt>
          <dd>{memberSince}</dd>

          <dt>Plan</dt>
          <dd><span className="plan-badge">Simple NPS — £50/month</span></dd>
        </dl>
      </div>
    </main>
  )
}
