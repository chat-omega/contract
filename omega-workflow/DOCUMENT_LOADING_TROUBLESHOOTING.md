# Document Loading Troubleshooting: e37f9df8

**URL**: https://app-react.omegaintelligence.ai/documents/e37f9df8
**Date**: 2025-11-11
**Status**: ✅ API Working, Browser Issue Suspected

---

## Quick Diagnosis

**API Test Result**: ✅ **WORKING**
```
Document ID: e37f9df8
Name: BuzzFeed Agreement.pdf
User ID: 2 (admin user)
Status: 200 OK
```

**Backend Logs**: Recent requests show **200 OK** responses
**Issue**: Browser-side problem (authentication or JavaScript error)

---

## What's Working ✅

1. **Backend API**: Responds correctly with 200 OK
2. **Document Exists**: ID e37f9df8, "BuzzFeed Agreement.pdf"
3. **Authentication**: Login with admin/admin123 works
4. **Container**: omega-frontend-react is running
5. **Nginx Proxy**: Correctly configured

---

## What's NOT Working ❌

**Browser Loading Issue**: Document doesn't display when accessed via browser

**Possible Causes**:
1. You're not logged in on the browser
2. Browser token is expired or invalid
3. JavaScript error preventing page load
4. Wrong user account (document belongs to user ID 2)
5. Browser cache issue

---

## Step-by-Step Fix

### Step 1: Check If You're Logged In

**Open browser and navigate to**:
```
https://app-react.omegaintelligence.ai/
```

**Expected**:
- ✅ If logged in: You see the dashboard/home page
- ❌ If not logged in: You're redirected to `/login`

**If not logged in**: Go to Step 2
**If logged in**: Go to Step 3

---

### Step 2: Login

**Navigate to**:
```
https://app-react.omegaintelligence.ai/login
```

**Login Credentials** (for document e37f9df8):
```
Username: admin
Password: admin123
```

**After login**:
- You should be redirected to the dashboard
- Go to Step 4 to access the document

---

### Step 3: Check Browser localStorage

The React app stores authentication in localStorage.

**Open Browser DevTools**:
1. Press `F12` or `Right Click → Inspect`
2. Go to **Application** tab (Chrome) or **Storage** tab (Firefox)
3. Click **Local Storage** → `https://app-react.omegaintelligence.ai`
4. Look for key: `auth-storage`

**Check the value**:
```json
{
  "state": {
    "user": {...},
    "token": "eyJ...",
    "isAuthenticated": true
  },
  "version": 0
}
```

**If missing or isAuthenticated is false**:
- You're not logged in → Go to Step 2
- Clear storage and re-login

**If present with valid token**:
- Go to Step 4

---

### Step 4: Access the Document

**Navigate to**:
```
https://app-react.omegaintelligence.ai/documents/e37f9df8
```

**Keep DevTools open**:
1. Switch to **Console** tab
2. Look for JavaScript errors (red text)
3. Switch to **Network** tab
4. Reload the page

**Check Network tab**:
- Look for request to `/api/documents/e37f9df8`
- Click on it
- Check **Headers** → **Request Headers**
- Verify `Authorization: Bearer eyJ...` is present

**Response Status**:
- ✅ **200 OK**: Document loaded successfully → Check console for rendering errors
- ❌ **401 Unauthorized**: Token is invalid → Go to Step 5
- ❌ **403 Forbidden**: Document belongs to different user → Go to Step 6
- ❌ **404 Not Found**: Document doesn't exist (unlikely) → Verify document ID

---

### Step 5: Token is Invalid/Expired

**Fix**:
1. **Clear localStorage**:
   - DevTools → Application → Local Storage
   - Right-click `auth-storage` → Delete
2. **Reload page**
3. **Login again** with admin/admin123
4. **Try accessing document again**

---

### Step 6: Document Belongs to Different User

**Document e37f9df8 belongs to user_id: 2** (admin user)

**If you're logged in as a different user**:
1. Logout
2. Login as: `admin` / `admin123`
3. Try accessing document again

**Check which user you're logged in as**:
- DevTools → Application → Local Storage → `auth-storage`
- Look at `state.user.id` or `state.user.username`

---

### Step 7: Clear Browser Cache (Last Resort)

If Steps 1-6 don't work:

**Clear cache and reload**:
1. Open DevTools
2. Right-click the **Reload** button (while DevTools is open)
3. Select **Empty Cache and Hard Reload**

**OR**:
1. Clear browser cache entirely
2. Close and reopen browser
3. Navigate to the site fresh
4. Login and try again

---

## Backend Logs Analysis

