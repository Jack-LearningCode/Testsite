import { useState } from 'react'
import { Link } from 'react-router-dom'
import { supabase } from '../supabaseClient'

export function ContactPage() {
  const [name, setName] = useState('')
  const [email, setEmail] = useState('')
  const [message, setMessage] = useState('')
  const [error, setError] = useState(null)
  const [sent, setSent] = useState(false)
  const [submitting, setSubmitting] = useState(false)

  async function handleSubmit(e) {
    e.preventDefault()
    setError(null)
    setSubmitting(true)

    const { error } = await supabase.from('contact_messages').insert({ name, email, message })

    setSubmitting(false)

    if (error) {
      setError('Something went wrong sending your message. Please try again.')
      return
    }

    setSent(true)
  }

  return (
    <div className="auth-page">
      <Link className="auth-logo" to="/">
        <img className="logo-mark" src="/logo.png" alt="Simple NPS" />
        Simple NPS
      </Link>

      <div className="auth-card">
        {sent ? (
          <>
            <h1>Message sent</h1>
            <p className="auth-card-subtitle">
              Thanks for reaching out — we'll get back to you as soon as we can.
            </p>
            <Link className="cta-button" to="/">Back to home</Link>
          </>
        ) : (
          <>
            <h1>Contact us</h1>
            <p className="auth-card-subtitle">
              Questions, feedback, or need a hand? Send us a message.
            </p>

            <form className="auth-form" onSubmit={handleSubmit}>
              <div className="field">
                <label htmlFor="name">Name</label>
                <input
                  id="name"
                  type="text"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  required
                  autoComplete="name"
                />
              </div>

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
                <label htmlFor="message">Message</label>
                <textarea
                  id="message"
                  rows={5}
                  value={message}
                  onChange={(e) => setMessage(e.target.value)}
                  required
                />
              </div>

              {error && <p className="error-message">{error}</p>}

              <button className="cta-button" type="submit" disabled={submitting}>
                {submitting ? 'Sending...' : 'Send message'}
              </button>
            </form>
          </>
        )}
      </div>
    </div>
  )
}
