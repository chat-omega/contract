#!/bin/bash

# Quick start script for omega-workflow Docker services

set -e

# Colors
GREEN='\033[0;32m'
BLUE='\033[0;34m'
YELLOW='\033[1;33m'
NC='\033[0m'

echo -e "${BLUE}================================================${NC}"
echo -e "${BLUE}Omega Workflow - Docker Quick Start${NC}"
echo -e "${BLUE}================================================${NC}"
echo ""

# Check if docker and docker-compose are installed
if ! command -v docker &> /dev/null; then
    echo -e "${YELLOW}Docker is not installed. Please install Docker first.${NC}"
    exit 1
fi

if ! command -v docker-compose &> /dev/null; then
    echo -e "${YELLOW}Docker Compose is not installed. Please install Docker Compose first.${NC}"
    exit 1
fi

# Menu
echo "Select mode:"
echo "1) Production (optimized build, port 80)"
echo "2) Development (hot reload, port 3000)"
echo "3) Build only (no start)"
echo "4) Stop all services"
echo "5) View logs"
echo "6) Clean up (remove containers and volumes)"
echo ""
read -p "Enter choice [1-6]: " choice

case $choice in
    1)
        echo -e "${GREEN}Starting in PRODUCTION mode...${NC}"
        echo ""
        echo "Building images..."
        docker-compose build
        echo ""
        echo "Starting services..."
        docker-compose up -d
        echo ""
        echo -e "${GREEN}Services started!${NC}"
        echo ""
        echo "Access points:"
        echo "  Frontend: http://localhost:80"
        echo "  Backend API: http://localhost:3000/api"
        echo "  FastAPI: http://localhost:5001/api"
        echo ""
        echo "Check status: docker-compose ps"
        echo "View logs: docker-compose logs -f"
        ;;
    2)
        echo -e "${GREEN}Starting in DEVELOPMENT mode...${NC}"
        echo ""
        echo "Starting services with hot reload..."
        docker-compose -f docker-compose.dev.yml up
        ;;
    3)
        echo -e "${GREEN}Building images...${NC}"
        echo ""
        docker-compose build
        echo ""
        echo -e "${GREEN}Build complete!${NC}"
        echo "Start with: docker-compose up -d"
        ;;
    4)
        echo -e "${YELLOW}Stopping all services...${NC}"
        echo ""
        docker-compose down
        docker-compose -f docker-compose.dev.yml down 2>/dev/null || true
        echo ""
        echo -e "${GREEN}Services stopped!${NC}"
        ;;
    5)
        echo -e "${GREEN}Viewing logs (Ctrl+C to exit)...${NC}"
        echo ""
        docker-compose logs -f
        ;;
    6)
        echo -e "${YELLOW}WARNING: This will remove all containers and volumes!${NC}"
        read -p "Are you sure? (yes/no): " confirm
        if [ "$confirm" = "yes" ]; then
            echo "Cleaning up..."
            docker-compose down -v
            docker-compose -f docker-compose.dev.yml down -v 2>/dev/null || true
            echo ""
            echo -e "${GREEN}Cleanup complete!${NC}"
        else
            echo "Cancelled."
        fi
        ;;
    *)
        echo -e "${YELLOW}Invalid choice${NC}"
        exit 1
        ;;
esac
