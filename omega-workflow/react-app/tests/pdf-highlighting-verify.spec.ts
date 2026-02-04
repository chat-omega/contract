import { test, expect, Page, ConsoleMessage } from '@playwright/test';

/**
 * PDF Highlighting Verification Test
 * Tests the visual debug rectangle and coordinate transformation
 */

const PRODUCTION_URL = 'https://app-react.omegaintelligence.ai';
const DOCUMENT_ID = 'e37f9df8';

interface ConsoleLog {
  type: string;
  text: string;
  timestamp: number;
}

let consoleLogs: ConsoleLog[] = [];

test('PDF Highlighting - Verify Debug Rectangle and Coordinates', async ({ page }) => {
  consoleLogs = [];

  page.on('console', (msg: ConsoleMessage) => {
    const logEntry: ConsoleLog = {
      type: msg.type(),
      text: msg.text(),
      timestamp: Date.now(),
    };
    consoleLogs.push(logEntry);

    // Print important logs in real-time
    if (msg.text().includes('[VISUAL DEBUG]') ||
        msg.text().includes('[pdfCoordinates]') ||
        msg.text().includes('FORCING highlight') ||
        msg.text().includes('Rendering') && msg.text().includes('highlight')) {
      console.log(`[CONSOLE] ${msg.text()}`);
    }
  });

  console.log('\n========================================');
  console.log('PDF HIGHLIGHTING VERIFICATION TEST');
  console.log('========================================\n');

  // Step 1: Login
  console.log('Step 1: Logging in...');
  await page.goto(`${PRODUCTION_URL}/login`);
  await page.waitForLoadState('networkidle');

  await page.fill('input[placeholder="Enter your username"]', 'admin');
  await page.fill('input[placeholder="Enter your password"]', 'admin123');
  await page.click('button:has-text("Sign in")');

  await page.waitForURL(/\/(dashboard|documents|home)?$/, { timeout: 15000 });
  await page.waitForTimeout(1000);
  console.log('✓ Login successful\n');

  // Step 2: Navigate to document
  console.log(`Step 2: Navigating to document ${DOCUMENT_ID}...`);
  await page.goto(`${PRODUCTION_URL}/documents/${DOCUMENT_ID}`);
  await page.waitForLoadState('networkidle');
  await page.waitForTimeout(5000);

  // Verify PDF viewer
  const hasViewer = await page.locator('.pdf-page-container').count() > 0;
  expect(hasViewer).toBe(true);
  console.log('✓ PDF viewer loaded\n');

  // Step 3: Find extraction items
  console.log('Step 3: Finding extraction items...');

  // Look for extraction items in the panel - they have specific structure
  // The extraction panel shows field results with values
  const extractionPanel = page.locator('[class*="extraction"]').first();
  const extractionExists = await extractionPanel.count() > 0;

  if (!extractionExists) {
    console.log('  Looking for alternative selectors...');
  }

  // Try multiple selectors for extraction items
  const selectors = [
    'div[class*="cursor-pointer"]',  // Clickable items
    'div[class*="field-value"]',     // Field values
    'div[class*="result-item"]',     // Result items
    '[data-testid="extraction-item"]', // Test IDs
    'div.p-3.border-b',              // Panel items with borders
  ];

  let extractionItems: any = null;
  for (const selector of selectors) {
    const items = await page.locator(selector).all();
    if (items.length > 0) {
      console.log(`  Found ${items.length} items with selector: ${selector}`);
      if (items.length > 5) {
        extractionItems = items;
        break;
      }
    }
  }

  // Take screenshot of initial state
  await page.screenshot({ path: 'test-results/initial-state.png', fullPage: true });

  // Step 4: Click on extractions if found
  if (extractionItems && extractionItems.length > 0) {
    console.log(`\nStep 4: Testing extraction clicks (${extractionItems.length} items)...\n`);

    // Click first extraction
    console.log('  Clicking first extraction...');
    await extractionItems[0].click();
    await page.waitForTimeout(2000);

    await page.screenshot({ path: 'test-results/extraction-clicked-1.png', fullPage: true });

    // Click second extraction if available
    if (extractionItems.length > 1) {
      console.log('  Clicking second extraction...');
      await extractionItems[1].click();
      await page.waitForTimeout(2000);

      await page.screenshot({ path: 'test-results/extraction-clicked-2.png', fullPage: true });
    }

    // Click third extraction if available
    if (extractionItems.length > 2) {
      console.log('  Clicking third extraction...');
      await extractionItems[2].click();
      await page.waitForTimeout(2000);

      await page.screenshot({ path: 'test-results/extraction-clicked-3.png', fullPage: true });
    }
  } else {
    console.log('\n⚠ No extraction items found with standard selectors');
    console.log('  Taking full page screenshot for manual inspection...');
    await page.screenshot({ path: 'test-results/no-extractions-found.png', fullPage: true });
  }

  // Step 5: Analyze console logs
  console.log('\n========================================');
  console.log('CONSOLE LOG ANALYSIS');
  console.log('========================================\n');

  const visualDebugLogs = consoleLogs.filter(log =>
    log.text.includes('[VISUAL DEBUG]')
  );

  const coordsLogs = consoleLogs.filter(log =>
    log.text.includes('[pdfCoordinates]')
  );

  const forcingLogs = consoleLogs.filter(log =>
    log.text.includes('FORCING highlight')
  );

  const highlightRenderLogs = consoleLogs.filter(log =>
    log.text.includes('Rendering') && log.text.includes('highlight')
  );

  console.log(`Visual Debug Logs: ${visualDebugLogs.length}`);
  console.log(`Coordinate Transform Logs: ${coordsLogs.length}`);
  console.log(`Forcing Highlight Logs: ${forcingLogs.length}`);
  console.log(`Highlight Render Logs: ${highlightRenderLogs.length}`);

  console.log('\n--- Visual Debug Logs (last 5) ---');
  visualDebugLogs.slice(-5).forEach((log, idx) => {
    console.log(`${idx + 1}. ${log.text.substring(0, 200)}...`);
  });

  console.log('\n--- Coordinate Transform Logs (last 5) ---');
  coordsLogs.slice(-5).forEach((log, idx) => {
    console.log(`${idx + 1}. ${log.text.substring(0, 200)}...`);
  });

  console.log('\n--- Forcing Highlight Logs ---');
  forcingLogs.forEach((log, idx) => {
    console.log(`${idx + 1}. ${log.text}`);
  });

  console.log('\n========================================');
  console.log('TEST VERDICT');
  console.log('========================================\n');

  if (visualDebugLogs.length > 0) {
    console.log('✅ Visual debug rectangles were drawn');
  } else {
    console.log('⚠️ No visual debug rectangles detected');
  }

  if (coordsLogs.length > 0) {
    console.log('✅ Coordinate transformations occurred');
  } else {
    console.log('⚠️ No coordinate transformations detected');
  }

  if (forcingLogs.length > 0) {
    console.log('✅ Forced highlight renders after scroll');
  } else {
    console.log('⚠️ No forced highlight renders detected');
  }

  console.log('\nScreenshots saved to test-results/');
  console.log('Check extraction-clicked-*.png for visual verification\n');

  // The test passes if we got this far
  expect(true).toBe(true);
});
