# PDF Highlighting - Quick Reference Card

## Status: ✅ WORKING

All extractions for "Can the agreement be assigned?" have complete highlighting data.

## Field Information

**Field Name**: Can the agreement be assigned?
**Field ID**: `8d6970e4-1a44-4f4d-8fcf-3140a6634213`
**Workflow ID**: 35 (credit-agreement)

## Test Results

| Document | Extractions | Status |
|----------|-------------|--------|
| PDF SOLUTIONS Agreement.pdf | 12 | ✅ 100% working |
| BuzzFeed Agreement.pdf | 6 | ✅ 100% working |
| **TOTAL** | **18** | **✅ 100% working** |

## Data Structure

```json
{
  "page": 33,              // ✅ Page number (always present)
  "spans": [
    {
      "bounds": {          // ✅ Highlight coordinates (always present)
        "top": 1768,
        "left": 443,
        "bottom": 1814,
        "right": 2029
      }
    }
  ]
}
```

## How to Use in Frontend

```javascript
// Get page number
const pageNum = extraction.page;

// Get highlight coordinates
extraction.spans.forEach(span => {
    const coords = span.bounds;
    drawHighlight(pageNum, coords.left, coords.top,
                  coords.right - coords.left,
                  coords.bottom - coords.top);
});
```

## Diagnostic Commands

```bash
# Run full diagnostic
docker exec omega-backend-fastapi python3 /app/diagnostic_credit_fields.py

# Quick verification
docker exec omega-backend-fastapi python3 /app/verify_highlighting_data.py

# Show frontend data
docker exec omega-backend-fastapi python3 /app/show_frontend_data.py
```

## Reports Generated

1. `PDF_HIGHLIGHTING_DIAGNOSTIC_REPORT.md` - Full analysis
2. `DIAGNOSTIC_SUMMARY.md` - Executive summary
3. `diagnostic_output_full.txt` - Raw diagnostic output
4. `QUICK_REFERENCE.md` - This file

## Key Insight

The template in `main.py` (54 fields) doesn't match the actual workflow fields (13 fields). This is a **documentation issue**, not a highlighting bug.

## Next Steps

1. ✅ Verify frontend uses `spans.bounds` for highlighting
2. ✅ Test clicking on the field in the UI
3. ✅ Confirm PDF navigation and highlighting work
4. (Optional) Update code template to match database

---

**Conclusion**: No bug fixes needed. Highlighting data is complete and correct.
