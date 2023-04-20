import type { PlaywrightTestConfig } from '@playwright/test';
import { join } from 'path';

const IS_CI = !!process.env.CI;
const PORT = process.env.PORT || 3004;

const config: PlaywrightTestConfig = {
  workers: 1,
  testMatch: join(__dirname, './playwright/**/*.test.ts'),
  testDir: join(__dirname, './playwright/'),
  reporter: [['list', { printSteps: true }]],
  // Retry tests on CI if they fail
  retries: IS_CI ? 2 : 0,
  webServer: {
    command: `pnpm dev`,
    port: Number(PORT),
    reuseExistingServer: true,
  },
  use: {
    baseURL: `http://localhost:${PORT}/`,
    headless: true,
  },
};

export default config;