import { run } from '../../main/js/index.js'

describe('has proper exports', () => {
  it('run', function () {
    expect(run).toBeDefined()
  })
})
