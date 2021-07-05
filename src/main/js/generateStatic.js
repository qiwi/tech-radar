import Eleventy from '@11ty/eleventy'
import fsExtra from 'fs-extra'
import path from 'path'

import { radarSchema } from './constants.js'
import { genMdAssets } from './generateMdAssets.js'
import { getTemp } from './util.js'
import { validate } from './validator.js'

/**
 * generate static sites from array radarDocument
 * @param docs
 * @param dirs
 * @param _output
 */
export const genStatics = async (docs, dirs, _output) => {
  const result = []
  for (const doc of docs) {
    const i = docs.indexOf(doc)
    if (!validate(doc, radarSchema) || Object.keys(doc).length === 0) continue
    console.log(doc.meta.title)
    const temp = getTemp()
    // const temp = tempDir
    const output = dirs[i] ? path.join(_output, dirs[i]) : _output

    global._11ty_ = {
      title: doc.meta.title,
      output,
      temp,
    }
    console.log('0', global._11ty_)
    try {
      genMdAssets(doc, temp)
      await genEleventy(temp, output)
    } catch (err) {
      console.error(err)
      await fsExtra.remove(temp)
    }
    console.log('1', global._11ty_)
    result.push(output)
  }
  return result
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
  await fsExtra.remove(temp)
}
