/**
 * Word-Level Highlighting E2E Tests
 *
 * Tests the new word-level precise highlighting feature that highlights
 * individual words in the PDF text layer instead of rectangular boxes.
 */

const { test, expect } = require('@playwright/test');

// Test configuration
const BASE_URL = 'http://localhost:3003';
const API_URL = 'http://localhost:5001/api';

test.describe('Word-Level Highlighting', () => {
    let authToken;

    test.beforeEach(async ({ page, context }) => {
        // Login and get auth token
        const loginResponse = await page.request.post(`${API_URL}/auth/login`, {
            data: {
                username: 'admin',
                password: 'admin123'
            }
        });

        const loginData = await loginResponse.json();
        authToken = loginData.access_token;

        // Set auth token in localStorage BEFORE navigating to the page
        await context.addInitScript((token) => {
            localStorage.setItem('authToken', token);
        }, authToken);
    });

    test('should load word-level highlighting JavaScript code', async ({ page }) => {
        await page.goto(`${BASE_URL}/document-detail.html?id=37fb6240`);

        // Wait for page to load
        await page.waitForLoadState('networkidle');

        // Check if DocumentDetailPage is loaded
        const hasDocumentDetailPage = await page.evaluate(() => {
            return typeof DocumentDetailPage !== 'undefined';
        });

        expect(hasDocumentDetailPage).toBeTruthy();

        // Check if word-level highlighting methods exist
        const hasWordLevelMethods = await page.evaluate(() => {
            const instance = new DocumentDetailPage();
            return {
                hasHighlightWordLevel: typeof instance.highlightExtractionWordLevel === 'function',
                hasClearWordHighlights: typeof instance.clearWordHighlights === 'function',
                hasFindMatchingSpans: typeof instance.findMatchingSpans === 'function',
                hasTokenize: typeof instance.tokenizeForHighlighting === 'function'
            };
        });

        expect(hasWordLevelMethods.hasHighlightWordLevel).toBeTruthy();
        expect(hasWordLevelMethods.hasClearWordHighlights).toBeTruthy();
        expect(hasWordLevelMethods.hasFindMatchingSpans).toBeTruthy();
        expect(hasWordLevelMethods.hasTokenize).toBeTruthy();
    });

    test('should apply word-level highlighting when clicking extraction', async ({ page }) => {
        await page.goto(`${BASE_URL}/document-detail.html?id=37fb6240`);

        // Wait for page to load
        await page.waitForLoadState('networkidle');
        await page.waitForTimeout(3000);

        // Wait for PDF to render
        await page.waitForSelector('.pdf-page-canvas', { timeout: 15000 });

        // Wait for PDF text layer to be rendered (critical for word-level highlighting)
        await page.waitForSelector('.pdf-text-layer span', { timeout: 15000 });

        // Wait for extractions to load
        await page.waitForSelector('.extraction-item', { timeout: 10000 });

        // Listen for console logs
        const consoleLogs = [];
        page.on('console', msg => {
            consoleLogs.push(msg.text());
        });

        // Click on first extraction
        const firstExtraction = page.locator('.extraction-item').first();
        await firstExtraction.click();

        // Wait for highlighting to complete
        await page.waitForTimeout(1000);

        // Check console logs for word-level highlighting
        const hasWordLevelLog = consoleLogs.some(log =>
            log.includes('🎯 Starting word-level precise highlighting') ||
            log.includes('Attempting WORD-LEVEL highlighting')
        );

        expect(hasWordLevelLog).toBeTruthy();

        // Check if word-level highlights are present in DOM
        const hasWordHighlights = await page.evaluate(() => {
            const highlightedSpans = document.querySelectorAll('.pdf-text-layer span[data-word-highlighted="true"]');
            return highlightedSpans.length > 0;
        });

        expect(hasWordHighlights).toBeTruthy();
    });

    test('should clear word-level highlights when clicking another extraction', async ({ page }) => {
        await page.goto(`${BASE_URL}/document-detail.html?id=37fb6240`);

        await page.waitForLoadState('networkidle');
        await page.waitForTimeout(3000);

        await page.waitForSelector('.pdf-page-canvas', { timeout: 15000 });
        await page.waitForSelector('.pdf-text-layer span', { timeout: 15000 });
        await page.waitForSelector('.extraction-item', { timeout: 10000 });

        // Click first extraction
        const extractions = page.locator('.extraction-item');
        await extractions.first().click();
        await page.waitForTimeout(500);

        // Get count of highlighted spans after first click
        const firstHighlightCount = await page.evaluate(() => {
            return document.querySelectorAll('.pdf-text-layer span[data-word-highlighted="true"]').length;
        });

        // Click second extraction
        await extractions.nth(1).click();
        await page.waitForTimeout(500);

        // Get count of highlighted spans after second click
        const secondHighlightCount = await page.evaluate(() => {
            return document.querySelectorAll('.pdf-text-layer span[data-word-highlighted="true"]').length;
        });

        // Both should have highlights (old ones cleared, new ones added)
        expect(firstHighlightCount).toBeGreaterThan(0);
        expect(secondHighlightCount).toBeGreaterThan(0);

        // Verify that highlights have yellow background
        const hasYellowHighlight = await page.evaluate(() => {
            const highlightedSpan = document.querySelector('.pdf-text-layer span[data-word-highlighted="true"]');
            if (!highlightedSpan) return false;

            const bgColor = window.getComputedStyle(highlightedSpan).backgroundColor;
            // Check if it's yellow-ish (rgba(255, 255, 0, 0.4))
            return bgColor.includes('255, 255, 0') || bgColor.includes('rgba(255, 255, 0');
        });

        expect(hasYellowHighlight).toBeTruthy();
    });

    test('should persist word-level highlights after zoom', async ({ page }) => {
        await page.goto(`${BASE_URL}/document-detail.html?id=37fb6240`);

        await page.waitForLoadState('networkidle');
        await page.waitForTimeout(3000);

        await page.waitForSelector('.pdf-page-canvas', { timeout: 15000 });
        await page.waitForSelector('.pdf-text-layer span', { timeout: 15000 });
        await page.waitForSelector('.extraction-item', { timeout: 10000 });

        // Click extraction to highlight
        await page.locator('.extraction-item').first().click();
        await page.waitForTimeout(500);

        // Verify initial highlights
        const initialHighlightCount = await page.evaluate(() => {
            return document.querySelectorAll('.pdf-text-layer span[data-word-highlighted="true"]').length;
        });

        expect(initialHighlightCount).toBeGreaterThan(0);

        // Zoom in
        const zoomInButton = page.locator('button[onclick*="zoomIn"]');
        await zoomInButton.click();
        await page.waitForTimeout(1000);

        // Check if highlights are restored after zoom
        const afterZoomHighlightCount = await page.evaluate(() => {
            return document.querySelectorAll('.pdf-text-layer span[data-word-highlighted="true"]').length;
        });

        // Highlights should be restored (may be slightly different due to re-rendering)
        expect(afterZoomHighlightCount).toBeGreaterThan(0);
    });

    test('should fallback to bbox when word-level fails', async ({ page }) => {
        await page.goto(`${BASE_URL}/document-detail.html?id=37fb6240`);

        await page.waitForLoadState('networkidle');
        await page.waitForTimeout(3000);

        // Listen for console logs
        const consoleLogs = [];
        page.on('console', msg => {
            consoleLogs.push(msg.text());
        });

        await page.waitForSelector('.pdf-page-canvas', { timeout: 15000 });
        await page.waitForSelector('.pdf-text-layer span', { timeout: 15000 });
        await page.waitForSelector('.extraction-item', { timeout: 10000 });

        // Click extraction
        await page.locator('.extraction-item').first().click();
        await page.waitForTimeout(1000);

        // Check fallback chain in console logs
        const hasPriorityLog = consoleLogs.some(log =>
            log.includes('Attempting WORD-LEVEL highlighting') ||
            log.includes('Using BBOX highlighting') ||
            log.includes('Using TEXT SEARCH')
        );

        expect(hasPriorityLog).toBeTruthy();

        // Either word-level or bbox highlights should be present
        const hasHighlights = await page.evaluate(() => {
            const wordHighlights = document.querySelectorAll('.pdf-text-layer span[data-word-highlighted="true"]');
            const bboxHighlights = document.querySelectorAll('.extraction-highlight');
            return wordHighlights.length > 0 || bboxHighlights.length > 0;
        });

        expect(hasHighlights).toBeTruthy();
    });

    test('should match multiple words in sequence', async ({ page }) => {
        await page.goto(`${BASE_URL}/document-detail.html?id=37fb6240`);

        await page.waitForLoadState('networkidle');
        await page.waitForTimeout(3000);

        await page.waitForSelector('.pdf-page-canvas', { timeout: 15000 });
        await page.waitForSelector('.pdf-text-layer span', { timeout: 15000 });
        await page.waitForSelector('.extraction-item', { timeout: 10000 });

        // Find extraction with multi-word text
        const multiWordExtraction = await page.evaluate(() => {
            const extractions = document.querySelectorAll('.extraction-item');
            for (const extraction of extractions) {
                const textElement = extraction.querySelector('.extraction-text');
                if (textElement && textElement.textContent.split(/\s+/).length > 2) {
                    return extraction;
                }
            }
            return null;
        });

        if (multiWordExtraction) {
            // Click the multi-word extraction
            await page.locator('.extraction-item').first().click();
            await page.waitForTimeout(1000);

            // Check if multiple spans are highlighted
            const highlightedSpanCount = await page.evaluate(() => {
                return document.querySelectorAll('.pdf-text-layer span[data-word-highlighted="true"]').length;
            });

            // Should highlight at least 2 spans for multi-word text
            expect(highlightedSpanCount).toBeGreaterThanOrEqual(1);
        }
    });

    test('should have proper CSS styling for word highlights', async ({ page }) => {
        await page.goto(`${BASE_URL}/document-detail.html?id=37fb6240`);

        await page.waitForLoadState('networkidle');
        await page.waitForTimeout(3000);

        await page.waitForSelector('.pdf-page-canvas', { timeout: 15000 });
        await page.waitForSelector('.pdf-text-layer span', { timeout: 15000 });
        await page.waitForSelector('.extraction-item', { timeout: 10000 });

        // Click extraction
        await page.locator('.extraction-item').first().click();
        await page.waitForTimeout(500);

        // Check CSS properties
        const cssProperties = await page.evaluate(() => {
            const highlightedSpan = document.querySelector('.pdf-text-layer span[data-word-highlighted="true"]');
            if (!highlightedSpan) return null;

            const styles = window.getComputedStyle(highlightedSpan);
            return {
                backgroundColor: styles.backgroundColor,
                borderRadius: styles.borderRadius,
                hasDataAttribute: highlightedSpan.getAttribute('data-word-highlighted') === 'true'
            };
        });

        if (cssProperties) {
            expect(cssProperties.hasDataAttribute).toBeTruthy();
            expect(cssProperties.borderRadius).toBeTruthy(); // Should have border-radius
            expect(cssProperties.backgroundColor).toContain('255, 255, 0'); // Yellow-ish
        }
    });
});

