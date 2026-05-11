// End-to-end coverage of the aurora renderer via the public `run()` entry.
// The fixture has a single radar (`./2021-06-18`), so the assertions can pin
// to concrete paths without juggling autoscope.

import fse from 'fs-extra'
import path from 'node:path'
import { fileURLToPath } from 'node:url'

import { run } from '../../../src/index.js'
import { tempDir } from '../../../src/util.js'

const __dirname = path.dirname(fileURLToPath(import.meta.url))
const out = path.resolve(process.cwd(), 'test-output-aurora')
const fixture = path.join(__dirname, '../../fixtures/test.csv')
const FIXTURE_DATE = '2021-06-18'

afterAll(async () => await fse.remove(out))

const renderHtml = async (output, ...segments) =>
  fse.readFile(path.join(output, ...segments), 'utf8')

describe('aurora renderer', () => {
  it('writes shared assets at the output root', async () => {
    const output = await tempDir(out)
    await run({ input: fixture, output, renderer: 'aurora' })
    expect(await fse.pathExists(path.join(output, 'aurora.css'))).toBe(true)
    expect(await fse.pathExists(path.join(output, 'aurora.js'))).toBe(true)
    expect(await fse.pathExists(path.join(output, 'favicon.ico'))).toBe(true)
  })

  it('writes a radar page per (scope, date)', async () => {
    const output = await tempDir(out)
    await run({ input: fixture, output, renderer: 'aurora' })
    const html = await renderHtml(output, FIXTURE_DATE, 'index.html')
    expect(html).toContain('class="radar-stage"')
    expect(html).toContain('viewBox="0 0 1100 1100"')
    expect(html).toContain('class="legend"')
  })

  it('writes per-entry detail pages with back-arrow + content', async () => {
    const output = await tempDir(out)
    await run({ input: fixture, output, renderer: 'aurora' })
    const tsHtml = await renderHtml(
      output, FIXTURE_DATE, 'entries', 'q1', 'TypeScript', 'index.html',
    )
    expect(tsHtml).toContain('class="back"')
    expect(tsHtml).toContain('TypeScript')
    expect(tsHtml).toContain('class="badge badge--ring')
  })

  it('emits an About page + legend link when --about is set', async () => {
    const output = await tempDir(out)
    const aboutSrc = path.join(output, '_about-src.md')
    await fse.outputFile(aboutSrc, '# Hello\n\nWorld with **bold** text.\n')
    await run({ input: fixture, output, renderer: 'aurora', about: aboutSrc })

    const aboutHtml = await renderHtml(output, 'about', 'index.html')
    expect(aboutHtml).toContain('<h1>Hello</h1>')
    expect(aboutHtml).toContain('<strong>bold</strong>')

    const radarHtml = await renderHtml(output, FIXTURE_DATE, 'index.html')
    expect(radarHtml).toContain('class="legend-about"')
    // basePath climbs two levels (`<scope>/<date>/` → dist root); for the
    // single-fixture `.` scope this still emits `../../about/`.
    expect(radarHtml).toContain('href="../../about/"')
  })

  it('skips About page + legend link when --about is not set', async () => {
    const output = await tempDir(out)
    await run({ input: fixture, output, renderer: 'aurora' })
    expect(await fse.pathExists(path.join(output, 'about'))).toBe(false)
    const radarHtml = await renderHtml(output, FIXTURE_DATE, 'index.html')
    expect(radarHtml).not.toContain('class="legend-about"')
  })

  it('omits the legend credit when --credits=false', async () => {
    const output = await tempDir(out)
    await run({ input: fixture, output, renderer: 'aurora', credits: false })
    const radarHtml = await renderHtml(output, FIXTURE_DATE, 'index.html')
    expect(radarHtml).not.toContain('legend-credit')
  })

  it('shows the legend credit by default', async () => {
    const output = await tempDir(out)
    await run({ input: fixture, output, renderer: 'aurora' })
    const radarHtml = await renderHtml(output, FIXTURE_DATE, 'index.html')
    expect(radarHtml).toContain('legend-credit')
    expect(radarHtml).toContain('Open Source')
  })

  it('copies a user-supplied favicon to <output>/favicon.ico', async () => {
    const output = await tempDir(out)
    const customIco = path.join(output, '_src-favicon.ico')
    // Distinct bytes so the assertion can prove the override actually won.
    await fse.outputFile(customIco, Buffer.from('CUSTOM-FAVICON'))
    await run({ input: fixture, output, renderer: 'aurora', favicon: customIco })
    const written = await fse.readFile(path.join(output, 'favicon.ico'))
    expect(written.toString()).toBe('CUSTOM-FAVICON')
  })

  it('falls back to the bundled favicon when --favicon is not set', async () => {
    const output = await tempDir(out)
    await run({ input: fixture, output, renderer: 'aurora' })
    const written = await fse.readFile(path.join(output, 'favicon.ico'))
    // Bundled favicon is a real .ico file; quick sanity check that we
    // didn't write the placeholder/custom payload here.
    expect(written.length).toBeGreaterThan(100)
  })

  it('writes per-scope redirect + root redirect with multiple scopes (autoscope)', async () => {
    const output = await tempDir(out)
    await run({
      input: 'test/fixtures/data2/**',
      output,
      renderer: 'aurora',
      autoscope: true,
    })
    // data2 has ios + js scopes
    expect(await fse.pathExists(path.join(output, 'ios', 'index.html'))).toBe(true)
    expect(await fse.pathExists(path.join(output, 'js', 'index.html'))).toBe(true)
    expect(await fse.pathExists(path.join(output, 'index.html'))).toBe(true)
    const rootIndex = await renderHtml(output, 'index.html')
    expect(rootIndex).toMatch(/<meta http-equiv="refresh"[^>]*url=ios\//)
  })
})
