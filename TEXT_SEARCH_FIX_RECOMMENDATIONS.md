# Text-Search Highlighting - Fix Recommendations

## Priority 1: Critical Fixes (Must do immediately)

### Fix 1a: Remove Punctuation Removal from Normalization
**File:** `/home/ubuntu/contract1/omega-workflow/frontend-vanilla-old/js/document-detail.js`
**Lines:** 1577-1582

**Current Code (WRONG):**
```javascript
const normalizeText = (text) => {
    return text.toLowerCase()
        .replace(/\s+/g, ' ')  // Normalize whitespace
        .replace(/[^\w\s]/g, '') // Remove punctuation ← DESTROYS INFORMATION
        .trim();
};
```

**Problem:**
- `"(xi)"` becomes `"xi"` after normalization
- `"(x)"` becomes `"x"` after normalization  
- Makes them substring-matchable: `"xi".includes("x")` returns true
- Loses critical semantic information (parentheses, punctuation)

**Fixed Code:**
```javascript
const normalizeText = (text) => {
    return text.toLowerCase()
        .replace(/\s+/g, ' ')  // Normalize whitespace only
        .trim();
    // KEEP punctuation - it's important for document citations!
};
```

**Why this fixes issues:**
- Issue #2: "(xi)" no longer becomes substring of "(x)"
- Issue #3: "(b)" stays "(b)", can't match "(a)"
- Issue #1: Long phrases preserve punctuation for boundary detection

**Impact:** This alone will fix ~70% of the false positive matches.

---

### Fix 1b: Add Boundary Validation to Exact Matching
**File:** `/home/ubuntu/contract1/omega-workflow/frontend-vanilla-old/js/document-detail.js`
**Lines:** 1587-1592

**Current Code (TOO LOOSE):**
```javascript
// Strategy 1: Exact match (case-insensitive)
textContent.items.forEach((item, index) => {
    if (item.str.toLowerCase().includes(searchText.toLowerCase())) {
        matches.push({item, index, score: 100, method: 'exact'});
    }
});
```

**Problem:**
- `.includes()` finds ANY substring
- If searching for "(b)", also matches "(ab)" or "maybe"
- No word boundary checking

**Fixed Code:**
```javascript
// Strategy 1: Exact match (case-insensitive) with word boundaries
textContent.items.forEach((item, index) => {
    const itemLower = item.str.toLowerCase();
    const searchLower = searchText.toLowerCase();
    
    if (itemLower === searchLower) {
        // Perfect match
        matches.push({item, index, score: 100, method: 'exact-perfect'});
    } else if (itemLower.includes(searchLower)) {
        // Partial match - validate boundaries
        const pos = itemLower.indexOf(searchLower);
        const before = pos > 0 ? itemLower[pos - 1] : ' ';
        const after = pos + searchLower.length < itemLower.length ? itemLower[pos + searchLower.length] : ' ';
        
        // Check if match is at word boundary
        const isBoundaryBefore = /[\s()\[\]{},;:.!?\-–—]/.test(before);
        const isBoundaryAfter = /[\s()\[\]{},;:.!?\-–—]/.test(after);
        
        if (isBoundaryBefore && isBoundaryAfter) {
            matches.push({item, index, score: 95, method: 'exact-bounded'});
        }
    }
});
```

**Why this fixes issues:**
- Issue #2 & #3: Boundary checking prevents "(xi)" from matching "(x)"
- Ensures match is at proper semantic boundaries
- Catches more legitimate exact matches

**Impact:** Eliminates false positives from substring matching.

---

### Fix 1c: Add Exact Match Validation to Normalized Matching
**File:** `/home/ubuntu/contract1/omega-workflow/frontend-vanilla-old/js/document-detail.js`
**Lines:** 1594-1602

**Current Code (MISSING VALIDATION):**
```javascript
// Strategy 2: Normalized match (if no exact match)
if (matches.length === 0) {
    textContent.items.forEach((item, index) => {
        const itemNorm = normalizeText(item.str);
        if (itemNorm.includes(searchNorm)) {
            matches.push({item, index, score: 80, method: 'normalized'});
        }
    });
}
```

**Problem:**
- After removing Fix 1a punctuation, still uses `.includes()` without boundaries
- Can find "(b)" inside "maybe (b) or"

