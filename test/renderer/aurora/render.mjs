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
    // Exercises every branch of the inline markdown parser: h1/h2/h3,
    // paragraphs, `-` lists, `**bold**`, `[text](url)`.
    await fse.outputFile(
      aboutSrc,
      [
        '# Hello',
        '',
        'World with **bold** text and a [link](https://example.com).',
        '',
        '## Rings',
        '',
        '- **ADOPT** — proven',
        '- **TRIAL** — sampled',
        '',
        '### Notes',
        '',
        'Just text.',
      ].join('\n'),
    )
    await run({ input: fixture, output, renderer: 'aurora', about: aboutSrc })

    const aboutHtml = await renderHtml(output, 'about', 'index.html')
    expect(aboutHtml).toContain('<h1>Hello</h1>')
    expect(aboutHtml).toContain('<h2>Rings</h2>')
    expect(aboutHtml).toContain('<h3>Notes</h3>')
    expect(aboutHtml).toContain('<strong>bold</strong>')
    expect(aboutHtml).toContain('<a href="https://example.com"')
    expect(aboutHtml).toContain('<ul>')
    expect(aboutHtml).toContain('<li><strong>ADOPT</strong>')

    const radarHtml = await renderHtml(output, FIXTURE_DATE, 'index.html')
    expect(radarHtml).toContain('class="legend-about"')
    // basePath climbs two levels (`<scope>/<date>/` → dist root); for the
    // single-fixture `.` scope this still emits `../../about/`.
    expect(radarHtml).toContain('href="../../about/"')
  })

  it('renders the multi-snapshot timeline with year ticks and per-date dots', async () => {
    const output = await tempDir(out)
    // Three fixtures at the root scope on different dates — exercises the
    // multi-snapshot branch of renderTimeline (year ticks + dots).
    await run({
      input: 'test/fixtures/test.{csv,json,yml}',
      output,
      renderer: 'aurora',
    })
    const html = await renderHtml(output, FIXTURE_DATE, 'index.html')
    expect(html).toMatch(/class="tl-year-tick"/)
    expect(html).toMatch(/class="tl-dot tl-dot--current"/)
    expect(html).toMatch(/class="tl-dot"/)
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

  it('sanitises markdown link URLs with unsafe schemes', async () => {
    const output = await tempDir(out)
    const aboutSrc = path.join(output, '_about-xss.md')
    // Only the http(s)/mailto/anchor/relative schemes survive — `javascript:`
    // and `data:` get rewritten to "#" so a careless About author can't
    // inject executable code via the markdown parser.
    await fse.outputFile(
      aboutSrc,
      [
        '[ok](https://example.com)',
        '[js](javascript:alert(1))',
        '[data](data:text/html,<script>1</script>)',
      ].join('\n\n'),
    )
    await run({ input: fixture, output, renderer: 'aurora', about: aboutSrc })
    const html = await renderHtml(output, 'about', 'index.html')
    expect(html).toContain('<a href="https://example.com"')
    expect(html).not.toContain('javascript:alert')
    expect(html).not.toMatch(/href="data:/)
    // The unsafe ones still render as anchors, but pointing at "#".
    expect(html).toMatch(/<a href="#"[^>]*>js<\/a>/)
    expect(html).toMatch(/<a href="#"[^>]*>data<\/a>/)
  })

  it('embeds an .html About source verbatim (skipping the markdown parser)', async () => {
    const output = await tempDir(out)
    const aboutSrc = path.join(output, '_about-src.html')
    await fse.outputFile(aboutSrc, '<section><h1>Raw</h1></section>')
    await run({ input: fixture, output, renderer: 'aurora', about: aboutSrc })
    const aboutHtml = await renderHtml(output, 'about', 'index.html')
    expect(aboutHtml).toContain('<section><h1>Raw</h1></section>')
  })

  it('ignores a missing --about file (no About page, no legend link)', async () => {
    const output = await tempDir(out)
    await run({
      input: fixture,
      output,
      renderer: 'aurora',
      about: path.join(output, 'does-not-exist.md'),
    })
    expect(await fse.pathExists(path.join(output, 'about'))).toBe(false)
    const radarHtml = await renderHtml(output, FIXTURE_DATE, 'index.html')
    expect(radarHtml).not.toContain('class="legend-about"')
  })

  it('renders moved-up / moved-down badges on entry pages', async () => {
    // data2/js/test.json carries explicit `moved` values (no autoscope so
    // they pass through as-is). Both directions should appear.
    const output = await tempDir(out)
    await run({
      input: 'test/fixtures/data2/js/test.json',
      output,
      renderer: 'aurora',
    })
    const up = await fse.readFile(
      path.join(output, '2021-06-12', 'entries', 'q1', 'TypeScript', 'index.html'),
      'utf8',
    )
    expect(up).toContain('badge--up')
    const down = await fse.readFile(
      path.join(
        output, '2021-06-12', 'entries', 'q4',
        'Гексагональная архитектура', 'index.html',
      ),
      'utf8',
    )
    expect(down).toContain('badge--down')
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
