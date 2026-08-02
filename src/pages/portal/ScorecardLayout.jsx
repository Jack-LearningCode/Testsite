import { useEffect, useState } from 'react'
import { Link, NavLink, Outlet, useParams } from 'react-router-dom'
import { supabase } from '../../supabaseClient'

export function ScorecardLayout() {
  const { scorecardId } = useParams()
  const [scorecard, setScorecard] = useState(null)
  const [error, setError] = useState(null)

  useEffect(() => {
    let cancelled = false
    setScorecard(null)
    setError(null)

    supabase
      .from('scorecards')
      .select('*')
      .eq('id', scorecardId)
      .single()
      .then(({ data, error }) => {
        if (cancelled) return
        if (error) setError('Scorecard not found.')
        else setScorecard(data)
      })

    return () => {
      cancelled = true
    }
  }, [scorecardId])

  if (error) {
    return (
      <main className="portal-content">
        <p className="error-message">{error}</p>
        <Link to="/portal/scorecards">Back to scorecards</Link>
      </main>
    )
  }

  if (!scorecard) {
    return (
      <main className="portal-content">
        <p className="status-message">Loading...</p>
      </main>
    )
  }

  return (
    <main className="portal-content portal-content-wide">
      <Link className="back-link" to="/portal/scorecards">← All scorecards</Link>
      <h1>{scorecard.name}</h1>

      <nav className="tab-nav">
        <NavLink to={`/portal/scorecards/${scorecardId}/edit`} className={({ isActive }) => isActive ? 'tab active' : 'tab'}>
          Edit
        </NavLink>
        <NavLink to={`/portal/scorecards/${scorecardId}/embed`} className={({ isActive }) => isActive ? 'tab active' : 'tab'}>
          Embed code
        </NavLink>
        <NavLink to={`/portal/scorecards/${scorecardId}/results`} className={({ isActive }) => isActive ? 'tab active' : 'tab'}>
          Results
        </NavLink>
        <NavLink to={`/portal/scorecards/${scorecardId}/analytics`} className={({ isActive }) => isActive ? 'tab active' : 'tab'}>
          Analytics
        </NavLink>
      </nav>

      <Outlet context={{ scorecard, setScorecard }} />
    </main>
  )
}
