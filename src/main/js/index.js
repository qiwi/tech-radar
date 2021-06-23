import { generateMdAssets } from './generateMdAssets.js'

export const generateTechRadar = async ({ csvPath, outDir }) => {
  generateMdAssets({ csvPath, outDir })
}
