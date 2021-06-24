// import htmlmin from "html-minifier";
// import * as terser from "terser"
const htmlmin = require('html-minifier')
const terser = require('terser')

module.exports = (config) => {
  const pathPrefix = process.env.PATHPREFIX
  const tempDir = global.tempDir
  const assetsPath = tempDir + '/assets'
  config.addPassthroughCopy({
    [assetsPath]: '/',
  })

  config.addShortcode('makeBootScript', (title, settings, collections) => {
    const entries = collections
      .map((entity) => ({
        quadrant: entity.data.quadrant,
        ring: settings.rings.findIndex(
          (ring) => ring.id === entity.data.ring.toLowerCase(),
        ),
        moved: entity.data.moved || 0,
        label: entity.fileSlug,
        link: config.javascriptFunctions.url(entity.url, pathPrefix),
        active: false,
      }))
      .filter((entity) => entity.ring >= 0)

    const radarSettings = {
      ...settings,
      title,
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
      const result = htmlmin.minify(content, {
        removeComments: true,
        collapseWhitespace: true,
      })

      return result
    }
    return content
  })

  return {
    dir: {
      input: tempDir,
      output: global.outDir,
      layouts: '_layouts',
    },
    pathPrefix,
    dataTemplateEngine: 'njk',
    markdownTemplateEngine: 'njk',
    htmlTemplateEngine: 'njk',
    templateFormats: ['md', 'njk'],
  }
}
