/**
 * MANUAL PDF EXTRACTION NAVIGATION TEST SCRIPT
 *
 * HOW TO USE:
 * 1. Open https://app-react.omegaintelligence.ai in your browser
 * 2. Login with admin / admin123
 * 3. Navigate to: https://app-react.omegaintelligence.ai/documents/e37f9df8
 * 4. Open browser DevTools (F12) and go to the Console tab
 * 5. Copy and paste this entire script into the console
 * 6. Press Enter to run it
 * 7. The script will automatically test clicking extractions and log results
 */

(async function runPDFExtractionTest() {
  console.log('%c========================================', 'color: #4F46E5; font-weight: bold');
  console.log('%cPDF EXTRACTION NAVIGATION TEST', 'color: #4F46E5; font-weight: bold; font-size: 16px');
  console.log('%c========================================', 'color: #4F46E5; font-weight: bold');
  console.log('');

  // Test configuration
  const testConfig = {
    clickDelay: 1500, // ms between clicks
    rapidClickDelay: 300, // ms for rapid clicking
    rapidClickCount: 5,
  };

  // Results tracking
  const results = {
    startTime: Date.now(),
    consoleLogs: [],
    renderingErrors: [],
    pdfLoaded: false,
    extractionsFound: 0,
    clickTests: [],
  };

  // Capture console messages
  const originalConsoleLog = console.log;
  const originalConsoleError = console.error;
  const originalConsoleWarn = console.warn;

  const captureLog = (type, args) => {
    const message = Array.from(args).map(arg =>
      typeof arg === 'object' ? JSON.stringify(arg) : String(arg)
    ).join(' ');

    results.consoleLogs.push({
      type,
      message,
      timestamp: Date.now() - results.startTime,
    });

    if (message.includes('RenderingCancelledException')) {
      results.renderingErrors.push({
        type,
        message,
        timestamp: Date.now() - results.startTime,
      });
    }

    if (message.includes('PDF loaded successfully')) {
      results.pdfLoaded = true;
    }
  };

  console.log = function(...args) {
    captureLog('log', args);
    originalConsoleLog.apply(console, args);
  };

  console.error = function(...args) {
    captureLog('error', args);
    originalConsoleError.apply(console, args);
  };

  console.warn = function(...args) {
    captureLog('warn', args);
    originalConsoleWarn.apply(console, args);
  };

  console.log('%c✓ Console capture enabled', 'color: #10B981');
  console.log('');

  // Helper function to wait
  const wait = (ms) => new Promise(resolve => setTimeout(resolve, ms));

  // Step 1: Check if PDF viewer is present
  console.log('%cStep 1: Checking for PDF viewer...', 'color: #6366F1; font-weight: bold');
  const pdfViewer = document.querySelector('.pdf-viewer-container');

  if (!pdfViewer) {
    console.error('%c❌ PDF viewer container not found!', 'color: #EF4444; font-weight: bold');
    console.log('Please ensure you are on the document detail page');
    return;
  }

  console.log('%c✓ PDF viewer container found', 'color: #10B981');
  console.log('');

  // Step 2: Find clickable extractions
  console.log('%cStep 2: Finding clickable extractions...', 'color: #6366F1; font-weight: bold');
  const extractionItems = document.querySelectorAll('div.cursor-pointer:has-text("Click to view"), div.cursor-pointer');
  const clickableExtractions = Array.from(extractionItems).filter(el =>
    el.textContent.includes('Click to view')
  );

  results.extractionsFound = clickableExtractions.length;
  console.log(`%c✓ Found ${clickableExtractions.length} clickable extractions`, 'color: #10B981');
  console.log('');

  if (clickableExtractions.length === 0) {
    console.warn('%c⚠ No clickable extractions found', 'color: #F59E0B; font-weight: bold');
    console.log('Test cannot proceed without extractions');
    return;
  }

  // Step 3: Test individual clicks
  console.log('%cStep 3: Testing individual extraction clicks...', 'color: #6366F1; font-weight: bold');

  const initialErrorCount = results.renderingErrors.length;

  // Test Click 1
  if (clickableExtractions.length > 0) {
    console.log('  Testing extraction #1...');
    const before1 = results.renderingErrors.length;
    clickableExtractions[0].click();
    await wait(testConfig.clickDelay);
    const after1 = results.renderingErrors.length;
    const errors1 = after1 - before1;

    results.clickTests.push({
      test: 'Click extraction #1',
      newErrors: errors1,
      pass: errors1 <= 2,
    });

    console.log(`  %c✓ Clicked extraction #1 - New errors: ${errors1}`,
      errors1 <= 2 ? 'color: #10B981' : 'color: #EF4444');
  }

  // Test Click 2
  if (clickableExtractions.length > 1) {
    console.log('  Testing extraction #2...');
    const before2 = results.renderingErrors.length;
    clickableExtractions[1].click();
    await wait(testConfig.clickDelay);
    const after2 = results.renderingErrors.length;
    const errors2 = after2 - before2;

    results.clickTests.push({
      test: 'Click extraction #2',
      newErrors: errors2,
      pass: errors2 <= 2,
    });

    console.log(`  %c✓ Clicked extraction #2 - New errors: ${errors2}`,
      errors2 <= 2 ? 'color: #10B981' : 'color: #EF4444');
  }

  // Test Click #15 (if available)
  if (clickableExtractions.length >= 15) {
    console.log('  Testing extraction #15...');
    const before15 = results.renderingErrors.length;
    clickableExtractions[14].click();
    await wait(testConfig.clickDelay);
    const after15 = results.renderingErrors.length;
    const errors15 = after15 - before15;

    results.clickTests.push({
      test: 'Click extraction #15',
      newErrors: errors15,
      pass: errors15 <= 2,
    });

    console.log(`  %c✓ Clicked extraction #15 - New errors: ${errors15}`,
      errors15 <= 2 ? 'color: #10B981' : 'color: #EF4444');
  }

  console.log('');

  // Step 4: Rapid clicking test
  console.log('%cStep 4: Testing rapid clicking...', 'color: #6366F1; font-weight: bold');
  const beforeRapid = results.renderingErrors.length;
  const rapidCount = Math.min(testConfig.rapidClickCount, clickableExtractions.length);

  for (let i = 0; i < rapidCount; i++) {
    clickableExtractions[i].click();
    await wait(testConfig.rapidClickDelay);
  }

  await wait(2000); // Wait for all operations to settle

  const afterRapid = results.renderingErrors.length;
  const errorsRapid = afterRapid - beforeRapid;

  results.clickTests.push({
    test: `Rapid clicking (${rapidCount} clicks)`,
    newErrors: errorsRapid,
    pass: errorsRapid <= 5,
  });

  console.log(`%c✓ Rapid clicking complete - New errors: ${errorsRapid}`,
    errorsRapid <= 5 ? 'color: #10B981' : 'color: #EF4444');
  console.log('');

  // Final Analysis
  console.log('%c========================================', 'color: #4F46E5; font-weight: bold');
  console.log('%cFINAL TEST RESULTS', 'color: #4F46E5; font-weight: bold; font-size: 16px');
  console.log('%c========================================', 'color: #4F46E5; font-weight: bold');
  console.log('');

  const totalErrors = results.renderingErrors.length;
  const pdfLoadedLogs = results.consoleLogs.filter(log => log.message.includes('PDF loaded successfully'));
  const scrollLogs = results.consoleLogs.filter(log => log.message.includes('Scrolling to page'));
  const highlightLogs = results.consoleLogs.filter(log =>
    log.message.includes('Re-rendering highlights') || log.message.includes('Rendering highlight')
  );

  console.log('%cTest Summary:', 'font-weight: bold');
  console.log(`  Total console messages: ${results.consoleLogs.length}`);
  console.log(`  PDF loaded messages: ${pdfLoadedLogs.length}`);
  console.log(`  Scroll messages: ${scrollLogs.length}`);
  console.log(`  Highlight messages: ${highlightLogs.length}`);
  console.log(`  Extractions found: ${results.extractionsFound}`);
  console.log(`  Click tests performed: ${results.clickTests.length}`);
  console.log('');

  console.log('%cRenderingCancelledException Analysis:', 'font-weight: bold');
  console.log(`  Total errors: ${totalErrors}`);

  if (totalErrors === 0) {
    console.log(`  %c✅ PERFECT: Zero RenderingCancelledException errors!`, 'color: #10B981; font-weight: bold; font-size: 14px');
  } else if (totalErrors <= 2) {
    console.log(`  %c✅ PASS: Acceptable error count (≤2)`, 'color: #10B981; font-weight: bold; font-size: 14px');
  } else if (totalErrors <= 5) {
    console.log(`  %c⚠️ WARNING: Elevated error count (3-5)`, 'color: #F59E0B; font-weight: bold; font-size: 14px');
  } else {
    console.log(`  %c❌ FAIL: Too many errors (>5)`, 'color: #EF4444; font-weight: bold; font-size: 14px');
  }

  console.log('');

  // Show error details if any
  if (totalErrors > 0) {
    console.log('%cError Details:', 'font-weight: bold; color: #EF4444');
    results.renderingErrors.forEach((error, idx) => {
      console.log(`  ${idx + 1}. [${error.timestamp}ms] ${error.message.substring(0, 100)}`);
    });
    console.log('');
  }

  // Click test results
  console.log('%cClick Test Results:', 'font-weight: bold');
  results.clickTests.forEach(test => {
    const icon = test.pass ? '✅' : '❌';
    const color = test.pass ? '#10B981' : '#EF4444';
    console.log(`  %c${icon} ${test.test}: ${test.newErrors} errors`, `color: ${color}`);
  });
  console.log('');

  // Verdict
  const allTestsPassed = results.clickTests.every(t => t.pass);
  const verdict = totalErrors === 0 ? 'PERFECT' :
                  totalErrors <= 2 ? 'PASS' :
                  totalErrors <= 5 ? 'WARNING' : 'FAIL';

  console.log('%c========================================', 'color: #4F46E5; font-weight: bold');
  console.log(`%cVERDICT: ${verdict}`, `color: ${
    verdict === 'PERFECT' || verdict === 'PASS' ? '#10B981' :
    verdict === 'WARNING' ? '#F59E0B' : '#EF4444'
  }; font-weight: bold; font-size: 18px`);
  console.log('%c========================================', 'color: #4F46E5; font-weight: bold');
  console.log('');

  // Restore console
  console.log = originalConsoleLog;
  console.error = originalConsoleError;
  console.warn = originalConsoleWarn;

  // Return results object for further analysis
  window.testResults = results;
  console.log('%cℹ️ Full results saved to window.testResults', 'color: #6366F1');
  console.log('You can access detailed logs with: testResults.consoleLogs');
  console.log('You can access errors with: testResults.renderingErrors');

  return results;
})();
