import { Link } from 'react-router-dom'
import { useAuth } from '../AuthContext'
import {
  ClipboardIcon,
  ClockIcon,
  BoltIcon,
  ChartIcon,
  TargetIcon,
  MessageIcon,
  DownloadIcon,
  ChatIcon,
} from '../icons'

const FEATURES = [
  {
    icon: <ClipboardIcon />,
    title: 'Custom NPS scorecards',
    description:
      'Build as many scorecards as you need, each with its own question, accent colour, and scale labels.',
  },
  {
    icon: <ChatIcon />,
    title: 'Score-based follow-ups',
    description:
      'Promoters, passives, and detractors each get their own tailored follow-up question, automatically.',
  },
  {
    icon: <BoltIcon />,
    title: 'One-line embed',
    description:
      'A single script tag and your scorecard floats on your site — no code, no placeholder divs.',
  },
  {
    icon: <ClockIcon />,
    title: 'Respectful by default',
    description:
      'Configurable cool-down periods and custom thank-you and close messages, so visitors never feel nagged.',
  },
  {
    icon: <TargetIcon />,
    title: 'Page targeting',
    description:
      'Show a scorecard only on the pages that matter, or exclude the ones that don’t.',
  },
  {
    icon: <ChartIcon />,
    title: 'Analytics & export',
    description:
      'NPS score, promoter/passive/detractor breakdown, a weekly trend chart, and one-click CSV export.',
  },
]

const STEPS = [
  {
    title: 'Create a scorecard',
    description: 'Set the question, colour, and scale labels, then choose where it should appear.',
  },
  {
    title: 'Paste one script tag',
    description: 'Add it anywhere in your site’s HTML — the widget floats itself into position.',
  },
  {
    title: 'Watch responses come in',
    description: 'Every response is saved automatically, ready to report on whenever you need it.',
  },
]

