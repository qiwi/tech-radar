import {
  CENTER,
  QUADRANTS,
  RINGS,
  SIZE,
  arcPath,
  layoutRadar,
  sectorPath,
} from './geometry.js'

const escape = (s = '') =>
  String(s)
    .replaceAll('&', '&amp;')
    .replaceAll('<', '&lt;')
    .replaceAll('>', '&gt;')
    .replaceAll('"', '&quot;')
    .replaceAll("'", '&#39;')

/** Inline-runs before the stylesheet — applies saved theme/chroma to <html>
 *  so we don't flash the default palette on a fresh load. */
const THEME_BOOT = `<script>try{var p=JSON.parse(localStorage.getItem('aurora-prefs')||'{}');var h=document.documentElement;h.dataset.theme=p.theme||'dark';h.dataset.chroma=p.chroma||'color';}catch(e){}</script>`

/** Path-safe entry slug: keep the original name (matches zalando backend),
 *  only strip path separators that would break the directory layout.
 *  Exported so the renderer entry can share the same definition. */
export const entrySlug = (name) => String(name).replaceAll(/[/\\]/g, '-').trim()
const entryHref = (name) => encodeURIComponent(entrySlug(name))

/** Render a single radar SVG (full viewBox). */
const renderSvg = (radar, entries) => {
  // Per-quadrant radial gradients — each quadrant gets its own hue, glowing
  // from the centre outward. Alpha is baked into the stop colours so the
  // theme can swap between a saturated mid-light "ink on dark" wash and a
  // pastel "watercolour on paper" wash without touching SVG attributes.
  const defs = QUADRANTS.map(
    (q) => `
      <radialGradient id="grad-${q.id}" cx="50%" cy="50%" r="50%">
        <stop offset="0%"   stop-color="var(--${q.id}-grad-0)"/>
        <stop offset="100%" stop-color="var(--${q.id}-grad-1)"/>
      </radialGradient>`,
  ).join('')

  const sectors = QUADRANTS.flatMap((q, qIdx) =>
    RINGS.map(
      (r, rIdx) =>
        `<path d="${sectorPath(qIdx, rIdx)}" fill="url(#grad-${q.id})"
              fill-opacity="${(0.98 - rIdx * 0.16).toFixed(2)}"
              class="sector" data-q="${q.id}" data-r="${r.id}"/>`,
    ),
  ).join('')

  // Ring boundary circles (subtle glow)
  const rings = RINGS.map(
    (r) =>
      `<circle cx="${CENTER}" cy="${CENTER}" r="${r.outer}" class="ring-line"/>`,
  ).join('')

  // Quadrant divider lines (cross axes)
  const dividers = `
    <line x1="${CENTER}" y1="20" x2="${CENTER}" y2="${SIZE - 20}" class="axis"/>
    <line x1="20" y1="${CENTER}" x2="${SIZE - 20}" y2="${CENTER}" class="axis"/>`

  // Ring labels — text along an arc at the radial midpoint of each ring,
  // centred on top (-π/2). The arc must be long enough to fit the longest
  // label at its radius — for the inner (ADOPT) ring this means a wider
  // angular spread, otherwise textPath silently truncates ("DOP" bug).
  // Span scales with 1/radius so the on-screen chord length is roughly
  // constant across rings (≈ 130–150 px → enough for "ADOPT" w/ tracking).
  const ringLabels = RINGS.map((r, rIdx) => {
    const arcId = `arc-ring-${r.id}`
    const labelRadius =
      rIdx === 0
        ? r.outer / 2
        : (RINGS[rIdx - 1].outer + r.outer) / 2
    // 140 px chord ÷ radius → half-angle (radians). Clamp so outer rings
    // don't end up with an absurdly tiny spread.
    const half = Math.max(0.18, Math.min(0.9, 70 / labelRadius))
    return `
      <defs><path id="${arcId}" d="${arcPath(-Math.PI / 2 - half, -Math.PI / 2 + half, labelRadius)}"/></defs>
      <text class="ring-label" data-r="${r.id}">
        <textPath href="#${arcId}" startOffset="50%" text-anchor="middle">${r.label}</textPath>
      </text>`
  }).join('')

  // Quadrant titles in the four corners of the SVG, anchored toward the
  // radar centre so long names lean inward and stay within viewBox.
  const quadCorners = {
    q1: { x: SIZE - 24, y: SIZE - 24, anchor: 'end',   baseline: 'auto' },     // bottom-right
    q2: { x: 24,        y: SIZE - 24, anchor: 'start', baseline: 'auto' },     // bottom-left
    q3: { x: 24,        y: 24,        anchor: 'start', baseline: 'hanging' },  // top-left
    q4: { x: SIZE - 24, y: 24,        anchor: 'end',   baseline: 'hanging' },  // top-right
  }
  const quadLabels = QUADRANTS.map((q) => {
    const c = quadCorners[q.id]
    const title = radar.document.quadrantTitles[q.id] || q.id.toUpperCase()
    return `<text class="quad-label" x="${c.x}" y="${c.y}"
      text-anchor="${c.anchor}" dominant-baseline="${c.baseline}"
      fill="var(--${q.id}-accent)">${escape(title)}</text>`
  }).join('')

  // Entries — circle + number, wrapped in <a> linking to detail page
  // Blip shape encodes movement: triangle up (moved=1), down (moved=-1),
  // circle (no move). Shape is stroke-only (outline + number in the
  // sector's accent colour, fill in the page background) — keeps numbers
  // legible against the sector gradients.
  const blipShape = (moved, r, cls) => {
    if (moved > 0) {
      return `<path class="${cls}" d="M 0 -${r} L ${(r * 0.95).toFixed(1)} ${(r * 0.62).toFixed(1)} L -${(r * 0.95).toFixed(1)} ${(r * 0.62).toFixed(1)} Z"/>`
    }
    if (moved < 0) {
      return `<path class="${cls}" d="M 0 ${r} L ${(r * 0.95).toFixed(1)} -${(r * 0.62).toFixed(1)} L -${(r * 0.95).toFixed(1)} -${(r * 0.62).toFixed(1)} Z"/>`
    }
    return `<circle class="${cls}" r="${r}"/>`
  }

  const blips = entries
    .map((e) => {
      // CSS color = quadrant accent (from theme tokens) → drives stroke,
      // number fill and drop-shadow glow via currentColor inheritance.
      const numDy = e.moved > 0 ? 6 : e.moved < 0 ? 2 : 4
      // Entry pages live next to the radar page (not at dist root).
      const href = `entries/${e.quadrant}/${entryHref(e.name)}/`
      return `
        <a href="${href}" class="blip-link" tabindex="0">
          <g class="blip" data-q="${e.quadrant}" data-r="${e.ring}" data-num="${e.num}"
             transform="translate(${e.x.toFixed(1)} ${e.y.toFixed(1)})"
             data-name="${escape(e.name)}"
             data-desc="${escape(e.description || '')}"
             data-ring="${escape(e.ring.toUpperCase())}"
             data-moved="${e.moved}">
            ${blipShape(e.moved, 14, 'blip-fg')}
            <text class="blip-num" text-anchor="middle" dy="${numDy}">${e.num}</text>
          </g>
        </a>`
    })
    .join('')

  return `
<svg viewBox="0 0 ${SIZE} ${SIZE}" xmlns="http://www.w3.org/2000/svg" class="radar-svg" role="img" aria-label="Tech radar">
  <defs>${defs}</defs>
  <g class="radar-sectors">${sectors}</g>
  <g class="radar-rings">${rings}${dividers}</g>
  <g class="radar-labels">${ringLabels}${quadLabels}</g>
  <g class="radar-blips">${blips}</g>
</svg>`
}

