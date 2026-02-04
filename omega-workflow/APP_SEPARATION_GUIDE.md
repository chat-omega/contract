# App Separation Guide: Vanilla JavaScript vs React App

**Last Updated**: 2025-11-11
**Status**: ✅ APPS ARE FULLY SEPARATED

---

## Overview

This document explains the separation between two frontend applications running in the omega-workflow project:

1. **Vanilla JavaScript App** - `http://app.omegaintelligence.ai/`
2. **React App** - `https://app-react.omegaintelligence.ai/`

**IMPORTANT**: Future changes should **ONLY** be made to the React app. The vanilla JavaScript app should remain **UNTOUCHED**.

---

## Directory Structure

```
/home/ubuntu/contract1/omega-workflow/
│
├── frontend-vanilla-old/           ← VANILLA APP (DO NOT MODIFY)
│   ├── js/
│   │   ├── auth.js
│   │   ├── app.js
│   │   ├── credit-analysis.js
│   │   └── document-detail.js
│   ├── css/
│   ├── index.html
│   ├── login.html
│   ├── server.js
│   ├── package.json
│   └── node_modules/
│
├── react-app/                      ← REACT APP (ACTIVE DEVELOPMENT)
│   ├── src/
│   │   ├── components/
│   │   ├── pages/
│   │   ├── services/
│   │   └── App.tsx
│   ├── public/
│   ├── package.json
│   ├── vite.config.ts
│   ├── tsconfig.json
│   └── node_modules/
│
├── backend-fastapi/                ← SHARED BACKEND (both apps use this)
│   └── main.py
│
└── docker-compose.yml              ← Container definitions
```

---

## Application Mapping

### Vanilla JavaScript App (READ-ONLY)

| Property | Value |
|----------|-------|
| **URL** | `http://app.omegaintelligence.ai/` |
| **Directory** | `/home/ubuntu/contract1/omega-workflow/frontend-vanilla-old/` |
| **Container** | `omega-frontend-vanilla` |
| **Port** | 3000 (host) → 3000 (container) |
| **Technology** | Express.js + Vanilla JavaScript |
| **Backend** | `omega-backend-fastapi` (port 5001) |
| **Status** | **🔒 READ-ONLY - DO NOT MODIFY** |

**Key Files (DO NOT EDIT)**:
- `frontend-vanilla-old/js/auth.js` - Authentication
- `frontend-vanilla-old/js/app.js` - Main application
- `frontend-vanilla-old/js/credit-analysis.js` - Credit analysis
- `frontend-vanilla-old/js/document-detail.js` - Document viewer
- `frontend-vanilla-old/server.js` - Express server
- `frontend-vanilla-old/login.html` - Login page
- `frontend-vanilla-old/index.html` - Main page

### React App (ACTIVE DEVELOPMENT)

| Property | Value |
|----------|-------|
| **URL** | `https://app-react.omegaintelligence.ai/` |
| **Directory** | `/home/ubuntu/contract1/omega-workflow/react-app/` |
| **Container** | `omega-frontend-react` |
| **Port** | 8081 (host) → 80 (container) |
| **Technology** | React + TypeScript + Vite |
| **Backend** | `omega-backend-fastapi` (port 5001) |
| **Status** | **✅ ACTIVE - Make all changes here** |

**Key Directories (SAFE TO EDIT)**:
- `react-app/src/` - All React source code
- `react-app/public/` - Static assets
- `react-app/src/components/` - React components
- `react-app/src/pages/` - Page components
- `react-app/src/services/` - API services
- `react-app/package.json` - Dependencies

---

## Docker Containers

### Container Overview

```bash
# List running containers
docker ps --format "table {{.Names}}\t{{.Ports}}\t{{.Status}}"

# Expected output:
omega-frontend-vanilla       3000:3000    Up (Vanilla JS)
omega-frontend-react          8081:80     Up (React)
omega-backend-fastapi        5001:5000    Up (Shared backend)
```

### Container Independence

**✅ Containers are completely separate**:
- No shared volumes between frontend containers
- Each has its own filesystem
- Rebuilding one does NOT affect the other

### Rebuild Commands

