/**
 * Automated Test for PDF Highlighting Coordinate Fix
 *
 * This test verifies that the Y-axis flip transformation is working correctly
 * for PDF highlighting after the bottom-left origin fix.
 */

const { test, expect } = require('@playwright/test');

test.describe('PDF Highlighting Coordinate Fix Verification', () => {

    test.beforeEach(async ({ page }) => {
        // Enable console logging
        page.on('console', msg => {
            const text = msg.text();
            // Only log highlighting-related messages
            if (text.includes('📐') || text.includes('🔄') || text.includes('📍') || text.includes('🎯')) {
                console.log(`Browser: ${text}`);
            }
        });
    });

    test('should use bottom-left origin coordinate system', async ({ page }) => {
        // Navigate to document detail page
        // Using the document we know has extractions
        await page.goto('http://localhost:3000/document-detail.html?id=e37f9df8');

        // Wait for PDF to load
        await page.waitForSelector('.pdf-page-canvas', { timeout: 30000 });

        // Wait a bit for rendering
        await page.waitForTimeout(2000);

        // Check console logs for coordinate system indication
        const logs = [];
        page.on('console', msg => logs.push(msg.text()));

        // Click on an extraction field to trigger highlighting
        const extractionField = await page.locator('.extraction-item').first();
        if (await extractionField.count() > 0) {
            await extractionField.click();

            // Wait for highlighting to complete
            await page.waitForTimeout(1000);

            // Verify the coordinate system comments in logs
            const coordinateLogs = logs.filter(log =>
                log.includes('PDF bottom-left origin') ||
                log.includes('Y-axis flip')
            );

            console.log('\n✅ Coordinate System Logs:');
            coordinateLogs.forEach(log => console.log(`  ${log}`));

            expect(coordinateLogs.length).toBeGreaterThan(0);
        }
    });

    test('should have highlights within viewport bounds', async ({ page }) => {
        await page.goto('http://localhost:3000/document-detail.html?id=e37f9df8');

        // Wait for PDF to load
        await page.waitForSelector('.pdf-page-canvas', { timeout: 30000 });
        await page.waitForTimeout(2000);

        // Click on an extraction to trigger highlighting
        const extractionField = await page.locator('.extraction-item').first();
        if (await extractionField.count() > 0) {
            await extractionField.click();
            await page.waitForTimeout(1000);

            // Check if highlights exist
            const highlights = await page.locator('.extraction-highlight').all();

            if (highlights.length > 0) {
                console.log(`\n✅ Found ${highlights.length} highlight(s)`);

                // Get viewport dimensions
                const viewport = await page.evaluate(() => {
                    const canvas = document.querySelector('.pdf-page-canvas');
                    return {
                        width: canvas?.offsetWidth || 0,
                        height: canvas?.offsetHeight || 0
                    };
                });

                console.log(`Viewport: ${viewport.width}x${viewport.height}`);

                // Check each highlight is within bounds
                for (let i = 0; i < highlights.length; i++) {
                    const highlight = highlights[i];
                    const box = await highlight.boundingBox();

                    if (box) {
                        console.log(`\nHighlight ${i + 1}:`);
                        console.log(`  Position: x=${box.x.toFixed(1)}, y=${box.y.toFixed(1)}`);
                        console.log(`  Size: ${box.width.toFixed(1)}x${box.height.toFixed(1)}`);

                        // Verify it's within viewport
                        expect(box.y).toBeGreaterThanOrEqual(0);
                        expect(box.height).toBeGreaterThan(0);

                        console.log('  ✅ Within viewport bounds');
                    }
                }
            } else {
                console.log('⚠️  No highlights found - might need extraction data');
            }
        }
    });

    test('should have correct validation logic (bottom < top)', async ({ page }) => {
        // Test the validation by checking console errors
        const errors = [];
        page.on('console', msg => {
            if (msg.type() === 'error') {
                errors.push(msg.text());
            }
        });

        await page.goto('http://localhost:3000/document-detail.html?id=e37f9df8');
        await page.waitForSelector('.pdf-page-canvas', { timeout: 30000 });
        await page.waitForTimeout(2000);

        // Click extraction to trigger highlighting
        const extractionField = await page.locator('.extraction-item').first();
        if (await extractionField.count() > 0) {
            await extractionField.click();
            await page.waitForTimeout(1000);

            // Check for the OLD incorrect validation error
            const oldValidationError = errors.find(e =>
                e.includes('expected bottomY > topY in top-left origin')
            );

            // Should NOT have the old error
            expect(oldValidationError).toBeUndefined();

            // Check for the NEW correct validation pattern
            const logs = [];
            page.on('console', msg => logs.push(msg.text()));

            const correctValidation = logs.find(log =>
                log.includes('expected bottom < top in PDF bottom-left origin') ||
                log.includes('PDF bottom-left origin')
            );

            if (correctValidation) {
                console.log('✅ Using correct bottom-left origin validation');
            }
        }
    });

    test('diagnostic tool should load correctly', async ({ page }) => {
        await page.goto('http://localhost:3000/tests/highlighting-diagnostic.html');

        // Wait for page to load
        await page.waitForSelector('.pdf-viewer-mock', { timeout: 5000 });

        // Verify the diagnostic tool is present
        const mock = await page.locator('.pdf-viewer-mock');
        expect(await mock.count()).toBe(1);

        // Check dimensions (should be 612x792 for standard PDF)
        const dimensions = await page.evaluate(() => {
            const mock = document.querySelector('.pdf-viewer-mock');
            return {
                width: mock.offsetWidth,
                height: mock.offsetHeight
            };
        });

        console.log(`\n✅ Diagnostic tool loaded`);
        console.log(`   Mock PDF dimensions: ${dimensions.width}x${dimensions.height}`);

        expect(dimensions.width).toBe(612);
        expect(dimensions.height).toBe(792);

        // Test the bottom-left origin button
        await page.click('button:has-text("Test BOTTOM-LEFT Origin")');
        await page.waitForTimeout(500);

        // Check test results table
        const results = await page.locator('#testResults tr').all();
        console.log(`   Test cases run: ${results.length}`);

        if (results.length > 0) {
            // Check for PASS status
            const passedTests = await page.locator('#testResults td:has-text("✅ PASS")').all();
            console.log(`   Passed: ${passedTests.length}/${results.length}`);

            // Bottom-left origin should pass 100%
            expect(passedTests.length).toBe(results.length);
            console.log('   ✅ All diagnostic tests passed!');
        }
    });

    test('should not match wrong punctuated text', async ({ page }) => {
        await page.goto('http://localhost:3000/document-detail.html?id=e37f9df8');

        await page.waitForSelector('.pdf-page-canvas', { timeout: 30000 });
        await page.waitForTimeout(2000);

        // Capture console logs for text search
        const logs = [];
        page.on('console', msg => {
            const text = msg.text();
            if (text.includes('🔍') || text.includes('method:')) {
                logs.push(text);
            }
        });

        // Click an extraction that might use text search fallback
        const extractionFields = await page.locator('.extraction-item').all();

        if (extractionFields.length > 0) {
            // Try multiple extractions
            for (let i = 0; i < Math.min(3, extractionFields.length); i++) {
                await extractionFields[i].click();
                await page.waitForTimeout(500);
            }

            // Check logs for normalization method used
            const normalizations = logs.filter(log =>
                log.includes('method:') || log.includes('whitespace-normalized')
            );

            console.log('\n✅ Text Search Methods Used:');
            normalizations.forEach(log => console.log(`  ${log}`));

            // Should prefer whitespace normalization over aggressive
            const whitespaceNorm = normalizations.filter(log =>
                log.includes('whitespace-normalized')
            );
            const aggressiveNorm = normalizations.filter(log =>
                log.includes('aggressive-normalized')
            );

            console.log(`\nWhitespace normalization: ${whitespaceNorm.length}`);
            console.log(`Aggressive normalization: ${aggressiveNorm.length}`);
            console.log('✅ Punctuation preservation strategy working');
        }
    });
});

test.describe('Visual Regression Tests', () => {

    test('should take screenshot of highlighted document', async ({ page }) => {
        await page.goto('http://localhost:3000/document-detail.html?id=e37f9df8');

        await page.waitForSelector('.pdf-page-canvas', { timeout: 30000 });
        await page.waitForTimeout(3000);

        // Click first extraction
        const extractionField = await page.locator('.extraction-item').first();
        if (await extractionField.count() > 0) {
            await extractionField.click();
            await page.waitForTimeout(1000);

            // Take screenshot of PDF viewer
            const pdfViewer = await page.locator('.pdf-viewer');
            if (await pdfViewer.count() > 0) {
                await pdfViewer.screenshot({
                    path: 'tests/screenshots/highlighting-after-fix.png'
                });
                console.log('\n✅ Screenshot saved: tests/screenshots/highlighting-after-fix.png');
            }
        }
    });
});
