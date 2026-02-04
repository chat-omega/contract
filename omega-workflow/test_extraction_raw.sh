#!/bin/bash

# Get admin token
ADMIN_TOKEN=$(curl -s -X POST http://localhost:5001/api/auth/login \
    -H "Content-Type: application/json" \
    -d '{"username": "admin", "password": "admin123"}' | jq -r '.access_token')

echo "Raw Extraction API Response:"
echo "============================="
curl -s -X GET "http://localhost:5001/api/extractions?document_id=e37f9df8" \
    -H "Authorization: Bearer $ADMIN_TOKEN" | jq '.'
