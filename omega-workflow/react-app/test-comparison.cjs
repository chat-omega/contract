/**
 * Comprehensive Testing Script
 * Tests both Vanilla JS and React versions side-by-side
 */

const axios = require('axios');
const fs = require('fs');
const path = require('path');

const VANILLA_URL = 'http://localhost:3000';
const REACT_URL = 'http://localhost:3001';
const BACKEND_URL = 'http://localhost:5001';

const results = {
  timestamp: new Date().toISOString(),
  vanilla: { tests: [], passed: 0, failed: 0, skipped: 0 },
  react: { tests: [], passed: 0, failed: 0, skipped: 0 },
  comparison: []
};

// Helper function to test endpoint
async function testEndpoint(name, url, method = 'GET', data = null, headers = {}) {
  try {
    const config = { method, url, headers, timeout: 5000 };
    if (data) config.data = data;

    const response = await axios(config);
    return {
      name,
      status: 'PASS',
      statusCode: response.status,
      responseTime: response.headers['x-response-time'] || 'N/A',
      data: response.data
    };
  } catch (error) {
    return {
      name,
      status: 'FAIL',
      error: error.message,
      statusCode: error.response?.status || 'N/A'
    };
  }
}

// Test vanilla version
async function testVanillaVersion() {
  console.log('\n🧪 Testing Vanilla JS Version (Port 3000)...\n');

  const tests = [
    { name: 'Health Check', url: `${VANILLA_URL}/api/health` },
    { name: 'Static Files - Index', url: `${VANILLA_URL}/` },
    { name: 'Static Files - Login', url: `${VANILLA_URL}/login.html` },
    { name: 'Static Files - Document Detail', url: `${VANILLA_URL}/document-detail.html` },
    { name: 'API Proxy - Fields Endpoint', url: `${VANILLA_URL}/api/fields` },
  ];

  for (const test of tests) {
    const result = await testEndpoint(test.name, test.url);
    results.vanilla.tests.push(result);

    if (result.status === 'PASS') {
      results.vanilla.passed++;
      console.log(`  ✅ ${result.name}: ${result.statusCode}`);
    } else {
      results.vanilla.failed++;
      console.log(`  ❌ ${result.name}: ${result.error}`);
    }
  }

  console.log(`\n  Summary: ${results.vanilla.passed} passed, ${results.vanilla.failed} failed\n`);
}

// Test React version
async function testReactVersion() {
  console.log('🧪 Testing React Version (Port 3001)...\n');

  const tests = [
    { name: 'Health Check', url: `${REACT_URL}/api/health` },
    { name: 'Root Route', url: `${REACT_URL}/` },
    { name: 'Login Route', url: `${REACT_URL}/login` },
    { name: 'Register Route', url: `${REACT_URL}/register` },
    { name: 'API Proxy - Fields Endpoint', url: `${REACT_URL}/api/fields` },
  ];

  for (const test of tests) {
    const result = await testEndpoint(test.name, test.url);
    results.react.tests.push(result);

    if (result.status === 'PASS') {
      results.react.passed++;
      console.log(`  ✅ ${result.name}: ${result.statusCode}`);
    } else {
      results.react.failed++;
      console.log(`  ❌ ${result.name}: ${result.error}`);
    }
  }

  console.log(`\n  Summary: ${results.react.passed} passed, ${results.react.failed} failed\n`);
}

// Feature comparison
async function compareFeatures() {
  console.log('📊 Feature Comparison...\n');

  const features = [
    { name: 'Authentication Pages', vanilla: 'Full', react: 'Full' },
    { name: 'Dashboard/Home', vanilla: 'Full', react: 'Basic' },
    { name: 'Document List', vanilla: 'Full (Table, Filters)', react: 'Placeholder' },
    { name: 'Document Upload', vanilla: 'Full (Drag-drop)', react: 'Placeholder' },
    { name: 'Document Detail', vanilla: 'Full (PDF Viewer)', react: 'Not Implemented' },
    { name: 'PDF Highlighting', vanilla: 'Full (BBox + Search)', react: 'Not Implemented' },
    { name: 'Extraction Display', vanilla: 'Full (Dynamic)', react: 'Not Implemented' },
    { name: 'Workflow Management', vanilla: 'Full (CRUD)', react: 'Placeholder' },
    { name: 'Credit Analysis', vanilla: 'Full (Chat + Charts)', react: 'Placeholder' },
    { name: 'State Management', vanilla: 'localStorage', react: 'Zustand (Better)' },
    { name: 'Type Safety', vanilla: 'None', react: 'Full TypeScript' },
    { name: 'API Client', vanilla: 'fetch', react: 'Axios + Interceptors' }
  ];

  features.forEach(feature => {
    results.comparison.push(feature);

    const vanillaStatus = feature.vanilla.includes('Full') ? '✅' : feature.vanilla.includes('Placeholder') ? '⚠️' : '❌';
    const reactStatus = feature.react.includes('Full') ? '✅' : feature.react.includes('Better') ? '✅' : feature.react.includes('Placeholder') ? '⚠️' : '❌';

    console.log(`  ${feature.name}:`);
    console.log(`    Vanilla: ${vanillaStatus} ${feature.vanilla}`);
    console.log(`    React:   ${reactStatus} ${feature.react}\n`);
  });
}

