# Visual Layout Guide - Extraction Panel Migration

## Before vs After Comparison

### BEFORE (Old Layout - Panel on RIGHT)
```
┌──────────────────────────────────────────────────────────┐
│  Header                                                   │
├──────────────────────────────────┬───────────────────────┤
│                                  │                       │
│       PDF Viewer                 │   Extraction Panel    │
│                                  │                       │
│   ┌────────────────────────┐    │   ● Field 1           │
│   │                        │    │     Value             │
│   │   Page 1               │    │                       │
│   │                        │    │   ● Field 2           │
│   │   [Highlights]         │    │     Value 1           │
│   └────────────────────────┘    │     Value 2           │
│                                  │                       │
│   ┌────────────────────────┐    │   [Start Extract]     │
│   │                        │    │                       │
│   │   Page 2               │    │                       │
│   │                        │    │   (RIGHT SIDE) ❌      │
│   └────────────────────────┘    │   border-left         │
│                                  │                       │
│   (LEFT SIDE)                    │                       │
└──────────────────────────────────┴───────────────────────┘
```

### AFTER (New Layout - Panel on LEFT) ✅
```
┌──────────────────────────────────────────────────────────┐
│  Header: Document Name | Back | Workflow | Export        │
├───────────────────────┬──────────────────────────────────┤
│                       │                                  │
│   Extraction Panel    │       PDF Viewer                 │
│                       │                                  │
│   ● Field 1           │   ┌────────────────────────┐    │
│     Value             │   │                        │    │
│                       │   │   Page 1               │    │
│   ● Field 2           │   │                        │    │
│     Value 1           │   │   [Highlights]         │    │
│     Value 2           │   └────────────────────────┘    │
│                       │                                  │
│   [Start Extract]     │   ┌────────────────────────┐    │
│                       │   │                        │    │
│                       │   │   Page 2               │    │
│   (LEFT SIDE) ✅       │   │                        │    │
│   384px               │   └────────────────────────┘    │
│   border-right        │                                  │
│                       │   (RIGHT SIDE)                   │
└───────────────────────┴──────────────────────────────────┘
```

---

## Visual Checkpoint

### What to Look For During Manual Testing

#### ✅ CORRECT Layout (Expected)
```
┌─────────────────────────────────────────┐
│  [←] Document Name    [Workflow] [Export]│
├──────────┬──────────────────────────────┤
│ Extract  │  PDF                         │
│ Results  │                              │
│ ────────▶│  [Document content here]     │
│          │                              │
│ LEFT     │  RIGHT                       │
└──────────┴──────────────────────────────┘
       ↑
  Border here
  (on right side of extraction panel)
```

#### ❌ INCORRECT Layout (Bug)
```
┌─────────────────────────────────────────┐
│  [←] Document Name    [Workflow] [Export]│
├──────────────────────────────┬──────────┤
│  PDF                         │ Extract  │
│                              │ Results  │
│  [Document content here]     │◀──────── │
│                              │          │
│  LEFT                        │ RIGHT    │
└──────────────────────────────┴──────────┘
                          ↑
                     Border here
                     (WRONG - panel on right)
```

---

## Component Dimensions

