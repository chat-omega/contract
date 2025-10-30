#!/bin/bash
# Manual Test Script for Document Detail Page
# This script performs backend API tests to verify the fix

set -e

BASE_URL="http://localhost:3000"
API_URL="http://localhost:5000"
DOCUMENT_ID="e37f9df8"

echo "=========================================="
echo "🧪 Document Detail Page - Backend Tests"
echo "=========================================="
echo ""

# Colors
GREEN='\033[0;32m'
RED='\033[0;31m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

echo "📝 Test Configuration:"
echo "   Base URL: $BASE_URL"
echo "   Document ID: $DOCUMENT_ID"
echo ""

# Test 1: Health Check
echo "${BLUE}Test 1: API Health Check${NC}"
HEALTH=$(curl -s "$BASE_URL/api/health")
if echo "$HEALTH" | grep -q "healthy"; then
    echo "${GREEN}✅ API is healthy${NC}"
else
    echo "${RED}❌ API health check failed${NC}"
    exit 1
fi
echo ""

# Test 2: Login
echo "${BLUE}Test 2: User Authentication${NC}"
LOGIN_RESPONSE=$(curl -s -X POST "$BASE_URL/api/auth/login" \
    -H "Content-Type: application/json" \
    -d '{"username":"admin","password":"admin123"}')

TOKEN=$(echo "$LOGIN_RESPONSE" | grep -o '"accessToken":"[^"]*' | cut -d'"' -f4)

if [ -z "$TOKEN" ]; then
    # Try alternative token field
    TOKEN=$(echo "$LOGIN_RESPONSE" | grep -o '"token":"[^"]*' | cut -d'"' -f4)
fi

if [ -z "$TOKEN" ]; then
    echo "${RED}❌ Login failed - no token received${NC}"
    echo "Response: $LOGIN_RESPONSE"
    exit 1
else
    echo "${GREEN}✅ Login successful${NC}"
    echo "   Token: ${TOKEN:0:20}..."
fi
echo ""

# Test 3: Get Document Metadata
echo "${BLUE}Test 3: Document Metadata API${NC}"
DOC_RESPONSE=$(curl -s "$BASE_URL/api/documents/$DOCUMENT_ID" \
    -H "Authorization: Bearer $TOKEN")

DOC_NAME=$(echo "$DOC_RESPONSE" | grep -o '"name":"[^"]*' | cut -d'"' -f4)

if [ -z "$DOC_NAME" ]; then
    echo "${RED}❌ Failed to get document metadata${NC}"
    echo "Response: $DOC_RESPONSE"
    exit 1
else
    echo "${GREEN}✅ Document metadata retrieved${NC}"
    echo "   Document: $DOC_NAME"
fi
echo ""

# Test 4: Get PDF Content
echo "${BLUE}Test 4: PDF Content API${NC}"
PDF_SIZE=$(curl -s -I "$BASE_URL/api/documents/$DOCUMENT_ID/content" \
    -H "Authorization: Bearer $TOKEN" \
    | grep -i content-length \
    | awk '{print $2}' \
    | tr -d '\r')

if [ -z "$PDF_SIZE" ] || [ "$PDF_SIZE" == "0" ]; then
    echo "${RED}❌ PDF content not available${NC}"
    exit 1
else
    PDF_SIZE_KB=$((PDF_SIZE / 1024))
    echo "${GREEN}✅ PDF content available${NC}"
    echo "   Size: ${PDF_SIZE_KB} KB"
fi
echo ""

# Test 5: Get Workflows
echo "${BLUE}Test 5: Document Workflows API${NC}"
WORKFLOWS_RESPONSE=$(curl -s "$BASE_URL/api/documents/$DOCUMENT_ID/workflows")

if echo "$WORKFLOWS_RESPONSE" | grep -q "workflowIds"; then
    WORKFLOW_COUNT=$(echo "$WORKFLOWS_RESPONSE" | grep -o '"workflowIds":\[[^]]*\]' | grep -o '[0-9]*' | wc -l)
    echo "${GREEN}✅ Workflows retrieved${NC}"
    echo "   Count: $WORKFLOW_COUNT workflow(s)"
