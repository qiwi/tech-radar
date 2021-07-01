import fs from 'fs'
import fsExtra from 'fs-extra'
import path from 'path'

import {
  langAndFw,
  platforms,
  techniques,
  tools,
} from '../../main/js/constants.js'
import {
  genMdAssets,
  genMdContent,
  genMdPath,
} from '../../main/js/generateMdAssets.js'
import {
  genStatics,
  // genEleventy,
} from '../../main/js/generateStatic.js'
import {
  getDirs,
  getDocuments,
  // getSources,
} from '../../main/js/index.js'
import {
  csvReader,
  getReader,
  jsonReader,
  read,
  yamlReader,
} from '../../main/js/reader.js'

describe('generate md assets', () => {
  it('files write check', () => {
    const csvPath = path.join(__dirname, '../stub/test.csv')
    const outDir = path.join(__dirname, 'temp')

    genMdAssets(read(csvPath), outDir)

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

describe('generate e11y app', () => {
  it('', async () => {
    const csvPath = path.join(__dirname, '../stub/test.csv')
    // const outDir = path.resolve('temp')
    const docs = getDocuments([csvPath])
    const dirs = getDirs([csvPath])
    await genStatics(docs, dirs, 'dist')

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
    const fileStruct = getFileStruct(path.resolve('dist/test'))
    const normalizedFileStruct = fileStruct.map((el) => /dist(.+)/.exec(el)[1])
    expect(normalizedFileStruct).toMatchSnapshot()
  })
  afterAll(() => {
    fsExtra.removeSync(path.resolve('dist'))
    fsExtra.removeSync(path.resolve('temp'))
  })
})

describe('reader.js', () => {
  it('reader', () => {
    expect(read('src/test/stub/test.csv')).toMatchSnapshot()
  })
  it('csvReader', () => {
    expect(csvReader('src/test/stub/test.csv')).toMatchSnapshot()
  })
  it('jsonReader', () => {
    expect(jsonReader('src/test/stub/test.json')).toMatchSnapshot()
  })
  it('yamlReader', () => {
    expect(yamlReader('src/test/stub/test.yml')).toMatchSnapshot()
  })
  it('getReader ', function () {
    expect(getReader('.csv')).toBe(csvReader)
    expect(getReader('.json')).toBe(jsonReader)
    expect(getReader('.yml')).toBe(yamlReader)
  })
})

describe('getDirs', () => {
  const cases = [
    [
      'returns uniq file names with omitted extensions',
      ['/foo/bar/baz.csv', '/foo/bar/qux.csv'],
      ['baz', 'qux'],
    ],
    [
      'append parent dir otherwise',
      ['/foo/bar/data.csv', '/foo/baz/data.json'],
      ['bar-data', 'baz-data'],
    ],
    [
      'makes values unique',
      ['/foo/bar/data.csv', '/foo/bar/data.json', '/foo/bar/data.yaml'],
      ['data', 'data-2', 'data-3'],
    ],
    [
      'makes values unique',
      [
        '/foo/ios/bar/data.csv',
        '/foo/ios/bar/data.json',
        '/foo/js/bar/data.yaml',
        '/foo/js/bar/data.yml',
      ],
      ['ios-bar-data', 'ios-bar-data-2', 'js-bar-data', 'js-bar-data-2'],
    ],
  ]

  cases.forEach(([name, input, result]) => {
    it(name, () => {
      expect(getDirs(input)).toEqual(result)
    })
  })
})
