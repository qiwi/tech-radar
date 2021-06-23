import { generateMdAssets } from '../../main/js/generateMdAssets.js'
import path from 'path'
import fs from 'fs'

describe('generate md assets', () => {
  it('files write check', () => {
    const csvPath = path.join(__dirname, '../stub/test.csv')
    const outDir = path.join(__dirname, 'temp')
    generateMdAssets({ csvPath, outDir })

    const nameTsMd = 'TypeScript.md'
    const dirLanguagesAndFrameworks = 'languages-and-frameworks'
    const tsMdData = fs.readFileSync(
      path.join(outDir, 'entries', dirLanguagesAndFrameworks, nameTsMd),
      'utf8',
    )
    const contentTs = `---
ring: adopt
---
Статически типизированный ЖС`

    expect(tsMdData).toBe(contentTs)

    const nameNodeMd = 'Nodejs.md'
    const dirPlatforms = 'platforms'
    const nodeMdData = fs.readFileSync(
      path.join(outDir, 'entries', dirPlatforms, nameNodeMd),
      'utf8',
    )
    const contentNode = `---
ring: adopt
---
`

    expect(nodeMdData).toBe(contentNode)

    const nameHexMd = 'Гексагональная архитектура.md'
    const dirTechniques = 'techniques'
    const HexMdData = fs.readFileSync(
      path.join(outDir, 'entries', dirTechniques, nameHexMd),
      'utf8',
    )
    const contentHex = `---
ring: assess
---
Унификации контракта интерфейсов различных слоев приложений`

    expect(HexMdData).toBe(contentHex)

    const nameCodMd = 'Codeclimate.md'
    const dirTools = 'tools'
    const CodMdData = fs.readFileSync(
      path.join(outDir, 'entries', dirTools, nameCodMd),
      'utf8',
    )
    const contentCod = `---
ring: trial
---
Статический анализатор кода`

    expect(CodMdData).toBe(contentCod)
  })
})
