import Eleventy from '@11ty/eleventy'
import fse from 'fs-extra'
import { uniq } from 'lodash-es'
import { nanoid } from 'nanoid'
import path from 'path'

import { __dirname, settings as defaultSettings, tplDir } from './constants.js'
import { genMdAssets } from './markdown.js'
import { mkdirp } from '../util.js'

export const genConfig = async ({ temp, output, prefix,}) => {
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

export const genRadars = async ({radars, temp, output, navFooter, basePrefix}) => {
  await Promise.all(
    radars.map(async (radar) => {
      radar.temp = await mkdirp(path.join(temp, nanoid(5)))
      radar.target = path.join(radar.scope, radar.date)
      radar.output = path.join(output, radar.target)
      radar.prefix = path.join(basePrefix, radar.target)
      radar.basePrefix = basePrefix
      radar.footer = navFooter

      await genMdAssets(radar)
      await render('radar', {...radar, settings: genRadarSettings(radar)})
    }),
  )
}

export const genRedirects = async ({ radars, output, ctx }) => {
  await Promise.all(
    Object.entries(
      radars.reduce((m, { scope, date }) => {
        const prev = m[scope]

        if (scope !== '.' && (!prev || prev < date)) {
          m[scope] = date
        }
        return m
      }, {}),
    ).map(([scope, date]) =>
      render('redirect', {
        ...ctx,
        output: path.join(output, scope),
        date,
        settings: { extra: { date } }
      }),
    ),
  )
}

export const _genRedirects = async ({ radars, output, ctx }) => {
  const redirectTpl = await fse.readFile(
    path.join(tplDir, 'redirect-page/index.html'),
    'utf8',
  )

  await Promise.all(
    Object.entries(
      radars.reduce((m, { scope, date }) => {
        const prev = m[scope]

        if (scope !== '.' && (!prev || prev < date)) {
          m[scope] = date
        }
        return m
      }, {}),
    ).map(([scope, date]) =>
      fse.outputFile(
        path.join(output, scope, 'index.html'), // eslint-disable-line sonarjs/no-duplicate-string
        redirectTpl.replace('###', date),
      ),
    ),
  )
}

export const genNavPage = async ({
  radars,
  output,
  navPage,
  navTitle,
  navFooter,
}) => {
  if (!navPage) return

  const headers = uniq(radars.map((r) => r.scope))
  const navBlock = headers
    .map(
      (_scope) => `<div class="tile">
<h2>${_scope}</h2>
<ul>
  ${radars
    .filter(({ scope }) => scope === _scope)
    .map(
      ({ target, date }) =>
        `<li><a class="link" href="${target}"> ${date}</a></li>`, // eslint-disable-line sonarjs/no-nested-template-literals
    )
    .join('\n')}
</ul>
</div>`,
    )
    .join('\n')

  await fse.copy(path.join(tplDir, 'nav-page'), output)
  const tplHtml = await fse.readFile(path.join(output, 'index.html'), 'utf8') // eslint-disable-line sonarjs/no-duplicate-string
  const html = tplHtml
    .replace('#nav_page-content', navBlock)
    .replace('#nav_page-title', navTitle)
    .replace('#nav_page-footer', navFooter)

  await fse.outputFile(path.join(output, 'index.html'), html)
}

export const render = async (template, options) => {
  const temp = await mkdirp(path.join(options.temp, nanoid(5)))
  const configPath = await genConfig({ ...options, temp })
  const elev = new Eleventy(temp, options.output, { configPath })

  await fse.copy(tplDir, temp)
  await fse.outputFile(path.join(temp, '_data/settings.json'), JSON.stringify(options.settings))
  await fse.outputFile(path.join(temp, 'index.njk'), `---
layout: ${template}.njk
---
`)
  await elev.init()
  await elev.write()
}
