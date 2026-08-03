/*
 * Simple NPS embeddable widget.
 * Add a single <script src="…/embed.js" data-scorecard-id="SCORECARD_ID" async>
 * tag anywhere on your page — the scorecard floats in the corner configured
 * for that scorecard.
 */
(function () {
  // Captured synchronously so it still resolves correctly even with `async`.
  var thisScript = document.currentScript

  // Publishable (anon) Supabase credentials — safe to expose publicly,
  // access is enforced by Row Level Security on the database side.
  var SUPABASE_URL = 'https://cwpyhcvqvazbboervbky.supabase.co'
  var SUPABASE_KEY = 'sb_publishable_jKAqrHdWIv4LL_qUDHf5uA_T8GATTMW'

  var STYLE_ID = 'simple-nps-styles'
  var DAY_MS = 24 * 60 * 60 * 1000

  var POSITION_STYLES = {
    'bottom-left': { left: '20px', bottom: '20px' },
    'bottom-middle': { left: '50%', bottom: '20px', transform: 'translateX(-50%)' },
    'bottom-right': { right: '20px', bottom: '20px' },
  }

  // Per-visitor "don't show again until" tracking, kept in this browser's
  // localStorage — there's no logged-in visitor to key this to server-side.
  function storageKey(scorecardId) {
    return 'simple_nps_hide_until_' + scorecardId
  }

  function getHideUntil(scorecardId) {
    try {
      var raw = window.localStorage.getItem(storageKey(scorecardId))
      return raw ? Number(raw) : 0
    } catch (e) {
      return 0
    }
  }

  function setHideUntil(scorecardId, timestamp) {
    try {
      window.localStorage.setItem(storageKey(scorecardId), String(timestamp))
    } catch (e) {
      // localStorage unavailable (e.g. private browsing) — fail silently,
      // the widget just won't remember this visitor next time.
    }
  }

  function npsCategory(score) {
    if (score <= 6) return 'detractor'
    if (score <= 8) return 'passive'
    return 'promoter'
  }

  function followupPrompt(scorecard, score) {
    var category = npsCategory(score)
    if (category === 'promoter') return scorecard.promoter_followup_prompt
    if (category === 'passive') return scorecard.passive_followup_prompt
    return scorecard.detractor_followup_prompt
  }

  function parsePatterns(text) {
    return (text || '')
      .split('\n')
      .map(function (line) {
        return line.trim()
      })
      .filter(Boolean)
  }

  function matchesTargeting(scorecard) {
    var url = window.location.href
    var includes = parsePatterns(scorecard.include_paths)
    var excludes = parsePatterns(scorecard.exclude_paths)

    if (includes.length && !includes.some(function (p) { return url.indexOf(p) !== -1 })) {
      return false
    }
    if (excludes.some(function (p) { return url.indexOf(p) !== -1 })) {
      return false
    }
    return true
  }

  function injectStyles() {
    if (document.getElementById(STYLE_ID)) return
    var style = document.createElement('style')
    style.id = STYLE_ID
    style.textContent =
      '.snps-container{position:fixed;z-index:2147483000;font-family:system-ui,' +
      '-apple-system,"Segoe UI",Roboto,sans-serif;}' +
      '.snps-widget{position:relative;width:340px;max-width:calc(100vw - 24px);' +
      'border:1px solid #e5e4e7;border-radius:14px;padding:20px;' +
      'background:#fff;color:#1c1917;box-sizing:border-box;' +
      'box-shadow:0 20px 40px -12px rgba(0,0,0,0.25);}' +
      '.snps-widget *{box-sizing:border-box;}' +
      '.snps-close{position:absolute;top:10px;right:10px;width:22px;height:22px;' +
      'border:none;background:transparent;color:#a8a29e;font-size:16px;line-height:1;' +
      'cursor:pointer;padding:0;}' +
      '.snps-close:hover{color:#1c1917;}' +
      '.snps-question{font-size:15px;font-weight:600;margin:0 24px 14px 0;}' +
      '.snps-scale{display:grid;grid-template-columns:repeat(11,minmax(0,1fr));gap:4px;margin-bottom:8px;}' +
      '.snps-scale button{aspect-ratio:1;border-radius:6px;border:1px solid #e5e4e7;' +
      'background:#faf9fb;font-size:11px;font-weight:700;cursor:pointer;color:#1c1917;padding:0;}' +
      '.snps-scale button.selected{color:#fff;border-color:transparent;}' +
      '.snps-scale-labels{display:flex;justify-content:space-between;font-size:11px;color:#6b6375;margin-bottom:14px;}' +
      '.snps-field{margin-bottom:10px;}' +
      '.snps-field label{display:block;font-size:12px;font-weight:600;margin-bottom:4px;}' +
      '.snps-field input,.snps-field textarea{width:100%;padding:8px 10px;border-radius:8px;' +
      'border:1px solid #e5e4e7;font-size:13px;font-family:inherit;}' +
      '.snps-submit{border:none;color:#fff;font-weight:600;font-size:14px;padding:10px 18px;' +
      'border-radius:999px;cursor:pointer;margin-top:4px;}' +
      '.snps-submit:disabled{opacity:0.6;cursor:default;}' +
      '.snps-message{font-size:14px;margin:0;padding-right:20px;}' +
      '.snps-error{font-size:12px;color:#e11d48;margin-top:6px;}'
    document.head.appendChild(style)
  }

  function el(tag, props, children) {
    var node = document.createElement(tag)
    if (props) {
      Object.keys(props).forEach(function (key) {
        if (key === 'style') Object.assign(node.style, props.style)
        else node[key] = props[key]
      })
    }
    ;(children || []).forEach(function (child) {
      node.appendChild(child)
    })
    return node
  }

  function fetchScorecard(id) {
    var url = SUPABASE_URL + '/rest/v1/scorecard_public?id=eq.' + encodeURIComponent(id) + '&select=*'
    return fetch(url, {
      headers: { apikey: SUPABASE_KEY, Authorization: 'Bearer ' + SUPABASE_KEY },
    })
      .then(function (res) {
        if (!res.ok) throw new Error('Could not load scorecard')
        return res.json()
      })
      .then(function (rows) {
        if (!rows.length) throw new Error('Scorecard not found')
        return rows[0]
      })
  }

  function submitResponse(payload) {
    return fetch(SUPABASE_URL + '/rest/v1/responses', {
      method: 'POST',
      headers: {
        apikey: SUPABASE_KEY,
        Authorization: 'Bearer ' + SUPABASE_KEY,
        'Content-Type': 'application/json',
        Prefer: 'return=minimal',
      },
      body: JSON.stringify(payload),
    }).then(function (res) {
      if (!res.ok) throw new Error('Could not submit response')
    })
  }

  function renderWidget(scorecard, presetName, presetEmail) {
    injectStyles()

    var positionStyle = POSITION_STYLES[scorecard.position] || POSITION_STYLES['bottom-right']
    var container = el('div', { className: 'snps-container', style: positionStyle })

    var widget = el('div', { className: 'snps-widget' })

    var closeBtn = el('button', { type: 'button', className: 'snps-close', innerHTML: '&times;', title: 'Close' })
    closeBtn.addEventListener('click', function () {
      setHideUntil(scorecard.id, Date.now() + scorecard.dismiss_snooze_days * DAY_MS)

      if (scorecard.dismiss_message) {
        widget.innerHTML = ''
        widget.appendChild(el('p', { className: 'snps-message', textContent: scorecard.dismiss_message }))
        setTimeout(function () {
          container.remove()
        }, 2500)
      } else {
        container.remove()
      }
    })

    var question = el('p', { className: 'snps-question', textContent: scorecard.question })
    var scale = el('div', { className: 'snps-scale' })
    var labels = el('div', { className: 'snps-scale-labels' }, [
      el('span', { textContent: scorecard.low_label }),
      el('span', { textContent: scorecard.high_label }),
    ])

    var selectedScore = null
    var buttons = []

    for (var i = 0; i <= 10; i++) {
      ;(function (score) {
        var btn = el('button', { type: 'button', textContent: String(score) })
        btn.addEventListener('click', function () {
          selectedScore = score
          buttons.forEach(function (b) {
            b.classList.remove('selected')
            b.style.background = ''
            b.style.color = ''
          })
          btn.classList.add('selected')
          btn.style.background = scorecard.color
          showForm()
        })
        buttons.push(btn)
        scale.appendChild(btn)
      })(i)
    }

    widget.appendChild(closeBtn)
    widget.appendChild(question)
    widget.appendChild(scale)
    widget.appendChild(labels)
    container.appendChild(widget)
    document.body.appendChild(container)

    var formWrapper = null

    function showForm() {
      if (formWrapper) return

      formWrapper = el('div')

      var nameField = null
      var emailField = null

      if (!presetName) {
        var nameInput = el('input', { type: 'text', placeholder: 'Jane Doe' })
        nameField = el('div', { className: 'snps-field' }, [
          el('label', { textContent: 'Name (optional)' }),
          nameInput,
        ])
        formWrapper.appendChild(nameField)
      }

      if (!presetEmail) {
        var emailInput = el('input', { type: 'email', placeholder: 'jane@example.com' })
        emailField = el('div', { className: 'snps-field' }, [
          el('label', { textContent: 'Email (optional)' }),
          emailInput,
        ])
        formWrapper.appendChild(emailField)
      }

      var commentInput = el('textarea', { rows: 3, placeholder: 'Optional' })
      var commentField = el('div', { className: 'snps-field' }, [
        el('label', { textContent: followupPrompt(scorecard, selectedScore) }),
        commentInput,
      ])
      formWrapper.appendChild(commentField)

      var errorMsg = el('p', { className: 'snps-error' })
      errorMsg.style.display = 'none'

      var submitBtn = el('button', { type: 'button', className: 'snps-submit', textContent: 'Submit feedback' })
      submitBtn.style.background = scorecard.color
      submitBtn.addEventListener('click', function () {
        submitBtn.disabled = true
        errorMsg.style.display = 'none'

        submitResponse({
          scorecard_id: scorecard.id,
          score: selectedScore,
          name: presetName || (nameField ? nameField.querySelector('input').value : null) || null,
          email: presetEmail || (emailField ? emailField.querySelector('input').value : null) || null,
          comment: commentInput.value || null,
          page_url: window.location.href,
        })
          .then(function () {
            setHideUntil(scorecard.id, Date.now() + scorecard.repeat_after_days * DAY_MS)
            widget.innerHTML = ''
            widget.appendChild(closeBtn)
            widget.appendChild(el('p', { className: 'snps-message', textContent: scorecard.thank_you_message }))
          })
          .catch(function () {
            submitBtn.disabled = false
            errorMsg.textContent = 'Something went wrong. Please try again.'
            errorMsg.style.display = 'block'
          })
      })

      formWrapper.appendChild(submitBtn)
      formWrapper.appendChild(errorMsg)
      widget.appendChild(formWrapper)
    }
  }

  function init() {
    if (!thisScript) return
    var scorecardId = thisScript.getAttribute('data-scorecard-id')
    if (!scorecardId) {
      console.error('[Simple NPS] Missing data-scorecard-id on the embed script tag.')
      return
    }

    if (Date.now() < getHideUntil(scorecardId)) return

    var presetName = thisScript.getAttribute('data-name')
    var presetEmail = thisScript.getAttribute('data-email')

    fetchScorecard(scorecardId)
      .then(function (scorecard) {
        if (!matchesTargeting(scorecard)) return
        renderWidget(scorecard, presetName, presetEmail)
      })
      .catch(function (err) {
        console.error('[Simple NPS]', err.message)
      })
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init)
  } else {
    init()
  }
})()
