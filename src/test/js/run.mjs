import fs from 'fs'
import fsExtra from 'fs-extra'
import path from 'path'

import { run } from '../../main/js/index.js'
import {fileURLToPath} from 'url'

const __dirname = path.dirname(fileURLToPath(import.meta.url))

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
  const dataPath = 'src/test/stub/data/**'
  const indexPath = path.join('test', 'index.html')
  it('generate navigation page', async () => {
    await run({ input: dataPath, output: 'test', navPage: true })
    const index = fs.readFileSync(indexPath, 'utf8')
    expect(index).toMatchSnapshot()
  })
  it('generate navigation page title', async () => {
    await run({
      input: dataPath,
      output: 'test',
      navPage: true,
      navTitle: 'title',
    })
    const index = fs.readFileSync(indexPath, 'utf8')
    expect(index).toMatchSnapshot()
  })
  it('generate navigation page footer', async () => {
    await run({
      input: dataPath,
      output: 'test',
      navPage: true,
      navFooter: 'footer',
    })
    const index = fs.readFileSync(indexPath, 'utf8')
    expect(index).toMatchSnapshot()
  })
  it('generate navigation page of data2', async () => {
    await run({
      input: 'src/test/stub/data2/**',
      output: 'test',
      navPage: true,
      autoscope: true
    })
    const index = fs.readFileSync(indexPath, 'utf8')
    expect(index).toMatchSnapshot()
  })
})
