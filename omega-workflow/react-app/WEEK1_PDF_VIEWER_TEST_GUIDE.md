# Week 1 PDF Viewer Manual Test Guide

## Overview
This guide provides step-by-step testing procedures for the React PDF viewer implementation, focusing on the Y-axis coordinate transformation fix and click-to-highlight functionality.

**Testing Duration:** 1-2 hours
**Prerequisites:** Backend running, at least one document with extraction data

---

## Test Environment Setup

### 1. Start All Services
```bash
# Terminal 1: Backend API
cd /home/ubuntu/contract1/omega-workflow
docker-compose up

# Terminal 2: React Frontend
cd /home/ubuntu/contract1/omega-workflow/react-app
npm run dev

# Terminal 3: Vanilla JS Frontend (for comparison)
cd /home/ubuntu/contract1/omega-workflow/frontend-vanilla-old
npm start
```

### 2. Access Applications
- **React App:** http://localhost:3003
- **Vanilla JS App:** http://localhost:3000
- **Backend API:** http://localhost:5001

### 3. Prepare Test Data
- Upload a multi-page PDF document (at least 5 pages recommended)
- Assign a workflow and run extraction
- Ensure extractions have bbox coordinates and page numbers
- Note: Use a document with known extraction positions for validation

---

## Test Suite A: PDF Rendering & Basic Functionality

### A1: PDF Document Loading
**Objective:** Verify PDF loads and renders correctly

**Steps:**
1. Navigate to Documents page (`/documents`)
2. Click on a document that has extraction data
3. Wait for DocumentDetailPage to load

**Expected Results:**
- ✅ Document loads without errors
- ✅ All pages render in continuous scroll mode
- ✅ Page counter shows "Page 1 of X"
- ✅ Extraction panel displays on the right side
- ✅ PDF pages display with correct aspect ratio

**Pass/Fail:** ___________

**Notes:**
```
[Record any issues, load times, or visual problems]
```

---

### A2: Page Navigation & Scroll
**Objective:** Verify page tracking works correctly

**Steps:**
1. Scroll down through the PDF
2. Observe page counter in top toolbar
3. Scroll to middle of document
4. Scroll to end of document
5. Scroll back to top

**Expected Results:**
- ✅ Page counter updates as you scroll
- ✅ Current page reflects the page at viewport center
- ✅ Smooth scrolling performance
- ✅ No lag or stuttering

**Pass/Fail:** ___________

**Notes:**
```
[Record performance issues, page counter accuracy]
```

---

### A3: Zoom Controls
**Objective:** Verify zoom in/out works correctly

**Steps:**
1. Note current zoom level (default 150%)
2. Click "Zoom Out" button repeatedly
3. Verify minimum zoom (50%)
4. Click "Zoom In" button repeatedly
5. Verify maximum zoom (300%)
6. Set zoom to 100%

**Expected Results:**
- ✅ Zoom level displays correctly (e.g., "150%")
- ✅ Zoom out button disabled at 50%
- ✅ Zoom in button disabled at 300%
- ✅ PDF scales smoothly
- ✅ Text remains readable at all zoom levels
- ✅ Page layout adapts to zoom level

**Pass/Fail:** ___________

**Notes:**
```
[Record any scaling issues, button states]
```

---

## Test Suite B: Extraction Highlights - Y-Axis Transformation

### B1: Highlight Visibility
**Objective:** Verify highlights render and are visible

**Steps:**
1. Load document with extractions
2. Observe PDF pages for yellow highlight boxes
3. Count visible highlights
4. Compare to extraction panel count

**Expected Results:**
- ✅ Yellow semi-transparent highlights visible on PDF
- ✅ Highlight count matches extraction panel
- ✅ Highlights are rectangular boxes
- ✅ Highlights have subtle border

**Pass/Fail:** ___________

**Notes:**
```
[Record highlight color, opacity, visibility]
```

---

### B2: Highlight Position Accuracy (CRITICAL TEST)
**Objective:** Verify Y-axis transformation fix works correctly

**Steps:**
1. Select a field in extraction panel (e.g., "Borrower Name")
2. Note the extracted text value
3. Find that text in the PDF visually
4. Compare highlight box position to actual text location
5. Repeat for 5-10 different extractions across multiple pages

**Expected Results:**
- ✅ **Highlight box covers the extracted text exactly**
- ✅ No vertical offset (highlight not above or below text)
- ✅ No horizontal offset (highlight aligned with text)
- ✅ Highlight box size matches text bounding box
- ✅ Works correctly on all pages

