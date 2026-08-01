import { useAuth } from '../AuthContext'

export function HomePage() {
  const { user, signOut } = useAuth()

  return (
    <div className="home-page">
      <h1>Welcome</h1>
      <p>You're signed in as <strong>{user.email}</strong>.</p>
      <button onClick={() => signOut()}>Sign out</button>
    </div>
  )
}
