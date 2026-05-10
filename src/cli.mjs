#!/usr/bin/env node

import meow from 'meow'
import {run} from './index.js'

export const cli = meow(
  `
    Usage:
      techradar  --input /path/to/csv --output /radar --base-prefix tech-radar --autoscope true --nav-page true --nav-title title --nav-footer footer --renderer eleventy
    Options
      --cwd
      --input
      --output
      --base-prefix
      --autoscope
      --nav-page
      --nav-title
      --nav-footer
      --temp
      --templates
      --renderer  output backend: "eleventy" (default) or "aurora"
`,
  {
    importMeta: import.meta,
    flags: {
      input: {
        type: 'string',
      },
      output: {
        type: 'string',
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
      },
      renderer: {
        type: 'string'
      }
    },
  },
)

run(cli.flags)
