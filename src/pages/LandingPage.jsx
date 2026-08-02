import { Link } from 'react-router-dom'
import { useAuth } from '../AuthContext'
import { ClipboardIcon, ClockIcon, BoltIcon, ChartIcon } from '../icons'

const FEATURES = [
  {
    icon: <ClipboardIcon />,
    title: 'Custom NPS scorecards',
    description:
      'Build and manage as many NPS scorecards as you need, then embed them directly on your website to collect feedback from real users.',
  },
  {
    icon: <ClockIcon />,
    title: 'Time-based triggers',
    description:
      'Automatically prompt customers for feedback after a set amount of time — since signup, since last survey, or on a recurring schedule.',
  },
  {
    icon: <BoltIcon />,
    title: 'Action-based triggers',
    description:
      'Fire a survey the moment it matters — after a key action, a completed purchase, or any event in your product.',
  },
  {
    icon: <ChartIcon />,
    title: 'Every response, fully reportable',
    description:
      'All responses are stored automatically and ready to report on — track trends, segment by scorecard, and spot changes over time.',
  },
]

const STEPS = [
  {
    title: 'Create a scorecard',
    description: 'Set up an NPS scorecard in minutes and embed it anywhere on your site.',
  },
  {
    title: 'Set your triggers',
    description: 'Choose when it appears — after a time delay, or right after a key action.',
  },
  {
    title: 'Track the results',
    description: 'Every response is saved automatically, ready to report on whenever you need it.',
  },
]

export function LandingPage() {
  const { user } = useAuth()

  return (
    <div className="landing-page">
      <header className="landing-nav">
        <Link className="logo" to="/">
          <span className="logo-mark">NPS</span>
          Simple NPS
        </Link>
        <nav className="nav-links">
          <a className="nav-link" href="#features">Features</a>
          <a className="nav-link" href="#pricing">Pricing</a>
          {user ? (
            <Link className="nav-cta" to="/portal">My account</Link>
          ) : (
            <Link className="nav-cta" to="/login">Log in</Link>
          )}
        </nav>
      </header>

      <section className="hero-section">
        <div className="hero-glow" />
        <div className="hero">
          <div>
            <span className="eyebrow">NPS software for growing teams</span>
            <h1>
              Enterprise NPS software, <span className="accent-text">without the enterprise price tag</span>
            </h1>
            <p className="hero-subtitle">
              Simple NPS gives you the same core capabilities as £1,500/month
              platforms — scorecards, smart triggers, and full reporting — for
              just £50 a month.
            </p>
            <div className="hero-actions">
              <Link className="cta-button" to="/login">Get started</Link>
              <a className="cta-button secondary" href="#pricing">See pricing</a>
            </div>
            <p className="hero-note">No setup fees. Cancel any time.</p>
          </div>

          <div className="hero-visual">
            <div className="mock-card">
              <div className="mock-card-header">
                <div className="mock-dot-row">
                  <span className="mock-dot" />
                  <span className="mock-dot" />
                  <span className="mock-dot" />
                </div>
                <span className="mock-tag">Live scorecard</span>
              </div>
              <p className="mock-question">How likely are you to recommend us to a friend?</p>
              <div className="mock-scale">
                {Array.from({ length: 11 }, (_, i) => (
                  <span key={i} className={i <= 6 ? 'detractor' : i <= 8 ? 'passive' : 'promoter'}>
                    {i}
                  </span>
                ))}
              </div>
              <div className="mock-scale-labels">
                <span>Not likely</span>
                <span>Very likely</span>
              </div>
              <div className="mock-score">
                <span className="mock-score-value">+42</span>
                <span className="mock-score-label">Your NPS score, updated in real time</span>
              </div>
            </div>
            <div className="mock-badge-float">
              <ChartIcon /> Reported automatically
            </div>
          </div>
        </div>
      </section>

      <section className="section" id="features">
        <div className="section-inner">
          <div className="section-header">
            <span className="section-eyebrow">Features</span>
            <h2>Everything a £1,500/month tool has, none of the bloat</h2>
            <p>Set up scorecards, trigger them the smart way, and keep every response.</p>
          </div>
          <div className="features">
            {FEATURES.map((feature) => (
              <div className="feature-card" key={feature.title}>
                <div className="feature-icon">{feature.icon}</div>
                <h3>{feature.title}</h3>
                <p>{feature.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="section">
        <div className="section-inner">
          <div className="section-header">
            <span className="section-eyebrow">How it works</span>
            <h2>Live in minutes, not weeks</h2>
          </div>
          <div className="steps">
            {STEPS.map((step, i) => (
              <div className="step" key={step.title}>
                <div className="step-number">{i + 1}</div>
                <h3>{step.title}</h3>
                <p>{step.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="section pricing-section" id="pricing">
        <div className="section-inner">
          <div className="pricing">
            <div className="pricing-card">
              <span className="pricing-badge">Simple, honest pricing</span>
              <h2>£50<span>/month</span></h2>
              <p>Everything you need to run NPS surveys that actually get used.</p>
              <ul>
                <li><span className="check">✓</span> Unlimited NPS scorecards</li>
                <li><span className="check">✓</span> Time-based and action-based triggers</li>
                <li><span className="check">✓</span> Full response history and reporting</li>
                <li><span className="check">✓</span> Embed on any website</li>
              </ul>
              <Link className="cta-button" to="/login">Start for £50/month</Link>
              <p className="pricing-footnote">
                Comparable feature sets from legacy NPS platforms typically start
                around £1,500/month.
              </p>
            </div>
          </div>
        </div>
      </section>

      <footer className="landing-footer">
        © {new Date().getFullYear()} Simple NPS
      </footer>
    </div>
  )
}
