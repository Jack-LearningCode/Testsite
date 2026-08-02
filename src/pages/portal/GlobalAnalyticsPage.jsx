import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { supabase } from '../../supabaseClient'
import { calculateNps } from '../../nps'

export function GlobalAnalyticsPage() {
  const [scorecards, setScorecards] = useState(null)
  const [error, setError] = useState(null)

  useEffect(() => {
    let cancelled = false

    supabase
      .from('scorecards')
      .select('id, name, responses(score)')
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

  if (error) return <p className="error-message">{error}</p>
  if (scorecards === null) return <p className="status-message">Loading...</p>

  if (scorecards.length === 0) {
    return (
      <main className="portal-content portal-content-wide">
        <h1>Analytics</h1>
        <div className="empty-state">
          <p>Create a scorecard to start seeing analytics here.</p>
          <Link className="cta-button" to="/portal/scorecards">Go to scorecards</Link>
        </div>
      </main>
    )
  }

  const allResponses = scorecards.flatMap((card) => card.responses)
  const overall = calculateNps(allResponses)
  const pct = (count) => (overall.total ? Math.round((count / overall.total) * 100) : 0)

  return (
    <main className="portal-content portal-content-wide">
      <h1>Analytics</h1>
      <p className="portal-subtitle">NPS performance across all of your scorecards.</p>

      {overall.total === 0 ? (
        <div className="empty-state" style={{ marginTop: 24 }}>
          <p>No responses yet across any scorecard.</p>
        </div>
      ) : (
        <div className="analytics-grid" style={{ marginTop: 24 }}>
          <div className="stat-card">
            <span className="stat-label">Overall NPS score</span>
            <span className="stat-value">{overall.score > 0 ? `+${overall.score}` : overall.score}</span>
          </div>
          <div className="stat-card">
            <span className="stat-label">Total responses</span>
            <span className="stat-value">{overall.total}</span>
          </div>
          <div className="stat-card">
            <span className="stat-label">Scorecards</span>
            <span className="stat-value">{scorecards.length}</span>
          </div>

          <div className="breakdown-card">
            <h2>Breakdown</h2>
            <div className="breakdown-row">
              <span className="breakdown-label promoter">Promoters (9–10)</span>
              <div className="breakdown-bar"><div className="breakdown-bar-fill promoter" style={{ width: `${pct(overall.promoters)}%` }} /></div>
              <span className="breakdown-count">{overall.promoters} ({pct(overall.promoters)}%)</span>
            </div>
            <div className="breakdown-row">
              <span className="breakdown-label passive">Passives (7–8)</span>
              <div className="breakdown-bar"><div className="breakdown-bar-fill passive" style={{ width: `${pct(overall.passives)}%` }} /></div>
              <span className="breakdown-count">{overall.passives} ({pct(overall.passives)}%)</span>
            </div>
            <div className="breakdown-row">
              <span className="breakdown-label detractor">Detractors (0–6)</span>
              <div className="breakdown-bar"><div className="breakdown-bar-fill detractor" style={{ width: `${pct(overall.detractors)}%` }} /></div>
              <span className="breakdown-count">{overall.detractors} ({pct(overall.detractors)}%)</span>
            </div>
          </div>
        </div>
      )}

      <h2 className="portal-section-title">By scorecard</h2>
      <div className="table-wrapper">
        <table className="results-table">
          <thead>
            <tr>
              <th>Scorecard</th>
              <th>NPS score</th>
              <th>Responses</th>
            </tr>
          </thead>
          <tbody>
            {scorecards.map((card) => {
              const stats = calculateNps(card.responses)
              return (
                <tr key={card.id}>
                  <td>
                    <Link to={`/portal/scorecards/${card.id}/analytics`}>{card.name}</Link>
                  </td>
                  <td>{stats.total ? (stats.score > 0 ? `+${stats.score}` : stats.score) : '—'}</td>
                  <td>{stats.total}</td>
                </tr>
              )
            })}
          </tbody>
        </table>
      </div>
    </main>
  )
}
