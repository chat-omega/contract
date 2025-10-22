# Docker Setup Guide - Omega Workflow

Complete Docker configuration for the Omega Workflow application with production-ready setup.

## Overview

This Docker setup includes:
- **Frontend**: React + Vite + TypeScript served by Nginx
- **Backend**: Node.js + Express + TypeScript API server
- **Backend-FastAPI**: Legacy Python FastAPI service (optional)

## Architecture

```
┌─────────────────────────────────────────────────────┐
│                   Docker Network                     │
│                  (omega-network)                     │
│                                                       │
│  ┌──────────────┐    ┌──────────────┐               │
│  │   Frontend   │───>│   Backend    │               │
│  │ (Nginx:80)   │    │ (Node:3000)  │               │
│  └──────────────┘    └──────────────┘               │
│                                                       │
│                      ┌──────────────┐               │
│                      │Backend-FastAPI│               │
│                      │(Python:5000) │               │
│                      └──────────────┘               │
└─────────────────────────────────────────────────────┘
```

## Files Created

### 1. Frontend Docker Configuration
- `/home/ubuntu/contract1/omega-workflow/frontend-new/Dockerfile` - Multi-stage production build
- `/home/ubuntu/contract1/omega-workflow/frontend-new/nginx.conf` - Nginx web server configuration
- `/home/ubuntu/contract1/omega-workflow/frontend-new/.dockerignore` - Build exclusions

### 2. Backend Docker Configuration
- `/home/ubuntu/contract1/omega-workflow/backend/Dockerfile` - Multi-stage production build
- `/home/ubuntu/contract1/omega-workflow/backend/.dockerignore` - Build exclusions

### 3. Orchestration
- `/home/ubuntu/contract1/omega-workflow/docker-compose.yml` - Production setup
- `/home/ubuntu/contract1/omega-workflow/docker-compose.dev.yml` - Development setup

## Quick Start

### Production Mode

```bash
# Navigate to project root
cd /home/ubuntu/contract1/omega-workflow

# Build and start all services
docker-compose up -d

# View logs
docker-compose logs -f

# Stop all services
docker-compose down

# Rebuild after code changes
docker-compose up -d --build
```

### Development Mode

```bash
# Navigate to project root
cd /home/ubuntu/contract1/omega-workflow

# Start development environment with hot reload
docker-compose -f docker-compose.dev.yml up

# Rebuild and start
docker-compose -f docker-compose.dev.yml up --build

# Stop development environment
docker-compose -f docker-compose.dev.yml down
```

## Service Access

### Production Mode
- **Frontend**: http://localhost:80
- **Backend API**: http://localhost:3000/api
- **Backend-FastAPI**: http://localhost:5001/api
- **Frontend Health**: http://localhost:80/health
- **Backend Health**: http://localhost:3000/api/health

### Development Mode
- **Frontend**: http://localhost:3000
- **Backend API**: http://localhost:8000/api
- **Backend-FastAPI**: http://localhost:5001/api

## Docker Commands

### Build Commands
```bash
# Build all services
docker-compose build

# Build specific service
docker-compose build frontend
docker-compose build backend

# Build with no cache
docker-compose build --no-cache
```

### Container Management
```bash
# Start services
docker-compose up -d

# Stop services
docker-compose down

# Restart specific service
docker-compose restart backend

# View running containers
docker-compose ps

# Remove all containers and volumes
docker-compose down -v
```

### Logs and Debugging
```bash
# View all logs
docker-compose logs

# Follow logs for specific service
docker-compose logs -f frontend

# View last 100 lines
docker-compose logs --tail=100

# Execute command in running container
docker-compose exec backend sh
docker-compose exec frontend sh

# View resource usage
docker stats
```

### Volume Management
```bash
# List volumes
docker volume ls

# Inspect volume
docker volume inspect omega-workflow_uploads-data

# Remove unused volumes
docker volume prune
```

## Environment Variables

### Frontend (.env)
```bash
VITE_API_BASE_URL=http://localhost:8000/api
VITE_APP_NAME=Omega Workflow
VITE_APP_VERSION=1.0.0
```

### Backend (.env)
```bash
NODE_ENV=production
PORT=3000
CORS_ORIGIN=http://localhost:80
```

## Features

### Security
- Non-root user execution
- Read-only design files
- Secure headers in Nginx
- Multi-stage builds (smaller attack surface)

### Performance
- Multi-stage builds for smaller images
- Layer caching optimization
- Gzip compression
- Static asset caching
- Production dependencies only

### Reliability
- Health checks for all services
- Automatic restart policies
- Service dependency management
- Persistent volumes for data