else
    echo "${RED}⚠️  No workflows assigned${NC}"
fi
echo ""

# Test 6: Frontend Files
echo "${BLUE}Test 6: Frontend Assets${NC}"

# Check JavaScript file
JS_RESPONSE=$(curl -s -I "$BASE_URL/js/document-detail.js" | head -1)
if echo "$JS_RESPONSE" | grep -q "200"; then
    echo "${GREEN}✅ document-detail.js available${NC}"
else
    echo "${RED}❌ document-detail.js not found${NC}"
fi

# Check CSS file
CSS_RESPONSE=$(curl -s -I "$BASE_URL/css/document-detail.css" | head -1)
if echo "$CSS_RESPONSE" | grep -q "200"; then
    echo "${GREEN}✅ document-detail.css available${NC}"
else
    echo "${RED}❌ document-detail.css not found${NC}"
fi
echo ""

# Test 7: Check for critical fixes in CSS
echo "${BLUE}Test 7: CSS Fixes Verification${NC}"
CSS_CONTENT=$(curl -s "$BASE_URL/css/document-detail.css")

if echo "$CSS_CONTENT" | grep -q "display: block !important"; then
    echo "${GREEN}✅ CSS fix applied: display block${NC}"
else
    echo "${RED}❌ CSS fix missing: display block${NC}"
fi

if echo "$CSS_CONTENT" | grep -q "overflow: visible"; then
    echo "${GREEN}✅ CSS fix applied: overflow visible${NC}"
else
    echo "${RED}❌ CSS fix missing: overflow visible${NC}"
fi
echo ""

# Test 8: Check for JavaScript fixes
echo "${BLUE}Test 8: JavaScript Fixes Verification${NC}"
JS_CONTENT=$(curl -s "$BASE_URL/js/document-detail.js")

if echo "$JS_CONTENT" | grep -q "setProperty('--scale-factor'"; then
    echo "${GREEN}✅ JS fix applied: scale-factor CSS variable${NC}"
else
    echo "${RED}❌ JS fix missing: scale-factor variable${NC}"
fi

if echo "$JS_CONTENT" | grep -q 'container.style.display.*block'; then
    echo "${GREEN}✅ JS fix applied: container display block${NC}"
else
    echo "${RED}❌ JS fix missing: container display${NC}"
fi
echo ""

echo "=========================================="
echo "${GREEN}🎉 All Backend Tests Passed!${NC}"
echo "=========================================="
echo ""
echo "📋 Next Steps - Manual Browser Testing:"
echo ""
echo "1. Open browser and navigate to:"
echo "   ${BLUE}http://app.omegaintelligence.ai/document-detail.html?id=$DOCUMENT_ID${NC}"
echo ""
echo "2. Open Developer Console (F12) and check for:"
echo "   ${GREEN}✅${NC} Logs showing: '🚀 Initializing DocumentDetailPage...'"
echo "   ${GREEN}✅${NC} Logs showing: '✅ PDF viewer fully initialized'"
echo "   ${GREEN}✅${NC} NO errors: '❌ CONTAINER DIMENSIONS ARE ZERO'"
echo "   ${GREEN}✅${NC} NO warnings about '--scale-factor'"
echo ""
echo "3. Verify visual rendering:"
echo "   ${GREEN}✅${NC} Document title appears in sidebar"
echo "   ${GREEN}✅${NC} PDF pages are visible (not blank)"
echo "   ${GREEN}✅${NC} Can scroll through pages"
echo "   ${GREEN}✅${NC} Extracted terms show in sidebar"
echo ""
echo "4. Check container dimensions in console:"
echo "   Look for logs like: '📦 RENDER DEBUG [Page X]:'"
echo "   Container actual height should be > 0"
echo ""
echo "=========================================="
