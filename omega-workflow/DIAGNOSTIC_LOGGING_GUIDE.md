# Diagnostic Logging Guide - Highlighting Race Condition Analysis

**Date:** 2025-11-23
**Status:** ✅ **DEPLOYED - DIAGNOSTIC BUILD**
**Bundle:** `index-D8x-quve.js` (430.77 kB)

---

## 🎯 Purpose

This build includes **diagnostic logging** to identify the exact race condition preventing highlights from appearing. The logs will show us:

1. When extraction data loads
2. When highlights array is computed
3. When `renderHighlightsForPage()` is called
4. Whether highlights array is empty or populated at each stage

---

## 🧪 Testing Instructions

### ⚠️ CRITICAL: Hard Refresh Required!

**Chrome/Edge:** `Ctrl + Shift + R` (Windows/Linux) or `Cmd + Shift + R` (Mac)

### Step-by-Step Testing

1. **Open the test document:**
   ```
   https://app-react.omegaintelligence.ai/documents/e37f9df8
   ```

2. **Open browser console BEFORE loading:**
   - Press `F12` to open DevTools
   - Go to "Console" tab
   - **Clear console** (trash icon)

3. **Hard refresh the page:**
   - `Ctrl + Shift + R` to load new bundle
   - Watch console as page loads

4. **Wait for page to fully load:**
   - Wait until you see "Page X rendered" messages

5. **Click on a field** (e.g., "Title" or "Exclusivity"):
   - Watch console for new log messages

6. **Copy ALL console logs:**
   - Right-click in console → "Save as..." or select all and copy
   - Send logs for analysis

---

## 📊 What to Look For in Console Logs

### Expected Log Sequence (If Working Correctly)

```
[DEBUG] Extraction result received: {...}
[DEBUG] Extraction status: completed
[DEBUG] Results object: {...}
[DEBUG] Results keys: ["title", "parties", ...]

[DIAGNOSTIC] Computing highlights...
  hasExtractions: true
  hasResults: true
  selectedFieldId: "title"
  selectedExtractionIndex: null

[DIAGNOSTIC] Highlights computed:
  count: 1
  highlights: [
    {fieldId: "title", page: 2, hasBbox: true, hasText: true}
  ]

[PDFViewer] Page 2 rendered: {width: 612, height: 792, ...}

[DIAGNOSTIC] renderHighlightsForPage called:
  pageNumber: 2
  totalHighlights: 1
  highlightsForThisPage: 1

[PDFViewer] Rendering 1 highlights on page 2
[PDFViewer] Highlight rendered: {fieldId: 'title', ...}
```

### Problem Log Sequence (If Broken - Race Condition)

```
[PDFViewer] Page 2 rendered: {width: 612, height: 792, ...}

[DIAGNOSTIC] renderHighlightsForPage called:
  pageNumber: 2
  totalHighlights: 0  ← PROBLEM: Empty!
  highlightsForThisPage: 0

[DIAGNOSTIC] No highlights for page 2 - returning early (canvas cleared)

[DEBUG] Extraction result received: {...}  ← ARRIVES TOO LATE!
[DEBUG] Extraction status: completed
[DEBUG] Results object: {...}

[DIAGNOSTIC] Computing highlights...
  hasExtractions: true
  hasResults: true
  selectedFieldId: "title"
  selectedExtractionIndex: null

[DIAGNOSTIC] Highlights computed:
  count: 1  ← NOW we have highlights, but too late!
  highlights: [...]
```

**The Issue:** Page renders and tries to highlight BEFORE extraction data has loaded!

---

## 🔍 Diagnostic Log Meanings

### Log 1: `[DIAGNOSTIC] Computing highlights...`
**Location:** `DocumentDetailPage.tsx` line 63
**Purpose:** Shows when React is computing the highlights array

**What to check:**
- `hasExtractions`: Should be `true` if data loaded
- `hasResults`: Should be `true` if extraction results exist
- `selectedFieldId`: Should match the field you clicked
- `selectedExtractionIndex`: Should be `null` (for all extractions) or a number (for specific extraction)

**Problem indicators:**
- ❌ `hasExtractions: false` → Extractions haven't loaded yet
- ❌ `hasResults: false` → Results object is missing
- ❌ `selectedFieldId: null` → No field selected (expected on initial load)

---

### Log 2: `[DIAGNOSTIC] No extractions or results - returning empty highlights array`
**Location:** `DocumentDetailPage.tsx` line 71
**Purpose:** Indicates highlights array will be empty because no data

**What this means:**
- Extraction data hasn't loaded yet
- Highlights array will be `[]`
- `renderHighlightsForPage()` will have nothing to draw

**This is NORMAL on initial page load, but should NOT happen after field click!**

---

### Log 3: `[DIAGNOSTIC] Highlights computed:`
**Location:** `DocumentDetailPage.tsx` line 125
**Purpose:** Shows the final highlights array that was computed

**What to check:**
- `count`: Should be > 0 if field is selected and data exists
- `highlights`: Array of highlight objects with metadata

**Problem indicators:**
- ❌ `count: 0` after field click → No highlights created (missing data?)
- ❌ `hasBbox: false` → Missing bbox coordinates (extraction parsing issue)
- ❌ `hasText: false` → Missing extraction text (extraction parsing issue)

---

