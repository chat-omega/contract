# React App Testing Guide - Phase 1

**Date:** 2025-11-09
**Version:** Phase 3 - Document Management Features
**Tester:** ___________________
**Duration:** ~2-3 hours

---

## Pre-Test Setup Checklist

### Environment Verification
- [ ] **Backend Running:** http://localhost:5001/api/health should return `{"status":"healthy"}`
- [ ] **Vanilla JS Running:** http://localhost:3000 should load
- [ ] **React Running:** http://localhost:3001 should load
- [ ] **Browser:** Chrome/Firefox/Edge (latest version)
- [ ] **DevTools Open:** F12 → Console tab visible

### Test User Setup
1. [ ] Navigate to: http://localhost:3001/register
2. [ ] Create account:
   - Username: `testuser`
   - Email: `test@example.com`
   - Password: `TestPass123!`
3. [ ] Verify redirect to dashboard after registration
4. [ ] Note: If user exists, use login page instead

### Test Files Preparation

Create these test files (or download sample PDFs):

```bash
# Small files (< 5MB) - Should succeed
- test-agreement.pdf (any PDF file)
- test-contract.docx (any Word file)
- test-data.xlsx (any Excel file)
- test-notes.txt (any text file)

# Medium file (10-20MB) - Should succeed
- test-medium.pdf

# Large file (40-49MB) - Should succeed (edge case)
- test-large.pdf

# Too large (> 50MB) - Should FAIL validation
- test-toolarge.pdf (create or use existing large file)

# Invalid type - Should FAIL validation
- test.mp4 or test.jpg or test.zip
```

**Quick file creation (Linux/Mac):**
```bash
cd ~/Downloads
# Create 1MB PDF placeholder
dd if=/dev/zero of=test-small.pdf bs=1M count=1
# Create 45MB PDF placeholder
dd if=/dev/zero of=test-large.pdf bs=1M count=45
# Create 55MB PDF placeholder (too large)
dd if=/dev/zero of=test-toolarge.pdf bs=1M count=55
```

---

## Test Suite 1: DocumentsPage Testing (45 minutes)

### 1.1 Empty State Test
**URL:** http://localhost:3001/documents