**CRITICAL:** If highlights are offset vertically, the Y-axis transformation is broken!

**Pass/Fail:** ___________

**Position Accuracy Scores:**
```
Extraction 1: Text: ___________ | Page: ___ | Aligned: Yes/No
Extraction 2: Text: ___________ | Page: ___ | Aligned: Yes/No
Extraction 3: Text: ___________ | Page: ___ | Aligned: Yes/No
Extraction 4: Text: ___________ | Page: ___ | Aligned: Yes/No
Extraction 5: Text: ___________ | Page: ___ | Aligned: Yes/No
```

---

### B3: Highlight Accuracy at Different Zoom Levels
**Objective:** Verify highlights scale correctly with zoom

**Steps:**
1. Set zoom to 50%
2. Verify highlight alignment for 2-3 extractions
3. Set zoom to 100%
4. Verify highlight alignment for same extractions
5. Set zoom to 200%
6. Verify highlight alignment for same extractions
7. Set zoom to 300%
8. Verify highlight alignment for same extractions

**Expected Results:**
- ✅ Highlights remain aligned at 50% zoom
- ✅ Highlights remain aligned at 100% zoom
- ✅ Highlights remain aligned at 200% zoom
- ✅ Highlights remain aligned at 300% zoom
- ✅ Highlight box size scales proportionally

**Pass/Fail:** ___________

**Zoom Accuracy:**
```
50%:  Aligned: Yes/No | Notes: ___________
100%: Aligned: Yes/No | Notes: ___________
200%: Aligned: Yes/No | Notes: ___________
300%: Aligned: Yes/No | Notes: ___________
```

---

### B4: Multi-Page Highlights
**Objective:** Verify highlights work across multiple pages

**Steps:**
1. Select a field that has extractions on multiple pages
2. Scroll to first page with extraction
3. Verify highlight accuracy
4. Scroll to second page with extraction
5. Verify highlight accuracy
6. Repeat for all pages with extractions for this field

**Expected Results:**
- ✅ Highlights appear on correct pages
- ✅ Highlights aligned correctly on each page
- ✅ Page numbers in extraction panel match PDF pages
- ✅ No highlights on wrong pages

**Pass/Fail:** ___________

**Notes:**
```
[Record any page-specific issues]
```

---

## Test Suite C: Click-to-Highlight Functionality

### C1: Field Selection
**Objective:** Verify clicking field in panel highlights on PDF

**Steps:**
1. Click a field name in extraction panel (e.g., "Borrower")
2. Observe PDF viewer
3. Note highlight color change
4. Click a different field
5. Observe highlight update

**Expected Results:**
- ✅ Highlights for selected field turn blue
- ✅ Previously selected field highlights turn yellow
- ✅ Selection state updates immediately
- ✅ "Selected" badge appears next to field name

**Pass/Fail:** ___________

**Notes:**
```
[Record selection behavior, color changes]
```

---

### C2: Extraction Click & Scroll
**Objective:** Verify clicking extraction scrolls to location

**Steps:**
1. Scroll PDF to top
2. Expand a field in extraction panel
3. Click an extraction that's on page 5+
4. Observe scroll behavior
5. Verify highlight visibility
6. Note toast notification

**Expected Results:**
- ✅ PDF scrolls smoothly to extraction location
- ✅ Extraction page becomes visible
- ✅ Selected extraction highlight is blue with ring
- ✅ Toast shows "Viewing extraction on page X"
- ✅ Scroll animation is smooth

**Pass/Fail:** ___________

**Scroll Timing:**
```
Time to scroll: _______ seconds
Animation: Smooth / Jumpy / Instant
Target visibility: Visible / Partially Visible / Not Visible
```

---

### C3: Multiple Extractions for Same Field
**Objective:** Verify navigation between multiple extractions

**Steps:**
1. Find a field with 3+ extractions
2. Click first extraction
3. Note page scrolled to
4. Click second extraction
5. Note page scrolled to
6. Click third extraction
7. Verify each scroll goes to correct page

**Expected Results:**
- ✅ Each extraction scrolls to correct page
- ✅ Highlight selection updates for each click
- ✅ Blue ring appears on selected extraction
- ✅ Toast notification appears for each navigation

**Pass/Fail:** ___________

**Navigation Log:**
```
Extraction 1: Expected Page: ___ | Actual Page: ___ | Match: Yes/No
Extraction 2: Expected Page: ___ | Actual Page: ___ | Match: Yes/No
Extraction 3: Expected Page: ___ | Actual Page: ___ | Match: Yes/No
```

