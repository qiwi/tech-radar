import parse from 'csv-parse/lib/sync.js'
import fs from 'fs'
import fsExtra from 'fs-extra'
import path from 'path'

const tplPath = path.resolve('src/main/tpl')

export const generateMdAssets = ({ csvPath, tempDir }) => {
  const tempDirResolved = path.resolve(tempDir)
  const csvPathResolved = path.resolve(csvPath)
  fsExtra.copySync(tplPath, tempDirResolved)
  const radarData = fs.readFileSync(csvPathResolved)
  const records = parse(radarData, { columns: true })
  records.forEach((element) => {
    try {
      const entryMdName = element.name + '.md'
      const entryFilePath = path.join(
          tempDirResolved,
        '/entries',
        element.quadrant.toLowerCase(),
          entryMdName
      )

      const content = `---
ring: ${element.ring.toLowerCase()}
---
${element.description}`

      fs.writeFileSync(entryFilePath, content)
    } catch (err) {
      console.log('Element -', element)
      console.log('Error -', err)
    }
  })
}
