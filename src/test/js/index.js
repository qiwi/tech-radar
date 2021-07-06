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
    expect(getSources).toBeDefined()
  })
  it('getDocuments', function () {
    expect(getDocuments).toBeDefined()
  })
  it('getDirs', function () {
    expect(getDirs).toBeDefined()
  })
  it('run', function () {
    expect(run).toBeDefined()
  })
  it('genMdAssets', function () {
    expect(genMdAssets).toBeDefined()
  })
  it('genMdContent', function () {
    expect(genMdContent).toBeDefined()
  })
  it('genMdPath', function () {
    expect(genMdPath).toBeDefined()
  })
  it('genEleventy', function () {
    expect(genEleventy).toBeDefined()
  })
  it('genStatics', function () {
    expect(genStatics).toBeDefined()
  })
  it('reverse', function () {
    expect(reverse).toBeDefined()
  })
  it('makeUniq', function () {
    expect(makeUniq).toBeDefined()
  })
  it('read', function () {
    expect(read).toBeDefined()
  })
  it('yamlReader', function () {
    expect(yamlReader).toBeDefined()
  })
  it('getReader', function () {
    expect(getReader).toBeDefined()
  })
  it('jsonReader', function () {
    expect(jsonReader).toBeDefined()
  })
  it('csvReader', function () {
    expect(csvReader).toBeDefined()
  })
})
