import { NavLink, Outlet } from 'react-router-dom'
import { useAccount } from '../../AccountContext'

export function AccountLayout() {
  const { isAdmin } = useAccount()

  return (
    <main className="portal-content portal-content-wide">
      <h1>Account</h1>
      <p className="portal-subtitle">Plan, billing, and who has access to this account.</p>

      <nav className="tab-nav">
        <NavLink to="/portal/account" end className={({ isActive }) => isActive ? 'tab active' : 'tab'}>
          Overview
        </NavLink>
        {isAdmin && (
          <NavLink to="/portal/account/users" className={({ isActive }) => isActive ? 'tab active' : 'tab'}>
            Users
          </NavLink>
        )}
      </nav>

      <Outlet />
    </main>
  )
}
