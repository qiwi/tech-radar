import {
  csvReader,
  getReader,
  jsonReader,
  read,
  yamlReader,
} from '../../main/js/reader.js'

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
  it('getReader ', () => {
    expect(getReader('.csv')).toBe(csvReader)
    expect(getReader('.json')).toBe(jsonReader)
    expect(getReader('.yml')).toBe(yamlReader)
  })
})
