# Quick Test Guide: React PDF Highlighting

**Status:** ✅ DEPLOYED - Ready for testing
**Bundle:** `index-DosdSg-D.js`
**URL:** https://app-react.omegaintelligence.ai/documents/e37f9df8

---

## 🚀 Quick Start (3 Steps)

### Step 1: Hard Refresh (CRITICAL!)
**Chrome/Edge:** Press `Ctrl + Shift + R`
**Mac:** Press `Cmd + Shift + R`

Or: F12 → Right-click refresh → "Empty Cache and Hard Reload"

### Step 2: Open Console
Press `F12` → Click "Console" tab

### Step 3: Click Fields
Click any field in the right panel (e.g., "Exclusivity", "Title", "Parties")

---

## ✅ What You Should See

### Visual
- ✅ **Colored rectangle boxes** around extracted text
- ✅ **Exact boundaries** (no extra words before/after)
- ✅ **ALL extractions** highlighted (none missing)
- ✅ **Blue outline** on selected extraction
- ✅ **Pulse animation** on selected extraction

### Console Logs
```
[DEBUG] Extraction result received: {status: "completed", ...}
[DIAGNOSTIC] Highlights computed: count: X
[DIAGNOSTIC] Highlight re-render effect triggered: {affectedPages: [81]}
[PDFViewer] Rendering X highlights on page 81
[PDFViewer] Highlight rendered: {fieldId: 'exclusivity', ...}
```

---

## 🧪 Test These Fields

### Previously Broken (Now Fixed)
1. **Exclusivity** (page 81)
   - Click field → Should see highlight on page 81
   - Text: "Subject to Section 9.05, Agent shall have..."
   - ✅ Exact match, no extra words

2. **Can notice be given electronically?**
   - Multiple extractions across pages
   - ✅ All should be highlighted

3. **Term and Renewal**
   - Long multi-line text
   - ✅ Single rectangle around entire text

4. **Can the agreement be assigned?**
   - 6 extractions (pages 33, 115, etc.)
   - ✅ All 6 should be highlighted

### Always Worked (Verify Still Working)
- **Title** - "CREDIT AGREEMENT"
- **Parties** - Party names
- **Date** - Agreement date

---

## 🔍 Troubleshooting

### No Highlights Appear?

1. **Check bundle loaded:**
   ```javascript
   // Run in console:
   document.querySelector('script[src*="index-"]').src
   // Should show: index-DosdSg-D.js
   ```

2. **Check console for errors:**
   - Red error messages?
   - Network tab → Check `/api/extractions/` request

3. **Hard refresh again:**
   - Browser might still have cached old bundle

### Highlights Appear But Wrong?

1. **Extra words highlighted?**
   - Should NOT happen (coordinate-based, not text-based)
   - If this happens, share screenshot

2. **Missing highlights?**
   - Check if extraction actually has data
   - Look for: `[DIAGNOSTIC] Highlights computed: count: 0`
   - Might be extraction API issue, not highlighting

---

## 📊 Expected Diagnostic Flow

```
1. Page loads
   → [PDFViewer] PDF loaded successfully
   → [PDFViewer] Rendering all pages...

2. Extractions load (1-2 seconds later)
   → [DEBUG] Extraction result received
   → [DIAGNOSTIC] Highlights computed: count: 0 (no field selected yet)

3. User clicks field
   → [DIAGNOSTIC] Highlights computed: count: 1
   → [DIAGNOSTIC] Highlight re-render effect triggered
   → [PDFViewer] Rendering 1 highlights on page 81
   → ✅ Highlight appears!
```

---

## 🐛 What Was Fixed

### Issue #1: Race Condition (MAIN FIX)
**Problem:** Highlights didn't appear when extractions loaded
**Fix:** Removed `isLoading` check blocking re-render effect
**Result:** Highlights appear automatically when data loads

### Issue #2: Text Matching Bugs (Previous Iterations)
**Problem:** Extra words highlighted, some missing
**Fix:** Removed text-layer matching, use ONLY coordinates
**Result:** Pixel-perfect highlighting from Zuva bbox

---

## 📞 Reporting Issues

If highlighting still doesn't work, provide:

1. **Screenshot** - Show the page with or without highlights
2. **Console output** - Copy all logs from F12 console
3. **Which field** - Which field you clicked
4. **Network tab** - Status of `/api/extractions/` request
5. **Bundle check** - Result of bundle verification command

---

## 🎯 Success Criteria

Test passes if:
- ✅ Hard refresh loads new bundle (`index-DosdSg-D.js`)
- ✅ Console shows `[DIAGNOSTIC] Highlight re-render effect triggered`
- ✅ Highlights appear for ALL 8+ test fields
- ✅ No extra words highlighted
- ✅ No missing highlights
- ✅ Exact position matching

---

**Deployment Date:** 2025-11-23
**Test Time Needed:** 2-3 minutes
**Expected Result:** 100% success rate for all fields

**Remember:** Hard refresh (Ctrl+Shift+R) is CRITICAL to load new bundle!
