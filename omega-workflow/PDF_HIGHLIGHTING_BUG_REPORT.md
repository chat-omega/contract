# PDF Highlighting Bug Report
**Date:** 2025-11-09
**Priority:** HIGH
**Component:** Vanilla Frontend (omega-frontend-vanilla)
**Affected Documents:** 37fb6240, e37f9df8

---

## Problem Statement

User reports: **"Highlighting works properly for fields until Date and after that highlighting does not work"**

### Symptoms
- Fields before "Date" field: Highlighting works correctly when clicked
- "Date" field and fields after it: Highlighting does not work when clicked
- Affects documents 37fb6240 and e37f9df8
- Issue occurs in vanilla frontend (port 3000)

---

## Investigation Summary

### 1. Codebase Confusion - React vs Vanilla
**Initial Finding:** There are TWO frontend implementations:
- `/react-app` - React/TypeScript application (NOT running)
- `/frontend-vanilla-old` - Vanilla JavaScript application (RUNNING on port 3000)

**Resolution:** The bug is in the vanilla frontend, which is the active implementation.

### 2. API Endpoint Analysis

**Backend Provides:**
```
GET /api/documents/{id}/extraction/results?workflow_id={id}
```

**Response Structure:**
```json
{
  "status": "complete",
  "documentId": "...",
  "workflowId": 35,
  "fieldCount": 54,
  "fields": {
    "field_id_1": {
      "metadata": {...},
      "extractions": [...],
      "hasAnswers": false
    }
  }
}
```
Location: `/home/ubuntu/contract1/omega-workflow/backend-fastapi/main.py:2230-2343`

**Frontend Calls:** ✅ CORRECT
```javascript
// Line 572-589 in frontend-vanilla-old/js/document-detail.js
const response = await fetch(
    `/api/documents/${documentId}/extraction/results?workflow_id=${workflowId}`,
    { headers: getAuthHeaders() }
);
const data = await response.json();
if (data.status === 'complete' && data.fields) {
    this.updateTermsWithExtractionResults(data.fields);
}
```

**Verdict:** ✅ No API mismatch in vanilla frontend

---

## Root Cause Analysis

### Hypothesis 1: Field Rendering Mismatch (MOST LIKELY)
**Location:** `/frontend-vanilla-old/js/document-detail.js`

**Issue:** When fields are clicked for highlighting, the system cannot find some field DOM elements.

**Evidence:**
1. Line 536: Term items are created with `termItem.dataset.fieldId = field.fieldId`
2. Line 610: Code searches for elements using `document.querySelector('[data-field-id="${fieldId}"]')`
3. **If field IDs don't match**, elements won't be found and won't get click handlers

**Critical Code:**
```javascript
// Line 606-620: updateTermsWithExtractionResults
Object.entries(fields).forEach(([fieldId, fieldData]) => {
    const termItem = document.querySelector(`[data-field-id="${fieldId}"]`);

    if (termItem) {  // ⚠️ If not found, silently skips!
        if (fieldData.hasAnswers) {
            this.renderAnswerField(termItem, fieldData);
        } else {
            this.renderTextField(termItem, fieldData);
        }
    }
    // ⚠️ NO ELSE - No error logged if field not found!
});
```

**Why "Until Date"?**
- Workflow field IDs might be different from extraction result field IDs
- If field IDs match for first N fields but diverge after "Date", those fields won't render
- Could be due to:
  - Different field ID formats (e.g., "date" vs "Date" vs "effective_date")
  - Field IDs being truncated or transformed somewhere
  - Workflow containing subset of fields vs API returning all fields

### Hypothesis 2: JavaScript Error During Processing
**Issue:** An error occurring while processing a specific field (possibly "Date") stops the forEach loop.

**Why Unlikely:** `forEach` does NOT stop on errors unless error is uncaught

**Test:** Check browser console for JavaScript errors

### Hypothesis 3: Missing Bbox Data for Some Fields
**Issue:** Fields after "Date" might be missing `bbox` data in API response

