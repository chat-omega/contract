# Text-Search Debugging Examples

## Example 1: "(xi)" Matching "(x)" Problem

### PDF.js Extraction
```javascript
// How PDF.js extracts text from a line like:
// "(x) and (xi) if something"

// Possible extraction 1 - individual items:
textContent.items = [
    {str: "(x)", transform: [...], width: 15, height: 12},
    {str: "and", transform: [...], width: 20, height: 12},
    {str: "(xi)", transform: [...], width: 20, height: 12},
    {str: "if", transform: [...], width: 12, height: 12},
    {str: "something", transform: [...], width: 60, height: 12}
]

// Possible extraction 2 - grouped items:
textContent.items = [
    {str: "(x) and (xi) if something", transform: [...], width: 200, height: 12}
]
```

### Current Code Behavior - Finding False Positive

```javascript
// Search for: "(xi) if something"

// Strategy 1: Exact match (line 1589)
// Check each item with .includes()

Item 0: "(x)".toLowerCase().includes("(xi) if something".toLowerCase())
  → "(x)".includes("(xi) if something") → FALSE ✓

Item 1: "and".toLowerCase().includes("(xi) if something".toLowerCase())
  → "and".includes("(xi) if something") → FALSE ✓

Item 3: "(xi)".toLowerCase().includes("(xi) if something".toLowerCase())
  → "(xi)".includes("(xi) if something") → FALSE ✓
  
// Hmm, no match yet...

Item 2 (if extraction 2): "(x) and (xi) if something".includes("(xi) if something")
  → "(x) and (xi) if something".includes("(xi) if something") → TRUE ✓
  
// MATCH FOUND! Score: 100
// Returns item containing "(x)" at start
```

### Why Both (x) and (xi) Get Highlighted

```javascript
// If multiple items match:
Item 0: "(x)" - if any strategy matches this partially
Item 2: "(xi)" - matches Strategy 2 (normalized)

// Strategy 2: Normalized match (line 1596-1601)
normalizeText("(x)") = "x"
normalizeText("(xi)") = "xi"
normalizeText("(xi) if something") = "xi if something"

Item 0 check: "x".includes("xi if something") → FALSE
Item 2 check: "xi".includes("xi if something") → FALSE

// But with extraction 2:
normalizeText("(x) and (xi) if something") = "x and xi if something"
"x and xi if something".includes("xi if something") → TRUE

// ALL matching items are returned, even those that are just substrings
matches = [
    {item: item2, score: 100, method: 'exact'},
    {item: item0, score: 80, method: 'normalized'}, // FALSE POSITIVE!
    {item: item3, score: 80, method: 'normalized'}
]

// Sort by score - highest first
// Gets first item which might be WRONG one
bestMatch = matches[0] // item2 or item0?
```

---

## Example 2: Normalization Loss - "(b)" becoming indistinguishable

### Original Text
```
"(a) First clause...
(b) Second clause...
(c) Third clause..."
```

### After Normalization

```javascript
normalizeText("(a)") = "a"
normalizeText("(b)") = "b"
normalizeText("(c)") = "c"
normalizeText("(a) First clause") = "a first clause"
normalizeText("(b) Second clause") = "b second clause"

// Problem: Can't distinguish between them reliably
// Because normalization removes the parentheses

// When searching for "(b)":
searchNorm = normalizeText("(b)") = "b"

// Every item containing "b" might match
itemNorm = normalizeText("(b) Second clause") = "b second clause"
itemNorm.includes(searchNorm) → "b second clause".includes("b") → TRUE ✓

// But also:
itemNorm = normalizeText("(a) about") = "a about"
itemNorm.includes("b") → "a about".includes("b") → TRUE ✗ FALSE POSITIVE!
```

---

## Example 3: Spanning Match Creates Wrong Bounding Box

### PDF Items
```javascript
textContent.items = [
    {str: "(a)", transform: [0,0,0,0,10,100], width: 15},    // Position: x=10
    {str: "text", transform: [0,0,0,0,30,100], width: 25},   // Position: x=30
    {str: "(b)", transform: [0,0,0,0,60,100], width: 15},    // Position: x=60
    {str: "more", transform: [0,0,0,0,80,100], width: 30},   // Position: x=80
    {str: "content", transform: [0,0,0,0,120,100], width: 50} // Position: x=120
]
```

### Searching for "(b) more content"

```javascript
// Strategy 3: Spanning match (line 1605-1626)
// for (let i = 0; i < items.length; i++) {

i = 0:
  combined = "(a) " + "text " + "(b) " + "more " + "content "
  itemGroup = [item0, item1, item2, item3, item4]
  
  // After normalization
  searchNorm = "b more content"
  normalizeText(combined) = "a text b more content"
  
  // Check match
  "a text b more content".includes("b more content") → TRUE ✓
  
  // MATCH FOUND!
  // But itemGroup spans from item0 to item4
  // Bounding box calculation:
  
  firstItem = item0 = "(a)", x1 = 10 * scale
  lastItem = item4 = "content", x2 = (120 + 50) * scale = 170 * scale
  
  width = Math.abs(170 * scale - 10 * scale) = 160 * scale
  
  // PROBLEM: Highlight spans from (a) to "content"
  // Should only highlight from (b) to "content"!
  // Highlight box is 5x too wide
```

### Correct Spanning Match