### Extraction Panel (LEFT)
- **Width:** 384px (24rem, w-96)
- **Background:** White (#FFFFFF)
- **Border:** 1px solid #E5E7EB (right side only)
- **Overflow:** Vertical scroll
- **Position:** First flex child
- **Padding:** p-6 (24px)

### PDF Viewer (RIGHT)
- **Width:** Remaining space (flex-1)
- **Background:** Gray (#F9FAFB)
- **Border:** None
- **Overflow:** Vertical scroll
- **Position:** Second flex child
- **Padding:** Varies by zoom level

### Border Separator
- **Width:** 1px
- **Color:** #E5E7EB (gray-200)
- **Position:** Right edge of extraction panel
- **Style:** Solid

---

## CSS Class Reference

### DocumentDetailPage Container
```tsx
<div className="flex-1 flex overflow-hidden">
  {/* ExtractionPanel - LEFT */}
  {/* PDFViewer - RIGHT */}
</div>
```

### ExtractionPanel
```tsx
<div className="w-96 bg-white border-r border-gray-200 overflow-y-auto">
  {/* Panel content */}
</div>
```

**Breakdown:**
- `w-96` → width: 24rem (384px)
- `bg-white` → background: white
- `border-r` → border-right: 1px
- `border-gray-200` → border-color: #E5E7EB
- `overflow-y-auto` → vertical scroll if needed

### PDFViewer
```tsx
<div className="flex-1 bg-gray-50 overflow-y-auto">
  {/* PDF pages */}
</div>
```

**Breakdown:**
- `flex-1` → flex: 1 1 0% (takes remaining space)
- `bg-gray-50` → background: #F9FAFB
- `overflow-y-auto` → vertical scroll

---

## Browser DevTools Inspection

### How to Verify in Browser

1. **Open Document Detail Page**
   ```
   http://localhost:8081/documents/{any-document-id}
   ```

2. **Open DevTools** (F12 or Cmd+Opt+I)

3. **Check Layout Tab**
   - Look for flex container
   - Verify order: ExtractionPanel → PDFViewer

4. **Inspect ExtractionPanel**
   ```
   Should see:
   - width: 384px
   - border-right: 1px solid rgb(229, 231, 235)
   - position in DOM: BEFORE PDFViewer
   ```

5. **Inspect PDFViewer**
   ```
   Should see:
   - flex: 1
   - width: calc(100% - 384px) approximately
   - position in DOM: AFTER ExtractionPanel
   ```

### Expected Computed Styles

**ExtractionPanel:**
```css
width: 384px;
background-color: rgb(255, 255, 255);
border-right-width: 1px;
border-right-style: solid;
border-right-color: rgb(229, 231, 235);
overflow-y: auto;
```

**PDFViewer:**
```css
flex: 1 1 0%;
width: [remaining space]px;
background-color: rgb(249, 250, 251);
overflow-y: auto;
```

---

## Screen Resolution Testing

### Desktop Sizes

#### 1920x1080 (Full HD)
```
┌────────────┬────────────────────────────────────────┐
│  384px     │         1536px                         │
│            │                                        │
│ Extraction │         PDF Viewer                     │
│ Panel      │         (Plenty of space)              │
│            │                                        │
└────────────┴────────────────────────────────────────┘
```

#### 1366x768 (Laptop)
```
┌────────────┬────────────────────────┐
│  384px     │     982px              │
│            │                        │
│ Extraction │     PDF Viewer         │
│ Panel      │     (Adequate)         │
│            │                        │
└────────────┴────────────────────────┘
```

#### 1024x768 (Small)
```
┌────────────┬──────────┐
│  384px     │  640px   │
│            │          │
│ Extraction │   PDF    │
│ Panel      │  Viewer  │
│            │  (Tight) │
└────────────┴──────────┘
```

**Note:** Extraction panel stays fixed at 384px across all resolutions.

---

## Interactive Elements

### Extraction Panel Interactions

1. **Field Click**
   ```
   Action: Click field name
   Effect: Field becomes selected, all extractions highlight in PDF
   Visual: Field background changes, PDF shows yellow boxes
   ```

2. **Extraction Click**
   ```
   Action: Click 📍 icon on specific extraction
   Effect: PDF scrolls to that page, single highlight appears
   Visual: PDF animates to page, one yellow box shown
   Toast: "Viewing extraction on page X"
   ```

3. **Field Expansion**
   ```
   Action: Click chevron icon
   Effect: Field expands to show all extractions
   Visual: Chevron rotates, extraction list appears
   ```

### PDF Viewer Interactions

1. **Scroll**
   ```
   Action: Mouse wheel or drag scrollbar
   Effect: PDF pages scroll continuously
   Visual: Smooth scrolling through document
   ```

2. **Zoom**
   ```
   Action: Click [+] or [-] buttons
   Effect: PDF scales, highlights adjust accordingly
   Visual: Pages grow/shrink, highlights stay aligned
   ```

3. **Search** (if enabled)
   ```
   Action: Type in search bar
   Effect: Matching text highlighted across all pages
   Visual: Orange highlights for search results
   ```

---

## Highlighting Visualization

### Single Extraction Highlight
```
PDF Page:
┌──────────────────────────────┐
│ Lorem ipsum dolor sit amet,  │
│ consectetur adipiscing elit. │
│                              │
│ ┏━━━━━━━━━━━━━━━━━━━━━━━┓   │ ← Yellow highlight
│ ┃ HIGHLIGHTED TEXT HERE ┃   │    on extraction location
│ ┗━━━━━━━━━━━━━━━━━━━━━━━┛   │
│                              │
│ Sed do eiusmod tempor incid. │
└──────────────────────────────┘
```

### Multiple Extraction Highlights (Same Field)
```
PDF Page:
┌──────────────────────────────┐
│ Lorem ipsum dolor sit amet,  │
│                              │
│ ┏━━━━━━━━━━━━━━┓             │ ← Extraction 1
│ ┃ HIGHLIGHT 1  ┃             │
│ ┗━━━━━━━━━━━━━━┛             │
│                              │
│ Consectetur adipiscing elit. │
│                              │
│ ┏━━━━━━━━━━━━━━┓             │ ← Extraction 2
│ ┃ HIGHLIGHT 2  ┃             │
│ ┗━━━━━━━━━━━━━━┛             │
└──────────────────────────────┘
```

---

## Troubleshooting Visual Issues

### Issue: Panel on Wrong Side
**Symptom:** Extraction panel appears on right
**Check:**
1. DocumentDetailPage.tsx component order
2. Browser cache (hard refresh: Cmd+Shift+R)
3. Build artifacts in dist/

### Issue: No Border Separator
**Symptom:** Can't see line between panels
**Check:**
1. ExtractionPanel has `border-r` class
2. Border color contrast (gray on white)
3. Browser zoom level

### Issue: Panel Too Wide/Narrow
**Symptom:** Extraction panel wrong width
**Check:**
1. `w-96` class present
2. No conflicting CSS overrides
3. Browser DevTools computed width

### Issue: Overlapping Content
**Symptom:** Panels overlap or stack vertically
**Check:**
1. Container has `flex` class
2. No `flex-col` on container
3. Both panels inside same flex container

---

## Quick Visual Test Checklist

```
□ Open http://localhost:8081
□ Login to application
□ Navigate to any document
□ Verify layout matches "AFTER" diagram above
□ Check extraction panel on LEFT
□ Check PDF viewer on RIGHT
□ See gray border between panels
□ Click a field - verify highlight appears
□ Click extraction icon - verify PDF scrolls
□ Scroll PDF - verify smooth scrolling
□ Zoom PDF - verify highlights adjust
□ Resize browser - verify responsive behavior
```

---

## Expected Screenshot Appearance

When you take a screenshot of the document detail page, you should see:

**Top Section:**
- Gray header bar with document name
- Back arrow on far left
- Workflow selector and Export button on right

**Main Section (Left to Right):**
1. **White panel (384px)** - Extraction Results
   - Field names in bold
   - Values below each field
   - Expand/collapse icons
   - Gray border on right edge

2. **Gray area (remaining width)** - PDF Viewer
   - PDF pages stacked vertically
   - Zoom controls visible
   - Search bar (if enabled)
   - Yellow highlights on clicked fields

**Overall Impression:**
- Clean two-column layout
- Clear visual separation
- Professional appearance
- Intuitive organization

---

**For detailed testing procedures, see MANUAL_TEST_SCRIPT.md**
