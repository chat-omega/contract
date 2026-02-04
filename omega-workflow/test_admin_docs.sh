#!/bin/bash
set -e

# Get admin token
ADMIN_TOKEN=$(curl -s -X POST http://localhost:5001/api/auth/login \
    -H "Content-Type: application/json" \
    -d '{"username": "admin", "password": "admin123"}' | jq -r '.access_token')

echo "Admin Token: ${ADMIN_TOKEN:0:30}..."

# Get admin documents
echo ""
echo "Admin Documents:"
curl -s -X GET http://localhost:5001/api/documents \
    -H "Authorization: Bearer $ADMIN_TOKEN" | jq '.'

# Get extractions for test document
echo ""
echo "Extractions for document e37f9df8:"
curl -s -X GET "http://localhost:5001/api/extractions?document_id=e37f9df8" \
    -H "Authorization: Bearer $ADMIN_TOKEN" | jq '.[0:3]'
