import { _validate, validate, radarSchema } from '../../main/js/parser/validator.js'

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
})
