#!/bin/bash

echo "==========================================="
echo "Testing Complete Authentication Flow"
echo "==========================================="

# Wait for backend to be ready
sleep 5

echo "1. Testing login..."
LOGIN_RESPONSE=$(curl -s -X POST http://localhost:5001/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"username": "admin", "password": "admin123"}')

echo "Login response: $LOGIN_RESPONSE"

# Extract token
TOKEN=$(echo $LOGIN_RESPONSE | python3 -c "import json,sys; print(json.load(sys.stdin)['token'])")
echo "Token extracted: ${TOKEN:0:20}..."

echo ""
echo "2. Testing /api/auth/me endpoint..."
ME_RESPONSE=$(curl -s -H "Authorization: Bearer $TOKEN" http://localhost:5001/api/auth/me)
echo "Auth me response: $ME_RESPONSE"

# Check if response has user field
HAS_USER=$(echo $ME_RESPONSE | python3 -c "import json,sys; data=json.load(sys.stdin); print('user' in data)")
USERNAME=$(echo $ME_RESPONSE | python3 -c "import json,sys; data=json.load(sys.stdin); print(data.get('user', {}).get('username', 'NOT_FOUND'))")

echo ""
echo "3. Validation results:"
echo "   Has 'user' field: $HAS_USER"
echo "   Username: $USERNAME"

echo ""
echo "==========================================="
if [ "$HAS_USER" = "True" ] && [ "$USERNAME" = "admin" ]; then
    echo "✅ AUTHENTICATION FLOW WORKING!"
    echo ""
    echo "The frontend should now properly:"
    echo "1. Detect user authentication after login"
    echo "2. Stay logged in after page refresh"
    echo "3. Show authenticated content"
else
    echo "❌ Authentication flow still has issues"
fi
echo ""
echo "Test the login at: http://localhost:3000/login.html"
echo "Use credentials: admin / admin123"
echo "==========================================="