**Vanilla App (DON'T DO THIS)**:
```bash
# DO NOT RUN THESE COMMANDS
cd /home/ubuntu/contract1/omega-workflow
docker-compose build omega-frontend-vanilla    # ❌ Don't rebuild vanilla app
docker-compose restart omega-frontend-vanilla  # ❌ Don't restart vanilla app
```

**React App (SAFE TO DO)**:
```bash
# SAFE - Only affects React app
cd /home/ubuntu/contract1/omega-workflow
docker-compose build omega-frontend-react      # ✅ Safe to rebuild
docker-compose restart omega-frontend-react    # ✅ Safe to restart
```

---

## Nginx Configuration

### Separate Configurations

**Vanilla App**:
```
Config File: /etc/nginx/sites-enabled/app-omegaintelligence
Domain: app.omegaintelligence.ai
Proxy: localhost:3000 → omega-frontend-vanilla container
API Proxy: localhost:5001 → omega-backend-fastapi
```

**React App**:
```
Config File: /etc/nginx/sites-enabled/app-react-omegaintelligence
Domain: app-react.omegaintelligence.ai
Proxy: localhost:8081 → omega-frontend-react container
API Proxy: localhost:5001 → omega-backend-fastapi
SSL: Let's Encrypt certificate
```

**✅ Nginx configurations are completely separate** - changing one does NOT affect the other.

---

## Shared Components

### Shared Backend ✅ (This is OK)

**Both apps share the same backend API**:
- Backend: `omega-backend-fastapi` running on port 5001
- Database: Shared PostgreSQL database
- Authentication: Shared JWT authentication system

**This is intentional and acceptable**. Both apps:
- Call the same `/api/auth/login` endpoint
- Use the same JWT tokens
- Access the same database records

**Impact**: Backend API changes will affect BOTH apps. If you modify backend endpoints, test both apps.

### Separate Dependencies

**Each app has its own**:
- `node_modules/` directory
- `package.json` file
- Build configuration
- TypeScript/Babel config (React app only)

**✅ No dependency sharing** - installing packages in React app won't affect vanilla app.

---

## Development Workflow

### Working on React App Only

**Safe Operations** (✅ Do these):

1. **Edit React app code**:
   ```bash
   cd /home/ubuntu/contract1/omega-workflow/react-app/
   # Edit any files in src/, public/, etc.
   ```

2. **Install npm packages**:
   ```bash
   cd /home/ubuntu/contract1/omega-workflow/react-app/
   npm install <package-name>
   ```

3. **Rebuild React container**:
   ```bash
   cd /home/ubuntu/contract1/omega-workflow/
   docker-compose build omega-frontend-react
   docker-compose restart omega-frontend-react
   ```

4. **Test React app**:
   ```bash
   curl https://app-react.omegaintelligence.ai/
   # Or open in browser
   ```

**Unsafe Operations** (❌ Don't do these):

1. **DON'T edit vanilla app files**:
   ```bash
   # ❌ NEVER EDIT THESE:
   frontend-vanilla-old/js/auth.js
   frontend-vanilla-old/js/app.js
   frontend-vanilla-old/js/credit-analysis.js
   frontend-vanilla-old/server.js
   frontend-vanilla-old/login.html
   ```

2. **DON'T rebuild vanilla container**:
   ```bash
   # ❌ DON'T RUN:
   docker-compose build omega-frontend-vanilla
   docker-compose restart omega-frontend-vanilla
   ```

3. **DON'T install packages in vanilla app**:
   ```bash
   # ❌ DON'T RUN:
   cd frontend-vanilla-old/
   npm install <anything>
   ```

---

## Git Workflow

### Git Repository Structure

**Both apps are in the SAME git repository**:
```
Repository: git@github.com:chat-omega/contract.git
Branch: main
Location: /home/ubuntu/contract1/
```

**This means**:
- Git commits can include changes to multiple apps
- Git push/pull affects all apps in the repository
- Accidental edits to vanilla app will be committed if not careful

### Commit Best Practices

**1. Check what you're committing**:
```bash
# Always review changes before committing
git status
git diff

# Look for ANY files in frontend-vanilla-old/
# If you see any, you may have accidentally edited vanilla app
```

**2. Commit only React app changes**:
```bash
# Add only React app files
git add react-app/

# OR add specific files
git add react-app/src/components/MyNewComponent.tsx

# DON'T use:
git add .                        # ❌ Adds everything
git add frontend-vanilla-old/    # ❌ Adds vanilla app
```

**3. Write clear commit messages**:
```bash
git commit -m "React: Add new dashboard component"
git commit -m "React: Fix document loading bug"
git commit -m "React: Update API service with authentication"
```

**4. Verify before pushing**:
```bash
# Check what will be pushed
git log --oneline -5
git show HEAD

# Make sure no vanilla app files are included
```

---

## Testing Independence

### How to Verify Apps Are Separate

**1. Check that vanilla app still works**:
```bash
# After making React app changes, verify vanilla app is unchanged
curl http://app.omegaintelligence.ai/login.html
# Should return vanilla login page unchanged
```

**2. Check containers are separate**:
```bash
docker ps | grep frontend
# Should show TWO separate containers:
# - omega-frontend-vanilla (port 3000)
# - omega-frontend-react (port 8081)
```

**3. Check nginx routing**:
```bash
# Vanilla app
curl -I http://app.omegaintelligence.ai/
# Should proxy to localhost:3000

# React app
curl -I https://app-react.omegaintelligence.ai/
# Should proxy to localhost:8081
```

**4. Check file system separation**:
```bash
# React app files
ls -la /home/ubuntu/contract1/omega-workflow/react-app/src/

# Vanilla app files (should NOT have changed)
ls -la /home/ubuntu/contract1/omega-workflow/frontend-vanilla-old/js/
```

---

## Troubleshooting

### "I accidentally modified vanilla app files"

**Solution**:
```bash
# Revert changes to vanilla app
cd /home/ubuntu/contract1/omega-workflow/
git checkout frontend-vanilla-old/

# Verify vanilla app files are restored
git status
```

### "React app changes affected vanilla app"

**This should NOT happen**. If it does:

1. **Check if backend was modified**:
   ```bash
   git log backend-fastapi/main.py
   # Backend changes affect BOTH apps
   ```

2. **Check for shared configuration**:
   ```bash
   # Look for any shared config files
   find . -name "*.env" -o -name "config.*"
   ```

3. **Verify container separation**:
   ```bash
   docker inspect omega-frontend-vanilla | grep -i volume
   docker inspect omega-frontend-react | grep -i volume
   # Should have NO shared volumes
   ```

### "Rebuild takes too long"

**Optimize rebuilds**:
```bash
# Only rebuild changed service
docker-compose build omega-frontend-react

# Use cache
docker-compose build --no-cache omega-frontend-react  # Rarely needed

# Restart without rebuilding (if only code changed)
docker-compose restart omega-frontend-react
```

---

## Quick Reference

### URLs

| App | URL | Status |
|-----|-----|--------|
| Vanilla | `http://app.omegaintelligence.ai/` | 🔒 Read-only |
| React | `https://app-react.omegaintelligence.ai/` | ✅ Active dev |

### Directories

| App | Directory | Status |
|-----|-----------|--------|
| Vanilla | `/home/ubuntu/contract1/omega-workflow/frontend-vanilla-old/` | 🔒 Don't modify |
| React | `/home/ubuntu/contract1/omega-workflow/react-app/` | ✅ Modify freely |

### Containers

| App | Container | Command |
|-----|-----------|---------|
| Vanilla | `omega-frontend-vanilla` | ❌ Don't restart |
| React | `omega-frontend-react` | ✅ `docker-compose restart omega-frontend-react` |

### Ports

| App | Container Port | Host Port |
|-----|---------------|-----------|
| Vanilla | 3000 | 3000 |
| React | 80 | 8081 |
| Backend | 5000 | 5001 |

---

## Summary

### What's Separated ✅

- ✅ Source code directories
- ✅ Docker containers
- ✅ Nginx configurations
- ✅ Node modules and dependencies
- ✅ Build processes
- ✅ Port numbers
- ✅ Domain names
- ✅ Package.json files

### What's Shared ⚠️

- ⚠️ Git repository (same repo, different directories)
- ⚠️ Backend API (omega-backend-fastapi)
- ⚠️ Database (PostgreSQL)
- ⚠️ Authentication system (JWT)

### Key Takeaway

**Making changes to the React app will NOT affect the vanilla app at the code or deployment level**, as long as you:
1. Only edit files in `react-app/` directory
2. Only rebuild `omega-frontend-react` container
3. Don't modify shared backend or nginx configs

**The vanilla app will remain completely unchanged** as long as you follow the guidelines in this document.

---

## Questions?

If you're unsure whether a change will affect the vanilla app:

1. **Check the file path** - Is it in `frontend-vanilla-old/`? Don't edit it.
2. **Check the container** - Are you rebuilding `omega-frontend-vanilla`? Don't do it.
3. **Check git status** - Does `git status` show `frontend-vanilla-old/` files? Don't commit them.

**When in doubt, ask before making the change.**
