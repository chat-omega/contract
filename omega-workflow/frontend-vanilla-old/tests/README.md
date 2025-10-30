# PDF Viewer Automated Tests

This directory contains Playwright tests for the PDF viewer functionality.

## Setup

1. **Install Playwright** (first time only):
   ```bash
   cd frontend-vanilla-old
   npm install
   npx playwright install chromium
   ```

2. **Ensure server is running**:
   ```bash
   npm run dev
   ```

## Running Tests

### Run all tests (headless):
```bash
npm test
```

### Run tests with visible browser:
```bash
npm run test:headed
```

### Run tests in debug mode:
```bash
npm run test:debug
```

### Run tests with UI mode:
```bash
npm run test:ui
```

### Run specific test file:
```bash
npx playwright test pdf-rendering.spec.js
```

## Test Coverage

### `pdf-rendering.spec.js`

1. **Container Dimensions Test**
   - Verifies PDF container has non-zero width/height
   - Checks reasonable dimensions (400x500+)

2. **Canvas Visibility Test**
   - Verifies canvas element is visible
   - Checks canvas not clipped by parent container

3. **PDF Content Rendering Test**
   - Takes screenshot to verify content rendered (not blank)

4. **PDF.js Library Load Test**
   - Verifies PDF.js library loaded
   - Checks worker configured

5. **Console Error Test**
   - Monitors console for PDF-related errors
   - Fails if render errors detected

6. **Scrolling Performance Test**
   - Tests smooth scrolling through pages
   - Verifies lazy loading (not all pages rendered)

7. **Navigation Buttons Test**
   - Tests prev/next page buttons
   - Verifies button states (disabled/enabled)

## Expected Results

All tests should **PASS** ✅

If tests fail:
- Check browser console logs (available in test output)
- Run `npm run test:headed` to see what's happening visually
- Check test screenshots in `test-results/` directory

## Troubleshooting

### Tests timeout waiting for PDF container
- Check if server is running on port 3000
- Check if PDF.js library is loading (network tab)
- Look for JavaScript errors in browser console

### Container width is 0
- This was the original bug!
- Verify `width: fit-content` removed from CSS
- Check `container.style.width` is set in JavaScript

### Canvas not visible
- Check CSS `overflow: hidden` not clipping canvas
- Verify canvas `position: absolute` in CSS
- Check container has explicit dimensions

## CI/CD Integration

To run tests in CI pipeline:
```bash
# Install dependencies
npm ci
npx playwright install --with-deps chromium

# Run tests
npm test
```

## Playwright MCP Integration

With Playwright MCP configured in Claude Code, the AI can:
- Navigate to pages
- Inspect DOM elements
- Run tests
- Take screenshots
- Debug failures

See `.claude/mcp.json` for MCP configuration.
