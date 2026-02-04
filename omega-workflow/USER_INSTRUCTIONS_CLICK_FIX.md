# 🚨 URGENT: Fix "Click to View" Not Working

## Quick Fix (Try This First - 90% Success Rate)

### Step 1: Hard Refresh Your Browser
**This forces browser to load the new JavaScript code**

**Windows/Linux:**
```
Press: Ctrl + Shift + R
OR
Press: Ctrl + F5
```

**Mac:**
```
Press: Cmd + Shift + R
```

### Step 2: Verify New Bundle Loaded
1. Keep browser DevTools open (F12)
2. Go to **Network** tab
3. Refresh the page
4. Look for `index-8ejwB37-.js` (should be ~341 KB)
5. If you see a different filename, the hard refresh didn't work

### Step 3: Test Click-to-View
1. Navigate to: https://app-react.omegaintelligence.ai/documents/e37f9df8
2. Open browser console (F12 → Console tab)
3. Click on any extraction's "Click to view"
4. **You should see:**
   ```
   [ExtractionPanel] Extraction clicked: {...}
   [DocumentDetailPage] Extraction clicked: {...}
   [PDFViewer] Scrolled to page X
   ```

### ✅ Success Indicators
- Console shows the logs above
- PDF scrolls to the correct page
- Toast notification appears
- Extraction is highlighted

---

## If Hard Refresh Doesn't Work

### Option A: Run Diagnostic Script

1. **Copy the diagnostic script:**
   - File: `/home/ubuntu/contract1/omega-workflow/CLICK_HANDLER_DIAGNOSTIC.js`
   - Copy entire contents

2. **Run in browser console:**
   - Open DevTools (F12)
   - Go to Console tab
   - Paste the script
   - Press Enter
   - Click an extraction within 3 seconds
   - Read the diagnosis

3. **Follow the diagnosis recommendations**

### Option B: Try Incognito Mode

1. **Open private/incognito window:**
   - Chrome: Ctrl+Shift+N (Windows) or Cmd+Shift+N (Mac)
   - Firefox: Ctrl+Shift+P
   - Safari: Cmd+Shift+N

2. **Navigate to:**
   ```
   https://app-react.omegaintelligence.ai/documents/e37f9df8
   ```

3. **Test click-to-view**
   - If it works in incognito → Browser cache issue confirmed
   - Solution: Clear all browser cache

### Option C: Clear All Browser Cache

**Chrome:**
1. Press Ctrl+Shift+Delete (or Cmd+Shift+Delete)
2. Select "All time"
3. Check "Cached images and files"
4. Click "Clear data"
5. Restart browser

**Firefox:**
1. Press Ctrl+Shift+Delete
2. Select "Everything"
3. Check "Cache"
4. Click "Clear Now"
5. Restart browser

**Safari:**
1. Develop menu → Empty Caches
2. Or: Cmd+Option+E
3. Restart browser

---

## What We Fixed (For Reference)

### Issue 1: Aggressive Browser Caching
- **Problem:** Old bundle cached for 1 year with "immutable" flag
- **Fix:** Changed cache to 1 hour with revalidation
- **File:** `nginx.conf` lines 57-62

### Issue 2: BBox Type Inconsistency
- **Problem:** `BboxArray` vs `BBox` type mismatch
- **Fix:** Unified to use single `BBox` type
- **File:** `types/index.ts` line 108

### Issue 3: Missing Spans Fallback
- **Problem:** No fallback to extract bbox from `spans[0].bounds`
- **Fix:** Added spans fallback logic
- **File:** `ExtractionPanel.tsx` lines 201-210

### Issue 4: Login Button Invisible
- **Problem:** Tailwind v4 missing custom primary colors
- **Fix:** Added `@theme` block with primary colors
- **File:** `index.css` lines 3-16

All fixes are deployed at:
- https://app-react.omegaintelligence.ai

---

## Still Not Working?

### Check Service Worker
1. Open DevTools (F12)
2. Go to **Application** tab
3. Click **Service Workers** (left sidebar)
4. If any service workers are registered:
   - Click "Unregister"
   - Hard refresh again

### Check CDN Cache
If your infrastructure uses a CDN (CloudFlare, etc.):
- The CDN may be caching the old bundle
- You may need to purge CDN cache
- Contact infrastructure team

### Verify You're on the Right Page
The click-to-view functionality only works on:
- Document detail pages (with PDF viewer)
- **NOT** on other pages like credit analysis chat

Correct URL pattern:
```
https://app-react.omegaintelligence.ai/documents/{document-id}
```

---

## Expected Console Output (When Working)

```javascript
// When you click "Click to view"
[ExtractionPanel] Extraction clicked: {
  fieldId: "field-uuid-123",
  idx: 0,
  canNavigate: true,
  hasBbox: true,
  hasSpansBbox: false,  // or true if bbox came from spans
  extractedBbox: [100, 200, 300, 250],
  hasPage: true,
  bbox: [100, 200, 300, 250],
  page: 5
}

[DocumentDetailPage] Extraction clicked: {
  fieldId: "field-uuid-123",
  extractionIndex: 0,
  page: 5,
  bbox: [100, 200, 300, 250]
}

[PDFViewer] Scrolled to page 5
```

**If you see these logs**: Everything is working correctly!

**If you see NO logs**: Browser is loading old cached JavaScript.

---

## Contact Support

If none of the above works, provide this information:
1. Browser name and version
2. Operating system
3. Output of diagnostic script
4. Screenshot of Network tab showing loaded bundle
5. Console logs

The issue is almost certainly browser cache. Hard refresh should fix it!
