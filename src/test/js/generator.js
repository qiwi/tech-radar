import { getDirs } from '../../main/js/util.js'

describe('getDirs', () => {
  const cases = [
    [
      'returns uniq file names with omitted extensions',
      ['/foo/bar/baz.csv', '/foo/bar/qux.csv'],
      [['baz'], ['qux']],
    ],
    [
      'append parent dir otherwise',
      ['/foo/bar/data.csv', '/foo/baz/data.json'],
      [['bar','data'], ['baz','data']],
    ],
    [
      'makes values unique',
      ['/foo/bar/data.csv', '/foo/bar/data.json', '/foo/bar/data.yaml'],
      [['data'], ['data-2'], ['data-3']],
    ],
    [
      'makes values unique',
      [
        '/foo/ios/bar/data.csv',
        '/foo/ios/bar/data.json',
        '/foo/js/bar/data.yaml',
        '/foo/js/bar/data.yml',
      ],
      [['ios','bar','data'], ['ios','bar','data-2'], ['js','bar','data'], ['js','bar','data-2']],
    ],
  ]

  cases.forEach(([name, input, result]) => {
    it(name, () => {
      expect(getDirs(input)).toEqual(result)
    })
  })
})
