import { useEffect, useState } from 'react'
import { Link, useNavigate, useParams } from 'react-router-dom'
import { useAuth } from '../AuthContext'
import { useAccount } from '../AccountContext'
import { supabase } from '../supabaseClient'

const ROLE_LABELS = {
  admin: 'Admin',
  analytics: 'Analytics',
}

export function AcceptInvitePage() {
  const { token } = useParams()
  const navigate = useNavigate()
  const { user, signIn, signUp } = useAuth()
  const { refresh } = useAccount()

  const [invite, setInvite] = useState(undefined)
  const [mode, setMode] = useState('sign-up')
  const [password, setPassword] = useState('')
  const [error, setError] = useState(null)
  const [submitting, setSubmitting] = useState(false)

  useEffect(() => {
    supabase.rpc('get_invite_by_token', { token }).then(({ data, error }) => {
      if (error || !data?.length) {
        setInvite(null)
        return
      }
      setInvite(data[0])
    })
  }, [token])

  async function claimInvite() {
    setSubmitting(true)
    setError(null)

    const { error } = await supabase.rpc('accept_invite', { token })

    setSubmitting(false)

    if (error) {
      setError(error.message)
      return
    }

    await refresh()
    navigate('/portal')
  }

  async function handleAuthSubmit(e) {
    e.preventDefault()
    setError(null)
    setSubmitting(true)

    const { error } = mode === 'sign-in'
      ? await signIn(invite.email, password)
      : await signUp(invite.email, password)

    if (error) {
      setSubmitting(false)
      setError(error.message)
      return
    }

    await claimInvite()
  }

  if (invite === undefined) {
    return (
      <div className="auth-page">
        <p className="status-message">Loading invite...</p>
      </div>
    )
  }

  if (invite === null || invite.status !== 'pending') {
    return (
      <div className="auth-page">
        <Link className="auth-logo" to="/">
          <img className="logo-mark" src="/logo.png" alt="Simple NPS" />
          Simple NPS
        </Link>
        <div className="auth-card">
          <h1>Invite not available</h1>
          <p className="auth-card-subtitle">
            This invite link is invalid or has already been used. Ask whoever invited you to send
            a new one.
          </p>
        </div>
      </div>
    )
  }

  const alreadyLoggedInAsInvitee = user && user.email.toLowerCase() === invite.email.toLowerCase()
  const alreadyLoggedInAsSomeoneElse = user && !alreadyLoggedInAsInvitee

  return (
    <div className="auth-page">
      <Link className="auth-logo" to="/">
        <img className="logo-mark" src="/logo.png" alt="Simple NPS" />
        Simple NPS
      </Link>

      <div className="auth-card">
        <h1>You're invited</h1>
        <p className="auth-card-subtitle">
          <strong>{invite.account_name}</strong> invited <strong>{invite.email}</strong> to join as{' '}
          <strong>{ROLE_LABELS[invite.role]}</strong>.
        </p>

        {error && <p className="error-message">{error}</p>}

        {alreadyLoggedInAsSomeoneElse && (
          <p className="status-message">
            You're currently signed in as {user.email}. Sign out first, then open this link again
            to accept as {invite.email}.
          </p>
        )}

        {alreadyLoggedInAsInvitee && (
          <button className="cta-button" onClick={claimInvite} disabled={submitting}>
            {submitting ? 'Joining...' : `Join ${invite.account_name}`}
          </button>
        )}

        {!user && (
          <form className="auth-form" onSubmit={handleAuthSubmit}>
            <div className="field">
              <label htmlFor="email">Email</label>
              <input id="email" type="email" value={invite.email} disabled />
            </div>

            <div className="field">
              <label htmlFor="password">Password</label>
              <input
                id="password"
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                minLength={6}
                autoComplete={mode === 'sign-in' ? 'current-password' : 'new-password'}
              />
            </div>

            <button className="cta-button" type="submit" disabled={submitting}>
              {submitting ? 'Please wait...' : mode === 'sign-in' ? 'Sign in & join' : 'Sign up & join'}
            </button>

            <button
              type="button"
              className="link-button"
              onClick={() => {
                setMode(mode === 'sign-in' ? 'sign-up' : 'sign-in')
                setError(null)
              }}
            >
              {mode === 'sign-in' ? "Don't have an account? Sign up" : 'Already have an account? Sign in'}
            </button>
          </form>
        )}
      </div>
    </div>
  )
}
