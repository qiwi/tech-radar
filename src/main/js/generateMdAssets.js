import path from 'path'
import fsExtra from 'fs-extra'
import fs from 'fs'
import parse from 'csv-parse/lib/sync.js'

const tplPath = path.resolve('src/main/tpl')

export const generateMdAssets = ({ csvPath, outDir }) => {
  const outDirResolved = path.resolve(outDir)
  const csvPathResolved = path.resolve(csvPath)
  fsExtra.copySync(tplPath, outDirResolved)

  const radarData = fs.readFileSync(csvPathResolved)
  const records = parse(radarData, { columns: true })
  records.forEach((element) => {
    try {
      const entryMdName = element.name + '.md'
      const entryFilePath = path.join(
        outDirResolved,
        '/entries',
        element.quadrant.toLowerCase(),
      )

      const content = `---
ring: ${element.ring.toLowerCase()}
---
${element.description}`

      fs.writeFileSync(entryFilePath + entryMdName, content)
    } catch (err) {
      console.log('Element - ', element)
      console.log('Error - ', err)
    }
  })
}
