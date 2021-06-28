import parse from 'csv-parse/lib/sync.js'
import fs from 'fs'
import fsExtra from 'fs-extra'
import path from 'path'

const tplPath = path.resolve('src/main/tpl')

export function getQuadrand(quadrant) {
  const langAndFw = 'languages-and-frameworks'
  const platforms = 'platforms'
  const tools = 'tools'
  const techniques = 'techniques'

  const quadrantAliases = {
    langAndFw,
    'languages-and-frameworks': langAndFw,
    language: langAndFw,
    lang: langAndFw,
    lf: langAndFw,
    fw: langAndFw,
    framework: langAndFw,

    platforms,
    platform: platforms,
    pf: platforms,

    tools,
    tool: tools,

    techniques,
    tech: techniques,
  }
  return quadrantAliases[quadrant.toLowerCase()]
}

export function generatePath({ name, quadrant, tempDirResolved }) {
  const entryMdName = name + '.md'
  return path.join(
    tempDirResolved,
    '/entries',
    getQuadrand(quadrant.toLowerCase()),
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
  try {
    const records = parse(radarData, { columns: true })
    records.forEach(({ name, quadrant, ring, description, moved }) => {
      const entryFilePath = generatePath({ name, quadrant, tempDirResolved })
      const content = generateMd({ ring, description, moved })
      fs.writeFileSync(entryFilePath, content)
    })
  } catch (err) {
    console.error(err, 'parser failed')
  }
}
