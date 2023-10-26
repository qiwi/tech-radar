#!/usr/bin/env node
import { error } from 'node:console'
import { cp, open, realpath, rm } from 'node:fs/promises'
import { dirname, resolve } from 'node:path'
import { argv, cwd, env, exit } from 'node:process'

import fastifyStatic from '@fastify/static'
import { program } from 'commander'
import { execaCommand } from 'execa'
import fastify from 'fastify'
import ora from 'ora'
import { packageDirectory } from 'pkg-dir'
import { async as asyncSyncDirectory } from 'sync-directory'
import { temporaryDirectory } from 'tempy'

const { start, stop } = (() => {
  let time = 0
  const spinner = ora({
    spinner: 'dots',
  })
  const start = (title: string) => {
    if (time) {
      succeed()
    }
    time = Date.now()
    spinner.start(title)
  }
  const succeed = () => {
    spinner.succeed(
      `${spinner.text} - ${((Date.now() - time) / 1000).toFixed(1)}s`,
    )
  }
  const stop = () => {
    if (time) {
      succeed()
    }
    time = 0
    spinner.stop()
  }
  return {
    start,
    stop,
  }
})()

const pm = (() => {
  if (env.npm_execpath?.includes('bun')) {
    return 'bun'
  }
  if (env.npm_execpath?.includes('yarn')) {
    return 'yarn'
  }
  return 'npm'
})()

const install = async (input: string) => {
  const bin = await realpath(argv[1])
  const dir = (await packageDirectory({ cwd: bin })) || dirname(bin)
  const tmp = temporaryDirectory({ prefix: 'tech-radar-' })
  const src = bin.includes('src/main/ts')
  await asyncSyncDirectory(
    src
      ? resolve(dir, 'src', 'main', 'resources', 'webapp')
      : resolve(dir, 'target', 'resources', 'webapp'),
    tmp,
    {
      watch: true,
      type: 'copy',
    },
  )
  await asyncSyncDirectory(
    src ? resolve(dir, 'src', 'main', 'ts') : resolve(dir, 'target', 'esm'),
    resolve(tmp, 'src'),
    {
      watch: true,
      type: 'copy',
      exclude: src ? ['bin.ts'] : ['bin.mjs'],
    },
  )
  await asyncSyncDirectory(input, resolve(tmp, 'public'), {
    watch: true,
    type: 'copy',
  })
  await execaCommand(`${pm} install`, { cwd: tmp })
  return tmp
}

program
  .command('build')
  .requiredOption(
    '-i, --input <input>',
    'input directory with radar.json and other stuff (favicon.ico)',
    (value) => resolve(cwd(), value),
  )
  .requiredOption(
    '-o, --output <output>',
    'output directory with generated radar',
    (value) => resolve(cwd(), value),
  )
  .action(async (options) => {
    start(`${pm} install`)

    const cwd = await install(options.input)

    start('build & generate')

    const serve = fastify().register(fastifyStatic, {
      root: resolve(cwd, 'public'),
    })

    await serve.listen({ port: 3000 })
    await execaCommand(`${pm} run build`, { cwd })
    await serve.close()

    start('copy & clean')

    await rm(options.output, {
      recursive: true,
      force: true,
    })

    await cp(resolve(cwd, 'build'), options.output, {
      recursive: true,
      force: true,
    })

    const nojekyll = await open(resolve(options.output, '.nojekyll'), 'a')
    await nojekyll.close()

    await rm(resolve(cwd), { recursive: true, force: true })

    stop()
  })

program
  .command('dev')
  .requiredOption(
    '-i, --input <input>',
    'input directory with radar.json and other stuff (favicon.ico)',
    (value) => resolve(cwd(), value),
  )
  .action(async (options) => {
    const cwd = await install(options.input)
    await execaCommand(`${pm} run dev`, { stdio: 'inherit', cwd })
  })

program
  .parseAsync()
  .then(() => exit(0))
  // eslint-disable-next-line unicorn/prefer-top-level-await
  .catch((e) => {
    error(e)
    exit(1)
  })
