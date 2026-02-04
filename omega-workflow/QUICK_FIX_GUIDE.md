# Quick Fix Guide - Browser Issues

## Issue 1: Vanilla App Login - EXACT FIX

### File: `/home/ubuntu/contract1/omega-workflow/frontend-vanilla-old/js/auth.js`

**Current Code (Lines 295-298):**
```javascript
if (result.success) {
    this.setToken(result.tokens.accessToken);
    this.setUserData(result.user);
}
```

**Fixed Code:**
```javascript
if (result.access_token) {
    this.setToken(result.access_token);
    this.setUserData(result.user);
}
```

**Also update lines 368-372 (register endpoint):**
```javascript
// Current:
if (result.success) {
    this.setToken(result.tokens.accessToken);
    this.setUserData(result.user);
}

// Fixed:
if (result.access_token) {
    this.setToken(result.access_token);
    this.setUserData(result.user);
}
```

---

## Issue 2: React App Document Loading - EXACT FIX

### File: `/home/ubuntu/contract1/app.ardour.work/frontend/src/services/documentsApi.ts`

**Update the getDocument function (Lines 104-110):**

**Current Code:**
```typescript
export async function getDocument(documentId: string): Promise<Document> {
  const response = await fetch(`${DOCUMENTS_API_BASE}/api/documents/${documentId}`, {
    headers: getHeaders(),
  });

  return handleResponse<Document>(response);
}
```

**Fixed Code:**
```typescript
export async function getDocument(documentId: string): Promise<Document> {
  const response = await fetch(`${DOCUMENTS_API_BASE}/api/documents/${documentId}`, {
    headers: getHeaders(),
  });

  const data = await handleResponse<any>(response);
  
  // Transform backend response to match frontend interface
  return {
    id: data.id,
    title: data.name || data.title,
    content: data.content || '',
    blocks: data.blocks || [],
    sources: data.sources || [],
    createdAt: data.upload_date || data.createdAt,
    updatedAt: data.updated_at || data.updatedAt,
    metadata: data.metadata || {}
  };
}
```

**Also update listDocuments function (Lines 93-99):**

**Current Code:**
```typescript
export async function listDocuments(): Promise<DocumentMetadata[]> {
  const response = await fetch(`${DOCUMENTS_API_BASE}/api/documents`, {
    headers: getHeaders(),
  });

  return handleResponse<DocumentMetadata[]>(response);
}
```

**Fixed Code:**
```typescript
export async function listDocuments(): Promise<DocumentMetadata[]> {
  const response = await fetch(`${DOCUMENTS_API_BASE}/api/documents`, {
    headers: getHeaders(),
  });

  const data = await handleResponse<any[]>(response);
  
  // Transform each document
  return data.map(doc => ({
    id: doc.id,
    title: doc.name || doc.title,
    createdAt: doc.upload_date || doc.createdAt,
    updatedAt: doc.updated_at || doc.updatedAt,
    metadata: doc.metadata || {}
  }));
}
```

---

## Testing Commands

### Test Vanilla App Login (after fix):
```bash
# 1. Rebuild frontend container
cd /home/ubuntu/contract1/omega-workflow
docker-compose restart frontend-vanilla

# 2. Test in browser
# Go to: http://app.omegaintelligence.ai/login.html
# Username: admin
# Password: admin123

# 3. Check browser console for success
# Should see: "Login successful, stored token and user data"
```

### Test React App Document (after fix):
```bash
# 1. Rebuild React frontend
cd /home/ubuntu/contract1/app.ardour.work
npm run build
docker-compose restart frontend

# 2. Test in browser
# Go to: https://app-react.omegaintelligence.ai/documents/e37f9df8
# Should load document with title "BuzzFeed Agreement.pdf"

# 3. Check browser console
# Should NOT see any field mapping errors
```

---

## Verification Checklist

### Vanilla App:
- [ ] User can enter credentials
- [ ] Login button shows spinner during login
- [ ] No JavaScript errors in console
- [ ] Token is stored in localStorage
- [ ] User is redirected to dashboard
- [ ] Dashboard shows user info

### React App:
- [ ] Document page loads without errors
- [ ] Document title displays correctly
- [ ] No "undefined" fields in UI
- [ ] PDF viewer (if applicable) loads
- [ ] Sidebar shows document metadata

---

## Rollback Plan

### If vanilla app fix breaks something:
```bash
cd /home/ubuntu/contract1/omega-workflow
git checkout frontend-vanilla-old/js/auth.js
docker-compose restart frontend-vanilla
```

### If React app fix breaks something:
```bash
cd /home/ubuntu/contract1/app.ardour.work
git checkout frontend/src/services/documentsApi.ts
npm run build
docker-compose restart frontend
```

---

## Additional Debugging

### Check browser console errors:
```javascript
// Open browser DevTools (F12)
// Go to Console tab
// Look for errors like:
// - "Cannot read property 'accessToken' of undefined"
// - "Cannot read property 'title' of undefined"
// - "Cannot read property 'content' of undefined"
```

### Check network requests:
```javascript
// Open browser DevTools (F12)
// Go to Network tab
// Look for:
// - /api/auth/login request
// - Check Response tab for actual JSON
// - Verify structure matches what frontend expects
```

### Check localStorage:
```javascript
// Open browser DevTools (F12)
// Go to Application tab > Local Storage
// Check for:
// - authToken (should be JWT string)
// - userData (should be JSON object with user info)
```

