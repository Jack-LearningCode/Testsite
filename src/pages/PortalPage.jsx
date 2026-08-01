import { Link } from 'react-router-dom'
import { useAuth } from '../AuthContext'

export function PortalPage() {
  const { user, signOut } = useAuth()

  const memberSince = new Date(user.created_at).toLocaleDateString(undefined, {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  })

  return (
    <div className="portal-page">
      <header className="portal-nav">
        <Link className="logo" to="/">Simple NPS</Link>
        <button onClick={() => signOut()}>Sign out</button>
      </header>

      <main className="portal-content">
        <h1>My account</h1>

        <div className="account-card">
          <dl>
            <dt>Email</dt>
            <dd>{user.email}</dd>

            <dt>Member since</dt>
            <dd>{memberSince}</dd>

            <dt>Plan</dt>
            <dd>Simple NPS — £50/month</dd>
          </dl>
        </div>

        <p className="portal-placeholder">
          Scorecards, triggers, and reporting will show up here next.
        </p>
      </main>
    </div>
  )
}
