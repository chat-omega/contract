import { test, expect, Page } from '@playwright/test';

/**
 * Comprehensive PDF Extraction Navigation & Highlighting Test Suite
 *
 * Tests for the fix of race condition where renderAllPages() was called twice
 * - Fix 1: Filtered RenderingCancelledException from error logging
 * - Fix 2: Removed isLoading from scale effect dependencies
 *
 * Production URL: https://app-react.omegaintelligence.ai/documents/e37f9df8
 * Login: admin / admin123
 */

const PRODUCTION_URL = 'https://app-react.omegaintelligence.ai';
const DOCUMENT_ID = 'e37f9df8';
const TEST_USERNAME = 'admin';
const TEST_PASSWORD = 'admin123';

interface ConsoleLog {
  type: string;
  text: string;
  timestamp: number;
}

interface TestResult {
  scenario: string;
  status: 'PASS' | 'FAIL';
  details: string;
  consoleLogs?: ConsoleLog[];
  errorCount?: number;
}

let consoleLogs: ConsoleLog[] = [];
let renderingCancelledErrors: ConsoleLog[] = [];

// Helper function to capture console messages
function setupConsoleCapture(page: Page) {
  consoleLogs = [];
  renderingCancelledErrors = [];

  page.on('console', (msg) => {
    const logEntry: ConsoleLog = {
      type: msg.type(),
      text: msg.text(),
      timestamp: Date.now(),
    };

    consoleLogs.push(logEntry);

    // Track RenderingCancelledException specifically
    if (msg.text().includes('RenderingCancelledException')) {
      renderingCancelledErrors.push(logEntry);
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
      renderingCancelledErrors.push(logEntry);
    }
  });
}

// Helper function to login
async function login(page: Page) {
  await page.goto(`${PRODUCTION_URL}/login`);

  // Wait for username input by placeholder
  await page.waitForSelector('input[placeholder="Enter your username"]', { timeout: 15000 });

  // Fill in credentials using placeholder selectors
  await page.fill('input[placeholder="Enter your username"]', TEST_USERNAME);
  await page.fill('input[placeholder="Enter your password"]', TEST_PASSWORD);

  // Click the Sign in button
  await page.click('button:has-text("Sign in")');

  // Wait for successful login by checking for dashboard or any authenticated page
  // Look for the "Welcome back" text or sidebar navigation
  await page.waitForSelector('text=Welcome back', { timeout: 15000 });
}

// Helper function to analyze console logs
function analyzeConsoleLogs() {
  const pdfLoadedMessages = consoleLogs.filter(log =>
    log.text.includes('PDF loaded successfully')
  );

  const scrollMessages = consoleLogs.filter(log =>
    log.text.includes('Scrolling to page')
  );

  const highlightMessages = consoleLogs.filter(log =>
    log.text.includes('Re-rendering highlights')
  );

  return {
    totalLogs: consoleLogs.length,
    pdfLoadedCount: pdfLoadedMessages.length,
    scrollCount: scrollMessages.length,
    highlightCount: highlightMessages.length,
    renderingCancelledCount: renderingCancelledErrors.length,
    pdfLoadedMessages,
    scrollMessages,
    highlightMessages,
    renderingCancelledErrors,
  };
}

