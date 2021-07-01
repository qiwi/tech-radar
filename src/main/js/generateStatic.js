import Eleventy from '@11ty/eleventy'
import fsExtra from 'fs-extra'
import path from 'path'

import { tempDir } from './constants.js'
import { genMdAssets } from './generateMdAssets.js'

export const genStatics = async (docs, dirs, _output) =>
  docs.reduce(async (r, doc, i) => {
    const temp = tempDir
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
    return [...(await r), output]
  }, [])

export const genEleventy = async (temp, output) => {
  const elev = new Eleventy(temp, output)
  elev.setConfigPathOverride('src/main/js/11ty/.eleventy.cjs')
  await elev.init()
  await elev.write()
  await fsExtra.remove(temp)
}
