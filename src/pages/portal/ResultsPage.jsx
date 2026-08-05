import { useEffect, useState } from 'react'
import { useOutletContext } from 'react-router-dom'
import { supabase } from '../../supabaseClient'
import { npsCategory } from '../../nps'
import { useAccount } from '../../AccountContext'

const STATUS_OPTIONS = [
  { value: 'new', label: 'New' },
  { value: 'in_progress', label: 'In progress' },
  { value: 'resolved', label: 'Resolved' },
]

function toCsvValue(value) {
  if (value == null) return ''
  const str = String(value)
  if (/[",\n]/.test(str)) return '"' + str.replace(/"/g, '""') + '"'
  return str
}

function downloadCsv(filename, rows) {
  const csv = rows.map((row) => row.map(toCsvValue).join(',')).join('\n')
  const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' })
  const url = URL.createObjectURL(blob)
  const link = document.createElement('a')
  link.href = url
  link.download = filename
  document.body.appendChild(link)
  link.click()
  link.remove()
  URL.revokeObjectURL(url)
}

function pagePath(url) {
  try {
    return new URL(url).pathname || '/'
  } catch {
    return url
  }
}

function NotesCell({ response, onSave }) {
  const [value, setValue] = useState(response.notes || '')

  return (
    <input
      type="text"
      className="notes-input"
      value={value}
      placeholder="Add a note..."
      onChange={(e) => setValue(e.target.value)}
      onBlur={() => {
        if (value !== (response.notes || '')) onSave(value || null)
      }}
    />
  )
}

export function ResultsPage() {
  const { isAdmin } = useAccount()
  const { scorecard } = useOutletContext()
  const [responses, setResponses] = useState(null)
  const [error, setError] = useState(null)

  useEffect(() => {
    let cancelled = false

    supabase
      .from('responses')
      .select('id, name, email, score, comment, page_url, status, notes, created_at')
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

  async function updateResponse(id, patch) {
    setResponses((current) => current.map((r) => (r.id === id ? { ...r, ...patch } : r)))
    const { error } = await supabase.from('responses').update(patch).eq('id', id)
    if (error) setError(error.message)
  }

  function handleExport() {
    const header = ['Date', 'Score', 'Name', 'Email', 'Comment', 'Page', 'Status', 'Notes']
    const rows = responses.map((r) => [
      new Date(r.created_at).toISOString(),
      r.score,
      r.name || '',
      r.email || '',
      r.comment || '',
      r.page_url || '',
      r.status,
      r.notes || '',
    ])
    downloadCsv(`${scorecard.name.replace(/\s+/g, '-').toLowerCase()}-responses.csv`, [header, ...rows])
  }

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
    <div>
      <div className="portal-header-row">
        <p className="field-hint" style={{ margin: 0 }}>
          {responses.length} response{responses.length === 1 ? '' : 's'}
        </p>
        <button className="cta-button secondary" onClick={handleExport}>Export CSV</button>
      </div>

      <div className="table-wrapper">
        <table className="results-table">
          <thead>
            <tr>
              <th>Date</th>
              <th>Score</th>
              <th>Name</th>
              <th>Email</th>
              <th>Comment</th>
              <th>Page</th>
              <th>Status</th>
              <th>Notes</th>
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
                <td className="comment-cell">
                  {response.page_url ? (
                    <a href={response.page_url} target="_blank" rel="noreferrer">
                      {pagePath(response.page_url)}
                    </a>
                  ) : '—'}
                </td>
                <td>
                  {isAdmin ? (
                    <select
                      className="status-select"
                      value={response.status}
                      onChange={(e) => updateResponse(response.id, { status: e.target.value })}
                    >
                      {STATUS_OPTIONS.map((opt) => (
                        <option key={opt.value} value={opt.value}>{opt.label}</option>
                      ))}
                    </select>
                  ) : (
                    STATUS_OPTIONS.find((opt) => opt.value === response.status)?.label ?? response.status
                  )}
                </td>
                <td>
                  {isAdmin ? (
                    <NotesCell response={response} onSave={(notes) => updateResponse(response.id, { notes })} />
                  ) : (
                    response.notes || '—'
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  )
}
