import { Navigate, useParams } from 'react-router-dom'
import { useAccount } from './AccountContext'

export function AdminRoute({ children }) {
  const { isAdmin, loading } = useAccount()
  const { scorecardId } = useParams()

  if (loading) {
    return <p className="status-message">Loading...</p>
  }

  if (!isAdmin) {
    return <Navigate to={`/portal/scorecards/${scorecardId}/results`} replace />
  }

  return children
}
