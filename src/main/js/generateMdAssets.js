import parse from 'csv-parse/lib/sync.js'
import fs from 'fs'
import fsExtra from 'fs-extra'
import path from 'path'

const tplPath = path.resolve('src/main/tpl')
const alias = {
  'languages-and-frameworks': 'languages-and-frameworks',
  lf: 'languages-and-frameworks',
  Platforms: 'Platforms',
  platforms: 'Platforms',
  Tools: 'Tools',
  tools: 'Tools',
  Techniques: 'Techniques',
  techniques: 'Techniques',
}

export function generatePath({ name, quadrant, tempDirResolved }) {
  const entryMdName = name + '.md'
  return path.join(
    tempDirResolved,
    '/entries',
    alias[quadrant].toLowerCase(),
    entryMdName,
  )
}

export function generateMd({ ring, description, moved }) {
  return `---
ring: ${ring.toLowerCase()}
moved: ${moved || '0'}
---
${description}`
}

export const generateMdAssets = ({ csvPath, tempDir }) => {
  const tempDirResolved = path.resolve(tempDir)
  const csvPathResolved = path.resolve(csvPath)
  fsExtra.copySync(tplPath, tempDirResolved)
  const radarData = fs.readFileSync(csvPathResolved)
  const records = parse(radarData, { columns: true })

  records.forEach(({ name, quadrant, ring, description, moved }) => {
    const entryFilePath = generatePath({ name, quadrant, tempDirResolved })
    const content = generateMd({ ring, description, moved })
    fs.writeFileSync(entryFilePath, content)
  })
}
