import finalhandler from 'finalhandler'
import http from 'http'
import serveStatic from 'serve-static'

// Serve up public folder
const serve = serveStatic('dist', { index: ['index.html', 'index.htm'] })

// Create server
const server = http.createServer(function onRequest (req, res) {
  console.log(req.url)
  req.url = req.url.replace('/tech-radar', '/')
  serve(req, res, finalhandler(req, res))
})

// Listen
server.listen(3000)
console.log('http://localhost:3000/')
