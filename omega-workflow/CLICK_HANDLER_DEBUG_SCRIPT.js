/**
 * CLICK HANDLER DIAGNOSTIC SCRIPT
 *
 * INSTRUCTIONS:
 * 1. Open browser DevTools (F12)
 * 2. Go to Console tab
 * 3. Copy and paste this ENTIRE script
 * 4. Press Enter to run
 * 5. Review the output
 * 6. Share the results with the development team
 */

(function() {
    console.clear();
    console.log('%c🔍 CLICK HANDLER DIAGNOSTIC STARTING...', 'font-size: 20px; color: #4ec9b0; font-weight: bold;');
    console.log('');

    const results = {
        pass: [],
        fail: [],
        warning: [],
        info: []
    };

    function test(name, status, message, details = null) {
        results[status].push({ name, message, details });

        const icons = { pass: '✓', fail: '✗', warning: '⚠', info: 'ℹ' };
        const colors = { pass: '#2ea043', fail: '#f85149', warning: '#f0ad4e', info: '#58a6ff' };

        console.log(`%c${icons[status]} ${name}`, `color: ${colors[status]}; font-weight: bold;`);
        console.log(`  ${message}`);
        if (details) {
            console.log(`  Details:`, details);
        }
        console.log('');
    }

    // Test 1: React loaded
    test(
        'Test 1: React App Loaded',
        window.__REACT_DEVTOOLS_GLOBAL_HOOK__ ? 'pass' : 'fail',
        window.__REACT_DEVTOOLS_GLOBAL_HOOK__
            ? 'React DevTools hook detected ✓'
            : 'React DevTools hook NOT found - React may not be loaded'
    );

    // Test 2: Check loaded bundle
    const scripts = Array.from(document.querySelectorAll('script[src*="index-"]'));
    const bundleInfo = scripts.map(s => {
        const match = s.src.match(/index-([^-]+)-\.js/);
        return { src: s.src, hash: match ? match[1] : 'unknown' };
    });

    test(
        'Test 2: JavaScript Bundle Loaded',
        bundleInfo.length > 0 && bundleInfo[0].hash === '8ejwB37' ? 'pass' :
        bundleInfo.length > 0 ? 'warning' : 'fail',
        bundleInfo.length > 0
            ? `Loaded bundle hash: "${bundleInfo[0].hash}" (expected: "8ejwB37")`
            : 'No index-*.js bundle found!',
        bundleInfo
    );

    // Test 3: ExtractionPanel in DOM
    const extractionPanels = document.querySelectorAll('[class*="w-96"][class*="bg-white"][class*="border-l"]');
    test(
        'Test 3: ExtractionPanel in DOM',
        extractionPanels.length > 0 ? 'pass' : 'fail',
        extractionPanels.length > 0
            ? `Found ${extractionPanels.length} ExtractionPanel container(s)`
            : 'ExtractionPanel container NOT found',
        extractionPanels.length > 0 ? { count: extractionPanels.length } : null
    );

    // Test 4: "Click to view" text
    const clickToViewElements = Array.from(document.querySelectorAll('*')).filter(el =>
        el.textContent.includes('Click to view')
    );
    test(
        'Test 4: "Click to view" Text',
        clickToViewElements.length > 0 ? 'pass' : 'fail',
        clickToViewElements.length > 0
            ? `Found ${clickToViewElements.length} "Click to view" text element(s)`
            : '"Click to view" text NOT found in DOM',
        clickToViewElements.length > 0 ? {
            count: clickToViewElements.length,
            tags: clickToViewElements.map(el => el.tagName),
            sample: clickToViewElements[0].parentElement?.className
        } : null
    );

    // Test 5: Extraction div containers
    const extractionDivs = Array.from(document.querySelectorAll('div')).filter(div => {
        const classes = div.className;
        return classes.includes('ml-6') &&
               classes.includes('p-3') &&
               classes.includes('rounded') &&
               classes.includes('border');
    });

    test(
        'Test 5: Extraction Item Divs',
        extractionDivs.length > 0 ? 'pass' : 'fail',
        extractionDivs.length > 0
            ? `Found ${extractionDivs.length} extraction div(s)`
            : 'No extraction divs found',
        extractionDivs.length > 0 ? {
            count: extractionDivs.length,
            firstDiv: {
                hasOnclick: !!extractionDivs[0].onclick,
                cursor: getComputedStyle(extractionDivs[0]).cursor,
                pointerEvents: getComputedStyle(extractionDivs[0]).pointerEvents,
                text: extractionDivs[0].textContent.substring(0, 50)
            }
        } : null
    );

    // Test 6: MapPin icons (navigable extractions)
    const mapPinIcons = document.querySelectorAll('svg[class*="h-4"][class*="w-4"]');
    test(
        'Test 6: MapPin Icons',
        mapPinIcons.length > 0 ? 'pass' : 'warning',
        mapPinIcons.length > 0
            ? `Found ${mapPinIcons.length} icon(s) (extractions may be navigable)`
            : 'No icons found - extractions may not have bbox/page data',
        { iconCount: mapPinIcons.length }
    );

    // Test 7: React event handlers
    const divWithReactHandlers = extractionDivs.find(div => {
        const keys = Object.keys(div);
        return keys.some(key => key.startsWith('__react'));
    });

    test(
        'Test 7: React Event Handlers',
        divWithReactHandlers ? 'pass' : 'fail',
        divWithReactHandlers
            ? 'React internal properties found on extraction divs'
            : 'No React properties found - handlers may not be attached',
        divWithReactHandlers ? {
            reactKeys: Object.keys(divWithReactHandlers).filter(k => k.startsWith('__react'))
        } : null
    );

    // Test 8: Check recent console logs
    const allLogs = [];
    const originalLog = console.log;
    const originalWarn = console.warn;
    const originalError = console.error;

    // Intercept console after this point
    console.log = function(...args) {
        allLogs.push({ type: 'log', message: args.join(' ') });
        originalLog.apply(console, args);
    };
    console.warn = function(...args) {
        allLogs.push({ type: 'warn', message: args.join(' ') });
        originalWarn.apply(console, args);
    };
    console.error = function(...args) {
        allLogs.push({ type: 'error', message: args.join(' ') });
        originalError.apply(console, args);
    };

    test(
        'Test 8: Console Log Monitoring',
        'info',
        'Console logging intercepted. Click an extraction to see if logs appear.',
        { note: 'This will capture logs from now on. Try clicking an extraction!' }
    );

    // Test 9: Check for expanded fields
    const chevronDownIcons = document.querySelectorAll('[class*="ChevronDown"]');
    test(
        'Test 9: Expanded Fields',
        chevronDownIcons.length > 0 ? 'pass' : 'warning',
        chevronDownIcons.length > 0
            ? `Found ${chevronDownIcons.length} expanded field(s)`
            : 'No expanded fields found - expand a field to see extractions',
        { expandedCount: chevronDownIcons.length }
    );

    // Summary
    console.log('%c━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━', 'color: #666;');
    console.log('%c📊 DIAGNOSTIC SUMMARY', 'font-size: 16px; color: #4ec9b0; font-weight: bold;');
    console.log('');
    console.log(`%c✓ Passed: ${results.pass.length}`, 'color: #2ea043; font-weight: bold;');
    console.log(`%c✗ Failed: ${results.fail.length}`, 'color: #f85149; font-weight: bold;');
    console.log(`%c⚠ Warnings: ${results.warning.length}`, 'color: #f0ad4e; font-weight: bold;');
    console.log(`%cℹ Info: ${results.info.length}`, 'color: #58a6ff; font-weight: bold;');
    console.log('');

    // Specific recommendations
    console.log('%c📋 RECOMMENDATIONS:', 'font-size: 14px; color: #569cd6; font-weight: bold;');
    console.log('');

    if (results.fail.some(r => r.name.includes('Bundle'))) {
        console.log('%c1. WRONG BUNDLE LOADED:', 'color: #f85149; font-weight: bold;');
        console.log('   → Hard refresh: Ctrl+Shift+R (Windows) or Cmd+Shift+R (Mac)');
        console.log('   → Clear browser cache');
        console.log('');
    }

    if (results.fail.some(r => r.name.includes('Click to view'))) {
        console.log('%c2. "Click to view" NOT IN DOM:', 'color: #f85149; font-weight: bold;');
        console.log('   → Extractions may not have bbox/page data');
        console.log('   → Check extraction data in React DevTools');
        console.log('   → Look for extraction.bbox and extraction.page');
        console.log('');
    }

    if (results.fail.some(r => r.name.includes('React Event'))) {
        console.log('%c3. REACT HANDLERS NOT ATTACHED:', 'color: #f85149; font-weight: bold;');
        console.log('   → React may not have finished rendering');
        console.log('   → Check for JavaScript errors in console');
        console.log('   → Inspect ExtractionPanel props in React DevTools');
        console.log('');
    }

    if (results.warning.some(r => r.name.includes('Expanded'))) {
        console.log('%c4. NO EXPANDED FIELDS:', 'color: #f0ad4e; font-weight: bold;');
        console.log('   → Click on a field name to expand it');
        console.log('   → Extractions only appear when field is expanded');
        console.log('');
    }

    // Manual test instructions
    console.log('%c━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━', 'color: #666;');
    console.log('%c🧪 MANUAL TEST STEPS:', 'font-size: 14px; color: #569cd6; font-weight: bold;');
    console.log('');
    console.log('1. Expand a field in the Extraction Panel (click field name)');
    console.log('2. Click on a gray extraction box');
    console.log('3. Watch this console for these logs:');
    console.log('   %c[ExtractionPanel] Extraction clicked: {...}', 'color: #ce9178;');
    console.log('   %c[DocumentDetailPage] Extraction clicked: {...}', 'color: #ce9178;');
    console.log('   %c[PDFViewer] Scrolled to page X', 'color: #ce9178;');
    console.log('');
    console.log('If NO logs appear → Click handler is NOT firing!');
    console.log('');

    // Add click listener test
    console.log('%c━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━', 'color: #666;');
    console.log('%c🎯 CLICK LISTENER TEST:', 'font-size: 14px; color: #569cd6; font-weight: bold;');
    console.log('');

    if (extractionDivs.length > 0) {
        console.log('Setting up click listeners on extraction divs...');
        extractionDivs.forEach((div, index) => {
            div.addEventListener('click', function(e) {
                console.log(`%c🖱️ CLICK DETECTED on extraction div ${index + 1}!`, 'color: #2ea043; font-size: 14px; font-weight: bold;');
                console.log('   Event:', e);
                console.log('   Target:', e.target);
                console.log('   Current Target:', e.currentTarget);
                console.log('   Text:', this.textContent.substring(0, 50));
            }, { capture: true });
        });
        console.log(`✓ Click listeners attached to ${extractionDivs.length} extraction div(s)`);
        console.log('Now try clicking an extraction box!');
    } else {
        console.log('%c⚠ No extraction divs found to attach listeners', 'color: #f0ad4e;');
    }

    console.log('');
    console.log('%c━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━', 'color: #666;');
    console.log('%c✅ Diagnostic complete! Results stored in window.__diagnosticResults', 'color: #4ec9b0; font-weight: bold;');
    console.log('');

    // Store results globally
    window.__diagnosticResults = results;
    window.__allLogs = allLogs;

    return results;
})();
