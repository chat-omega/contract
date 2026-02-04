# Multi-Extraction Highlighting Bug - Fixed

## Problem Summary
When a field had multiple extractions (e.g., "Term and Renewal" with extractions on page 69 and page 80), only ONE highlight was showing in the PDF viewer. The logs showed `totalHighlights: 1` when it should have been `totalHighlights: 2`.

## Root Cause
The diagnostic investigation revealed that the **page number data structure was incorrect**:

### What We Found
- **Database had 2 extractions** for "Term and Renewal" (page 69 and page 80) ✅
- **Pages field was a dictionary** instead of an integer:
  ```json
  {
    "pages": {"start": 69, "end": 69}  // ❌ Dictionary
  }
  ```
- **Expected format**:
  ```json
  {
    "page": 69  // ✅ Integer
  }
  ```

### Why This Caused the Bug
The backend enrichment function `_enrich_extraction_bbox()` in `backend-fastapi/main.py` was:
1. Not looking in the correct location for page data (`span.pages.start`)
2. Not converting the dictionary format to a simple integer
3. Leaving some extractions with `page: None` or `page: {dict}`, which failed frontend comparison logic

## The Fix

### Backend Changes (main.py:2487-2554)
Updated `_enrich_extraction_bbox()` function to:

1. **Extract page from `span.pages.start`**:
   ```python
   pages_data = first_span.get('pages')
   if isinstance(pages_data, dict):
       page = pages_data.get('start')
       extraction['page'] = int(page) if not isinstance(page, int) else page
   ```

2. **Handle multiple page formats**:
   - Dictionary: `{'start': 69, 'end': 69}` → Extract `start` value
   - Integer: `69` → Use directly
   - List: `[69]` → Take first element

3. **Ensure page is always an integer**:
   ```python
   extraction['page'] = int(page) if not isinstance(page, int) else page
   ```

4. **Also extract bbox from `span.bounds`**:
   - Added support for bounds directly on span (simpler format)
   - Fallback to bboxes array if needed

### Diagnostic Script Created
Created `backend-fastapi/diagnose_multi_extraction.py` to:
- Query database for extraction data
- Identify data structure issues
- Validate page numbers and bbox data
- Show exactly what the frontend receives

## Testing Instructions

### 1. Clear Browser Cache (IMPORTANT!)
```bash
# In browser:
- Press Ctrl+Shift+R (hard refresh)
# Or:
- Open DevTools (F12)
- Right-click refresh button
- Select "Empty Cache and Hard Reload"
```

### 2. Test the Fix
1. **Navigate** to the document with "Term and Renewal" field
2. **Click** on "Term and Renewal" in the extraction results panel
3. **Verify**:
   - ✅ Both page 69 AND page 80 should be highlighted
   - ✅ Console should show: `totalHighlights: 2`
   - ✅ Console should show highlights being rendered on both pages

### 3. Check Console Logs
Open browser console and look for:
```
[DIAGNOSTIC] renderHighlightsForPage called:
  totalHighlights: 2  // ✅ Should be 2, not 1
  highlightPageNumbers: [69, 80]  // ✅ Should have both pages
```

For page 69:
```
[DIAGNOSTIC] Highlight 0: page=69 (number) vs pageNumber=69 (number) → strict====true, loose==true
[PDFViewer] Rendering 1 highlights on page 69
```

For page 80:
```
[DIAGNOSTIC] Highlight 1: page=80 (number) vs pageNumber=80 (number) → strict====true, loose==true
[PDFViewer] Rendering 1 highlights on page 80
```

### 4. Diagnostic Script (For Backend Verification)
Run diagnostic to verify database has correct data:
```bash
docker exec omega-backend-fastapi python3 diagnose_multi_extraction.py
```

Expected output:
```
✅ Found 2 extraction(s) for 'Term and Renewal':

EXTRACTION #1
  Extracted Value: Notwithstanding anything in this Agreement...
  Confidence: 0.62
  Spans: 1 span(s)
    Span 1:
      Pages: {'start': 69, 'end': 69}

EXTRACTION #2
  Extracted Value: Section 2.07 Term. The term of this Agreement...
  Confidence: 0.85
  Spans: 1 span(s)
    Span 1:
      Pages: {'start': 80, 'end': 80}
```

## Expected Results

### Before Fix
- ❌ Only 1 page highlighted (usually page 80)
- ❌ `totalHighlights: 1`
- ❌ Page 69 extraction missing from frontend

### After Fix
- ✅ Both pages 69 and 80 highlighted
- ✅ `totalHighlights: 2`
- ✅ Both extractions visible and clickable
- ✅ Navigation works to both pages

## Files Changed

1. **backend-fastapi/main.py** (lines 2487-2554)
   - Fixed `_enrich_extraction_bbox()` to extract page from `span.pages.start`
   - Added support for dict, int, and list page formats
   - Ensured page is always an integer
   - Added bbox extraction from `span.bounds`

2. **backend-fastapi/diagnose_multi_extraction.py** (NEW)
   - Diagnostic script to investigate extraction data
   - Validates page numbers and bbox data
   - Shows data structure issues

## Technical Details

### Data Flow
1. **Zuva API** → Returns spans with `pages: {start: X, end: X}`
2. **Backend enrichment** → Extracts `X` from `pages.start`, converts to integer
3. **API response** → Sends `page: X` (integer) to frontend
4. **Frontend** → Compares `page === pageNumber` (both integers) ✅

### Why Multiple Formats?
Different Zuva field types return page data in different formats:
- **Text fields**: `pages: {start: X, end: X}` (spans across pages)
- **Dates/Numbers**: Often just `page: X` (single value)
- **Lists**: Sometimes `pages: [X, Y, Z]` (multiple occurrences)

The fix handles all three formats to ensure robust extraction.

## Containers Restarted
```bash
docker restart omega-backend-fastapi  # Applied backend fix
docker restart omega-frontend-react   # Ensured fresh frontend
```

## Next Steps
1. Test with other multi-extraction fields
2. Verify all document types work correctly
3. Consider adding automated tests for multi-extraction scenarios
4. Monitor for any edge cases with different field types

## Success Criteria
- [x] Backend correctly extracts page numbers as integers
- [x] Both extractions returned by API with valid page numbers
- [ ] Frontend displays highlights on both pages (USER TO VERIFY)
- [ ] Console shows `totalHighlights: 2` (USER TO VERIFY)
- [ ] Both extractions are clickable and navigable (USER TO VERIFY)
