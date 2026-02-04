/**
 * PDF Highlighting & Navigation Diagnostic Test Script
 *
 * Instructions:
 * 1. Open https://app-react.omegaintelligence.ai/documents/e37f9df8 in Chrome/Firefox
 * 2. Open Browser Console (F12 → Console tab)
 * 3. Paste this entire script and press Enter
 * 4. Click an extraction in the right panel
 * 5. Run: checkHighlightingIssue()
 * 6. Review the diagnostic output
 */

(function() {
  console.log('%c=== PDF Highlighting Diagnostic Test ===', 'color: blue; font-weight: bold; font-size: 16px');
  console.log('Version: 1.0');
  console.log('Loaded at:', new Date().toISOString());

  // State tracking
  const diagnosticState = {
    logs: [],
    clicks: [],
    stateChanges: [],
    renders: [],
    startTime: Date.now()
  };

  // Hook into console.log to capture relevant logs
  const originalLog = console.log;
  console.log = function(...args) {
    // Capture our diagnostic logs
    const firstArg = args[0];
    if (typeof firstArg === 'string') {
      if (firstArg.includes('[ExtractionPanel]') ||
          firstArg.includes('[DocumentDetailPage]') ||
          firstArg.includes('[PDFViewer]')) {
        diagnosticState.logs.push({
          timestamp: Date.now() - diagnosticState.startTime,
          component: firstArg.match(/\[(.*?)\]/)?.[1] || 'unknown',
          message: args,
          fullMessage: args.join(' ')
        });
      }
    }

    // Call original
    originalLog.apply(console, args);
  };

  // Monitor React state changes using DevTools hook (if available)
  if (window.__REACT_DEVTOOLS_GLOBAL_HOOK__) {
    console.log('%c✓ React DevTools detected', 'color: green');

    // Try to hook into fiber updates
    const originalOnCommitFiberRoot = window.__REACT_DEVTOOLS_GLOBAL_HOOK__.onCommitFiberRoot;
    window.__REACT_DEVTOOLS_GLOBAL_HOOK__.onCommitFiberRoot = function(id, root, priorityLevel) {
      try {
        diagnosticState.renders.push({
          timestamp: Date.now() - diagnosticState.startTime,
          rendererId: id,
          priorityLevel
        });
      } catch (e) {
        // Ignore errors
      }

      if (originalOnCommitFiberRoot) {
        return originalOnCommitFiberRoot.apply(this, arguments);
      }
    };
  } else {
    console.log('%c⚠ React DevTools not found - install for better diagnostics', 'color: orange');
  }

  /**
   * Main diagnostic function
   */
  window.checkHighlightingIssue = function() {
    console.log('\n%c=== DIAGNOSTIC RESULTS ===', 'color: blue; font-weight: bold; font-size: 14px');
    console.log('Analysis started at:', new Date().toISOString());

    // Group logs by component
    const logsByComponent = {
      ExtractionPanel: [],
      DocumentDetailPage: [],
      PDFViewer: []
    };

    diagnosticState.logs.forEach(log => {
      if (log.component in logsByComponent) {
        logsByComponent[log.component].push(log);
      }
    });

    // 1. Check ExtractionPanel clicks
    console.log('\n%c1. EXTRACTION PANEL CLICKS', 'color: purple; font-weight: bold');
    const extractionClicks = logsByComponent.ExtractionPanel.filter(log =>
      log.fullMessage.includes('Extraction clicked')
    );

    if (extractionClicks.length === 0) {
      console.log('%c  ❌ No extraction clicks detected', 'color: red');
      console.log('  → Click an extraction in the right panel first');
    } else {
      console.log(`%c  ✓ ${extractionClicks.length} extraction click(s) detected`, 'color: green');
      extractionClicks.forEach((click, idx) => {
        console.log(`  Click ${idx + 1} (${click.timestamp}ms):`, click.message[1]);
      });
    }

    // 2. Check DocumentDetailPage state updates
    console.log('\n%c2. DOCUMENT DETAIL PAGE UPDATES', 'color: purple; font-weight: bold');
    const documentClicks = logsByComponent.DocumentDetailPage.filter(log =>
      log.fullMessage.includes('Extraction clicked')
    );

    if (documentClicks.length === 0) {
      console.log('%c  ❌ DocumentDetailPage never received click event', 'color: red');
      console.log('  → ISSUE: onExtractionClick prop not wired correctly');
    } else {
      console.log(`%c  ✓ ${documentClicks.length} click event(s) received`, 'color: green');
      documentClicks.forEach((click, idx) => {
        console.log(`  Click ${idx + 1} (${click.timestamp}ms):`, click.message[1]);
      });
    }

    // 3. Check PDFViewer scroll events
    console.log('\n%c3. PDF VIEWER SCROLL EVENTS', 'color: purple; font-weight: bold');
    const scrollEvents = logsByComponent.PDFViewer.filter(log =>
      log.fullMessage.includes('Scrolling to page')
    );

    if (scrollEvents.length === 0) {
      console.log('%c  ❌ No scroll events detected', 'color: red');
      console.log('  → ISSUE: scrollToPage state not updating');
    } else {
      console.log(`%c  ✓ ${scrollEvents.length} scroll event(s) detected`, 'color: green');
      scrollEvents.forEach((scroll, idx) => {
        console.log(`  Scroll ${idx + 1} (${scroll.timestamp}ms):`, scroll.fullMessage);
      });
    }

    // 4. Check highlight rendering
    console.log('\n%c4. HIGHLIGHT RENDERING', 'color: purple; font-weight: bold');
    const highlightRenders = logsByComponent.PDFViewer.filter(log =>
      log.fullMessage.includes('Rendering') && log.fullMessage.includes('highlights')
    );

    if (highlightRenders.length === 0) {
      console.log('%c  ❌ No highlight renders detected', 'color: red');
      console.log('  → ISSUE: Highlight re-render effect not triggering');
    } else {
      console.log(`%c  ✓ ${highlightRenders.length} highlight render(s) detected`, 'color: green');
      highlightRenders.forEach((render, idx) => {
        console.log(`  Render ${idx + 1} (${render.timestamp}ms):`, render.fullMessage);
      });
    }

    // 5. Check for specific highlight renders
    const specificHighlightRenders = logsByComponent.PDFViewer.filter(log =>
      log.fullMessage.includes('Highlight rendered:')
    );

    if (specificHighlightRenders.length > 0) {
      console.log('\n%c5. SPECIFIC HIGHLIGHTS RENDERED', 'color: purple; font-weight: bold');
      console.log(`%c  ✓ ${specificHighlightRenders.length} highlight(s) rendered on canvas`, 'color: green');
      specificHighlightRenders.forEach((render, idx) => {
        console.log(`  Highlight ${idx + 1} (${render.timestamp}ms):`, render.message[1]);
      });
    }

    // 6. Issue detection and recommendations
    console.log('\n%c=== ISSUE DETECTION ===', 'color: red; font-weight: bold; font-size: 14px');

    let issuesFound = 0;

    if (extractionClicks.length > 0 && documentClicks.length === 0) {
      issuesFound++;
      console.log(`%c❌ ISSUE #${issuesFound}: Click not propagating to DocumentDetailPage`, 'color: red; font-weight: bold');
      console.log('   Cause: onExtractionClick callback not wired correctly');
      console.log('   Fix: Check ExtractionPanel props in DocumentDetailPage.tsx');
      console.log('   File: DocumentDetailPage.tsx line 363-373');
    }

    if (documentClicks.length > 0 && scrollEvents.length === 0) {
      issuesFound++;
      console.log(`%c❌ ISSUE #${issuesFound}: State update not triggering scroll`, 'color: red; font-weight: bold');
      console.log('   Cause: scrollToPage state not being set in handleExtractionClick');
      console.log('   Fix: Check setScrollToPage(page) in handleExtractionClick');
      console.log('   File: DocumentDetailPage.tsx line 284');
    }

    if (scrollEvents.length > 0 && highlightRenders.length === 0) {
      issuesFound++;
      console.log(`%c❌ ISSUE #${issuesFound}: Scroll happening but highlights not rendering`, 'color: red; font-weight: bold');
      console.log('   Cause: Highlight re-render effect not triggering');
      console.log('   Likely: selectedExtractionIndex not in effect dependencies');
      console.log('   Fix: Add selectedExtractionIndex to effect deps in PDFViewer');
      console.log('   File: PDFViewer.tsx line 767');
    }

    if (highlightRenders.length > 0 && specificHighlightRenders.length === 0) {
      issuesFound++;
      console.log(`%c❌ ISSUE #${issuesFound}: Highlight effect running but no highlights drawn`, 'color: red; font-weight: bold');
      console.log('   Cause: highlights array is empty or filtered out');
      console.log('   Likely: highlights memo not recalculating correctly');
      console.log('   Fix: Check highlights useMemo in DocumentDetailPage');
      console.log('   File: DocumentDetailPage.tsx line 61-110');
    }

    if (specificHighlightRenders.length > 0) {
      console.log('\n%c✓ Highlights ARE being rendered on canvas', 'color: green; font-weight: bold');
      console.log('  If you don\'t SEE them visually:');
      console.log('  → Issue is likely coordinate transformation');
      console.log('  → Check pdfCoordinates.ts transformPDFCoordinates function');
      console.log('  → Verify bbox values are valid (not NaN or negative)');

      // Check the rendered highlight data for issues
      specificHighlightRenders.forEach(render => {
        const data = render.message[1];
        if (data) {
          if (data.transformed) {
            const { x, y, width, height } = data.transformed;
            if (isNaN(x) || isNaN(y) || isNaN(width) || isNaN(height)) {
              issuesFound++;
              console.log(`%c❌ ISSUE: Invalid coordinates detected (NaN)`, 'color: red; font-weight: bold');
              console.log('   Coordinate data:', data.transformed);
            }
            if (x < 0 || y < 0 || width <= 0 || height <= 0) {
              console.log(`%c⚠ WARNING: Unusual coordinates detected`, 'color: orange; font-weight: bold');
              console.log('   This might place highlight off-screen');
              console.log('   Coordinate data:', data.transformed);
            }
          }
        }
      });
    }

    // Check timing
    console.log('\n%c=== TIMING ANALYSIS ===', 'color: blue; font-weight: bold; font-size: 14px');
    if (extractionClicks.length > 0 && scrollEvents.length > 0) {
      const clickTime = extractionClicks[extractionClicks.length - 1].timestamp;
      const scrollTime = scrollEvents[scrollEvents.length - 1].timestamp;
      const delay = scrollTime - clickTime;

      console.log(`  Click to Scroll: ${delay}ms`);
      if (delay > 100) {
        console.log(`%c  ⚠ Delay is high (>${delay}ms)`, 'color: orange');
      } else {
        console.log(`%c  ✓ Delay is acceptable`, 'color: green');
      }
    }

    if (scrollEvents.length > 0 && highlightRenders.length > 0) {
      const scrollTime = scrollEvents[scrollEvents.length - 1].timestamp;
      const renderTime = highlightRenders[highlightRenders.length - 1].timestamp;
      const delay = renderTime - scrollTime;

      console.log(`  Scroll to Render: ${delay}ms`);
      if (delay > 100) {
        console.log(`%c  ⚠ Delay is high (>${delay}ms)`, 'color: orange');
      } else {
        console.log(`%c  ✓ Delay is acceptable`, 'color: green');
      }
    }

    // React render count
    console.log(`\n  Total React Renders: ${diagnosticState.renders.length}`);
    if (diagnosticState.renders.length > 10) {
      console.log(`%c  ⚠ High render count - possible re-render loop`, 'color: orange');
    }

    // Summary
    console.log('\n%c=== SUMMARY ===', 'color: blue; font-weight: bold; font-size: 14px');
    if (issuesFound === 0) {
      console.log('%c✓ No issues detected! Highlighting should be working.', 'color: green; font-weight: bold');
      console.log('  If you still don\'t see highlights:');
      console.log('  1. Check if the PDF is fully loaded');
      console.log('  2. Try zooming in/out');
      console.log('  3. Check browser zoom level (should be 100%)');
      console.log('  4. Try clicking a different extraction');
    } else {
      console.log(`%c❌ ${issuesFound} issue(s) detected`, 'color: red; font-weight: bold');
      console.log('  Scroll up to see detailed issue descriptions and fixes');
    }

    // Next steps
    console.log('\n%c=== NEXT STEPS ===', 'color: blue; font-weight: bold; font-size: 14px');
    console.log('1. Review the issues detected above');
    console.log('2. Check the files mentioned in each issue');
    console.log('3. Apply the recommended fixes');
    console.log('4. Clear logs: clearDiagnosticLogs()');
    console.log('5. Re-test: Click extraction → checkHighlightingIssue()');

    console.log('\n%c=== DIAGNOSTIC COMPLETE ===', 'color: blue; font-weight: bold; font-size: 14px');
  };

  /**
   * Clear diagnostic logs
   */
  window.clearDiagnosticLogs = function() {
    diagnosticState.logs = [];
    diagnosticState.clicks = [];
    diagnosticState.stateChanges = [];
    diagnosticState.renders = [];
    diagnosticState.startTime = Date.now();
    console.log('%c✓ Diagnostic logs cleared', 'color: green');
  };

  /**
   * View raw logs
   */
  window.viewRawLogs = function() {
    console.log('\n%c=== RAW DIAGNOSTIC LOGS ===', 'color: blue; font-weight: bold');
    console.table(diagnosticState.logs);
  };

  /**
   * Export diagnostic data
   */
  window.exportDiagnosticData = function() {
    const data = {
      timestamp: new Date().toISOString(),
      userAgent: navigator.userAgent,
      url: window.location.href,
      logs: diagnosticState.logs,
      renders: diagnosticState.renders
    };

    console.log('\n%c=== DIAGNOSTIC DATA ===', 'color: blue; font-weight: bold');
    console.log(JSON.stringify(data, null, 2));

    // Copy to clipboard if available
    if (navigator.clipboard) {
      navigator.clipboard.writeText(JSON.stringify(data, null, 2));
      console.log('%c✓ Data copied to clipboard', 'color: green');
    }

    return data;
  };

  // Instructions
  console.log('\n%c=== INSTRUCTIONS ===', 'color: green; font-weight: bold; font-size: 14px');
  console.log('1. Click an extraction in the right panel');
  console.log('2. Wait 2 seconds');
  console.log('3. Run: %ccheckHighlightingIssue()', 'color: blue; font-weight: bold');
  console.log('4. Review the diagnostic output');
  console.log('\nOther commands:');
  console.log('  %cclearDiagnosticLogs()%c  - Clear logs and start fresh', 'color: blue; font-weight: bold', 'color: black');
  console.log('  %cviewRawLogs()%c         - View all logs in table format', 'color: blue; font-weight: bold', 'color: black');
  console.log('  %cexportDiagnosticData()%c - Export data as JSON', 'color: blue; font-weight: bold', 'color: black');

  console.log('\n%c✓ Diagnostic script loaded successfully', 'color: green; font-weight: bold');
})();
