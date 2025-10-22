#!/bin/bash

# PE Dashboard Production Deployment Script
set -e

echo "🚀 Starting PE Dashboard deployment..."

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# Check if running as root (needed for nginx config)
if [ "$EUID" -ne 0 ]; then
  echo -e "${RED}Please run this script as root (sudo ./deploy.sh)${NC}"
  exit 1
fi

# Check if Docker and Docker Compose are installed
if ! command -v docker &> /dev/null; then
    echo -e "${RED}Docker is not installed. Please install Docker first.${NC}"
    exit 1
fi

if ! command -v docker-compose &> /dev/null; then
    echo -e "${RED}Docker Compose is not installed. Please install Docker Compose first.${NC}"
    exit 1
fi

# Create necessary directories
echo -e "${YELLOW}Creating necessary directories...${NC}"
mkdir -p nginx/ssl
mkdir -p nginx/logs
mkdir -p backend/node_modules
mkdir -p frontend/node_modules

# Set proper permissions
chown -R ubuntu:ubuntu .
chmod +x deploy.sh

# Install backend dependencies
echo -e "${YELLOW}Installing backend dependencies...${NC}"
cd backend
npm install
cd ..

# Install frontend dependencies  
echo -e "${YELLOW}Installing frontend dependencies...${NC}"
cd frontend
npm install
cd ..

# Stop any existing containers
echo -e "${YELLOW}Stopping existing containers...${NC}"
docker-compose -f docker-compose.prod.yml down 2>/dev/null || true

# Remove old images to ensure fresh build
echo -e "${YELLOW}Removing old images...${NC}"
docker-compose -f docker-compose.prod.yml down --rmi all 2>/dev/null || true

# Build and start the production containers
echo -e "${YELLOW}Building and starting production containers...${NC}"
docker-compose -f docker-compose.prod.yml up --build -d

# Wait for services to be healthy
echo -e "${YELLOW}Waiting for services to start...${NC}"
sleep 30

# Check service health
echo -e "${YELLOW}Checking service health...${NC}"

# Check backend health
if curl -f http://localhost:5000/health &>/dev/null; then
    echo -e "${GREEN}✓ Backend is healthy${NC}"
else
    echo -e "${RED}✗ Backend health check failed${NC}"
    docker-compose -f docker-compose.prod.yml logs backend
fi

# Check frontend health  
if curl -f http://localhost:3000/health &>/dev/null; then
    echo -e "${GREEN}✓ Frontend is healthy${NC}"
else
    echo -e "${RED}✗ Frontend health check failed${NC}"
    docker-compose -f docker-compose.prod.yml logs frontend
fi

# Configure nginx if SSL certificates exist
if [ -f "nginx/ssl/app.ardour.work.crt" ] && [ -f "nginx/ssl/app.ardour.work.key" ]; then
    echo -e "${GREEN}✓ SSL certificates found${NC}"
    
    # Copy nginx config to system nginx
    cp nginx/app.ardour.work.conf /etc/nginx/sites-available/
    ln -sf /etc/nginx/sites-available/app.ardour.work.conf /etc/nginx/sites-enabled/
    
    # Test nginx configuration
    if nginx -t; then
        echo -e "${GREEN}✓ Nginx configuration is valid${NC}"
        systemctl reload nginx
    else
        echo -e "${RED}✗ Nginx configuration is invalid${NC}"
        exit 1
    fi
else
    echo -e "${YELLOW}⚠ SSL certificates not found in nginx/ssl/${NC}"
    echo -e "${YELLOW}Please run the SSL setup script: ./setup-ssl.sh${NC}"
fi

# Show deployment status
echo -e "\n${GREEN}=== Deployment Status ===${NC}"
echo -e "${GREEN}✓ PE Dashboard deployed successfully!${NC}"
echo -e "${YELLOW}Frontend URL: http://localhost:3000${NC}"
echo -e "${YELLOW}Backend API: http://localhost:5000${NC}"
echo -e "${YELLOW}Production URL: https://app.ardour.work (once SSL is configured)${NC}"

# Show running containers
echo -e "\n${YELLOW}Running containers:${NC}"
docker-compose -f docker-compose.prod.yml ps

# Show logs command
echo -e "\n${YELLOW}To view logs:${NC}"
echo "docker-compose -f docker-compose.prod.yml logs -f"

echo -e "\n${GREEN}🎉 Deployment completed successfully!${NC}"