### Log 4: `[DIAGNOSTIC] renderHighlightsForPage called:`
**Location:** `PDFViewer.tsx` line 412
**Purpose:** Shows when the render function is called and what state it has

**What to check:**
- `pageNumber`: Which page is being rendered
- `totalHighlights`: How many highlights in the entire array
- `highlightsForThisPage`: How many highlights for this specific page

**Problem indicators:**
- ❌ `totalHighlights: 0` → Highlights array is empty (race condition!)
- ❌ `highlightsForThisPage: 0` when you expect highlights → Wrong page number?

---

### Log 5: `[DIAGNOSTIC] No highlights for page X - returning early (canvas cleared)`
**Location:** `PDFViewer.tsx` line 431
**Purpose:** Indicates the function exited early because no highlights exist

**What this means:**
- Canvas was cleared
- No highlights were drawn
- Function returned without rendering anything

**This is the SYMPTOM of the race condition!**

---

### Log 6: `[PDFViewer] Rendering X highlights on page Y`
**Location:** `PDFViewer.tsx` line 435
**Purpose:** Indicates highlights ARE being rendered

**What to check:**
- `X`: Number of highlights being drawn
- `Y`: Page number

**If you see this, highlights SHOULD be visible!**

---

## 🐛 Common Race Condition Patterns

### Pattern 1: Highlights Load AFTER Page Render

```
1. [PDFViewer] Page 2 rendered
2. [DIAGNOSTIC] renderHighlightsForPage called: totalHighlights: 0
3. [DIAGNOSTIC] No highlights for page 2 - returning early
4. [DEBUG] Extraction result received  ← TOO LATE!
5. [DIAGNOSTIC] Highlights computed: count: 1  ← NOW we have them
```

**Problem:** Page renders before data loads
**Solution:** Wait for extractions to load before rendering highlights

---

### Pattern 2: Multiple Renders with Empty Highlights

```
1. [DIAGNOSTIC] renderHighlightsForPage called: totalHighlights: 0
2. [DIAGNOSTIC] No highlights for page 2 - returning early
3. [DIAGNOSTIC] renderHighlightsForPage called: totalHighlights: 0
4. [DIAGNOSTIC] No highlights for page 2 - returning early
5. [DEBUG] Extraction result received
6. [DIAGNOSTIC] Highlights computed: count: 1
```

**Problem:** Multiple render attempts before data loads
**Solution:** Debounce rendering or wait for data

---

### Pattern 3: Highlights Computed But Never Rendered

```
1. [DEBUG] Extraction result received
2. [DIAGNOSTIC] Highlights computed: count: 1
3. [PDFViewer] Page 2 rendered
4. (no renderHighlightsForPage logs!)
```

**Problem:** Highlights exist but render function not called
**Solution:** Missing dependency in useEffect or render trigger

---

## 📋 Information to Collect

When sharing logs for analysis, please provide:

1. **Full console output** (from page load to field click)
2. **Which field you clicked** (e.g., "Title", "Exclusivity")
3. **What you see visually** (blank? highlights? wrong highlights?)
4. **Timestamp of key events:**
   - When page loaded
   - When you clicked field
   - When extractions arrived

5. **Network tab info:**
   - Check for `/api/extractions/` request
   - Status code (200? 404? 500?)
   - Response data (does it have results?)

---

## ✅ Success Criteria

**Highlights are working if you see this sequence:**

1. ✅ `[DEBUG] Extraction result received` BEFORE page renders
2. ✅ `[DIAGNOSTIC] Highlights computed: count: > 0`
3. ✅ `[DIAGNOSTIC] renderHighlightsForPage called: totalHighlights: > 0`
4. ✅ `[PDFViewer] Rendering X highlights on page Y`
5. ✅ `[PDFViewer] Highlight rendered: {...}`

**AND visually:**
- ✅ Colored rectangle boxes appear around extracted text
- ✅ No extra words highlighted
- ✅ All extractions for the field show up

---

## 🔧 Next Steps Based on Logs

### If logs show: "Extractions load BEFORE renders"
→ **Great!** The race condition is already fixed. Issue is elsewhere (bbox parsing? coordinate transform?).

### If logs show: "Renders BEFORE extractions load"
→ **Race condition confirmed!** Need to:
1. Add loading state check before rendering
2. Re-render when extractions arrive
3. Or defer PDF rendering until data loads

### If logs show: "Highlights computed: count: 0"
→ **Data issue!** Need to check:
1. Is `selectedFieldId` correct?
2. Does extraction data have the selected field?
3. Does extraction have valid bbox?

### If logs show: "Highlights > 0 but not rendered"
→ **Rendering trigger missing!** Need to:
1. Check useEffect dependencies
2. Ensure `renderHighlightsForPage` is in render cycle
3. Verify canvas exists and is not destroyed

---

## 📞 Sharing Results

After testing, please share:

1. **Full console output** (copy/paste or screenshot)
2. **Network tab** showing /api/extractions/ request
3. **Visual result** (screenshot of page with or without highlights)
4. **Which pattern** from above matches your logs

This will allow us to identify the exact fix needed!

---

**Deployment Date:** 2025-11-23
**Bundle:** `index-D8x-quve.js`
**Status:** ✅ Ready for diagnostic testing
**Test URL:** https://app-react.omegaintelligence.ai/documents/e37f9df8
**Remember:** Hard refresh (Ctrl+Shift+R) and open console (F12) BEFORE loading page!
