# PDF Highlighting & Navigation Diagnostic Analysis

## Executive Summary

After reviewing the implementation in the three key files, I've identified **CRITICAL ISSUES** in the data flow that prevent the highlighting and navigation from working.

---

## ROOT CAUSE ANALYSIS

### 🔴 CRITICAL ISSUE #1: Highlights Memoization Missing `selectedExtractionIndex` Dependency

**Location:** `DocumentDetailPage.tsx:110`

```typescript
}, [extractions, selectedFieldId, selectedExtractionIndex]);
```

The `highlights` useMemo hook correctly lists `selectedExtractionIndex` as a dependency, BUT there's a logical flow issue:

**The Problem:**
1. When user clicks an extraction in ExtractionPanel (line 260-282)
2. `onExtractionClick` is called with `(fieldId, idx, page, bbox)`
3. In DocumentDetailPage `handleExtractionClick` (lines 266-288):
   - Sets `selectedFieldId` (line 280)
   - Sets `selectedExtractionIndex` (line 281)
   - Sets `scrollToPage` (line 284)
4. The `highlights` memo recalculates (lines 61-110)
5. **BUT** the logic at line 67 checks `if (selectedFieldId && selectedExtractionIndex !== null)`

**The Race Condition:**
When both `selectedFieldId` AND `selectedExtractionIndex` change simultaneously, React batches these state updates. However, the memoization might evaluate BEFORE both states are fully updated, causing the old extraction to be highlighted instead of the new one.

---

### 🔴 CRITICAL ISSUE #2: PDFViewer Missing `selectedExtractionIndex` in Dependencies

**Location:** `PDFViewer.tsx:767`

```typescript
}, [highlights, selectedFieldId, scale, isPDFValid, isLoading]); // eslint-disable-line react-hooks/exhaustive-deps
```

The effect that re-renders highlights (lines 705-767) is triggered by changes to:
- `highlights`
- `selectedFieldId`
- `scale`
- `isPDFValid`
- `isLoading`

**But NOT `selectedExtractionIndex`!**

This means when you click a different extraction within the same field:
1. `selectedExtractionIndex` changes (e.g., from 0 to 1)
2. `selectedFieldId` stays the same (e.g., "borrower_name")
3. `highlights` array changes (due to memo recalculation)
4. The PDFViewer re-renders highlights

**However**, the pulse animation effect (lines 885-922) DOES depend on both:
```typescript
}, [scrollToPage, selectedFieldId]);
```

This is missing `selectedExtractionIndex` too!

---

### 🔴 CRITICAL ISSUE #3: Scroll Callback Resets State Too Early

**Location:** `DocumentDetailPage.tsx:358`

```typescript
onScrollComplete={() => setScrollToPage(null)}
```

When scrolling completes:
1. The 500ms timeout in PDFViewer finishes (line 865-870)
2. `onScrollComplete` callback fires
3. `scrollToPage` is immediately set to null
4. The pulse animation effect (lines 885-922) depends on `scrollToPage`
5. **The pulse animation stops immediately** because `scrollToPage` becomes null

The pulse animation should continue for 2 seconds AFTER scroll completes, but resetting `scrollToPage` to null stops it prematurely.

---

### 🟡 ISSUE #4: Highlight Rendering Logic Might Not Filter Correctly

**Location:** `DocumentDetailPage.tsx:67-85`

```typescript
if (selectedFieldId && selectedExtractionIndex !== null) {
  const fieldExtraction = extractions.results[selectedFieldId];
  const extraction = fieldExtraction?.extractions[selectedExtractionIndex];

  if (extraction) {
    const bbox = extractBbox(extraction);

    if (bbox && extraction.page) {
      highlightRects.push({
        // ... single highlight
      });
    }
  }
}
```

This logic looks correct - it should show ONLY the selected extraction. However, the issue is that if the state updates don't synchronize properly (Issue #1), this will show the wrong extraction or none at all.

---

### 🟡 ISSUE #5: PDFViewer Highlight Rendering Uses Different Filter Logic

**Location:** `PDFViewer.tsx:406`

```typescript
const pageHighlights = highlights.filter((h) => h.pageNumber === pageNumber);
```

