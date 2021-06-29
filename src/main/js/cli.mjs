#!/usr/bin/env node

import meow from 'meow'
import {generateTechRadar} from './index.js'

export const cli = meow(
  `
    Usage:
      techradar  --csvPath /path/to/csv --outDir /radar --versions 1.00 pathPrefix js --title qiwi-radar-js
    Options
      --csvPath
      --outDir
      --version
      --pathPrefix
      --title
`,
  {
    importMeta: import.meta,
    flags: {
      csvPath: {
        type: 'string',
        isRequired: true,
      },
      outDir: {
        type: 'string',
        isRequired: true,
      },
      version: {
        type: 'string',
      },
      pathPrefix: {
        type: 'string',
      },
      title: {
        type: 'string'
      },
    },
  },
)

generateTechRadar(cli.flags)
