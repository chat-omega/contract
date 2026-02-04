import { chromium, FullConfig } from '@playwright/test';

const BASE_URL = process.env.BASE_URL || 'http://localhost:8081';
const TEST_USERNAME = 'admin';
const TEST_PASSWORD = 'admin123';

async function globalSetup(config: FullConfig) {
  const browser = await chromium.launch();
  const context = await browser.newContext({ ignoreHTTPSErrors: true });
  const page = await context.newPage();

  console.log(`[Global Setup] Logging in to: ${BASE_URL}/login`);

  // Perform login
  await page.goto(`${BASE_URL}/login`);
  await page.waitForSelector('input[placeholder="Enter your username"]', { timeout: 15000 });
  await page.fill('input[placeholder="Enter your username"]', TEST_USERNAME);
  await page.fill('input[placeholder="Enter your password"]', TEST_PASSWORD);
  await page.click('button:has-text("Sign in")');
  await page.waitForSelector('text=Welcome back', { timeout: 15000 });

  // Save signed-in state
  await context.storageState({ path: 'test-results/auth-state.json' });

  await browser.close();
}

export default globalSetup;
