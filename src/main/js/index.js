// import fs from 'fs'
// import parse from 'csv-parse/lib/sync'
import path from 'path'
import fsExtra from 'fs-extra'
import fs from 'fs'
import parse from 'csv-parse/lib/sync.js'

const tplPath = 'src/main/tpl'

export const generateTechRadar = ({ csvPath, outDir }) => {
  const outDirResolved = path.resolve(outDir)
  const csvPathResolved = path.resolve(csvPath)
  fsExtra.copySync(tplPath, outDirResolved)

  const fileContent = fs.readFileSync(csvPathResolved)
  const records = parse(fileContent, { columns: true })
  records.map(function (element) {
    try {
      const filePath = path.join(
        outDirResolved,
        '/entries',
        element.quadrant.toLowerCase(),
        `${element.name
          .replace('/', ' ')
          .replace(/^\w/, (c) => c.toUpperCase())}.md`,
      )

      const content = `---
ring: ${element.ring.toLowerCase()}
---
${element.description}`

      fs.writeFileSync(filePath, content)
    } catch (err) {
      console.log('Element - ', element)
      console.log('Error - ', err)
    }
  })
}