The PDFViewer filters highlights by page number, but then at line 423:

```typescript
const isSelected = highlight.fieldId === selectedFieldId;
```

**The Problem:** This checks if `highlight.fieldId === selectedFieldId`, but doesn't check if this specific highlight matches `selectedExtractionIndex`.

This means:
- If you have multiple extractions for "borrower_name" on page 1
- You click the 2nd extraction (index 1)
- ALL extractions for "borrower_name" on page 1 will be rendered as "selected"

**Why?** Because the `highlights` array should only contain ONE extraction when `selectedExtractionIndex` is set (per Issue #4 logic), but if the memo doesn't update correctly (Issue #1), it might contain all extractions for that field.

---

## DATA FLOW ANALYSIS

### Expected Flow:
```
1. User clicks extraction in ExtractionPanel
   ↓
2. onExtractionClick(fieldId, idx, page, bbox)
   ↓
3. State updates (batched):
   - setSelectedFieldId(fieldId)
   - setSelectedExtractionIndex(idx)
   - setScrollToPage(page)
   ↓
4. highlights memo recalculates → returns SINGLE highlight
   ↓
5. PDFViewer receives new props:
   - highlights (1 item)
   - selectedFieldId
   - scrollToPage
   ↓
6. PDFViewer effects trigger:
   a) Scroll effect (line 847-879) → scrolls to page
   b) Pulse effect (line 885-922) → starts pulse animation
   c) Highlight re-render effect (line 705-767) → re-renders highlights
   ↓
7. After 500ms: scroll completes
   ↓
8. onScrollComplete fires → setScrollToPage(null)
   ↓
9. Pulse animation continues for 2 seconds
   ↓
10. Done
```

### Actual Flow (What's Broken):
```
1. User clicks extraction
   ↓
2. onExtractionClick called
   ↓
3. State updates (batched):
   - setSelectedFieldId(fieldId)
   - setSelectedExtractionIndex(idx)
   - setScrollToPage(page)
   ↓
4. highlights memo recalculates
   ⚠️ ISSUE #1: Might evaluate with stale selectedExtractionIndex
   → Returns wrong highlights or empty array
   ↓
5. PDFViewer receives props
   ↓
6. Effects trigger:
   a) Scroll effect → scrolls (works)
   b) Pulse effect → starts pulse
   c) Highlight re-render effect
      ⚠️ ISSUE #2: Doesn't have selectedExtractionIndex in deps
      → Might not trigger re-render
   ↓
7. After 500ms: scroll completes
   ↓
8. onScrollComplete fires → setScrollToPage(null)
   ⚠️ ISSUE #3: Stops pulse animation immediately
   ↓
9. Result: No highlight visible or wrong highlight
```

---

## EVIDENCE FROM CODE

### Evidence #1: Console Logging
ExtractionPanel has extensive logging (line 261):
```typescript
console.log('[ExtractionPanel] Extraction clicked:', {
  fieldId,
  idx,
  canNavigate,
  hasBbox: !!extraction.bbox,
  hasSpansBbox: !!(extraction.spans?.[0]?.bounds),
  extractedBbox,
  hasPage: !!extraction.page,
  bbox: extraction.bbox,
  page: extraction.page,
});
```

**Action:** Check browser console when user clicks. If this logs correctly but highlighting fails, the issue is in state propagation.

### Evidence #2: handleExtractionClick Also Logs
DocumentDetailPage line 272:
```typescript
console.log('[DocumentDetailPage] Extraction clicked:', {
  fieldId,
  extractionIndex,
  page,
  bbox,
});
```

**Action:** Verify this logs with correct values.

### Evidence #3: PDFViewer Logs Scroll
PDFViewer line 861 and 866:
```typescript
console.log(`[PDFViewer] Scrolling to page ${scrollToPage}...`);
// ... 500ms later ...
console.log(`[PDFViewer] Scroll to page ${scrollToPage} completed`);
```

**Action:** Check if scroll happens but no highlight appears.

---

## RECOMMENDED FIXES

### Fix #1: Add Extraction Index to Highlight Objects
**File:** `DocumentDetailPage.tsx`

Add `extractionIndex` to highlight objects so PDFViewer can properly identify which specific extraction is selected:

```typescript
// Line 61-110: Update highlights memo
const highlights = useMemo<HighlightRect[]>(() => {
  if (!extractions || !extractions.results) return [];

  const highlightRects: HighlightRect[] = [];

  // If specific extraction selected, show ONLY that one
  if (selectedFieldId && selectedExtractionIndex !== null) {
    const fieldExtraction = extractions.results[selectedFieldId];
    const extraction = fieldExtraction?.extractions[selectedExtractionIndex];

    if (extraction) {
      const bbox = extractBbox(extraction);

      if (bbox && extraction.page) {
        highlightRects.push({
          x: 0,
          y: 0,
          width: 0,
          height: 0,
          pageNumber: extraction.page,
          fieldId: selectedFieldId,
          extractionIndex: selectedExtractionIndex,  // ← ADD THIS
          bbox: bbox,
        });
      }
    }
  } else if (selectedFieldId) {
    // Show all extractions for the selected field
    const fieldExtraction = extractions.results[selectedFieldId];

    if (fieldExtraction?.extractions) {
      fieldExtraction.extractions.forEach((extraction, idx) => {  // ← ADD idx
        const bbox = extractBbox(extraction);

        if (bbox && extraction.page) {
          highlightRects.push({
            x: 0,
            y: 0,
            width: 0,
            height: 0,
            pageNumber: extraction.page,
            fieldId: selectedFieldId,
            extractionIndex: idx,  // ← ADD THIS
            bbox: bbox,
          });
        }
      });
    }
  }

  return highlightRects;
}, [extractions, selectedFieldId, selectedExtractionIndex]);
```

### Fix #2: Update HighlightRect Type
**File:** `react-app/src/types/index.ts` (or wherever HighlightRect is defined)

```typescript
export interface HighlightRect {
  x: number;
  y: number;
  width: number;
  height: number;
  pageNumber: number;
  fieldId: string;
  extractionIndex?: number;  // ← ADD THIS
  bbox: BBox;
}
```

### Fix #3: Update PDFViewer to Use extractionIndex
**File:** `PDFViewer.tsx`

Update the highlight rendering to check both fieldId AND extractionIndex:

```typescript
// Line 423-426: Update isSelected logic
const isSelected =
  highlight.fieldId === selectedFieldId &&
  (selectedExtractionIndex === null ||
   highlight.extractionIndex === selectedExtractionIndex);
```

Add prop for `selectedExtractionIndex`:

```typescript
// Line 30-43: Add to interface
interface PDFViewerProps {
  documentId: string;
  pdfUrl: string;
  highlights?: HighlightRect[];
  selectedFieldId?: string | null;
  selectedExtractionIndex?: number | null;  // ← ADD THIS
  scrollToPage?: number | null;
  // ... rest
}

// Line 51-62: Add to destructuring
export const PDFViewer: React.FC<PDFViewerProps> = ({
  documentId: _documentId,
  pdfUrl,
  highlights = [],
  selectedFieldId = null,
  selectedExtractionIndex = null,  // ← ADD THIS
  scrollToPage = null,
  // ... rest
}) => {
```

Update the highlight re-render effect dependencies:

```typescript
// Line 767: Add selectedExtractionIndex to dependencies
}, [highlights, selectedFieldId, selectedExtractionIndex, scale, isPDFValid, isLoading]);
```

Update the pulse effect dependencies:

```typescript
// Line 922: Add selectedExtractionIndex to dependencies
}, [scrollToPage, selectedFieldId, selectedExtractionIndex]);
```

### Fix #4: Don't Reset scrollToPage Immediately
**File:** `DocumentDetailPage.tsx`

Instead of resetting `scrollToPage` to null immediately after scroll completes, let the pulse animation finish first:

```typescript
// Line 358: Remove the immediate reset
// BEFORE:
onScrollComplete={() => setScrollToPage(null)}

// AFTER:
onScrollComplete={() => {
  // Let pulse animation complete (2 seconds) before resetting
  setTimeout(() => {
    setScrollToPage(null);
  }, 2000);
}}
```

### Fix #5: Pass selectedExtractionIndex to PDFViewer
**File:** `DocumentDetailPage.tsx`

```typescript
// Line 350-360: Update PDFViewer props
<PDFViewer
  documentId={document.id}
  pdfUrl={documentService.getDocumentContentUrl(document.id)}
  highlights={highlights}
  selectedFieldId={selectedFieldId}
  selectedExtractionIndex={selectedExtractionIndex}  // ← ADD THIS
  scrollToPage={scrollToPage}
  onLoad={handlePDFLoad}
  onError={handlePDFError}
  onScrollComplete={() => {
    setTimeout(() => setScrollToPage(null), 2000);
  }}
  enableSearch={true}
/>
```

---

## TEST PLAN

### Test Script (Browser Console)

Create a diagnostic script to inject into the browser console:

```javascript
// PDF Highlighting Diagnostic Test
(function() {
  console.log('=== PDF Highlighting Diagnostic ===');

  // Step 1: Capture initial state
  let initialState = {
    selectedFieldId: null,
    selectedExtractionIndex: null,
    scrollToPage: null,
    highlightsCount: 0
  };

  // Step 2: Hook into React DevTools to monitor state
  if (window.__REACT_DEVTOOLS_GLOBAL_HOOK__) {
    console.log('✓ React DevTools detected');
  } else {
    console.warn('✗ React DevTools not found - install for better diagnostics');
  }

  // Step 3: Monitor console logs
  const originalLog = console.log;
  const logs = [];
  console.log = function(...args) {
    if (args[0]?.includes?.('[ExtractionPanel]') ||
        args[0]?.includes?.('[DocumentDetailPage]') ||
        args[0]?.includes?.('[PDFViewer]')) {
      logs.push({
        timestamp: Date.now(),
        message: args
      });
    }
    originalLog.apply(console, args);
  };

  // Step 4: After clicking an extraction, check logs
  window.checkHighlightingIssue = function() {
    console.log('\n=== Diagnostic Results ===');

    const extractionClicks = logs.filter(l =>
      l.message[0]?.includes?.('[ExtractionPanel] Extraction clicked'));
    const documentClicks = logs.filter(l =>
      l.message[0]?.includes?.('[DocumentDetailPage] Extraction clicked'));
    const scrollEvents = logs.filter(l =>
      l.message[0]?.includes?.('[PDFViewer] Scrolling to page'));
    const highlightRenders = logs.filter(l =>
      l.message[0]?.includes?.('[PDFViewer] Rendering') &&
      l.message[0]?.includes?.('highlights'));

    console.log('\n1. Extraction Panel Clicks:', extractionClicks.length);
    extractionClicks.forEach(log => console.log('  ', log.message[1]));

    console.log('\n2. Document Detail Clicks:', documentClicks.length);
    documentClicks.forEach(log => console.log('  ', log.message[1]));

    console.log('\n3. Scroll Events:', scrollEvents.length);
    scrollEvents.forEach(log => console.log('  ', log.message));

    console.log('\n4. Highlight Renders:', highlightRenders.length);
    highlightRenders.forEach(log => console.log('  ', log.message));

    // Check for issues
    console.log('\n=== Issue Detection ===');

    if (extractionClicks.length > 0 && documentClicks.length === 0) {
      console.error('❌ ISSUE: ExtractionPanel clicked but DocumentDetailPage never received it');
      console.log('   → Check if onExtractionClick prop is passed correctly');
    }

    if (documentClicks.length > 0 && scrollEvents.length === 0) {
      console.error('❌ ISSUE: DocumentDetailPage clicked but PDFViewer never scrolled');
      console.log('   → Check if scrollToPage state is being set');
    }

    if (scrollEvents.length > 0 && highlightRenders.length === 0) {
      console.error('❌ ISSUE: PDFViewer scrolled but no highlights rendered');
      console.log('   → Check if highlights array is being passed correctly');
      console.log('   → Check if highlight re-render effect is triggering');
    }

    if (highlightRenders.length > 0) {
      console.log('✓ Highlights are being rendered');
      console.log('  → Check visually if they appear on the PDF');
      console.log('  → If not visible, issue might be with coordinate transformation');
    }

    console.log('\n=== Instructions ===');
    console.log('1. Click on an extraction in the panel');
    console.log('2. Wait 2 seconds');
    console.log('3. Run: checkHighlightingIssue()');
    console.log('4. Review the diagnostic output above');
  };

  console.log('\n✓ Diagnostic script loaded');
  console.log('→ Click an extraction, then run: checkHighlightingIssue()');
})();
```

### Manual Test Steps

1. **Open Browser Console** at https://app-react.omegaintelligence.ai/documents/e37f9df8

2. **Paste the diagnostic script** above

3. **Click an extraction** in the ExtractionPanel on the right

4. **Wait 2 seconds**

5. **Run:** `checkHighlightingIssue()`

6. **Review the output** to identify which step in the flow is failing

### Expected vs Actual Behavior

| Step | Expected | Likely Actual (Broken) |
|------|----------|----------------------|
| Click extraction | Console logs from ExtractionPanel | ✓ Probably works |
| Call onExtractionClick | Console logs from DocumentDetailPage | ✓ Probably works |
| State updates | selectedFieldId, selectedExtractionIndex, scrollToPage all update | ⚠️ Might be batched incorrectly |
| highlights memo | Returns array with 1 highlight | ❌ Might return empty or wrong highlight |
| PDFViewer receives props | New highlights, scrollToPage, selectedFieldId | ⚠️ Missing selectedExtractionIndex |
| Scroll triggers | Scrolls to correct page | ✓ Probably works |
| Highlight renders | Blue highlight appears on correct extraction | ❌ Doesn't render or renders wrong one |
| Pulse animation | Blue highlight pulses for 2 seconds | ❌ Stops immediately |

---

## PRIORITY OF FIXES

### P0 - CRITICAL (Must Fix First)
1. **Fix #5**: Pass `selectedExtractionIndex` to PDFViewer
2. **Fix #3**: Add `selectedExtractionIndex` to PDFViewer dependencies

### P1 - HIGH (Fix Next)
3. **Fix #1**: Add `extractionIndex` to highlight objects
4. **Fix #2**: Update HighlightRect type
5. **Fix #3**: Update isSelected logic in PDFViewer

### P2 - MEDIUM (Nice to Have)
6. **Fix #4**: Delay scrollToPage reset to allow pulse animation to complete

---

## FILES TO MODIFY

1. `/home/ubuntu/contract1/omega-workflow/react-app/src/features/documents/DocumentDetailPage.tsx`
   - Add `extractionIndex` to highlights (Fix #1)
   - Pass `selectedExtractionIndex` to PDFViewer (Fix #5)
   - Delay scrollToPage reset (Fix #4)

2. `/home/ubuntu/contract1/omega-workflow/react-app/src/features/documents/components/PDFViewer.tsx`
   - Add `selectedExtractionIndex` prop (Fix #3)
   - Update `isSelected` logic (Fix #3)
   - Add `selectedExtractionIndex` to effect dependencies (Fix #3)

3. `/home/ubuntu/contract1/omega-workflow/react-app/src/types/index.ts` (or wherever HighlightRect is defined)
   - Add `extractionIndex?` to HighlightRect interface (Fix #2)

---

## VERIFICATION CHECKLIST

After applying fixes:

- [ ] Click extraction in panel → Console logs show correct fieldId and index
- [ ] PDF scrolls to correct page
- [ ] Blue highlight appears on the clicked extraction (not others)
- [ ] Highlight pulses for ~2 seconds
- [ ] Click different extraction in same field → highlight moves to new extraction
- [ ] Click extraction in different field → highlight moves to new field
- [ ] Click same extraction again → highlight stays (doesn't toggle off)

---

## CONCLUSION

The root cause is a **missing data flow** issue where `selectedExtractionIndex` is not being properly propagated to the PDFViewer component, and the highlight rendering logic doesn't distinguish between different extractions of the same field.

The fixes are straightforward:
1. Pass the missing prop
2. Add it to dependencies
3. Use it in the selection logic
4. Add it to highlight objects for proper identification

Estimated fix time: **15-20 minutes**
Estimated test time: **10 minutes**

**Total: ~30 minutes to resolve**