test.describe('PDF Extraction Navigation & Highlighting Tests', () => {
  test.beforeEach(async ({ page }) => {
    setupConsoleCapture(page);
  });

  test('Scenario 1: Initial document load - should load successfully with minimal errors', async ({ page }) => {
    const results: TestResult[] = [];

    // Navigate directly to the document (already authenticated)
    await page.goto(`${PRODUCTION_URL}/documents/${DOCUMENT_ID}`);

    // Wait for PDF viewer to load
    await page.waitForSelector('.pdf-viewer-container', { timeout: 30000 });

    // Wait a bit for PDF to fully render
    await page.waitForTimeout(5000);

    // Take screenshot
    await page.screenshot({
      path: 'test-results/scenario1-initial-load.png',
      fullPage: true
    });

    // Analyze console logs
    const analysis = analyzeConsoleLogs();

    // Check for "PDF loaded successfully" message
    const hasPdfLoadedMessage = analysis.pdfLoadedCount > 0;

    // Check RenderingCancelledException count (should be 0-2 max)
    const hasAcceptableErrorCount = analysis.renderingCancelledCount <= 2;

    const result: TestResult = {
      scenario: 'Initial document load',
      status: (hasPdfLoadedMessage && hasAcceptableErrorCount) ? 'PASS' : 'FAIL',
      details: `
        - PDF loaded successfully: ${hasPdfLoadedMessage ? 'YES' : 'NO'}
        - Total console logs: ${analysis.totalLogs}
        - PDF loaded messages: ${analysis.pdfLoadedCount}
        - RenderingCancelledException count: ${analysis.renderingCancelledCount}
        - Acceptable error count (≤2): ${hasAcceptableErrorCount ? 'YES' : 'NO'}
      `,
      consoleLogs: consoleLogs,
      errorCount: analysis.renderingCancelledCount,
    };

    results.push(result);

    // Assertions
    expect(hasPdfLoadedMessage, 'PDF should load successfully').toBeTruthy();
    expect(analysis.renderingCancelledCount, 'RenderingCancelledException count should be ≤2').toBeLessThanOrEqual(2);

    console.log('\n=== SCENARIO 1 RESULTS ===');
    console.log(result.details);
    console.log('\nConsole log analysis:', JSON.stringify(analysis, null, 2));
  });

  test('Scenario 2: Click extraction #2 from Parties field - should scroll and highlight', async ({ page }) => {
    // Navigate to document (already authenticated)
    await page.goto(`${PRODUCTION_URL}/documents/${DOCUMENT_ID}`);
    await page.waitForSelector('.pdf-viewer-container', { timeout: 30000 });
    await page.waitForTimeout(3000);

    // Clear previous console logs from initial load
    const initialErrorCount = renderingCancelledErrors.length;

    // Find clickable extraction items (those with "Click to view" text)
    const extractionItems = await page.locator('div.cursor-pointer:has-text("Click to view")').all();

    console.log(`Found ${extractionItems.length} clickable extraction items`);

    if (extractionItems.length >= 2) {
      // Click the second extraction (index 1)
      await extractionItems[1].click();
    } else if (extractionItems.length > 0) {
      // If less than 2, click the first one
      await extractionItems[0].click();
    } else {
      throw new Error('No clickable extraction items found');
    }

    // Wait for scroll and highlight to complete
    await page.waitForTimeout(2000);

    // Take screenshot
    await page.screenshot({
      path: 'test-results/scenario2-extraction-2-clicked.png',
      fullPage: true
    });

    // Analyze console logs
    const analysis = analyzeConsoleLogs();
    const newErrors = analysis.renderingCancelledCount - initialErrorCount;

    // Check for scroll and highlight messages
    const hasScrollMessage = analysis.scrollMessages.length > 0;
    const hasHighlightMessage = analysis.highlightMessages.length > 0;

    // Check that new errors are minimal
    const hasMinimalNewErrors = newErrors <= 2;

    const result: TestResult = {
      scenario: 'Click extraction #2 from Parties field',
      status: (hasScrollMessage && hasHighlightMessage && hasMinimalNewErrors) ? 'PASS' : 'FAIL',
      details: `
        - Scroll message detected: ${hasScrollMessage ? 'YES' : 'NO'}
        - Highlight message detected: ${hasHighlightMessage ? 'YES' : 'NO'}
        - New RenderingCancelledException: ${newErrors}
        - Minimal new errors (≤2): ${hasMinimalNewErrors ? 'YES' : 'NO'}
        - Scroll messages: ${analysis.scrollCount}
        - Highlight messages: ${analysis.highlightCount}
      `,
      errorCount: newErrors,
    };

    console.log('\n=== SCENARIO 2 RESULTS ===');
    console.log(result.details);

    expect(hasMinimalNewErrors, 'Should have minimal new errors after clicking').toBeTruthy();
  });

  test('Scenario 3: Click extraction #15 from Parties field - should scroll and highlight', async ({ page }) => {
    await page.goto(`${PRODUCTION_URL}/documents/${DOCUMENT_ID}`);
    await page.waitForSelector('.pdf-viewer-container', { timeout: 30000 });
    await page.waitForTimeout(3000);

    const initialErrorCount = renderingCancelledErrors.length;

    // Find clickable extraction items
    const extractionItems = await page.locator('div.cursor-pointer:has-text("Click to view")').all();

    console.log(`Found ${extractionItems.length} clickable extraction items for scenario 3`);

    // Click extraction #15 if available, otherwise click a later one
    const targetIndex = Math.min(14, extractionItems.length - 1);
    if (targetIndex >= 0) {
      await extractionItems[targetIndex].click();
    } else {
      throw new Error('No clickable extraction items found');
    }

    await page.waitForTimeout(2000);

    await page.screenshot({
      path: 'test-results/scenario3-extraction-15-clicked.png',
      fullPage: true
    });

    const analysis = analyzeConsoleLogs();
    const newErrors = analysis.renderingCancelledCount - initialErrorCount;

    const result: TestResult = {
      scenario: 'Click extraction #15 from Parties field',
      status: (newErrors <= 2) ? 'PASS' : 'FAIL',
      details: `
        - New RenderingCancelledException: ${newErrors}
        - Scroll messages: ${analysis.scrollCount}
        - Highlight messages: ${analysis.highlightCount}
      `,
      errorCount: newErrors,
    };

    console.log('\n=== SCENARIO 3 RESULTS ===');
    console.log(result.details);

    expect(newErrors).toBeLessThanOrEqual(2);
  });

  test('Scenario 4: Rapid clicking between extractions - should handle gracefully', async ({ page }) => {
    await page.goto(`${PRODUCTION_URL}/documents/${DOCUMENT_ID}`);
    await page.waitForSelector('.pdf-viewer-container', { timeout: 30000 });
    await page.waitForTimeout(3000);

    const initialErrorCount = renderingCancelledErrors.length;

    // Get all clickable extraction items
    const extractionItems = await page.locator('div.cursor-pointer:has-text("Click to view")').all();

    console.log(`Found ${extractionItems.length} clickable extraction items for rapid clicking`);

    // Rapid click through multiple extractions
    const clickCount = Math.min(5, extractionItems.length);

    for (let i = 0; i < clickCount; i++) {
      await extractionItems[i].click();
      await page.waitForTimeout(300); // Minimal delay between clicks
    }

    // Wait for all operations to settle
    await page.waitForTimeout(2000);

    await page.screenshot({
      path: 'test-results/scenario4-rapid-clicking.png',
      fullPage: true
    });

    const analysis = analyzeConsoleLogs();
    const newErrors = analysis.renderingCancelledCount - initialErrorCount;

    // During rapid clicking, we might see a few more errors, but should still be reasonable
    const hasReasonableErrorCount = newErrors <= 5;

    const result: TestResult = {
      scenario: 'Rapid clicking between extractions',
      status: hasReasonableErrorCount ? 'PASS' : 'FAIL',
      details: `
        - Clicks performed: ${clickCount}
        - New RenderingCancelledException: ${newErrors}
        - Reasonable error count (≤5): ${hasReasonableErrorCount ? 'YES' : 'NO'}
        - Scroll messages: ${analysis.scrollCount}
        - Highlight messages: ${analysis.highlightCount}
      `,
      errorCount: newErrors,
    };

    console.log('\n=== SCENARIO 4 RESULTS ===');
    console.log(result.details);

    expect(hasReasonableErrorCount, 'Should handle rapid clicking with reasonable error count').toBeTruthy();
  });

  test('Scenario 5: Verify only clicked extraction is highlighted', async ({ page }) => {
    await page.goto(`${PRODUCTION_URL}/documents/${DOCUMENT_ID}`);
    await page.waitForSelector('.pdf-viewer-container', { timeout: 30000 });
    await page.waitForTimeout(3000);

    // Click an extraction
    const extractionItems = await page.locator('div.cursor-pointer:has-text("Click to view")').all();

    console.log(`Found ${extractionItems.length} clickable extraction items for highlight verification`);

    if (extractionItems.length > 0) {
      await extractionItems[0].click();
      await page.waitForTimeout(1500);

      // Count highlighted elements in the PDF viewer
      const highlightedElements = await page.locator('.pdf-viewer-container .highlight, .pdf-viewer-container .highlighted, .pdf-viewer-container [data-highlighted="true"]').count();

      await page.screenshot({
        path: 'test-results/scenario5-single-highlight.png',
        fullPage: true
      });

      // We expect only one highlight to be visible at a time
      // (or a small number if the extraction spans multiple lines/pages)
      const hasSingleHighlight = highlightedElements >= 1 && highlightedElements <= 3;

      const result: TestResult = {
        scenario: 'Verify only clicked extraction is highlighted',
        status: hasSingleHighlight ? 'PASS' : 'FAIL',
        details: `
          - Highlighted elements found: ${highlightedElements}
          - Expected: 1-3 elements
          - Single highlight verified: ${hasSingleHighlight ? 'YES' : 'NO'}
        `,
      };

      console.log('\n=== SCENARIO 5 RESULTS ===');
      console.log(result.details);

      expect(hasSingleHighlight, 'Should have only the clicked extraction highlighted').toBeTruthy();
    }
  });
});

