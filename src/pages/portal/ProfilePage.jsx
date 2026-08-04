import { useAuth } from '../../AuthContext'

export function ProfilePage() {
  const { user } = useAuth()

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
        <h2>Personal details</h2>
        <dl>
          <dt>Email</dt>
          <dd>{user.email}</dd>
        </dl>
      </div>
    </main>
  )
}
