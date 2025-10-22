# PDF Highlighting Coordinate Fix

## Issue Summary

**Problem:** Highlights were appearing offset to the right of the actual extracted text in PDF documents.

**Root Cause:** Incorrect scale calculation in the `renderPage` method that was subtracting 40px from the container width, creating a mismatch between PDF rendering scale and highlight positioning scale.

## Changes Made

### 1. Fixed Scale Calculation (Line 1029)

**Before:**
```javascript
scale = (containerWidth - 40) / pageViewport.width;
```

**After:**
```javascript
scale = containerWidth / pageViewport.width;
```

**Explanation:**
- The `.pdf-scroll-container` has `padding: 0` (not 40px)
- The incorrect padding adjustment was causing a scale mismatch
- Removing this adjustment ensures highlights align perfectly with the PDF content

### 2. Enhanced Debug Logging

Added comprehensive logging to help verify and debug highlighting:

**In `renderPage` method (line 1036):**
- Added Page Width to log output
- Shows: Container width, Page width, and calculated Scale

**In `highlightExtractionBbox` method (lines 1642-1660):**
- Canvas dimensions
- Overlay dimensions
- Container dimensions
- PDF bbox coordinates (raw values)
- Scale and viewport information
- Final calculated canvas coordinates

## Testing Instructions

### Manual Testing

1. **Navigate to a document with extracted fields:**
   ```
   http://app.omegaintelligence.ai/document-detail.html?id=<document_id>
   ```

2. **Click on any extracted term value** in the left sidebar that has a page reference

3. **Verify the highlight:**
   - The yellow highlight should appear directly over the text in the PDF
   - No horizontal or vertical offset
   - The highlight should pulse briefly to draw attention

4. **Check browser console logs:**
   - Look for logs starting with 📏, 🖼️, 📐, 🎯
   - Verify scale values are consistent
   - Confirm canvas and overlay dimensions match

### Expected Console Output

When clicking a term to highlight, you should see:
```
🎯 Highlighting extraction: {bbox: Array(4), page: 1, text: "..."}
📄 Page 1 - bbox: [left, bottom, right, top]
📏 Page 1 - Container: 800px, Page Width: 612px, Scale: 1.307
✅ Overlay found: <div class="pdf-page-overlay">
🖼️ Canvas dimensions: 800x1037
📦 Overlay dimensions: 800px x 1037px
📦 Container dimensions: 800x1037
📐 PDF bbox coords: [left=..., bottom=..., right=..., top=...]
📏 Scale: 1.3072, Viewport: 800.0x1037.0
🎯 Final canvas coords: x=123.4, y=456.7, w=234.5, h=12.3
✅ Highlight added to overlay
```

### What to Look For

✅ **Correct Behavior:**
- Highlights appear exactly over the extracted text
- Scale values are consistent across logs
- Canvas and overlay dimensions match
- No horizontal or vertical offset

❌ **Incorrect Behavior (if still broken):**
- Highlights offset to the right
- Scale mismatch in logs
- Dimension misalignment

## Technical Details

### Coordinate Transformation

The highlighting system transforms PDF coordinates to canvas coordinates:

1. **PDF Coordinate System:**
   - Origin: Bottom-left (0, 0)
   - Bbox format: `[left, bottom, right, top]`
   - Coordinates in PDF points (72 points = 1 inch)

2. **Canvas Coordinate System:**
   - Origin: Top-left (0, 0)
   - Coordinates in pixels

3. **Transformation Formula:**
   ```javascript
   // X coordinate (same direction)
   const x = left * scale;

   // Y coordinate (flipped axis)
   const y = viewport.height - (top * scale);

   // Dimensions
   const width = (right - left) * scale;
   const height = (top - bottom) * scale;
   ```

### Scale Consistency

The fix ensures that:
1. **Rendering scale** = `containerWidth / pageViewport.width`
2. **Highlighting scale** = Same value (retrieved from `container.dataset.scale`)
3. **Overlay dimensions** = Exactly match canvas dimensions
4. **Viewport height** = Calculated using the same scale

## Files Modified

- `/home/ubuntu/contract1/omega-workflow/frontend-vanilla-old/js/document-detail.js`
  - Line 1029: Removed `-40` from scale calculation
  - Line 1036: Enhanced logging in `renderPage`
  - Lines 1641-1660: Added comprehensive debug logging in `highlightExtractionBbox`

## Deployment

The fix is automatically applied when the frontend container restarts (dev mode with live reload).

**Container Status:**
```bash
docker ps --filter "name=omega-frontend-vanilla"
```

**View Logs:**
```bash
docker logs omega-frontend-vanilla -f
```

## Related Files

- CSS: `/home/ubuntu/contract1/omega-workflow/frontend-vanilla-old/css/document-detail.css`
  - Line 621: `.pdf-page-container { width: fit-content; }` - Eliminates highlighting offset
  - Line 629: `.pdf-page-overlay { position: absolute; top: 0; left: 0; }` - Overlay positioning
- HTML: `/home/ubuntu/contract1/omega-workflow/frontend-vanilla-old/document-detail.html`

## Next Steps

After testing, if highlighting works correctly:
1. ✅ Mark the issue as resolved
2. Consider removing some debug logs in production (keep critical ones)
3. Document the coordinate transformation for future reference

If issues persist:
1. Check browser console for error messages
2. Verify PDF.js version compatibility
3. Test with different PDF files and page sizes
4. Check for CSS conflicts affecting overlay positioning
