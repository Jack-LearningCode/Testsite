import { useState } from 'react'
import { useOutletContext } from 'react-router-dom'
import { supabase } from '../../supabaseClient'

export function ScorecardEditPage() {
  const { scorecard, setScorecard } = useOutletContext()

  const [form, setForm] = useState({
    name: scorecard.name,
    question: scorecard.question,
    color: scorecard.color,
    low_label: scorecard.low_label,
    high_label: scorecard.high_label,
    position: scorecard.position,
    thank_you_message: scorecard.thank_you_message,
    dismiss_message: scorecard.dismiss_message,
    repeat_after_days: scorecard.repeat_after_days,
    dismiss_snooze_days: scorecard.dismiss_snooze_days,
  })
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState(null)
  const [saved, setSaved] = useState(false)

  function updateField(field, value) {
    setForm((current) => ({ ...current, [field]: value }))
    setSaved(false)
  }

  async function handleSubmit(e) {
    e.preventDefault()
    setSaving(true)
    setError(null)

    const { data, error } = await supabase
      .from('scorecards')
      .update({
        ...form,
        repeat_after_days: Number(form.repeat_after_days),
        dismiss_snooze_days: Number(form.dismiss_snooze_days),
      })
      .eq('id', scorecard.id)
      .select()
      .single()

    setSaving(false)

    if (error) {
      setError(error.message)
      return
    }

    setScorecard(data)
    setSaved(true)
  }

  return (
    <form className="settings-form" onSubmit={handleSubmit}>
      <div className="field">
        <label htmlFor="name">Scorecard name</label>
        <input
          id="name"
          type="text"
          value={form.name}
          onChange={(e) => updateField('name', e.target.value)}
          required
        />
        <p className="field-hint">For your own reference — not shown to end users.</p>
      </div>

      <div className="field">
        <label htmlFor="question">Question</label>
        <textarea
          id="question"
          rows={2}
          value={form.question}
          onChange={(e) => updateField('question', e.target.value)}
          required
        />
      </div>

      <div className="field-row">
        <div className="field">
          <label htmlFor="low_label">Low-end label</label>
          <input
            id="low_label"
            type="text"
            value={form.low_label}
            onChange={(e) => updateField('low_label', e.target.value)}
            required
          />
        </div>
        <div className="field">
          <label htmlFor="high_label">High-end label</label>
          <input
            id="high_label"
            type="text"
            value={form.high_label}
            onChange={(e) => updateField('high_label', e.target.value)}
            required
          />
        </div>
      </div>

      <div className="field">
        <label htmlFor="color">Accent colour</label>
        <div className="color-field">
          <input
            id="color"
            type="color"
            value={form.color}
            onChange={(e) => updateField('color', e.target.value)}
          />
          <span>{form.color}</span>
        </div>
      </div>

      <div className="field">
        <label>Widget position</label>
        <div className="segmented-control">
          {[
            { value: 'bottom-left', label: 'Bottom left' },
            { value: 'bottom-middle', label: 'Bottom middle' },
            { value: 'bottom-right', label: 'Bottom right' },
          ].map((option) => (
            <button
              key={option.value}
              type="button"
              className={form.position === option.value ? 'active' : ''}
              onClick={() => updateField('position', option.value)}
            >
              {option.label}
            </button>
          ))}
        </div>
        <p className="field-hint">Where the floating scorecard appears on your website.</p>
      </div>

      <h2 className="form-section-title">Messages</h2>

      <div className="field">
        <label htmlFor="thank_you_message">Thank you message</label>
        <textarea
          id="thank_you_message"
          rows={2}
          value={form.thank_you_message}
          onChange={(e) => updateField('thank_you_message', e.target.value)}
          required
        />
        <p className="field-hint">Shown after someone submits feedback.</p>
      </div>

      <div className="field">
        <label htmlFor="dismiss_message">Message on close</label>
        <textarea
          id="dismiss_message"
          rows={2}
          value={form.dismiss_message}
          onChange={(e) => updateField('dismiss_message', e.target.value)}
        />
        <p className="field-hint">
          Shown briefly if someone closes the widget without submitting. Leave blank to close immediately with no message.
        </p>
      </div>

      <h2 className="form-section-title">Display frequency</h2>

      <div className="field-row">
        <div className="field">
          <label htmlFor="repeat_after_days">Days before showing again after a submission</label>
          <input
            id="repeat_after_days"
            type="number"
            min={1}
            value={form.repeat_after_days}
            onChange={(e) => updateField('repeat_after_days', e.target.value)}
            required
          />
        </div>
        <div className="field">
          <label htmlFor="dismiss_snooze_days">Days before showing again after being closed</label>
          <input
            id="dismiss_snooze_days"
            type="number"
            min={1}
            value={form.dismiss_snooze_days}
            onChange={(e) => updateField('dismiss_snooze_days', e.target.value)}
            required
          />
        </div>
      </div>
      <p className="field-hint">
        Each visitor is remembered in their own browser, so they won't be asked again until these cool-down periods pass.
      </p>

      <div className="preview-block">
        <p className="field-hint">Preview</p>
        <div className="mock-card">
          <p className="mock-question">{form.question}</p>
          <div className="mock-scale">
            {Array.from({ length: 11 }, (_, i) => (
              <span key={i} className={i <= 6 ? 'detractor' : i <= 8 ? 'passive' : 'promoter-preview'} style={i >= 9 ? { background: form.color, color: '#fff', borderColor: form.color } : undefined}>
                {i}
              </span>
            ))}
          </div>
          <div className="mock-scale-labels">
            <span>{form.low_label}</span>
            <span>{form.high_label}</span>
          </div>
        </div>
      </div>

      {error && <p className="error-message">{error}</p>}
      {saved && <p className="status-message">Saved.</p>}

      <button className="cta-button" type="submit" disabled={saving}>
        {saving ? 'Saving...' : 'Save changes'}
      </button>
    </form>
  )
}
