# PE Dashboard - Private Equity Investment Platform

A modern, responsive private equity dashboard for bolt-on acquisition analysis and synergy identification, hosted at [app.ardour.work](https://app.ardour.work).

## 🏗️ Architecture

### Production Architecture
```
Internet → Nginx (SSL) → Docker Containers
                      ├── Frontend (React + Vite)
                      ├── Backend (Node.js + Express)
                      └── Nginx Proxy
```

### Technology Stack
- **Frontend**: React 18, TypeScript, Vite, Tailwind CSS, React Leaflet
- **Backend**: Node.js, Express, TypeScript
- **Infrastructure**: Docker, Nginx, Let's Encrypt SSL
- **Deployment**: Production-ready containerized setup

## 🚀 Quick Start

### Prerequisites
- Docker & Docker Compose
- Node.js 18+ (for development)
- Ubuntu/Linux server with root access
- Domain pointing to your server (app.ardour.work)

### Production Deployment

1. **Clone the repository**
   ```bash
   git clone <repository-url>
   cd app.ardour.work
   ```

2. **Set up SSL certificates**
   ```bash
   sudo ./setup-ssl.sh
   ```
   This will:
   - Install certbot
   - Obtain Let's Encrypt SSL certificates
   - Configure nginx for HTTPS
   - Set up auto-renewal

3. **Deploy the application**
   ```bash
   sudo ./deploy.sh
   ```
   This will:
   - Install dependencies
   - Build Docker containers
   - Start all services
   - Configure health checks

4. **Verify deployment**
   - Frontend: https://app.ardour.work
   - Backend API: https://app.ardour.work/api/health
   - Health check: https://app.ardour.work/health

## 📁 Project Structure

```
app.ardour.work/
├── frontend/                 # React frontend application
│   ├── src/
│   │   ├── components/      # React components
│   │   ├── services/        # API service layer
│   │   ├── types/           # TypeScript definitions
│   │   └── utils/           # Utility functions
│   ├── Dockerfile.prod      # Production frontend container
│   └── nginx.conf           # Frontend nginx config
├── backend/                 # Node.js Express API
│   ├── src/
│   │   ├── routes/          # API route handlers
│   │   ├── data/            # Mock data (replace with DB)
│   │   ├── types/           # TypeScript definitions
│   │   └── server.ts        # Main server file
│   ├── Dockerfile.prod      # Production backend container
│   └── package.json
├── nginx/                   # Reverse proxy configuration
│   ├── nginx.conf           # Main nginx config
│   ├── app.ardour.work.conf # Domain-specific config
│   └── Dockerfile           # Nginx container
├── docker-compose.prod.yml  # Production Docker setup
├── deploy.sh                # Automated deployment script
├── setup-ssl.sh             # SSL certificate setup
└── README.md
```

## 🔧 Development

### Local Development Setup

1. **Install dependencies**
   ```bash
   # Backend
   cd backend && npm install

   # Frontend
   cd frontend && npm install
   ```

2. **Start development servers**
   ```bash
   # Backend (runs on port 5000)
   cd backend && npm run dev

   # Frontend (runs on port 3000)
   cd frontend && npm run dev
   ```

3. **Access the application**
   - Frontend: http://localhost:3000
   - Backend API: http://localhost:5000

### Environment Variables

#### Backend (.env.production)
```env
NODE_ENV=production
PORT=5000
API_BASE_URL=https://app.ardour.work/api
CORS_ORIGIN=https://app.ardour.work,https://www.app.ardour.work
RATE_LIMIT_WINDOW_MS=60000
RATE_LIMIT_MAX_REQUESTS=100
```

#### Frontend (.env.production)
```env
VITE_API_BASE_URL=https://app.ardour.work/api
VITE_APP_ENV=production
VITE_APP_NAME=PE Dashboard
VITE_APP_VERSION=1.0.0
```

## 🔄 API Endpoints

### Portfolio
- `GET /api/portfolio` - Get portfolio information
- `GET /api/portfolio/:id` - Get specific portfolio

### Synergy Categories
- `GET /api/synergy/categories` - Get all synergy categories
- `GET /api/synergy/categories/:id` - Get specific category
- `GET /api/synergy/categories/:id/targets` - Get targets for category

### Targets
- `GET /api/targets` - Get all targets (with filtering)
- `GET /api/targets/:id` - Get specific target
- `GET /api/targets/regions/:regionId` - Get targets by region

### Analysis
- `GET /api/synergy/analysis/:targetId` - Get target analysis

## 🛡️ Security Features

- **SSL/TLS encryption** with Let's Encrypt certificates
- **Security headers** (HSTS, XSS protection, content security policy)
- **Rate limiting** on API endpoints
- **CORS protection** with domain whitelist
- **Non-root containers** for enhanced security
- **Input validation** and sanitization

## 📊 Monitoring & Health Checks

All services include health check endpoints:
- **Frontend**: `/health`
- **Backend**: `/health`
- **System**: `https://app.ardour.work/health`

### Log Management
```bash
# View application logs
docker-compose -f docker-compose.prod.yml logs -f

# View specific service logs
docker-compose -f docker-compose.prod.yml logs backend
docker-compose -f docker-compose.prod.yml logs frontend
```

## 🔄 Updates & Maintenance

### Updating the Application
```bash
# Pull latest changes
git pull origin main

# Redeploy
sudo ./deploy.sh
```

### SSL Certificate Renewal
Certificates auto-renew via cron job. Manual renewal:
```bash
sudo certbot renew
sudo systemctl reload nginx
```

### Backup & Recovery
```bash
# Backup configuration
tar -czf pe-dashboard-backup.tar.gz nginx/ *.env* docker-compose.prod.yml

# Restore from backup
tar -xzf pe-dashboard-backup.tar.gz
```

## 🚨 Troubleshooting

### Common Issues

1. **SSL Certificate Issues**
   ```bash
   sudo certbot certificates
   sudo ./setup-ssl.sh
   ```

2. **Container Health Check Failures**
   ```bash
   docker-compose -f docker-compose.prod.yml ps
   docker-compose -f docker-compose.prod.yml logs [service-name]
   ```

3. **Port Conflicts**
   ```bash
   sudo netstat -tulpn | grep :80
   sudo netstat -tulpn | grep :443
   ```

4. **Permission Issues**
   ```bash
   sudo chown -R ubuntu:ubuntu .
   sudo chmod +x *.sh
   ```

### Support
For issues and support:
- Check application logs
- Review health check endpoints
- Verify DNS configuration
- Ensure ports 80/443 are open

## 📈 Performance Optimization

The application includes several performance optimizations:
- **Code splitting** and lazy loading
- **Gzip compression** for all text assets
- **Static asset caching** with long-term cache headers
- **Bundle optimization** with Vite
- **Nginx proxy caching** for API responses

## 🎯 Features

- **Interactive Map**: Geographic target visualization with React Leaflet
- **Synergy Analysis**: 8 PE bolt-on acquisition categories
- **Advanced Filtering**: Search, sector, and strategic fit filtering
- **Responsive Design**: Mobile-first, works on all devices
- **Real-time Data**: API-driven with loading states
- **Professional UI**: Modern design with smooth animations

---

**Live Application**: [app.ardour.work](https://app.ardour.work)

Built with ❤️ for private equity professionals.