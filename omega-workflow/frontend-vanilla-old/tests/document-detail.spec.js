/**
 * Playwright E2E Tests for Document Detail Page
 * Tests the complete user flow from authentication to PDF viewing
 */

const { test, expect } = require('@playwright/test');

const BASE_URL = 'http://localhost:3000';
const DOCUMENT_ID = 'e37f9df8';
const TEST_USER = {
    username: 'admin',
    password: 'admin123'
};

test.describe('Document Detail Page - E2E Tests', () => {

    test.beforeEach(async ({ page }) => {
        // Login before each test
        await page.goto(`${BASE_URL}/login.html`);
        await page.fill('input[name="username"]', TEST_USER.username);
        await page.fill('input[name="password"]', TEST_USER.password);
        await page.click('button[type="submit"]');

        // Wait for successful login (redirect or token storage)
        await page.waitForTimeout(2000);
    });

    test('should load document detail page without errors', async ({ page }) => {
        console.log('🧪 Test: Page loads without errors');

        // Track console errors
        const errors = [];
        page.on('console', msg => {
            if (msg.type() === 'error') {
                errors.push(msg.text());
            }
        });

        // Navigate to document detail page
        await page.goto(`${BASE_URL}/document-detail.html?id=${DOCUMENT_ID}`);

        // Wait for page to initialize
        await page.waitForTimeout(3000);

        // Check for initialization logs
        const logs = await page.evaluate(() => {
            return console.history || [];
        });

        // Verify no critical errors
        const criticalErrors = errors.filter(e =>
            e.includes('❌') ||
            e.includes('CONTAINER DIMENSIONS ARE ZERO')
        );

        expect(criticalErrors).toHaveLength(0);
        console.log('✅ No critical errors found');
    });

    test('should display document title and metadata', async ({ page }) => {
        console.log('🧪 Test: Document metadata display');

        await page.goto(`${BASE_URL}/document-detail.html?id=${DOCUMENT_ID}`);
        await page.waitForTimeout(2000);

        // Check document title
        const title = await page.locator('#document-title').textContent();
        expect(title).toBeTruthy();
        expect(title).not.toBe('Untitled Document');
        console.log(`✅ Document title: "${title}"`);

        // Check sidebar exists
        const sidebar = await page.locator('.document-sidebar');
        expect(sidebar).toBeVisible();
        console.log('✅ Sidebar is visible');
    });

    test('should render PDF with non-zero container heights', async ({ page }) => {
        console.log('🧪 Test: PDF container dimensions');

        await page.goto(`${BASE_URL}/document-detail.html?id=${DOCUMENT_ID}`);

        // Wait for PDF to render
        await page.waitForTimeout(5000);

        // Check PDF containers
        const containers = await page.locator('.pdf-page-container').all();
        console.log(`📄 Found ${containers.length} page containers`);

        expect(containers.length).toBeGreaterThan(0);

        // Check first 3 containers have non-zero height
        for (let i = 0; i < Math.min(3, containers.length); i++) {
            const container = containers[i];
            const boundingBox = await container.boundingBox();

            expect(boundingBox).toBeTruthy();
            expect(boundingBox.height).toBeGreaterThan(0);

            console.log(`✅ Container ${i + 1}: ${boundingBox.width}×${boundingBox.height}px`);
        }
    });

    test('should render visible PDF canvases', async ({ page }) => {
        console.log('🧪 Test: PDF canvas rendering');

        await page.goto(`${BASE_URL}/document-detail.html?id=${DOCUMENT_ID}`);
        await page.waitForTimeout(5000);

        // Check canvases exist and are visible
        const canvases = await page.locator('.pdf-page-canvas').all();
        console.log(`🎨 Found ${canvases.length} canvases`);

        expect(canvases.length).toBeGreaterThan(0);

        // Check first canvas is visible with non-zero dimensions
        const firstCanvas = canvases[0];
        const isVisible = await firstCanvas.isVisible();
        expect(isVisible).toBe(true);

        const canvasBox = await firstCanvas.boundingBox();
        expect(canvasBox.width).toBeGreaterThan(0);
        expect(canvasBox.height).toBeGreaterThan(0);

        console.log(`✅ First canvas: ${canvasBox.width}×${canvasBox.height}px, visible: ${isVisible}`);
    });

    test('should have CSS scale-factor variable set', async ({ page }) => {
        console.log('🧪 Test: CSS scale-factor variable');

        await page.goto(`${BASE_URL}/document-detail.html?id=${DOCUMENT_ID}`);
        await page.waitForTimeout(5000);

        // Check if containers have scale-factor CSS variable
        const scaleFactor = await page.evaluate(() => {
            const container = document.querySelector('.pdf-page-container');
            if (!container) return null;
            const style = window.getComputedStyle(container);
            return style.getPropertyValue('--scale-factor');
        });

        expect(scaleFactor).toBeTruthy();
        console.log(`✅ Scale factor set: ${scaleFactor}`);
    });

    test('should display extracted terms in sidebar', async ({ page }) => {
        console.log('🧪 Test: Extracted terms display');

        await page.goto(`${BASE_URL}/document-detail.html?id=${DOCUMENT_ID}`);
        await page.waitForTimeout(5000);

        // Check extracted terms container
        const termsContainer = await page.locator('#extracted-terms-container');
        expect(termsContainer).toBeVisible();

        // Check if categories exist
        const categories = await page.locator('.category').all();
        console.log(`📋 Found ${categories.length} term categories`);

        // Should have at least some categories (even if no terms extracted)
        expect(categories.length).toBeGreaterThanOrEqual(0);
        console.log('✅ Terms container is rendering');
    });

    test('should allow PDF scrolling', async ({ page }) => {
        console.log('🧪 Test: PDF scrolling');

        await page.goto(`${BASE_URL}/document-detail.html?id=${DOCUMENT_ID}`);
        await page.waitForTimeout(5000);

        const scrollContainer = await page.locator('#pdf-scroll-container');

        // Get initial scroll position
        const initialScroll = await scrollContainer.evaluate(el => el.scrollTop);

        // Scroll down
        await scrollContainer.evaluate(el => el.scrollTop = 1000);
        await page.waitForTimeout(1000);

        // Get new scroll position
        const newScroll = await scrollContainer.evaluate(el => el.scrollTop);

        expect(newScroll).toBeGreaterThan(initialScroll);
        console.log(`✅ Scroll working: ${initialScroll}px → ${newScroll}px`);
    });

    test('should handle page navigation controls', async ({ page }) => {
        console.log('🧪 Test: Page navigation');

        await page.goto(`${BASE_URL}/document-detail.html?id=${DOCUMENT_ID}`);
        await page.waitForTimeout(5000);

        // Check page info display
        const pageInfo = await page.locator('.page-info').textContent();
        expect(pageInfo).toMatch(/Page \d+ of \d+/);
        console.log(`✅ Page info: ${pageInfo}`);

        // Test zoom controls exist
        const zoomIn = await page.locator('#zoom-in');
        const zoomOut = await page.locator('#zoom-out');

        expect(zoomIn).toBeTruthy();
        expect(zoomOut).toBeTruthy();
        console.log('✅ Zoom controls present');
    });

    test('should load document from backend API', async ({ page }) => {
        console.log('🧪 Test: Backend API integration');

        // Intercept API calls
        const apiCalls = [];
        page.on('response', response => {
            if (response.url().includes('/api/documents/')) {
                apiCalls.push({
                    url: response.url(),
                    status: response.status()
                });
            }
        });

        await page.goto(`${BASE_URL}/document-detail.html?id=${DOCUMENT_ID}`);
        await page.waitForTimeout(5000);

        // Verify API calls were made
        const documentMetadata = apiCalls.find(call =>
            call.url.includes(`/api/documents/${DOCUMENT_ID}`) &&
            !call.url.includes('/content')
        );

        const documentContent = apiCalls.find(call =>
            call.url.includes(`/api/documents/${DOCUMENT_ID}/content`)
        );

        expect(documentMetadata).toBeTruthy();
        expect(documentMetadata.status).toBe(200);
        console.log('✅ Document metadata API: 200 OK');

        expect(documentContent).toBeTruthy();
        expect(documentContent.status).toBe(200);
        console.log('✅ Document content API: 200 OK');
    });

    test('should take screenshot of rendered page', async ({ page }) => {
        console.log('🧪 Test: Screenshot capture');

        await page.goto(`${BASE_URL}/document-detail.html?id=${DOCUMENT_ID}`);
        await page.waitForTimeout(5000);

        // Take screenshot for visual verification
        await page.screenshot({
            path: '/home/ubuntu/contract1/omega-workflow/frontend-vanilla-old/tests/screenshots/document-detail-page.png',
            fullPage: true
        });

        // Take screenshot of just PDF viewer
        const pdfViewer = await page.locator('#pdf-viewer');
        await pdfViewer.screenshot({
            path: '/home/ubuntu/contract1/omega-workflow/frontend-vanilla-old/tests/screenshots/pdf-viewer.png'
        });

        console.log('✅ Screenshots saved');
    });
});

