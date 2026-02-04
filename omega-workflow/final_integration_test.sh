#!/bin/bash

# Final Comprehensive Integration Test for PDF Highlighting
# Validates all components are working correctly post-rebuild

set -e

# Colors
GREEN='\033[0;32m'
RED='\033[0;31m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m'

echo ""
echo "================================================================="
echo "  PDF HIGHLIGHTING - FINAL INTEGRATION TEST"
echo "================================================================="
echo ""

# Test 1: Backend Accessibility
echo -e "${BLUE}[1/8]${NC} Testing Backend API..."
BACKEND_STATUS=$(curl -s -o /dev/null -w "%{http_code}" http://localhost:5001/api/docs)
if [ "$BACKEND_STATUS" = "200" ]; then
    echo -e "      ${GREEN}✅ Backend API is accessible${NC}"
else
    echo -e "      ${RED}❌ Backend API failed (HTTP $BACKEND_STATUS)${NC}"
    exit 1
fi

# Test 2: Frontend Accessibility
echo -e "${BLUE}[2/8]${NC} Testing Vanilla Frontend..."
FRONTEND_STATUS=$(curl -s -o /dev/null -w "%{http_code}" http://localhost:3003)
if [ "$FRONTEND_STATUS" = "200" ]; then
    echo -e "      ${GREEN}✅ Vanilla Frontend is accessible${NC}"
else
    echo -e "      ${RED}❌ Frontend failed (HTTP $FRONTEND_STATUS)${NC}"
    exit 1
fi

# Test 3: JavaScript File
echo -e "${BLUE}[3/8]${NC} Testing document-detail.js serving..."
JS_SIZE=$(curl -s -o /dev/null -w "%{size_download}" http://localhost:3003/js/document-detail.js)
if [ "$JS_SIZE" -gt "50000" ]; then
    echo -e "      ${GREEN}✅ document-detail.js served correctly (${JS_SIZE} bytes)${NC}"
else
    echo -e "      ${RED}❌ document-detail.js too small or missing (${JS_SIZE} bytes)${NC}"
    exit 1
fi

# Test 4: Authentication
echo -e "${BLUE}[4/8]${NC} Testing Authentication..."
AUTH_RESPONSE=$(curl -s -X POST http://localhost:5001/api/auth/login \
    -H "Content-Type: application/json" \
    -d '{"username": "admin", "password": "admin123"}')
TOKEN=$(echo $AUTH_RESPONSE | jq -r '.access_token // empty')
if [ -n "$TOKEN" ] && [ "$TOKEN" != "null" ]; then
    echo -e "      ${GREEN}✅ Authentication successful${NC}"
else
    echo -e "      ${RED}❌ Authentication failed${NC}"
    exit 1
fi

# Test 5: Document List
echo -e "${BLUE}[5/8]${NC} Testing Document API..."
DOCS=$(curl -s -X GET http://localhost:5001/api/documents \
    -H "Authorization: Bearer $TOKEN")
DOC_COUNT=$(echo $DOCS | jq '. | length')
if [ "$DOC_COUNT" -gt "0" ]; then
    echo -e "      ${GREEN}✅ Document API working ($DOC_COUNT documents)${NC}"
else
    echo -e "      ${RED}❌ No documents found${NC}"
    exit 1
fi

# Test 6: Extraction API
echo -e "${BLUE}[6/8]${NC} Testing Extraction API..."
EXTRACTION=$(curl -s -X GET "http://localhost:5001/api/documents/e37f9df8/extraction/results" \
    -H "Authorization: Bearer $TOKEN")
EXTRACTION_STATUS=$(echo $EXTRACTION | jq -r '.status // empty')
if [ "$EXTRACTION_STATUS" = "success" ]; then
    echo -e "      ${GREEN}✅ Extraction API working${NC}"
else
    echo -e "      ${RED}❌ Extraction API failed${NC}"
    exit 1
fi

# Test 7: Data Structure
echo -e "${BLUE}[7/8]${NC} Validating Data Structure..."
# Extract first field's first extraction
FIRST_EXTRACTION=$(echo $EXTRACTION | jq -r '.workflows[0].results | to_entries | .[0].value.extractions[0]')

HAS_PAGE=$(echo $FIRST_EXTRACTION | jq -r 'has("page")')
HAS_SPANS=$(echo $FIRST_EXTRACTION | jq -r 'has("spans")')
HAS_BOUNDS=$(echo $FIRST_EXTRACTION | jq -r '.spans[0] | has("bounds")')
BOUNDS_COMPLETE=$(echo $FIRST_EXTRACTION | jq -r '.spans[0].bounds | has("top") and has("left") and has("bottom") and has("right")')

if [ "$HAS_PAGE" = "true" ] && [ "$HAS_SPANS" = "true" ] && [ "$HAS_BOUNDS" = "true" ] && [ "$BOUNDS_COMPLETE" = "true" ]; then
    echo -e "      ${GREEN}✅ Data structure is complete${NC}"
    echo -e "         - Has page: $HAS_PAGE"
    echo -e "         - Has spans: $HAS_SPANS"
    echo -e "         - Has bounds: $HAS_BOUNDS"
    echo -e "         - Bounds complete: $BOUNDS_COMPLETE"
else
    echo -e "      ${RED}❌ Data structure incomplete${NC}"
    exit 1
fi

# Test 8: Sample Data
echo -e "${BLUE}[8/8]${NC} Displaying Sample Extraction..."
SAMPLE_FIELD=$(echo $EXTRACTION | jq -r '.workflows[0].results | to_entries | .[0].value | {field_name, extraction_count: .extractions | length}')
echo -e "      ${GREEN}✅ Sample Extraction Data:${NC}"
echo "$SAMPLE_FIELD" | jq '.' | sed 's/^/         /'

SAMPLE_BOUNDS=$(echo $FIRST_EXTRACTION | jq -r '.spans[0].bounds')
echo ""
echo -e "      ${GREEN}Sample Bounds:${NC}"
echo "$SAMPLE_BOUNDS" | jq '.' | sed 's/^/         /'

# Summary
echo ""
echo "================================================================="
echo -e "  ${GREEN}ALL TESTS PASSED ✅${NC}"
echo "================================================================="
echo ""
echo "Integration test results:"
echo "  ✅ Backend API operational"
echo "  ✅ Frontend serving correctly"
echo "  ✅ JavaScript files complete"
echo "  ✅ Authentication working"
echo "  ✅ Document API functional"
echo "  ✅ Extraction API operational"
echo "  ✅ Data structure verified"
echo "  ✅ Highlighting data complete"
echo ""
echo "================================================================="
echo "  READY FOR MANUAL BROWSER TESTING"
echo "================================================================="
echo ""
echo "Next Steps:"
echo "  1. Open browser to: http://localhost:3003/login.html"
echo "  2. Login as: admin / admin123"
echo "  3. Open document: BuzzFeed Agreement.pdf (ID: e37f9df8)"
echo "  4. Hover over fields to test highlighting"
echo ""
echo "Expected Behavior:"
echo "  - Yellow highlights appear on PDF when hovering fields"
echo "  - PDF automatically navigates to correct page"
echo "  - Highlights clear when mouse moves away"
echo "  - No JavaScript errors in console"
echo ""
echo "================================================================="
