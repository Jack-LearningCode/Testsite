import { useState } from 'react'
import { Link, Navigate, useNavigate } from 'react-router-dom'
import { useAuth } from '../AuthContext'

export function LoginPage() {
  const { user, signIn, signUp } = useAuth()
  const navigate = useNavigate()

  const [mode, setMode] = useState('sign-in')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState(null)
  const [message, setMessage] = useState(null)
  const [submitting, setSubmitting] = useState(false)

  if (user) {
    return <Navigate to="/portal" replace />
  }

  async function handleSubmit(e) {
    e.preventDefault()
    setError(null)
    setMessage(null)
    setSubmitting(true)

    const { data, error } = mode === 'sign-in'
      ? await signIn(email, password)
      : await signUp(email, password)

    setSubmitting(false)

    if (error) {
      setError(error.message)
      return
    }

    if (mode === 'sign-up' && !data.session) {
      setMessage('Check your email to confirm your account before signing in.')
      return
    }

    navigate('/portal')
  }

  return (
    <div className="auth-page">
      <Link className="auth-logo" to="/">
        <img className="logo-mark" src="/logo.png" alt="Simple NPS" />
        Simple NPS
      </Link>

      <div className="auth-card">
        <h1>{mode === 'sign-in' ? 'Welcome back' : 'Create your account'}</h1>
        <p className="auth-card-subtitle">
          {mode === 'sign-in'
            ? 'Sign in to manage your scorecards.'
            : 'Start collecting NPS feedback in minutes.'}
        </p>

        <form className="auth-form" onSubmit={handleSubmit}>
          <div className="field">
            <label htmlFor="email">Email</label>
            <input
              id="email"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              autoComplete="email"
            />
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

          {error && <p className="error-message">{error}</p>}
          {message && <p className="status-message">{message}</p>}

          <button className="cta-button" type="submit" disabled={submitting}>
            {submitting ? 'Please wait...' : mode === 'sign-in' ? 'Sign in' : 'Sign up'}
          </button>

          <button
            type="button"
            className="link-button"
            onClick={() => {
              setMode(mode === 'sign-in' ? 'sign-up' : 'sign-in')
              setError(null)
              setMessage(null)
            }}
          >
            {mode === 'sign-in' ? "Don't have an account? Sign up" : 'Already have an account? Sign in'}
          </button>
        </form>
      </div>
    </div>
  )
}
