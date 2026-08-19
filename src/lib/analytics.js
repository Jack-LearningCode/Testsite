// Swap in the real GA4 Measurement ID from your Google Analytics property
// (Admin > Data Streams > your web stream). Until then this is a harmless
// no-op — no script loads and no id is a placeholder.
export const GA_MEASUREMENT_ID = 'G-5R3NYLWDJ8'

export function loadGoogleAnalytics() {
  if (window.gtagLoaded) return
  window.gtagLoaded = true

  const script = document.createElement('script')
  script.src = `https://www.googletagmanager.com/gtag/js?id=${GA_MEASUREMENT_ID}`
  script.async = true
  document.head.appendChild(script)

  window.dataLayer = window.dataLayer || []
  window.gtag = function gtag() {
    window.dataLayer.push(arguments)
  }
  window.gtag('js', new Date())
  window.gtag('config', GA_MEASUREMENT_ID, { send_page_view: false })
}

export function trackPageview(path) {
  if (typeof window.gtag !== 'function') return
  window.gtag('event', 'page_view', { page_path: path })
}
