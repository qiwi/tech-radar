import Eleventy from '@11ty/eleventy'
import fsExtra from 'fs-extra'
import path from 'path'

import { radarSchema } from './constants.js'
import { genMdAssets } from './generateMdAssets.js'
import {getTemp} from "./util.js";
import { validate } from './validator.js'

/**
 * generate static sites from array radarDocument
 * @param docs
 * @param dirs
 * @param _output
 */
export const genStatics = async (docs, dirs, _output) =>
  docs.reduce(async (r, doc, i) => {
    const _m = await r
    if (!validate(doc, radarSchema) || Object.keys(doc).length === 0)
      return [..._m]

    const temp = getTemp()
    const output = dirs[i] ? path.join(_output, dirs[i]) : _output

    global._11ty_ = {
      title: doc.meta.title,
      output,
      temp,
    }
    try {
      genMdAssets(doc, temp)
      await genEleventy(temp, output)
    } catch (err) {
      console.error(err)
    }
    return [..._m, output]
  }, [])

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
