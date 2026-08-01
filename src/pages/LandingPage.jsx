import { Link } from 'react-router-dom'
import { useAuth } from '../AuthContext'

const FEATURES = [
  {
    title: 'Custom NPS scorecards',
    description:
      'Build and manage as many NPS scorecards as you need, then embed them directly on your website to collect feedback from real users.',
  },
  {
    title: 'Time-based triggers',
    description:
      'Automatically prompt customers for feedback after a set amount of time — since signup, since last survey, or on a recurring schedule.',
  },
  {
    title: 'Action-based triggers',
    description:
      'Fire a survey the moment it matters — after a key action, a completed purchase, or any event in your product.',
  },
  {
    title: 'Every response, fully reportable',
    description:
      'All responses are stored automatically and ready to report on — track trends, segment by scorecard, and spot changes over time.',
  },
]

export function LandingPage() {
  const { user } = useAuth()

  return (
    <div className="landing-page">
      <header className="landing-nav">
        <span className="logo">Simple NPS</span>
        {user ? (
          <Link className="nav-cta" to="/portal">My account</Link>
        ) : (
          <Link className="nav-cta" to="/login">Log in</Link>
        )}
      </header>

      <section className="hero">
        <h1>Enterprise NPS software, without the enterprise price tag</h1>
        <p className="hero-subtitle">
          Simple NPS gives you the same core capabilities as £1,500/month
          platforms — scorecards, smart triggers, and full reporting — for
          just £50 a month.
        </p>
        <Link className="cta-button" to="/login">Get started</Link>
      </section>

      <section className="features">
        {FEATURES.map((feature) => (
          <div className="feature-card" key={feature.title}>
            <h3>{feature.title}</h3>
            <p>{feature.description}</p>
          </div>
        ))}
      </section>

      <section className="pricing">
        <div className="pricing-card">
          <h2>£50<span>/month</span></h2>
          <p>Everything you need to run NPS surveys that actually get used.</p>
          <ul>
            <li>Unlimited NPS scorecards</li>
            <li>Time-based and action-based triggers</li>
            <li>Full response history and reporting</li>
            <li>Embed on any website</li>
          </ul>
          <Link className="cta-button" to="/login">Start for £50/month</Link>
          <p className="pricing-footnote">
            Comparable feature sets from legacy NPS platforms typically start
            around £1,500/month.
          </p>
        </div>
      </section>
    </div>
  )
}
