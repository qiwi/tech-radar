import fse from 'fs-extra'
import path from 'node:path'

import { getSources, parse } from './parser/index.js'
import { render } from './renderer/index.js'
import { getDirs, tempDir } from './util.js'

/**
 * @description
 * Generate static sites from csv/json/yml radar declarations
 *
 * @func
 * @param {Object} [options]
 * @param {string} [options.input] globby pattern for input files (default `data/**\/*.{json,csv,yml}`)
 * @param {string} [options.output] output directory (default `radar`)
 * @param {string} [options.cwd] current working directory
 * @param {string} [options.basePrefix] web app root level prefix; URL-shaped values (`https://…`, `//…`) become absolute, others relative
 * @param {boolean} [options.autoscope] consider same-scoped files as subversions of a single radar
 * @param {boolean} [options.navPage] generate navigation page
 * @param {string} [options.navTitle] nav page title
 * @param {string} [options.navFooter] nav page footer
 * @param {string} [options.temp] temp directory
 * @param {string} [options.templates] path to a directory whose contents are merged on top of bundled templates
 * @param {Object} [options.renderSettings] custom render settings (rings, colors, dimensions) for `radar.js`
 * @param {('zalando'|'aurora')} [options.renderer] output backend (default `zalando`)
 * @param {string} [options.favicon] path to a custom favicon (`.ico`/`.png`) — copied to `<output>/favicon.ico`. If not provided, the bundled default is used.
 * @param {string} [options.about] path to a .md or .html file with radar overview (aurora only)
 * @param {boolean} [options.credits] include the generator credit in the legend footer (default `true`; aurora only)
 *
 * @return {Promise<void>}
 */
export const run = async (options) => {
  const ctx = await getContext(options)

  return readSources(ctx)
    .then(parseRadars)
    .then(sortRadars)
    .then(resolveMoves)
    .then(renderRadars)
    .finally(() => cleanTemp(ctx))
}

const getContext = async ({
  input = 'data/**/*.{json,csv,yml}',
  output = 'radar',
  cwd = process.cwd(),
  basePrefix = '/',
  autoscope = false,
  navPage = false,
  navTitle,
  navFooter,
  temp,
  templates,
  renderSettings,
  renderer = 'zalando',
  favicon,
  about,
  credits = true,
  autoFitRings = false,
} = {}) => {
  const ctx = {
    input,
    output: path.resolve(cwd, output),
    cwd,
    basePrefix,
    autoscope,
    navPage,
    navTitle,
    navFooter,
    temp: temp || (await tempDir()),
    templates,
    renderSettings,
    renderer,
    favicon: favicon ? path.resolve(cwd, favicon) : undefined,
    about: about ? path.resolve(cwd, about) : undefined,
    credits,
    autoFitRings,
  }

  ctx.ctx = ctx // context self-ref to simplify pipelining

  return ctx
}

const readSources = async ({ ctx, cwd, input }) => {
  ctx.sources = await getSources(input, cwd)
  ctx.sources.sort()
  ctx.scopes = getDirs(ctx.sources).map(path.dirname)
  return ctx
}

const parseRadars = async ({ ctx, sources, scopes }) => {
  // Per-file: a malformed source is logged and skipped, not fatal.
  const results = await Promise.all(
    sources.map(async (file, i) => {
      try {
        const document = await parse(file)
        return {
          document,
          source: file,
          scope: scopes[i],
          date: document.meta.date,
          title: document.meta.title,
        }
      } catch (err) {
        console.error(`[parse] ${file}: ${err.message || err}`)
        return null
      }
    }),
  )
  ctx.radars = results.filter(Boolean)
  return ctx
}

const renderRadars = async ({ ctx }) => {
  await render(ctx)
  return ctx
}

const RING_WEIGHT = {
  hold: 0,
  assess: 1,
  trial: 2,
  adopt: 3,
}

/**
 * Ring weight for the auto-trail computation. Inner ring = highest weight
 * (most "adopted"). For legacy 4×4 radars uses the hardcoded RING_WEIGHT
 * map; for Flex radars derives the weight from the radar's own ordered
 * `rings` array (index 0 = innermost = N-1, last = outermost = 0).
 */
const getRingWeight = (ring, ringList) => {
  if (ringList?.length) {
    const idx = ringList.findIndex((r) => r.id === ring)
    if (idx !== -1) return ringList.length - 1 - idx
  }
  return RING_WEIGHT[String(ring).toLowerCase()]
}

const resolveMoves = async ({ ctx, radars, autoscope }) => {
  if (!autoscope) {
    return ctx
  }

  radars.forEach(({ document: { data, rings } }, i) => {
    const { scope } = radars[i]
    data.forEach((entry) => {
      const { name, ring } = entry
      const lowerName = name.toLowerCase()
      const prevRadar = radars[i + 1] // NOTE sorted by desc date
      const prevEntry =
        prevRadar &&
        prevRadar.scope === scope &&
        prevRadar.document.data.find(
          ({ name: _name }) => _name.toLowerCase() === lowerName,
        )

      // Comparing two snapshots that disagree on their ring shape is a
      // best-effort: each side uses its own `rings` for weighting.
      const prevRings = prevRadar?.document?.rings
      entry.moved = prevEntry
        ? Math.sign(
            getRingWeight(ring, rings) - getRingWeight(prevEntry.ring, prevRings),
          )
        : 0
    })
  })

  return ctx
}

const sortRadars = async ({ ctx, radars }) => {
  radars.sort(
    (a, b) =>
      path.dirname(a.source).localeCompare(path.dirname(b.source)) ||
      Date.parse(b.date) - Date.parse(a.date),
  )

  return ctx
}

const cleanTemp = async ({ ctx, temp }) => {
  await fse.remove(temp)
  return ctx
}