---

### C4: Field Toggle (Click Same Field)
**Objective:** Verify clicking selected field deselects it

**Steps:**
1. Click a field to select it
2. Observe blue highlights
3. Click the same field again
4. Observe highlight state

**Expected Results:**
- ✅ Clicking selected field deselects it
- ✅ All highlights return to yellow
- ✅ "Selected" badge disappears
- ✅ No extraction is selected

**Pass/Fail:** ___________

**Notes:**
```
[Record toggle behavior]
```

---

## Test Suite D: Extraction Panel

### D1: Panel Display
**Objective:** Verify extraction panel displays correctly

**Steps:**
1. Observe extraction panel on right side
2. Check header information
3. Review field list
4. Expand/collapse fields

**Expected Results:**
- ✅ Panel shows extraction count (e.g., "5 fields extracted")
- ✅ Status shows as "complete"
- ✅ Completed timestamp displayed
- ✅ Chevron icons toggle field expansion
- ✅ Fields are collapsible/expandable

**Pass/Fail:** ___________

**Notes:**
```
[Record panel layout, information accuracy]
```

---

### D2: Extraction Metadata
**Objective:** Verify extraction details are complete

**Steps:**
1. Expand a field with extractions
2. Review extraction card details
3. Check for all metadata fields

**Expected Results:**
- ✅ Extracted text displayed
- ✅ Page number shown
- ✅ Confidence score shown (as percentage)
- ✅ Bbox coordinates shown (4 numbers)
- ✅ MapPin icon shown for navigable extractions
- ✅ "Click to view" hint displayed

**Pass/Fail:** ___________

**Metadata Checklist:**
```
Text: Present / Missing
Page: Present / Missing
Confidence: Present / Missing
Bbox: Present / Missing
Icons: Present / Missing
```

---

### D3: Empty State
**Objective:** Verify panel handles no extractions gracefully

**Steps:**
1. Navigate to document without extractions
2. Observe extraction panel

**Expected Results:**
- ✅ Message: "No extractions available for this document"
- ✅ Helpful text: "Assign a workflow to this document to extract fields"
- ✅ No error messages
- ✅ Panel layout intact

**Pass/Fail:** ___________

**Notes:**
```
[Record empty state presentation]
```

---

## Test Suite E: Edge Cases & Error Handling

### E1: PDF Load Failure
**Objective:** Verify graceful error handling

**Steps:**
1. Navigate to document with invalid/missing PDF
2. Observe error state

**Expected Results:**
- ✅ Error message displayed
- ✅ "Failed to Load PDF" message shown
- ✅ No infinite loading state
- ✅ User can navigate back

**Pass/Fail:** ___________
**Note:** May require manually breaking a PDF file

---

### E2: Network Interruption
**Objective:** Verify behavior during API failures

**Steps:**
1. Load document
2. Stop backend server
3. Try to load another document
4. Observe error handling

**Expected Results:**
- ✅ Toast error notification appears
- ✅ "Failed to load document" message
- ✅ No crash or blank screen
- ✅ User can navigate back

**Pass/Fail:** ___________

---

### E3: Very Large PDF (Performance)
**Objective:** Test performance with large documents

**Steps:**
1. Load PDF with 50+ pages
2. Measure load time
3. Test scroll performance
4. Test zoom performance
5. Monitor browser memory usage

**Expected Results:**
- ✅ Load time < 5 seconds for 50 pages
- ✅ Smooth scrolling (no lag)
- ✅ Zoom responds within 500ms
- ✅ Memory usage < 500MB
- ✅ No browser crashes

**Pass/Fail:** ___________

**Performance Metrics:**
```
Pages: _____
Load Time: _____ seconds
Scroll FPS: Smooth / Laggy / Very Laggy
Zoom Response: Fast / Acceptable / Slow
Memory Usage: _____ MB
Crashes: Yes / No
```

---

### E4: PDF with Rotated Pages
**Objective:** Verify handling of rotated PDF pages

**Steps:**
1. Load PDF with rotated pages (if available)
2. Verify highlights on rotated pages
3. Check coordinate transformation

**Expected Results:**
- ✅ Rotated pages display correctly
- ✅ Highlights align with text on rotated pages
- ✅ Zoom works on rotated pages
- ✅ No coordinate offset issues

**Pass/Fail:** ___________
**Note:** This may not be testable without rotated PDFs

---

## Test Suite F: Browser Compatibility

