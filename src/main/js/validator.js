import Ajv from 'ajv'

const validators = new Map()
const validate = (target, schema) => {
  const validator = validators.get(schema)
  if (!validator) {
    validators.set(schema, new Ajv().compile(schema))
    return validate(target, schema)
  }

  const result = validator(target)
  const error = validator.errors
  console.error(error)
  return result
}

export { validate }
