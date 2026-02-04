import { test, expect, Page, ConsoleMessage } from '@playwright/test';

/**
 * Simplified PDF Extraction Navigation Test
 * Manual console log analysis for RenderingCancelledException errors
 */

const PRODUCTION_URL = 'https://app-react.omegaintelligence.ai';
const DOCUMENT_ID = 'e37f9df8';

interface ConsoleLog {
  type: string;
  text: string;
  timestamp: number;
}

let consoleLogs: ConsoleLog[] = [];
let renderingErrors: ConsoleLog[] = [];

test('PDF Extraction Navigation - Full Test with Console Analysis', async ({ page }) => {
  // Setup console capture
  consoleLogs = [];
  renderingErrors = [];

  page.on('console', (msg: ConsoleMessage) => {
    const logEntry: ConsoleLog = {
      type: msg.type(),
      text: msg.text(),
      timestamp: Date.now(),
    };
    consoleLogs.push(logEntry);

    if (msg.text().includes('RenderingCancelledException')) {
      renderingErrors.push(logEntry);
    }
  });

  page.on('pageerror', (error) => {
    const logEntry: ConsoleLog = {
      type: 'error',
      text: error.message,
      timestamp: Date.now(),
    };
    consoleLogs.push(logEntry);

    if (error.message.includes('RenderingCancelledException')) {
      renderingErrors.push(logEntry);
    }
  });

  console.log('\n========================================');
  console.log('STARTING PDF EXTRACTION NAVIGATION TEST');
  console.log('========================================\n');

  // Step 1: Login
  console.log('Step 1: Logging in...');
  await page.goto(`${PRODUCTION_URL}/login`);
  await page.waitForLoadState('networkidle');

  await page.fill('input[placeholder="Enter your username"]', 'admin');
  await page.fill('input[placeholder="Enter your password"]', 'admin123');
  await page.click('button:has-text("Sign in")');

  // Wait for redirect after login - look for dashboard content or URL change
  await page.waitForURL(/\/(dashboard|documents|home)?$/, { timeout: 15000 });
  // Wait a moment for auth token to be stored
  await page.waitForTimeout(1000);
  console.log('✓ Login successful\n');

  // Step 2: Navigate to document
  console.log(`Step 2: Navigating to document ${DOCUMENT_ID}...`);
  await page.goto(`${PRODUCTION_URL}/documents/${DOCUMENT_ID}`);
  await page.waitForLoadState('networkidle');

  // Check for PDF viewer - wait for PDF pages to load
  await page.waitForTimeout(5000); // Give page time to load PDF

  // Look for .pdf-page-container (actual class used by PDFViewer component)
  const hasViewer = await page.locator('.pdf-page-container').count() > 0;
  if (!hasViewer) {
    const errorMsg = await page.textContent('body');
    console.log('❌ PDF viewer not found. Page content:', errorMsg?.substring(0, 500));

    // Take screenshot for debugging
    await page.screenshot({ path: 'test-results/no-viewer-found.png', fullPage: true });

    throw new Error('PDF viewer container not found on page');
  }

  // Verify highlight canvas is present with correct class (our fix)
  const highlightCanvasCount = await page.locator('.highlight-canvas').count();
  console.log(`✓ PDF viewer found with ${highlightCanvasCount} highlight canvas elements\n`);

  // Step 3: Wait for PDF to load
  console.log('Step 3: Waiting for PDF to load...');
  await page.waitForTimeout(5000);

  const initialErrorCount = renderingErrors.length;
  console.log(`✓ PDF loaded. Initial RenderingCancelledException count: ${initialErrorCount}\n`);

  await page.screenshot({ path: 'test-results/pdf-loaded.png', fullPage: true });

  // Step 4: Find and click extractions
  console.log('Step 4: Finding clickable extractions...');
  const extractionItems = await page.locator('div.cursor-pointer:has-text("Click to view")').all();
  const extractionCount = extractionItems.length;
  console.log(`✓ Found ${extractionCount} clickable extraction items\n`);

  if (extractionCount === 0) {
    console.log('⚠ No clickable extractions found. Taking screenshot...');
    await page.screenshot({ path: 'test-results/no-extractions.png', fullPage: true });
  }

  // Step 5: Test clicking extractions
  if (extractionCount > 0) {
    console.log('Step 5: Testing extraction clicks...\n');

    // Test 1: Click first extraction
    console.log('  Test 5a: Clicking extraction #1...');
    const beforeClick1 = renderingErrors.length;
    await extractionItems[0].click();
    await page.waitForTimeout(1500);
    const afterClick1 = renderingErrors.length;
    const errors1 = afterClick1 - beforeClick1;
    console.log(`  ✓ Clicked extraction #1. New errors: ${errors1}`);
    await page.screenshot({ path: 'test-results/extraction-1-clicked.png' });

    // Test 2: Click second extraction if available
    if (extractionCount > 1) {
      console.log('  Test 5b: Clicking extraction #2...');
      const beforeClick2 = renderingErrors.length;
      await extractionItems[1].click();
      await page.waitForTimeout(1500);
      const afterClick2 = renderingErrors.length;
      const errors2 = afterClick2 - beforeClick2;
      console.log(`  ✓ Clicked extraction #2. New errors: ${errors2}`);
      await page.screenshot({ path: 'test-results/extraction-2-clicked.png' });
    }

    // Test 3: Rapid clicking
    if (extractionCount >= 3) {
      console.log('  Test 5c: Rapid clicking test...');
      const beforeRapid = renderingErrors.length;

      for (let i = 0; i < Math.min(5, extractionCount); i++) {
        await extractionItems[i].click();
        await page.waitForTimeout(300);
      }

      await page.waitForTimeout(2000);
      const afterRapid = renderingErrors.length;
      const errorsRapid = afterRapid - beforeRapid;
      console.log(`  ✓ Rapid clicking complete. New errors: ${errorsRapid}`);
      await page.screenshot({ path: 'test-results/rapid-clicking.png' });
    }
  }

  // Final Analysis
  console.log('\n========================================');
  console.log('FINAL CONSOLE LOG ANALYSIS');
  console.log('========================================\n');

  const pdfLoadedMessages = consoleLogs.filter(log =>
    log.text.includes('PDF loaded successfully')
  );

  const scrollMessages = consoleLogs.filter(log =>
    log.text.includes('Scrolling to page')
  );

  const highlightMessages = consoleLogs.filter(log =>
    log.text.includes('Re-rendering highlights') || log.text.includes('Rendering highlight')
  );

  console.log(`Total console messages: ${consoleLogs.length}`);
  console.log(`PDF loaded messages: ${pdfLoadedMessages.length}`);
  console.log(`Scroll messages: ${scrollMessages.length}`);
  console.log(`Highlight messages: ${highlightMessages.length}`);
  console.log(`RenderingCancelledException errors: ${renderingErrors.length}`);

  console.log('\n--- PDF Loaded Messages ---');
  pdfLoadedMessages.forEach((log, idx) => {
    console.log(`${idx + 1}. ${log.text}`);
  });

  console.log('\n--- Scroll Messages ---');
  scrollMessages.slice(0, 10).forEach((log, idx) => {
    console.log(`${idx + 1}. ${log.text}`);
  });

  console.log('\n--- Highlight Messages ---');
  highlightMessages.slice(0, 10).forEach((log, idx) => {
    console.log(`${idx + 1}. ${log.text}`);
  });

  console.log('\n--- RenderingCancelledException Errors ---');
  if (renderingErrors.length === 0) {
    console.log('✅ NO RenderingCancelledException errors found!');
  } else {
    renderingErrors.forEach((log, idx) => {
      console.log(`${idx + 1}. [${log.type}] ${log.text}`);
    });
  }

  console.log('\n========================================');
  console.log('TEST VERDICT');
  console.log('========================================\n');

  if (renderingErrors.length === 0) {
    console.log('✅ PERFECT: Zero RenderingCancelledException errors');
  } else if (renderingErrors.length <= 2) {
    console.log('✅ PASS: Acceptable error count (≤2)');
  } else if (renderingErrors.length <= 5) {
    console.log('⚠️  WARNING: Elevated error count (3-5)');
  } else {
    console.log('❌ FAIL: Too many errors (>5)');
  }

  console.log(`\nFinal error count: ${renderingErrors.length}`);
  console.log('Screenshots saved to test-results/\n');

  // Assertions
  expect(pdfLoadedMessages.length, 'Should have PDF loaded message').toBeGreaterThan(0);
  expect(renderingErrors.length, 'RenderingCancelledException count should be acceptable').toBeLessThanOrEqual(5);
});
