import fs from 'fs'
import fsExtra from 'fs-extra'
import path from 'path'

import {
  generateMd,
  generateMdAssets,
  generatePath,
  getQuadrant,
  langAndFw,
  platforms,
  techniques,
  tools,
} from '../../main/js/generateMdAssets.js'
import {
  generateStatics,
  startGenerateTechRadars,
} from '../../main/js/index.js'

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

describe('generate md assets', () => {
  it('files write check', () => {
    const csvPath = path.join(__dirname, '../stub/test.csv')
    const outDir = path.join(__dirname, 'temp')
    generateMdAssets({ csvPath, tempDir: outDir })

    const tsMdData = fs.readFileSync(
      path.join(outDir, 'entries', langAndFw, 'TypeScript.md'),
      'utf8',
    )
    const nodeMdData = fs.readFileSync(
      path.join(outDir, 'entries', platforms, 'Nodejs.md'),
      'utf8',
    )
    const hexMdData = fs.readFileSync(
      path.join(outDir, 'entries', techniques, 'Гексагональная архитектура.md'),
      'utf8',
    )
    const codMdData = fs.readFileSync(
      path.join(outDir, 'entries', tools, 'codeclimate.md'),
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
      generateMd({ ring: 'Hold', description: 'Мидвары поверх http-server' }),
    ).toBe(contentMd)
  })

  it('generatePath ', () => {
    expect(
      generatePath({
        name: 'Redux',
        quadrant: langAndFw,
        tempDirResolved: 'test',
      }),
    ).toBe('test/entries/languages-and-frameworks/Redux.md')
  })

  it('getQuadrant ', function () {
    expect(getQuadrant('lang')).toBe(langAndFw)
    expect(getQuadrant('platforms')).toBe('platforms')
    expect(getQuadrant('tool')).toBe('tools')
    expect(getQuadrant('tech')).toBe('techniques')
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
    const fileStruct = getFileStruct(path.resolve('dist'))
    const normalizedFileStruct = fileStruct.map((el) => /dist(.+)/.exec(el)[1])
    expect(normalizedFileStruct).toMatchSnapshot()
  })
  afterAll(() => {
    fsExtra.removeSync(path.resolve('dist'))
    fsExtra.removeSync(path.resolve('temp'))
  })
})

describe('startGenerateTechRadars', () => {
  it('path to the folder with csv files', async () => {
    await startGenerateTechRadars({ csvPath: 'src/test/stub', outDir: 'test' })
    const fileStruct = getFileStruct(path.resolve('test'))
    const normalizedFileStruct = fileStruct.map((el) => /test(.+)/.exec(el)[1])
    expect(normalizedFileStruct).toMatchSnapshot()
  })
  afterEach(() => {
    fsExtra.removeSync(path.resolve('test'))
  })
  it('path to the csv file ', async () => {
    await startGenerateTechRadars({
      csvPath: 'src/test/stub/test.csv',
      outDir: 'test',
    })
    const fileStruct = getFileStruct(path.resolve('test'))
    const normalizedFileStruct = fileStruct.map((el) => /test(.+)/.exec(el)[1])
    expect(normalizedFileStruct).toMatchSnapshot()
  })
  afterEach(() => {
    fsExtra.removeSync(path.resolve('test'))
  })
})
