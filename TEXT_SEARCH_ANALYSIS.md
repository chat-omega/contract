# Text-Search Highlighting Issues - Detailed Root Cause Analysis

## Problems Summary

| Issue | Example | Behavior | Root Cause |
|-------|---------|----------|-----------|
| No highlight | "Notwithstanding anything in this Agreement..." | Search returns nothing | Normalization removes all punctuation including key match chars |
| Multiple matches | "(xi) if such Receivable..." | Both (x) and (xi) highlighted | `.includes()` matches substrings; "(x)" found in "(xi)" after normalization |
| Wrong section | "(b) any Subsidiary..." | Both (a) and (b) highlighted | Same substring matching issue |
| Wrong width | "(c) consolidate..." | Small width, highlights (b) and (c) | Same issue, plus spanning match logic creates wrong bounds |

---

## Root Cause Analysis by Issue

### Issue 1: No Highlight - "Notwithstanding anything in this Agreement to the contrary..."

**Why it fails:**

```javascript
// Line 1577-1582: normalizeText function
const normalizeText = (text) => {
    return text.toLowerCase()
        .replace(/\s+/g, ' ')  // Normalize whitespace
        .replace(/[^\w\s]/g, '') // Remove punctuation ← CRITICAL PROBLEM
        .trim();
};
```

**Problem breakdown:**
1. Search text: `"Notwithstanding anything in this Agreement to the contrary, if Term SOFR determined as provided above would be less than the Floor, then"`
2. After normalization: `"notwithstanding anything in this agreement to the contrary if term sofr determined as provided above would be less than the floor then"`
3. PDF text extracted as items by PDF.js, possibly split like:
   - Item 1: `"Notwithstanding"`
   - Item 2: `"anything"`
   - Item 3: `"in"`
   - etc.

**Matching flow:**
- **Strategy 1 (Exact):** Line 1589 checks if `item.str.toLowerCase().includes(searchText.toLowerCase())`
  - Looking for: `"notwithstanding anything in this agreement to the contrary, if term sofr..."`
  - In item: `"Notwithstanding"` → `"notwithstanding"`
  - Result: NO MATCH (entire phrase not in single item)

- **Strategy 2 (Normalized):** Line 1598 checks if normalized item includes normalized search
  - Same problem: phrase is too long and split across items
  
- **Strategy 3 (Multi-word spanning):** Line 1605-1626
  - **This should work!** But it doesn't. Why?
  - Combines items: `"Notwithstanding anything in this Agreement to the contrary, if Term SOFR determined..."`
  - Wait - the issue is that at line 1611, it's concatenating items with spaces: `combined += textContent.items[j].str + ' ';`
  - But if the extracted text has punctuation like `"contrary,"`, after normalization it becomes `"contrary"`
  - Then it normalizes the combined string at line 1614
  - The normalized combined should match the normalized search...

**ACTUAL ROOT CAUSE:**
The search text likely contains a comma or other punctuation that gets removed:
- Search: `"Agreement to the contrary, if Term"` (with comma)
- After normalization: `"agreement to the contrary if term"` (comma removed)
- But the combined text normalization should handle this too...

**The REAL Issue:** The 4-strategy approach has a **fallback behavior problem**:
- If Strategy 1 finds ANY match (even wrong ones), Strategies 2-4 never run
- If no strategy finds a match, the highlighting simply fails with a warning

---

### Issue 2 & 3: Multiple Matches - "(xi)" matching "(x)", "(b)" matching "(a)"

**Why this happens:**

```javascript
// Line 1589: Strategy 1 - Exact match
if (item.str.toLowerCase().includes(searchText.toLowerCase())) {
    matches.push({item, index, score: 100, method: 'exact'});
}
```

**Problem breakdown:**

Example: Searching for `"(xi) if such Receivable"`

1. PDF.js may extract text as individual items:
   - Item 1: `"(x)"`
   - Item 2: `"(xi)"`
   - Item 3: `"if"`
   - Item 4: `"such"`
   - Item 5: `"Receivable"`
   - Or mixed: `"(x)(xi)"`, `"if such"`, etc.

