import { generateTechRadar } from '../../main/js/index'
import path from 'path'
import fs from 'fs'

describe('tech radar', () => {
  it('', () => {
    const csvPath = path.join(__dirname, '../stub/test.csv')
    const outDir = path.join(__dirname, 'temp')
    generateTechRadar({ csvPath, outDir })
    const elementName = 'TypeScript.md'
    const quadrant = 'languages-and-frameworks'.toLowerCase()
    const fileContent = fs.readFileSync(
      path.join(outDir, 'entries', quadrant, elementName),
      'utf8',
    )

    const content = `---
ring: ${'Adopt'.toLowerCase()}
---
Статически типизированный ЖС`

    expect(fileContent).toBe(content)
  })
})
