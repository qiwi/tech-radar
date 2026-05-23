import {
  CENTER,
  MAX_RADIUS,
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

/** Stable id under which an entry lives on disk + in URLs. Legacy 4×4
 *  radars carry `quadrant: 'q1..q4'` for backward compat with existing
 *  deployments; Flex radars use the canonical `sector: 's1..sN'`. */
const sectorUrlId = (entry) => entry.quadrant ?? entry.sector

/**
 * Per-radar palette block — emitted once per page, parameterised by the
 * radar's sector count and ring count. Two roles per sector:
 *   • `--s{N}-accent` — strokes, labels, corner titles (legible on the
 *     current theme: light on dark, dark on light)
 *   • `--s{N}-fill`   — blip body. Mirrors accent EXCEPT on light+color
 *     where it leans vivid so coloured dots pop off the white canvas.
 * Plus per-sector gradient stops + per-ring opacity/fade ramps. Scoped
 * to nothing in particular — these are CSS custom properties that
 * cascade through the page. Mono mode collapses everything to fg-soft.
 */
const renderPalette = (sectors, rings) => {
  const lines = (fn) => sectors.map(fn).join('\n')
  const accentDark = lines((s) => `  --${s.id}-accent: hsl(${s.accent} 65% 60%);`)
  const accentLight = lines((s) => `  --${s.id}-accent: hsl(${s.accent} 60% 36%);`)
  // Fill mirrors accent on dark and light+mono. Light+color overrides
  // below with brighter, more saturated values.
  const fillDark = lines((s) => `  --${s.id}-fill: hsl(${s.accent} 65% 60%);`)
  const fillLightDefault = lines((s) => `  --${s.id}-fill: hsl(${s.accent} 60% 36%);`)
  const fillLightColor = lines((s) => `  --${s.id}-fill: hsl(${s.accent} 70% 48%);`)
  const gradDark = lines(
    (s) => `  --${s.id}-grad-0: hsla(${s.accent}, 65%, 60%, 0.32);
  --${s.id}-grad-1: hsla(${s.accent}, 65%, 60%, 0.02);`,
  )
  const gradLight = lines(
    (s) => `  --${s.id}-grad-0: hsla(${s.accent}, 75%, 78%, 0.40);
  --${s.id}-grad-1: hsla(${s.accent}, 75%, 78%, 0.02);`,
  )
  const mono = lines(
    (s) => `  --${s.id}-accent: var(--fg-soft);
  --${s.id}-fill: var(--fg-soft);
  --${s.id}-grad-0: hsla(220, 10%, 50%, 0.10);
  --${s.id}-grad-1: hsla(220, 10%, 50%, 0.02);`,
  )

  // Ring fade — inner ring at full intensity, outermost at ~45%. Step
  // adapts to ring count M so every ring stays visible: even a 7-ring
  // radar gets its outer ring around 0.45, not invisible. Two ramps:
  //   • blip opacity: 1.00 → 0.55 across M rings
  //   • sector fill-opacity: 0.95 → 0.45
  const lerp = (lo, hi, t) => lo + (hi - lo) * t
  const t = (i) => (rings.length <= 1 ? 0 : i / (rings.length - 1))
  const ringOpacity = rings
    .map((r, i) => {
      const opacity = lerp(1.0, 0.55, t(i))
      return `.blip[data-r="${r.id}"] { opacity: ${opacity.toFixed(2)}; }`
    })
    .join('\n')
  const sectorFade = rings
    .map((r, i) => {
      const fill = lerp(0.95, 0.45, t(i))
      return `.sector[data-r="${r.id}"] { fill-opacity: ${fill.toFixed(2)}; }`
    })
    .join('\n')

  return `<style id="radar-palette">
[data-theme="dark"] {
${accentDark}
${fillDark}
${gradDark}
}
[data-theme="light"] {
${accentLight}
${fillLightDefault}
${gradLight}
}
[data-theme="light"][data-chroma="color"] {
${fillLightColor}
}
[data-chroma="mono"] {
${mono}
}
${ringOpacity}
${sectorFade}
</style>`
}

/** Render a single radar SVG (full viewBox). Sectors & rings come from
 *  the layout result so the SVG matches whatever count was declared. */
const renderSvg = (radar, entries, sectors, rings) => {
  // Per-sector radial gradients — each sector glows from centre outward.
  // SVG `<stop>` resolves CSS variables more reliably when stop-color is
  // set via the `style` attribute (CSS property) rather than the
  // `stop-color` presentation attribute — the latter sometimes paints
  // black on first frame before the cascade settles.
  const defs = sectors
    .map(
      (s) => `
      <radialGradient id="grad-${s.id}" cx="50%" cy="50%" r="50%">
        <stop offset="0%"   style="stop-color: var(--${s.id}-grad-0)"/>
        <stop offset="100%" style="stop-color: var(--${s.id}-grad-1)"/>
      </radialGradient>`,
    )
    .join('')

  // Sector annulus fills (one path per (sector × ring) cell). Per-ring
  // fill-opacity is driven by CSS (.sector[data-r=...]) — emitted in the
  // palette block — so the SVG itself stays count-agnostic.
  const cells = sectors
    .flatMap((s, sIdx) =>
      rings.map(
        (r, rIdx) =>
          `<path d="${sectorPath(sIdx, rIdx, { sectors, rings })}" fill="url(#grad-${s.id})"
              class="sector" data-s="${s.id}" data-r="${r.id}"/>`,
      ),
    )
    .join('')

  // Ring boundary circles + axes between sectors. Axes are emitted per
  // sector boundary (N lines for N sectors) so the cross stays correct
  // for non-4 layouts.
  const ringCircles = rings
    .map(
      (r) =>
        `<circle cx="${CENTER}" cy="${CENTER}" r="${r.outer}" class="ring-line"/>`,
    )
    .join('')
  const axes = sectors
    .map((s) => {
      const p = polarPt(s.start, MAX_RADIUS)
      return `<line x1="${CENTER}" y1="${CENTER}" x2="${p.x.toFixed(1)}" y2="${p.y.toFixed(1)}" class="axis"/>`
    })
    .join('')

  // Ring labels — text along an arc near the OUTER edge of each ring,
  // centred on top (-π/2). Placing the label closer to the outer edge
  // (≈70% of the way out from the previous ring) means even narrow
  // inner rings have enough arc length for the textPath to lay out
  // without truncating ("DOP" bug). Font size scales with the available
  // arc length so a 7-ring radar's innermost "STANDARD" still fits.
  const ringLabels = rings
    .map((r, rIdx) => {
      const arcId = `arc-ring-${r.id}`
      const innerEdge = rings[rIdx - 1]?.outer ?? 0
      const labelRadius = innerEdge + (r.outer - innerEdge) * 0.7
      // Half-angle clamped so very small rings don't try to subtend more
      // than ~80° of the wheel. Arc length ≈ 2 · r · half.
      const half = Math.max(0.18, Math.min(0.9, 70 / labelRadius))
      const arcLen = 2 * labelRadius * half
      // Per-character width of an uppercase sans-serif label is roughly
      //   font * (0.6 char + 0.25em letter-spacing) ≈ font * 0.85
      // For long labels (RECOMMENDED) we have to shrink the font AND the
      // letter-spacing to fit the arc without textPath truncating from
      // both ends. CHAR_FACTOR is the tightest fit the eye still parses;
      // smaller → bigger fonts pulled in.
      const CHAR_FACTOR = 0.95
      const fontSize = Math.max(
        10,
        Math.min(
          18,
          Math.floor(arcLen / (Math.max(r.label.length, 4) * CHAR_FACTOR)),
        ),
      )
      // Tighten letter-spacing for shrunken labels so the chars stay
      // visually grouped instead of looking like they were stretched.
      const tracking = fontSize < 14 ? '0.08em' : '0.25em'
      return `
      <defs><path id="${arcId}" d="${arcPath(-Math.PI / 2 - half, -Math.PI / 2 + half, labelRadius)}"/></defs>
      <text class="ring-label" data-r="${r.id}" style="font-size: ${fontSize}px; letter-spacing: ${tracking}">
        <textPath href="#${arcId}" startOffset="50%" text-anchor="middle">${r.label}</textPath>
      </text>`
    })
    .join('')

  // Sector titles — placed at each sector's mid-angle just outside the
  // outer ring. For N=4 this lands roughly in the corners (same as the
  // legacy layout); for higher N the labels distribute around the rim.
  const sectorLabels = sectors
    .map((s) => {
      const mid = (s.start + s.end) / 2
      const p = polarPt(mid, MAX_RADIUS + 28)
      // Anchor/baseline lean the text BACK TOWARDS the centre so it stays
      // inside the viewBox. On the right edge (dx > 0) the END of the
      // text sits at x; on the bottom (dy > 0) the BASELINE sits at y so
      // characters grow upward. Reversed for the opposite sides.
      const dx = p.x - CENTER
      const dy = p.y - CENTER
      const anchor = Math.abs(dx) < 6 ? 'middle' : dx > 0 ? 'end' : 'start'
      const baseline = Math.abs(dy) < 6 ? 'middle' : dy > 0 ? 'auto' : 'hanging'
      return `<text class="quad-label" x="${p.x.toFixed(1)}" y="${p.y.toFixed(1)}"
        text-anchor="${anchor}" dominant-baseline="${baseline}"
        fill="var(--${s.id}-accent)">${escape(s.title)}</text>`
    })
    .join('')

  // Entries — circle + number, wrapped in <a> linking to detail page.
  // Blip shape encodes movement: triangle up (moved=1), down (moved=-1),
  // circle (no move).
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
      const numDy = e.moved > 0 ? 6 : e.moved < 0 ? 2 : 4
      const sid = e.sector // canonical sN id (set by layoutRadar)
      const urlSid = sectorUrlId(e) // legacy qN preferred for path stability
      const href = `entries/${urlSid}/${entryHref(e.name)}/`
      return `
        <a href="${href}" class="blip-link" tabindex="0">
          <g class="blip" data-s="${sid}" data-r="${e.ring}" data-num="${e.num}"
             transform="translate(${e.x.toFixed(1)} ${e.y.toFixed(1)})"
             style="color: var(--${sid}-fill)"
             data-name="${escape(e.name)}"
             data-desc="${escape(e.description || '')}"
             data-ring="${escape(String(e.ring).toUpperCase())}"
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
  <g class="radar-sectors">${cells}</g>
  <g class="radar-rings">${ringCircles}${axes}</g>
  <g class="radar-labels">${ringLabels}${sectorLabels}</g>
  <g class="radar-blips">${blips}</g>
</svg>`
}

// Inline `polar` so renderSvg doesn't need a context import — same math.
const polarPt = (angle, radius) => ({
  x: CENTER + Math.cos(angle) * radius,
  y: CENTER + Math.sin(angle) * radius,
})

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

/** Sidebar with all entries grouped by sector + ring. `credits` toggles
 *  the generator-credit footer; `aboutHref` (when set) renders a small
 *  About link with a `?` icon, independent of `credits`. */
const renderLegend = (
  radar,
  entries,
  sectors,
  rings,
  { credits = true, aboutHref = null } = {},
) => {
  const groups = sectors
    .map((s) => {
      const inSector = entries.filter((e) => e.sector === s.id)
      const ringGroups = rings
        .map((r) => {
          const inRing = inSector.filter((e) => e.ring === r.id)
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
          <h4>${escape(r.label)}</h4>
          <ul>${lis}</ul>
        </div>`
        })
        .join('')
      return `
      <section class="legend-quad" data-s="${s.id}" style="--sector-accent: var(--${s.id}-accent)">
        <h3>${escape(s.title)}</h3>
        ${ringGroups}
      </section>`
    })
    .join('')

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
  autoFitRings = false,
}) => {
  const { entries, sectors, rings } = layoutRadar(radar, { autoFitRings })
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
  ${renderPalette(sectors, rings)}
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
    <div class="radar-stage">${renderSvg(radar, entries, sectors, rings)}</div>
    ${renderLegend(radar, entries, sectors, rings, { credits, aboutHref })}
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
  // Resolve the human title of the sector this entry belongs to. Works for
  // both legacy (quadrantTitles[q1]) and Flex (sectors[].title) radars.
  const sectorTitle = (() => {
    const sid = entry.sector
    const fromArr = (radar.document.sectors || []).find((s) => s.id === sid)
    if (fromArr) return fromArr.title
    if (entry.quadrant && radar.document.quadrantTitles) {
      return radar.document.quadrantTitles[entry.quadrant]
    }
    return sid?.toUpperCase() || ''
  })()
  // Ring title comes from the rings array.
  const ringTitle = (() => {
    const r = (radar.document.rings || []).find((r) => r.id === entry.ring)
    return r ? String(r.title).toUpperCase() : String(entry.ring).toUpperCase()
  })()
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
      <span class="badge badge--quad">${escape(sectorTitle)}</span>
      <span class="badge badge--ring badge--ring-${entry.ring}">${escape(ringTitle)}</span>
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
