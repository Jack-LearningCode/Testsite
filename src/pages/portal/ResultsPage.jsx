import { useEffect, useState } from 'react'
import { useOutletContext } from 'react-router-dom'
import { supabase } from '../../supabaseClient'
import { npsCategory } from '../../nps'

export function ResultsPage() {
  const { scorecard } = useOutletContext()
  const [responses, setResponses] = useState(null)
  const [error, setError] = useState(null)

  useEffect(() => {
    let cancelled = false

    supabase
      .from('responses')
      .select('id, name, email, score, comment, created_at')
      .eq('scorecard_id', scorecard.id)
      .order('created_at', { ascending: false })
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
        <p>No responses yet. Once your embed code is live, submissions will show up here.</p>
      </div>
    )
  }

  return (
    <div className="table-wrapper">
      <table className="results-table">
        <thead>
          <tr>
            <th>Date</th>
            <th>Score</th>
            <th>Name</th>
            <th>Email</th>
            <th>Comment</th>
          </tr>
        </thead>
        <tbody>
          {responses.map((response) => (
            <tr key={response.id}>
              <td>{new Date(response.created_at).toLocaleDateString()}</td>
              <td>
                <span className={`score-badge ${npsCategory(response.score)}`}>{response.score}</span>
              </td>
              <td>{response.name || '—'}</td>
              <td>{response.email || '—'}</td>
              <td className="comment-cell">{response.comment || '—'}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  )
}
