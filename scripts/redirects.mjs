// Writes `dist/index.html` as a meta-refresh forward to v2/.
// v2 (aurora) is the maintained default; the classic style stays at /v1/.

import fs from 'node:fs/promises'
import path from 'node:path'

const OUT = path.resolve('dist/index.html')
const html = `<!DOCTYPE html>
<html lang="en">
<head>
<meta charset="utf-8">
<meta http-equiv="refresh" content="0; url=v2/">
<link rel="canonical" href="v2/">
<title>QIWI Tech Radar</title>
</head>
<body><a href="v2/">Open the radar</a></body>
</html>
`

await fs.writeFile(OUT, html)
console.log(`redirect → ${OUT}`)
