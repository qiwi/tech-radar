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
        // Server-side glue around 11ty — no JS code, just a config factory.
        'src/renderer/zalando/config.cjs',
        // Njk templates + vendor d3 client library — never executed in Node.
        'src/renderer/zalando/templates/**',
        // Preview server — local dev-only helper.
        'src/preview/**',
      ],
    },
  },
})
