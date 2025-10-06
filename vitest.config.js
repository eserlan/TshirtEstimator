import { defineConfig } from 'vitest/config';

export default defineConfig({
  test: {
    environment: 'happy-dom',
    globals: true,
    include: [
      'tests/app.test.js',
      'tests/ui.test.js',
      'tests/dom.test.js',
      'tests/utils.test.js',
      'tests/data-structures.test.js'
    ],
    coverage: {
      provider: 'v8',
      reporter: ['text', 'json', 'html'],
      exclude: [
        'node_modules/',
        'tests/',
        '*.config.js',
        'firebase-config.js'
      ]
    }
  }
});
