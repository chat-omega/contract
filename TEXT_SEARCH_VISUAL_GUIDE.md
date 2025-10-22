# Text-Search Highlighting - Visual Diagnosis Guide

## Problem 1: False Positive - "(xi)" matches "(x)"

### How PDF.js Extracts Text
```
Document: "(x) and (xi) if something"
                ↓
        PDF.js text extraction
                ↓
┌─────────────────────────────────────────────────────┐
│ textContent.items = [                               │
│   {str: "(x)"},          ← Item 0                   │
│   {str: "and"},          ← Item 1                   │
│   {str: "(xi)"},         ← Item 2                   │
│   {str: "if"},           ← Item 3                   │
│   {str: "something"}     ← Item 4                   │
│ ]                                                   │
└─────────────────────────────────────────────────────┘
```

### Current Matching Algorithm - WRONG
```
Search: "(xi) if something"
        ↓
Normalization: "(xi)" → "xi"
        ↓
Loop through items:
  Item 0: "(x)" → normalized to "x"
          "x".includes("xi if something") → FALSE ✓
  
  Item 1: "and" → normalized to "and"
          "and".includes("xi if something") → FALSE ✓
  
  Item 2: "(xi)" → normalized to "xi"
          "xi".includes("xi if something") → FALSE ✓
          
  Item 3: "if" → normalized to "if"
          "if".includes("xi if something") → FALSE ✓
          
  Item 4: "something" → normalized to "something"
          "something".includes("xi if something") → FALSE ✓

Strategy 1: NO MATCH (no single item contains full search text)

Strategy 2: Normalized matching
  Item 0: "x".includes("xi") → FALSE ✓
  Item 2: "xi".includes("xi") → TRUE ✗ WRONG!
  
Result: Returns item with "(xi)" ... but then
  Item 1: "and".includes("xi") → FALSE
  Item 3: "if".includes("xi") → FALSE
  
Wait, that's correct. So where's the false positive?

ACTUAL PROBLEM:
If PDF extraction groups differently:
  Item 0: "(x) (xi) if something" ← SINGLE ITEM!
          
  Strategy 1 Exact Match:
  "(x) (xi) if something".includes("(xi) if something") → TRUE ✓
  
  But all items with partial matches also added:
  Item 1: Something with "if" in it
          Matching triggers false positives in Strategy 2
```

### Fixed Matching - CORRECT
```
Search: "(xi) if something"
        ↓
NO normalization removal of punctuation!
Keep as: "(xi) if something"
        ↓
Strategy 1: Exact match with boundaries
  Item 0: "(x) (xi) if something"
          Position of "(xi) if something": position 5
          Character before: space → valid boundary ✓
          Character after: end → valid boundary ✓
          MATCH! Score: 100
          
  Item 2: "(xi)"
          Does NOT contain "(xi) if something"
          NO MATCH ✓

Result: Returns ONLY the correct item!
```

---

## Problem 2: Normalization Loses Semantic Information

### Demonstration
```
Original Text:
┌────────────────────────────────────────────┐
│ (a) First clause                           │
│ (b) Second clause                          │
│ (c) Third clause                           │
└────────────────────────────────────────────┘

Current Normalization:
┌────────────────────────────────────────────┐
│ (a) → a                                    │
│ (b) → b                                    │
│ (c) → c                                    │
│                                            │
│ Problem: All different                     │
│ But if searching for "b":                  │
│ "a about".includes("b") → ???              │
└────────────────────────────────────────────┘

Fixed Normalization:
┌────────────────────────────────────────────┐
│ (a) → (a)  ← Keep punctuation!             │
│ (b) → (b)                                  │
│ (c) → (c)                                  │
│                                            │
│ Problem avoided: Can't confuse them        │
│ Searching for "(b)":                       │
│ "(a) about".includes("(b)") → FALSE ✓      │
└────────────────────────────────────────────┘
```

### Why Punctuation Matters
```
Without Punctuation (WRONG):
"(xi)" → "xi"    ← Just letters
"(x)"  → "x"     ← Just letters
"x".substring(0,1) = "x" in "xi" → TRUE (FALSE POSITIVE)

With Punctuation (CORRECT):
"(xi)" → "(xi)"  ← Keeps parentheses
"(x)"  → "(x)"
"(x)".includes("(xi)") → FALSE ✓

Bonus: "(vi)" won't match "(v)"
```

---

## Problem 3: Spanning Match Includes Wrong Items

