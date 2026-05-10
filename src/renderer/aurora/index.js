import path from 'node:path'
import fse from 'fs-extra'

import { rootDir } from '../../constants.js'
import { js as clientJs } from './client.js'
import { entryPage, radarPage, redirectPage } from './pages.js'
import { css } from './styles.js'

const FAVICON = path.resolve(
  rootDir,
  'renderer/eleventy/templates/assets/favicon.ico',
)

const entrySlug = (name) => String(name).replaceAll(/[/\\]/g, '-').trim()

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
 * Aurora — pure-SVG static renderer (alternative to eleventy/Zalando).
 * Each radar page hosts the scope-switcher and timeline, so there is no
 * separate root index — `dist/index.html` is just a redirect to the
 * default scope's latest snapshot.
 *
 * @param {Object} ctx
 * @returns {Promise<void>}
 */
export const render = async (ctx) => {
  const { radars, output, navTitle, navFooter } = ctx
  if (!radars || radars.length === 0) return

  const timelines = buildTimelines(radars)
  const scopes = [...new Set(radars.map((r) => r.scope))]
    .filter((s) => s !== '.')
    .toSorted()

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
          date,
          timeline: timelines.get(scope) || [],
          basePath,
          navTitle,
          navFooter,
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
  if (await fse.pathExists(FAVICON)) {
    await fse.copy(FAVICON, path.join(output, 'favicon.ico'))
  }
}
