import {
  genMdAssets,
  genMdContent,
  genMdPath,
} from '../../main/js/generateMdAssets.js'
import { genEleventy, genStatics } from '../../main/js/generateStatic.js'
import { getDirs, getDocuments, getSources, run } from '../../main/js/index.js'
import {
  csvReader,
  getReader,
  jsonReader,
  read,
  yamlReader,
} from '../../main/js/reader.js'
import { makeUniq, reverse } from '../../main/js/util.js'

describe('has proper exports', () => {
  it('getSources', function () {
    expect(getSources).not.toBeUndefined()
  })
  it('getDocuments', function () {
    expect(getDocuments).not.toBeUndefined()
  })
  it('getDirs', function () {
    expect(getDirs).not.toBeUndefined()
  })
  it('run', function () {
    expect(run).not.toBeUndefined()
  })
  it('genMdAssets', function () {
    expect(genMdAssets).not.toBeUndefined()
  })
  it('genMdContent', function () {
    expect(genMdContent).not.toBeUndefined()
  })
  it('genMdPath', function () {
    expect(genMdPath).not.toBeUndefined()
  })
  it('genEleventy', function () {
    expect(genEleventy).not.toBeUndefined()
  })
  it('genStatics', function () {
    expect(genStatics).not.toBeUndefined()
  })
  it('reverse', function () {
    expect(reverse).not.toBeUndefined()
  })
  it('makeUniq', function () {
    expect(makeUniq).not.toBeUndefined()
  })
  it('read', function () {
    expect(read).not.toBeUndefined()
  })
  it('yamlReader', function () {
    expect(yamlReader).not.toBeUndefined()
  })
  it('getReader', function () {
    expect(getReader).not.toBeUndefined()
  })
  it('jsonReader', function () {
    expect(jsonReader).not.toBeUndefined()
  })
  it('csvReader', function () {
    expect(csvReader).not.toBeUndefined()
  })
})
