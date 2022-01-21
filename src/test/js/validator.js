import {
  _validate,
  radarSchema,
  validate,
} from '../../main/js/parser/validator.js'

describe('validate', () => {
  it('validate is not undefined ', () => {
    expect(_validate).toBeDefined()
  })
  it('valid data ', () => {
    const obj = {
      meta: {
        title: '',
        date: '',
        legend: '',
      },
      data: [
        {
          name: '',
          quadrant: '',
          ring: '',
          description: '',
          moved: '',
        },
      ],
      quadrantAliases: {},
    }
    expect(_validate(obj, radarSchema)).toBe(true)
    expect(validate(obj, radarSchema)).toBe(obj)
  })

  it('invalid data ', () => {
    const obj = {
      meta: {
        title: '',
      },
      data: [
        {
          name: '',
          quadrant: '',
          ring: '',
          description: '',
        },
      ],
    }
    expect(_validate(obj, radarSchema)).toBe(false)
  })

  describe('quadrantAliases', () => {
    const cases = [
      [
        'q* → string',
        {
          q1: 'foo',
        },
        true,
      ],
      [
        'q* → string[]',
        {
          q1: ['foo'],
        },
        true,
      ],
      [
        'q* → number',
        {
          q1: 1,
        },
        false,
      ],
      [
        'q* → q*',
        {
          q1: 'q1',
        },
        false,
      ],
      [
        '* → q* enum',
        {
          foo: 'q1',
        },
        true,
      ],
      [
        '* → q* enum',
        {
          foo: 'foo',
        },
        false,
      ],
    ]

    cases.forEach(([name, obj, result]) => {
      it(name, () => {
        expect(_validate(obj, radarSchema.properties.quadrantAliases)).toBe(
          result,
        )
      })
    })
  })
})
