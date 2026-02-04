/**
 * Diagnostic script to test word-level highlighting
 */

const puppeteer = require('puppeteer');

async function testWordLevelHighlighting() {
    const browser = await puppeteer.launch({ headless: true });
    const page = await browser.newPage();

    // Listen to console logs
    page.on('console', msg => {
        console.log(`[BROWSER] ${msg.type()}: ${msg.text()}`);
    });

    // Navigate to page
    console.log('Navigating to document detail page...');
    await page.goto('http://localhost:3003/document-detail.html?id=37fb6240');

    // Wait for page to load
    await page.waitForTimeout(5000);

    // Check if DocumentDetailPage is loaded
    const hasDocumentDetailPage = await page.evaluate(() => {
        return typeof DocumentDetailPage !== 'undefined';
    });
    console.log(`DocumentDetailPage loaded: ${hasDocumentDetailPage}`);

    // Wait for PDF canvas
    console.log('Waiting for PDF canvas...');
    await page.waitForSelector('.pdf-page-canvas', { timeout: 20000 });
    console.log('PDF canvas found');

    // Wait for text layer
    console.log('Waiting for PDF text layer...');
    const textLayerExists = await page.waitForSelector('.pdf-text-layer span', { timeout: 20000 }).then(() => true).catch(() => false);
    console.log(`PDF text layer exists: ${textLayerExists}`);

    if (textLayerExists) {
        const spanCount = await page.evaluate(() => {
            return document.querySelectorAll('.pdf-text-layer span').length;
        });
        console.log(`Found ${spanCount} text layer spans`);
    }

    // Wait for extractions
    console.log('Waiting for extraction items...');
    await page.waitForSelector('.extraction-item', { timeout: 20000 });
    console.log('Extraction items found');

    // Get extraction count
    const extractionCount = await page.evaluate(() => {
        return document.querySelectorAll('.extraction-item').length;
    });
    console.log(`Found ${extractionCount} extraction items`);

    // Get first extraction details
    const firstExtraction = await page.evaluate(() => {
        const item = document.querySelector('.extraction-item');
        if (!item) return null;
        return {
            text: item.querySelector('.extraction-text')?.textContent,
            hasPage: !!item.querySelector('.btn-page-ref'),
            clickable: item.style.cursor === 'pointer'
        };
    });
    console.log('First extraction:', firstExtraction);

    // Click first extraction
    console.log('\nClicking first extraction...');
    await page.click('.extraction-item');
    await page.waitForTimeout(2000);

    // Check for word-level highlights
    const highlightStatus = await page.evaluate(() => {
        const highlightedSpans = document.querySelectorAll('.pdf-text-layer span[data-word-highlighted="true"]');
        const bboxHighlights = document.querySelectorAll('.extraction-highlight');

        return {
            wordHighlightCount: highlightedSpans.length,
            bboxHighlightCount: bboxHighlights.length,
            hasAnyHighlights: highlightedSpans.length > 0 || bboxHighlights.length > 0
        };
    });

    console.log('\nHighlighting results:');
    console.log(`  Word-level highlights: ${highlightStatus.wordHighlightCount}`);
    console.log(`  BBox highlights: ${highlightStatus.bboxHighlightCount}`);
    console.log(`  Any highlights: ${highlightStatus.hasAnyHighlights}`);

    await browser.close();
}

testWordLevelHighlighting().catch(console.error);
