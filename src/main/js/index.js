import { generateMdAssets } from './generateMdAssets.js'
import Eleventy from '@11ty/eleventy'

export const generateTechRadar = async ({ csvPath, outDir }) => {
  generateMdAssets({ csvPath, outDir })
  generateStatics(outDir)
}

export const generateStatics = (outDir) => {
  const elev = new Eleventy(outDir, 'dist')
  elev.setConfigPathOverride('src/main/js/e11y/.eleventy.cjs')
  elev.init().then(()=>{
    elev.write()
  })
}
