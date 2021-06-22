#!/usr/bin/env node

import meow from 'meow'
import {generateTechRadar} from './index.js'

const cli = meow(
  `
    Usage:
      repocrawler --github.auth=1234567890123456789012345678901234567890 --github.baseUrl=https://github.qiwi.com/api/v3 --gerrit.auth.username=j.sins --gerrit.auth.password=password --gerrit.baseUrl=https://gerrit.osmp.ru --out=temp --org=jslab
    Options
      --csvPath
      --outDir
      --version
      --pathPrefix
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
    },
  },
)

generateTechRadar(cli.flags)
