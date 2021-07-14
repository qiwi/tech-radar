import { radarSchema } from '../../main/js/constants.js'
import { validate } from '../../main/js/validator.js'

describe('validate', () => {
  it('validate is not undefined ', () => {
    expect(validate).toBeDefined()
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
    expect(validate(obj, radarSchema)).toBe(true)
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
    expect(validate(obj, radarSchema)).toBe(false)
  })
})
