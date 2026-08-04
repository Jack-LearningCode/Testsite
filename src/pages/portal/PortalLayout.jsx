import { useEffect, useRef, useState } from 'react'
import { Link, NavLink, Outlet } from 'react-router-dom'
import { useAuth } from '../../AuthContext'

export function PortalLayout() {
  const { user, signOut } = useAuth()
  const [menuOpen, setMenuOpen] = useState(false)
  const menuRef = useRef(null)

  useEffect(() => {
    function handleClickOutside(e) {
      if (menuRef.current && !menuRef.current.contains(e.target)) {
        setMenuOpen(false)
      }
    }
    document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [])

  const initial = user.email.charAt(0).toUpperCase()

  return (
    <div className="portal-page">
      <header className="portal-nav">
        <Link className="logo" to="/">
          <img className="logo-mark" src="/logo.png" alt="Simple NPS" />
          Simple NPS
        </Link>
        <nav className="portal-nav-links">
          <NavLink
            to="/portal/scorecards"
            className={({ isActive }) => 'portal-nav-link' + (isActive ? ' active' : '')}
          >
            Scorecards
          </NavLink>
          <NavLink
            to="/portal/analytics"
            className={({ isActive }) => 'portal-nav-link' + (isActive ? ' active' : '')}
          >
            Analytics
          </NavLink>
        </nav>

        <div className="account-menu" ref={menuRef}>
          <button className="account-menu-trigger" onClick={() => setMenuOpen((open) => !open)}>
            <span className="avatar avatar-sm">{initial}</span>
          </button>

          {menuOpen && (
            <div className="account-menu-dropdown">
              <p className="account-menu-email">{user.email}</p>
              <div className="account-menu-mobile-links">
                <Link to="/portal/scorecards" onClick={() => setMenuOpen(false)}>Scorecards</Link>
                <Link to="/portal/analytics" onClick={() => setMenuOpen(false)}>Analytics</Link>
              </div>
              <Link to="/portal/profile" onClick={() => setMenuOpen(false)}>Profile</Link>
              <button onClick={() => signOut()}>Sign out</button>
            </div>
          )}
        </div>
      </header>

      <Outlet />
    </div>
  )
}
