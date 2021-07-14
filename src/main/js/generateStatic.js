import Eleventy from '@11ty/eleventy'
import fsExtra from 'fs-extra'
import path from 'path'

import { radarSchema, tempDir } from './constants.js'
import { genMdAssets, genParamMove } from './generateMdAssets.js'
import { writeSettings } from './util.js'
import { validate } from './validator.js'

/**
 * generate static sites from array radarDocument
 * @param contexts
 * @param _output
 * @param basePrefix
 * @param intermediate
 */
export const generateStatics = async (
  contexts,
  _output,
  basePrefix,
  intermediate,
  autoscope,
) =>
  contexts.reduce(async (_r, context) => {
    const _m = await _r
    const { data, base, file, date } = context
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
    const modContext = {}
    try {
      modContext.data = autoscope
        ? genParamMove(file, data, intermediate, date)
        : data
      genMdAssets(modContext.data, temp)
      writeSettings(modContext.data, temp)
      await genEleventy(temp, output)
    } catch (err) {
      console.error('genStatics', err)
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
  fsExtra.removeSync(temp)
}