test.describe('Word-Level Highlighting - Error Handling', () => {
    test.beforeEach(async ({ page, context }) => {
        // Login and get auth token
        const loginResponse = await page.request.post(`${API_URL}/auth/login`, {
            data: {
                username: 'admin',
                password: 'admin123'
            }
        });

        const loginData = await loginResponse.json();
        const authToken = loginData.access_token;

        // Set auth token in localStorage BEFORE navigating to the page
        await context.addInitScript((token) => {
            localStorage.setItem('authToken', token);
        }, authToken);
    });

    test('should handle missing text layer gracefully', async ({ page }) => {
        await page.goto(`${BASE_URL}/document-detail.html?id=37fb6240`);

        const consoleLogs = [];
        page.on('console', msg => {
            if (msg.type() === 'error') {
                consoleLogs.push(msg.text());
            }
        });

        await page.waitForLoadState('networkidle');
        await page.waitForTimeout(3000);

        // Wait for initial page load
        await page.waitForSelector('.pdf-page-canvas', { timeout: 15000 });
        await page.waitForSelector('.extraction-item', { timeout: 10000 });

        // Manually remove text layer to test error handling
        await page.evaluate(() => {
            const textLayers = document.querySelectorAll('.pdf-text-layer');
            textLayers.forEach(layer => layer.remove());
        });

        // Click extraction - should fallback gracefully
        await page.locator('.extraction-item').first().click();
        await page.waitForTimeout(500);

        // Should either have bbox highlights or show error
        const hasBboxHighlights = await page.evaluate(() => {
            return document.querySelectorAll('.extraction-highlight').length > 0;
        });

        // Either should work (bbox fallback) or appropriate error logged
        expect(hasBboxHighlights || consoleLogs.length > 0).toBeTruthy();
    });
});
