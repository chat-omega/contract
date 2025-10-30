// PDF Rendering Tests
// Tests to verify PDF viewer functionality and prevent regression

const { test, expect } = require('@playwright/test');

test.describe('PDF Rendering', () => {
    test.beforeEach(async ({ page }) => {
        // Navigate to document detail page
        await page.goto('/document-detail.html');

        // Wait for page to be ready
        await page.waitForLoadState('networkidle');
    });

    test('Container should have non-zero width', async ({ page }) => {
        // Wait for PDF container to appear
        await page.waitForSelector('.pdf-page-container', {
            timeout: 10000
        });

        // Get container dimensions
        const containerBox = await page.locator('.pdf-page-container').first().boundingBox();

        console.log('Container dimensions:', containerBox);

        // Verify container is visible
        expect(containerBox).not.toBeNull();
        expect(containerBox.width).toBeGreaterThan(0);
        expect(containerBox.height).toBeGreaterThan(0);

        // Verify reasonable dimensions (PDF pages are typically 600-800px wide)
        expect(containerBox.width).toBeGreaterThan(400);
        expect(containerBox.height).toBeGreaterThan(500);
    });

    test('Canvas should be visible and rendered', async ({ page }) => {
        await page.waitForSelector('.pdf-page-canvas', {
            timeout: 10000
        });

        const canvas = page.locator('.pdf-page-canvas').first();

        // Verify canvas is visible
        await expect(canvas).toBeVisible();

        // Get canvas bounding box
        const canvasBox = await canvas.boundingBox();

        console.log('Canvas dimensions:', canvasBox);

        expect(canvasBox.width).toBeGreaterThan(400);
        expect(canvasBox.height).toBeGreaterThan(500);

        // Verify canvas is not clipped by parent
        const containerBox = await page.locator('.pdf-page-container').first().boundingBox();

        expect(canvasBox.width).toBeLessThanOrEqual(containerBox.width + 1); // +1 for rounding
        expect(canvasBox.height).toBeLessThanOrEqual(containerBox.height + 1);
    });

    test('PDF content should be rendered (not blank)', async ({ page }) => {
        await page.waitForSelector('.pdf-page-canvas', {
            timeout: 10000
        });

        // Wait for render to complete
        await page.waitForTimeout(2000);

        // Take screenshot and verify it's not blank
        const screenshot = await page.locator('.pdf-page-container').first().screenshot();

        // Verify screenshot has non-trivial size (rendered content)
        expect(screenshot.length).toBeGreaterThan(1000);
    });

    test('PDF.js library should be loaded', async ({ page }) => {
        const pdfjsLoaded = await page.evaluate(() => {
            return typeof pdfjsLib !== 'undefined';
        });

        expect(pdfjsLoaded).toBe(true);

        const workerConfigured = await page.evaluate(() => {
            return pdfjsLib?.GlobalWorkerOptions?.workerSrc != null;
        });

        expect(workerConfigured).toBe(true);
    });

    test('Console should not have render errors', async ({ page }) => {
        const errors = [];

        page.on('console', msg => {
            if (msg.type() === 'error') {
                errors.push(msg.text());
            }
        });

        await page.waitForSelector('.pdf-page-canvas', {
            timeout: 10000
        });

        await page.waitForTimeout(2000);

        // Filter for PDF-related errors
        const pdfErrors = errors.filter(e =>
            e.toLowerCase().includes('pdf') ||
            e.toLowerCase().includes('canvas') ||
            e.toLowerCase().includes('render')
        );

        console.log('Console errors:', pdfErrors);

        expect(pdfErrors).toHaveLength(0);
    });

    test('Scrolling should be smooth without layout thrashing', async ({ page }) => {
        await page.waitForSelector('.pdf-page-container', { timeout: 10000 });

        // Scroll through document
        const scrollContainer = page.locator('.pdf-scroll-container');
        await scrollContainer.evaluate(el => {
            el.scrollTop = 0;
        });

        // Scroll down 3 pages worth
        for (let i = 0; i < 3; i++) {
            await scrollContainer.evaluate(el => {
                el.scrollTop += el.clientHeight;
            });
            await page.waitForTimeout(500);
        }

        // Check that pages rendered
        const renderedPages = await page.evaluate(() => {
            return document.querySelectorAll('.pdf-page-canvas').length;
        });

        expect(renderedPages).toBeGreaterThan(0);
        expect(renderedPages).toBeLessThan(20); // Shouldn't render all pages
    });

    test('Page navigation buttons should work', async ({ page }) => {
        await page.waitForSelector('#prev-page', { timeout: 10000 });

        // Check initial page
        const initialPage = await page.locator('#current-page-display').textContent();
        expect(initialPage).toBe('1');

        // Previous button should be disabled on page 1
        const prevBtn = page.locator('#prev-page');
        await expect(prevBtn).toBeDisabled();

        // Click next button
        const nextBtn = page.locator('#next-page');
        await nextBtn.click();

        // Wait for navigation
        await page.waitForTimeout(1000);

        // Check page changed
        const newPage = await page.locator('#current-page-display').textContent();
        expect(newPage).toBe('2');

        // Previous button should now be enabled
        await expect(prevBtn).not.toBeDisabled();
    });
});