### Scenario
```
Document line:
"(a) text (b) more content"

PDF extraction (loose grouping):
┌─────────────────────────────────────────┐
│ Item 0: "(a)"              x=10         │
│ Item 1: "text"             x=30         │
│ Item 2: "(b)"              x=60         │
│ Item 3: "more"             x=80         │
│ Item 4: "content"          x=120        │
└─────────────────────────────────────────┘
```

### Current Spanning Match Algorithm - WRONG
```
Search: "(b) more content"

i = 0:  ← Start from first item
  combined = "(a) " + "text " + "(b) " + "more " + "content "
  itemGroup = [Item0, Item1, Item2, Item3, Item4]
  
  normalizeText(combined) = "a text b more content"
  "a text b more content".includes("b more content") → TRUE ✓
  
  MATCH FOUND!
  itemGroup has 5 items
  
  Highlight bounding box:
  x1 = Item0.x = 10    ← WRONG! Should be Item2
  x2 = Item4.x = 120
  width = 120 - 10 = 110px ← TOO WIDE! Should be 60px

Result: Highlights from "(a)" to "content" (includes extra!)

Correct would be:
i = 2:  ← Start from "(b)"
  combined = "(b) " + "more " + "content "
  itemGroup = [Item2, Item3, Item4]
  
  Bounding box:
  x1 = Item2.x = 60    ← CORRECT!
  x2 = Item4.x = 120
  width = 60px ← CORRECT!
```

### Fixed Spanning Match - CORRECT
```
When match found:
  combined = "(a) text (b) more content"
  searchText = "(b) more content"
  
  Find actual position:
  combined.indexOf("(b) more content") = 8
  
  Which items contain this position?
  Item 0: chars 0-2, ends at 3     ✗ Before match
  Item 1: chars 4-7, ends at 8     ✗ Before match
  Item 2: chars 9-11, starts at 9  ✓ START OF MATCH!
  Item 3: chars 13-16, in middle   ✓ Part of match
  Item 4: chars 18-24, end         ✓ END OF MATCH
  
  actualGroup = [Item2, Item3, Item4]
  
  Bounding box:
  x1 = Item2.x = 60    ← CORRECT!
  x2 = Item4.x = 120
  width = 60px ← CORRECT!
```

---

## Problem 4: Multi-Word Long Phrase Not Found

### Scenario
```
Search: "Notwithstanding anything in this Agreement to the contrary, if Term SOFR"

Document has this text but it's split across many items by PDF.js:

Item 0:  "Notwithstanding"
Item 1:  "anything"
Item 2:  "in"
Item 3:  "this"
Item 4:  "Agreement"
Item 5:  "to"
Item 6:  "the"
Item 7:  "contrary,"
Item 8:  "if"
Item 9:  "Term"
Item 10: "SOFR"
```

### Current Algorithm - NO MATCH
```
Strategy 1: Exact match
  Each individual item is too short
  "(x)".includes("Notwithstanding anything ...") → FALSE
  NO MATCH

Strategy 2: Normalized match
  Each item individually can't contain phrase
  "notwithstanding".includes("notwithstanding anything") → FALSE
  NO MATCH

Strategy 3: Spanning match
  
  i = 0:
    combined = "Notwithstanding anything in this Agreement to the contrary, if Term SOFR"
    normalizeText = "notwithstanding anything in this agreement to the contrary if term sofr"
    searchNorm = normalizeText(searchText) = same
    
    Check: Does normalized combined include normalized search?
    "notwithstanding anything ... sofr".includes("notwithstanding anything ... sofr") → TRUE ✓
    
    SHOULD FIND IT! But...
    
    Wait, the search text in the report says:
    "Notwithstanding anything in this Agreement to the contrary, if Term SOFR determined as provided above would be less than the Floor, then"
    
    This is LONGER than what's in items 0-10!
    
    j loop continues to add more items, checking each time
    j=11: "determined"
    j=12: "as"
    ... etc
    
    The check at line 1614 keeps going until it finds the match.
    Eventually it matches when it has enough items.
    
    But then itemGroup has 30+ items!
    Spanning highlight includes too much.
```

### Fixed Algorithm - FINDS IT CORRECTLY
```
Same scenario but with fixes:

Strategy 3: Improved spanning match

i = 0:
  Combined text built incrementally
  As items added, check both exact AND normalized
  
  When match found:
    actualPosition = combined.indexOf(searchText)
    If found, calculate which items cover this position
    startItemIdx = 0 (search starts from first item)
    endItemIdx = N (search ends at Nth item)
    
    actualGroup = items covering just the match range
    (not all items combined)
    
Result: Only matched items included, correct bounding box!
```

