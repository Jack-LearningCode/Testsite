import { useEffect, useState } from 'react'
import { useAccount } from '../../AccountContext'
import { supabase } from '../../supabaseClient'

const EXAMPLE_PAYLOAD = `{
  "event": "response.created",
  "account_id": "b3f1...",
  "scorecard": {
    "id": "4ac5...",
    "name": "Homepage Feedback",
    "question": "How likely are you to recommend us to a friend or colleague?",
    "low_label": "Not likely",
    "high_label": "Very likely"
  },
  "response": {
    "id": "e5a9...",
    "score": 9,
    "nps_category": "promoter",
    "name": "Jane Doe",
    "email": "jane@example.com",
    "comment": "Really easy to use!",
    "page_url": "https://example.com/pricing",
    "status": "new",
    "notes": null,
    "created_at": "2026-08-06T10:15:00Z"
  }
}`

export function WebhooksPage() {
  const { accountId, isAdmin } = useAccount()

  const [scorecards, setScorecards] = useState([])
  const [webhooks, setWebhooks] = useState(null)
  const [error, setError] = useState(null)

  const [name, setName] = useState('')
  const [scorecardId, setScorecardId] = useState('')
  const [url, setUrl] = useState('')
  const [saving, setSaving] = useState(false)

  function loadWebhooks() {
    if (!accountId) return
    supabase
      .from('webhooks')
      .select('id, name, url, scorecard_id, enabled, created_at, scorecards(name)')
      .eq('account_id', accountId)
      .order('created_at', { ascending: false })
      .then(({ data, error }) => {
        if (error) setError(error.message)
        else setWebhooks(data)
      })
  }

  useEffect(() => {
    if (!accountId) return

    supabase
      .from('scorecards')
      .select('id, name')
      .eq('account_id', accountId)
      .order('name', { ascending: true })
      .then(({ data, error }) => {
        if (!error) setScorecards(data)
      })

    loadWebhooks()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [accountId])

  async function handleCreate(e) {
    e.preventDefault()
    setError(null)
    setSaving(true)

    const { error } = await supabase.from('webhooks').insert({
      account_id: accountId,
      name,
      url,
      scorecard_id: scorecardId || null,
    })

    setSaving(false)

    if (error) {
      setError(error.message)
      return
    }

    setName('')
    setUrl('')
    setScorecardId('')
    loadWebhooks()
  }

  async function toggleEnabled(webhook) {
    setError(null)
    const { error } = await supabase
      .from('webhooks')
      .update({ enabled: !webhook.enabled })
      .eq('id', webhook.id)

    if (error) {
      setError(error.message)
      return
    }
    loadWebhooks()
  }

  async function handleDelete(id) {
    if (!window.confirm('Delete this webhook?')) return
    setError(null)
    const { error } = await supabase.from('webhooks').delete().eq('id', id)
    if (error) {
      setError(error.message)
      return
    }
    setWebhooks((current) => current.filter((w) => w.id !== id))
  }

  if (!isAdmin) {
    return (
      <main className="portal-content portal-content-wide">
        <h1>Webhooks</h1>
        <p className="status-message">You don't have permission to manage webhooks.</p>
      </main>
    )
  }

  return (
    <main className="portal-content portal-content-wide">
      <h1>Webhooks</h1>
      <p className="portal-subtitle">
        Get an HTTP POST the moment someone submits an NPS response.
      </p>

      <div className="account-card">
        <h2>Create a webhook</h2>
        <form className="invite-form" onSubmit={handleCreate}>
          <div className="field">
            <label htmlFor="webhook-name">Name</label>
            <input
              id="webhook-name"
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="e.g. Slack notifications"
              required
            />
          </div>

          <div className="field">
            <label htmlFor="webhook-scorecard">Fires for</label>
            <select
              id="webhook-scorecard"
              className="status-select"
              value={scorecardId}
              onChange={(e) => setScorecardId(e.target.value)}
            >
              <option value="">All scorecards</option>
              {scorecards.map((card) => (
                <option key={card.id} value={card.id}>{card.name}</option>
              ))}
            </select>
          </div>

          <div className="field">
            <label htmlFor="webhook-url">URL</label>
            <input
              id="webhook-url"
              type="url"
              value={url}
              onChange={(e) => setUrl(e.target.value)}
              placeholder="https://"
              required
            />
          </div>

          {error && <p className="error-message">{error}</p>}

          <button className="cta-button" type="submit" disabled={saving}>
            {saving ? 'Creating...' : 'Create webhook'}
          </button>
        </form>
      </div>

      <h2 className="portal-section-title">Your webhooks</h2>

      {webhooks === null && <p className="status-message">Loading...</p>}

      {webhooks && webhooks.length === 0 && (
        <div className="empty-state">
          <p>No webhooks yet.</p>
        </div>
      )}

      {webhooks && webhooks.length > 0 && (
        <div className="table-wrapper">
          <table className="results-table">
            <thead>
              <tr>
                <th>Name</th>
                <th>Fires for</th>
                <th>URL</th>
                <th>Enabled</th>
                <th></th>
              </tr>
            </thead>
            <tbody>
              {webhooks.map((webhook) => (
                <tr key={webhook.id}>
                  <td>{webhook.name}</td>
                  <td>{webhook.scorecards?.name ?? 'All scorecards'}</td>
                  <td className="comment-cell">{webhook.url}</td>
                  <td>
                    <button className="cta-button secondary" onClick={() => toggleEnabled(webhook)}>
                      {webhook.enabled ? 'Enabled' : 'Disabled'}
                    </button>
                  </td>
                  <td>
                    <button className="link-button danger" onClick={() => handleDelete(webhook.id)}>
                      Delete
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      <h2 className="portal-section-title">What gets sent</h2>
      <p className="field-hint">
        Every webhook receives a POST request with this JSON body — the full response plus enough
        scorecard context to use it however you need, whether that's a CRM, a spreadsheet, Slack,
        or your own backend.
      </p>
      <div className="code-block">
        <pre>{EXAMPLE_PAYLOAD}</pre>
      </div>
    </main>
  )
}
