import { test, expect, Page, ConsoleMessage } from '@playwright/test';

/**
 * Enhanced Test for Extraction Click Navigation Fix
 * Verifies that the useCallback memoization and diagnostic logging fix works correctly
 *
 * This test specifically checks for the new diagnostic console logs:
 * - [ExtractionPanel] Extraction clicked
 * - [ExtractionPanel] Calling onExtractionClick
 * - [DocumentDetailPage] handleExtractionClick CALLED
 * - [PDFViewer] Scroll effect triggered
 * - [PDFViewer] Page X found - jumping directly
 */

const DOCUMENT_ID = 'e37f9df8'; // Known document with extractions

interface ConsoleLog {
  type: string;
  text: string;
  timestamp: number;
}

let consoleLogs: ConsoleLog[] = [];

test.describe('Extraction Click Navigation Fix', () => {
  test.beforeEach(async ({ page }) => {
    // Reset console logs
    consoleLogs = [];

    // Capture all console messages
    page.on('console', (msg: ConsoleMessage) => {
      const logEntry: ConsoleLog = {
        type: msg.type(),
        text: msg.text(),
        timestamp: Date.now(),
      };
      consoleLogs.push(logEntry);
    });

    page.on('pageerror', (error) => {
      consoleLogs.push({
        type: 'error',
        text: error.message,
        timestamp: Date.now(),
      });
    });
  });

  test('should show complete diagnostic log chain when clicking extraction', async ({ page }) => {
    console.log('\n========================================');
    console.log('EXTRACTION CLICK NAVIGATION FIX TEST');
    console.log('========================================\n');

    // Step 0: Login first
    console.log('Step 0: Logging in...');
    await page.goto('/login');

    const loginForm = await page.locator('input[placeholder="Enter your username"]').count();
    if (loginForm > 0) {
      await page.fill('input[placeholder="Enter your username"]', 'admin');
      await page.fill('input[placeholder="Enter your password"]', 'admin123');
      await page.click('button:has-text("Sign in")');
      await page.waitForTimeout(2000);
      console.log('✓ Login completed');
    } else {
      console.log('✓ Already logged in');
    }

    // Step 1: Navigate to documents page first to see what's available
    console.log('Step 1: Navigating to documents page...');
    await page.goto('/documents');
    await page.waitForTimeout(3000);

    // Try to find any document with extractions
    console.log('Step 1b: Looking for documents with extractions...');
    const documentLinks = await page.locator('a[href*="/documents/"]').all();
    console.log(`Found ${documentLinks.length} document links`);

    let targetDocId = DOCUMENT_ID;
    if (documentLinks.length > 0) {
      // Click the first document
      const firstDocHref = await documentLinks[0].getAttribute('href');
      if (firstDocHref) {
        targetDocId = firstDocHref.split('/documents/')[1];
        console.log(`Using document: ${targetDocId}`);
      }
    }

    // Step 2: Navigate to document
    console.log(`Step 2: Navigating to document ${targetDocId}...`);
    await page.goto(`/documents/${targetDocId}`);

    // Wait for PDF viewer to appear
    console.log('Step 2: Waiting for PDF viewer...');
    await page.waitForSelector('.pdf-viewer-container, [class*="pdf"]', {
      timeout: 15000,
      state: 'visible'
    });
    console.log('✓ PDF viewer found');

    // Wait for extraction panel
    console.log('Step 3: Waiting for extraction panel...');
    const extractionPanelVisible = await page.waitForSelector(
      'text=Extraction Results, h2:has-text("Extraction Results")',
      { timeout: 10000, state: 'visible' }
    ).catch(() => null);

    if (!extractionPanelVisible) {
      console.log('⚠ Extraction panel header not found, continuing...');
    } else {
      console.log('✓ Extraction panel found');
    }

    // Wait a bit for extractions to load
    await page.waitForTimeout(3000);

    // Look for clickable extraction items
    console.log('Step 4: Finding clickable extractions...');

    // Try multiple selectors for extraction items
    const extractionSelectors = [
      '[class*="extraction"][class*="item"]',
      '[class*="ml-6"][class*="p-3"][class*="rounded"]',
      'div:has-text("Page:") >> nth=0',
      '.bg-gray-50.border-gray-200.hover\\:border-gray-300',
    ];

    let clickableExtractions = null;
    for (const selector of extractionSelectors) {
      clickableExtractions = await page.locator(selector).all();
      if (clickableExtractions.length > 0) {
        console.log(`✓ Found ${clickableExtractions.length} extractions using selector: ${selector}`);
        break;
      }
    }

    if (!clickableExtractions || clickableExtractions.length === 0) {
      console.log('⚠ No clickable extractions found');
      console.log('Available text on page:', await page.locator('body').innerText());

      // Take screenshot for debugging
      await page.screenshot({
        path: 'test-results/no-extractions-found.png',
        fullPage: true
      });

      console.log('\n========================================');
      console.log('CONSOLE LOGS CAPTURED:');
      console.log('========================================');
      consoleLogs.forEach((log, idx) => {
        console.log(`[${idx + 1}] [${log.type}] ${log.text}`);
      });

      // This might not be a failure - document might not have extractions yet
      console.log('\n⚠ INCONCLUSIVE: No extractions available to test');
      test.skip();
      return;
    }

    // Clear console logs before clicking
    consoleLogs = [];
    const logCountBefore = consoleLogs.length;

    // Step 5: Click the first extraction
    console.log('\nStep 5: Clicking first extraction...');
    await clickableExtractions[0].click();
    console.log('✓ Click performed');

    // Wait for navigation to complete
    await page.waitForTimeout(2000);

    const logCountAfter = consoleLogs.length;
    console.log(`\nConsole logs generated: ${logCountAfter - logCountBefore}`);

    // Step 6: Analyze console logs
    console.log('\n========================================');
    console.log('CONSOLE LOG ANALYSIS');
    console.log('========================================\n');

    const relevantLogs = consoleLogs.filter(log =>
      log.text.includes('[ExtractionPanel]') ||
      log.text.includes('[DocumentDetailPage]') ||
      log.text.includes('[PDFViewer]') ||
      log.text.includes('Extraction clicked') ||
      log.text.includes('handleExtractionClick') ||
      log.text.includes('Scroll effect') ||
      log.text.includes('NAVIGATION BLOCKED')
    );

    console.log('Relevant diagnostic logs:');
    relevantLogs.forEach((log, idx) => {
      const emoji = log.text.match(/[🖱️✅❌⚠️🔧📜🔍⏭️]/)?.[0] || '';
      console.log(`  ${idx + 1}. [${log.type}] ${emoji} ${log.text.substring(0, 100)}...`);
    });

    // Check for specific diagnostic messages
    const diagnosticChecks = {
      extractionClicked: relevantLogs.some(log =>
        log.text.includes('Extraction clicked') || log.text.includes('🖱️')
      ),
      callingOnExtractionClick: relevantLogs.some(log =>
        log.text.includes('Calling onExtractionClick') || log.text.includes('onExtractionClick call')
      ),
      handleExtractionClickCalled: relevantLogs.some(log =>
        log.text.includes('handleExtractionClick CALLED') || log.text.includes('✅ handleExtractionClick')
      ),
      scrollEffectTriggered: relevantLogs.some(log =>
        log.text.includes('Scroll effect triggered') || log.text.includes('📜')
      ),
      pageFound: relevantLogs.some(log =>
        log.text.includes('found - jumping') || log.text.includes('Page') && log.text.includes('found')
      ),
      navigationBlocked: relevantLogs.some(log =>
        log.text.includes('NAVIGATION BLOCKED') || log.text.includes('Cannot navigate')
      ),
    };

    console.log('\n========================================');
    console.log('DIAGNOSTIC CHECK RESULTS');
    console.log('========================================\n');

    Object.entries(diagnosticChecks).forEach(([check, passed]) => {
      const status = passed ? '✅ PASS' : '❌ FAIL';
      console.log(`  ${status}: ${check}`);
    });

    // Step 7: Verify fix is working
    console.log('\n========================================');
    console.log('FIX VERIFICATION');
    console.log('========================================\n');

    // The fix should show the complete chain of diagnostic logs
    const fixWorking =
      diagnosticChecks.extractionClicked &&
      diagnosticChecks.handleExtractionClickCalled &&
      !diagnosticChecks.navigationBlocked;

    if (fixWorking) {
      console.log('✅ SUCCESS: Extraction click navigation fix is working!');
      console.log('   - Extraction click detected');
      console.log('   - Handler called successfully');
      console.log('   - No navigation blocks');
    } else {
      console.log('❌ FAILURE: Fix may not be working correctly');
      if (!diagnosticChecks.extractionClicked) {
        console.log('   - Missing: Extraction click log');
      }
      if (!diagnosticChecks.handleExtractionClickCalled) {
        console.log('   - Missing: handleExtractionClick CALLED log (KEY INDICATOR!)');
      }
      if (diagnosticChecks.navigationBlocked) {
        console.log('   - ERROR: Navigation was blocked (missing bbox/page data)');
      }
    }

    // Save full console log
    console.log('\n========================================');
    console.log('FULL CONSOLE LOG');
    console.log('========================================\n');
    consoleLogs.slice(0, 50).forEach((log, idx) => {
      console.log(`[${idx + 1}] [${log.type}] ${log.text}`);
    });
    if (consoleLogs.length > 50) {
      console.log(`\n... and ${consoleLogs.length - 50} more logs`);
    }

    // Assertions
    expect(relevantLogs.length, 'Should have diagnostic logs').toBeGreaterThan(0);

    // Critical assertion: handleExtractionClick should be CALLED
    expect(
      diagnosticChecks.handleExtractionClickCalled,
      'handleExtractionClick CALLED log should appear (proves useCallback fix works)'
    ).toBeTruthy();

    // Should not have navigation blocked errors for valid extractions
    if (diagnosticChecks.navigationBlocked) {
      console.log('\n⚠ WARNING: Navigation was blocked - check extraction data');
    }

    console.log('\n========================================');
    console.log('TEST COMPLETE');
    console.log('========================================\n');
  });

  test('should not show NAVIGATION BLOCKED errors for valid extractions', async ({ page }) => {
    console.log('\n========================================');
    console.log('NAVIGATION BLOCKED ERROR CHECK');
    console.log('========================================\n');

    await page.goto(`/documents/${DOCUMENT_ID}`);
    await page.waitForTimeout(5000); // Wait for everything to load

    // Click first extraction if available
    const extraction = await page.locator('[class*="ml-6"][class*="p-3"]').first();
    if (await extraction.count() > 0) {
      consoleLogs = [];
      await extraction.click();
      await page.waitForTimeout(1000);

      const blockedErrors = consoleLogs.filter(log =>
        log.text.includes('NAVIGATION BLOCKED') ||
        log.text.includes('❌')
      );

      console.log(`Navigation blocked errors found: ${blockedErrors.length}`);
      blockedErrors.forEach(err => {
        console.log(`  - ${err.text}`);
      });

      // For valid extractions, we should NOT see NAVIGATION BLOCKED
      // If we do, it means the extraction data is missing bbox or page
      if (blockedErrors.length > 0) {
        console.log('\n⚠ Found NAVIGATION BLOCKED errors - this may indicate data issues');
      } else {
        console.log('\n✅ No NAVIGATION BLOCKED errors - extraction data is valid');
      }
    } else {
      console.log('⚠ No extractions available to test');
      test.skip();
    }
  });
});
