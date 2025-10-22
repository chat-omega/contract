// Production Deployment Verification
const https = require('https');
const http = require('http');

console.log('=== Production Deployment Verification ===\n');

let testsPassed = 0;
let testsFailed = 0;

function test(name, fn) {
  return fn()
    .then(() => {
      console.log(`✅ PASS: ${name}`);
      testsPassed++;
    })
    .catch(error => {
      console.log(`❌ FAIL: ${name}`);
      console.log(`   Error: ${error.message}`);
      testsFailed++;
    });
}

function httpsGet(url) {
  return new Promise((resolve, reject) => {
    https.get(url, { rejectUnauthorized: false }, (res) => {
      let data = '';
      res.on('data', chunk => data += chunk);
      res.on('end', () => resolve(data));
    }).on('error', reject);
  });
}

function httpGet(url) {
  return new Promise((resolve, reject) => {
    http.get(url, (res) => {
      let data = '';
      res.on('data', chunk => data += chunk);
      res.on('end', () => resolve(data));
    }).on('error', reject);
  });
}

async function runTests() {
  // Test 1: HTTPS site is accessible
  await test('Production site is accessible via HTTPS', async () => {
    const html = await httpsGet('https://app.ardour.work/');
    if (!html || html.length === 0) {
      throw new Error('No content received');
    }
  });

  // Test 2: Title shows Ardour branding
  await test('Page title shows "Ardour | Strategic Value Creation"', async () => {
    const html = await httpsGet('https://app.ardour.work/');
    if (!html.includes('<title>Ardour | Strategic Value Creation</title>')) {
      throw new Error('Title does not contain "Ardour | Strategic Value Creation"');
    }
  });

  // Test 3: Title shows Ardour branding
  await test('Page title contains Ardour branding', async () => {
    const html = await httpsGet('https://app.ardour.work/');
    const titleMatch = html.match(/<title>([^<]+)<\/title>/);
    if (!titleMatch) {
      throw new Error('No title tag found');
    }
    const title = titleMatch[1];
    if (!title.includes('Ardour')) {
      throw new Error(`Title does not contain Ardour branding: ${title}`);
    }
  });

  // Test 4: Dashboard route is accessible
  await test('Dashboard route is accessible', async () => {
    const html = await httpsGet('https://app.ardour.work/dashboard');
    if (!html || html.length === 0) {
      throw new Error('Dashboard route not accessible');
    }
  });

  // Test 5: JavaScript bundle is being served
  await test('JavaScript application bundle is being served', async () => {
    const html = await httpsGet('https://app.ardour.work/');
    if (!html.includes('.js')) {
      throw new Error('No JavaScript bundle found in HTML');
    }
  });

  // Summary
  console.log('\n=== Verification Summary ===');
  console.log(`Tests Passed: ${testsPassed}`);
  console.log(`Tests Failed: ${testsFailed}`);
  console.log(`Total Tests: ${testsPassed + testsFailed}`);

  if (testsFailed === 0) {
    console.log('\n🎉 Production deployment successful!');
    console.log('✅ https://app.ardour.work is now showing Ardour branding.');
    process.exit(0);
  } else {
    console.log('\n⚠️  Some verification tests failed.');
    process.exit(1);
  }
}

runTests().catch(err => {
  console.error('Test suite failed:', err);
  process.exit(1);
});
