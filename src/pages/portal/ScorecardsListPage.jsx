import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuth } from '../../AuthContext'
import { supabase } from '../../supabaseClient'
import { calculateNps } from '../../nps'

export function ScorecardsListPage() {
  const { user } = useAuth()
  const navigate = useNavigate()
  const [scorecards, setScorecards] = useState(null)
  const [error, setError] = useState(null)
  const [creating, setCreating] = useState(false)

  useEffect(() => {
    let cancelled = false

    supabase
      .from('scorecards')
      .select('id, name, question, color, created_at, responses(score)')
      .order('created_at', { ascending: false })
      .then(({ data, error }) => {
        if (cancelled) return
        if (error) setError(error.message)
        else setScorecards(data)
      })

    return () => {
      cancelled = true
    }
  }, [])

  async function handleCreate() {
    setCreating(true)
    setError(null)

    const { data, error } = await supabase
      .from('scorecards')
      .insert({ user_id: user.id, name: 'Untitled scorecard' })
      .select('id')
      .single()

    setCreating(false)

    if (error) {
      setError(error.message)
      return
    }

    navigate(`/portal/scorecards/${data.id}/edit`)
  }

  async function handleDelete(e, id) {
    e.stopPropagation()

    if (!window.confirm('Delete this scorecard and all of its responses? This cannot be undone.')) {
      return
    }

    const { error } = await supabase.from('scorecards').delete().eq('id', id)

    if (error) {
      setError(error.message)
      return
    }

    setScorecards((current) => current.filter((card) => card.id !== id))
  }

  function openScorecard(id) {
    navigate(`/portal/scorecards/${id}/edit`)
  }

  return (
    <main className="portal-content portal-content-wide">
      <div className="portal-header-row">
        <div>
          <h1>Scorecards</h1>
          <p className="portal-subtitle">Create and manage your NPS scorecards.</p>
        </div>
        <button className="cta-button" onClick={handleCreate} disabled={creating}>
          {creating ? 'Creating...' : 'New scorecard'}
        </button>
      </div>

      {error && <p className="error-message">{error}</p>}

      {scorecards === null && <p className="status-message">Loading...</p>}

      {scorecards && scorecards.length === 0 && (
        <div className="empty-state">
          <p>You don't have any scorecards yet.</p>
          <button className="cta-button" onClick={handleCreate} disabled={creating}>
            Create your first scorecard
          </button>
        </div>
      )}

      {scorecards && scorecards.length > 0 && (
        <div className="scorecard-grid">
          {scorecards.map((card) => {
            const stats = calculateNps(card.responses)
            return (
              <div
                className="scorecard-card clickable"
                key={card.id}
                style={{ '--card-accent': card.color }}
                onClick={() => openScorecard(card.id)}
                role="button"
                tabIndex={0}
                onKeyDown={(e) => {
                  if (e.key === 'Enter') openScorecard(card.id)
                }}
              >
                <button
                  className="scorecard-delete"
                  onClick={(e) => handleDelete(e, card.id)}
                  aria-label="Delete scorecard"
                  title="Delete scorecard"
                >
                  &times;
                </button>

                <h3>{card.name}</h3>
                <p className="scorecard-question-preview">{card.question}</p>

                <div className="scorecard-stats">
                  <span className="scorecard-stat">
                    <strong>{stats.total ? (stats.score > 0 ? `+${stats.score}` : stats.score) : '—'}</strong> NPS
                  </span>
                  <span className="scorecard-stat-divider" />
                  <span className="scorecard-stat">
                    <strong>{stats.total}</strong> {stats.total === 1 ? 'response' : 'responses'}
                  </span>
                </div>
              </div>
            )
          })}
        </div>
      )}
    </main>
  )
}