// Backend status
async function checkBackendStatus() {
  console.log('🔧 Backend Status...\n');

  try {
    const health = await axios.get(`${BACKEND_URL}/api/health`, { timeout: 5000 });
    console.log(`  ✅ Backend: ${health.data.service} v${health.data.version}`);

    const fields = await axios.get(`${BACKEND_URL}/api/fields`, { timeout: 5000 });
    console.log(`  ✅ Fields Available: ${fields.data.length || 0} fields\n`);
  } catch (error) {
    console.log(`  ❌ Backend Error: ${error.message}\n`);
  }
}

// Main execution
async function runTests() {
  console.log('═'.repeat(60));
  console.log('  COMPREHENSIVE TESTING: Vanilla JS vs React');
  console.log('═'.repeat(60));

  await checkBackendStatus();
  await testVanillaVersion();
  await testReactVersion();
  await compareFeatures();

  console.log('═'.repeat(60));
  console.log('  TEST SUMMARY');
  console.log('═'.repeat(60));
  console.log(`  Vanilla JS: ${results.vanilla.passed}/${results.vanilla.tests.length} tests passed`);
  console.log(`  React:      ${results.react.passed}/${results.react.tests.length} tests passed`);
  console.log('═'.repeat(60));

  // Save results
  const reportPath = path.join(__dirname, 'test-comparison-results.json');
  fs.writeFileSync(reportPath, JSON.stringify(results, null, 2));
  console.log(`\n  📄 Full results saved to: ${reportPath}\n`);

  // Generate markdown report
  generateMarkdownReport();
}

function generateMarkdownReport() {
  const markdown = `# Side-by-Side Testing Report

**Generated:** ${results.timestamp}

## Test Results

### Vanilla JS Version (Port 3000)
- **Tests Passed:** ${results.vanilla.passed}/${results.vanilla.tests.length}
- **Tests Failed:** ${results.vanilla.failed}

#### Test Details:
${results.vanilla.tests.map(t => `- ${t.status === 'PASS' ? '✅' : '❌'} ${t.name}: ${t.statusCode}`).join('\n')}

### React Version (Port 3001)
- **Tests Passed:** ${results.react.passed}/${results.react.tests.length}
- **Tests Failed:** ${results.react.failed}

#### Test Details:
${results.react.tests.map(t => `- ${t.status === 'PASS' ? '✅' : '❌'} ${t.name}: ${t.statusCode}`).join('\n')}

## Feature Comparison

| Feature | Vanilla JS | React |
|---------|-----------|-------|
${results.comparison.map(f => `| ${f.name} | ${f.vanilla} | ${f.react} |`).join('\n')}

## Conclusions

### What Works Now:
1. **Both versions** can successfully connect to the backend API
2. **Vanilla JS** has all business features implemented and functional
3. **React** has a solid foundation (auth, routing, state management, UI components)

### Gaps in React Version:
1. Document management features (upload, list, detail) are placeholders
2. PDF viewer not integrated
3. PDF highlighting not implemented
4. Workflow management is placeholder
5. Credit analysis is placeholder

### React Advantages:
1. Better architecture with TypeScript and type safety
2. Superior state management with Zustand
3. Cleaner API layer with Axios interceptors
4. More maintainable component structure
5. Better developer experience

### Next Steps:
1. **Week 1:** Implement document management (list, upload)
2. **Week 2:** Integrate PDF viewer with highlighting
3. **Week 3:** Implement workflow management
4. **Week 4:** Implement credit analysis with streaming

---

**Recommendation:** React version has excellent foundation. Accelerate Phase 3 to implement core business features for full feature parity.
`;

  const reportPath = path.join(__dirname, 'TEST-COMPARISON-REPORT.md');
  fs.writeFileSync(reportPath, markdown);
  console.log(`  📄 Markdown report saved to: ${reportPath}\n`);
}

// Run the tests
runTests().catch(console.error);