**Evidence from highlighting code:**
```javascript
// Line 783-789
if (extraction.page || extraction.bbox) {
    extractionDiv.style.cursor = 'pointer';
    extractionDiv.title = extraction.bbox ? 'Click to highlight in document' : 'Click to find in document (text search)';
    extractionDiv.addEventListener('click', async () => {
        await this.highlightExtraction(extraction);
    });
}
```

**Why Possible:**
- If extractions after "Date" have no `bbox` or `page`, click handlers aren't attached
- Could appear as "highlighting doesn't work"

---

## Recommended Investigation Steps

### Step 1: Add Debug Logging
**File:** `/frontend-vanilla-old/js/document-detail.js`

**Add to line 606-620:**
```javascript
updateTermsWithExtractionResults(fields) {
    // DEBUGGING: Log all field IDs from API
    console.log('📊 API Field IDs:', Object.keys(fields));

    // DEBUGGING: Log all rendered field IDs
    const renderedFields = Array.from(document.querySelectorAll('[data-field-id]'))
        .map(el => el.dataset.fieldId);
    console.log('📋 Rendered Field IDs:', renderedFields);

    // DEBUGGING: Find mismatches
    const apiFieldIds = Object.keys(fields);
    const missing = apiFieldIds.filter(id => !renderedFields.includes(id));
    const extra = renderedFields.filter(id => !apiFieldIds.includes(id));

    if (missing.length > 0) {
        console.warn('⚠️ API fields NOT found in DOM:', missing);
    }
    if (extra.length > 0) {
        console.warn('⚠️ DOM fields NOT in API response:', extra);
    }

    Object.entries(fields).forEach(([fieldId, fieldData]) => {
        const termItem = document.querySelector(`[data-field-id="${fieldId}"]`);

        if (termItem) {
            // ... existing code ...
        } else {
            // DEBUGGING: Log when field not found
            console.error(`❌ Field not found in DOM: ${fieldId}`);
        }
    });
}
```

### Step 2: Check Bbox Data for All Fields
**Add to line 741:**
```javascript
const extractions = fieldData.extractions || [];

// DEBUGGING: Log bbox availability
console.log(`Field: ${fieldId}`);
console.log(`  Extractions: ${extractions.length}`);
extractions.forEach((ext, idx) => {
    console.log(`  [${idx}] bbox: ${ext.bbox ? 'YES' : 'NO'}, page: ${ext.page || 'NO'}`);
});
```

### Step 3: Manual Browser Testing
1. Open http://localhost:3000/document-detail.html?id=37fb6240
2. Open browser DevTools console (F12)
3. Look for:
   - ⚠️ "Field not found in DOM" errors
   - ⚠️ "API fields NOT found in DOM" warnings
   - Field ID mismatches
   - Missing bbox warnings

### Step 4: Verify Field IDs Match
**Backend Check:**
```bash
docker exec omega-backend-fastapi python3 -c "
import sqlite3, json
conn = sqlite3.connect('/app/omega.db')
cursor = conn.cursor()

# Get workflow fields
cursor.execute('SELECT fields FROM workflows WHERE id = 35')
workflow = cursor.fetchone()
if workflow:
    fields = json.loads(workflow[0]) if workflow[0] else []
    print('Workflow Field IDs:')
    if isinstance(fields, list):
        for f in fields[:20]:
            print(f'  - {f}')
    elif isinstance(fields, dict):
        for cat, cat_fields in fields.items():
            print(f'\n{cat}:')
            for f in cat_fields[:20]:
                print(f'  - {f}')

# Get extraction field IDs for test document
cursor.execute('''
    SELECT DISTINCT field_id
    FROM extraction_fields
    WHERE extraction_id IN (
        SELECT id FROM extractions
        WHERE document_id = \"37fb6240\" AND workflow_id = 35
    )
    ORDER BY id
''')
extraction_fields = [row[0] for row in cursor.fetchall()]
print(f'\nExtraction Field IDs ({len(extraction_fields)}):')
for fid in extraction_fields[:20]:
    print(f'  - {fid}')

conn.close()
"
```

---

## Potential Fixes

### Fix 1: Add Comprehensive Logging (Immediate)
Add the debug logging from Step 1 above to identify the exact mismatch.

