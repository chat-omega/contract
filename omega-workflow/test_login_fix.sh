#!/bin/bash

echo "==========================================="
echo "Testing Omega Workflow Login Fix"
echo "==========================================="

echo "1. Testing backend health check..."
HEALTH_RESPONSE=$(curl -s http://localhost:5001/api/health)
echo "Health response: $HEALTH_RESPONSE"

echo ""
echo "2. Testing user registration..."
REG_RESPONSE=$(curl -s -X POST http://localhost:5001/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{"username": "testuser", "email": "test@example.com", "password": "testpass123"}')
echo "Registration response: $REG_RESPONSE"

echo ""
echo "3. Testing user login..."
LOGIN_RESPONSE=$(curl -s -X POST http://localhost:5001/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"username": "testuser", "password": "testpass123"}')
echo "Login response: $LOGIN_RESPONSE"

echo ""
echo "4. Testing admin user login (from demo credentials)..."
ADMIN_LOGIN=$(curl -s -X POST http://localhost:5001/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"username": "admin", "password": "admin123"}')
echo "Admin login response: $ADMIN_LOGIN"

echo ""
echo "==========================================="
echo "Frontend should now work at:"
echo "http://localhost:3000/login.html"
echo ""
echo "Backend API working on:"
echo "http://localhost:5001/api/"
echo ""
echo "Note: The domain app.omegaintelligence.ai has SSL certificate issues."
echo "Use localhost URLs for testing, or fix the SSL certificate."
echo "==========================================="