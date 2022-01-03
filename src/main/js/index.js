import fse from 'fs-extra'
import { nanoid } from 'nanoid'
import path from 'path'
import tempy from 'tempy'

import { tplDir } from './generator/constants.js'
import { genEleventy, genNavPage, genRedirects } from './generator/index.js'
import { getSources, parse } from './parser/index.js'
import { getDirs, mkdirp } from './util.js'

/**
 * generate static sites from csv/json/yml radar declarations
 * @param {string} input globby pattern for input files
 * @param {string} output output directory
 * @param {string} cwd current working directory
 * @param {string?} basePrefix web app root level prefix
 * @param {boolean?} autoscope consider same-scoped files as subversions of a single radar
 * @param {boolean?} navPage Generate navigation page
 * @param {string?} navTitle Nav page title
 * @param {string?} navFooter Nav page footer
 * @param {string?} temp Temp directory
 */
export const run = async ({
  input,
  output,
  cwd = process.cwd(),
  basePrefix = '/',
  autoscope,
  navPage,
  navTitle,
  navFooter,
  temp = path.join(tempy.root, `tech-radar-${nanoid(5)}`),
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
    temp,
  }
  ctx.ctx = ctx // context self-ref to simplify pipelining

  return readSources(ctx)
    .then(parseRadars)
    .then(sortRadars)
    .then(resolveMoves)
    .then(renderRadars)
    .finally(() => cleanTemp(ctx))
}

const readSources = async ({ ctx, cwd, input }) => {
  ctx.sources = await getSources(input, cwd)
  ctx.scopes = getDirs(ctx.sources).map(path.dirname)
  return ctx
}

const parseRadars = async ({ ctx, sources, scopes }) => {
  ctx.radars = sources.map((file, i) => {
    const document = parse(file)
    return {
      document,
      source: file,
      scope: scopes[i],
      date: document.meta.date,
      title: document.meta.title,
    }
  })

  return ctx
}

const renderRadars = async ({ radars, ctx, temp, basePrefix, output }) => {
  await fse.copy(path.join(tplDir, 'assets'), output)
  await Promise.all(
    radars.map(async (radar) => {
      radar.temp = await mkdirp(path.join(temp, nanoid(5)))
      radar.target = path.join(radar.scope, radar.date)
      radar.output = path.join(output, radar.target)
      radar.prefix = path.join(basePrefix, radar.target)

      await genEleventy(radar)
    }),
  )

  await genNavPage(ctx)
  await genRedirects(ctx)

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
      const { name, ring } = entry
      const lowerName = name.toLowerCase()
      const prevRadar = i !== 0 && radars[i - 1]
      const prevEntry =
        prevRadar &&
        prevRadar.scope === scope &&
        prevRadar.document.data.find(
          ({ name: _name }) => _name.toLowerCase() === lowerName,
        )
      const moved = prevEntry
        ? Math.sign(getRingWeight(ring) - getRingWeight(prevEntry.ring))
        : 0

      entry.moved = moved
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
