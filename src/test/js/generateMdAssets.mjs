import fs from 'fs'
import fsExtra from 'fs-extra'
import path from 'path'

import {
  langAndFw,
  // platforms,
  // techniques,
  // tools,
} from '../../main/js/constants'
import {
  genMdAssets,
  genMdContent,
  genMdPath,
} from '../../main/js/generateMdAssets.js'
import { read } from '../../main/js/reader'

describe('generate md assets', () => {
  it('files write check', () => {
    const csvPath = path.join(__dirname, '../stub/test.csv')
    const outDir = path.join(__dirname, 'temp')

    genMdAssets(read(csvPath), outDir)

    const tsMdData = fs.readFileSync(
      path.join(outDir, 'entries', 'q1', 'TypeScript.md'),
      'utf8',
    )
    const nodeMdData = fs.readFileSync(
      path.join(outDir, 'entries', 'q2', 'Nodejs.md'),
      'utf8',
    )
    const hexMdData = fs.readFileSync(
      path.join(outDir, 'entries', 'q4', 'Гексагональная архитектура.md'),
      'utf8',
    )
    const codMdData = fs.readFileSync(
      path.join(outDir, 'entries', 'q3', 'codeclimate.md'),
      'utf8',
    )

    expect({ tsMdData, nodeMdData, hexMdData, codMdData }).toMatchSnapshot()
  })
  afterAll(() => {
    fsExtra.removeSync(path.join(__dirname, 'temp'))
  })

  it('generateMd ', () => {
    const contentMd = `---
ring: hold
moved: 0
---
Мидвары поверх http-server`
    expect(
      genMdContent({ ring: 'Hold', description: 'Мидвары поверх http-server' }),
    ).toBe(contentMd)
  })

  it('generatePath ', () => {
    expect(
      genMdPath({
        name: 'Redux',
        quadrant: langAndFw,
        temp: 'test',
      }),
    ).toBe('test/entries/languages-and-frameworks/Redux.md')
  })
})
