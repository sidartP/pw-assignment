import { defineConfig, devices } from '@playwright/test';
import path from 'path';

const jsonReporterPath =
  process.env.PLAYWRIGHT_JSON_REPORT ?? path.join('reports', 'test-results.json');

export default defineConfig({
  testDir: './tests',
  timeout: 60 * 1000,
  expect: {
    timeout: 10 * 1000,
  },
  retries: process.env.CI ? 1 : 0,
  reporter: [
    ['list'],
    [path.resolve(__dirname, 'src', 'reporters', 'json-reporter.ts'), { outputFile: jsonReporterPath }],
  ],
  use: {
    baseURL: 'https://demowebshop.tricentis.com',
    headless: true,
    actionTimeout: 15 * 1000,
    navigationTimeout: 30 * 1000,
    screenshot: 'only-on-failure',
    video: 'on-first-retry',
    trace: 'retain-on-failure',
  },
  projects: [
    {
      name: 'chromium',
      use: { ...devices['Desktop Chrome'] },
    },
    {
      name: 'firefox',
      use: { ...devices['Desktop Firefox'] },
    },
    {
      name: 'webkit',
      use: { ...devices['Desktop Safari'] },
    },
  ],
  outputDir: 'artifacts',
});
