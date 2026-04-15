import { defineConfig, devices } from '@playwright/test';

/**
 * Playwright configuration for Inventory Module E2E tests.
 * 
 * Tests run against the Angular dev server (port 4200) which connects
 * to the Spring Boot backend (port 8080). Both must be running.
 * 
 * Usage:
 *   npx playwright test                    # Run all tests
 *   npx playwright test --ui               # Run with UI mode
 *   npx playwright test dealer.spec.ts     # Run specific test file
 */
const isCI = !!process.env['CI'];

export default defineConfig({
  testDir: './e2e',
  fullyParallel: false,
  forbidOnly: isCI,
  retries: isCI ? 2 : 0,
  workers: 1,
  reporter: [['html', { open: 'never' }], ['list']],
  
  use: {
    baseURL: 'http://localhost:4200',
    trace: 'on-first-retry',
    screenshot: 'only-on-failure',
    actionTimeout: 10000,
  },

  projects: [
    {
      name: 'chromium',
      use: { ...devices['Desktop Chrome'] },
    },
  ],

  /* Start Angular dev server before tests */
  webServer: [
    {
      command: 'npx ng serve --port 4200',
      url: 'http://localhost:4200',
      reuseExistingServer: !isCI,
      timeout: 120000,
    },
  ],
});