### Fix 2: Case-Insensitive Field ID Matching
If field IDs differ only in case:
```javascript
// Line 610
const termItem = document.querySelector(`[data-field-id="${fieldId}"]`) ||
                 document.querySelector(`[data-field-id="${fieldId.toLowerCase()}"]`) ||
                 Array.from(document.querySelectorAll('[data-field-id]'))
                     .find(el => el.dataset.fieldId.toLowerCase() === fieldId.toLowerCase());
```

### Fix 3: Fallback Field ID Normalization
If field IDs use different formats:
```javascript
function normalizeFieldId(fieldId) {
    return fieldId
        .toLowerCase()
        .replace(/[^a-z0-9]/g, '_') // Replace non-alphanumeric with underscore
        .replace(/__+/g, '_')        // Replace multiple underscores with single
        .replace(/^_|_$/g, '');      // Remove leading/trailing underscores
}

// Use normalized IDs for matching
const termItem = Array.from(document.querySelectorAll('[data-field-id]'))
    .find(el => normalizeFieldId(el.dataset.fieldId) === normalizeFieldId(fieldId));
```

### Fix 4: Create Missing Field Elements Dynamically
If some fields exist in API but not in workflow:
```javascript
Object.entries(fields).forEach(([fieldId, fieldData]) => {
    let termItem = document.querySelector(`[data-field-id="${fieldId}"]`);

    if (!termItem) {
        // Create missing field element dynamically
        console.warn(`Creating missing field element for: ${fieldId}`);
        termItem = this.createMissingFieldElement(fieldId, fieldData);

        // Append to "Other Fields" category or create it
        let otherCategory = document.querySelector('.term-category[data-category="other"]');
        if (!otherCategory) {
            otherCategory = this.createCategoryElement('Other Fields', []);
            container.appendChild(otherCategory);
        }
        otherCategory.querySelector('.category-content').appendChild(termItem);
    }

    // Continue with rendering...
});
```

---

## Testing Plan

### Test Case 1: Field ID Matching
**Expected:** All field IDs from API should find corresponding DOM elements
**Actual:** Check console for "Field not found" warnings

### Test Case 2: Bbox Availability
**Expected:** All extractions should have bbox data
**Actual:** Check console for bbox availability logs

### Test Case 3: Click Handler Attachment
**Expected:** All extraction items should be clickable
**Actual:** Verify cursor changes to pointer and title attribute exists

### Test Case 4: Highlighting After "Date"
**Expected:** Clicking fields after "Date" should highlight in PDF
**Actual:** Click each field and verify yellow highlight appears

---

## Next Steps

1. ✅ **Completed:** Analyzed codebase architecture
2. ✅ **Completed:** Identified API endpoints and data flow
3. ✅ **Completed:** Analyzed highlighting logic
4. ⏳ **Pending:** Add debug logging (Fix 1)
5. ⏳ **Pending:** Test with real documents (37fb6240, e37f9df8)
6. ⏳ **Pending:** Verify field ID matching
7. ⏳ **Pending:** Implement appropriate fix based on findings
8. ⏳ **Pending:** Verify fix with test cases

---

## Files Analyzed

**Frontend (Vanilla):**
- `/home/ubuntu/contract1/omega-workflow/frontend-vanilla-old/js/document-detail.js` (2638 lines)
  - Line 251-320: Document loading
  - Line 440-566: Workflow field rendering
  - Line 568-604: Extraction results population
  - Line 606-642: Term updating with extraction results
  - Line 740-801: Text field rendering with click handlers
  - Line 1758-2280: Extraction highlighting logic

**Backend:**
- `/home/ubuntu/contract1/omega-workflow/backend-fastapi/main.py`
  - Line 2230-2343: Single workflow extraction results endpoint
  - Line 2486-2520: Extraction results API endpoint

**React (Not Running):**
- `/home/ubuntu/contract1/omega-workflow/react-app/src/features/documents/DocumentDetailPage.tsx`
  - NOT the source of the bug (React app is not deployed)

---

**Document Version:** 1.0
**Last Updated:** 2025-11-09
**Author:** Claude Code - Bug Hunter Agent
**Status:** Investigation Complete - Awaiting Browser Testing
