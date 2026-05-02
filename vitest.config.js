import { defineConfig } from 'vitest/config'

export default defineConfig({
  test: {
    globals: true,
    include: ['src/test/js/**/*.{js,mjs}'],
    exclude: ['src/test/stub/**', 'src/test/tpl/**', 'node_modules/**'],
    testTimeout: 30000,
    hookTimeout: 30000,
    coverage: {
      provider: 'v8',
      reporter: ['text', 'lcov'],
      include: ['src/main/js/**/*.js'],
      exclude: ['src/main/js/generator/.eleventy.cjs'],
    },
  },
})
