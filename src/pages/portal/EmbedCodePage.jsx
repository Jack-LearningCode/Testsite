import { useState } from 'react'
import { useOutletContext } from 'react-router-dom'

export function EmbedCodePage() {
  const { scorecard } = useOutletContext()
  const [copied, setCopied] = useState(false)

  const snippet = `<script\n  src="${window.location.origin}/embed.js"\n  data-scorecard-id="${scorecard.id}"\n  async\n></script>`

  async function handleCopy() {
    await navigator.clipboard.writeText(snippet)
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }

  return (
    <div className="embed-page">
      <p className="field-hint">
        Paste this snippet anywhere in your website's HTML — it doesn't matter
        where, the scorecard floats in the corner you chose on the Edit tab.
      </p>

      <div className="code-block">
        <pre>{snippet}</pre>
        <button className="cta-button secondary code-copy" onClick={handleCopy}>
          {copied ? 'Copied!' : 'Copy'}
        </button>
      </div>

      <p className="field-hint">
        Already know who's viewing your page? Pass their details along so
        they don't have to type them in:
      </p>

      <div className="code-block">
        <pre>{`<script\n  src="${window.location.origin}/embed.js"\n  data-scorecard-id="${scorecard.id}"\n  data-name="Jane Doe"\n  data-email="jane@example.com"\n  async\n></script>`}</pre>
      </div>
    </div>
  )
}
