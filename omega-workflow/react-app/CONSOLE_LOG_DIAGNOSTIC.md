# Console Log Diagnostic Guide

## When you click an extraction, check for these logs in order:

### 1. ExtractionPanel Click Log
```
[ExtractionPanel] Extraction clicked: {
  fieldId: "...",
  idx: 0,
  canNavigate: true/false,  ← CRITICAL: Check this value!
  hasBbox: true/false,
  hasSpansBbox: true/false,
  extractedBbox: [...] or null,
  hasPage: true/false,
  bbox: [...] or null,
  page: number or undefined
}
```

**If `canNavigate: false`** → This is the problem! Check which is missing:
- If `hasBbox: false` AND `hasSpansBbox: false` → No bbox data
- If `hasPage: false` → No page number

### 2. Cannot Navigate Warning (if canNavigate is false)
```
[ExtractionPanel] Cannot navigate - missing bbox or page
```

### 3. DocumentDetailPage Navigation Log (if canNavigate is true)
```
[DocumentDetailPage] Extraction clicked: {
  fieldId: "...",
  extractionIndex: 0,
  page: number,
  bbox: [...]
}
```

**If you don't see this log** → The onExtractionClick prop isn't being called!

### 4. PDFViewer Scroll Log (if navigation was triggered)
```
[PDFViewer] Scroll effect triggered: {
  scrollToPage: number,
  hasContainer: true,
  isLoading: false
}
```

**If you don't see this log** → The scrollToPage state isn't updating!

### 5. PDFViewer Page Container Lookup
```
[PDFViewer] Page container lookup: {
  pageNumber: number,
  found: true/false,
  totalContainers: number
}
```

### 6. PDFViewer Scroll Completion
```
[PDFViewer] Jumping directly to page X...
[PDFViewer] Jump to page X completed
```

---

## Common Issues & Solutions

### Issue 1: `canNavigate: false`
**Problem**: Missing bbox or page data
**Solution**: Check API response, ensure extraction has bbox and page

### Issue 2: ExtractionPanel log appears but no DocumentDetailPage log
**Problem**: onExtractionClick prop not passed or not called
**Solution**: Check prop chain in DocumentDetailPage → ExtractionPanel

### Issue 3: DocumentDetailPage log appears but no PDFViewer log
**Problem**: scrollToPage state not updating or PDFViewer not responding
**Solution**: Check state management, useEffect dependencies

### Issue 4: PDFViewer logs appear but page doesn't scroll
**Problem**: Page container not found in DOM
**Solution**: Increase retry timeout, check if all pages are rendered