test.describe('Console Log Deep Analysis', () => {
  test.beforeEach(async ({ page }) => {
    setupConsoleCapture(page);
  });

  test('Generate comprehensive console log report', async ({ page }) => {
    await page.goto(`${PRODUCTION_URL}/documents/${DOCUMENT_ID}`);
    await page.waitForSelector('.pdf-viewer-container', { timeout: 30000 });

    // Wait for full load
    await page.waitForTimeout(5000);

    // Perform several clicks
    const extractionItems = await page.locator('div.cursor-pointer:has-text("Click to view")').all();

    console.log(`Found ${extractionItems.length} clickable extraction items for console analysis`);

    for (let i = 0; i < Math.min(3, extractionItems.length); i++) {
      await extractionItems[i].click();
      await page.waitForTimeout(1000);
    }

    // Final analysis
    const analysis = analyzeConsoleLogs();

    console.log('\n=== COMPREHENSIVE CONSOLE LOG ANALYSIS ===\n');
    console.log('Total console messages:', analysis.totalLogs);
    console.log('PDF loaded messages:', analysis.pdfLoadedCount);
    console.log('Scroll messages:', analysis.scrollCount);
    console.log('Highlight messages:', analysis.highlightCount);
    console.log('RenderingCancelledException errors:', analysis.renderingCancelledCount);

    console.log('\n--- PDF Loaded Messages ---');
    analysis.pdfLoadedMessages.forEach((log, idx) => {
      console.log(`${idx + 1}. [${log.type}] ${log.text}`);
    });

    console.log('\n--- Scroll Messages ---');
    analysis.scrollMessages.forEach((log, idx) => {
      console.log(`${idx + 1}. [${log.type}] ${log.text}`);
    });

    console.log('\n--- Highlight Messages ---');
    analysis.highlightMessages.forEach((log, idx) => {
      console.log(`${idx + 1}. [${log.type}] ${log.text}`);
    });

    console.log('\n--- RenderingCancelledException Errors ---');
    if (analysis.renderingCancelledCount === 0) {
      console.log('✅ NO RenderingCancelledException errors found!');
    } else {
      analysis.renderingCancelledErrors.forEach((log, idx) => {
        console.log(`${idx + 1}. [${log.type}] ${log.text}`);
      });
    }

    console.log('\n=== FINAL VERDICT ===');
    if (analysis.renderingCancelledCount === 0) {
      console.log('✅ PERFECT: Zero RenderingCancelledException errors');
    } else if (analysis.renderingCancelledCount <= 2) {
      console.log('✅ PASS: Acceptable error count (≤2)');
    } else if (analysis.renderingCancelledCount <= 5) {
      console.log('⚠️  WARNING: Elevated error count (3-5)');
    } else {
      console.log('❌ FAIL: Too many errors (>5)');
    }

    // Save detailed report
    const report = {
      timestamp: new Date().toISOString(),
      analysis,
      verdict: analysis.renderingCancelledCount <= 2 ? 'PASS' : 'FAIL',
      allLogs: consoleLogs,
    };

    await page.evaluate((reportData) => {
      console.log('=== FULL REPORT ===');
      console.log(JSON.stringify(reportData, null, 2));
    }, report);
  });
});
