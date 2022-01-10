import Eleventy from '@11ty/eleventy'
import fse from 'fs-extra'
import { uniq } from 'lodash-es'
import path from 'path'

import { tempDir } from '../util.js'
import { __dirname, settings as defaultSettings, tplDir } from './constants.js'
import { genMdAssets } from './markdown.js'

export const genConfig = async ({ temp, output, prefix }) => {
  const configExtPath = path.resolve(__dirname, '.eleventy.cjs')
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
}) => {
  const quadrants = [
    { name: document.quadrantTitles.q1 || 'Q1', id: 'q1' },
    { name: document.quadrantTitles.q2 || 'Q2', id: 'q2' },
    { name: document.quadrantTitles.q3 || 'Q3', id: 'q3' },
    { name: document.quadrantTitles.q4 || 'Q4', id: 'q4' },
  ]

  const extra = {
    title,
    target: path.join(scope, date),
    prefix: path.join(basePrefix, scope, date),
    basePrefix: basePrefix,
    footer: navFooter,
  }

  return { ...defaultSettings, extra, quadrants }
}

export const genRadars = async ({ radars, ctx }) => {
  await Promise.all(
    radars.map(async (radar) => {
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
    }),
  )
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

  await fse.copy(tplDir, temp)
  await fse.outputFile(
    path.join(temp, '_data/settings.json'),
    JSON.stringify(settings),
  )
  await fse.outputFile(
    path.join(temp, 'index.njk'),
    `---
layout: ${template}.njk
---
`,
  )

  if (templates) {
    await fse.copy(templates, temp)
  }

  await elev.init()
  await elev.write()
}
