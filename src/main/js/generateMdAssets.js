import parse from 'csv-parse/lib/sync.js'
import fs from 'fs'
import fsExtra from 'fs-extra'
import path from 'path'

const tplPath = path.resolve('src/main/tpl')

export function generatePath({ name, quadrant, tempDirResolved }) {
  const entryMdName = name + '.md'
  return path.join(
    tempDirResolved,
    '/entries',
    quadrant.toLowerCase(),
    entryMdName,
  )
}

export function generateMd({ ring, description }) {
  return `---
ring: ${ring.toLowerCase()}
---
${description}`
}

export const generateMdAssets = ({ csvPath, tempDir }) => {
  const tempDirResolved = path.resolve(tempDir)
  const csvPathResolved = path.resolve(csvPath)
  fsExtra.copySync(tplPath, tempDirResolved)
  const radarData = fs.readFileSync(csvPathResolved)
  const records = parse(radarData, { columns: true })

  records.forEach(({ name, quadrant, ring, description }) => {
    const entryFilePath = generatePath({ name, quadrant, tempDirResolved })
    const content = generateMd({ ring, description })
    fs.writeFileSync(entryFilePath, content)
  })
}