/** Timeline strip — range covers full calendar years that contain data
 *  (Jan 1 minYear → Jan 1 maxYear+1). Snapshot dots sit at their real
 *  day-of-year offset; year labels are separate ticks on the line.
 *  Always renders the empty container so radar-page height stays stable
 *  across scopes with different snapshot counts. */
const renderTimeline = (timeline, currentDate) => {
  if (timeline.length <= 1) {
    return '<nav class="timeline" aria-label="Snapshot timeline"><div class="tl-items"></div></nav>'
  }
  const sorted = timeline.toSorted(
    (a, b) => Date.parse(a.date) - Date.parse(b.date),
  )
  const minYear = Number(String(sorted[0].date).slice(0, 4))
  const maxYear = Number(String(sorted[sorted.length - 1].date).slice(0, 4))
  const minTs = Date.UTC(minYear, 0, 1)
  const maxTs = Date.UTC(maxYear + 1, 0, 1)
  const span = maxTs - minTs

  const yearTicks = []
  for (let y = minYear; y <= maxYear; y++) {
    const p = (Date.UTC(y, 0, 1) - minTs) / span
    yearTicks.push(
      `<span class="tl-year-tick" style="--p:${p.toFixed(4)}">${y}</span>`,
    )
  }

  const dots = sorted
    .map((t) => {
      const p = (Date.parse(t.date) - minTs) / span
      const cls = t.date === currentDate ? 'tl-dot tl-dot--current' : 'tl-dot'
      const href = `../${encodeURIComponent(t.date)}/`
      return `
        <a class="${cls}" href="${href}" style="--p:${p.toFixed(4)}"
           data-date="${escape(t.date)}" aria-label="${escape(t.date)}">
          <span class="tl-marker"></span>
        </a>`
    })
    .join('')

  return `
    <nav class="timeline" aria-label="Snapshot timeline">
      <div class="tl-items">${dots}${yearTicks.join('')}</div>
    </nav>`
}

