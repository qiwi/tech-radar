import fs from 'fs'
import fsExtra from 'fs-extra'
import path from 'path'

import {
  generateMd,
  generateMdAssets,
  generatePath,
} from '../../main/js/generateMdAssets.js'
import { generateStatics } from '../../main/js/index.js'

describe('generate md assets', () => {
  it('files write check', () => {
    const csvPath = path.join(__dirname, '../stub/test.csv')
    const outDir = path.join(__dirname, 'temp')
    generateMdAssets({ csvPath, tempDir: outDir })

    const tsMdData = fs.readFileSync(
      path.join(outDir, 'entries', 'languages-and-frameworks', 'TypeScript.md'),
      'utf8',
    )
    const nodeMdData = fs.readFileSync(
      path.join(outDir, 'entries', 'platforms', 'Nodejs.md'),
      'utf8',
    )
    const hexMdData = fs.readFileSync(
      path.join(
        outDir,
        'entries',
        'techniques',
        'Гексагональная архитектура.md',
      ),
      'utf8',
    )
    const codMdData = fs.readFileSync(
      path.join(outDir, 'entries', 'tools', 'codeclimate.md'),
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
---
Мидвары поверх http-server`
    expect(
      generateMd({ ring: 'Hold', description: 'Мидвары поверх http-server' }),
    ).toBe(contentMd)
  })

  it('generatePath ', () => {
    expect(
      generatePath({
        name: 'Redux',
        quadrant: 'languages-and-frameworks',
        tempDirResolved: 'test',
      }),
    ).toBe('test/entries/languages-and-frameworks/Redux.md')
  })
})

describe('generate e11y app', () => {
  it('', async () => {
    const csvPath = path.join(__dirname, '../stub/test.csv')
    const outDir = path.resolve('temp')
    generateMdAssets({ csvPath, tempDir: outDir })
    global.tempDir = 'temp'
    global.outDir = 'dist'
    await generateStatics(global.tempDir, global.outDir)

    const getFileStruct = (dir, result = []) => {
      fs.readdirSync(dir).forEach((elem) => {
        const elemPath = dir + '/' + elem
        const stat = fs.statSync(elemPath)
        if (stat.isDirectory()) {
          result = [...getFileStruct(elemPath, result)]
        } else {
          result.push(elemPath)
        }
      })
      return result
    }
    const fileStruct = getFileStruct(path.resolve('dist'))
    const normalizedFileStruct = fileStruct.map((el) => /dist(.+)/.exec(el)[1])
    expect(normalizedFileStruct).toMatchSnapshot()
  })
  afterAll(() => {
    fsExtra.removeSync(path.resolve('dist'))
    fsExtra.removeSync(path.resolve('temp'))
  })
})
