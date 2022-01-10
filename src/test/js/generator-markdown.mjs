import fs from 'fs'
import fse from 'fs-extra'
import path from 'path'

import {
  genMdAssets,
  genMdContent,
  genMdPath,
} from '../../main/js/generator/markdown.js'
import { parse } from '../../main/js/parser'
import {fileURLToPath} from 'url'

const __dirname = path.dirname(fileURLToPath(import.meta.url))
export const langAndFw = 'languages-and-frameworks'

describe('generate md assets', () => {
  it('files write check', async () => {
    const csvPath = path.join(__dirname, '../stub/test.csv')
    const outDir = path.join(__dirname, 'temp')

    await genMdAssets({
      document: await parse(csvPath),
      temp: outDir
    })

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
    fse.removeSync(path.join(__dirname, 'temp'))
  })

  it('generateMd ', () => {
    const contentMd = `---
ring: Hold
moved: undefined
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
