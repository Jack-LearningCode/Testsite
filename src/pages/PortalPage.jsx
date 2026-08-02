import { Link } from 'react-router-dom'
import { useAuth } from '../AuthContext'

const UPCOMING = [
  { title: 'Scorecards', description: 'Create and manage your NPS scorecards.' },
  { title: 'Triggers', description: 'Set up time-based and action-based triggers.' },
  { title: 'Reports', description: 'See trends across every response.' },
]

export function PortalPage() {
  const { user, signOut } = useAuth()

  const memberSince = new Date(user.created_at).toLocaleDateString(undefined, {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  })

  const initial = user.email.charAt(0).toUpperCase()

  return (
    <div className="portal-page">
      <header className="portal-nav">
        <Link className="logo" to="/">
          <span className="logo-mark">NPS</span>
          Simple NPS
        </Link>
        <button onClick={() => signOut()}>Sign out</button>
      </header>

      <main className="portal-content">
        <div className="portal-greeting">
          <div className="avatar">{initial}</div>
          <div>
            <h1>Welcome back</h1>
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

        <h2 className="portal-section-title">Coming up next</h2>
        <div className="coming-soon-grid">
          {UPCOMING.map((item) => (
            <div className="coming-soon-card" key={item.title}>
              <h3>{item.title}</h3>
              <p>{item.description}</p>
              <span className="coming-soon-tag">Coming soon</span>
            </div>
          ))}
        </div>
      </main>
    </div>
  )
}