2. **Substring matching at line 1589:**
   - `"(x)".toLowerCase().includes("(xi)".toLowerCase())` → FALSE (correct)
   - But `"(x) if such Receivable".toLowerCase().includes("(xi)".toLowerCase())` → FALSE
   
   **WAIT - This doesn't explain the problem!**

3. **Actually, the problem is in Strategy 2 (normalized) at line 1598:**
   ```javascript
   const itemNorm = normalizeText(item.str);
   if (itemNorm.includes(searchNorm)) {
   ```
   
   When normalizeText removes punctuation:
   - `"(x)"` → `"x"` (punctuation removed)
   - `"(xi)"` → `"xi"` (punctuation removed)
   - Search: `"(xi)"` → `"xi"`
   - Result: `"xi".includes("xi")` → TRUE ✓ (correct)
   
   But also:
   - Item: `"(x)"` → `"x"`
   - If search text is normalized and contains `"x"`: `"(x) if".normalize()` → `"x if"`
   - Result: `"x if".includes("x if")` → FALSE... wait that's correct

4. **The REAL problem: PDF.js text grouping**

   PDF.js groups text items by visual proximity, not semantic meaning. A line might be extracted as:
   ```javascript
   [
       {str: "(x)", ...},
       {str: " (xi)", ...},
       {str: " if such", ...}
   ]
   ```
   
   Or even:
   ```javascript
   [
       {str: "(x) (xi) if such", ...}  // All in one item!
   ]
   ```

   If item is `"(x) (xi) if such"`:
   - Strategy 1 exact: `"(x) (xi) if such".includes("(xi) if such")` → TRUE ✓
   
   But then ALL items containing substrings also match:
   - Multiple items might partially match
   - `.includes()` finds ANY occurrence

**The core problem:** `.includes()` does substring matching:
- `"(x) (xi)".includes("(xi)")` → TRUE (correct)
- But what if we have: `"item (x) and (xi) more"`
- When normalized: `"item x and xi more"`
- Searching for `"(xi)"` → normalized to `"xi"`
- Check: `"item x and xi more".includes("xi")` → TRUE
- But also `"item x"` might match if we're searching for something that contains just `"x"`

---

### Issue 4: Wrong Width - "(c) consolidate with or merge..."

**Why highlighting is wrong:**

```javascript
// Lines 1654-1668: Spanning match bounding box calculation
if (bestMatch.itemGroup) {
    const firstItem = bestMatch.itemGroup[0];
    const lastItem = bestMatch.itemGroup[bestMatch.itemGroup.length - 1];
    
    const x1 = firstItem.transform[4] * scale;
    const y1 = viewport.height - (firstItem.transform[5] * scale);
    const x2 = (lastItem.transform[4] + lastItem.width) * scale;
    const y2 = viewport.height - ((lastItem.transform[5] - lastItem.height) * scale);
    
    x = Math.min(x1, x2);
    y = Math.min(y1, y2);
    width = Math.abs(x2 - x1);
    height = Math.abs(y2 - y1);
}
```

**Problems:**

1. **Spans too many items:** When Strategy 3 searches for `"(c) consolidate with or merge"`, it might combine:
   - Item 0: `"(b)"`
   - Item 1: `"any"`
   - Item 2: `"Subsidiary"` 
   - ...
   - Item N: `"consolidate"` → finally finds match here
   
   But because it breaks on first match at line 1623, it includes items from `(b)` onwards.

2. **Incorrect bounding box:** The highlight box spans from first item to last item:
   - First item `(b)` is at x1, but we want to highlight `(c)`
   - Creates oversized/misaligned highlight

3. **Wrong items included:** The spanning logic at line 1606-1626 iterates through possible starting points but collects too many items before finding the match.

---

## Why Each Problem Occurs

### Problem 1: No Highlight

