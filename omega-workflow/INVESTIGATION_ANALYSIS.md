# PDF Highlighting Bug Investigation

## Problem Statement
"Highlighting works properly for fields until Date and after that highlighting does not work"
- Test documents: 37fb6240, e37f9df8
- Symptom: Fields before "Date" highlight correctly, fields after "Date" do not highlight

## Findings

### 1. API Endpoint Mismatch (CRITICAL)

**React App Calls:**
- `/api/documents/{id}/extractions`
- Location: `react-app/src/services/extractionService.ts:58`

**Backend Provides:**
- `/api/documents/{id}/extraction/results?workflow_id={id}`
- Location: `backend-fastapi/main.py:2486`

**Evidence:**
```bash
$ curl http://localhost:5001/api/documents/e37f9df8/extractions
{"detail":"Not Found"}
```

**Impact:** The React app cannot retrieve extraction data at all because it's calling a non-existent endpoint.

### 2. Data Structure Mismatch

**Backend Returns (from `/extraction/results`):**
```json
{
  "status": "complete",
  "documentId": "...",
  "workflowId": 35,
  "fieldCount": 54,
  "fields": {
    "field_id_1": {
      "metadata": {...},
      "extractions": [...]
    }
  }
}
```

**React App Expects:**
```typescript
interface ExtractionResult {
  document_id: string;
  workflow_id: number;
  status: string;
  results: Record<string, FieldExtraction>;  // ← Expects "results" key
}
```

**Location:** `react-app/src/types/index.ts:119-128`

**Impact:** Even if the endpoint were correct, the data structure mismatch would cause `extractions.results` to be undefined, resulting in NO highlights at all.

### 3. Highlight Generation Logic Analysis

**Code Location:** `react-app/src/features/documents/DocumentDetailPage.tsx:34-63`

```typescript
const highlights = useMemo<HighlightRect[]>(() => {
  if (!extractions || !extractions.results) return [];  // ← Returns [] if results is undefined

  const highlightRects: HighlightRect[]= [];

  const fieldsToShow = selectedFieldId
    ? { [selectedFieldId]: extractions.results[selectedFieldId] }
    : extractions.results;

  Object.entries(fieldsToShow).forEach(([fieldId, fieldExtraction]) => {
    if (!fieldExtraction.extractions) return;  // ← Skips if no extractions

    fieldExtraction.extractions.forEach((extraction) => {
      if (extraction.bbox && extraction.page) {  // ← Only adds if bbox AND page exist
        highlightRects.push({...});
      }
    });
  });

  return highlightRects;
}, [extractions, selectedFieldId]);
```

**Potential Issues:**
1. If `extractions.results` is undefined → returns []
2. If a field has no `extractions` array → skipped
3. If an extraction has no `bbox` or `page` → skipped
4. Object.entries() iteration order is insertion order (ES2015+), should be consistent

### 4. Zen-Architect's Concerns (Lines 40-42)

```typescript
const fieldsToShow = selectedFieldId
  ? { [selectedFieldId]: extractions.results[selectedFieldId] }
  : extractions.results;
```

**Analysis:**
- When `selectedFieldId` is null: Shows ALL fields
- When `selectedFieldId` is set: Shows ONLY that field
- This logic is actually correct - it filters highlights based on selection

**Verdict:** This conditional logic is NOT the bug.

## Root Cause Hypothesis

Based on the investigation, here are the most likely root causes:

### Hypothesis 1: API Endpoint Mismatch (90% confidence)
The React app is calling `/extractions` which doesn't exist, causing the extraction data to never load. This would result in:
- No highlights at all (not "highlights stop after Date")
- Console errors showing 404 Not Found

**Test:** Check browser console for API errors

### Hypothesis 2: Data Structure Mismatch (if endpoint is fixed)
Even if the correct endpoint is called, the backend returns `fields` but React expects `results`, causing `extractions.results` to be undefined.

**Test:** Check if `extractions.results` is undefined in React DevTools

### Hypothesis 3: Missing Bbox Data for Some Fields
If the first two issues are resolved, it's possible that:
- Fields before "Date" have bbox data
- Fields after "Date" are missing bbox data in the API response
- The `if (extraction.bbox && extraction.page)` check filters them out

**Test:** Examine raw API response to verify all fields have bbox data

### Hypothesis 4: JavaScript Error During Processing
An error occurring while processing a specific field (possibly "Date") could stop the forEach loop.

**Test:** Check browser console for JavaScript errors
**Note:** forEach does NOT stop on errors, so this is less likely

## Recommended Investigation Steps

1. **Check Browser Console:**
   - Open React app in browser
   - Navigate to document detail page
   - Check console for:
     - API 404 errors
     - JavaScript errors
     - Network tab showing actual API calls

2. **Add Debug Logging:**
   ```typescript
   const highlights = useMemo<HighlightRect[]>(() => {
     console.log('📊 Extractions data:', extractions);
     console.log('📊 extractions.results:', extractions?.results);
     console.log('📊 extractions.fields:', extractions?.fields);

     if (!extractions || !extractions.results) {
       console.warn('⚠️ No extractions.results found');
       return [];
     }
     // ... rest of logic
   }, [extractions, selectedFieldId]);
   ```

3. **Test API Response:**
   - Call the correct backend endpoint with auth token
   - Verify data structure matches expectations
   - Check if all fields have bbox data

4. **Check for Missing Fields:**
   - Count how many fields are in API response
   - Count how many highlights are generated
   - Identify which fields are missing

## Next Steps

1. ✅ Identify correct API endpoint
2. ⏳ Fix React app to call correct endpoint
3. ⏳ Fix data structure mismatch (results vs fields)
4. ⏳ Test with real data
5. ⏳ Verify all fields highlight correctly
