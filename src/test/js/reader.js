import {
  getReader,
  parse,
  parseCsvRadar,
  parseJsonRadar,
  parseYamlRadar,
} from '../../main/js/parser/index.js'

describe('parser.js', () => {
  it('parse()', async () => {
    expect(await parse('src/test/stub/test.csv')).toMatchSnapshot()
  })
  it('csvReader', async () => {
    expect(await parseCsvRadar('src/test/stub/test.csv')).toMatchSnapshot()
  })
  it('jsonReader', async () => {
    expect(await parseJsonRadar('src/test/stub/test.json')).toMatchSnapshot()
  })
  it('yamlReader', async () => {
    expect(await parseYamlRadar('src/test/stub/test.yml')).toMatchSnapshot()
  })
  it('getReader ', () => {
    expect(getReader('.csv')).toBe(parseCsvRadar)
    expect(getReader('.json')).toBe(parseJsonRadar)
    expect(getReader('.yml')).toBe(parseYamlRadar)
  })
  it('invalid .csv', async () => {
    expect(await parse('src/test/stub/invalid.csv')).toStrictEqual({})
  })
})