const FAQS = [
  {
    question: 'What is NPS, exactly?',
    answer:
      'Net Promoter Score is a single-question survey — "How likely are you to recommend us?" on a 0–10 scale — used to track customer satisfaction over time. Scores of 9–10 are promoters, 7–8 are passives, and 0–6 are detractors; your NPS is the percentage of promoters minus the percentage of detractors.',
  },
  {
    question: 'Do I need to write any code to install it?',
    answer:
      'No. Copy one script tag from the Embed Code tab and paste it anywhere in your site’s HTML. The scorecard floats itself into the corner you’ve chosen — no placeholder elements or extra markup needed.',
  },
  {
    question: 'Can I change how the widget looks and behaves?',
    answer:
      'Yes — question wording, scale labels, accent colour, position, thank-you and close messages, follow-up questions per score type, and how many days to wait before showing it to the same visitor again are all configurable per scorecard.',
  },
  {
    question: 'Can I control which pages it shows on?',
    answer:
      'Yes. Each scorecard can be restricted to only show on pages containing specific text in the URL, or excluded from pages you don’t want it on.',
  },
  {
    question: 'What happens to the feedback people leave?',
    answer:
      'Every response — score, comment, optional name and email, and the page it came from — is stored against the scorecard it belongs to. You can track its status, add internal notes, and export everything to CSV at any time.',
  },
  {
    question: 'Is there a contract, or can I cancel any time?',
    answer: 'No contracts, no setup fees. Cancel whenever you like.',
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
          <a className="nav-link" href="#faq">FAQ</a>
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
              platforms — scorecards, smart follow-ups, and full reporting — for
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
            <p>Set up scorecards, ask the right follow-up, and keep every response.</p>
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

      <section className="section deepdive-section">
        <div className="section-inner">
          <div className="deepdive-row">
            <div className="deepdive-content">
              <span className="section-eyebrow">Scorecards</span>
              <h2>A scorecard for every moment that matters</h2>
              <p>
                Run one scorecard or a dozen — a homepage NPS check, a post-purchase
                survey, a support follow-up. Each has its own question, accent
                colour, and scale labels, so it always feels on-brand.
              </p>
              <ul className="deepdive-list">
                <li><span className="check">✓</span> Unlimited scorecards per account</li>
                <li><span className="check">✓</span> Custom question and scale labels</li>
                <li><span className="check">✓</span> Brand-matched accent colour</li>
                <li><span className="check">✓</span> Live preview while you edit</li>
              </ul>
            </div>
            <div className="deepdive-visual">
              <div className="mini-list-card">
                <div className="mini-list-row">
                  <span className="mini-dot" style={{ background: '#7c3aed' }} />
                  <div>
                    <strong>Homepage feedback</strong>
                    <span>+42 NPS · 128 responses</span>
                  </div>
                </div>
                <div className="mini-list-row">
                  <span className="mini-dot" style={{ background: '#ec4899' }} />
                  <div>
                    <strong>Post-purchase survey</strong>
                    <span>+58 NPS · 64 responses</span>
                  </div>
                </div>
                <div className="mini-list-row">
                  <span className="mini-dot" style={{ background: '#f59e0b' }} />
                  <div>
                    <strong>Support follow-up</strong>
                    <span>+21 NPS · 39 responses</span>
                  </div>
                </div>
              </div>
            </div>
          </div>

          <div className="deepdive-row reverse">
            <div className="deepdive-content">
              <span className="section-eyebrow">Installation</span>
              <h2>Live on your site in one line</h2>
              <p>
                Copy a single script tag and paste it anywhere in your HTML. The
                widget finds its own way to the corner you picked — no placeholder
                elements, no build step, no developer required.
              </p>
              <ul className="deepdive-list">
                <li><span className="check">✓</span> One script tag, nothing else</li>
                <li><span className="check">✓</span> Floats bottom-left, middle, or right</li>
                <li><span className="check">✓</span> Works on any website or platform</li>
                <li><span className="check">✓</span> Pass a visitor's name/email automatically</li>
              </ul>
            </div>
            <div className="deepdive-visual">
              <div className="browser-mock">
                <div className="browser-mock-bar">
                  <span className="mock-dot" /><span className="mock-dot" /><span className="mock-dot" />
                </div>
                <div className="browser-mock-body">
                  <div className="browser-mock-widget">
                    <span>9</span>
                    <span className="browser-mock-widget-line" />
                  </div>
                </div>
              </div>
            </div>
          </div>

          <div className="deepdive-row">
            <div className="deepdive-content">
              <span className="section-eyebrow">Respectful UX</span>
              <h2>Ask once, not on every visit</h2>
              <p>
                Write your own thank-you message and a message for when someone
                closes the widget without answering — then set how many days to
                wait before showing it to that same visitor again.
              </p>
              <ul className="deepdive-list">
                <li><span className="check">✓</span> Custom thank-you message</li>
                <li><span className="check">✓</span> Custom message on close</li>
                <li><span className="check">✓</span> Cool-down after a submission</li>
                <li><span className="check">✓</span> Separate cool-down after a dismiss</li>
              </ul>
            </div>
            <div className="deepdive-visual">
              <div className="bubble-stack">
                <div className="chat-bubble">Thanks for your feedback! 🎉</div>
                <div className="chat-bubble muted">No worries — maybe next time!</div>
                <div className="bubble-hint"><ClockIcon /> Won't ask again for 90 days</div>
              </div>
            </div>
          </div>

          <div className="deepdive-row reverse">
            <div className="deepdive-content">
              <span className="section-eyebrow">Reporting</span>
              <h2>See what people really think</h2>
              <p>
                Every response is stored with its score, comment, optional name
                and email, and the page it came from. Track a status, add a note,
                and watch your NPS trend week over week — for one scorecard or
                every scorecard combined.
              </p>
              <ul className="deepdive-list">
                <li><span className="check">✓</span> Weekly NPS trend chart</li>
                <li><span className="check">✓</span> Promoter / passive / detractor split</li>
                <li><span className="check">✓</span> Status &amp; internal notes per response</li>
                <li><span className="check">✓</span> One-click CSV export</li>
              </ul>
            </div>
            <div className="deepdive-visual">
              <div className="analytics-mock">
                <div className="analytics-mock-stat">
                  <span>NPS score</span>
                  <strong>+42</strong>
                </div>
                <div className="analytics-mock-bars">
                  <span style={{ height: '30%' }} />
                  <span style={{ height: '55%' }} />
                  <span style={{ height: '40%' }} />
                  <span style={{ height: '70%' }} />
                  <span style={{ height: '60%' }} />
                  <span style={{ height: '85%' }} />
                </div>
                <div className="analytics-mock-footer">
                  <DownloadIcon /> Export CSV
                </div>
              </div>
            </div>
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
                <li><span className="check">✓</span> Score-based follow-up questions</li>
                <li><span className="check">✓</span> Page targeting &amp; display frequency controls</li>
                <li><span className="check">✓</span> Full response history, analytics &amp; CSV export</li>
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

      <section className="section" id="faq">
        <div className="section-inner">
          <div className="section-header">
            <span className="section-eyebrow">FAQ</span>
            <h2>Questions, answered</h2>
          </div>
          <div className="faq-list">
            {FAQS.map((faq) => (
              <details className="faq-item" key={faq.question}>
                <summary>
                  {faq.question}
                  <span className="faq-toggle">+</span>
                </summary>
                <p>{faq.answer}</p>
              </details>
            ))}
          </div>
        </div>
      </section>

      <section className="section cta-banner-section">
        <div className="section-inner cta-banner">
          <MessageIcon />
          <h2>Start hearing from your customers today</h2>
          <p>Set up your first scorecard in minutes. No setup fees, cancel any time.</p>
          <Link className="cta-button" to="/login">Get started for £50/month</Link>
        </div>
      </section>

      <footer className="landing-footer">
        <div className="footer-inner">
          <span className="logo">
            <span className="logo-mark">NPS</span>
            Simple NPS
          </span>
          <nav className="footer-links">
            <a href="#features">Features</a>
            <a href="#faq">FAQ</a>
            <a href="#pricing">Pricing</a>
            <Link to="/login">Log in</Link>
          </nav>
          <span className="footer-copyright">© {new Date().getFullYear()} Simple NPS</span>
        </div>
      </footer>
    </div>
  )
}
