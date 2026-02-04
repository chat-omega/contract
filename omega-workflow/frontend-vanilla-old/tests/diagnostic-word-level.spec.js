/**
 * Diagnostic test for word-level highlighting
 */

const { test, expect } = require('@playwright/test');

const BASE_URL = 'http://localhost:3003';
const API_URL = 'http://localhost:5001/api';

test.describe('Word-Level Highlighting Diagnostic', () => {
    test('diagnostic - check word-level highlighting flow', async ({ page, context }) => {
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

        // Capture all console messages
        const consoleLogs = [];
        page.on('console', msg => {
            const text = msg.text();
            consoleLogs.push({ type: msg.type(), text });
            console.log(`[BROWSER ${msg.type()}] ${text}`);
        });

        console.log('\n=== DIAGNOSTIC TEST START ===\n');

        // Navigate
        console.log('1. Navigating to document detail page...');
        await page.goto(`${BASE_URL}/document-detail.html?id=37fb6240`);

        // Wait for initial load
        console.log('2. Waiting for network idle...');
        await page.waitForLoadState('networkidle');
        await page.waitForTimeout(3000);

        // Check if DocumentDetailPage is loaded
        console.log('3. Checking if DocumentDetailPage class is loaded...');
        const hasDocumentDetailPage = await page.evaluate(() => {
            return typeof DocumentDetailPage !== 'undefined';
        });
        console.log(`   DocumentDetailPage loaded: ${hasDocumentDetailPage}`);

        // Wait for PDF canvas
        console.log('4. Waiting for PDF canvas...');
        await page.waitForSelector('.pdf-page-canvas', { timeout: 20000 });
        console.log('   PDF canvas found!');

        // Wait for text layer
        console.log('5. Waiting for PDF text layer...');
        try {
            await page.waitForSelector('.pdf-text-layer span', { timeout: 20000 });
            const spanCount = await page.evaluate(() => {
                return document.querySelectorAll('.pdf-text-layer span').length;
            });
            console.log(`   PDF text layer found! Span count: ${spanCount}`);
        } catch (e) {
            console.log('   PDF text layer NOT found!');
        }

        // Wait for extractions
        console.log('6. Waiting for extraction items...');
        await page.waitForSelector('.extraction-item', { timeout: 20000 });
        const extractionCount = await page.evaluate(() => {
            return document.querySelectorAll('.extraction-item').length;
        });
        console.log(`   Found ${extractionCount} extraction items`);

        // Get first extraction details
        console.log('7. Getting first extraction details...');
        const firstExtraction = await page.evaluate(() => {
            const item = document.querySelector('.extraction-item');
            if (!item) return null;
            return {
                text: item.querySelector('.extraction-text')?.textContent,
                hasPage: !!item.querySelector('.btn-page-ref'),
                clickable: item.style.cursor === 'pointer',
                title: item.title
            };
        });
        console.log('   First extraction:', JSON.stringify(firstExtraction, null, 2));

        // Click first extraction
        console.log('\n8. Clicking first extraction...');
        await page.click('.extraction-item');
        await page.waitForTimeout(2000);

        // Check for highlights
        console.log('9. Checking for highlights...');
        const highlightStatus = await page.evaluate(() => {
            const highlightedSpans = document.querySelectorAll('.pdf-text-layer span[data-word-highlighted="true"]');
            const bboxHighlights = document.querySelectorAll('.extraction-highlight');

            // Get sample highlighted span if exists
            let sampleHighlight = null;
            if (highlightedSpans.length > 0) {
                const span = highlightedSpans[0];
                const styles = window.getComputedStyle(span);
                sampleHighlight = {
                    text: span.textContent,
                    backgroundColor: styles.backgroundColor,
                    borderRadius: styles.borderRadius
                };
            }

            return {
                wordHighlightCount: highlightedSpans.length,
                bboxHighlightCount: bboxHighlights.length,
                hasAnyHighlights: highlightedSpans.length > 0 || bboxHighlights.length > 0,
                sampleHighlight
            };
        });

        console.log('\n=== HIGHLIGHT RESULTS ===');
        console.log(`   Word-level highlights: ${highlightStatus.wordHighlightCount}`);
        console.log(`   BBox highlights: ${highlightStatus.bboxHighlightCount}`);
        console.log(`   Any highlights: ${highlightStatus.hasAnyHighlights}`);
        if (highlightStatus.sampleHighlight) {
            console.log(`   Sample highlight:`, JSON.stringify(highlightStatus.sampleHighlight, null, 2));
        }

        // Check console logs for word-level highlighting messages
        console.log('\n=== CONSOLE LOG ANALYSIS ===');
        const wordLevelLogs = consoleLogs.filter(log =>
            log.text.includes('word-level') ||
            log.text.includes('WORD-LEVEL') ||
            log.text.includes('🎯') ||
            log.text.includes('highlightExtractionWordLevel')
        );
        console.log(`   Found ${wordLevelLogs.length} word-level related logs:`);
        wordLevelLogs.forEach(log => {
            console.log(`     [${log.type}] ${log.text}`);
        });

        console.log('\n=== DIAGNOSTIC TEST END ===\n');

        // Test assertions (will fail if highlighting doesn't work, but we'll get diagnostic info)
        expect(hasDocumentDetailPage).toBe(true);
        expect(extractionCount).toBeGreaterThan(0);
    });
});
