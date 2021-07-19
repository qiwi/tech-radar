import Eleventy from '@11ty/eleventy'
import fs from "fs";
import fsExtra from 'fs-extra'
import path from 'path'

import {radarSchema, tempDir, tplNavPage} from './constants.js'
import { genMdAssets } from './generateMdAssets.js'
import {sortContextsByDate, writeSettings} from './util.js'
import { validate } from './validator.js'


/**
 * generate static sites from array radarDocument
 * @param contexts
 * @param _output
 * @param basePrefix
 */
export const generateStatics = async (contexts, _output, basePrefix) => {
  const statics = await contexts.reduce(async (_r, context) => {
    const _m = await _r
    const {data, base} = context
    if (!validate(data, radarSchema) || Object.keys(data).length === 0)
      return context

    const temp = tempDir
    const output = base ? path.join(_output, base) : _output
    const pathPrefix = basePrefix ? basePrefix + '/' + base : undefined

    global._11ty_ = {
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
  return contexts.map(context => ({...context, prefix:basePrefix ? basePrefix + '/' + context.base : context.base}))
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

export const genNavigationPage = (contexts, output, navPage, input) => {
  if (!navPage) return

  const links = fs.readdirSync(input.split('/')[0], { withFileTypes: true })
    .filter(dir => dir.isDirectory())
    .reduce((r, dir) => {
      return {...r, [dir.name]: []}
    }, {})

  contexts.sort(sortContextsByDate).forEach(context => {
    const key = Object.keys(links).find(dir => dir === context.base.split('-')[0])
    if (!key) return
    const link = `<a href=${context.prefix}> ${context.data.meta.date} </a>`
    links[key].push(link)
  })

  const li = link => `<li>${link}</li>`
  const contentPage = Object.keys(links)
    .map(key => `<div class="tile">
<h2>${key}</h2>
<ul>
  ${links[key].map(li).join('\n ')}
</ul>
</div>`)

  fsExtra.copySync(tplNavPage, output)
  const tplHtml = fs.readFileSync(path.join(output, 'index.html'), 'utf8')
  const html = tplHtml.replace('#nav_page-content', contentPage.join('\n'))

  fs.writeFileSync(path.join(output, 'index.html'), html)
}
