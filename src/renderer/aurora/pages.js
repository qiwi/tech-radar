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

/** Path-safe entry slug: keep the original name (matches eleventy backend),
 *  only strip path separators that would break the directory layout. */
const entrySlug = (name) => String(name).replaceAll(/[/\\]/g, '-').trim()
const entryHref = (name) => encodeURIComponent(entrySlug(name))

/** Render a single radar SVG (full viewBox). */
const renderSvg = (radar, entries) => {
  // Sector backgrounds — nested SVG defs hold radial gradient per quadrant.
  const defs = QUADRANTS.map(
    (q) => `
      <radialGradient id="grad-${q.id}" cx="50%" cy="50%" r="50%">
        <stop offset="0%" stop-color="hsl(${q.accent} 70% 18%)" stop-opacity="0.7"/>
        <stop offset="100%" stop-color="hsl(${q.accent} 60% 8%)" stop-opacity="0.05"/>
      </radialGradient>`,
  ).join('')

  const sectors = QUADRANTS.flatMap((q, qIdx) =>
    RINGS.map(
      (r, rIdx) => `
        <path d="${sectorPath(qIdx, rIdx)}"
              fill="url(#grad-${q.id})"
              fill-opacity="${0.95 - rIdx * 0.18}"
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
      <text class="ring-label">
        <textPath href="#${arcId}" startOffset="50%" text-anchor="middle">${r.label}</textPath>
      </text>`
  }).join('')

  // Quadrant titles live in the sidebar legend — keeping the SVG clean.
  const quadLabels = ''

  // Entries — circle + number, wrapped in <a> linking to detail page
  const blips = entries
    .map((e) => {
      const qIdx = QUADRANTS.findIndex((q) => q.id === e.quadrant)
      const accent = QUADRANTS[qIdx]?.accent ?? 200
      const tone = e.ring === 'hold' ? 50 : e.ring === 'assess' ? 60 : e.ring === 'trial' ? 65 : 70
      const moveSym =
        e.moved > 0 ? '▲' : e.moved < 0 ? '▼' : ''
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
            <circle r="16" class="blip-bg" fill="hsl(${accent} ${tone}% 22%)"/>
            <circle r="14" class="blip-fg" fill="hsl(${accent} ${tone}% 55%)"/>
            <text class="blip-num" text-anchor="middle" dy="4">${e.num}</text>
            ${moveSym ? `<text class="blip-move" text-anchor="middle" y="-22">${moveSym}</text>` : ''}
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

/** Timeline strip — one dot per available date for the current scope.
 *  Hrefs are sibling-relative (`../<date>/`) — independent of basePath. */
const renderTimeline = (timeline, currentDate) => {
  if (timeline.length <= 1) return ''
  const items = timeline
    .map((t) => {
      const cls = t.date === currentDate ? 'tl-dot tl-dot--current' : 'tl-dot'
      const href = `../${encodeURIComponent(t.date)}/`
      return `
        <a class="${cls}" href="${href}" data-date="${escape(t.date)}">
          <span class="tl-marker"></span>
          <span class="tl-date">${escape(t.date)}</span>
        </a>`
    })
    .join('')
  return `
    <nav class="timeline" aria-label="Snapshot timeline">
      <div class="tl-track"></div>
      <div class="tl-items">${items}</div>
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
      <section class="legend-quad" style="--accent: ${q.accent}">
        <h3>${escape(title)}</h3>
        ${ringGroups}
      </section>`
  }).join('')
  return `<aside class="legend">${groups}</aside>`
}

/** Scope-switcher tabs in the topbar (current → static, others → sibling redirect). */
const renderScopeTabs = (scopes, currentScope) => {
  if (scopes.length <= 1) return ''
  const tabs = scopes
    .map((s) => {
      const cls = s === currentScope ? 'tab tab--current' : 'tab'
      // From <scope>/<date>/, climb 2 levels to dist root then dive into target scope.
      const href = s === currentScope ? '#' : `../../${encodeURIComponent(s)}/`
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
    ${renderScopeTabs(scopes, scope)}
    <div class="topbar-meta">
      <span class="meta-date">${escape(date)}</span>
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
    </div>
  </header>
  <main class="entry-shell">
    <a class="back" href="${radarPath}">← back to radar</a>
    <h1 class="entry-title">${escape(entry.name)}</h1>
    <div class="entry-badges">
      <span class="badge badge--quad">${escape(quadTitle)}</span>
      <span class="badge badge--ring badge--ring-${entry.ring}">${escape(entry.ring.toUpperCase())}</span>
      ${moveBadge}
    </div>
    <div class="entry-desc">${escape(entry.description || '')}</div>
  </main>
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