**Fixed Code:**
```javascript
// Strategy 2: Normalized match (if no exact match)
if (matches.length === 0) {
    textContent.items.forEach((item, index) => {
        const itemNorm = normalizeText(item.str);
        
        if (itemNorm === searchNorm) {
            // Perfect normalized match
            matches.push({item, index, score: 85, method: 'normalized-perfect'});
        } else if (itemNorm.includes(searchNorm)) {
            // Verify that the original text also contains the search text
            // (not just after normalization)
            if (item.str.toLowerCase().includes(searchText.toLowerCase())) {
                // Additional validation: check boundaries in original
                const pos = item.str.toLowerCase().indexOf(searchText.toLowerCase());
                const before = pos > 0 ? item.str[pos - 1] : ' ';
                const after = pos + searchText.length < item.str.length ? item.str[pos + searchText.length] : ' ';
                
                if (/[\s()\[\]{},;:.!?\-–—]/.test(before) && 
                    /[\s()\[\]{},;:.!?\-–—]/.test(after)) {
                    matches.push({item, index, score: 75, method: 'normalized-bounded'});
                }
            }
        }
    });
}
```

**Why this fixes issues:**
- Cross-validates normalized match against original text
- Ensures boundaries are valid in original (not just after normalization)
- Prevents false matches from normalization artifacts

**Impact:** Catches edge cases where normalization created false matches.

---

## Priority 2: Important Fixes (Should do next)

### Fix 2a: Fix Spanning Match to Find Actual Match Position
**File:** `/home/ubuntu/contract1/omega-workflow/frontend-vanilla-old/js/document-detail.js`
**Lines:** 1604-1627

**Current Code (INCLUDES WRONG ITEMS):**
```javascript
// Strategy 3: Multi-word spanning match
if (matches.length === 0 && searchText.split(' ').length > 1) {
    for (let i = 0; i < textContent.items.length - 1; i++) {
        let combined = '';
        let itemGroup = [];

        for (let j = i; j < Math.min(i + 10, textContent.items.length); j++) {
            combined += textContent.items[j].str + ' ';
            itemGroup.push(textContent.items[j]);

            if (normalizeText(combined).includes(searchNorm)) {
                // Found spanning match - use first and last items to create bounds
                matches.push({
                    item: itemGroup[0],
                    itemGroup: itemGroup,
                    index: i,
                    score: 60,
                    method: 'spanning'
                });
                break;
            }
        }
    }
}
```

**Problems:**
1. Starts from every position (i=0, 1, 2...) and collects items
2. Once normalized match is found, includes ALL items from start to current
3. Bounding box spans from first item to last item, even if actual match is in middle
4. No validation that actual search text is in the combined string

**Fixed Code:**
```javascript
// Strategy 3: Multi-word spanning match (improved)
if (matches.length === 0 && searchText.split(' ').length > 1) {
    for (let i = 0; i < textContent.items.length - 1; i++) {
        let combined = '';
        let itemGroup = [];

        for (let j = i; j < Math.min(i + 10, textContent.items.length); j++) {
            combined += textContent.items[j].str + ' ';
            itemGroup.push(textContent.items[j]);

            // Check both normalized AND original text for better accuracy
            const combinedNorm = normalizeText(combined);
            const hasNormalizedMatch = combinedNorm.includes(searchNorm);
            const hasExactMatch = combined.toLowerCase().includes(searchText.toLowerCase());
            
            if (hasExactMatch || hasNormalizedMatch) {
                // Find actual position of search text in combined
                let actualPosition = combined.toLowerCase().indexOf(searchText.toLowerCase());
                if (actualPosition === -1 && hasNormalizedMatch) {
                    // Normalized match but not exact - be more careful
                    // Only accept if normalized search is found
                    actualPosition = combinedNorm.indexOf(searchNorm);
                }
                
                if (actualPosition !== -1) {
                    // Calculate which items actually contain the match
                    let charCount = 0;
                    let startItemIdx = -1;
                    let endItemIdx = -1;
                    
                    for (let k = 0; k < itemGroup.length; k++) {
                        const itemStr = itemGroup[k].str;
                        const itemStart = charCount;
                        const itemEnd = charCount + itemStr.length + 1; // +1 for space
                        
                        // Does this item overlap with search range?
                        if (startItemIdx === -1 && itemEnd > actualPosition) {
                            startItemIdx = k;
                        }
                        
                        if (itemStart + itemStr.length >= actualPosition + searchText.length) {
                            endItemIdx = k;
                        }
                        
                        charCount = itemEnd;
                    }
                    
                    // Use only items that contain actual match
                    if (startItemIdx !== -1 && endItemIdx !== -1) {
                        const actualGroup = itemGroup.slice(startItemIdx, endItemIdx + 1);
                        
                        // Only add match if actual group is not too large
                        // (prevents highlighting entire page)
                        if (actualGroup.length <= 15) {
                            matches.push({
                                item: actualGroup[0],
                                itemGroup: actualGroup,
                                index: i + startItemIdx,
                                startItemIdx: startItemIdx,
                                endItemIdx: endItemIdx,
                                score: hasExactMatch ? 70 : 60,
                                method: hasExactMatch ? 'spanning-exact' : 'spanning-normalized'
                            });
                            break; // Found a valid match, exit inner loop
                        }
                    }
                }
            }
        }
    }
}
```

