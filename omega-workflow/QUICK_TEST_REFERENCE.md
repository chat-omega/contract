# Quick Test Reference - PDF Navigation Fix

## Current Status
✅ **Built:** Successfully compiled
✅ **Deployed:** Container running on port 8081
⏳ **Testing:** Manual verification needed

---

## Quick Access

```bash
# Frontend URL
http://localhost:8081/

# Login Credentials
Username: admin
Password: admin123

# Test Document
Document ID: e37f9df8
Name: BuzzFeed Agreement.pdf
Fields: 14
Extractions: 57 total
```

---

## 5-Minute Quick Test

### Step 1: Login (30 seconds)
1. Go to http://localhost:8081/
2. Login with admin/admin123
3. Navigate to Documents

### Step 2: Load Document (30 seconds)
1. Click "BuzzFeed Agreement.pdf"
2. Wait for PDF to load on left
3. Wait for extraction panel on right

### Step 3: Test Extraction Click (1 minute)
1. Expand "Parties" field (33 extractions)
2. Click extraction #5
3. **VERIFY:**
   - ✅ PDF navigates to correct page
   - ✅ Yellow highlight appears
   - ✅ PDF does NOT jump back to page 1

### Step 4: Test Multiple Clicks (2 minutes)
1. Click extraction on page 1
2. Click extraction on page 50
3. Click extraction on page 100
4. **VERIFY:**
   - ✅ Each navigation works
   - ✅ No page jumping
   - ✅ Highlights appear

### Step 5: Check Console (1 minute)
1. Open DevTools (F12)
2. Click an extraction
3. **LOOK FOR:**
   - ✅ "[ExtractionPanel] Extraction clicked"
   - ✅ "[DocumentDetailPage] handleExtractionClick CALLED"
   - ✅ "[PDFViewer] Page X found - jumping directly"
   - ❌ No errors

---

## What Changed

### Files Modified
- `PDFViewer.tsx` - Fixed scroll effect
- `DocumentDetailPage.tsx` - Fixed useCallback
- `ExtractionPanel.tsx` - Click handler

### Key Improvements
1. ✅ Proper state management
2. ✅ Direct page navigation
3. ✅ Fixed dependency arrays
4. ✅ Better error handling
5. ✅ Diagnostic logging

---

## Expected Behavior

### BEFORE (Bug)
❌ Click extraction → Navigate → Jump back to page 1
❌ Inconsistent highlighting
❌ Multiple re-renders

### AFTER (Fixed)
✅ Click extraction → Navigate → Stay on correct page
✅ Highlight appears correctly
✅ Smooth navigation

---

## Container Commands

```bash
# Check status
docker ps | grep omega-frontend-react

# View logs
docker logs omega-frontend-react

# Restart if needed
docker-compose restart frontend-react

# Rebuild if needed
docker-compose build --no-cache frontend-react
docker-compose up -d frontend-react
```

---

## Troubleshooting

### Issue: Container not running
```bash
docker-compose up -d frontend-react
```

### Issue: Old code cached
```bash
# Hard reload in browser: Ctrl+Shift+R (Chrome) or Cmd+Shift+R (Mac)
```

### Issue: Can't login
```bash
# Check backend
docker logs omega-backend-fastapi | tail -20
```

### Issue: PDF not loading
```bash
# Check browser console (F12)
# Look for network errors
```

---

## Success Criteria

### Must Pass ✅
- [ ] PDF navigates to correct page on click
- [ ] Highlights appear on extracted text
- [ ] No jumping back to page 1
- [ ] No console errors
- [ ] Works for all extractions

### Nice to Have ✅
- [ ] Fast navigation (<1 second)
- [ ] Smooth scrolling
- [ ] Clear diagnostic logs
- [ ] Works at different zoom levels

---

## Report Issues

If you find problems:

1. **Capture Console Logs**
   - F12 → Console tab
   - Screenshot any errors

2. **Note the Details**
   - Which extraction clicked?
   - What page did it go to?
   - What page should it be?

3. **Check Network Tab**
   - F12 → Network tab
   - Look for failed API calls

4. **Share Screenshots**
   - The extraction panel
   - The PDF viewer
   - The console logs

---

## Full Documentation

For complete details, see:
- `PHASE3_BUILD_AND_TEST_REPORT.md` - Comprehensive test report
- Test results: `react-app/test-results/`
- Build logs: Above

---

**Last Updated:** November 24, 2025
**Version:** 1.0
**Status:** Ready for Testing