/** Sidebar with all entries grouped by quadrant + ring.
 *  `credits` toggles the generator-credit footer under the panel.
 *  `aboutHref`, when set, renders a small "About" link with a `?` icon
 *  between the panel and the credit — independent of `credits` since
 *  About is navigation, not branding. */
const renderLegend = (radar, entries, { credits = true, aboutHref = null } = {}) => {
  const groups = QUADRANTS.map((q) => {
    const title = radar.document.quadrantTitles[q.id] || q.id.toUpperCase()
    const inQuad = entries.filter((e) => e.quadrant === q.id)
    const ringGroups = RINGS.map((r) => {
      const inRing = inQuad.filter((e) => e.ring === r.id)
      if (!inRing.length) return ''
      const lis = inRing
        .map(
          (e) =>
            `<li><span class="li-num">${e.num}</span><span class="li-name">${escape(e.name)}</span>${
              e.moved > 0
                ? '<span class="li-move li-move--up">▲</span>'
                : e.moved < 0
                  ? '<span class="li-move li-move--down">▼</span>'
                  : ''
            }</li>`,
        )
        .join('')
      return `
        <div class="legend-ring legend-ring--${r.id}">
          <h4>${r.label}</h4>
          <ul>${lis}</ul>
        </div>`
    }).join('')
    return `
      <section class="legend-quad" data-q="${q.id}">
        <h3>${escape(title)}</h3>
        ${ringGroups}
      </section>`
  }).join('')
  // Footer row sits OUTSIDE the scrollable legend panel. Single line
  // containing (optional) About `?` pill on the left and (optional) credit
  // text on the right. Footer suppressed entirely when both are absent.
  const aboutLink = aboutHref
    ? `<a class="legend-about" href="${aboutHref}" aria-label="About this radar">?</a>`
    : ''
  const credit = credits
    ? `<span class="legend-credit">QIWI <span class="heart">❤</span> <a href="https://github.com/qiwi/tech-radar" target="_blank" rel="noopener">Open Source</a></span>`
    : ''
  const footer = (aboutLink || credit)
    ? `<div class="legend-footer">${aboutLink}${credit}</div>`
    : ''
  return `
    <div class="legend-col">
      <aside class="legend">${groups}</aside>${footer}
    </div>`
}

/** Scope-switcher tabs in the topbar — link directly to each scope's latest
 *  snapshot, skipping the intermediate redirect page so SPA navigation lands
 *  on a real radar page in one hop. */
const renderScopeTabs = (scopes, scopeLatest, currentScope) => {
  if (scopes.length <= 1) return ''
  const tabs = scopes
    .map((s) => {
      const cls = s === currentScope ? 'tab tab--current' : 'tab'
      const latest = scopeLatest[s]
      const href = s === currentScope || !latest
        ? '#'
        : `../../${encodeURIComponent(s)}/${encodeURIComponent(latest)}/`
      return `<a class="${cls}" href="${href}">${escape(s)}</a>`
    })
    .join('')
  return `<nav class="scope-tabs" aria-label="Scope">${tabs}</nav>`
}

/** Full HTML page for a single radar (scope + date). */
export const radarPage = ({
  radar,
  scope,
  scopes,
  scopeLatest,
  date,
  timeline,
  basePath,
  navTitle,
  navFooter,
  credits = true,
  aboutHref = null,
}) => {
  const entries = layoutRadar(radar)
  const title = `${escape(radar.title || scope)} — ${escape(date)}`
  return `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1">
  <meta name="color-scheme" content="dark light">
  <style>html,body{background:#07080d;color:#e6e9f0;margin:0}html[data-theme="light"],html[data-theme="light"] body{background:#f6f7fa;color:#11151c}</style>
  ${THEME_BOOT}
  <title>${title}</title>
  <link rel="stylesheet" href="${basePath}aurora.css">
  <link rel="icon" href="${basePath}favicon.ico">
</head>
<body class="page-radar">
  <header class="topbar">
    <a class="brand" href="${basePath}">
      <span class="brand-mark">📡</span>
      <span class="brand-text">${escape(navTitle || 'Tech radar')}</span>
    </a>
    ${renderScopeTabs(scopes, scopeLatest, scope)}
    <div class="topbar-meta">
      <span class="meta-date" id="metaDate" data-default="${escape(date)}">${escape(date)}</span>
      <button class="toggle toggle--mode" data-toggle="mode" type="button" aria-label="Cycle theme &amp; colour mode"></button>
    </div>
  </header>
  ${renderTimeline(timeline, date)}
  <main class="radar-shell">
    <div class="radar-stage">${renderSvg(radar, entries)}</div>
    ${renderLegend(radar, entries, { credits, aboutHref })}
  </main>
  <div class="hover-card" id="hoverCard" role="status" aria-live="polite">
    <div class="hc-head">
      <span class="hc-num"></span>
      <h4 class="hc-name"></h4>
    </div>
    <div class="hc-meta">
      <span class="hc-ring"></span>
      <span class="hc-move"></span>
    </div>
    <p class="hc-desc"></p>
  </div>
  ${navFooter ? `<footer class="page-footer">${escape(navFooter)}</footer>` : ''}
  <script src="${basePath}aurora.js" defer></script>
</body>
</html>
`
}

