import foo from '../../main/js/index'

describe('index (es6)', () => {
  it('foo() result equals bar', () => {
    expect(foo).toBe(10)
  })
})
