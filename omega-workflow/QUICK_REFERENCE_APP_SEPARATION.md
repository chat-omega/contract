# Quick Reference: App Separation

**TL;DR**: Only modify files in `react-app/` directory. Never touch `frontend-vanilla-old/`.

---

## File Locations

```
✅ SAFE TO EDIT:      /home/ubuntu/contract1/omega-workflow/react-app/
❌ DO NOT TOUCH:      /home/ubuntu/contract1/omega-workflow/frontend-vanilla-old/
```

---

## URLs

| App | URL | Modify? |
|-----|-----|---------|
| Vanilla | http://app.omegaintelligence.ai/ | ❌ No |
| React | https://app-react.omegaintelligence.ai/ | ✅ Yes |

---

## Common Tasks

### Edit React App Code
```bash
cd /home/ubuntu/contract1/omega-workflow/react-app/src/
# Edit any files here - SAFE ✅
```

### Install NPM Package (React App)
```bash
cd /home/ubuntu/contract1/omega-workflow/react-app/
npm install <package-name>
```

### Rebuild React App
```bash
cd /home/ubuntu/contract1/omega-workflow/
docker-compose build omega-frontend-react
docker-compose restart omega-frontend-react
```

### Check Git Status (Before Committing)
```bash
git status

# Look for these patterns:
frontend-vanilla-old/    # ❌ BAD - Don't commit vanilla app changes
react-app/              # ✅ GOOD - React app changes only
```

### Commit React App Changes
```bash
# Add only React app files
git add react-app/

# Commit with clear message
git commit -m "React: <describe change>"

# Push
git push
```

---

## Danger Zones ⚠️

**NEVER run these commands**:

```bash
# ❌ DON'T edit vanilla app files
vim frontend-vanilla-old/js/auth.js
nano frontend-vanilla-old/server.js

# ❌ DON'T rebuild vanilla container
docker-compose build omega-frontend-vanilla
docker-compose restart omega-frontend-vanilla

# ❌ DON'T add vanilla app to git
git add frontend-vanilla-old/
git add .  # (too broad - might include vanilla)

# ❌ DON'T install packages in vanilla app
cd frontend-vanilla-old/ && npm install
```

---

## Safety Checks

**Before committing**, run:

```bash
# 1. Check what files changed
git status

# 2. Review the changes
git diff

# 3. Look for vanilla app files
git status | grep "frontend-vanilla-old"
# If this returns anything → STOP and revert those changes

# 4. Commit only React app
git add react-app/
git commit -m "React: <your change>"
```

---

## Emergency: "I accidentally edited vanilla app"

```bash
# Revert all changes to vanilla app
git checkout frontend-vanilla-old/

# Verify it's restored
git status
```

---

## Container Reference

| Container | Port | Status |
|-----------|------|--------|
| `omega-frontend-vanilla` | 3000 | 🔒 Don't touch |
| `omega-frontend-react` | 8081 | ✅ Rebuild anytime |
| `omega-backend-fastapi` | 5001 | ⚠️ Shared by both |

---

## When in Doubt

**Ask yourself**:
1. Is the file in `react-app/`? ✅ Safe to edit
2. Is the file in `frontend-vanilla-old/`? ❌ Don't edit
3. Am I rebuilding `omega-frontend-react`? ✅ Safe
4. Am I rebuilding `omega-frontend-vanilla`? ❌ Don't

**Golden Rule**: If unsure, DON'T do it. Ask first.

---

## See Full Documentation

Read `APP_SEPARATION_GUIDE.md` for complete details.
