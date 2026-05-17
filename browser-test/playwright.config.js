const { defineConfig } = require('@playwright/test');

module.exports = defineConfig({
  testDir: '.',
  testMatch: 'test.js',
  timeout: 30000,
  use: {
    browserName: 'chromium',
    headless: true,
  },
});
