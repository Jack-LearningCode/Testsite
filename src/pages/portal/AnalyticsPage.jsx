import { useEffect, useState } from 'react'
import { useOutletContext } from 'react-router-dom'
import { supabase } from '../../supabaseClient'
import { calculateNps } from '../../nps'

export function AnalyticsPage() {
  const { scorecard } = useOutletContext()
  const [responses, setResponses] = useState(null)
  const [error, setError] = useState(null)

  useEffect(() => {
    let cancelled = false

    supabase
      .from('responses')
      .select('score')
      .eq('scorecard_id', scorecard.id)
      .then(({ data, error }) => {
        if (cancelled) return
        if (error) setError(error.message)
        else setResponses(data)
      })

    return () => {
      cancelled = true
    }
  }, [scorecard.id])

  if (error) return <p className="error-message">{error}</p>
  if (responses === null) return <p className="status-message">Loading...</p>

  if (responses.length === 0) {
    return (
      <div className="empty-state">
        <p>No responses yet. Analytics will appear once people start responding.</p>
      </div>
    )
  }

  const { score, total, promoters, passives, detractors } = calculateNps(responses)
  const pct = (count) => Math.round((count / total) * 100)

  return (
    <div className="analytics-grid">
      <div className="stat-card">
        <span className="stat-label">NPS score</span>
        <span className="stat-value">{score > 0 ? `+${score}` : score}</span>
      </div>
      <div className="stat-card">
        <span className="stat-label">Total responses</span>
        <span className="stat-value">{total}</span>
      </div>

      <div className="breakdown-card">
        <h2>Breakdown</h2>

        <div className="breakdown-row">
          <span className="breakdown-label promoter">Promoters (9–10)</span>
          <div className="breakdown-bar"><div className="breakdown-bar-fill promoter" style={{ width: `${pct(promoters)}%` }} /></div>
          <span className="breakdown-count">{promoters} ({pct(promoters)}%)</span>
        </div>

        <div className="breakdown-row">
          <span className="breakdown-label passive">Passives (7–8)</span>
          <div className="breakdown-bar"><div className="breakdown-bar-fill passive" style={{ width: `${pct(passives)}%` }} /></div>
          <span className="breakdown-count">{passives} ({pct(passives)}%)</span>
        </div>

        <div className="breakdown-row">
          <span className="breakdown-label detractor">Detractors (0–6)</span>
          <div className="breakdown-bar"><div className="breakdown-bar-fill detractor" style={{ width: `${pct(detractors)}%` }} /></div>
          <span className="breakdown-count">{detractors} ({pct(detractors)}%)</span>
        </div>
      </div>
    </div>
  )
}
