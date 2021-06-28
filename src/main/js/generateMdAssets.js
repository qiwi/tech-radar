import parse from 'csv-parse/lib/sync.js'
import fs from 'fs'
import fsExtra from 'fs-extra'
import path from 'path'

const tplPath = path.resolve('src/main/tpl')

export const langAndFw = 'languages-and-frameworks'
export const platforms = 'platforms'
export const tools = 'tools'
export const techniques = 'techniques'

export function getQuadrant(quadrant) {
  const quadrantAliases = {
    [langAndFw]: langAndFw,
    'languages-and-framework': langAndFw,
    language: langAndFw,
    lang: langAndFw,
    lf: langAndFw,
    fw: langAndFw,
    framework: langAndFw,

    [platforms]: platforms,
    platform: platforms,
    pf: platforms,

    [tools]: tools,
    tool: tools,

    [techniques]: techniques,
    tech: techniques,
  }

  return quadrantAliases[quadrant.toLowerCase()]
}

export function generatePath({ name, quadrant, tempDirResolved }) {
  const entryMdName = name + '.md'
  const quadrantAlias = getQuadrant(quadrant.toLowerCase())

  if (!quadrantAlias) {
    throw new Error(
      `Parsing error: invalid quadrant - "${quadrant}" name - "${name}"`,
    )
  }

  return path.join(tempDirResolved, '/entries', quadrantAlias, entryMdName)
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
      try {
        const entryFilePath = generatePath({ name, quadrant, tempDirResolved })
        const content = generateMd({ ring, description, moved })
        fs.writeFileSync(entryFilePath, content)
      } catch (err) {
        console.error(err)
      }
    })
  } catch (err) {
    console.error(err)
  }
}
