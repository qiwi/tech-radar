import {getDirs} from '../../main/js/generator'

describe('getDirs', () => {
  const cases = [
    [
      'returns uniq file names with omitted extensions',
      [
      '/foo/bar/baz.csv',
      '/foo/bar/qux.csv'
      ],
      [
        'baz',
        'qux'
      ]
    ],
    [
      'append parent dir otherwise',
      [
        '/foo/bar/data.csv',
        '/foo/baz/data.json'
      ],
      [
        'bar-data',
        'baz-data'
      ]
    ]
  ]

  cases.forEach(([name, input, result]) => {
    it(name, () => {
      expect(getDirs(input)).toEqual(result)
    })
  })
})