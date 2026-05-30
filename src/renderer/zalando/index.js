import path from 'node:path'
import Eleventy from '@11ty/eleventy'
import fse from 'fs-extra'
import slash from 'slash'

import { rootDir, tplDir } from '../../constants.js'
import { tempDir } from '../../util.js'
import { genMdAssets } from './markdown.js'

export const genConfig = async ({ temp, output, prefix }) => {
  const configPath = path.join(temp, 'config.js')
  const configLoaderAbsPath = path.resolve(rootDir, 'renderer/zalando/config.cjs')
  const configLoaderRelPath = slash(path.relative(temp, configLoaderAbsPath))
  const configMixin = { extra: { temp, prefix, output } }
  const configContents = `
module.exports = (config) => require('${configLoaderRelPath}')(Object.assign(config, ${JSON.stringify(
    configMixin,
  )}))
`
  await fse.outputFile(configPath, configContents, 'utf8')

  return configPath
}

export const genRadarSettings = ({
  title,
  basePrefix,
  navFooter,
  date,
  document,
  scope,
  renderSettings,
}) => {
  const quadrants = Object.entries(document.quadrantTitles).map(
    ([id, name]) => ({ name, id }),
  )
  const extra = {
    title,
    date,
    // POSIX separators: `target` feeds the asset-depth counter in
    // config.cjs (`split('/')`); path.join would emit backslashes on win32.
    target: path.posix.join(scope, date),
    basePrefix,
    footer: navFooter,
  }

  return { ...renderSettings, extra, quadrants }
}

export const genRadars = async ({ radars, ctx }) => {
  await Promise.all(
    radars.map(async (radar) => {
      await genRadar({ ...ctx, radar })
      await genTable({ ...ctx, radar })
    }),
  )
}

const buildRadarContext = async ({ ctx, radar, subPath = '' }) => ({
  ...ctx,
  ...radar,
  output: path.join(ctx.output, radar.scope, radar.date, subPath),
  temp: await tempDir(ctx.temp),
})

export const genRadar = async ({ ctx, radar }) => {
  const context = await buildRadarContext({ ctx, radar })
  context.settings = genRadarSettings(context)

  await genMdAssets(context)
  await renderTemplate('radar', context)
}

export const genTable = async ({ ctx, radar }) => {
  const context = await buildRadarContext({ ctx, radar, subPath: 'table' })
  context.settings = radar.document

  await renderTemplate('table', context)
}

export const genRedirects = async ({ radars, output, ctx, temp }) => {
  await Promise.all(
    Object.entries(
      radars.reduce((m, { scope, date }) => {
        const prev = m[scope]

        if (scope !== '.' && (!prev || prev < date)) {
          m[scope] = date
        }
        return m
      }, {}),
    ).map(async ([scope, date]) =>
      renderTemplate('redirect', {
        ...ctx,
        temp: await tempDir(temp),
        output: path.join(output, scope),
        date,
        settings: { extra: { date } },
      }),
    ),
  )
}

export const genNavPage = async ({
  radars,
  output,
  ctx,
  temp,
  navTitle,
  navFooter,
}) => {
  const scopes = [...new Set(radars.map((r) => r.scope))]
  const settings = {
    extra: {
      radars,
      scopes,
      footer: navFooter,
      title: navTitle,
    },
  }

  await renderTemplate('root', {
    ...ctx,
    temp: await tempDir(temp),
    output,
    settings,
  })
}

export const renderTemplate = async (template, options) => {
  const { temp, output, settings, templates } = options
  const configPath = await genConfig(options)
  const elev = new Eleventy(slash(temp), slash(output), { configPath })

  // Copy templates
  await fse.copy(tplDir, temp)
  if (templates) {
    await fse.copy(templates, temp)
  }

  // Store settings
  const settingsPath = path.join(temp, '_data/settings.json')
  const _settings = await fse.readJson(settingsPath)
  await fse.outputFile(
    settingsPath,
    JSON.stringify({ ..._settings, ...settings }),
  )

  // Prepare entry point template
  await fse.outputFile(
    path.join(temp, 'index.njk'),
    `---
layout: ${template}.njk
---
`,
  )

  await elev.init()
  await elev.write()
}

/**
 * Public renderer entry — implements the renderer-interface contract.
 * Consumes ctx (radars, output, basePrefix, …) and writes the full static
 * site (radar pages, nav, redirects, shared assets) under ctx.output.
 *
 * @param {Object} ctx
 * @returns {Promise<void>}
 */
export const render = async (ctx) => {
  await genRadars({ radars: ctx.radars, ctx })
  await genNavPage(ctx)
  await genRedirects(ctx)
  await fse.copy(path.join(tplDir, 'assets'), ctx.output)
  // Override bundled favicon if the caller supplied one. Runs AFTER the
  // assets copy so it always wins.
  if (ctx.favicon && (await fse.pathExists(ctx.favicon))) {
    await fse.copy(ctx.favicon, path.join(ctx.output, 'favicon.ico'))
  }
}