**Recent Log Entries**:
```
✅ GET /api/documents/e37f9df8 → 200 OK (Working!)
✅ GET /api/documents/e37f9df8/extraction/results → 200 OK
✅ GET /api/documents → 200 OK
❌ GET /api/documents/e37f9df8 → 403 Forbidden (Earlier error)
❌ GET /api/documents → 401 Unauthorized (No auth)
```

**Interpretation**:
- Most recent requests are **successful (200 OK)**
- Earlier 403/401 errors were likely when you weren't logged in or had expired token
- Backend is working correctly NOW

---

## Common Issues & Solutions

### Issue 1: "Page shows blank/loading forever"

**Cause**: JavaScript error or failed API call

**Fix**:
1. Open DevTools → Console
2. Look for errors
3. Check Network tab for failed requests
4. Share error message if unsure

### Issue 2: "Redirects to login page immediately"

**Cause**: Not authenticated or token expired

**Fix**:
1. Login with admin/admin123
2. Make sure to complete login process
3. Verify localStorage has `auth-storage` key after login

### Issue 3: "403 Forbidden" error

**Cause**: Document belongs to different user

**Fix**:
1. Verify you're logged in as `admin` user
2. Check document user_id matches your user ID

### Issue 4: "Network request never completes"

**Cause**: Nginx or backend not responding

**Fix**:
1. Check if backend container is running: `docker ps | grep backend`
2. Check nginx configuration
3. Try accessing API directly: `curl https://app-react.omegaintelligence.ai/api/health`

---

## Testing the API Directly

**You can test the API yourself**:

```bash
# 1. Login
curl -X POST https://app-react.omegaintelligence.ai/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"username":"admin","password":"admin123"}' \
  -k

# Response will include: {"access_token": "eyJ..."}

# 2. Get document (replace TOKEN with access_token from step 1)
curl https://app-react.omegaintelligence.ai/api/documents/e37f9df8 \
  -H "Authorization: Bearer TOKEN" \
  -k
```

**Expected Response**:
```json
{
  "id": "e37f9df8",
  "name": "BuzzFeed Agreement.pdf",
  "user_id": 2,
  "upload_date": "2025-10-11 15:39:50",
  "filename": "BuzzFeed_Agreement.pdf",
  "doc_type": "pdf"
}
```

---

## React App Details

**Container**: `omega-frontend-react`
**Port**: 8081 (host) → 80 (container)
**URL**: https://app-react.omegaintelligence.ai
**Code**: `/home/ubuntu/contract1/omega-workflow/react-app/`

**Features**:
- ✅ PDF Viewer
- ✅ Document listing
- ✅ Extraction results display
- ✅ Authentication with Zustand
- ✅ Protected routes

**Auth Storage**:
- Key: `auth-storage` (localStorage)
- Contains: user, token, isAuthenticated

---

## If Still Not Working

**Provide this information**:

1. **Browser Console Errors**:
   - DevTools → Console tab
   - Screenshot of any red errors

2. **Network Request Details**:
   - DevTools → Network tab
   - Filter: `e37f9df8`
   - Screenshot of request/response

3. **localStorage Contents**:
   - DevTools → Application → Local Storage
   - Value of `auth-storage` key

4. **Steps You Tried**:
   - Which steps from this guide you completed
   - What happened at each step

5. **Browser Used**:
   - Chrome/Firefox/Safari/Edge
   - Version number

---

## Quick Checklist

Before asking for more help, verify:

- [ ] I can access https://app-react.omegaintelligence.ai/
- [ ] I can login with admin/admin123
- [ ] I see `auth-storage` in localStorage after login
- [ ] I'm logged in as user `admin` (user_id: 2)
- [ ] I opened DevTools and checked Console for errors
- [ ] I checked Network tab for the API request
- [ ] I verified the Authorization header is present
- [ ] I tried clearing localStorage and re-logging in
- [ ] I tried hard reload (Ctrl+Shift+R or Cmd+Shift+R)

---

## Summary

**API Status**: ✅ Working perfectly
**Document**: ✅ Exists and returns data
**Issue**: Browser-side authentication or JavaScript error

**Most Likely Fix**: Login to the browser at https://app-react.omegaintelligence.ai/login with `admin`/`admin123`, then navigate to the document.

**Document Details**:
```
ID: e37f9df8
Name: BuzzFeed Agreement.pdf
Owner: user_id 2 (admin)
Type: PDF
Date: 2025-10-11
```

The backend API is working correctly. The issue is in the browser - either you're not logged in, the token is expired, or there's a JavaScript error. Follow the steps above to diagnose and fix.
