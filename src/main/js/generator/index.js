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
  temp,
  document,
  title,
  prefix,
  date,
  output,
  basePrefix,
  footer,
}) => {
  const quadrants = [
    { name: document.quadrantTitles.q1 || 'Q1', id: 'q1' },
    { name: document.quadrantTitles.q2 || 'Q2', id: 'q2' },
    { name: document.quadrantTitles.q3 || 'Q3', id: 'q3' },
    { name: document.quadrantTitles.q4 || 'Q4', id: 'q4' },
  ]

  const extra = { output, title, prefix, temp, date, basePrefix, footer }
  return { ...defaultSettings, extra, quadrants }
}

export const genRadars = async ({
  radars,
  temp,
  output,
  navFooter,
  basePrefix,
  ctx,
}) => {
  await Promise.all(
    radars.map(async (radar) => {
      radar.temp = await tempDir(temp)
      radar.target = path.join(radar.scope, radar.date)
      radar.output = path.join(output, radar.target)
      radar.prefix = path.join(basePrefix, radar.target)
      radar.basePrefix = basePrefix
      radar.footer = navFooter

      await genMdAssets(radar)
      await render('radar', { ...ctx, ...radar, settings: genRadarSettings(radar) })
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

  await render('root', {
    ...ctx,
    temp: await tempDir(temp),
    output,
    settings: { extra: { radars, scopes, footer: navFooter, title: navTitle } },
  })
}

export const render = async (template, options) => {
  const { temp, output, settings } = options
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
  if (options.templates) {
    await fse.copy(options.templates, temp)
  }

  await elev.init()
  await elev.write()
}
