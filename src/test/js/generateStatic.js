import fs from 'fs'
import fsExtra from 'fs-extra'
import path from 'path'

import { run } from '../../main/js/index.js'

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

describe('generate 11ty app', () => {
  it('from .csv file', async () => {
    const csvPath = path.join(__dirname, '../stub/test.csv')
    await run({ input: csvPath, output: 'test' })
    const normalizedFileStruct = getFileStruct('test')
    expect(normalizedFileStruct).toMatchSnapshot()
  })

  afterEach(() => {
    fsExtra.removeSync(path.resolve('test'))
  })

  it('from multiple files with the same date', async () => {
    await run({ input: 'src/test/stub/test.{csv,json,yaml}', output: 'test' })
    const normalizedFileStruct = getFileStruct('test')
    expect(normalizedFileStruct).toMatchSnapshot()
  })

  it('from multiple files', async () => {
    await run({ input: 'src/test/stub/test.{csv,json}', output: 'test' })
    const normalizedFileStruct = getFileStruct('test')
    expect(normalizedFileStruct).toMatchSnapshot()
  })

  it('from .json file', async () => {
    const jsonPath = path.join(__dirname, '../stub/test.json')
    await run({ input: jsonPath, output: 'test' })
    const normalizedFileStruct = getFileStruct('test')
    expect(normalizedFileStruct).toMatchSnapshot()
  })

  it('from .yml file', async () => {
    const yamlPath = path.join(__dirname, '../stub/test.yml')

    await run({ input: yamlPath, output: 'test' })
    const normalizedFileStruct = getFileStruct('test')
    expect(normalizedFileStruct).toMatchSnapshot()
  })
})