### F1: Chrome/Edge Testing
**Browser:** Chrome or Edge
**Version:** _________

**Test Checklist:**
- ✅ PDF renders correctly
- ✅ Highlights display correctly
- ✅ Click-to-highlight works
- ✅ Zoom functions work
- ✅ Smooth scrolling
- ✅ No console errors

**Pass/Fail:** ___________

---

### F2: Firefox Testing
**Browser:** Firefox
**Version:** _________

**Test Checklist:**
- ✅ PDF renders correctly
- ✅ Highlights display correctly
- ✅ Click-to-highlight works
- ✅ Zoom functions work
- ✅ Smooth scrolling
- ✅ No console errors

**Pass/Fail:** ___________

---

### F3: Safari Testing (if available)
**Browser:** Safari
**Version:** _________

**Test Checklist:**
- ✅ PDF renders correctly
- ✅ Highlights display correctly
- ✅ Click-to-highlight works
- ✅ Zoom functions work
- ✅ Smooth scrolling
- ✅ No console errors

**Pass/Fail:** ___________

---

## Comparison Test: React vs Vanilla JS

### Side-by-Side Comparison
**Objective:** Verify React implementation matches vanilla JS

**Setup:**
1. Open React app in one browser window (localhost:3003)
2. Open Vanilla JS app in another browser window (localhost:3000)
3. Load the SAME document in both

**Comparison Checklist:**

| Feature | Vanilla JS | React | Match? |
|---------|-----------|-------|--------|
| PDF Rendering Quality | ✓ | ✓ | Y/N |
| Highlight Positions | ✓ | ✓ | Y/N |
| Highlight Colors | ✓ | ✓ | Y/N |
| Click Navigation | ✓ | ✓ | Y/N |
| Zoom Behavior | ✓ | ✓ | Y/N |
| Scroll Performance | ✓ | ✓ | Y/N |
| Extraction Panel Layout | ✓ | ✓ | Y/N |

**Visual Comparison:**
```
[Take screenshots of both versions side-by-side]
[Note any visual differences]
[Verify highlights align the same in both versions]
```

**Behavioral Differences:**
```
[Note any functional differences]
[Record which version performs better]
[Identify any missing features in React]
```

---

## Test Results Summary

### Overall Test Statistics
- **Total Tests Run:** _____ / 27
- **Tests Passed:** _____
- **Tests Failed:** _____
- **Tests Skipped:** _____
- **Pass Rate:** _____%

### Critical Issues Found
```
Priority | Issue | Test | Description
---------|-------|------|-------------
HIGH     |       |      |
MEDIUM   |       |      |
LOW      |       |      |
```

### Y-Axis Transformation Status
**CRITICAL VALIDATION:**
- Highlight alignment accuracy: _____%
- Works across all pages: Yes / No
- Works at all zoom levels: Yes / No
- Matches vanilla JS implementation: Yes / No

**Final Verdict:** Y-Axis Fix is: WORKING / BROKEN / NEEDS ADJUSTMENT

### Performance Assessment
- Load times: Acceptable / Slow / Too Slow
- Scroll performance: Smooth / Acceptable / Laggy
- Zoom performance: Fast / Acceptable / Slow
- Memory usage: Low / Acceptable / High
- Browser crashes: None / Occasional / Frequent

### Feature Completeness
- PDF Rendering: Complete / Incomplete
- Highlight Display: Complete / Incomplete
- Click-to-Highlight: Complete / Incomplete
- Extraction Panel: Complete / Incomplete
- Error Handling: Complete / Incomplete

### Recommendations
```
[List any improvements needed]
[Suggest fixes for failed tests]
[Note any features that should be added]
```

---

## Next Steps

Based on test results:

1. **If All Tests Pass:**
   - Proceed to Phase B (Implement PDF Search)
   - Mark Week 1.1 as complete

2. **If Critical Issues Found:**
   - Fix Y-axis transformation bugs immediately
   - Re-run failed tests
   - Do not proceed to Phase B until fixed

3. **If Performance Issues:**
   - Investigate slow operations
   - Consider optimization strategies
   - May need to implement lazy loading

4. **If Browser Compatibility Issues:**
   - Document browser-specific bugs
   - Add browser detection if needed
   - Consider polyfills or fallbacks

---

## Sign-Off

**Tester:** _________________
**Date:** _________________
**Overall Status:** PASS / FAIL / PARTIAL
**Ready for Phase B:** YES / NO

**Comments:**
```
[Final notes, observations, concerns]
```
