import Eleventy from '@11ty/eleventy'
import fsExtra from 'fs-extra'
import path from 'path'

import { generateMdAssets } from './generateMdAssets.js'

export const generateTechRadar = async ({ csvPath, outDir }) => {
  global.outDir = outDir
  const tempDir = 'temp'
  global.tempDir = tempDir
  generateMdAssets({ csvPath, tempDir })
  await generateStatics(tempDir, outDir)
}

export const generateStatics = async (tempDir, outDir) => {
  const elev = new Eleventy(tempDir, outDir)
  elev.setConfigPathOverride('src/main/js/e11y/.eleventy.cjs')
  await elev.init()
  await elev.write()
  fsExtra.removeSync(path.resolve(tempDir))
}
