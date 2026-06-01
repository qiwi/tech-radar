(() => {
  // ── Theme + chroma persistence ──────────────────────────────────
  // Inline <script> in <head> applies stored prefs before paint to avoid
  // FOUC; this block handles the toggle clicks and writes back.
  const PREFS_KEY = 'aurora-prefs'
  const readPrefs = () => {
    try { return JSON.parse(localStorage.getItem(PREFS_KEY) || '{}') } catch { return {} }
  }
  const writePrefs = (p) => {
    try { localStorage.setItem(PREFS_KEY, JSON.stringify(p)) } catch {}
  }
  const applyPrefs = () => {
    const p = readPrefs()
    document.documentElement.dataset.theme  = p.theme  || 'dark'
    document.documentElement.dataset.chroma = p.chroma || 'color'
  }
  applyPrefs()
  // Single-button cycle through all 4 (theme × chroma) combinations.
  // Order keeps each step a one-axis flip, so the visual change is gradual:
  //   dark+color → dark+mono → light+mono → light+color → dark+color → …
  const MODE_CYCLE = [
    { theme: 'dark',  chroma: 'color' },
    { theme: 'dark',  chroma: 'mono'  },
    { theme: 'light', chroma: 'mono'  },
    { theme: 'light', chroma: 'color' },
  ]
  document.addEventListener('click', (e) => {
    const btn = e.target.closest && e.target.closest('[data-toggle]')
    if (!btn) return
    if (btn.dataset.toggle !== 'mode') return
    const p = readPrefs()
    const cur = MODE_CYCLE.findIndex(
      (m) => m.theme === (p.theme || 'dark') && m.chroma === (p.chroma || 'color'),
    )
    const next = MODE_CYCLE[(cur + 1) % MODE_CYCLE.length]
    writePrefs(next)
    applyPrefs()
  })

  const init = () => {
    const card = document.getElementById('hoverCard')
    if (!card) return
    const elNum  = card.querySelector('.hc-num')
    const elName = card.querySelector('.hc-name')
    const elRing = card.querySelector('.hc-ring')
    const elMove = card.querySelector('.hc-move')
    const elDesc = card.querySelector('.hc-desc')
    const blips  = document.querySelectorAll('.blip')
    const legendItems = document.querySelectorAll('.legend-ring li')
    const numToBlip = new Map()
    const numToLegend = new Map()
    blips.forEach(b => numToBlip.set(b.dataset.num, b))
    legendItems.forEach(li => {
      const num = li.querySelector('.li-num')?.textContent
      if (num) numToLegend.set(num, li)
    })

    const positionCard = (ev) => {
      if (!ev) return
      const margin = 16
      const w = card.offsetWidth || 320
      const h = card.offsetHeight || 100
      let x = ev.clientX + margin
      let y = ev.clientY + margin
      if (x + w + margin > innerWidth)  x = ev.clientX - w - margin
      if (y + h + margin > innerHeight) y = ev.clientY - h - margin
      card.style.left = Math.max(margin, x) + 'px'
      card.style.top  = Math.max(margin, y) + 'px'
    }

    const populate = (blip) => {
      elNum.textContent  = '#' + blip.dataset.num
      elName.textContent = blip.dataset.name
      elRing.textContent = blip.dataset.ring
      const moved = +blip.dataset.moved || 0
      elMove.textContent = moved > 0 ? 'moved up' : moved < 0 ? 'moved down' : ''
      elDesc.textContent = blip.dataset.desc || ''
    }

    const showCard = (blip, ev) => {
      populate(blip)
      positionCard(ev)
      card.classList.add('is-shown')
    }
    const hideCard = () => card.classList.remove('is-shown')

    const setActive = (num, on) => {
      numToBlip.get(num)?.classList.toggle('is-active', on)
      numToLegend.get(num)?.classList.toggle('is-active', on)
    }

    blips.forEach(b => {
      const link = b.parentElement
      link.addEventListener('pointerenter', e => { showCard(b, e); setActive(b.dataset.num, true) })
      link.addEventListener('pointermove',  positionCard)
      link.addEventListener('pointerleave', () => { hideCard(); setActive(b.dataset.num, false) })
      link.addEventListener('focus', () => {
        const r = link.getBoundingClientRect()
        showCard(b, { clientX: r.left + r.width/2, clientY: r.top })
        setActive(b.dataset.num, true)
      })
      link.addEventListener('blur', () => { hideCard(); setActive(b.dataset.num, false) })
    })

    // Timeline preview — hovering a dot mirrors its date into the top-right
    // meta. Pointerleave restores the page's own date.
    const meta = document.getElementById('metaDate')
    document.querySelectorAll('.tl-dot').forEach(dot => {
      const date = dot.dataset.date
      if (!date || !meta) return
      dot.addEventListener('pointerenter', () => { meta.textContent = date })
      dot.addEventListener('pointerleave', () => { meta.textContent = meta.dataset.default || '' })
      dot.addEventListener('focus',  () => { meta.textContent = date })
      dot.addEventListener('blur',   () => { meta.textContent = meta.dataset.default || '' })
    })

    legendItems.forEach(li => {
      const num = li.querySelector('.li-num')?.textContent
      if (!num) return
      li.addEventListener('pointerenter', () => setActive(num, true))
      li.addEventListener('pointerleave', () => setActive(num, false))
      li.addEventListener('click', () => {
        const blip = numToBlip.get(num)
        const link = blip?.parentElement
        const href = link?.getAttribute('href')
        // Route through go() so the legend behaves exactly like clicking the
        // blip: pushes history + swaps body (was navigate() only → stale URL).
        if (href) go(new URL(href, location.href).href)
      })
    })

    // Entry-page back arrow — prefer history.back() when we have a real prior
    // entry in the SPA stack. Otherwise fall through to the <a href="..."> path
    // which the global click listener turns into an SPA navigation. We must
    // stopPropagation so the document-level handler doesn't double-fire.
    const back = document.querySelector('.entry-title .back')
    if (back) {
      back.addEventListener('click', (e) => {
        if (history.length > 1) {
          e.preventDefault()
          e.stopPropagation()
          history.back()
        }
      })
    }
  }

  // ── SPA navigation ──────────────────────────────────────────────
  // Same-origin clicks are intercepted: fetch the target, swap <body>,
  // re-bind handlers. View Transitions API gives us a native crossfade
  // when the browser supports it (Chrome/Edge/Safari TP).
  const SPA_CACHE = new Map()
  const fetchPage = async (url) => {
    if (SPA_CACHE.has(url)) return SPA_CACHE.get(url)
    // Don't cache error responses — let navigate() fall back to a hard nav.
    const r = await fetch(url, { credentials: 'same-origin' })
    if (!r.ok) throw new Error('HTTP ' + r.status)
    const html = await r.text()
    SPA_CACHE.set(url, html)
    return html
  }

  const followMetaRefresh = (doc) => {
    const m = doc.querySelector('meta[http-equiv="refresh" i]')
    if (!m) return null
    const match = /url=([^;]+)/i.exec(m.getAttribute('content') || '')
    return match ? match[1].trim() : null
  }

  // `loadedUrl` is the URL whose body is currently mounted — independent of
  // location.href which the click handler bumps via pushState before navigate.
  let loadedUrl = location.href

  const navigate = async (url, depth = 0) => {
    if (url === loadedUrl && depth === 0) return
    if (depth > 3) { location.href = url; return }
    let html
    try { html = await fetchPage(url) } catch { location.href = url; return }
    const doc = new DOMParser().parseFromString(html, 'text/html')
    // Server-rendered redirect pages (`<scope>/index.html`) — follow chain.
    const next = followMetaRefresh(doc)
    if (next) {
      const nextUrl = new URL(next, url).href
      history.replaceState(null, '', nextUrl)
      return navigate(nextUrl, depth + 1)
    }
    const swap = () => {
      document.title = doc.title
      // Each radar emits its own per-sector palette as <style id="radar-palette">
      // because sector ids/hues differ across snapshots (e.g. 6 sectors vs 5).
      // If we don't swap it here, going from a smaller-N radar to a larger-N
      // one leaves the new sectors with undefined CSS vars → black wash.
      const oldPalette = document.getElementById('radar-palette')
      const newPalette = doc.getElementById('radar-palette')
      if (oldPalette && newPalette) {
        oldPalette.replaceWith(newPalette)
      } else if (newPalette) {
        document.head.append(newPalette)
      }
      // Replace body contents (script in <head> stays alive — IIFE already running).
      document.body.replaceChildren(...doc.body.childNodes)
      window.scrollTo(0, 0)
      init()
      loadedUrl = url
    }
    if (document.startViewTransition) {
      const t = document.startViewTransition(swap)
      try { await t.finished } catch {}
    } else {
      swap()
    }
  }

  // Single navigation entry point — push history THEN swap the body. Both
  // the document-level link handler and the legend cross-links route
  // through here so they behave identically; the legend used to call
  // navigate() directly and skip pushState, leaving the URL bar stale and
  // breaking back/refresh (different behaviour for list vs blips).
  const go = (url) => {
    history.pushState(null, '', url)
    navigate(url)
  }

  document.addEventListener('click', (e) => {
    if (e.metaKey || e.ctrlKey || e.shiftKey || e.altKey || e.button !== 0) return
    const link = e.target.closest && e.target.closest('a[href]')
    if (!link) return
    const href = link.getAttribute('href') || ''
    if (!href || href.startsWith('#') || href.startsWith('mailto:')) return
    let target
    try { target = new URL(href, location.href) } catch { return }
    if (target.origin !== location.origin) return
    e.preventDefault()
    go(target.href)
  })

  window.addEventListener('popstate', () => {
    navigate(location.href).catch(() => location.reload())
  })

  init()
})()
