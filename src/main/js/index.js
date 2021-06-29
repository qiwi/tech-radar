import Eleventy from '@11ty/eleventy'
import fs from 'fs'
import fsExtra from 'fs-extra'
import path from 'path'

import { generateMdAssets } from './generateMdAssets.js'

export const generateTechRadar = async (csvPath, outDir) => {
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

export const startGenerateTechRadars = async ({ csvPath, outDir }) => {
  if (csvPath.includes('.csv', csvPath.length - 4)) {
    await generateTechRadar(csvPath, outDir)
    return
  }
  for (const fileName of fs.readdirSync(csvPath)) {
    if (!fileName.includes('.csv', fileName.length - 4)) {
      continue
    }
    const radarPath = path.join(outDir, fileName.split('.')[0])
    await generateTechRadar(path.join(csvPath, fileName), radarPath)
  }
}
