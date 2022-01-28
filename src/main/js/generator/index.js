import Eleventy from '@11ty/eleventy'
import fse from 'fs-extra'
import { uniq } from 'lodash-es'
import path from 'path'

import { rootDir, tplDir } from '../constants.js'
import { tempDir } from '../util.js'
import { genMdAssets } from './markdown.js'

export const genConfig = async ({ temp, output, prefix }) => {
  const configExtPath = path.resolve(rootDir, 'generator/.eleventy.cjs')
  const configMixin = { extra: { temp, prefix, output } }
  const configPath = path.join(temp, 'config.js')
  const configContents = `
module.exports = (config) => require('${configExtPath}')(Object.assign(config, ${JSON.stringify(
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
    target: path.join(scope, date),
    prefix: path.join(basePrefix, scope, date),
    basePrefix: basePrefix,
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

export const genRadar = async ({ ctx, radar }) => {
  const temp = await tempDir(ctx.temp)
  const output = path.join(ctx.output, radar.scope, radar.date)
  const context = {
    ...ctx,
    ...radar,
    output,
    temp,
  }
  context.settings = genRadarSettings(context)

  await genMdAssets(context)
  await render('radar', context)
}

export const genTable = async ({ ctx, radar }) => {
  const temp = await tempDir(ctx.temp)
  const output = path.join(ctx.output, radar.scope, radar.date, 'table')
  const settings = radar.document
  const context = {
    ...ctx,
    ...radar,
    settings,
    output,
    temp,
  }
  await render('table', context)
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
      render('redirect', {
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
  const scopes = uniq(radars.map((r) => r.scope))
  const settings = {
    extra: {
      radars,
      scopes,
      footer: navFooter,
      title: navTitle,
    },
  }

  await render('root', {
    ...ctx,
    temp: await tempDir(temp),
    output,
    settings,
  })
}

export const render = async (template, options) => {
  const { temp, output, settings, templates } = options
  const configPath = await genConfig(options)
  const elev = new Eleventy(temp, output, { configPath })

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
