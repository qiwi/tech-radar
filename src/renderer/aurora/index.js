import path from 'node:path'
import fse from 'fs-extra'

import { rootDir } from '../../constants.js'
import { js as clientJs } from './client.js'
import {
  aboutPage,
  entryPage,
  entrySlug,
  radarPage,
  redirectPage,
} from './pages.js'
import { css } from './styles.js'

/** Minimal markdown → HTML for the About page. Handles h1/h2/h3, paragraphs,
 *  unordered lists, **bold**, and [text](url) inline. Anything fancier
 *  should be written as raw HTML. */
// Allow-list of URL schemes that can land in a markdown link's `href` —
// blocks `javascript:` / `data:` / etc., which would otherwise become
// executable code if an About-source author is careless or malicious.
const SAFE_URL = /^(https?:\/\/|mailto:|\/|#|\.{1,2}\/)/i

const mdToHtml = (md) => {
  const inline = (s) =>
    s
      .replaceAll('&', '&amp;')
      .replaceAll('<', '&lt;')
      .replaceAll('>', '&gt;')
      .replaceAll(/\*\*([^*]+)\*\*/g, '<strong>$1</strong>')
      .replaceAll(/\[([^\]]+)\]\(([^)]+)\)/g, (_, text, url) => {
        const safe = SAFE_URL.test(url.trim()) ? url.trim() : '#'
        return `<a href="${safe}" target="_blank" rel="noopener">${text}</a>`
      })
  const lines = md.split(/\r?\n/)
  const out = []
  let para = []
  let inList = false
  const flushPara = () => {
    if (para.length) {
      out.push(`<p>${para.join(' ').trim()}</p>`)
      para = []
    }
  }
  const flushList = () => {
    if (inList) {
      out.push('</ul>')
      inList = false
    }
  }
  for (const raw of lines) {
    const line = raw.trim()
    if (!line) {
      flushPara()
      flushList()
      continue
    }
    const h = line.match(/^(#{1,3})\s+(.+)$/)
    if (h) {
      flushPara()
      flushList()
      out.push(`<h${h[1].length}>${inline(h[2])}</h${h[1].length}>`)
      continue
    }
    const li = line.match(/^[-*]\s+(.+)$/)
    if (li) {
      flushPara()
      if (!inList) {
        out.push('<ul>')
        inList = true
      }
      out.push(`<li>${inline(li[1])}</li>`)
      continue
    }
    para.push(inline(line))
  }
  flushPara()
  flushList()
  return out.join('\n')
}

/** Load the about-content file referenced by `ctx.about`. `.md` is parsed
 *  through the minimal MD converter; `.html` is embedded as-is. */
const loadAbout = async (filePath) => {
  if (!filePath) return null
  if (!(await fse.pathExists(filePath))) return null
  const raw = await fse.readFile(filePath, 'utf8')
  const ext = path.extname(filePath).toLowerCase()
  return ext === '.md' ? mdToHtml(raw) : raw
}

/** Bundled favicon used when `ctx.favicon` is not provided. Lives inside
 *  the zalando templates dir so the package only ships one copy. */
const DEFAULT_FAVICON = path.resolve(
  rootDir,
  'renderer/zalando/templates/assets/favicon.ico',
)

/** Build per-scope timeline (sorted desc by date) from the full radar list. */
const buildTimelines = (radars) => {
  const byScope = new Map()
  for (const r of radars) {
    if (!byScope.has(r.scope)) byScope.set(r.scope, [])
    byScope.get(r.scope).push({ date: r.date, title: r.title })
  }
  for (const list of byScope.values()) {
    list.sort((a, b) => Date.parse(b.date) - Date.parse(a.date))
  }
  return byScope
}

/** "/foo/bar/" segment count → "../" prefix that climbs back to dist root. */
const upToRoot = (depth) => '../'.repeat(depth)

/**
 * Aurora — pure-SVG static renderer (alternative to the Zalando-style backend).
 * Each radar page hosts the scope-switcher and timeline, so there is no
 * separate root index — `dist/index.html` is just a redirect to the
 * default scope's latest snapshot.
 *
 * @param {Object} ctx
 * @returns {Promise<void>}
 */
export const render = async (ctx) => {
  const {
    radars,
    output,
    navTitle,
    navFooter,
    about,
    credits = true,
    favicon,
  } = ctx
  if (!radars || radars.length === 0) return

  const timelines = buildTimelines(radars)
  const scopes = [...new Set(radars.map((r) => r.scope))]
    .filter((s) => s !== '.')
    .toSorted()
  // Map: scope → latest snapshot date. Used by scope-tabs to deep-link.
  const scopeLatest = Object.fromEntries(
    scopes.map((s) => [s, timelines.get(s)?.[0]?.date]),
  )

  // About page (optional). When the source file resolves to non-empty HTML
  // we render `<output>/about/index.html` and pass `aboutHref` to every
  // page so they can surface the `?` link in the topbar.
  const aboutHtml = await loadAbout(about)
  const hasAbout = !!aboutHtml

  // --- Per-radar pages -----------------------------------------------------
  await Promise.all(
    radars.map(async (radar) => {
      const { scope, date } = radar
      const radarDir = path.join(output, scope, date)
      // Depth from dist root: <scope>/<date>/ → 2 segments
      const basePath = upToRoot(2)

      // Main radar page
      await fse.outputFile(
        path.join(radarDir, 'index.html'),
        radarPage({
          radar,
          scope,
          scopes,
          scopeLatest,
          date,
          timeline: timelines.get(scope) || [],
          basePath,
          navTitle,
          navFooter,
          credits,
          aboutHref: hasAbout ? `${basePath}about/` : null,
        }),
      )

      // Per-entry detail pages (depth: <scope>/<date>/entries/<q>/<slug>/ → 5)
      const entryBasePath = upToRoot(5)
      const radarPath = upToRoot(3)
      await Promise.all(
        radar.document.data.map(async (entry) => {
          const slug = entrySlug(entry.name)
          const dir = path.join(radarDir, 'entries', entry.quadrant, slug)
          await fse.outputFile(
            path.join(dir, 'index.html'),
            entryPage({
              entry,
              radar,
              scope,
              date,
              basePath: entryBasePath,
              radarPath,
              navTitle,
            }),
          )
        }),
      )
    }),
  )

  // --- About page (single global) -----------------------------------------
  if (hasAbout) {
    await fse.outputFile(
      path.join(output, 'about', 'index.html'),
      aboutPage({
        contentHtml: aboutHtml,
        basePath: upToRoot(1), // about/ → dist root
        navTitle,
      }),
    )
  }

  // --- Per-scope redirect → latest snapshot --------------------------------
  await Promise.all(
    scopes.map(async (scope) => {
      const tl = timelines.get(scope)
      if (!tl?.length) return
      await fse.outputFile(
        path.join(output, scope, 'index.html'),
        redirectPage({ date: tl[0].date }),
      )
    }),
  )

  // --- Root → first scope's latest snapshot --------------------------------
  // Two hops: root → /<scope>/ → /<scope>/<date>/. Single redirect file is enough.
  if (scopes.length > 0) {
    const defaultScope = scopes[0]
    await fse.outputFile(
      path.join(output, 'index.html'),
      `<!DOCTYPE html>
<html lang="en">
<head>
<meta charset="utf-8">
<meta http-equiv="refresh" content="0; url=${defaultScope}/">
<link rel="canonical" href="${defaultScope}/">
<title>${navTitle ? navTitle.replace(/[<>"']/g, '') : 'Tech radar'}</title>
</head>
<body>
<a href="${defaultScope}/">Open ${defaultScope} radar</a>
</body>
</html>
`,
    )
  }

  // --- Shared assets at dist root -----------------------------------------
  await fse.outputFile(path.join(output, 'aurora.css'), css)
  await fse.outputFile(path.join(output, 'aurora.js'), clientJs)
  const faviconSrc = favicon || DEFAULT_FAVICON
  if (await fse.pathExists(faviconSrc)) {
    await fse.copy(faviconSrc, path.join(output, 'favicon.ico'))
  }
}
