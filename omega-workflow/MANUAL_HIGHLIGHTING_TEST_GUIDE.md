# Manual PDF Highlighting Test Guide

**Purpose:** Verify the coordinate system fix is working correctly
**Estimated Time:** 10-15 minutes

---

## 🎯 Quick Test (5 minutes)

### Test 1: Visual Diagnostic Tool

This is the fastest way to verify the fix works:

1. **Open the diagnostic tool:**
   ```
   http://localhost:3000/tests/highlighting-diagnostic.html
   ```

2. **Click "Test BOTTOM-LEFT Origin (PDF Standard)"**

3. **Expected Result:**
   - ✅ All test cases should show "PASS" in green
   - ✅ Yellow highlights should appear exactly on the text
   - ✅ No red (wrong) highlights
   - ✅ 100% pass rate in the log

4. **Click "Test TOP-LEFT Origin (Current)"**

5. **Expected Result:**
   - ❌ All test cases should show "FAIL" in red
   - ❌ Highlights will appear in wrong positions
   - ❌ 0% pass rate

**If bottom-left shows 100% and top-left shows 0%, the fix is working! ✅**

---

## 📄 Full Test with Real Document (10 minutes)

### Prerequisites

You need a document with extraction results. Check what's available:

1. **Go to the app:**
   ```
   http://localhost:3000/
   ```

2. **Navigate to Documents section**

3. **Look for:** "BuzzFeed Agreement.pdf" or "PDF SOLUTIONS Agreement.pdf"

### Test Steps

#### Step 1: Access Document Detail Page

1. Click on a PDF document (e.g., "BuzzFeed Agreement.pdf")
2. URL should be: `http://localhost:3000/document-detail.html?id=<doc-id>`

#### Step 2: Open Browser Console

- **Chrome/Edge:** Press `F12` or `Ctrl+Shift+J` (Windows) / `Cmd+Option+J` (Mac)
- **Firefox:** Press `F12` or `Ctrl+Shift+K` (Windows) / `Cmd+Option+K` (Mac)
- **Safari:** Enable Developer Menu first, then `Cmd+Option+C`

#### Step 3: Click on Extracted Fields

In the left sidebar, look for **extracted fields** (if the document has been processed):

1. **Click on any field** in the "Extracted Terms" section
2. **Watch the PDF viewer** on the right

#### Step 4: Verify Console Logs

Look for these emoji-marked logs in the console:

✅ **Expected logs (GOOD):**
```
📐 Bbox array [L,B,R,T]: [...] (PDF bottom-left origin)
🔄 Coordinate space conversion: ...
   Scale X: ..., Scale Y: ...
📍 Bbox transform (PDF → Screen):
   PDF coords: [left=..., bottom=..., right=..., top=...]
   Y-axis flip: PDF top ... → Screen Y ... (viewport ... - ...)
🎯 Final screen coords: x=..., y=..., w=..., h=...
```

