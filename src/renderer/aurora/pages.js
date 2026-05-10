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

/** Path-safe entry slug: keep the original name (matches eleventy backend),
 *  only strip path separators that would break the directory layout. */
const entrySlug = (name) => String(name).replaceAll(/[/\\]/g, '-').trim()
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

  // Ring labels — text along arc at each ring's outer boundary, north position
  const ringLabels = RINGS.map((r, rIdx) => {
    // Place text along inner edge at top (slightly above CENTER)
    const arcId = `arc-ring-${r.id}`
    const labelRadius =
      rIdx === 0
        ? r.outer / 2
        : (RINGS[rIdx - 1].outer + r.outer) / 2
    return `
      <defs><path id="${arcId}" d="${arcPath(-Math.PI / 2 - 0.3, -Math.PI / 2 + 0.3, labelRadius)}"/></defs>
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

/** Sidebar with all entries grouped by quadrant + ring. */
const renderLegend = (radar, entries) => {
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
  return `<aside class="legend">${groups}</aside>`
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
    <span class="brand">
      <span class="brand-mark">📡</span>
      <span class="brand-text">${escape(navTitle || 'Tech radar')}</span>
    </span>
    ${renderScopeTabs(scopes, scopeLatest, scope)}
    <div class="topbar-meta">
      <span class="meta-date" id="metaDate" data-default="${escape(date)}">${escape(date)}</span>
      <button class="toggle toggle--chroma" data-toggle="chroma" type="button" aria-label="Toggle colour"></button>
      <button class="toggle toggle--theme"  data-toggle="theme"  type="button" aria-label="Toggle theme"></button>
    </div>
  </header>
  ${renderTimeline(timeline, date)}
  <main class="radar-shell">
    <div class="radar-stage">${renderSvg(radar, entries)}</div>
    ${renderLegend(radar, entries)}
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
      <a href="${radarPath}" class="meta-scope">${escape(scope)}</a>
      <span class="meta-date">${escape(date)}</span>
      <button class="toggle toggle--chroma" data-toggle="chroma" type="button" aria-label="Toggle colour"></button>
      <button class="toggle toggle--theme"  data-toggle="theme"  type="button" aria-label="Toggle theme"></button>
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