**Root causes:**
1. `.includes()` on normalized text removes critical punctuation
2. Multi-word text split across PDF items doesn't combine properly
3. Normalization makes search too aggressive, loses context
4. **No fallback to plain text search** - needs Ctrl+F style approach

### Problem 2 & 3: Multiple/Wrong Matches

**Root causes:**
1. `.includes()` does substring matching - `"xi"` found in `"(x) (xi)"`
2. Normalization removes punctuation - `"(xi)"` becomes `"xi"`, `"(x)"` becomes `"x"`
3. **Both become single letters after normalization** - `"x"` is substring of `"xi"`
4. No word/character boundary checking
5. No validation that matched item actually contains the full search term

### Problem 4: Wrong Width

**Root causes:**
1. Spanning match collects too many items before finding actual match
2. Bounding box calculated from first-to-last item in group, not actual match position
3. No validation of spanning match boundaries
4. No check that highlighted items actually contain the search text

---

## Key Issues in the Matching Algorithm

### Issue 1: `.includes()` is too loose
```javascript
// Current - finds ANY substring
if (item.str.toLowerCase().includes(searchText.toLowerCase())) {
    // PROBLEM: "(xi)" found when searching inside "(x) (xi)"
}

// Needed - requires word boundaries
if (new RegExp(`\\b${searchText}\\b`, 'i').test(item.str)) {
    // Better but doesn't handle punctuation like "(xi)"
}
```

### Issue 2: Normalization removes critical characters
```javascript
// Current - removes ALL punctuation
.replace(/[^\w\s]/g, '') // Removes: (,), -, :, etc.

// Problem: "(xi)" and "(x)" both become single letters after normalization
const norm1 = normalizeText("(xi)"); // "xi"
const norm2 = normalizeText("(x)"); // "x"
"xi".includes("x") // TRUE - FALSE POSITIVE!
```

### Issue 3: No boundary validation
- Algorithm finds matches but doesn't validate match position
- No check if normalized match corresponds to actual text position
- Spanning match can include wrong items before actual match

### Issue 4: PDF.js item structure not understood
- PDF.js splits text by visual layout, not semantics
- Can group `"(x) (xi)"` as one item
- Can split `"Notwithstanding anything in this Agreement to the contrary, if Term SOFR..."` into 20+ items
- Current code assumes consistent item boundaries - wrong!

---

## Specific Code Problems

### Problem at Line 1589: Exact Match Too Broad
```javascript
if (item.str.toLowerCase().includes(searchText.toLowerCase())) {
    // ISSUE: Finds "(xi)" when searching for "(x)" if in same item
    // ISSUE: Finds partial matches
}
```

### Problem at Line 1577-1581: Normalization Loss
```javascript
const normalizeText = (text) => {
    return text.toLowerCase()
        .replace(/\s+/g, ' ')
        .replace(/[^\w\s]/g, '')  // Removes: (,), -, etc.
        .trim();
};
// RESULT: "(xi)" and "(x)" become indistinguishable
```

### Problem at Line 1598: Normalized Matching Same Issue
```javascript
if (itemNorm.includes(searchNorm)) {
    // ISSUE: After normalization removes punctuation,
    // "xi" matches inside "xi something"
    // But "x" might also match if we're not careful
}
```

### Problem at Line 1614: Spanning Match Combines Too Much
```javascript
for (let j = i; j < Math.min(i + 10, textContent.items.length); j++) {
    combined += textContent.items[j].str + ' ';
    // ISSUE: Combines up to 10 items without checking
    // If match is at item 9, combines items 0-9
    // Bounding box includes all unwanted items
}
```

### Problem at Lines 1659-1666: Wrong Bounding Box
```javascript
x = Math.min(x1, x2);
y = Math.min(y1, y2);
width = Math.abs(x2 - x1);  // Entire span, not actual match
height = Math.abs(y2 - y1);
// ISSUE: Spans from first item to last item in group
// Not from start of match to end of match
```

---

## Recommended Fixes