**Steps:**
1. [ ] Login if not already logged in
2. [ ] Navigate to Documents page (sidebar or http://localhost:3001/documents)
3. [ ] Observe the empty state

**Expected Results:**
- [ ] ✅ Document icon displayed (centered)
- [ ] ✅ "No documents" heading shown
- [ ] ✅ "Get started by uploading a document" message
- [ ] ✅ "Upload Document" button visible and styled correctly
- [ ] ✅ No console errors in DevTools

**Actions:**
4. [ ] Click "Upload Document" button

**Expected:**
- [ ] ✅ Navigates to `/upload` page

**Result:** ⬜ PASS  ⬜ FAIL
**Notes:** _______________________________________________

---

### 1.2 Document Upload & List Display
**Prerequisite:** Have 5-10 test files ready

**Steps:**
1. [ ] Navigate to Upload page
2. [ ] Upload 5 different files (mix of PDF, DOCX, TXT)
3. [ ] Wait for all uploads to complete (green checkmarks)
4. [ ] Navigate back to Documents page

**Expected Results:**
- [ ] ✅ All 5 documents appear in table
- [ ] ✅ Document names match uploaded files
- [ ] ✅ File sizes displayed (e.g., "1.2 MB", "534 KB")
- [ ] ✅ Upload dates show today's date (formatted: "Nov 9, 2025" or similar)
- [ ] ✅ Document type badges displayed (blue, rounded pills)
- [ ] ✅ All columns aligned properly
- [ ] ✅ No layout issues or overflow

**Result:** ⬜ PASS  ⬜ FAIL
**Notes:** _______________________________________________

---

### 1.3 Table Sorting Test

**Test 1.3a: Sort by Name**
1. [ ] Click "Name" column header (first click)
   - **Expected:** ✅ Arrow points UP, documents sorted A→Z
2. [ ] Click "Name" again (second click)
   - **Expected:** ✅ Arrow points DOWN, documents sorted Z→A
3. [ ] Click "Name" again (third click)
   - **Expected:** ✅ Arrow faded/neutral, back to default sort

**Test 1.3b: Sort by Added On**
1. [ ] Click "Added On" column header (first click)
   - **Expected:** ✅ Oldest documents first
2. [ ] Click again
   - **Expected:** ✅ Newest documents first (default order)

**Test 1.3c: Sort by Document Type**
1. [ ] Click "Document Type" column header
   - **Expected:** ✅ Sorted alphabetically by type

**Result:** ⬜ PASS  ⬜ FAIL
**Notes:** _______________________________________________

---

### 1.4 Pagination Test
**Prerequisite:** Have 15+ documents (upload more if needed)

**Test 1.4a: Rows Per Page**
1. [ ] Set "Rows per page" to **10**
   - **Expected:** ✅ Shows "1–10 of X" (where X = total documents)
   - **Expected:** ✅ Exactly 10 rows visible in table
   - **Expected:** ✅ "Previous" button disabled (gray)
   - **Expected:** ✅ "Next" button enabled (if >10 docs)

**Test 1.4b: Navigation**
2. [ ] Click "Next" button
   - **Expected:** ✅ Shows "11–20 of X"
   - **Expected:** ✅ Different 10 documents displayed
   - **Expected:** ✅ Both "Previous" and "Next" enabled (if >20 docs)

3. [ ] Click "Previous" button
   - **Expected:** ✅ Returns to "1–10 of X"
   - **Expected:** ✅ Original documents shown

**Test 1.4c: Change Page Size**
4. [ ] Change "Rows per page" to **25**
   - **Expected:** ✅ Resets to page 1
   - **Expected:** ✅ Shows "1–25 of X"
   - **Expected:** ✅ Up to 25 rows visible

5. [ ] Change to **50**
   - **Expected:** ✅ Shows all documents if <50 total
   - **Expected:** ✅ Pagination controls disabled if single page

**Test 1.4d: Edge Cases**
6. [ ] If exactly 10 documents:
   - **Expected:** ✅ Shows "1–10 of 10"
   - **Expected:** ✅ Both pagination buttons disabled

**Result:** ⬜ PASS  ⬜ FAIL
**Notes:** _______________________________________________

---

### 1.5 Selection Test

**Test 1.5a: Individual Selection**
1. [ ] Set rows per page to 10
2. [ ] Click checkbox on row 1
   - **Expected:** ✅ Checkbox checked
   - **Expected:** ✅ Header "Select All" checkbox shows dash (indeterminate)
3. [ ] Click checkbox on row 2
   - **Expected:** ✅ Both row 1 and 2 selected
4. [ ] Click row 1 checkbox again
   - **Expected:** ✅ Row 1 deselected
   - **Expected:** ✅ Only row 2 selected

**Test 1.5b: Select All**
5. [ ] Click header "Select All" checkbox
   - **Expected:** ✅ All 10 visible rows selected
   - **Expected:** ✅ Header checkbox fully checked (✓)
6. [ ] Click "Select All" again
   - **Expected:** ✅ All rows deselected
   - **Expected:** ✅ Header checkbox unchecked

**Test 1.5c: Selection Across Pages**
7. [ ] Select rows 1, 2, 3
8. [ ] Click "Next" to go to page 2
   - **Expected:** ⚠️ Page 2 rows NOT selected (selection doesn't persist)
   - **Note:** This is current behavior, may be enhanced later
9. [ ] Click "Previous" to return to page 1
   - **Expected:** ⚠️ Rows 1, 2, 3 NOT selected (selection lost)
   - **Note:** Document this as current limitation

**Result:** ⬜ PASS  ⬜ FAIL
**Notes:** _______________________________________________

---

### 1.6 Row Click Navigation Test

**Steps:**
1. [ ] Click anywhere on first row (EXCEPT checkbox or "View" button)
   - **Expected:** ⚠️ Navigates to `/documents/{id}`
   - **Current:** ❌ 404 or blank page (route not implemented yet)
   - **Verify:** URL changes to `/documents/some-id`

2. [ ] Navigate back to `/documents`
3. [ ] Click checkbox on a row
   - **Expected:** ✅ ONLY checkbox toggles, NO navigation
   - **Verify:** URL stays on `/documents`

4. [ ] Click "View" button in Actions column
   - **Expected:** ⚠️ Same as row click (navigates to detail page)
   - **Current:** ❌ 404 or blank page

**Result:** ⬜ PASS  ⬜ FAIL
**Notes:** Document that navigation TRIGGERS but route is missing (expected)
_______________________________________________

---

### 1.7 Error Handling Test

**Test 1.7a: Network Error Simulation**
1. [ ] Open terminal
2. [ ] Stop backend: `docker stop omega-backend-fastapi`
3. [ ] In browser, refresh Documents page
   - **Expected:** ✅ Loading spinner appears briefly
   - **Expected:** ✅ Error toast notification: "Failed to load documents"
   - **Expected:** ✅ Table shows empty state OR error message
   - **Expected:** ✅ No console errors that crash the app

**Test 1.7b: Recovery**
4. [ ] Restart backend: `docker start omega-backend-fastapi`
5. [ ] Wait 10 seconds for backend to start
6. [ ] Refresh Documents page
   - **Expected:** ✅ Documents load successfully
   - **Expected:** ✅ Table displays normally

**Result:** ⬜ PASS  ⬜ FAIL
**Notes:** _______________________________________________

---

### 1.8 Responsive Design Test (Optional)

**Steps:**
1. [ ] Resize browser to mobile width (~375px)
   - **Expected:** ✅ Table remains usable (horizontal scroll acceptable)
   - **Expected:** ✅ No overlapping buttons
   - **Expected:** ✅ Pagination controls don't break
2. [ ] Resize to tablet width (~768px)
   - **Expected:** ✅ Layout adapts appropriately
3. [ ] Resize back to desktop
   - **Expected:** ✅ Full layout restored

**Result:** ⬜ PASS  ⬜ FAIL
**Notes:** _______________________________________________

---

## Test Suite 2: UploadPage Testing (60 minutes)

### 2.1 Initial State Test
**URL:** http://localhost:3001/upload

**Steps:**
1. [ ] Navigate to Upload page

**Expected Results:**
- [ ] ✅ Cloud upload icon displayed (centered)
- [ ] ✅ "Drag and drop files here, or click to browse" text
- [ ] ✅ Supported formats list: ".pdf, .docx, .doc, .xlsx, .xls, .txt"
- [ ] ✅ "Maximum size: 50 MB per file" text
- [ ] ✅ "Browse Files" button visible (primary blue)
- [ ] ✅ No file list showing
- [ ] ✅ No errors in console

**Result:** ⬜ PASS  ⬜ FAIL
**Notes:** _______________________________________________

---

### 2.2 File Validation Test

**Test 2.2a: File Too Large**
1. [ ] Click "Browse Files"
2. [ ] Select `test-toolarge.pdf` (55MB file)
3. [ ] Observe result

**Expected:**
- [ ] ✅ File appears in file list
- [ ] ✅ Status shows red ✗ (error icon)
- [ ] ✅ Error message: "File too large. Maximum size is 50 MB."
- [ ] ✅ "Upload" button shows "Upload 0 Files" (disabled or shows 0 count)

**Test 2.2b: Invalid File Type**
4. [ ] Select a file with invalid extension (e.g., `.jpg`, `.mp4`, `.zip`)

**Expected:**
- [ ] ✅ File appears with error status
- [ ] ✅ Error message: "File type not supported. Allowed types: .pdf, .docx, ..."
- [ ] ✅ Cannot be uploaded

**Test 2.2c: Valid Files**
5. [ ] Clear all files (click "Clear All" or remove individually)
6. [ ] Select valid files: `test-small.pdf`, `test-contract.docx`, `test-notes.txt`

**Expected:**
- [ ] ✅ All 3 files show "Ready" status (gray text)
- [ ] ✅ File names displayed correctly
- [ ] ✅ File sizes shown (e.g., "1.2 MB", "534 KB")
- [ ] ✅ "Upload 3 Files" button enabled
- [ ] ✅ Each file has X button to remove

**Result:** ⬜ PASS  ⬜ FAIL
**Notes:** _______________________________________________

---

### 2.3 Drag-and-Drop Test

**Test 2.3a: Drag Over Effect**
1. [ ] Clear all files
2. [ ] Drag `test-medium.pdf` file OVER the drop zone (don't drop yet)

**Expected:**
- [ ] ✅ Drop zone border changes to blue
- [ ] ✅ Background highlights (light blue tint)
- [ ] ✅ Effect appears immediately on drag over

**Test 2.3b: Drag Leave Effect**
3. [ ] Move mouse outside drop zone (still dragging)

**Expected:**
- [ ] ✅ Highlight disappears
- [ ] ✅ Zone returns to default state

**Test 2.3c: Drop File**
4. [ ] Drag file back over zone and release (drop)

**Expected:**
- [ ] ✅ File added to file list
- [ ] ✅ Status shows "Ready"
- [ ] ✅ File size displayed
- [ ] ✅ Highlight effect removed

**Test 2.3d: Multi-File Drag**
5. [ ] Select multiple files in file explorer
6. [ ] Drag all files to drop zone at once

**Expected:**
- [ ] ✅ ALL files added to list
- [ ] ✅ Each file validated individually
- [ ] ✅ Invalid files show error status
- [ ] ✅ Valid files show "Ready" status

**Result:** ⬜ PASS  ⬜ FAIL
**Notes:** _______________________________________________

---

### 2.4 Upload Process Test

**Test 2.4a: Single File Upload**
1. [ ] Clear all files
2. [ ] Add one valid file: `test-small.pdf`
3. [ ] Click "Upload 1 File" button

**Expected:**
- [ ] ✅ Button changes to "Uploading..." and disables
- [ ] ✅ File status changes to "Uploading"
- [ ] ✅ Spinner icon appears next to file
- [ ] ✅ Progress percentage shows (0% → 100%)
- [ ] ✅ Progress bar fills from left to right
- [ ] ✅ Status changes to "✓ Uploaded" (green text)
- [ ] ✅ Success toast appears: "Successfully uploaded 1 file"
- [ ] ⏱️ After ~2 seconds: File disappears from list (auto-removed)

**Test 2.4b: Multi-File Sequential Upload**
4. [ ] Add 3 valid files
5. [ ] Click "Upload 3 Files"

**Expected:**
- [ ] ✅ Files upload ONE AT A TIME (sequential, not parallel)
- [ ] ✅ First file: Uploading → Success
- [ ] ✅ Second file: starts AFTER first completes
- [ ] ✅ Third file: starts AFTER second completes
- [ ] ✅ Each shows individual progress
- [ ] ✅ Success toast: "Successfully uploaded 3 files"
- [ ] ✅ All successful files auto-removed after 2 seconds

**Test 2.4c: Verify in DocumentsPage**
6. [ ] Navigate to `/documents` page

**Expected:**
- [ ] ✅ All uploaded files appear in document list
- [ ] ✅ Correct file names
- [ ] ✅ Correct file sizes
- [ ] ✅ Upload dates show today

**Result:** ⬜ PASS  ⬜ FAIL
**Notes:** _______________________________________________

---

### 2.5 Error Handling During Upload

**Test 2.5a: Network Failure Mid-Upload**
1. [ ] Add 3 files to upload queue
2. [ ] Open terminal: `docker stop omega-backend-fastapi`
3. [ ] Click "Upload 3 Files"

**Expected:**
- [ ] ✅ First file attempts upload
- [ ] ✅ After timeout/error: Status changes to ✗ (red)
- [ ] ✅ Error message displays (e.g., "Upload failed")
- [ ] ✅ Upload continues to second file (attempts all)
- [ ] ✅ All files fail with error status
- [ ] ✅ Error toast: "Failed to upload 3 files"

**Test 2.5b: Retry After Fix**
4. [ ] Restart backend: `docker start omega-backend-fastapi`
5. [ ] Wait 10 seconds
6. [ ] Verify failed files still in list with error status
7. [ ] Click "Upload 3 Files" again

**Expected:**
- [ ] ✅ ONLY error-status files upload (successful ones not re-uploaded)
- [ ] ✅ Upload succeeds this time
- [ ] ✅ All files show success
- [ ] ✅ Success toast appears

**Result:** ⬜ PASS  ⬜ FAIL
**Notes:** _______________________________________________

---

### 2.6 File Removal Test

**Test 2.6a: Remove Before Upload**
1. [ ] Add 5 files to list
2. [ ] Click X button on file #3

**Expected:**
- [ ] ✅ File #3 removed from list
- [ ] ✅ Other 4 files remain
- [ ] ✅ "Upload X Files" button updates to "Upload 4 Files"

**Test 2.6b: Remove During Upload**
3. [ ] Click "Upload 4 Files"
4. [ ] While first file is uploading, try to click X on it

**Expected:**
- [ ] ✅ X button is hidden/disabled on uploading file
- [ ] ✅ Cannot remove file mid-upload

5. [ ] Try to click X on a pending file (not yet uploading)

**Expected:**
- [ ] ⚠️ Depends on implementation - may allow removal or may block

**Test 2.6c: Clear All**
6. [ ] Add multiple files
7. [ ] Click "Clear All" button

**Expected:**
- [ ] ✅ All non-uploading files removed
- [ ] ✅ List becomes empty (or only uploading files remain)

**Result:** ⬜ PASS  ⬜ FAIL
**Notes:** _______________________________________________

---

### 2.7 UI States Verification

**Test All Visual States:**
1. [ ] **Pending State:**
   - Gray "Ready" text
   - No spinner
   - X button visible

2. [ ] **Uploading State:**
   - Spinner icon (animated)
   - Progress percentage (e.g., "45%")
   - Progress bar filling
   - X button hidden
   - File row not removable

3. [ ] **Success State:**
   - Green "✓ Uploaded" text
   - No spinner
   - X button visible (briefly, before auto-remove)

4. [ ] **Error State:**
   - Red "✗ Error message" text
   - No spinner
   - X button visible
   - Can retry upload

**Result:** ⬜ PASS  ⬜ FAIL
**Notes:** _______________________________________________

---

### 2.8 Edge Cases Test

**Test 2.8a: Duplicate Files**
1. [ ] Add `test.pdf`
2. [ ] Add same `test.pdf` again

**Expected:**
- [ ] ✅ Both instances appear in list
- [ ] ⚠️ Both will upload (no deduplication currently)
- [ ] **Note:** Document this as current behavior

**Test 2.8b: Empty Upload**
3. [ ] Clear all files (empty list)
4. [ ] Try to click "Upload 0 Files" button

**Expected:**
- [ ] ✅ Button disabled OR
- [ ] ✅ Warning toast: "No files to upload"

**Test 2.8c: Navigate Away During Upload**
5. [ ] Add files and start upload
6. [ ] Mid-upload, click "Documents" in sidebar

**Expected:**
- [ ] ✅ Navigation occurs (leaves upload page)
7. [ ] Click "Upload" in sidebar to return

**Expected:**
- [ ] ⚠️ Upload state lost (no persistence currently)
- [ ] ✅ Fresh empty upload page
- [ ] **Note:** Document this limitation

**Test 2.8d: Large File Edge Case**
8. [ ] Add a file that's exactly 50MB (or 49.9MB)

**Expected:**
- [ ] ✅ File accepted (at or just under limit)
- [ ] ✅ Shows "Ready" status
- [ ] ✅ Can upload successfully

9. [ ] Add a file that's 50.1MB

**Expected:**
- [ ] ✅ File rejected with "too large" error

**Result:** ⬜ PASS  ⬜ FAIL
**Notes:** _______________________________________________

---

## Test Suite 3: Comparison Testing (30 minutes)

### 3.1 Side-by-Side Feature Comparison

**Setup:**
- Open Vanilla JS in one browser tab: http://localhost:3000
- Open React in another tab: http://localhost:3001
- Login to both with same credentials

**Test Matrix:**

| Feature | Vanilla (Port 3000) | React (Port 3001) | Parity? |
|---------|---------------------|-------------------|---------|
| **Documents Table** |  |  |  |
| Display documents | ⬜ Works | ⬜ Works | ⬜ Yes ⬜ No |
| Sort by Name | ⬜ Works | ⬜ Works | ⬜ Yes ⬜ No |
| Sort by Date | ⬜ Works | ⬜ Works | ⬜ Yes ⬜ No |
| Sort by Type | ⬜ Works | ⬜ Works | ⬜ Yes ⬜ No |
| Pagination 10/pg | ⬜ Works | ⬜ Works | ⬜ Yes ⬜ No |
| Pagination 25/pg | ⬜ Works | ⬜ Works | ⬜ Yes ⬜ No |
| Pagination 50/pg | ⬜ Works | ⬜ Works | ⬜ Yes ⬜ No |
| Select All | ⬜ Works | ⬜ Works | ⬜ Yes ⬜ No |
| Select Individual | ⬜ Works | ⬜ Works | ⬜ Yes ⬜ No |
| Row click → Detail | ⬜ Works | ⬜ 404 | ⬜ Yes ⬜ **No** |
| Empty state | ⬜ Works | ⬜ Works | ⬜ Yes ⬜ No |
| Loading state | ⬜ Works | ⬜ Works | ⬜ Yes ⬜ No |
| Error handling | ⬜ Works | ⬜ Works | ⬜ Yes ⬜ No |
| **Upload** |  |  |  |
| Drag-drop zone | ⬜ Works | ⬜ Works | ⬜ Yes ⬜ No |
| Browse button | ⬜ Works | ⬜ Works | ⬜ Yes ⬜ No |
| File validation | ⬜ Works | ⬜ Works | ⬜ Yes ⬜ No |
| Multi-file | ⬜ Works | ⬜ Works | ⬜ Yes ⬜ No |
| Progress tracking | ⬜ Works | ⬜ Works | ⬜ Yes ⬜ No |
| Error handling | ⬜ Works | ⬜ Works | ⬜ Yes ⬜ No |
| Success toast | ⬜ Works | ⬜ Works | ⬜ Yes ⬜ No |
| **UX Differences** |  |  |  |
| Upload speed | ⬜ Parallel | ⬜ Sequential | ⬜ Different |
| UI polish | Rate 1-5: ___ | Rate 1-5: ___ | - |
| Responsiveness | Rate 1-5: ___ | Rate 1-5: ___ | - |

**Notes on Differences:**
_________________________________________________________________
_________________________________________________________________
_________________________________________________________________

**Result:** ⬜ PASS  ⬜ FAIL
**Overall Parity:** ___% (count matching features)

---

## Test Suite 4: Integration Testing (30 minutes)

### 4.1 Complete End-to-End Workflow

**Test the full user journey:**

1. [ ] **Step 1:** Register new test user
   - Username: `e2etest`
   - Email: `e2e@test.com`
   - Password: `E2ETest123!`
   - ✅ Redirects to dashboard after registration

2. [ ] **Step 2:** Navigate to Upload
   - ✅ Upload page loads correctly

3. [ ] **Step 3:** Upload 5 documents
   - Mix of PDF, DOCX, TXT files
   - ✅ All uploads succeed
   - ✅ Success toasts appear

4. [ ] **Step 4:** Navigate to Documents
   - ✅ All 5 documents visible in table

5. [ ] **Step 5:** Test table features
   - Sort by Name (ascending)
   - ✅ Sorted correctly
   - Change to 25 rows per page
   - ✅ Shows all documents

6. [ ] **Step 6:** Select documents
   - Select 3 documents with checkboxes
   - ✅ Selection state correct

7. [ ] **Step 7:** Click document to view detail
   - ✅ Navigates to `/documents/{id}`
   - ⚠️ Currently shows 404 (expected - route not implemented)

8. [ ] **Step 8:** Logout
   - Click user menu → Logout
   - ✅ Redirects to login page
   - ✅ Token cleared

9. [ ] **Step 9:** Login again
   - ✅ Documents still present
   - ✅ Data persisted in backend

**Result:** ⬜ PASS  ⬜ FAIL
**Notes:** _______________________________________________

---

### 4.2 API Integration Verification

**Use Browser DevTools → Network tab:**

**Test Upload API Call:**
1. [ ] Clear network log
2. [ ] Upload a file
3. [ ] Filter by "upload"

**Verify:**
- [ ] ✅ Request: POST to `/api/documents/upload`
- [ ] ✅ Content-Type: `multipart/form-data`
- [ ] ✅ Authorization header: `Bearer {token}`
- [ ] ✅ Response: 200 OK
- [ ] ✅ Response body: Document object with id, name, size, etc.

**Test Documents List API Call:**
4. [ ] Clear network log
5. [ ] Navigate to Documents page
6. [ ] Filter by "documents"

**Verify:**
- [ ] ✅ Request: GET to `/api/documents`
- [ ] ✅ Authorization header: `Bearer {token}`
- [ ] ✅ Response: 200 OK
- [ ] ✅ Response body: Array of document objects

**Result:** ⬜ PASS  ⬜ FAIL
**Notes:** _______________________________________________

---

## Known Issues / Expected Failures

Document any issues that are **expected** and not bugs:

1. **Document Detail Route 404**
   - Status: ⚠️ Expected
   - Reason: Route not yet implemented (Phase 2 work)
   - Click document row → 404
   - Will be fixed in next phase

2. **Selection Doesn't Persist Across Pages**
   - Status: ⚠️ Current Behavior
   - Reason: Not yet implemented (future enhancement)
   - Select rows → change page → selection lost

3. **Upload State Lost on Navigation**
   - Status: ⚠️ Current Behavior
   - Reason: No upload persistence (future enhancement)
   - Upload in progress → navigate away → state lost

4. **Sequential vs Parallel Upload**
   - Status: ⚠️ Different Implementation
   - Vanilla: May upload in parallel
   - React: Uploads sequentially (one at a time)
   - Both are valid approaches

Add any additional known issues:
_________________________________________________________________
_________________________________________________________________

---

## Bug Report Template

**For each FAIL, document:**

**Bug #:** ___
**Severity:** ⬜ Critical  ⬜ High  ⬜ Medium  ⬜ Low
**Component:** ⬜ DocumentsPage  ⬜ UploadPage  ⬜ Other
**Description:** _______________________________________________
**Steps to Reproduce:**
1. _______________________________________________
2. _______________________________________________
3. _______________________________________________

**Expected:** _______________________________________________
**Actual:** _______________________________________________
**Screenshot:** (if applicable)
**Console Errors:** _______________________________________________
**Browser/OS:** _______________________________________________

---

## Testing Summary

**Date Completed:** _______________
**Total Time:** ______ hours
**Tester:** ___________________

**Results:**
- Total Test Cases: ___
- Passed: ___
- Failed: ___
- Known Issues: ___
- Blocked: ___

**Pass Rate:** ____%

**Critical Findings:**
_________________________________________________________________
_________________________________________________________________
_________________________________________________________________

**Recommendations:**
_________________________________________________________________
_________________________________________________________________
_________________________________________________________________

**Ready for Phase 2 Implementation?** ⬜ Yes  ⬜ No (fix issues first)

---

**Next Steps:**
- [ ] Fix any critical bugs found
- [ ] Create bug tickets for non-critical issues
- [ ] Proceed to Phase 2: PDF Viewer Implementation
- [ ] Update PHASE3_PROGRESS_UPDATE.md with testing results
