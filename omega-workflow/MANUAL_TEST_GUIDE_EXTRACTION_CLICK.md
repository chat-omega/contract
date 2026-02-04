# Manual Test Guide - Extraction Click Navigation Fix

**Date**: November 24, 2025
**Fix Deployed**: ✅ YES (Bundle: index-DK37mx15.js)
**Environment**: Local (http://localhost:8081) & Production (http://app-react.omegaintelligence.ai)

---

## Quick Test Steps

### 1. Clear Browser Cache 🔄
**THIS IS CRITICAL - You must load the new bundle!**

- **Windows/Linux**: `Ctrl + Shift + R`
- **Mac**: `Cmd + Shift + R`
- **Alternative**: Open in Incognito/Private mode

### 2. Open Browser Console 🛠️
Press `F12` or right-click → Inspect → Console tab

### 3. Navigate to a Document with Extractions
Example documents that should have extractions:
- Credit Agreement document
- Any document with a workflow assigned and extractions complete

### 4. Click an Extraction Result
Click on any extraction in the right-side panel

---

## Expected Behavior ✅

### Visual:
1. PDF scrolls to the correct page instantly
2. Page is centered in the viewport
3. Blue highlight box appears around the extraction
4. Toast notification appears: "Viewing extraction on page X"

### Console Logs (in order):
```
[ExtractionPanel] 🖱️ Extraction clicked: {
  fieldId: "...",
  idx: 0,
  canNavigate: true,
  ...
}

[ExtractionPanel] ✅ Calling onExtractionClick...

[ExtractionPanel] ✅ onExtractionClick call completed

[DocumentDetailPage] ✅ handleExtractionClick CALLED: {
  fieldId: "...",
  extractionIndex: 0,
  page: 5,
  bbox: [...]
}

[PDFViewer] 📜 Scroll effect triggered: {
  scrollToPage: 5,
  ...
}

[PDFViewer] ✅ Page 5 found - jumping directly...

[PDFViewer] ✅ Jump to page 5 completed successfully
```

---

## What to Check

### ✅ Success Indicators:
- [ ] All console logs appear in correct order
- [ ] PDF scrolls to correct page
- [ ] Highlight appears on the extraction
- [ ] Toast notification shows
- [ ] Bundle `index-DK37mx15.js` loaded (check Network tab)

### ❌ Failure Indicators:
- [ ] No console logs appear (old bundle - clear cache!)
- [ ] `canNavigate: false` in logs (data issue)
- [ ] `❌ NAVIGATION BLOCKED` error (missing bbox or page)
- [ ] Logs stop at ExtractionPanel (prop chain broken)
- [ ] PDF doesn't scroll (scroll effect issue)

---

## Troubleshooting

### Issue: No console logs appear
**Cause**: Old bundle still cached
**Solution**:
1. Hard refresh (`Ctrl+Shift+R`)
2. Open Network tab
3. Look for `index-DK37mx15.js` (should be ~423 KB)
4. If you see a different bundle, clear ALL browser cache
5. Try incognito mode

### Issue: "NAVIGATION BLOCKED" errors
**Cause**: Extraction data missing bbox or page number
**Solution**:
1. Check the error details in console
2. Verify extraction has bbox data in API response
3. Try a different extraction
4. May need to re-run extraction for this document

### Issue: Logs stop at "[DocumentDetailPage] ✅ handleExtractionClick CALLED"
**Cause**: State update not triggering PDFViewer effect
**Solution**:
1. This is a real bug - report it
2. Check React DevTools for state values
3. Verify scrollToPage state changes

### Issue: Logs show "Scroll skipped"
**Cause**: PDF still loading or container missing
**Solution**:
1. Wait for PDF to fully load
2. Check the `reason` field in the skip log
3. Retry clicking after PDF loads completely

---

## Test Scenarios

### Scenario 1: Basic Click Navigation
**Steps**:
1. Navigate to document with extractions
2. Click first extraction in list
3. Verify PDF scrolls to correct page
4. Verify highlight appears

**Expected**: ✅ All working

### Scenario 2: Multiple Extractions on Same Page
**Steps**:
1. Find field with multiple extractions on same page
2. Click first extraction
3. Click second extraction
4. Verify highlights switch correctly

**Expected**: ✅ Highlights update, page stays same

### Scenario 3: Extractions on Different Pages
**Steps**:
1. Click extraction on page 5
2. Click extraction on page 10
3. Click extraction on page 2
4. Verify PDF scrolls to each page

**Expected**: ✅ PDF scrolls to correct page each time

### Scenario 4: Rapid Clicking
**Steps**:
1. Click multiple extractions quickly
2. Verify navigation still works
3. Check for errors in console

**Expected**: ✅ No errors, last click wins

### Scenario 5: Extraction Without Page Number
**Steps**:
1. Find extraction without page data (if any)
2. Click it
3. Check console for error

**Expected**: ⚠️ "NAVIGATION BLOCKED: No page number" warning

---

## Test Results Template

```markdown
## Test Results - [Your Name] - [Date/Time]

### Environment:
- [ ] Local (http://localhost:8081)
- [ ] Production (http://app-react.omegaintelligence.ai)

### Browser:
- [ ] Chrome
- [ ] Firefox
- [ ] Safari
- [ ] Edge

### Bundle Verification:
- Bundle loaded: ________________
- Bundle size: ________________
- Hard refresh done: [ ] Yes [ ] No

### Test Scenario Results:

#### Scenario 1: Basic Click Navigation
- Status: [ ] ✅ Pass [ ] ❌ Fail
- Notes: ___________________________

#### Scenario 2: Multiple Extractions Same Page
- Status: [ ] ✅ Pass [ ] ❌ Fail
- Notes: ___________________________

#### Scenario 3: Extractions Different Pages
- Status: [ ] ✅ Pass [ ] ❌ Fail
- Notes: ___________________________

#### Scenario 4: Rapid Clicking
- Status: [ ] ✅ Pass [ ] ❌ Fail
- Notes: ___________________________

### Console Logs:
[Paste relevant console logs here]

### Issues Found:
[Describe any issues]

### Overall Result:
[ ] ✅ All tests passed
[ ] ⚠️ Some issues (describe above)
[ ] ❌ Major failures (describe above)
```

---

## Success Criteria

For the fix to be considered successful:

- ✅ New bundle (`index-DK37mx15.js`) loads in browser
- ✅ All diagnostic logs appear in console when clicking
- ✅ PDF scrolls to correct page 90%+ of the time
- ✅ Highlights appear correctly
- ✅ No React errors or crashes
- ✅ Toast notifications work
- ✅ Works across multiple browsers

---

## Report Issues

If testing fails, please provide:
1. Full console log output (from clicking to completion)
2. Browser and version
3. Document ID and extraction details
4. Screenshot of the issue
5. Which test scenario failed

Share this information with the development team for investigation.

---

## Technical Details

### Code Changes Summary:
1. **useCallback Memoization**: Wrapped `handleExtractionClick` and `handleFieldClick` in `useCallback` for stable function references
2. **Enhanced Logging**: Added comprehensive diagnostic logs with emojis throughout navigation chain
3. **Handler Initialization Diagnostic**: Added useEffect to verify handlers are properly set up

### Files Modified:
- `DocumentDetailPage.tsx` (lines 307-365)
- `ExtractionPanel.tsx` (lines 260-304)
- `PDFViewer.tsx` (lines 1095-1151)

### Deployment:
- Build: Successful (Vite 7.2.2)
- Bundle: `index-DK37mx15.js` (422.9 KB)
- Container: `omega-frontend-react` (rebuilt & redeployed)
- Timestamp: November 24, 2025 04:45 UTC

---

**Ready for Testing**: ✅ YES
**Documentation**: See `EXTRACTION_CLICK_FIX_DEPLOYED.md` for full technical details
