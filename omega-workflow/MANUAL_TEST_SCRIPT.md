# Quick Manual Test Script
## Document Detail Page - Extraction Panel Position

### Prerequisites
```bash
# 1. Verify containers are running
docker ps | grep -E "omega-frontend-react|omega-backend-fastapi"

# 2. Check frontend accessibility
curl -s http://localhost:8081 > /dev/null && echo "✓ Frontend OK" || echo "✗ Frontend DOWN"

# 3. Check backend API
curl -s http://localhost:5001/api/document-types > /dev/null && echo "✓ Backend OK" || echo "✗ Backend DOWN"
```

### Test Procedure (5 minutes)

#### Step 1: Access Application
1. Open browser: `http://localhost:8081`
2. Login with test credentials
3. Navigate to Documents page

#### Step 2: Visual Layout Check ⭐ PRIMARY TEST
1. Click any document to open detail page
2. **VERIFY:**
   - [ ] **Extraction panel is on the LEFT side** ← MAIN OBJECTIVE
   - [ ] **PDF viewer is on the RIGHT side** ← MAIN OBJECTIVE
   - [ ] Gray border visible between the two panels
   - [ ] Extraction panel is approximately 384px wide
   - [ ] PDF viewer takes the remaining space

#### Step 3: Functional Check
3. **Extraction Panel:**
   - [ ] Fields are listed
   - [ ] Click a field - it becomes selected
   - [ ] Click location icon on an extraction

4. **PDF Viewer:**
   - [ ] PDF scrolls to highlighted area
   - [ ] Yellow highlight appears on PDF
   - [ ] Toast notification shows page number

#### Step 4: Edge Cases
5. **Different States:**
   - [ ] No workflow: Shows message "Assign a workflow"
   - [ ] Workflow assigned: Shows "Start Extraction" button
   - [ ] Extraction complete: Shows all fields with values

### Quick Screenshot Test
```bash
# Take a screenshot for documentation
# (Manual: Use browser screenshot tool)
# Expected layout:
# +------------------+-------------------------+
# | Extraction Panel |      PDF Viewer         |
# | (LEFT SIDE)      |      (RIGHT SIDE)       |
# | 384px wide       |      Remaining space    |
# | White bg         |      PDF content        |
# | Border-right     |                         |
# +------------------+-------------------------+
```

### Pass/Fail Criteria

**PASS if:**
- ✅ Extraction panel appears on LEFT side of screen
- ✅ PDF viewer appears on RIGHT side of screen
- ✅ Border visible between panels
- ✅ Clicking extraction navigates to correct page in PDF
- ✅ Highlighting works correctly

**FAIL if:**
- ❌ Extraction panel on RIGHT (old layout)
- ❌ PDF viewer on LEFT
- ❌ No border between panels
- ❌ Layout breaks or overlaps
- ❌ Navigation/highlighting broken

### Expected Result
**Layout should match this structure:**

```
┌─────────────────────────────────────────────────────┐
│  Document Header (Title, Back, Export, Workflow)    │
├────────────────┬────────────────────────────────────┤
│ Extraction     │                                    │
│ Results        │         PDF Viewer                 │
│ Panel          │                                    │
│                │         (Document pages            │
│ ● Field 1      │          render here)              │
│   - Value      │                                    │
│                │                                    │
│ ● Field 2      │                                    │
│   - Value      │         [Yellow highlights         │
│   - Value      │          appear on click]          │
│                │                                    │
│ [Start Extract]│                                    │
│                │         [Zoom controls]            │
│                │         [Search bar]               │
│                │                                    │
│ (LEFT SIDE)    │         (RIGHT SIDE)               │
│ 384px width    │         Remaining width            │
│ border-right   │         flex-1                     │
└────────────────┴────────────────────────────────────┘
```

### Troubleshooting

**Issue: 502 Bad Gateway**
```bash
# Check backend logs
docker logs omega-backend-fastapi --tail 50

# Restart backend if needed
docker restart omega-backend-fastapi
```

**Issue: PDF not loading**
```bash
# Check PDF service endpoint
curl -I http://localhost:5001/api/documents/{doc-id}/content
```

**Issue: No extractions showing**
```bash
# Verify workflow assigned to document
# Click "Assign Workflow" button in document detail page header
# Then click "Start Extraction"
```

### Test Report Template

```
Date: _______________
Tester: _______________

Test Results:
□ PASS - Extraction panel on LEFT
□ PASS - PDF viewer on RIGHT
□ PASS - Border separator visible
□ PASS - Field clicking works
□ PASS - PDF highlighting works
□ PASS - Navigation works

Issues Found:
_________________________________
_________________________________
_________________________________

Screenshots: (attach/link)
_________________________________

Overall Status: □ PASS  □ FAIL
Signature: _______________
```

---

**Estimated Time:** 5-10 minutes
**Priority:** HIGH - Verify UI layout change
**Can Deploy:** YES (if tests pass)