❌ **Bad logs (if fix didn't apply):**
```
📐 Bbox array [L,B,R,T]: [...] (top-left origin)  // ❌ WRONG!
```

#### Step 5: Visual Verification

**What to look for:**

✅ **CORRECT (Fix Working):**
- Yellow highlight appears **exactly on the extracted text**
- Highlight is positioned **correctly vertically**
- Text inside highlight matches the extracted value in sidebar

❌ **WRONG (Fix Not Working):**
- Highlight appears **above or below** the actual text
- Highlight is on a **completely different line**
- Highlight is **outside the visible page**

#### Step 6: Test Multiple Fields

Click on 3-5 different extracted fields and verify each one highlights correctly.

---

## 🔍 Advanced Testing

### Test Coordinate Validation

In the browser console, look for validation messages:

✅ **CORRECT (New validation):**
```
❌ Invalid bbox: bottom (...) >= top (...) - expected bottom < top in PDF bottom-left origin
```

❌ **WRONG (Old validation - shouldn't see this):**
```
❌ Invalid bbox: bottomY (...) <= topY (...) - expected bottomY > topY in top-left origin
```

### Test Text Search Fix

1. Click on a field with punctuation in the text (e.g., "(xi)", "(a)", etc.)
2. In console, look for the matching strategy:

✅ **CORRECT (Preserves punctuation):**
```
🔍 Text search for: "..."
   method: "whitespace-normalized"  ✅ Good - preserves punctuation
```

❌ **WRONG (Old behavior):**
```
   method: "normalized"  ❌ Bad - strips all punctuation
```

---

## 📊 Test Results Checklist

Fill this out as you test:

### Visual Diagnostic Tool
- [ ] Opened `http://localhost:3000/tests/highlighting-diagnostic.html`
- [ ] Bottom-left origin test: **___% pass rate** (expected: 100%)
- [ ] Top-left origin test: **___% pass rate** (expected: 0%)

### Real Document Testing
- [ ] Opened document detail page
- [ ] Console shows "PDF bottom-left origin" ✅ / ❌
- [ ] Console shows "Y-axis flip" messages ✅ / ❌
- [ ] Highlights appear on correct text ✅ / ❌
- [ ] Tested **___** fields total
- [ ] **___** highlights correct, **___** incorrect

### Text Search Testing
- [ ] Tested field with punctuation (e.g., "(xi)")
- [ ] Used "whitespace-normalized" method ✅ / ❌
- [ ] No false matches (e.g., "(x)" when searching "(xi)") ✅ / ❌

---

## 🐛 Troubleshooting

### No Highlights Appear

**Possible causes:**
1. Document doesn't have extraction results yet
2. No bbox data in extractions (old data)
3. JavaScript error occurred

**Check:**
- Console for errors (red messages)
- Left sidebar - are there "Extracted Terms"?
- Try a different document

### Highlights in Wrong Position (Still)

**Check:**
1. **Browser cache:** Hard refresh with `Ctrl+F5` / `Cmd+Shift+R`
2. **Container restart:** Run `docker-compose restart frontend`
3. **Console logs:** Confirm it says "PDF bottom-left origin"

### Containers Show (unhealthy)

This is OK for testing - the health checks might be failing but the app still works. If the page loads, you can test.

---

## 📸 Taking Screenshots

For reporting issues:

1. **Open DevTools** (F12)
2. **Go to document detail page**
3. **Click an extracted field**
4. **Take screenshot** of:
   - The PDF viewer with highlight
   - The console logs
   - The sidebar showing the clicked field

---

## ✅ Success Criteria

**The fix is working if:**

1. ✅ Visual diagnostic shows 100% pass for bottom-left
2. ✅ Console logs say "PDF bottom-left origin"
3. ✅ Console logs show "Y-axis flip" calculations
4. ✅ Highlights appear on the correct text (not offset)
5. ✅ No validation errors about "bottomY > topY"

**The fix is NOT working if:**

1. ❌ Highlights appear above/below the text
2. ❌ Console says "top-left origin"
3. ❌ No "Y-axis flip" in logs
4. ❌ Validation errors about "bottomY > topY"

---

## 📝 Report Results

After testing, report:

```
## Test Results

**Visual Diagnostic:** PASS ✅ / FAIL ❌
- Bottom-left: ___%
- Top-left: ___%

**Real Document:** PASS ✅ / FAIL ❌
- Coordinate system: Bottom-left ✅ / Top-left ❌
- Y-axis flip: Yes ✅ / No ❌
- Highlights accurate: Yes ✅ / No ❌

**Issues Found:**
[List any issues here]

**Screenshots:**
[Attach screenshots if needed]
```

---

## 🎓 Understanding the Logs

### Sample Correct Log

```javascript
📐 Bbox array [L,B,R,T]: [72, 700, 200, 720] (PDF bottom-left origin)
// This means:
// - Left edge at X=72
// - Bottom edge at Y=700 (in PDF coords, near TOP of page)
// - Right edge at X=200
// - Top edge at Y=720 (in PDF coords, even higher up)
// - bottom (700) < top (720) ✅ Correct for PDF!

🔄 Coordinate space conversion:
   MediaBox: 612.0 x 792.0
   Viewport: 612.0 x 792.0
   Scale X: 1.0000, Scale Y: 1.0000

📍 Bbox transform (PDF → Screen):
   PDF coords: [left=72, bottom=700, right=200, top=720]
   Scaled PDF: left=72.0, bottom=700.0, top=720.0
   Y-axis flip: PDF top 720.0 → Screen Y 72.0 (viewport 792.0 - 720.0)
// This is the KEY line! It flips Y from 720 (PDF) to 72 (screen)

🎯 Final screen coords: x=72.0, y=72.0, w=128.0, h=20.0
// Highlight will be at screen Y=72, which is near the TOP
// This matches because PDF Y=720 is near top, and screen Y=72 is also near top ✅
```

### What Each Log Means

- **📐 Bbox array:** Raw coordinates from Zuva API
- **🔄 Coordinate space conversion:** How we scale from PDF to viewport
- **📍 Bbox transform:** The actual coordinate transformation
- **🎯 Final screen coords:** Where the highlight will be drawn

---

**Ready to test? Start with the Visual Diagnostic Tool!**

http://localhost:3000/tests/highlighting-diagnostic.html
