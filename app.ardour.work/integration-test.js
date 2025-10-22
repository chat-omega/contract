// Integration test for portfolio data
const fs = require('fs');
const path = require('path');

console.log('=== Integration Test: Portfolio Default Change ===\n');

let testsPassed = 0;
let testsFailed = 0;

function test(name, fn) {
  try {
    fn();
    console.log(`✅ PASS: ${name}`);
    testsPassed++;
  } catch (error) {
    console.log(`❌ FAIL: ${name}`);
    console.log(`   Error: ${error.message}`);
    testsFailed++;
  }
}

function assertEquals(actual, expected, message) {
  if (actual !== expected) {
    throw new Error(`${message || 'Assertion failed'}: expected ${expected}, got ${actual}`);
  }
}

function assertContains(text, substring, message) {
  if (!text.includes(substring)) {
    throw new Error(`${message || 'Assertion failed'}: expected text to contain "${substring}"`);
  }
}

// Test 1: Check generated_portfolio_data.ts
const portfolioDataPath = path.join(__dirname, 'src', 'generated_portfolio_data.ts');
const portfolioContent = fs.readFileSync(portfolioDataPath, 'utf-8');

test('Portfolio data file exists', () => {
  assertEquals(fs.existsSync(portfolioDataPath), true, 'Portfolio data file should exist');
});

test('allPortfolios array has megadelta as first element', () => {
  const match = portfolioContent.match(/export const allPortfolios[^=]*=\s*\[\s*([^\]]+)\]/);
  if (!match) throw new Error('Could not find allPortfolios array');

  const portfolios = match[1].split(',').map(p => p.trim()).filter(p => p);
  assertEquals(portfolios[0], 'megadelta_capital_portfolio', 'First portfolio should be megadelta_capital_portfolio');
});

test('allPortfolios array has DST in 4th position', () => {
  const match = portfolioContent.match(/export const allPortfolios[^=]*=\s*\[\s*([^\]]+)\]/);
  if (!match) throw new Error('Could not find allPortfolios array');

  const portfolios = match[1].split(',').map(p => p.trim()).filter(p => p);
  assertEquals(portfolios[3], 'dst_global_portfolio', 'Fourth portfolio should be dst_global_portfolio');
});

test('allPortfolios array has 6 portfolios', () => {
  const match = portfolioContent.match(/export const allPortfolios[^=]*=\s*\[\s*([^\]]+)\]/);
  if (!match) throw new Error('Could not find allPortfolios array');

  const portfolios = match[1].split(',').map(p => p.trim()).filter(p => p);
  assertEquals(portfolios.length, 6, 'Should have exactly 6 portfolios');
});

// Test 2: Check index.html
const indexPath = path.join(__dirname, 'index.html');
const indexContent = fs.readFileSync(indexPath, 'utf-8');

test('HTML title references Ardour', () => {
  assertContains(indexContent, 'Ardour', 'HTML title should contain Ardour');
});

test('HTML title shows Ardour branding', () => {
  const titleMatch = indexContent.match(/<title>([^<]+)<\/title>/);
  if (!titleMatch) throw new Error('Could not find title tag');

  const title = titleMatch[1];
  assertEquals(title.includes('Ardour'), true,
    'Title should contain Ardour branding');
});

// Test 3: Check DashboardPage.tsx
const dashboardPath = path.join(__dirname, 'src', 'pages', 'DashboardPage.tsx');
const dashboardContent = fs.readFileSync(dashboardPath, 'utf-8');

test('DashboardPage uses allPortfolios[0] as default', () => {
  assertContains(dashboardContent, 'allPortfolios[0]', 'Should use allPortfolios[0] as default');
});

test('DashboardPage subtitle is dynamic', () => {
  assertContains(dashboardContent, 'selectedPortfolio?.name',
    'Subtitle should dynamically display selected portfolio name');
});

// Test 4: Verify frontend/src also has the changes
const frontendPortfolioPath = path.join(__dirname, 'frontend', 'src', 'generated_portfolio_data.ts');
if (fs.existsSync(frontendPortfolioPath)) {
  const frontendPortfolioContent = fs.readFileSync(frontendPortfolioPath, 'utf-8');

  test('Frontend portfolio data has megadelta as first element', () => {
    const match = frontendPortfolioContent.match(/export const allPortfolios[^=]*=\s*\[\s*([^\]]+)\]/);
    if (!match) throw new Error('Could not find allPortfolios array in frontend');

    const portfolios = match[1].split(',').map(p => p.trim()).filter(p => p);
    assertEquals(portfolios[0], 'megadelta_capital_portfolio',
      'First portfolio in frontend should be megadelta_capital_portfolio');
  });
}

// Summary
console.log('\n=== Test Summary ===');
console.log(`Tests Passed: ${testsPassed}`);
console.log(`Tests Failed: ${testsFailed}`);
console.log(`Total Tests: ${testsPassed + testsFailed}`);

if (testsFailed === 0) {
  console.log('\n🎉 All tests passed! Ardour branding is properly configured.');
  process.exit(0);
} else {
  console.log('\n⚠️  Some tests failed. Please review the errors above.');
  process.exit(1);
}
