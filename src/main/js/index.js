import fse from 'fs-extra'
import path from 'node:path'

import { tplDir } from './constants.js'
import { genNavPage, genRadars, genRedirects } from './generator/index.js'
import { getSources, parse } from './parser/index.js'
import { getDirs, tempDir } from './util.js'

/**
 * @description
 * Generate static sites from csv/json/yml radar declarations
 *
 * @func
 * @param {Object} options
 * @param {string} options.input globby pattern for input files
 * @param {string} options.output output directory
 * @param {string} options.cwd current working directory
 * @param {string?} options.basePrefix web app root level prefix
 * @param {boolean?} options.autoscope consider same-scoped files as subversions of a single radar
 * @param {boolean?} options.navPage Generate navigation page
 * @param {string?} options.navTitle Nav page title
 * @param {string?} options.navFooter Nav page footer
 * @param {string?} options.temp Temp directory
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
  input,
  output,
  cwd = process.cwd(),
  basePrefix = '/',
  autoscope = false,
  navPage = false,
  navTitle,
  navFooter,
  temp,
  templates,
  renderSettings,
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
  }

  ctx.ctx = ctx // context self-ref to simplify pipelining

  return ctx
}

const readSources = async ({ ctx, cwd, input }) => {
  ctx.sources = await getSources(input, cwd)
  ctx.scopes = getDirs(ctx.sources).map(path.dirname)
  return ctx
}

const parseRadars = async ({ ctx, sources, scopes }) => {
  ctx.radars = await Promise.all(
    sources.map(async (file, i) => {
      const document = await parse(file)

      return {
        document,
        source: file,
        scope: scopes[i],
        date: document.meta.date,
        title: document.meta.title,
      }
    }),
  )

  return ctx
}

const renderRadars = async ({ ctx, output }) => {
  await genRadars(ctx)
  await genNavPage(ctx)
  await genRedirects(ctx)
  await fse.copy(path.join(tplDir, 'assets'), output) // shared static assets

  // console.log('radars', radars)
  // console.log('radar', JSON.stringify(radars[3], null, 2))
  return ctx
}

const resolveMoves = async ({ ctx, radars, autoscope }) => {
  if (!autoscope) {
    return ctx
  }

  const rings = {
    hold: 0,
    assess: 1,
    trial: 2,
    adopt: 3,
  }

  const getRingWeight = (ring) => rings[ring.toLowerCase()]

  radars.forEach(({ document: { data }, scope }, i) => {
    data.forEach((entry) => {
      const { name, ring, moved } = entry
      const lowerName = name.toLowerCase()
      const prevRadar = radars[i + 1] // NOTE sorted by desc date
      const prevEntry =
        prevRadar &&
        prevRadar.scope === scope &&
        prevRadar.document.data.find(
          ({ name: _name }) => _name.toLowerCase() === lowerName,
        )

      entry.moved = prevEntry
        ? Math.sign(getRingWeight(ring) - getRingWeight(prevEntry.ring))
        : moved || 0
    })
  })

  return ctx
}

const sortRadars = async ({ ctx, radars }) => {
  radars.sort((a, b) => {
    if (path.dirname(a.source) > path.dirname(b.source)) return 1
    if (path.dirname(a.source) < path.dirname(b.source)) return -1

    return Math.sign(Date.parse(b.date) - Date.parse(a.date))
  })

  return ctx
}

const cleanTemp = async ({ ctx, temp }) => {
  await fse.remove(temp)
  return ctx
}
