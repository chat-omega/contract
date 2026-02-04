// ============================================================================
// CLICK HANDLER DIAGNOSTIC SCRIPT
// ============================================================================
// Run this in browser console (F12) to diagnose click-to-view issues
// Copy/paste entire script and press Enter
// ============================================================================

console.log('%c🔍 CLICK HANDLER DIAGNOSTIC STARTING...', 'color: blue; font-size: 16px; font-weight: bold');

const results = {
  timestamp: new Date().toISOString(),
  checks: []
};

function check(name, test, details = {}) {
  const result = { name, passed: test, details };
  results.checks.push(result);
  const emoji = test ? '✅' : '❌';
  console.log(`${emoji} ${name}`, details);
  return test;
}

// ============================================================================
// 1. Check which JavaScript bundle is loaded
// ============================================================================
console.log('\n%c1️⃣ BUNDLE VERIFICATION', 'color: orange; font-size: 14px; font-weight: bold');

const scripts = Array.from(document.querySelectorAll('script[src]'));
const indexScript = scripts.find(s => s.src.includes('/assets/index-'));
const bundleName = indexScript ? indexScript.src.split('/').pop() : 'NOT_FOUND';
const expectedBundle = 'index-8ejwB37-.js';
const correctBundle = bundleName === expectedBundle;

check('Correct bundle loaded', correctBundle, {
  loaded: bundleName,
  expected: expectedBundle,
  allScripts: scripts.map(s => s.src.split('/').pop())
});

// ============================================================================
// 2. Check if React app is mounted
// ============================================================================
console.log('\n%c2️⃣ REACT APP STATUS', 'color: orange; font-size: 14px; font-weight: bold');

const rootElement = document.getElementById('root');
const hasReactApp = rootElement && rootElement.innerHTML.length > 0;
check('React app mounted', hasReactApp, {
  hasRoot: !!rootElement,
  rootHasContent: rootElement ? rootElement.innerHTML.length : 0
});

// ============================================================================
// 3. Check if ExtractionPanel is in DOM
// ============================================================================
console.log('\n%c3️⃣ EXTRACTION PANEL CHECK', 'color: orange; font-size: 14px; font-weight: bold');

const extractionPanels = document.querySelectorAll('[class*="extraction"]');
const hasExtractionPanels = extractionPanels.length > 0;
check('Extraction panels found', hasExtractionPanels, {
  count: extractionPanels.length
});

// ============================================================================
// 4. Check if "Click to view" text exists
// ============================================================================
console.log('\n%c4️⃣ CLICK TO VIEW TEXT', 'color: orange; font-size: 14px; font-weight: bold');

const allText = document.body.innerText;
const hasClickToView = allText.includes('Click to view');
check('Click to view text found', hasClickToView, {
  found: hasClickToView,
  sample: hasClickToView ? 'Text exists in DOM' : 'NOT FOUND'
});

// ============================================================================
// 5. Check for extraction divs with data
// ============================================================================
console.log('\n%c5️⃣ EXTRACTION DIVS', 'color: orange; font-size: 14px; font-weight: bold');

// Look for divs that might be extraction items
const potentialExtractionDivs = Array.from(document.querySelectorAll('div')).filter(div => {
  const text = div.innerText.toLowerCase();
  return text.includes('page:') || text.includes('confidence:') || text.includes('click to view');
});

check('Extraction divs found', potentialExtractionDivs.length > 0, {
  count: potentialExtractionDivs.length,
  samples: potentialExtractionDivs.slice(0, 3).map(div => ({
    className: div.className,
    text: div.innerText.substring(0, 100)
  }))
});

// ============================================================================
// 6. Check if React event handlers are attached
// ============================================================================
console.log('\n%c6️⃣ REACT EVENT HANDLERS', 'color: orange; font-size: 14px; font-weight: bold');

