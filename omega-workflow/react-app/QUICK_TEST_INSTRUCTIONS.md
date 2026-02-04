# Quick Test Instructions - PDF Extraction Navigation

## TL;DR - How to Test in 60 Seconds

1. **Login to the app**
   - URL: https://app-react.omegaintelligence.ai
   - Credentials: `admin` / `admin123`

2. **Go to test document**
   - Navigate to: https://app-react.omegaintelligence.ai/documents/e37f9df8

3. **Open DevTools Console** (F12)

4. **Copy and paste this entire script into console:**

```javascript
// Quick Test - Copy from here to end
(async function() {
  const errors = [];
  const originalError = console.error;
  console.error = function(...args) {
    const msg = args.join(' ');
    if (msg.includes('RenderingCancelledException')) errors.push(msg);
    originalError.apply(console, args);
  };

  console.log('%c🔍 Starting PDF Extraction Test...', 'font-size: 14px; font-weight: bold');

  const extractions = Array.from(document.querySelectorAll('div.cursor-pointer')).filter(el => el.textContent.includes('Click to view'));
  console.log(`Found ${extractions.length} clickable extractions`);

  if (extractions.length === 0) {
    console.log('%c⚠️ No extractions found', 'color: orange');
    return;
  }

  const initialErrors = errors.length;

  // Click first 3 extractions
  for (let i = 0; i < Math.min(3, extractions.length); i++) {
    extractions[i].click();
    await new Promise(r => setTimeout(r, 1500));
  }

  // Rapid click test
  for (let i = 0; i < Math.min(5, extractions.length); i++) {
    extractions[i].click();
    await new Promise(r => setTimeout(r, 300));
  }

  await new Promise(r => setTimeout(r, 2000));

  const totalErrors = errors.length - initialErrors;

  console.log('%c========================================', 'color: #4F46E5; font-weight: bold');
  console.log(`%cRenderingCancelledException Count: ${totalErrors}`, 'font-size: 16px; font-weight: bold');

  if (totalErrors === 0) {
    console.log('%c✅ PERFECT - Zero errors!', 'color: #10B981; font-size: 18px; font-weight: bold');
  } else if (totalErrors <= 2) {
    console.log('%c✅ PASS - Acceptable (≤2 errors)', 'color: #10B981; font-size: 18px; font-weight: bold');
  } else if (totalErrors <= 5) {
    console.log('%c⚠️ WARNING - Elevated errors (3-5)', 'color: #F59E0B; font-size: 18px; font-weight: bold');
  } else {
    console.log('%c❌ FAIL - Too many errors (>5)', 'color: #EF4444; font-size: 18px; font-weight: bold');
  }

  console.log('%c========================================', 'color: #4F46E5; font-weight: bold');

  if (totalErrors > 0) {
    console.log('\nError details:');
    errors.forEach((e, i) => console.log(`${i+1}. ${e.substring(0, 100)}`));
  }

  console.error = originalError;
})();
```

5. **Read the result**
   - ✅ PERFECT = 0 errors (fix worked perfectly!)
   - ✅ PASS = 1-2 errors (fix worked, within acceptable range)
   - ⚠️ WARNING = 3-5 errors (fix helped but not enough)
   - ❌ FAIL = 6+ errors (fix didn't work)

---

## Expected Result

**Before Fix:** 10+ RenderingCancelledException errors
**After Fix:** 0-2 errors

---

## For More Detailed Testing

See the comprehensive manual test script:
- File: `/home/ubuntu/contract1/omega-workflow/react-app/MANUAL_TEST_SCRIPT.js`
- Full report: `PDF_EXTRACTION_TEST_REPORT.md`

---

## What If I See Errors?

1. **Check if new bundle is loaded**
   - Look for `index-BfEj4K-J.js` in DevTools > Network tab

2. **Clear cache and reload**
   - Ctrl+Shift+R (hard reload)

3. **Verify you're on production**
   - URL should be `app-react.omegaintelligence.ai`

4. **Report results**
   - Copy console output
   - Take screenshot
   - Share error count
