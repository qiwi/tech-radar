const htmlmin = require('html-minifier-terser')
const terser = require('terser')
const util = require('util')
const path = require('path')

module.exports = (config) => {
  const { temp, prefix, output } = config.extra
  // 11ty 3.x walks the data-file directory cascade only when input is a path
  // relative to cwd; absolute paths skip intermediate dirs.
  const relInput = path.relative(process.cwd(), temp) || '.'
  const relOutput = path.relative(process.cwd(), output) || '.'
  // const assetsPath = path.join(temp, 'assets')
  // config.addPassthroughCopy({
  //   [assetsPath]: '/',
  // })

  config.addFilter('console', (value) => util.inspect(value))

  // Resolves an asset URL based on `settings.extra.basePrefix`:
  //  - URL-shaped (http(s)://… or //…) — used as-is, supports CDN / cross-origin hosting.
  //  - any path-shaped value or empty — relative to the current page, so the output
  //    works at any sub-path (gh-pages, IDE static server, file://).
  config.addFilter('asset', (asset, settings, page) => {
    const assetPath = String(asset).replace(/^\//, '')
    const basePrefix = settings?.extra?.basePrefix
    if (basePrefix && /^(https?:)?\/\//.test(basePrefix)) {
      return basePrefix.replace(/\/$/, '') + '/' + assetPath
    }
    const targetDepth = settings?.extra?.target
      ? settings.extra.target.split('/').filter(Boolean).length
      : 0
    const pageDepth = (page?.url || '/').split('/').filter(Boolean).length
    const total = targetDepth + pageDepth
    const prefix = total === 0 ? './' : '../'.repeat(total)
    return prefix + assetPath
  })

  // NOTE It's cached by template renderer, so we need to pass extra options through settings injection
  config.addShortcode('makeBootScript', (settings, collections) => {
    if (!collections || !settings) {
      return
    }

    const { title, date } = settings.extra
    const entries = collections
      .map((entity) => ({
        quadrant: entity.data.quadrant,
        ring: settings.rings.findIndex(
          (ring) => ring.id === entity.data.ring.toLowerCase(),
        ),
        moved: entity.data.moved || 0,
        label: entity.fileSlug,
        link: entity.url.replace(/^\//, ''),
        active: false,
      }))
      .filter((entity) => entity.ring >= 0)

    const radarSettings = {
      ...settings,
      title,
      date,
      entries,
    }

    return `radar_visualization(${JSON.stringify(radarSettings)})`
  })

  config.addNunjucksAsyncFilter('jsmin', async function (code, callback) {
    try {
      const minified = await terser.minify(code)
      callback(null, minified.code)
    } catch (err) {
      console.error('Terser error: ', err)
      // Fail gracefully.
      callback(null, code)
    }
  })

  config.addTransform('htmlmin', (content, outputPath) => {
    if (outputPath && outputPath.endsWith('.html')) {
      return htmlmin.minify(content, {
        removeComments: true,
        collapseWhitespace: true,
      })
    }
    return content
  })

  return {
    dir: {
      input: relInput,
      output: relOutput,
      layouts: '_layouts',
    },
    pathPrefix: prefix,
    dataTemplateEngine: 'njk',
    markdownTemplateEngine: 'njk',
    htmlTemplateEngine: 'njk',
    templateFormats: ['md', 'njk'],
  }
}
