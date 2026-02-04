#!/bin/bash

# Get admin token
ADMIN_TOKEN=$(curl -s -X POST http://localhost:5001/api/auth/login \
    -H "Content-Type: application/json" \
    -d '{"username": "admin", "password": "admin123"}' | jq -r '.access_token')

echo "Extraction Results for Document e37f9df8"
echo "========================================"
echo ""

curl -s -X GET "http://localhost:5001/api/documents/e37f9df8/extraction/results" \
    -H "Authorization: Bearer $ADMIN_TOKEN" | jq '.' | head -200
