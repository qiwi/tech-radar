import { defineConfig } from 'vitest/config'

export default defineConfig({
  test: {
    globals: true,
    include: ['test/**/*.{js,mjs}'],
    exclude: ['test/fixtures/**', 'test/templates/**', 'node_modules/**'],
    testTimeout: 30000,
    hookTimeout: 30000,
    coverage: {
      provider: 'v8',
      reporter: ['text', 'lcov'],
      include: ['src/**/*.js'],
      exclude: [
        'src/renderer/eleventy/config.cjs',
        'src/preview/**',
      ],
    },
  },
})
