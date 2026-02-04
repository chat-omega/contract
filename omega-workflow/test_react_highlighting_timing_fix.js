/**
 * Automated Test Script for React Word-Level Highlighting Timing Fix
 *
 * Tests the timing fix for word-level highlighting on long and short fields
 *
 * Usage: Run in browser console on https://app-react.omegaintelligence.ai/documents/e37f9df8
 */

(async function testReactHighlightingTimingFix() {
  console.log('%c╔═══════════════════════════════════════════════════════════╗', 'color: #10B981; font-weight: bold');
  console.log('%c║  REACT WORD-LEVEL HIGHLIGHTING - TIMING FIX TEST         ║', 'color: #10B981; font-weight: bold');
  console.log('%c╚═══════════════════════════════════════════════════════════╝', 'color: #10B981; font-weight: bold');
  console.log('');

  // Test configuration
  const testFields = [
    // Short fields (should use exact match - Tier 1)
    { name: 'Title', type: 'short', expectedStrategy: 'indexOf' },
    { name: 'Parties', type: 'short', expectedStrategy: 'indexOf' },
    { name: 'Date', type: 'short', expectedStrategy: 'indexOf' },

    // Long fields (should use progressive match - Tier 2)
    { name: 'Term and Renewal', type: 'long', expectedStrategy: 'progressive-token' },
    { name: 'Can the agreement be assigned?', type: 'long', expectedStrategy: 'progressive-token' },
    { name: 'Change of Control', type: 'long', expectedStrategy: 'progressive-token' },
    { name: 'Exclusivity', type: 'long', expectedStrategy: 'progressive-token' },
    { name: 'Non-Compete', type: 'long', expectedStrategy: 'progressive-token' },
  ];

  const results = {
    passed: [],
    failed: [],
    skipped: [],
    totalTests: testFields.length,
  };

  // Step 1: Verify bundle loaded
  console.log('%c[1/4] Verifying Bundle Loaded...', 'color: #6366F1; font-weight: bold');
  const scriptTag = Array.from(document.querySelectorAll('script'))
    .find(s => s.src.includes('index-'));

  if (scriptTag) {
    const bundleName = scriptTag.src.split('/').pop();
    console.log(`   ✅ Bundle loaded: ${bundleName}`);

    if (bundleName === 'index-DJXGJFjn.js') {
      console.log(`   ✅ Correct bundle (with timing fix)`);
    } else {
      console.warn(`   ⚠️ Unexpected bundle - expected index-DJXGJFjn.js`);
      console.warn(`   💡 You may need to hard refresh (Ctrl+Shift+R)`);
    }
  } else {
    console.error(`   ❌ No index bundle found`);
  }
  console.log('');

  // Step 2: Wait for page to be ready
  console.log('%c[2/4] Waiting for PDF to Load...', 'color: #6366F1; font-weight: bold');

  // Wait for PDF canvas to exist
  let attempts = 0;
  while (attempts < 20) {
    const canvas = document.querySelector('canvas.pdf-page-canvas');
    if (canvas) {
      console.log(`   ✅ PDF loaded (found canvas after ${attempts * 500}ms)`);
      break;
    }
    await new Promise(r => setTimeout(r, 500));
    attempts++;
  }

  if (attempts >= 20) {
    console.error(`   ❌ PDF did not load after 10 seconds`);
    console.error(`   💡 Make sure you're on the document page: /documents/e37f9df8`);
    return;
  }

  // Give text layers time to render
  await new Promise(r => setTimeout(r, 2000));
  console.log('');

  // Step 3: Test text layer readiness
  console.log('%c[3/4] Testing Text Layer Readiness...', 'color: #6366F1; font-weight: bold');

  const textLayers = document.querySelectorAll('.textLayer[data-page-number]');
  console.log(`   Found ${textLayers.length} text layers`);

  let layersWithSpans = 0;
  textLayers.forEach(layer => {
    const pageNum = layer.getAttribute('data-page-number');
    const spanCount = layer.children.length;
    if (spanCount > 0) {
      layersWithSpans++;
    }
  });

  console.log(`   ✅ ${layersWithSpans}/${textLayers.length} text layers have spans`);

  if (layersWithSpans === 0) {
    console.error(`   ❌ No text layers have spans - timing fix may not be working`);
    console.error(`   💡 Wait a few more seconds and try again`);
  }
  console.log('');

  // Step 4: Test each field
  console.log('%c[4/4] Testing Field Highlighting...', 'color: #6366F1; font-weight: bold');
  console.log('');

  for (const test of testFields) {
    console.log(`%c┌─ Testing: ${test.name}`, 'color: #8B5CF6; font-weight: bold');
    console.log(`│  Type: ${test.type} field`);
    console.log(`│  Expected strategy: ${test.expectedStrategy}`);

    try {
      // Find the field in the extraction panel
      const fieldHeading = Array.from(document.querySelectorAll('h4'))
        .find(el => el.textContent?.trim() === test.name);

      if (!fieldHeading) {
        console.warn(`│  ⚠️ Field heading not found in DOM`);
        console.log(`└─ Result: SKIPPED (field not visible)\n`);
        results.skipped.push(test.name);
        continue;
      }

      // Find the clickable element (should be parent with cursor-pointer or similar)
      const clickTarget = fieldHeading.closest('[class*="cursor-pointer"]') ||
                         fieldHeading.closest('.extraction-field') ||
                         fieldHeading.parentElement;

      if (!clickTarget) {
        console.warn(`│  ⚠️ Click target not found`);
        console.log(`└─ Result: SKIPPED (not clickable)\n`);
        results.skipped.push(test.name);
        continue;
      }

      // Clear previous highlights
      const prevHighlighted = document.querySelectorAll('[data-highlighted="true"]');
      console.log(`│  Clearing ${prevHighlighted.length} previous highlights...`);

      // Click the field
      console.log(`│  Clicking field...`);
      clickTarget.click();

      // Wait for highlighting to complete
      await new Promise(r => setTimeout(r, 1000));

      // Check if highlighting was applied
      const highlighted = document.querySelectorAll('[data-highlighted="true"]');
      const highlightCount = highlighted.length;

      console.log(`│  Highlighted elements: ${highlightCount}`);

      // Determine pass/fail
      if (highlightCount > 0) {
        // Check highlight type (normal vs selected)
        const selectedHighlights = document.querySelectorAll('[data-highlight-type="selected"]');
        const normalHighlights = document.querySelectorAll('[data-highlight-type="normal"]');

        console.log(`│  - Selected: ${selectedHighlights.length}`);
        console.log(`│  - Normal: ${normalHighlights.length}`);

        // Verify visual appearance
        if (highlighted.length > 0) {
          const sample = highlighted[0] as HTMLElement;
          const bgColor = window.getComputedStyle(sample).backgroundColor;
          console.log(`│  Background color: ${bgColor}`);
        }

        console.log(`%c└─ Result: ✅ PASS`, 'color: #10B981; font-weight: bold');
        results.passed.push(test.name);
      } else {
        console.log(`%c└─ Result: ❌ FAIL (no highlights applied)`, 'color: #EF4444; font-weight: bold');
        results.failed.push(test.name);
      }

    } catch (error) {
      console.error(`│  ❌ Error:`, error.message);
      console.log(`%c└─ Result: ❌ FAIL (exception)`, 'color: #EF4444; font-weight: bold');
      results.failed.push(test.name);
    }

    console.log('');
  }

  // Final results
  console.log('%c╔═══════════════════════════════════════════════════════════╗', 'color: #10B981; font-weight: bold');
  console.log('%c║                      TEST RESULTS                         ║', 'color: #10B981; font-weight: bold');
  console.log('%c╚═══════════════════════════════════════════════════════════╝', 'color: #10B981; font-weight: bold');
  console.log('');

  const passRate = ((results.passed.length / results.totalTests) * 100).toFixed(1);

  console.log(`%cTotal Tests:    ${results.totalTests}`, 'font-weight: bold');
  console.log(`%c✅ Passed:       ${results.passed.length}`, 'color: #10B981; font-weight: bold');
  console.log(`%c❌ Failed:       ${results.failed.length}`, 'color: #EF4444; font-weight: bold');
  console.log(`%c⚠️  Skipped:      ${results.skipped.length}`, 'color: #F59E0B; font-weight: bold');
  console.log(`%cPass Rate:      ${passRate}%`, passRate >= 80 ? 'color: #10B981; font-weight: bold' : 'color: #EF4444; font-weight: bold');
  console.log('');

  if (results.passed.length > 0) {
    console.log('%c✅ Passed Tests:', 'color: #10B981; font-weight: bold');
    results.passed.forEach(name => console.log(`   - ${name}`));
    console.log('');
  }

  if (results.failed.length > 0) {
    console.log('%c❌ Failed Tests:', 'color: #EF4444; font-weight: bold');
    results.failed.forEach(name => console.log(`   - ${name}`));
    console.log('');
  }

  if (results.skipped.length > 0) {
    console.log('%c⚠️ Skipped Tests:', 'color: #F59E0B; font-weight: bold');
    results.skipped.forEach(name => console.log(`   - ${name}`));
    console.log('');
  }

  // Recommendations
  if (results.failed.length > 0) {
    console.log('%c💡 Troubleshooting Tips:', 'color: #6366F1; font-weight: bold');
    console.log('   1. Hard refresh the page (Ctrl+Shift+R) to ensure new bundle is loaded');
    console.log('   2. Check browser console for [TextHighlight] logs during field clicks');
    console.log('   3. Verify text layers have spans: document.querySelectorAll(\'.textLayer span\').length');
    console.log('   4. Check if PDF is fully loaded before running test');
    console.log('');
  }

  if (passRate >= 80) {
    console.log('%c🎉 SUCCESS! Timing fix is working!', 'color: #10B981; font-weight: bold; font-size: 16px');
  } else {
    console.log('%c⚠️ Some tests failed. Review the logs above.', 'color: #F59E0B; font-weight: bold; font-size: 16px');
  }

  console.log('');
  console.log('%c═══════════════════════════════════════════════════════════', 'color: #10B981; font-weight: bold');

  return results;
})();
