import Eleventy from '@11ty/eleventy'
import fse from 'fs-extra'
import { uniq } from 'lodash-es'
import path, { dirname } from 'path'
import { fileURLToPath } from 'url'

import {
  defNavFooter,
  defNavTitle,
  radarSchema, settings as defaultSettings,
  tplNavPage,
} from '../constants.js'
import { genMdAssets } from './markdown.js'
import { sortContextsByDate, writeSettings } from '../util.js'
import { validate } from '../validator.js'

const __dirname = dirname(fileURLToPath(import.meta.url))
const tplDir = path.resolve(__dirname, '../../tpl')

/**
 * generate static sites from array radarDocument
 * @param contexts
 * @param _output
 * @param basePrefix
 */
export const generateStatics = async (contexts, _output, basePrefix, temp) => {
  return

  const statics = await contexts.reduce(async (_r, context) => {
    const _m = await _r
    const { data, base } = context
    if (!validate(data, radarSchema) || Object.keys(data).length === 0)
      return context

    const output = base ? path.join(_output, base) : _output
    const pathPrefix = basePrefix ? basePrefix + '/' + base : undefined
    Object.assign(context, {
      date: data.meta.date,
      title: data.meta.title,
      temp,
      output,
      pathPrefix
    })

    try {
      genMdAssets(context)
      writeSettings(context)
      await genEleventy(context)
    } catch (err) {
      console.error('genStatics', err)
    }
    return [..._m, output]
  }, [])
  console.log('statics=', statics)
  return contexts.map((context) => ({
    ...context,
    prefix: basePrefix ? basePrefix + '/' + context.base : context.base,
  }))
}

export const genConfig = async ({temp, output, title, prefix, date}) => {
  const configExtPath = path.resolve(__dirname, '.eleventy.cjs')
  const configMixin = {extra: {temp, title, prefix, date, output }}
  const configPath = path.join(temp, 'config.js')
  const configContents = `
module.exports = (config) => require('${configExtPath}')(Object.assign(config, ${JSON.stringify(configMixin)}))
`
  await fse.writeFile(configPath, configContents, 'utf8')

  return configPath
}

export const genSettings = async ({temp, document, title, prefix, date, output}) => {
  const quadrants = [
    { name: document.quadrantTitles.q1 || 'Q1', id: 'q1' },
    { name: document.quadrantTitles.q2 || 'Q2', id: 'q2' },
    { name: document.quadrantTitles.q3 || 'Q3', id: 'q3' },
    { name: document.quadrantTitles.q4 || 'Q4', id: 'q4' },
  ]

  const extra = { output, title, prefix, temp, date }
  const settins = {...defaultSettings, extra, quadrants}
  const settingsPath = path.join(temp, '_data/settins.json')

  await fse.writeFile(settingsPath, JSON.stringify(settins))
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

export const genStatics = async(radar) => {
  await fse.copy(tplDir, radar.temp)
  await genEleventy(radar)
}

export const genRedirects = async({radars, output}) => {
  const redirectTpl = await fse.readFile(path.join(tplDir, 'redirect-page/index.html'), 'utf8')

  await Promise.all(Object.entries(radars.reduce((m, {scope, date}) => {
    const prev = m[scope]

    if (!prev || prev < date) {
      m[scope] = date
    }
    return m
  }, {})).map(([scope, date]) =>
    fse.writeFile(path.join(output, scope, 'index.html'), redirectTpl.replace('###', date))
  ))
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

  const headers = uniq(radars.map(r => r.scope))
  const navBlock = headers
    .map((_scope) => `<div class="tile">
<h2>${_scope}</h2>
<ul>
  ${
    radars
      .filter(({scope}) => scope === _scope)
      .map(({prefix, date}) => `<li><a class="link" href=${prefix}> ${date}</a></li>`)
      .join('\n')
  }
</ul>
</div>`)
    .join('\n')


  // Main nav page
  await fse.copy(path.join(tplDir, 'nav-page'), output)
  const tplHtml = await fse.readFile(path.join(output, 'index.html'), 'utf8') // eslint-disable-line sonarjs/no-duplicate-string
  const html = tplHtml
    .replace('#nav_page-content', navBlock)
    .replace('#nav_page-title', navTitle)
    .replace('#nav_page-footer', navFooter)

  await fse.writeFile(path.join(output, 'index.html'), html)

  // Latest scoped radars aliases
  // const redirect = fse.readFileSync(path.resolve(__dirname, '../redirect-page/index.html'), 'utf8')
  // Object.entries(contexts.reduce((m, {base, date}) => {
  //   const scope = path.dirname(base)
  //   const prev = m[scope]
  //
  //   if (!prev || prev < date) {
  //     m[scope] = date
  //   }
  //   return m
  // }, {})).forEach(([scope, date]) => {
  //   fse.writeFileSync(path.join(output, scope, 'index.html'), redirect.replace('###', date))
  // })
}
