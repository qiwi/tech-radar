import {
  getReader,
  parse,
  parseCsvRadar,
  parseJsonRadar,
  parseYamlRadar,
} from '../../src/parser/index.js'

describe('parser.js', () => {
  it('parse()', async () => {
    expect(await parse('test/fixtures/test.csv')).toMatchSnapshot()
  })
  it('csvReader', async () => {
    expect(await parseCsvRadar('test/fixtures/test.csv')).toMatchSnapshot()
  })
  it('jsonReader', async () => {
    expect(await parseJsonRadar('test/fixtures/test.json')).toMatchSnapshot()
  })
  it('yamlReader', async () => {
    expect(await parseYamlRadar('test/fixtures/test.yml')).toMatchSnapshot()
  })
  it('getReader ', () => {
    expect(getReader('.csv')).toBe(parseCsvRadar)
    expect(getReader('.json')).toBe(parseJsonRadar)
    expect(getReader('.yml')).toBe(parseYamlRadar)
  })
  it('invalid .csv throws — caller decides whether to skip or abort', async () => {
    await expect(parse('test/fixtures/invalid.csv')).rejects.toThrow()
  })
})
