import {
  getReader,
  parse,
  parseCsvRadar,
  parseJsonRadar,
  parseYamlRadar
} from '../../main/js/parser/index.js'

describe('parser.js', () => {
  it('parse()', () => {
    expect(parse('src/test/stub/test.csv')).toMatchSnapshot()
  })
  it('csvReader', () => {
    expect(parseCsvRadar('src/test/stub/test.csv')).toMatchSnapshot()
  })
  it('jsonReader', () => {
    expect(parseJsonRadar('src/test/stub/test.json')).toMatchSnapshot()
  })
  it('yamlReader', () => {
    expect(parseYamlRadar('src/test/stub/test.yml')).toMatchSnapshot()
  })
  it('getReader ', () => {
    expect(getReader('.csv')).toBe(parseCsvRadar)
    expect(getReader('.json')).toBe(parseJsonRadar)
    expect(getReader('.yml')).toBe(parseYamlRadar)
  })
  it('invalid .csv', () => {
    expect(parse('src/test/stub/invalid.csv')).toStrictEqual({})
  })
})
