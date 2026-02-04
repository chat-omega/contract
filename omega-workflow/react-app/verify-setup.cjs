/**
 * React App Setup Verification Script
 * Checks environment readiness for Phase 1 testing
 */

const axios = require('axios');
const fs = require('fs');

const COLORS = {
  reset: '\x1b[0m',
  green: '\x1b[32m',
  red: '\x1b[31m',
  yellow: '\x1b[33m',
  blue: '\x1b[34m',
  cyan: '\x1b[36m',
};

const log = {
  success: (msg) => console.log(`${COLORS.green}✓${COLORS.reset} ${msg}`),
  error: (msg) => console.log(`${COLORS.red}✗${COLORS.reset} ${msg}`),
  warn: (msg) => console.log(`${COLORS.yellow}⚠${COLORS.reset} ${msg}`),
  info: (msg) => console.log(`${COLORS.blue}ℹ${COLORS.reset} ${msg}`),
  section: (msg) => console.log(`\n${COLORS.cyan}${msg}${COLORS.reset}`),
};

const checks = {
  passed: 0,
  failed: 0,
  warnings: 0,
};

async function checkEndpoint(name, url, expectedStatus = 200) {
  try {
    const response = await axios.get(url, { timeout: 5000 });
    if (response.status === expectedStatus) {
      log.success(`${name}: ${url}`);
      checks.passed++;
      return true;
    } else {
      log.error(`${name}: Unexpected status ${response.status}`);
      checks.failed++;
      return false;
    }
  } catch (error) {
    log.error(`${name}: ${error.message}`);
    checks.failed++;
    return false;
  }
}

async function checkFileExists(name, path) {
  if (fs.existsSync(path)) {
    log.success(`${name}: Found`);
    checks.passed++;
    return true;
  } else {
    log.error(`${name}: Not found at ${path}`);
    checks.failed++;
    return false;
  }
}

async function verifyEnvironment() {
  console.log('═'.repeat(60));
  console.log('  REACT APP SETUP VERIFICATION');
  console.log('═'.repeat(60));

  // Check services
  log.section('1. Service Availability');
  await checkEndpoint('Backend API', 'http://localhost:5001/api/health');
  await checkEndpoint('Vanilla JS App', 'http://localhost:3000');
  await checkEndpoint('React App', 'http://localhost:3001');

  // Check key files
  log.section('2. React App Files');
  await checkFileExists('DocumentsPage', './src/features/documents/DocumentsPage.tsx');
  await checkFileExists('UploadPage', './src/features/upload/UploadPage.tsx');
  await checkFileExists('App.tsx', './src/App.tsx');
  await checkFileExists('Testing Guide', './TESTING_GUIDE.md');

  // Check dependencies
  log.section('3. Dependencies');
  try {
    const pkg = require('./package.json');
    const deps = pkg.dependencies || {};

    const requiredDeps = [
      'react',
      'react-dom',
      'react-router-dom',
      'zustand',
      'axios',
      '@tanstack/react-query',
      'clsx',
      'tailwind-merge',
    ];

    requiredDeps.forEach((dep) => {
      if (deps[dep]) {
        log.success(`${dep}: v${deps[dep]}`);
        checks.passed++;
      } else {
        log.error(`${dep}: Missing`);
        checks.failed++;
      }
    });
  } catch (error) {
    log.error('package.json: Cannot read');
    checks.failed++;
  }

  // Check component implementations
  log.section('4. Component Implementation Status');
  try {
    const documentsPage = fs.readFileSync('./src/features/documents/DocumentsPage.tsx', 'utf8');

    const features = [
      { name: 'Table sorting', pattern: /handleSort|sortField/i },
      { name: 'Pagination', pattern: /pagination|rowsPerPage/i },
      { name: 'Selection', pattern: /toggleSelection|selectedDocuments/i },
      { name: 'Document service', pattern: /documentService\.getDocuments/i },
    ];

    features.forEach((feature) => {
      if (feature.pattern.test(documentsPage)) {
        log.success(`DocumentsPage - ${feature.name}: Implemented`);
        checks.passed++;
      } else {
        log.warn(`DocumentsPage - ${feature.name}: Not found`);
        checks.warnings++;
      }
    });
  } catch (error) {
    log.error('DocumentsPage: Cannot analyze');
    checks.failed++;
  }

  try {
    const uploadPage = fs.readFileSync('./src/features/upload/UploadPage.tsx', 'utf8');

    const features = [
      { name: 'Drag-drop', pattern: /handleDrag|onDrop/i },
      { name: 'File validation', pattern: /validateFile|MAX_FILE_SIZE/i },
      { name: 'Upload progress', pattern: /progress|uploadFile/i },
      { name: 'Document service upload', pattern: /documentService\.uploadDocument/i },
    ];

    features.forEach((feature) => {
      if (feature.pattern.test(uploadPage)) {
        log.success(`UploadPage - ${feature.name}: Implemented`);
        checks.passed++;
      } else {
        log.warn(`UploadPage - ${feature.name}: Not found`);
        checks.warnings++;
      }
    });
  } catch (error) {
    log.error('UploadPage: Cannot analyze');
    checks.failed++;
  }

  // Check routes
  log.section('5. Routing Configuration');
  try {
    const appTsx = fs.readFileSync('./src/App.tsx', 'utf8');

    const routes = [
      { name: '/login', pattern: /path="\/login"/i },
      { name: '/register', pattern: /path="\/register"/i },
      { name: '/ (dashboard)', pattern: /path="\/" element={<AppLayout|<Route index/i },
      { name: '/documents', pattern: /path="documents" element/i },
      { name: '/upload', pattern: /path="upload" element/i },
    ];

    routes.forEach((route) => {
      if (route.pattern.test(appTsx)) {
        log.success(`Route ${route.name}: Configured`);
        checks.passed++;
      } else {
        log.warn(`Route ${route.name}: Not found`);
        checks.warnings++;
      }
    });
  } catch (error) {
    log.error('App.tsx routing: Cannot analyze');
    checks.failed++;
  }

  // Summary
  console.log('\n' + '═'.repeat(60));
  log.section('VERIFICATION SUMMARY');
  console.log('═'.repeat(60));
  console.log(`${COLORS.green}Passed:${COLORS.reset} ${checks.passed}`);
  console.log(`${COLORS.red}Failed:${COLORS.reset} ${checks.failed}`);
  console.log(`${COLORS.yellow}Warnings:${COLORS.reset} ${checks.warnings}`);
  console.log('═'.repeat(60));

  if (checks.failed === 0) {
    log.success('\n✓ Environment ready for testing!');
    log.info('\nNext steps:');
    log.info('1. Review TESTING_GUIDE.md');
    log.info('2. Create test user account');
    log.info('3. Prepare test files (PDFs, DOCs, etc.)');
    log.info('4. Begin Phase 1 testing\n');
    return 0;
  } else {
    log.error('\n✗ Environment has issues. Please fix before testing.\n');
    return 1;
  }
}

// Run verification
verifyEnvironment()
  .then((exitCode) => process.exit(exitCode))
  .catch((error) => {
    console.error('Verification failed:', error);
    process.exit(1);
  });