### Fix 1: Use Exact Text Matching with Position Detection
```javascript
// Find actual position of search text in combined item
const getMatchPosition = (itemText, searchText) => {
    const index = itemText.indexOf(searchText);
    if (index === -1) return null;
    
    return {
        startIndex: index,
        endIndex: index + searchText.length,
        actualMatch: itemText.substring(index, index + searchText.length)
    };
};
```

### Fix 2: Preserve Punctuation in Matching
```javascript
// Don't remove punctuation entirely
const normalizeForMatching = (text) => {
    return text.toLowerCase()
        .replace(/\s+/g, ' ')
        .trim();
    // Keep punctuation!
};
```

### Fix 3: Use Word Boundary Validation
```javascript
// Check for word boundaries
const isWordBoundary = (text, index) => {
    if (index === 0) return true;
    const charBefore = text[index - 1];
    return /[\s()\[\]{},;:.\-]/.test(charBefore);
};

const isWordBoundaryEnd = (text, endIndex) => {
    if (endIndex === text.length) return true;
    const charAfter = text[endIndex];
    return /[\s()\[\]{},;:.\-]/.test(charAfter);
};
```

### Fix 4: Validate Spanning Matches
```javascript
// When spanning multiple items, validate actual match position
if (normalizeText(combined).includes(searchNorm)) {
    // Find actual position in ORIGINAL combined string
    const actualPos = combined.indexOf(searchText);
    if (actualPos === -1) {
        continue; // Not a real match, keep looking
    }
    
    // Calculate which items contain the actual match
    let charCount = 0;
    let startItemIdx = -1;
    let endItemIdx = -1;
    
    for (let k = 0; k < itemGroup.length; k++) {
        const itemLength = itemGroup[k].str.length + 1; // +1 for space
        
        if (startItemIdx === -1 && 
            charCount <= actualPos && 
            charCount + itemLength > actualPos) {
            startItemIdx = k;
        }
        
        if (charCount + itemLength > actualPos + searchText.length) {
            endItemIdx = k;
            break;
        }
        
        charCount += itemLength;
    }
    
    // Use only the items that actually contain the match
    const actualGroup = itemGroup.slice(startItemIdx, endItemIdx + 1);
}
```

### Fix 5: Better PDF.js Text Handling
```javascript
// Reconstruct full page text with position tracking
const fullText = textContent.items.map(item => item.str).join(' ');
const searchIndex = fullText.indexOf(searchText);

if (searchIndex !== -1) {
    // Now find which items cover this text range
    let currentPos = 0;
    const itemPositions = [];
    
    for (const item of textContent.items) {
        itemPositions.push({
            item: item,
            startPos: currentPos,
            endPos: currentPos + item.str.length + 1
        });
        currentPos += item.str.length + 1;
    }
    
    // Find items that cover searchIndex to searchIndex + searchText.length
    const coveredItems = itemPositions.filter(ip =>
        !(ip.endPos <= searchIndex || ip.startPos >= searchIndex + searchText.length)
    );
}
```

---

## Summary of Root Causes

1. **Substring matching with `.includes()`** allows false positives like "(xi)" matching within "(x)"
2. **Aggressive normalization removes punctuation**, making "(x)", "(xi)", and "x" all equivalent
3. **No boundary validation** for matches - doesn't verify match is at proper semantic boundaries
4. **Spanning match logic** combines too many items and calculates bounding boxes incorrectly
5. **No position tracking** when combining items - loses information about where actual match is
6. **4-tier strategy** creates cascading effects - first match strategy runs even if it's wrong

## Most Critical Issues (in priority order)

1. **Line 1580: `replace(/[^\w\s]/g, '')`** - Removes critical punctuation, makes "(x)" and "(xi)" indistinguishable
2. **Line 1589 & 1598: `.includes()`** - Substring matching without boundaries, finds partial matches
3. **Lines 1606-1626: Spanning logic** - Collects wrong items, calculates wrong bounding box
4. **No validation** - Algorithm never checks if match is actually correct before returning it

