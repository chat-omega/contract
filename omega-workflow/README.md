# Omega Workflow Application

A dockerized document management system with frontend and backend services.

## Architecture

- **Frontend**: Node.js Express application serving the UI (Port 3000)
- **Backend**: Python API server providing data endpoints (Port 5000)

## Quick Start

### Prerequisites
- Docker
- Docker Compose

### Running the Application

1. Build and start the containers:
```bash
docker-compose up --build
```

2. Or run in detached mode:
```bash
docker-compose up -d
```

3. Access the application:
- Frontend UI: http://localhost:3000
- Backend API: http://localhost:5000

## Available Endpoints

### Frontend
- `http://localhost:3000/` - Main application UI

### Backend API
- `GET http://localhost:5000/api/health` - Health check
- `GET http://localhost:5000/api/documents` - List documents
- `GET http://localhost:5000/api/workflows` - List workflows

## Docker Commands

### Start services
```bash
docker-compose up -d
```

### Stop services
```bash
docker-compose down
```

### View logs
```bash
docker-compose logs -f
```

### Rebuild containers
```bash
docker-compose build --no-cache
docker-compose up -d
```

### Check container status
```bash
docker-compose ps
```

## Project Structure

```
omega-workflow/
├── frontend/           # Frontend application
│   ├── Dockerfile
│   ├── server.js
│   ├── index.html
│   ├── css/
│   ├── js/
│   └── package.json
├── backend/           # Backend API
│   ├── Dockerfile
│   ├── server.py
│   └── requirements.txt
├── docker-compose.yml # Docker orchestration
└── .env.example      # Environment variables template
```

## Environment Variables

Copy `.env.example` to `.env` and adjust values as needed:

```bash
cp .env.example .env
```

## Health Checks

Both services include health checks to ensure they're running properly:
- Frontend: Checks HTTP response on port 3000
- Backend: Checks `/api/health` endpoint on port 5000

## Troubleshooting

### Port conflicts
If ports 3000 or 5000 are already in use:
1. Stop conflicting services
2. Or modify ports in `docker-compose.yml`

### Container issues
```bash
# Stop all containers
docker-compose down

# Remove containers and volumes
docker-compose down -v

# Rebuild from scratch
docker-compose build --no-cache
docker-compose up -d
```