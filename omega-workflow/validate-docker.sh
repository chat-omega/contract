#!/bin/bash

# Docker Configuration Validation Script
# Validates all Docker files and configurations for omega-workflow

set -e

echo "================================================"
echo "Docker Configuration Validation"
echo "================================================"
echo ""

# Colors for output
GREEN='\033[0;32m'
RED='\033[0;31m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# Function to check file exists
check_file() {
    if [ -f "$1" ]; then
        echo -e "${GREEN}✓${NC} Found: $1"
        return 0
    else
        echo -e "${RED}✗${NC} Missing: $1"
        return 1
    fi
}

# Function to check directory exists
check_dir() {
    if [ -d "$1" ]; then
        echo -e "${GREEN}✓${NC} Directory exists: $1"
        return 0
    else
        echo -e "${RED}✗${NC} Directory missing: $1"
        return 1
    fi
}

# Initialize counters
PASS=0
FAIL=0

echo "1. Checking Frontend Docker Configuration..."
echo "─────────────────────────────────────────────"

if check_file "frontend-new/Dockerfile"; then ((PASS++)); else ((FAIL++)); fi
if check_file "frontend-new/nginx.conf"; then ((PASS++)); else ((FAIL++)); fi
if check_file "frontend-new/.dockerignore"; then ((PASS++)); else ((FAIL++)); fi
if check_file "frontend-new/.env.example"; then ((PASS++)); else ((FAIL++)); fi
if check_dir "frontend-new/src"; then ((PASS++)); else ((FAIL++)); fi
if check_file "frontend-new/package.json"; then ((PASS++)); else ((FAIL++)); fi

echo ""
echo "2. Checking Backend Docker Configuration..."
echo "─────────────────────────────────────────────"

if check_file "backend/Dockerfile"; then ((PASS++)); else ((FAIL++)); fi
if check_file "backend/.dockerignore"; then ((PASS++)); else ((FAIL++)); fi
if check_file "backend/.env.example"; then ((PASS++)); else ((FAIL++)); fi
if check_dir "backend/src"; then ((PASS++)); else ((FAIL++)); fi
if check_file "backend/package.json"; then ((PASS++)); else ((FAIL++)); fi
if check_file "backend/tsconfig.json"; then ((PASS++)); else ((FAIL++)); fi

echo ""
echo "3. Checking Docker Compose Files..."
echo "─────────────────────────────────────────────"

if check_file "docker-compose.yml"; then ((PASS++)); else ((FAIL++)); fi
if check_file "docker-compose.dev.yml"; then ((PASS++)); else ((FAIL++)); fi

echo ""
echo "4. Validating Docker Compose Syntax..."
echo "─────────────────────────────────────────────"

if docker-compose -f docker-compose.yml config > /dev/null 2>&1; then
    echo -e "${GREEN}✓${NC} docker-compose.yml syntax is valid"
    ((PASS++))
else
    echo -e "${RED}✗${NC} docker-compose.yml syntax is invalid"
    ((FAIL++))
fi

if docker-compose -f docker-compose.dev.yml config > /dev/null 2>&1; then
    echo -e "${GREEN}✓${NC} docker-compose.dev.yml syntax is valid"
    ((PASS++))
else
    echo -e "${RED}✗${NC} docker-compose.dev.yml syntax is invalid"
    ((FAIL++))
fi

echo ""
echo "5. Checking Frontend Dockerfile Syntax..."
echo "─────────────────────────────────────────────"

if grep -q "FROM node:18-alpine AS builder" frontend-new/Dockerfile; then
    echo -e "${GREEN}✓${NC} Frontend: Multi-stage build detected"
    ((PASS++))
else
    echo -e "${RED}✗${NC} Frontend: Multi-stage build not found"
    ((FAIL++))
fi

if grep -q "FROM nginx:alpine AS production" frontend-new/Dockerfile; then
    echo -e "${GREEN}✓${NC} Frontend: Nginx production stage detected"
    ((PASS++))
else
    echo -e "${RED}✗${NC} Frontend: Nginx production stage not found"
    ((FAIL++))
fi

