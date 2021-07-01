import fs from 'fs'
import fsExtra from 'fs-extra'
import path from 'path'

import { genStatics } from '../../main/js/generateStatic.js'
import { getDirs, getDocuments } from '../../main/js/index.js'

describe('generate 11ty app', () => {
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