### Development
- Hot reload for frontend and backend
- Volume mounts for live code changes
- Separate development configuration
- Node modules caching

## Image Sizes

Optimized multi-stage builds result in:
- **Frontend**: ~25MB (Alpine + Nginx)
- **Backend**: ~180MB (Alpine + Node.js)

## Volumes

### Production
- `uploads-data`: File uploads storage
- `logs-data`: Application logs
- `database-data`: Database files (FastAPI)

### Development
- `uploads-data-dev`: Development uploads
- `logs-data-dev`: Development logs
- `database-data-dev`: Development database
- `backend-dev-packages`: Python packages cache

## Network

All services communicate through the `omega-network` bridge network:
- Production: `omega-net`
- Development: `omega-dev-net`

## Health Checks

All services include health checks:
- **Frontend**: HTTP check on port 80
- **Backend**: HTTP check on /api/health
- **Backend-FastAPI**: Python health check

## Troubleshooting

### Port Already in Use
```bash
# Check what's using the port
sudo lsof -i :80
sudo lsof -i :3000

# Kill the process or change port in docker-compose.yml
```

### Build Failures
```bash
# Clean Docker cache
docker system prune -a

# Remove all volumes
docker-compose down -v

# Rebuild from scratch
docker-compose build --no-cache
```

### Container Won't Start
```bash
# Check logs
docker-compose logs backend

# Inspect container
docker-compose ps
docker inspect omega-backend

# Check health status
docker-compose ps
```

### Permission Issues
```bash
# Fix volume permissions
sudo chown -R 1001:1001 ./uploads
sudo chown -R 1001:1001 ./logs
```

## Production Deployment

### Build Production Images
```bash
# Build with production target
docker-compose -f docker-compose.yml build

# Tag for registry
docker tag omega-frontend:latest your-registry.com/omega-frontend:latest
docker tag omega-backend:latest your-registry.com/omega-backend:latest

# Push to registry
docker push your-registry.com/omega-frontend:latest
docker push your-registry.com/omega-backend:latest
```

### Environment Configuration
1. Copy `.env.example` files to `.env`
2. Update production values
3. Set secure JWT secrets
4. Configure API endpoints
5. Set CORS origins

### Security Checklist
- [ ] Change default JWT secrets
- [ ] Set appropriate CORS origins
- [ ] Use HTTPS in production
- [ ] Enable rate limiting
- [ ] Set up firewall rules
- [ ] Regular security updates
- [ ] Monitor logs
- [ ] Backup volumes

## Monitoring

### Resource Usage
```bash
# View real-time stats
docker stats

# Check disk usage
docker system df

# View detailed container info
docker-compose ps -a
```

### Logs
```bash
# Stream all logs
docker-compose logs -f

# Filter by service
docker-compose logs -f backend

# Save logs to file
docker-compose logs > docker-logs.txt
```

## Backup and Restore

### Backup Volumes
```bash
# Backup uploads
docker run --rm -v omega-workflow_uploads-data:/data -v $(pwd):/backup alpine tar czf /backup/uploads-backup.tar.gz /data

# Backup database
docker run --rm -v omega-workflow_database-data:/data -v $(pwd):/backup alpine tar czf /backup/database-backup.tar.gz /data
```

### Restore Volumes
```bash
# Restore uploads
docker run --rm -v omega-workflow_uploads-data:/data -v $(pwd):/backup alpine sh -c "cd /data && tar xzf /backup/uploads-backup.tar.gz --strip 1"

# Restore database
docker run --rm -v omega-workflow_database-data:/data -v $(pwd):/backup alpine sh -c "cd /data && tar xzf /backup/database-backup.tar.gz --strip 1"
```

## CI/CD Integration

### Example GitHub Actions
```yaml
name: Build and Push Docker Images

on:
  push:
    branches: [main]

jobs:
  build:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v2

      - name: Build images
        run: docker-compose build

      - name: Push to registry
        run: |
          echo "${{ secrets.REGISTRY_PASSWORD }}" | docker login -u "${{ secrets.REGISTRY_USERNAME }}" --password-stdin
          docker-compose push
```

## Additional Resources

- [Docker Documentation](https://docs.docker.com/)
- [Docker Compose Reference](https://docs.docker.com/compose/compose-file/)
- [Nginx Documentation](https://nginx.org/en/docs/)
- [Node.js Best Practices](https://github.com/goldbergyoni/nodebestpractices)

## Support

For issues or questions:
1. Check logs: `docker-compose logs`
2. Verify health: `docker-compose ps`
3. Review this guide
4. Check Docker documentation
