# Development Mode Guide

## Overview

This guide explains how to run the Omega Workflow application in development mode, which enables live code editing without rebuilding Docker containers.

## What's Different in Dev Mode?

### Production Mode (`docker-compose.yml`)
- Code is copied into containers at build time
- Changes require rebuilding containers
- Optimized for performance
- Uses production environment variables

### Development Mode (`docker-compose.dev.yml`)
- Code is mounted as volumes (live editing)
- Changes reflect immediately without rebuild
- Frontend auto-restarts on file changes (nodemon)
- Backend auto-reloads on file changes (uvicorn --reload)
- Database and uploads persist across restarts

---

## Quick Start

### 1. Stop Production Containers
```bash
docker-compose down
```

### 2. Start Dev Mode
```bash
docker-compose -f docker-compose.dev.yml up
```

Or run in background:
```bash
docker-compose -f docker-compose.dev.yml up -d
```

### 3. View Logs
```bash
docker-compose -f docker-compose.dev.yml logs -f
```

### 4. Stop Dev Mode
```bash
docker-compose -f docker-compose.dev.yml down
```

---

## Making Code Changes

### Frontend Changes
Edit any file in `./frontend/`:
- JavaScript files (`js/*.js`)
- HTML files (`*.html`)
- CSS files (`css/*.css`)
- Server code (`server.js`)

**Changes detected and applied automatically** via nodemon. Just refresh your browser!

### Backend Changes
Edit any file in `./backend-fastapi/`:
- Python files (`*.py`)
- Main API (`main.py`)
- Database layer (`database_async.py`)

**Changes detected and applied automatically** via uvicorn --reload. API endpoints update immediately!

### When to Rebuild
You only need to rebuild if you:
- Change `package.json` dependencies (frontend)
- Change `requirements.txt` dependencies (backend)
- Modify Dockerfiles

To rebuild in dev mode:
```bash
docker-compose -f docker-compose.dev.yml up --build
```

---

## Container Names

- **Frontend**: `omega-frontend-dev` (port 3000)
- **Backend**: `omega-backend-fastapi-dev` (port 5001)

---

## Accessing the Application

- **Frontend**: http://localhost:3000
- **Backend API**: http://localhost:5001/api
- **API Docs**: http://localhost:5001/api/docs

---

## Troubleshooting

### Changes Not Reflecting?

**Frontend:**
1. Check nodemon is running:
   ```bash
   docker logs omega-frontend-dev --tail 20
   ```
2. Look for file change detection messages
3. Hard refresh browser (Ctrl+Shift+R / Cmd+Shift+R)

**Backend:**
1. Check uvicorn reload is working:
   ```bash
   docker logs omega-backend-fastapi-dev --tail 20
   ```
2. Look for "Reloading..." messages
3. Check for syntax errors in logs

### Port Already in Use?
Stop production containers first:
```bash
docker-compose down
```

### Database Changes Not Persisting?
Database is stored in the `database-data` volume. To reset:
```bash
docker-compose -f docker-compose.dev.yml down -v
```
⚠️ Warning: This deletes all data!

### Permission Issues?
If you see permission errors on mounted volumes:
```bash
sudo chown -R $USER:$USER ./frontend ./backend-fastapi
```

---

## Development Workflow

### Typical Day
1. Start dev mode in the morning:
   ```bash
   docker-compose -f docker-compose.dev.yml up -d
   ```

2. Edit code throughout the day - changes reflect automatically

3. Monitor logs if needed:
   ```bash
   docker-compose -f docker-compose.dev.yml logs -f frontend
   docker-compose -f docker-compose.dev.yml logs -f backend-fastapi
   ```

4. Stop at end of day:
   ```bash
   docker-compose -f docker-compose.dev.yml down
   ```

### Testing a Feature
1. Make changes to code
2. Changes auto-apply (no rebuild needed)
3. Test in browser
4. Iterate quickly

### Adding New Dependencies

**Frontend:**
```bash
# Add to package.json
npm install <package-name>

# Rebuild container to install
docker-compose -f docker-compose.dev.yml up --build frontend
```

**Backend:**
```bash
# Add to requirements.txt
pip install <package-name>

# Rebuild container to install
docker-compose -f docker-compose.dev.yml up --build backend-fastapi
```

---

## Performance Notes

### Dev Mode is Slower
- First startup installs dependencies
- File watching has small overhead
- Live reload takes 1-2 seconds

This is normal and expected. The trade-off is worth it for instant code changes!

### Optimizing Dev Experience
- Keep logs visible to see reload confirmation
- Use browser dev tools for frontend debugging
- Backend changes show "Reloading..." in logs

---

## Switching Between Modes

### From Production to Dev:
```bash
docker-compose down
docker-compose -f docker-compose.dev.yml up -d
```

### From Dev to Production:
```bash
docker-compose -f docker-compose.dev.yml down
docker-compose up --build -d
```

---

## Volume Mounts Explained

### Frontend Volumes
```yaml
- ./frontend:/app              # Source code mounted for live edit
- /app/node_modules            # node_modules stays in container
```

### Backend Volumes
```yaml
- ./backend-fastapi:/app                                # Source code
- backend-dev-packages:/usr/local/lib/python3.11/...   # Python packages
- uploads-data:/app/uploads                             # Uploaded files (persists)
- database-data:/app/database                           # SQLite database (persists)
```

---

## Common Commands Cheat Sheet

```bash
# Start dev mode
docker-compose -f docker-compose.dev.yml up

# Start in background
docker-compose -f docker-compose.dev.yml up -d

# Stop dev mode
docker-compose -f docker-compose.dev.yml down

# View logs
docker-compose -f docker-compose.dev.yml logs -f

# Restart a service
docker-compose -f docker-compose.dev.yml restart frontend
docker-compose -f docker-compose.dev.yml restart backend-fastapi

# Rebuild and restart
docker-compose -f docker-compose.dev.yml up --build

# Reset everything (including data!)
docker-compose -f docker-compose.dev.yml down -v
```

---

## Best Practices

1. **Always use dev mode during development** - Don't rebuild unnecessarily
2. **Commit your changes frequently** - Dev mode doesn't protect against data loss
3. **Test in production mode before deploying** - Dev and prod environments differ slightly
4. **Keep logs visible** - Helps catch errors immediately
5. **Use meaningful commit messages** - Changes are instant, but history isn't!

---

## FAQ

**Q: Do I need to rebuild after every code change?**
A: No! That's the whole point of dev mode. Changes are detected automatically.

**Q: Why are my changes not showing up?**
A: Make sure you're running in dev mode (`docker-compose.dev.yml`), not production mode.

**Q: Can I use both modes simultaneously?**
A: No, they use the same ports. Stop one before starting the other.

**Q: Will my data persist between restarts?**
A: Yes! Database and uploads are stored in Docker volumes that persist.

**Q: How do I reset the database?**
A: `docker-compose -f docker-compose.dev.yml down -v` (⚠️ deletes all data!)

**Q: What if I accidentally delete the volumes?**
A: You'll need to re-upload documents and recreate workflows. Always back up important data!

---

## Summary

Dev mode = **Fast iteration** with live code editing

Production mode = **Optimized performance** for deployment

Use dev mode during development, production mode for deployment!
