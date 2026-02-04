# Extraction Click Navigation & Highlighting Fix

## Summary
Fixed the issue where clicking on extraction results in the document detail page would scroll to the correct page but not highlight the extracted text.

## Problem Description

### What Was Broken
- Users could click on extraction results in the right panel
- The PDF would scroll to the correct page ✅
- BUT the extracted text would NOT be highlighted ❌
- This happened for some extractions but not others

### Root Cause
There was an **inconsistency** in how bounding box coordinates were extracted between two components:

**ExtractionPanel.tsx** (lines 202-210):
```typescript
// Extracted bbox from BOTH sources
const extractedBbox = extraction.bbox ||
  (extraction.spans && extraction.spans.length > 0 && extraction.spans[0].bounds
    ? [left, bottom, right, top] from spans
    : null);
```

**DocumentDetailPage.tsx** (OLD - lines 51-52):
```typescript
// Only checked ONE source
if (extraction.bbox && extraction.page) {
  // Create highlight
}
```

### The Issue
1. ExtractionPanel showed extractions as "clickable" (with 📍 MapPin icon) for items that had `spans[0].bounds` but no direct `bbox` property
2. Users clicked these "clickable" items
3. The page scrolled correctly (scroll logic was working)
4. **BUT** no highlight appeared because DocumentDetailPage didn't create a highlight for these extractions (it only looked for direct `bbox`, not `spans[0].bounds`)

## Solution Implemented

### Changes Made

**File:** `react-app/src/features/documents/DocumentDetailPage.tsx`

**Added helper function** to extract bbox consistently:
```typescript
const extractBbox = (extraction: any): BBox | null => {
  // Try direct bbox first
  if (extraction.bbox) {
    return extraction.bbox as BBox;
  }

  // Fallback to spans[0].bounds (same logic as ExtractionPanel)
  if (extraction.spans && extraction.spans.length > 0 && extraction.spans[0].bounds) {
    return [
      extraction.spans[0].bounds.left,
      extraction.spans[0].bounds.bottom,
      extraction.spans[0].bounds.right,
      extraction.spans[0].bounds.top
    ] as BBox;
  }

  return null;
};
```

**Updated highlights creation** to use the helper:
```typescript
Object.entries(fieldsToShow).forEach(([fieldId, fieldExtraction]) => {
  if (!fieldExtraction.extractions) return;

  fieldExtraction.extractions.forEach((extraction) => {
    const bbox = extractBbox(extraction);  // Now uses helper

    if (bbox && extraction.page) {
      highlightRects.push({
        pageNumber: extraction.page,
        fieldId: fieldId,
        bbox: bbox,  // Now includes both direct bbox AND spans-derived bbox
        // ... other properties
      });
    }
  });
});
```

## Testing Instructions

### How to Test

1. **Navigate to the document detail page:**
   ```
   https://app-react.omegaintelligence.ai/documents/e37f9df8
   ```

2. **Expand a field** in the extraction panel on the right side

3. **Click on an extraction result** (one with the 📍 icon)

4. **Expected behavior:**
   - ✅ PDF viewer scrolls to the page containing the extraction
   - ✅ The extracted text is highlighted on the PDF
   - ✅ The highlight appears in **blue** color (indicating it's selected)
   - ✅ The highlight box matches the location of the extracted text

5. **Test multiple extractions:**
   - Click on different extractions from different fields
   - Verify each one scrolls AND highlights correctly
   - Verify the highlight color changes to blue for the selected extraction

### What to Look For

**Before the fix:**
- Page scrolls ✅
- No highlight visible ❌

**After the fix:**
- Page scrolls ✅
- Highlight visible ✅
- Highlight is blue when selected ✅
- Highlight matches the text location ✅

## Technical Details

### Components Involved

1. **ExtractionPanel.tsx** - Right sidebar showing extraction results
   - Handles click events on extractions
   - Extracts bbox from both `extraction.bbox` and `extraction.spans[0].bounds`

2. **DocumentDetailPage.tsx** - Main page component
   - Receives click events from ExtractionPanel
   - Creates highlight rectangles from extraction data
   - NOW extracts bbox consistently with ExtractionPanel

3. **PDFViewer.tsx** - PDF rendering component
   - Handles scrolling to specific pages
   - Renders highlights on the PDF
   - This component was already working correctly

### Coordinate System

The system uses PDF.js coordinates:
- **PDF Origin:** Bottom-left (Y increases upward)
- **Canvas Origin:** Top-left (Y increases downward)
- **Transformation:** Handled by `transformPDFCoordinates()` utility

### Highlight Styling

- **Default:** Yellow highlight with 30% opacity
- **Selected:** Blue highlight with 40% opacity + 2px border
- Defined in: `react-app/src/utils/pdfCoordinates.ts` (drawInteractiveHighlight function)

## Deployment

### Build Commands
```bash
# Rebuild React frontend container
docker-compose build frontend-react

# Restart container to apply changes
docker-compose restart frontend-react
```

### Verification
```bash
# Check container status
docker-compose ps frontend-react

# View container logs
docker-compose logs -f frontend-react
```

## Related Files

- `react-app/src/features/documents/DocumentDetailPage.tsx` - **MODIFIED**
- `react-app/src/features/documents/components/ExtractionPanel.tsx` - Reference for bbox extraction logic
- `react-app/src/features/documents/components/PDFViewer.tsx` - Scroll and rendering logic (unchanged)
- `react-app/src/utils/pdfCoordinates.ts` - Coordinate transformation utilities (unchanged)

## Date
Fixed: 2025-01-21

## Status
✅ **COMPLETE** - Fix deployed and ready for testing
