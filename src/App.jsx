import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom'
import { AuthProvider } from './AuthContext'
import { ProtectedRoute } from './ProtectedRoute'
import { LandingPage } from './pages/LandingPage'
import { LoginPage } from './pages/LoginPage'
import { ContactPage } from './pages/ContactPage'
import { PortalLayout } from './pages/portal/PortalLayout'
import { AccountPage } from './pages/portal/AccountPage'
import { ProfilePage } from './pages/portal/ProfilePage'
import { ScorecardsListPage } from './pages/portal/ScorecardsListPage'
import { ScorecardLayout } from './pages/portal/ScorecardLayout'
import { ScorecardEditPage } from './pages/portal/ScorecardEditPage'
import { EmbedCodePage } from './pages/portal/EmbedCodePage'
import { ResultsPage } from './pages/portal/ResultsPage'
import { AnalyticsPage } from './pages/portal/AnalyticsPage'
import { GlobalAnalyticsPage } from './pages/portal/GlobalAnalyticsPage'
import './App.css'

function App() {
  return (
    <BrowserRouter>
      <AuthProvider>
        <Routes>
          <Route path="/" element={<LandingPage />} />
          <Route path="/login" element={<LoginPage />} />
          <Route path="/contact" element={<ContactPage />} />

          <Route
            path="/portal"
            element={
              <ProtectedRoute>
                <PortalLayout />
              </ProtectedRoute>
            }
          >
            <Route index element={<Navigate to="scorecards" replace />} />
            <Route path="account" element={<AccountPage />} />
            <Route path="profile" element={<ProfilePage />} />
            <Route path="scorecards" element={<ScorecardsListPage />} />
            <Route path="analytics" element={<GlobalAnalyticsPage />} />
            <Route path="scorecards/:scorecardId" element={<ScorecardLayout />}>
              <Route index element={<Navigate to="edit" replace />} />
              <Route path="edit" element={<ScorecardEditPage />} />
              <Route path="embed" element={<EmbedCodePage />} />
              <Route path="results" element={<ResultsPage />} />
              <Route path="analytics" element={<AnalyticsPage />} />
            </Route>
          </Route>
        </Routes>
      </AuthProvider>
    </BrowserRouter>
  )
}

export default App
