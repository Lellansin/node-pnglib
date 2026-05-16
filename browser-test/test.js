const { test, expect } = require('@playwright/test');
const { execSync } = require('child_process');
const path = require('path');

test.beforeAll(() => {
  execSync(
    'npx esbuild src/pnglib.js --bundle --format=esm --outfile=browser-test/bundle.mjs',
    { cwd: path.resolve(__dirname, '..'), stdio: 'pipe' }
  );
});

test('browser can generate PNG', async ({ page }) => {
  // Use Playwright's built-in web server via page.route to serve files
  const testDir = path.resolve(__dirname);

  // Serve static files from browser-test directory
  await page.route('**/*', (route) => {
    const url = new URL(route.request().url());
    let filePath = url.pathname === '/' ? '/index.html' : url.pathname;
    const fullPath = path.join(testDir, filePath);
    try {
      const content = require('fs').readFileSync(fullPath);
      const ext = path.extname(fullPath);
      const types = {
        '.html': 'text/html', '.mjs': 'text/javascript',
        '.js': 'text/javascript', '.css': 'text/css',
      };
      route.fulfill({ contentType: types[ext] || 'text/plain', body: content });
    } catch {
      route.fulfill({ status: 404 });
    }
  });

  await page.goto('http://localhost/');
  await page.waitForSelector('#summary', { timeout: 10000 });
  const summary = await page.textContent('#summary');
  expect(summary).toMatch(/\d+ tests passed/);
});
