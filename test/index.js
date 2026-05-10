import { run } from '../src/index.js'

describe('has proper exports', () => {
  it('run', function () {
    expect(run).toBeDefined()
  })
})