---

## Flowchart: Current vs Fixed Algorithm

### Current Algorithm (BROKEN)
```
Start: User searches for text
       ↓
       ├─ Strategy 1: Exact match with .includes()
       │  ├─ NO MATCH found? → Continue to Strategy 2
       │  └─ Match found → RETURN (might be wrong!)
       │
       ├─ Strategy 2: Normalized with .includes()
       │  ├─ NO MATCH? → Continue to Strategy 3
       │  └─ Match found → RETURN (might be wrong!)
       │
       ├─ Strategy 3: Spanning (combine items)
       │  ├─ NO MATCH? → Continue to Strategy 4
       │  └─ Match found → RETURN with ALL items (oversized!)
       │
       ├─ Strategy 4: Partial match
       │  ├─ NO MATCH? → "Text not found"
       │  └─ Match found → RETURN
       │
       └─ Highlight with bestMatch
          ├─ If itemGroup exists → Use first+last items
          └─ Else → Use single item

Issues:
✗ .includes() finds wrong substrings
✗ Normalization removes critical info
✗ Spanning match includes too many items
✗ No validation that match is correct
```

### Fixed Algorithm (WORKING)
```
Start: User searches for text
       ↓
       └─ Collect ALL matches (don't stop at first)
          │
          ├─ Strategy 1: Exact match
          │  ├─ Perfect match (==) → Score 100
          │  └─ Partial match with boundaries → Score 95
          │
          ├─ Strategy 2: Normalized match
          │  ├─ Perfect normalized (==) → Score 85
          │  └─ Partial with validation → Score 75
          │
          ├─ Strategy 3: Spanning match (improved)
          │  ├─ Find actual match position
          │  ├─ Calculate only items that contain match
          │  └─ Score based on exact vs normalized
          │
          ├─ Strategy 4: Partial match
          │  └─ With boundary validation
          │
          └─ Sort all matches by score
             │
             └─ Pick best match
                │
                ├─ Validate it contains search text
                ├─ If spanning, use only actual item range
                └─ Calculate correct bounding box

Improvements:
✓ Boundary validation prevents wrong matches
✓ No punctuation removal preserves info
✓ Spanning match tracks actual position
✓ Bounding box covers only matched items
✓ All matches collected, best chosen
```

---

## Quick Reference: What Each Fix Does

### Fix 1a: Stop Removing Punctuation
```
Before: "(xi)" → "xi"
After:  "(xi)" → "(xi)"
Effect: Prevents false substring matches
```

### Fix 1b: Add Boundary Checks to Exact Match
```
Before: "(x)".includes("(xi) ...") → FALSE (ok)
        But no word boundary checking
After:  Check boundaries before/after match
        Prevents: "maybe" matching "may"
Effect: Eliminates boundary-related false positives
```

### Fix 1c: Add Validation to Normalized Match
```
Before: Only checks normalized text
After:  Cross-validate against original text
        Also check boundaries
Effect: Catches normalization artifacts
```

### Fix 2a: Fix Spanning Match Position Tracking
```
Before: Includes items 0-N just because match found at N
After:  Tracks actual position, includes only items covering match
Effect: Fixes oversized highlights and wrong items
```

### Fix 2b: Use Correct Items for Bounding Box
```
Before: Spans from first to last item in group
After:  Spans from start of match to end of match
Effect: Correctly sized highlight boxes
```

---

## Decision Tree: Why Each Match Fails

```
Searching for: "(xi) if something"
                    ↓
Is the text in one PDF item?
├─ YES → Strategy 1 exact match should find it
│        If not: Might be substring issue (fix 1b)
│        
└─ NO → Split across multiple items
        ├─ Is it 2-3 items?
        │  └─ Strategy 3 spanning should find it
        │     If not: Spanning logic broken (fix 2a)
        │
        └─ Is it many items?
           └─ Need exact match of whole phrase
              If not: Normalization issue (fix 1a)
              If not: Spanning not combining enough (fix 2a)

Why false positives?
├─ Searching "(x)", finding "(xi)"?
│  └─ Normalization removed punctuation (fix 1a)
│
├─ Searching "(b)", finding "(a)" and "(b)"?
│  └─ No boundary validation (fix 1b/1c)
│
└─ Highlight too wide?
   └─ Spanning match includes extra items (fix 2a)
      Or bounding box calculated wrong (fix 2b)
```