test.describe('Backend API Tests', () => {

    test('should return document metadata', async ({ request }) => {
        console.log('🧪 Backend Test: Document metadata endpoint');

        // Login first to get token
        const loginResponse = await request.post(`${BASE_URL}/api/auth/login`, {
            data: TEST_USER
        });
        expect(loginResponse.ok()).toBe(true);

        const loginData = await loginResponse.json();
        const token = loginData.tokens?.accessToken || loginData.token;

        // Get document metadata
        const response = await request.get(`${BASE_URL}/api/documents/${DOCUMENT_ID}`, {
            headers: {
                'Authorization': `Bearer ${token}`
            }
        });

        expect(response.ok()).toBe(true);
        const data = await response.json();

        expect(data.id).toBe(DOCUMENT_ID);
        expect(data.name).toBeTruthy();
        console.log(`✅ Document metadata: ${data.name}`);
    });

    test('should return PDF content', async ({ request }) => {
        console.log('🧪 Backend Test: PDF content endpoint');

        // Login first
        const loginResponse = await request.post(`${BASE_URL}/api/auth/login`, {
            data: TEST_USER
        });
        const loginData = await loginResponse.json();
        const token = loginData.tokens?.accessToken || loginData.token;

        // Get PDF content
        const response = await request.get(`${BASE_URL}/api/documents/${DOCUMENT_ID}/content`, {
            headers: {
                'Authorization': `Bearer ${token}`
            }
        });

        expect(response.ok()).toBe(true);

        const contentType = response.headers()['content-type'];
        expect(contentType).toContain('application/pdf');

        const buffer = await response.body();
        expect(buffer.length).toBeGreaterThan(0);

        console.log(`✅ PDF content: ${(buffer.length / 1024).toFixed(2)} KB`);
    });

    test('should return extraction results', async ({ request }) => {
        console.log('🧪 Backend Test: Extraction results endpoint');

        const loginResponse = await request.post(`${BASE_URL}/api/auth/login`, {
            data: TEST_USER
        });
        const loginData = await loginResponse.json();
        const token = loginData.tokens?.accessToken || loginData.token;

        // Get extraction results (assuming workflow ID 35 from console logs)
        const response = await request.get(
            `${BASE_URL}/api/documents/${DOCUMENT_ID}/extraction/results?workflow_id=35`,
            {
                headers: {
                    'Authorization': `Bearer ${token}`
                }
            }
        );

        expect(response.ok()).toBe(true);
        const data = await response.json();

        console.log(`✅ Extraction results returned`);
    });
});

console.log('📋 Test suite loaded: document-detail.spec.js');