// React attaches event listeners to elements with special properties
const elementsWithReactProps = Array.from(document.querySelectorAll('*')).filter(el => {
  return Object.keys(el).some(key => key.startsWith('__react'));
});

check('React props on elements', elementsWithReactProps.length > 0, {
  count: elementsWithReactProps.length,
  reactVersion: elementsWithReactProps[0] ? Object.keys(elementsWithReactProps[0]).find(k => k.includes('react')) : 'unknown'
});

// ============================================================================
// 7. Test console log monitoring
// ============================================================================
console.log('\n%c7️⃣ CONSOLE LOG MONITORING', 'color: orange; font-size: 14px; font-weight: bold');

// Store original console.log
const originalLog = console.log;
const capturedLogs = [];

// Intercept console.log
console.log = function(...args) {
  const message = args.join(' ');
  if (message.includes('[ExtractionPanel]') || message.includes('[DocumentDetailPage]') || message.includes('[PDFViewer]')) {
    capturedLogs.push({ timestamp: Date.now(), message });
  }
  originalLog.apply(console, args);
};

console.log('%c📡 Console monitoring active - click an extraction now and wait 3 seconds...', 'color: green');

setTimeout(() => {
  // Restore original console.log
  console.log = originalLog;

  check('Click handler logs captured', capturedLogs.length > 0, {
    logsFound: capturedLogs.length,
    logs: capturedLogs
  });

  if (capturedLogs.length === 0) {
    console.log('%c⚠️ NO CLICK HANDLER LOGS DETECTED', 'color: red; font-size: 14px; font-weight: bold');
    console.log('%cThis confirms the click handler is not firing.');
    console.log('%c→ Most likely: Browser is loading old cached bundle');
    console.log('%c→ Solution: Hard refresh (Ctrl+Shift+R or Cmd+Shift+R)');
  }

  // ============================================================================
  // 8. Final Summary
  // ============================================================================
  console.log('\n%c📊 DIAGNOSTIC SUMMARY', 'color: blue; font-size: 16px; font-weight: bold');
  console.log('─'.repeat(80));

  const passed = results.checks.filter(c => c.passed).length;
  const total = results.checks.length;

  console.log(`%cPassed: ${passed}/${total} checks`, passed === total ? 'color: green' : 'color: orange');
  console.log('');

  // Diagnose likely issue
  if (!correctBundle) {
    console.log('%c🎯 DIAGNOSIS: OLD BUNDLE LOADED', 'color: red; font-size: 14px; font-weight: bold');
    console.log(`   Expected: ${expectedBundle}`);
    console.log(`   Got: ${bundleName}`);
    console.log('   Solution: Hard refresh (Ctrl+Shift+R)');
  } else if (!hasClickToView) {
    console.log('%c🎯 DIAGNOSIS: EXTRACTIONS NOT EXPANDED', 'color: orange; font-size: 14px; font-weight: bold');
    console.log('   Solution: Click on field names to expand and see extractions');
  } else if (capturedLogs.length === 0) {
    console.log('%c🎯 DIAGNOSIS: CLICK HANDLERS NOT FIRING', 'color: red; font-size: 14px; font-weight: bold');
    console.log('   Possible causes:');
    console.log('   1. Browser cache (try hard refresh)');
    console.log('   2. Service worker cache (check Application tab)');
    console.log('   3. CDN cache (wait or clear CDN cache)');
  } else {
    console.log('%c🎯 DIAGNOSIS: CLICK HANDLERS WORKING!', 'color: green; font-size: 14px; font-weight: bold');
    console.log('   Check console for navigation logs when clicking extractions');
  }

  console.log('');
  console.log('%c📋 Full Results:', 'color: blue; font-weight: bold');
  console.table(results.checks);

  console.log('\n%c✨ Diagnostic complete', 'color: blue; font-size: 14px; font-weight: bold');

}, 3000);

console.log('%c⏳ Waiting 3 seconds for user to click an extraction...', 'color: blue');
