const { chromium } = require('playwright');

(async () => {
  const browser = await chromium.launch({ headless: true });
  const page = await browser.newPage();

  // Capture all console logs with coordinates
  page.on('console', msg => {
    const text = msg.text();
    if (text.includes('pdfCoordinates')) {
      console.log('COORD:', text);
    }
    if (text.includes('Rendering') && text.includes('highlights')) {
      console.log('RENDER:', text);
    }
    if (text.includes('VISUAL DEBUG')) {
      console.log('DEBUG:', text);
    }
  });

  console.log('=== Starting Test ===');
  console.log('');

  // Login
  await page.goto('https://app-react.omegaintelligence.ai/login');
  await page.waitForLoadState('networkidle');
  await page.fill('input[placeholder="Enter your username"]', 'admin');
  await page.fill('input[placeholder="Enter your password"]', 'admin123');
  await page.click('button:has-text("Sign in")');
  await page.waitForURL(/\/(dashboard|documents|home)?$/, { timeout: 15000 });
  await page.waitForTimeout(1000);
  console.log('Login successful');

  // Navigate to document
  await page.goto('https://app-react.omegaintelligence.ai/documents/e37f9df8');
  await page.waitForLoadState('networkidle');
  await page.waitForTimeout(5000);
  console.log('Document loaded');

  // Find and click extractions
  const items = await page.$$('div[class*="cursor-pointer"]');
  console.log('Found', items.length, 'clickable items');
  console.log('');

  if (items.length > 0) {
    console.log('=== Clicking first extraction ===');
    await items[0].click();
    await page.waitForTimeout(2000);

    // Take screenshot
    await page.screenshot({ path: 'test-results/coord-detail-1.png' });
    console.log('Screenshot saved: coord-detail-1.png');
  }

  if (items.length > 2) {
    console.log('');
    console.log('=== Clicking third extraction ===');
    await items[2].click();
    await page.waitForTimeout(2000);

    // Take screenshot
    await page.screenshot({ path: 'test-results/coord-detail-2.png' });
    console.log('Screenshot saved: coord-detail-2.png');
  }

  console.log('');
  console.log('=== Test Complete ===');
  await browser.close();
})();