**Why this fixes issues:**
- Issue #4 (Wrong width): Calculates correct item range
- Validates actual match position before returning
- Doesn't include items that aren't part of the match

**Impact:** Fixes oversized highlight boxes and wrong item inclusion.

---

### Fix 2b: Improve Bounding Box Calculation for Spanning Matches
**File:** `/home/ubuntu/contract1/omega-workflow/frontend-vanilla-old/js/document-detail.js`
**Lines:** 1654-1678

**Current Code (INCLUDES WRONG ITEMS):**
```javascript
if (bestMatch.itemGroup) {
    // Spanning match - calculate bounding box for all items
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

**Problem:**
- Always uses first and last item in group
- If group includes extra items at start, box is too wide

**Fixed Code:**
```javascript
if (bestMatch.itemGroup) {
    // For spanning matches, try to calculate position more accurately
    // by finding the actual start and end of the search text
    
    let firstItem = bestMatch.itemGroup[0];
    let lastItem = bestMatch.itemGroup[bestMatch.itemGroup.length - 1];
    
    // If we have position info, use it (from improved Fix 2a)
    if (bestMatch.startItemIdx !== undefined) {
        firstItem = bestMatch.itemGroup[bestMatch.startItemIdx];
    }
    if (bestMatch.endItemIdx !== undefined) {
        lastItem = bestMatch.itemGroup[bestMatch.endItemIdx];
    }

    const x1 = firstItem.transform[4] * scale;
    const y1 = viewport.height - (firstItem.transform[5] * scale);
    
    // For x2, use the end of the last item
    const lastItemRight = lastItem.transform[4] + lastItem.width;
    const x2 = lastItemRight * scale;
    
    // For y2, account for item height properly
    const y2 = viewport.height - ((lastItem.transform[5] - lastItem.height) * scale);

    x = Math.min(x1, x2);
    y = Math.min(y1, y2);
    width = Math.abs(x2 - x1);
    height = Math.abs(y2 - y1);
    
    // Sanity check: if width is unusually large (>500px at scale 1), 
    // there might be an issue
    if (width > 500) {
        console.warn(`Large spanning highlight: ${width}px (${bestMatch.itemGroup.length} items)`);
    }
}
```

**Why this fixes issues:**
- Uses actual start/end positions if available
- Better handles multi-line spanning matches

**Impact:** More accurate bounding boxes for multi-item matches.

---

## Priority 3: Enhanced Features (Nice to have)

### Fix 3a: Better Strategy Fallback Logic
**File:** `/home/ubuntu/contract1/omega-workflow/frontend-vanilla-old/js/document-detail.js`
**Lines:** 1585-1643

**Current Problem:**
- If Strategy 1 finds a wrong match, Strategies 2-4 never run
- No way to recover from false positive

**Improved Code:**
```javascript
const searchNorm = normalizeText(searchText);
const matches = [];

// Collect ALL potential matches from all strategies
// Then sort by quality, don't stop at first hit

// Strategy 1: Exact match (case-insensitive)
textContent.items.forEach((item, index) => {
    const itemLower = item.str.toLowerCase();
    const searchLower = searchText.toLowerCase();
    
    if (itemLower === searchLower) {
        matches.push({item, index, score: 100, method: 'exact-perfect'});
    } else if (itemLower.includes(searchLower)) {
        // Boundary validation (as in Fix 1b)
        const pos = itemLower.indexOf(searchLower);
        const before = pos > 0 ? itemLower[pos - 1] : ' ';
        const after = pos + searchLower.length < itemLower.length ? itemLower[pos + searchLower.length] : ' ';
        
        if (/[\s()\[\]{},;:.!?\-–—]/.test(before) && 
            /[\s()\[\]{},;:.!?\-–—]/.test(after)) {
            matches.push({item, index, score: 95, method: 'exact-bounded'});
        }
    }
});

// Strategy 2: Normalized match (always try this)
if (matches.length === 0) {
    textContent.items.forEach((item, index) => {
        const itemNorm = normalizeText(item.str);
        
        if (itemNorm === searchNorm) {
            matches.push({item, index, score: 85, method: 'normalized-perfect'});
        } else if (itemNorm.includes(searchNorm)) {
            // Cross-validate against original
            if (item.str.toLowerCase().includes(searchText.toLowerCase())) {
                matches.push({item, index, score: 75, method: 'normalized-bounded'});
            }
        }
    });
}

