import Eleventy from '@11ty/eleventy'
import fs from 'fs'
import fsExtra from 'fs-extra'
import { uniq } from 'lodash-es'
import path, { dirname } from 'path'
import { fileURLToPath } from 'url'

import {
  defNavFooter,
  defNavTitle,
  radarSchema,
  tempDir,
  tplNavPage,
} from './constants.js'
import { genMdAssets } from './generateMdAssets.js'
import { sortContextsByDate, writeSettings } from './util.js'
import { validate } from './validator.js'

const __dirname = dirname(fileURLToPath(import.meta.url))

/**
 * generate static sites from array radarDocument
 * @param contexts
 * @param _output
 * @param basePrefix
 */
export const generateStatics = async (contexts, _output, basePrefix) => {
  const statics = await contexts.reduce(async (_r, context) => {
    const _m = await _r
    const { data, base } = context
    if (!validate(data, radarSchema) || Object.keys(data).length === 0)
      return context

    const temp = tempDir
    const output = base ? path.join(_output, base) : _output
    const pathPrefix = basePrefix ? basePrefix + '/' + base : undefined

    global._11ty_ = {
      date: data.meta.date,
      title: data.meta.title,
      output,
      temp,
      pathPrefix,
    }

    try {
      genMdAssets(data, temp)
      writeSettings(data, temp)
      await genEleventy(temp, output)
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

/**
 * generate static site with using 11ty
 * @param temp
 * @param output
 */
export const genEleventy = async (temp, output) => {
  const elev = new Eleventy(temp, output)
  elev.setConfigPathOverride('src/main/js/11ty/.eleventy.cjs')
  await elev.init()
  await elev.write()
  fsExtra.removeSync(temp)
}

export const genNavigationPage = (
  contexts,
  output,
  navPage,
  input,
  navTitle,
  navFooter,
) => {
  if (!navPage) return
  if (!navTitle) navTitle = defNavTitle
  if (!navFooter) navFooter = defNavFooter

  const dirs = contexts.map(({ file }) => path.dirname(file))
  const links = uniq(dirs.map((dir) => dir.split('/').pop())).reduce(
    (r, dir) => ({ ...r, [dir]: [] }),
    {},
  )

  contexts.sort(sortContextsByDate).forEach((context) => {
    const keys = Object.keys(links)
    const key =
      keys.length === 1
        ? keys[0]
        : keys.find((dir) => dir === context.base.split('/')[0])
    if (!key) return
    const link = `<a class="link" href=${context.base}> ${context.data.meta.date} </a>`
    links[key].push(link)
  })

  const li = (link) => `<li>${link}</li>`
  const contentPage = Object.keys(links).map(
    (key) => `<div class="tile">
<h2>${key}</h2>
<ul>
  ${links[key].map(li).join('\n ')}
</ul>
</div>`,
  )

  // Main nav page
  fsExtra.copySync(tplNavPage, output)
  const tplHtml = fs.readFileSync(path.join(output, 'index.html'), 'utf8') // eslint-disable-line sonarjs/no-duplicate-string
  const html = tplHtml
    .replace('#nav_page-content', contentPage.join('\n'))
    .replace('#nav_page-title', navTitle)
    .replace('#nav_page-footer', navFooter)
  fs.writeFileSync(path.join(output, 'index.html'), html)

  // Latest scoped radars aliases
  const redirect = fs.readFileSync(path.resolve(__dirname, '../redirect-page/index.html'), 'utf8')
  Object.entries(contexts.reduce((m, {base, date}) => {
    const scope = path.dirname(base)
    const prev = m[scope]

    if (!prev || prev < date) {
      m[scope] = date
    }
    return m
  }, {})).forEach(([scope, date]) => {
    fs.writeFileSync(path.join(output, scope, 'index.html'), redirect.replace('###', date))
  })
}