if grep -q "HEALTHCHECK" frontend-new/Dockerfile; then
    echo -e "${GREEN}✓${NC} Frontend: Health check configured"
    ((PASS++))
else
    echo -e "${YELLOW}⚠${NC} Frontend: Health check not configured"
    ((FAIL++))
fi

echo ""
echo "6. Checking Backend Dockerfile Syntax..."
echo "─────────────────────────────────────────────"

if grep -q "FROM node:18-alpine AS builder" backend/Dockerfile; then
    echo -e "${GREEN}✓${NC} Backend: Multi-stage build detected"
    ((PASS++))
else
    echo -e "${RED}✗${NC} Backend: Multi-stage build not found"
    ((FAIL++))
fi

if grep -q "FROM node:18-alpine AS production" backend/Dockerfile; then
    echo -e "${GREEN}✓${NC} Backend: Production stage detected"
    ((PASS++))
else
    echo -e "${RED}✗${NC} Backend: Production stage not found"
    ((FAIL++))
fi

if grep -q "HEALTHCHECK" backend/Dockerfile; then
    echo -e "${GREEN}✓${NC} Backend: Health check configured"
    ((PASS++))
else
    echo -e "${YELLOW}⚠${NC} Backend: Health check not configured"
    ((FAIL++))
fi

if grep -q "USER nodejs" backend/Dockerfile; then
    echo -e "${GREEN}✓${NC} Backend: Non-root user configured"
    ((PASS++))
else
    echo -e "${YELLOW}⚠${NC} Backend: Running as root (security risk)"
    ((FAIL++))
fi

echo ""
echo "7. Checking Nginx Configuration..."
echo "─────────────────────────────────────────────"

if grep -q "gzip on" frontend-new/nginx.conf; then
    echo -e "${GREEN}✓${NC} Nginx: Gzip compression enabled"
    ((PASS++))
else
    echo -e "${YELLOW}⚠${NC} Nginx: Gzip compression not enabled"
    ((FAIL++))
fi

if grep -q "location /api/" frontend-new/nginx.conf; then
    echo -e "${GREEN}✓${NC} Nginx: API proxy configured"
    ((PASS++))
else
    echo -e "${RED}✗${NC} Nginx: API proxy not configured"
    ((FAIL++))
fi

if grep -q "try_files \$uri \$uri/ /index.html" frontend-new/nginx.conf; then
    echo -e "${GREEN}✓${NC} Nginx: SPA routing configured"
    ((PASS++))
else
    echo -e "${RED}✗${NC} Nginx: SPA routing not configured"
    ((FAIL++))
fi

echo ""
echo "8. Checking Security Configuration..."
echo "─────────────────────────────────────────────"

if grep -q "X-Frame-Options" frontend-new/nginx.conf; then
    echo -e "${GREEN}✓${NC} Security: X-Frame-Options header set"
    ((PASS++))
else
    echo -e "${YELLOW}⚠${NC} Security: X-Frame-Options header not set"
    ((FAIL++))
fi

if grep -q "X-Content-Type-Options" frontend-new/nginx.conf; then
    echo -e "${GREEN}✓${NC} Security: X-Content-Type-Options header set"
    ((PASS++))
else
    echo -e "${YELLOW}⚠${NC} Security: X-Content-Type-Options header not set"
    ((FAIL++))
fi

echo ""
echo "================================================"
echo "Validation Summary"
echo "================================================"
TOTAL=$((PASS + FAIL))
echo -e "Total Checks: ${TOTAL}"
echo -e "${GREEN}Passed: ${PASS}${NC}"
echo -e "${RED}Failed: ${FAIL}${NC}"
echo ""

if [ $FAIL -eq 0 ]; then
    echo -e "${GREEN}✓ All checks passed! Docker configuration is ready.${NC}"
    echo ""
    echo "Next steps:"
    echo "  1. Review .env.example files and create .env files"
    echo "  2. Test build: docker-compose build"
    echo "  3. Start services: docker-compose up -d"
    echo "  4. Check health: docker-compose ps"
    exit 0
else
    echo -e "${YELLOW}⚠ Some checks failed. Review the output above.${NC}"
    exit 1
fi
