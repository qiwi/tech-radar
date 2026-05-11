import finalhandler from 'finalhandler'
import http from 'node:http'
import serveStatic from 'serve-static'

// Serves dist/ on localhost:3000 the same way gh-pages serves the site at
// `qiwi.github.io/tech-radar/`. The leading `/tech-radar` prefix in any
// absolute URL (e.g. zalando's basePrefix-built links) is stripped so the
// preview mirrors the production layout under root.
const serve = serveStatic('dist', { index: ['index.html', 'index.htm'] })

const server = http.createServer(function onRequest(req, res) {
  console.log(req.url)
  req.url = req.url.replace(/^\/tech-radar(?=\/|$)/, '') || '/'
  serve(req, res, finalhandler(req, res))
})

server.listen(3000)
console.log('http://localhost:3000/')
console.log('  /v1/  → Zalando-style demo')
console.log('  /v2/  → Aurora demo')