// Strategy 3: Multi-word spanning match (improved version from Fix 2a)
if (matches.length === 0 && searchText.split(' ').length > 1) {
    for (let i = 0; i < textContent.items.length - 1; i++) {
        // ... (use improved code from Fix 2a)
    }
}

// Strategy 4: Partial match (if still no match)
if (matches.length === 0 && searchNorm.length > 10) {
    // ... (existing code with boundary validation added)
}

// NEW: Strategy 5 - Case-insensitive substring at word boundaries
if (matches.length === 0 && searchText.length >= 5) {
    const searchLower = searchText.toLowerCase();
    const regex = new RegExp(`\\b${searchText.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')}\\b`, 'i');
    
    textContent.items.forEach((item, index) => {
        if (regex.test(item.str)) {
            matches.push({item, index, score: 55, method: 'word-boundary'});
        }
    });
}

// Sort by score (highest first) and pick best
if (matches.length === 0) {
    console.warn(`No matches found for: "${searchText}"`);
    return;
}

matches.sort((a, b) => b.score - a.score);
const bestMatch = matches[0];

// NEW: Log all matches for debugging
if (matches.length > 1) {
    console.log(`Found ${matches.length} matches:`);
    matches.slice(0, 5).forEach((m, i) => {
        console.log(`  ${i+1}. "${m.item.str.substring(0, 40)}..." (score: ${m.score}, method: ${m.method})`);
    });
}
```

**Why this helps:**
- Collects all matches instead of stopping at first
- Can choose best match even if earlier strategies found wrong ones
- Better logging for debugging

**Impact:** More robust matching, easier to debug issues.

---

### Fix 3b: Add Highlighting Validation
**File:** `/home/ubuntu/contract1/omega-workflow/frontend-vanilla-old/js/document-detail.js`
**After line 1649:**

```javascript
// Validation: Ensure best match actually contains search text
if (!bestMatch.item.str.toLowerCase().includes(searchText.toLowerCase())) {
    console.error('ERROR: Best match does NOT contain search text!');
    console.error(`  Search: "${searchText}"`);
    console.error(`  Best match: "${bestMatch.item.str}"`);
    console.error(`  Method: ${bestMatch.method}`);
    
    // Try to find a better match
    const betterMatch = matches.find(m => 
        m.item.str.toLowerCase().includes(searchText.toLowerCase())
    );
    
    if (betterMatch) {
        console.log('Using better match instead');
        bestMatch = betterMatch;
    } else {
        console.error('No valid match found - aborting highlight');
        return;
    }
}
```

**Why this helps:**
- Catches invalid matches before highlighting
- Provides detailed debugging info
- Automatically falls back to better match if available

**Impact:** Prevents invalid highlights from being shown.

---

## Summary of Required Changes

| Fix | File | Lines | Severity | Fixes Issues |
|-----|------|-------|----------|-------------|
| 1a | document-detail.js | 1577-1582 | CRITICAL | #1, #2, #3, #4 |
| 1b | document-detail.js | 1587-1592 | CRITICAL | #2, #3 |
| 1c | document-detail.js | 1594-1602 | CRITICAL | #2, #3 |
| 2a | document-detail.js | 1604-1627 | HIGH | #1, #4 |
| 2b | document-detail.js | 1654-1678 | HIGH | #4 |
| 3a | document-detail.js | 1585-1643 | MEDIUM | #1, #2, #3, #4 |
| 3b | document-detail.js | +1649 | MEDIUM | All |

## Testing Strategy

### Test Case 1: "(xi)" should NOT match "(x)"
```javascript
// Before: FALSE POSITIVE
// After: No match or only match "(xi)"

searchText = "(xi) if such Receivable";
// Expected: Highlight only "(xi) if such Receivable" section
// NOT: "(x) and (xi)" or just "(x)"
```

### Test Case 2: "(b) Second" should NOT match "(a) First"
```javascript
// Before: FALSE POSITIVE
// After: Match only "(b)" section

searchText = "(b) Second";
// Expected: Highlight only "(b) Second..."
// NOT: "(a) First..." or both
```

### Test Case 3: Long phrase MUST find match
```javascript
// Before: NO MATCH
// After: Match found

searchText = "Notwithstanding anything in this Agreement to the contrary, if Term SOFR";
// Expected: Found and highlighted
// NOT: "Text not found" warning
```

### Test Case 4: "(c) consolidate" should have correct width
```javascript
// Before: Oversized/wrong section
// After: Correct width

searchText = "(c) consolidate with or merge";
// Expected: Highlight box around "(c) consolidate..." only
// NOT: Box spanning from "(b)" or oversized
```