```javascript
i = 2:  // Start from "(b)"
  combined = "(b) " + "more " + "content "
  itemGroup = [item2, item3, item4]
  
  normalizeText(combined) = "b more content"
  "b more content".includes("b more content") → TRUE ✓
  
  // Bounding box:
  firstItem = item2 = "(b)", x1 = 60 * scale
  lastItem = item4 = "content", x2 = 170 * scale
  
  width = (170 - 60) * scale = 110 * scale
  
  // STILL INCLUDES EXTRA ITEMS!
  // Should be items 2-3 only
```

---

## Example 4: "Notwithstanding" - Multi-word Search Failure

### PDF Extraction - Highly Split
```javascript
// Long phrase extracted across many items
textContent.items = [
    {str: "Notwithstanding"},
    {str: "anything"},
    {str: "in"},
    {str: "this"},
    {str: "Agreement"},
    {str: "to"},
    {str: "the"},
    {str: "contrary,"},
    {str: "if"},
    {str: "Term"},
    {str: "SOFR"},
    {str: "determined"},
    // ... more items
]
```

### Matching Failures

```javascript
// Search for: "Notwithstanding anything in this Agreement to the contrary, if Term SOFR determined as provided above would be less than the Floor, then"

// Strategy 1: Exact match
// Each item individually:
"notwithstanding".includes("notwithstanding anything in this...") → FALSE
"anything".includes("notwithstanding anything in this...") → FALSE
// All individual items too short - NO MATCH

// Strategy 2: Normalized match
// Same problem - individual items can't contain entire phrase
// NO MATCH

// Strategy 3: Multi-word spanning
searchNorm = normalizeText(searchText)
// = "notwithstanding anything in this agreement to the contrary if term sofr determined as provided above would be less than the floor then"

i = 0:
  combined = "Notwithstanding anything in this Agreement to the contrary, if Term SOFR determined ..."
  // Note: includes punctuation initially
  
  normalizeText(combined) = "notwithstanding anything in this agreement to the contrary if term sofr determined"
  
  // Check if this matches searchNorm
  // They should match! But...

// The problem: searchText is the ENTIRE phrase
// But combined only builds items until match is found (line 1614)
// The match check uses "includes" so it keeps adding items

// What if PDF extracts commas as separate items?
items = [
    {str: "Notwithstanding"},
    {str: "anything"},
    ...,
    {str: "contrary"},
    {str: ","}, // ← SEPARATE ITEM!
    {str: "if"},
    ...
]

// Then:
combined = "Notwithstanding anything ... contrary , if ..."
// After normalizing: removes the comma
// But the spacing might be wrong: "contrary if" instead of "contrary, if"
// This could cause match to fail!
```

---

## Actual PDF.js Behavior

### How PDF.js Groups Text

PDF.js uses "physical" layout to group text, not semantic meaning:

1. **Horizontal grouping:** Items on same line and close together → same item
2. **Vertical grouping:** Items aligned vertically → separate items/lines
3. **Spacing:** Large spaces can break items
4. **Special handling:** Some fonts/sizes treated specially

### Real Example Output

```javascript
// A contract line like:
// "(xi) if such Receivable cannot or may not be transferred"

// Could be extracted as:

// Option 1: Tight grouping
[
    {str: "(xi) if such Receivable cannot or may not be transferred"}
]

// Option 2: Moderate grouping
[
    {str: "(xi) if such Receivable"},
    {str: "cannot or may not be transferred"}
]

// Option 3: Loose grouping
[
    {str: "(xi)"},
    {str: "if"},
    {str: "such"},
    {str: "Receivable"},
    {str: "cannot"},
    {str: "or"},
    {str: "may"},
    {str: "not"},
    {str: "be"},
    {str: "transferred"}
]

// The algorithm must handle ALL three cases!
// But current code assumes option 1 works
```

---

## Debugging Steps

### To identify which extraction pattern you have:

```javascript
// Add to highlightWithTextSearch() after line 1570:

console.log("=== PDF.js Text Items Debug ===");
console.log(`Total items: ${textContent.items.length}`);
console.log("First 10 items:");
textContent.items.slice(0, 10).forEach((item, i) => {
    console.log(`  ${i}: "${item.str}" (width: ${item.width}, x: ${item.transform[4]})`);
});

console.log("\nSearch text:");
console.log(`  Original: "${searchText}"`);
console.log(`  Normalized: "${normalizeText(searchText)}"`);

console.log("\nMatching attempts:");
```

### To debug normalization issues:

```javascript
// Compare normalized versions
const original = "Agreement to the contrary, if Term";
const normalized = normalizeText(original);

console.log(`Original: "${original}"`);
console.log(`Normalized: "${normalized}"`);
console.log(`Characters removed: ${original.replace(/\w\s/g, '').split('').filter((c, i, a) => a.indexOf(c) === i).join(', ')}`);
```

### To identify false positive matches:

```javascript
// After finding a match, validate it:

if (matches.length > 1) {
    console.warn("Multiple matches found! Possible false positives:");
    matches.forEach((m, idx) => {
        console.log(`  ${idx}: "${m.item.str.substring(0, 50)}..." (score: ${m.score}, method: ${m.method})`);
    });
}

// Check if best match actually contains search text
const best = matches[0];
if (!best.item.str.toLowerCase().includes(searchText.toLowerCase())) {
    console.error("WARNING: Best match does NOT contain exact search text!");
    console.error(`  Search: "${searchText}"`);
    console.error(`  Match: "${best.item.str}"`);
}
```

