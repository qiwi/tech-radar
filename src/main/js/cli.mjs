#!/usr/bin/env node

import meow from 'meow'
import {run} from './index.js'

export const cli = meow(
  `
    Usage:
      techradar  --input /path/to/csv --output /radar --basePrefix tech-radar --autoscope true --nav-page true --nav-title title --nav-footer footer
    Options
      --cwd
      --input
      --output
      --basePrefix
      --autoscope
      --nav-page
      --nav-title
      --nav-footer
      --temp
      --templates
`,
  {
    importMeta: import.meta,
    flags: {
      input: {
        type: 'string',
        isRequired: true,
      },
      output: {
        type: 'string',
        isRequired: true,
      },
      basePrefix: {
        type: 'string',
      },
      cwd: {
        type: 'string',
      },
      autoscope: {
        type: 'boolean'
      },
      navPage: {
        type: 'boolean'
      },
      navTitle: {
        type: 'string'
      },
      navFooter: {
        type: 'string'
      },
      temp: {
        type: 'string'
      },
      templates: {
        type: 'string',
        shortFlag: 'tpl'
      }
    },
  },
)

run(cli.flags)
