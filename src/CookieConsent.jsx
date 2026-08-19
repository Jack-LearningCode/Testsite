import { useEffect, useRef, useState } from 'react'
import { loadGoogleAnalytics } from './lib/analytics'

const STORAGE_KEY = 'simple_nps_cookie_consent'

export function CookieConsent() {
  const [choice, setChoice] = useState(() => localStorage.getItem(STORAGE_KEY))
  const bannerRef = useRef(null)

  useEffect(() => {
    if (choice === 'accepted') loadGoogleAnalytics()
  }, [choice])

  // The banner is fixed to the viewport bottom, which on a short mobile
  // screen can cover whatever's at the end of the page (e.g. a form's save
  // button). Reserve exactly that much space at the bottom of the page so
  // nothing is ever left unreachable behind it.
  useEffect(() => {
    if (choice || !bannerRef.current) {
      document.body.style.paddingBottom = ''
      return
    }

    const el = bannerRef.current
    function updateSpacing() {
      document.body.style.paddingBottom = `${el.offsetHeight + 40}px`
    }

    updateSpacing()
    window.addEventListener('resize', updateSpacing)
    return () => {
      window.removeEventListener('resize', updateSpacing)
      document.body.style.paddingBottom = ''
    }
  }, [choice])

  if (choice) return null

  function handleChoice(value) {
    localStorage.setItem(STORAGE_KEY, value)
    setChoice(value)
  }

  return (
    <div className="cookie-banner" ref={bannerRef}>
      <p>
        We use cookies to understand how visitors use this site. No personal data is sold or
        shared for advertising. See how we handle data on our{' '}
        <a href="/contact">Contact page</a>.
      </p>
      <div className="cookie-banner-actions">
        <button className="cta-button secondary" onClick={() => handleChoice('declined')}>
          Decline
        </button>
        <button className="cta-button" onClick={() => handleChoice('accepted')}>
          Accept
        </button>
      </div>
    </div>
  )
}
