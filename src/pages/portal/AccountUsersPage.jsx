import { useEffect, useState } from 'react'
import { useAuth } from '../../AuthContext'
import { useAccount } from '../../AccountContext'
import { supabase } from '../../supabaseClient'

const ROLES = [
  { value: 'admin', label: 'Admin' },
  { value: 'analytics', label: 'Analytics' },
]

export function AccountUsersPage() {
  const { user } = useAuth()
  const { accountId, isAdmin } = useAccount()

  const [members, setMembers] = useState(null)
  const [error, setError] = useState(null)

  const [inviteEmail, setInviteEmail] = useState('')
  const [inviteRole, setInviteRole] = useState('analytics')
  const [inviting, setInviting] = useState(false)
  const [inviteLink, setInviteLink] = useState(null)
  const [copied, setCopied] = useState(false)

  function loadMembers() {
    if (!accountId) return
    supabase
      .from('account_members')
      .select('id, email, role, status, invite_token, invited_at')
      .eq('account_id', accountId)
      .order('invited_at', { ascending: true })
      .then(({ data, error }) => {
        if (error) setError(error.message)
        else setMembers(data)
      })
  }

  useEffect(() => {
    loadMembers()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [accountId])

  async function handleInvite(e) {
    e.preventDefault()
    setError(null)
    setInviting(true)
    setInviteLink(null)
    setCopied(false)

    const { data, error } = await supabase
      .from('account_members')
      .insert({ account_id: accountId, email: inviteEmail, role: inviteRole })
      .select('invite_token')
      .single()

    setInviting(false)

    if (error) {
      setError(error.code === '23505' ? 'That email has already been invited.' : error.message)
      return
    }

    setInviteLink(`${window.location.origin}/invite/${data.invite_token}`)
    setInviteEmail('')
    loadMembers()
  }

  async function handleCopy() {
    await navigator.clipboard.writeText(inviteLink)
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }

  async function handleRoleChange(memberId, role) {
    setError(null)
    const { error } = await supabase.from('account_members').update({ role }).eq('id', memberId)
    if (error) {
      setError(error.message)
      return
    }
    loadMembers()
  }

  async function handleRemove(memberId) {
    if (!window.confirm('Remove this person from the account?')) return
    setError(null)
    const { error } = await supabase.from('account_members').delete().eq('id', memberId)
    if (error) {
      setError(error.message)
      return
    }
    setMembers((current) => current.filter((m) => m.id !== memberId))
  }

  if (!isAdmin) {
    return <p className="status-message">You don't have permission to manage users.</p>
  }

  return (
    <div>
      <div className="account-card">
        <h2>Invite someone</h2>
        <form className="invite-form" onSubmit={handleInvite}>
          <div className="field">
            <label htmlFor="invite-email">Email</label>
            <input
              id="invite-email"
              type="email"
              value={inviteEmail}
              onChange={(e) => setInviteEmail(e.target.value)}
              required
            />
          </div>

          <div className="field">
            <label>Role</label>
            <div className="segmented-control">
              {ROLES.map((option) => (
                <button
                  key={option.value}
                  type="button"
                  className={inviteRole === option.value ? 'active' : ''}
                  onClick={() => setInviteRole(option.value)}
                >
                  {option.label}
                </button>
              ))}
            </div>
          </div>

          <button className="cta-button" type="submit" disabled={inviting}>
            {inviting ? 'Creating invite...' : 'Create invite link'}
          </button>
        </form>

        <p className="field-hint">
          <strong>Admin</strong> has full access. <strong>Analytics</strong> can view scorecards,
          results, and analytics, but can't create, edit, or delete anything.
        </p>

        {error && <p className="error-message">{error}</p>}

        {inviteLink && (
          <div className="code-block">
            <pre>{inviteLink}</pre>
            <button className="cta-button secondary code-copy" onClick={handleCopy}>
              {copied ? 'Copied!' : 'Copy'}
            </button>
            <p className="field-hint" style={{ marginTop: 12 }}>
              Since email isn't set up yet, send this link to them yourself — it logs them in as
              the invited role once they sign up or log in.
            </p>
          </div>
        )}
      </div>

      <h2 className="portal-section-title">Members</h2>

      {members === null && <p className="status-message">Loading...</p>}

      {members && members.length > 0 && (
        <div className="table-wrapper">
          <table className="results-table">
            <thead>
              <tr>
                <th>Email</th>
                <th>Role</th>
                <th>Status</th>
                <th></th>
              </tr>
            </thead>
            <tbody>
              {members.map((member) => {
                const isSelf = member.email.toLowerCase() === user.email.toLowerCase()
                return (
                  <tr key={member.id}>
                    <td>{member.email}{isSelf && ' (you)'}</td>
                    <td>
                      <select
                        className="status-select"
                        value={member.role}
                        disabled={isSelf}
                        onChange={(e) => handleRoleChange(member.id, e.target.value)}
                      >
                        {ROLES.map((option) => (
                          <option key={option.value} value={option.value}>{option.label}</option>
                        ))}
                      </select>
                    </td>
                    <td>{member.status === 'pending' ? 'Invited' : 'Active'}</td>
                    <td>
                      {!isSelf && (
                        <button className="link-button danger" onClick={() => handleRemove(member.id)}>
                          Remove
                        </button>
                      )}
                    </td>
                  </tr>
                )
              })}
            </tbody>
          </table>
        </div>
      )}
    </div>
  )
}
