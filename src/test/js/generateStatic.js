import fs from 'fs'
import fsExtra from 'fs-extra'
import path from 'path'

import { genStatics } from '../../main/js/generateStatic.js'
import { getDirs, getDocuments } from '../../main/js/index.js'

export const getFileStruct = (dir, result = []) => {
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

const genStaticFileStruct = async (input) => {
  const docs = getDocuments(input)
  const dirs = getDirs(input)
  await genStatics(docs, dirs, 'test', '')

  const fileStruct = getFileStruct(path.resolve('test'))
  return fileStruct.map((el) => /test(.+)/.exec(el)[1])
}

describe('generate 11ty app', () => {
  it('from .csv file', async () => {
    const csvPath = path.join(__dirname, '../stub/test.csv')
    const normalizedFileStruct = await genStaticFileStruct([csvPath])
    expect(normalizedFileStruct).toMatchSnapshot()
  })

  afterEach(() => {
    fsExtra.removeSync(path.resolve('test'))
  })

  it('from multiple files', async () => {
    const csvPath = path.join(__dirname, '../stub/test.csv')
    const jsonPath = path.join(__dirname, '../stub/test.json')
    const yamlPath = path.join(__dirname, '../stub/test.yml')

    const normalizedFileStruct = await genStaticFileStruct([
      csvPath,
      jsonPath,
      yamlPath,
    ])
    expect(normalizedFileStruct).toMatchSnapshot()
  })

  it('from .json file', async () => {
    const jsonPath = path.join(__dirname, '../stub/test.json')

    const normalizedFileStruct = await genStaticFileStruct([jsonPath])
    expect(normalizedFileStruct).toMatchSnapshot()
  })

  it('from .yml file', async () => {
    const yamlPath = path.join(__dirname, '../stub/test.yml')

    const normalizedFileStruct = await genStaticFileStruct([yamlPath])
    expect(normalizedFileStruct).toMatchSnapshot()
  })
})
