// End-to-end coverage for zalando-specific runtime branches that the
// markdown / dispatch / aurora suites don't reach: the favicon override
// (line 176 in zalando/index.js) and the autoscope-redirect scope filter
// (line 86, skipping `.` scope).

import fse from 'fs-extra'
import path from 'node:path'
import { fileURLToPath } from 'node:url'

import { run } from '../../../src/index.js'
import { tempDir } from '../../../src/util.js'

const __dirname = path.dirname(fileURLToPath(import.meta.url))
const out = path.resolve(process.cwd(), 'test-output-zalando')
const fixture = path.join(__dirname, '../../fixtures/test.csv')

afterAll(async () => await fse.remove(out))

describe('zalando renderer', () => {
  it('overrides the bundled favicon with --favicon', async () => {
    const output = await tempDir(out)
    const customIco = path.join(output, '_custom.ico')
    await fse.outputFile(customIco, Buffer.from('ZALANDO-CUSTOM'))
    await run({ input: fixture, output, favicon: customIco })
    const written = await fse.readFile(path.join(output, 'favicon.ico'))
    expect(written.toString()).toBe('ZALANDO-CUSTOM')
  })

  it('keeps the bundled favicon when --favicon is not set', async () => {
    const output = await tempDir(out)
    await run({ input: fixture, output })
    const written = await fse.readFile(path.join(output, 'favicon.ico'))
    // Bundled .ico is a real binary, not the placeholder.
    expect(written.length).toBeGreaterThan(100)
    expect(written.toString().startsWith('ZALANDO-CUSTOM')).toBe(false)
  })

  it('writes a per-scope redirect for non-"." scopes only (autoscope)', async () => {
    const output = await tempDir(out)
    await run({
      input: 'test/fixtures/data2/**',
      output,
      autoscope: true,
      navPage: true,
    })
    expect(await fse.pathExists(path.join(output, 'ios', 'index.html'))).toBe(true)
    expect(await fse.pathExists(path.join(output, 'js', 'index.html'))).toBe(true)
  })

  it('rejects a flex (NxM) radar with a clear error', async () => {
    // Use the run() pipeline indirectly via the dispatch — easier to test
    // the guard than wiring up an isolated radar manually.
    const { render } = await import('../../../src/renderer/index.js')
    await expect(
      render({
        renderer: 'zalando',
        radars: [
          { source: 'flex.csv', document: { _schema: 'flex' } },
        ],
      }),
    ).rejects.toThrow(/only accepts 4x4 radars/)
  })
})