/** Entry detail page. */
export const entryPage = ({
  entry,
  radar,
  scope,
  date,
  basePath,
  navTitle,
  radarPath,
}) => {
  const quadTitle =
    radar.document.quadrantTitles[entry.quadrant] || entry.quadrant.toUpperCase()
  const moveBadge =
    entry.moved > 0
      ? '<span class="badge badge--up">▲ moved up</span>'
      : entry.moved < 0
        ? '<span class="badge badge--down">▼ moved down</span>'
        : ''
  return `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1">
  <meta name="color-scheme" content="dark light">
  <style>html,body{background:#07080d;color:#e6e9f0;margin:0}html[data-theme="light"],html[data-theme="light"] body{background:#f6f7fa;color:#11151c}</style>
  ${THEME_BOOT}
  <title>${escape(entry.name)} — ${escape(scope)} ${escape(date)}</title>
  <link rel="stylesheet" href="${basePath}aurora.css">
  <link rel="icon" href="${basePath}favicon.ico">
</head>
<body class="page-entry">
  <header class="topbar">
    <a class="brand" href="${radarPath}">
      <span class="brand-mark">📡</span>
      <span class="brand-text">${escape(navTitle || 'Tech radar')}</span>
    </a>
    <div class="topbar-meta">
      <button class="toggle toggle--mode" data-toggle="mode" type="button" aria-label="Cycle theme &amp; colour mode"></button>
    </div>
  </header>
  <main class="entry-shell">
    <h1 class="entry-title">
      <a class="back" href="${radarPath}" aria-label="Back to radar">←</a>
      ${escape(entry.name)}
    </h1>
    <div class="entry-badges">
      <span class="badge badge--quad">${escape(quadTitle)}</span>
      <span class="badge badge--ring badge--ring-${entry.ring}">${escape(entry.ring.toUpperCase())}</span>
      ${moveBadge}
    </div>
    <div class="entry-desc">${escape(entry.description || '')}</div>
  </main>
  <script src="${basePath}aurora.js" defer></script>
</body>
</html>
`
}

/** Global About page — radar overview content rendered as prose. The
 *  back arrow points to dist root (and the SPA picks it up like any
 *  other internal link). */
export const aboutPage = ({ contentHtml, basePath, navTitle }) => `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1">
  <meta name="color-scheme" content="dark light">
  <style>html,body{background:#07080d;color:#e6e9f0;margin:0}html[data-theme="light"],html[data-theme="light"] body{background:#f6f7fa;color:#11151c}</style>
  ${THEME_BOOT}
  <title>${escape(navTitle || 'Tech radar')} — About</title>
  <link rel="stylesheet" href="${basePath}aurora.css">
  <link rel="icon" href="${basePath}favicon.ico">
</head>
<body class="page-about">
  <header class="topbar">
    <a class="brand" href="${basePath}">
      <span class="brand-mark">📡</span>
      <span class="brand-text">${escape(navTitle || 'Tech radar')}</span>
    </a>
    <div class="topbar-meta">
      <button class="toggle toggle--mode" data-toggle="mode" type="button" aria-label="Cycle theme &amp; colour mode"></button>
    </div>
  </header>
  <main class="about-shell">
    <h1 class="entry-title">
      <a class="back" href="${basePath}" aria-label="Back to radar">←</a>
      About
    </h1>
    <article class="about-content">${contentHtml}</article>
  </main>
  <script src="${basePath}aurora.js" defer></script>
</body>
</html>
`

/** scope/index.html — meta-redirect to latest snapshot. */
export const redirectPage = ({ date }) => `<!DOCTYPE html>
<html lang="en">
<head>
<meta charset="utf-8">
<meta http-equiv="refresh" content="0; url=${escape(date)}/">
<link rel="canonical" href="${escape(date)}/">
<title>Redirecting…</title>
</head>
<body>
<a href="${escape(date)}/">Continue to latest snapshot</a>
</body>
</html>
`
