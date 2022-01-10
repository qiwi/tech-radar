import fse from 'fs-extra'
import path from 'path'
import {fileURLToPath} from 'url'

import { run } from '../../main/js/index.js'
import { tempDir } from '../../main/js/util.js'

const __dirname = path.dirname(fileURLToPath(import.meta.url))
const out = path.resolve(process.cwd(), 'test')
const input = path.join(__dirname, '../stub/data/**')

export const getFileStruct = (dir, result = []) => {
  fse.readdirSync(dir).forEach((elem) => {
    const elemPath = dir + '/' + elem
    const stat = fse.statSync(elemPath)
    if (stat.isDirectory()) {
      result = [...getFileStruct(elemPath, result)]
    } else {
      result.push(elemPath)
    }
  })
  return result
}

afterAll(async () => await fse.remove(out))

describe('generate 11ty app', () => {
  it('from .csv file', async () => {
    const csvPath = path.join(__dirname, '../stub/test.csv')
    const output = await tempDir(out)

    await run({ input: csvPath, output})
    const normalizedFileStruct = getFileStruct('test')
    expect(normalizedFileStruct).toMatchSnapshot()
  })

  it('from multiple files with the same date', async () => {
    const output = await tempDir(out)
    await run({ input: 'src/test/stub/test.{csv,json,yaml}', output })
    const normalizedFileStruct = getFileStruct('test')
    expect(normalizedFileStruct).toMatchSnapshot()
  })

  it('from multiple files', async () => {
    const output = await tempDir(out)
    await run({ input: 'src/test/stub/test.{csv,json}', output })
    const normalizedFileStruct = getFileStruct('test')
    expect(normalizedFileStruct).toMatchSnapshot()
  })

  it('from .json file', async () => {
    const input = path.join(__dirname, '../stub/test.json')
    const output = await tempDir(out)

    await run({ input, output })
    const normalizedFileStruct = getFileStruct('test')
    expect(normalizedFileStruct).toMatchSnapshot()
  })

  it('from .yml file', async () => {
    const input = path.join(__dirname, '../stub/test.yml')
    const output = await tempDir(out)

    await run({ input, output })
    const normalizedFileStruct = getFileStruct('test')
    expect(normalizedFileStruct).toMatchSnapshot()
  })


  it('generate navigation page', async () => {
    const output = await tempDir(out)
    await run({ input, output, navPage: true })
    expect(fse.readFileSync(path.join(output, 'index.html'),'utf8')).toMatchSnapshot()
  })

  it('generate navigation page title', async () => {
    const output = await tempDir(out)
    await run({
      input,
      output,
      navPage: true,
      navTitle: 'title',
    })
    expect(fse.readFileSync(path.join(output, 'index.html'),'utf8')).toMatchSnapshot()
  })

  it('generate custom navigation page: title, footer', async () => {
    const output = await tempDir(out)
    await run({
      input,
      output,
      navTitle: 'test',
      navPage: true,
      templates: path.join(__dirname, '../tpl')
    })
    expect(fse.readFileSync(path.join(output, 'index.html'),'utf8')).toMatchSnapshot()
  })

  fit('generate navigation page from custom templates', async () => {
    const output = await tempDir(out)
    await run({
      input,
      output,
      templates: path.join(__dirname, '../tpl'),
      navPage: true,
    })
    expect(fse.readFileSync(path.join(output, 'index.html'),'utf8')).toMatchSnapshot()
  })

  it('generate navigation page by data2', async () => {
    const output = await tempDir(out)
    const input = 'src/test/stub/data2/**'

    await run({
      input,
      output,
      navPage: true,
      autoscope: true
    })
    expect(fse.readFileSync(path.join(output, 'index.html'),'utf8')).toMatchSnapshot()
  })
})
