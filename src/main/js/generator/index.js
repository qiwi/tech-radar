import Eleventy from '@11ty/eleventy'
import fse from 'fs-extra'
import { uniq } from 'lodash-es'
import path from 'path'

import {
  defNavFooter,
  defNavTitle,
  settings as defaultSettings,
  tplDir,
  __dirname,
} from './constants.js'
import { genMdAssets } from './markdown.js'

export const genConfig = async ({ temp, output, title, prefix, date }) => {
  const configExtPath = path.resolve(__dirname, '.eleventy.cjs')
  const configMixin = { extra: { temp, title, prefix, date, output } }
  const configPath = path.join(temp, 'config.js')
  const configContents = `
module.exports = (config) => require('${configExtPath}')(Object.assign(config, ${JSON.stringify(
    configMixin,
  )}))
`
  await fse.writeFile(configPath, configContents, 'utf8')

  return configPath
}

export const genSettings = async ({
  temp,
  document,
  title,
  prefix,
  date,
  output,
}) => {
  const quadrants = [
    { name: document.quadrantTitles.q1 || 'Q1', id: 'q1' },
    { name: document.quadrantTitles.q2 || 'Q2', id: 'q2' },
    { name: document.quadrantTitles.q3 || 'Q3', id: 'q3' },
    { name: document.quadrantTitles.q4 || 'Q4', id: 'q4' },
  ]

  const extra = { output, title, prefix, temp, date }
  const settings = { ...defaultSettings, extra, quadrants }
  const settingsPath = path.join(temp, '_data/settings.json')

  await fse.writeFile(settingsPath, JSON.stringify(settings))
}

/**
 * generate static site with using 11ty
 * @param radar
 */
export const genEleventy = async (radar) => {
  await fse.copy(tplDir, radar.temp)

  const configPath = await genConfig(radar)
  await genMdAssets(radar)
  await genSettings(radar)

  const elev = new Eleventy(radar.temp, radar.output, { configPath })

  await elev.init()
  await elev.write()
}

export const genRedirects = async ({ radars, output }) => {
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
      fse.writeFile(
        path.join(output, scope, 'index.html'),
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
  if (!navTitle) navTitle = defNavTitle
  if (!navFooter) navFooter = defNavFooter

  const headers = uniq(radars.map((r) => r.scope))
  const navBlock = headers
    .map(
      (_scope) => `<div class="tile">
<h2>${_scope}</h2>
<ul>
  ${radars
    .filter(({ scope }) => scope === _scope)
    .map(
      ({ prefix, date }) =>
        `<li><a class="link" href="/${prefix}"> ${date}</a></li>`,
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

  await fse.writeFile(path.join(output, 'index.html'), html)
}
