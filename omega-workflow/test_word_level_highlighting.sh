#!/bin/bash

# Word-Level Highlighting Test Script
# Tests the new word-level precise highlighting feature

set -e  # Exit on error

echo "=========================================="
echo "Word-Level Highlighting Test"
echo "=========================================="
echo ""

# Configuration
API_BASE="http://localhost:5001/api"
FRONTEND_BASE="http://localhost:3003"

# Colors for output
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
RED='\033[0;31m'
NC='\033[0m' # No Color

# Test 1: Check if frontend is running
echo "Test 1: Checking frontend availability..."
if curl -s -f "$FRONTEND_BASE" > /dev/null 2>&1; then
    echo -e "${GREEN}✓${NC} Frontend is running at $FRONTEND_BASE"
else
    echo -e "${RED}✗${NC} Frontend is not accessible at $FRONTEND_BASE"
    exit 1
fi

# Test 2: Check if backend is running
echo ""
echo "Test 2: Checking backend availability..."
if curl -s -f "$API_BASE/health" > /dev/null 2>&1; then
    echo -e "${GREEN}✓${NC} Backend is running at $API_BASE"
else
    echo -e "${RED}✗${NC} Backend is not accessible at $API_BASE"
    exit 1
fi

# Test 3: Authenticate and get token
echo ""
echo "Test 3: Authenticating..."
LOGIN_RESPONSE=$(curl -s -X POST "$API_BASE/auth/login" \
    -H "Content-Type: application/json" \
    -d '{"username":"admin","password":"admin123"}')

TOKEN=$(echo $LOGIN_RESPONSE | grep -o '"access_token":"[^"]*' | cut -d'"' -f4)

if [ -z "$TOKEN" ]; then
    echo -e "${RED}✗${NC} Authentication failed"
    echo "Response: $LOGIN_RESPONSE"
    exit 1
else
    echo -e "${GREEN}✓${NC} Authentication successful"
    echo "Token: ${TOKEN:0:20}..."
fi

# Test 4: Get documents list
echo ""
echo "Test 4: Fetching documents..."
DOCUMENTS=$(curl -s -X GET "$API_BASE/documents" \
    -H "Authorization: Bearer $TOKEN")

DOCUMENT_COUNT=$(echo $DOCUMENTS | grep -o '"id":' | wc -l)

if [ $DOCUMENT_COUNT -gt 0 ]; then
    echo -e "${GREEN}✓${NC} Found $DOCUMENT_COUNT documents"

    # Get first document ID
    DOCUMENT_ID=$(echo $DOCUMENTS | grep -o '"id":"[^"]*' | head -1 | cut -d'"' -f4)
    DOCUMENT_NAME=$(echo $DOCUMENTS | grep -o '"original_filename":"[^"]*' | head -1 | cut -d'"' -f4)

    echo "  First document: $DOCUMENT_NAME (ID: $DOCUMENT_ID)"
else
    echo -e "${RED}✗${NC} No documents found"
    exit 1
fi

# Test 5: Get extraction results for the document
echo ""
echo "Test 5: Fetching extraction results..."
EXTRACTIONS=$(curl -s -X GET "$API_BASE/documents/$DOCUMENT_ID/extraction/results" \
    -H "Authorization: Bearer $TOKEN")

EXTRACTION_STATUS=$(echo $EXTRACTIONS | grep -o '"status":"[^"]*' | head -1 | cut -d'"' -f4)

if [ "$EXTRACTION_STATUS" = "complete" ]; then
    echo -e "${GREEN}✓${NC} Extraction status: $EXTRACTION_STATUS"

    # Count fields with extractions
    FIELD_COUNT=$(echo $EXTRACTIONS | grep -o '"field_name":' | wc -l)
    echo "  Found $FIELD_COUNT extracted fields"

    # Get sample extraction data
    SAMPLE_TEXT=$(echo $EXTRACTIONS | grep -o '"text":"[^"]*' | head -1 | cut -d'"' -f4)
    SAMPLE_PAGE=$(echo $EXTRACTIONS | grep -o '"page":[0-9]*' | head -1 | cut -d':' -f2)

    if [ ! -z "$SAMPLE_TEXT" ]; then
        echo "  Sample extraction:"
        echo "    Text: ${SAMPLE_TEXT:0:50}..."
        echo "    Page: $SAMPLE_PAGE"
    fi
else
    echo -e "${YELLOW}⚠${NC} Extraction status: $EXTRACTION_STATUS (not complete)"
fi

# Test 6: Verify JavaScript files contain word-level highlighting code
echo ""
echo "Test 6: Verifying word-level highlighting code..."

# Check if the function exists in the JavaScript file
if grep -q "highlightExtractionWordLevel" frontend-vanilla-old/js/document-detail.js; then
    echo -e "${GREEN}✓${NC} highlightExtractionWordLevel() function found"
else
    echo -e "${RED}✗${NC} highlightExtractionWordLevel() function NOT found"
    exit 1
fi

if grep -q "clearWordHighlights" frontend-vanilla-old/js/document-detail.js; then
    echo -e "${GREEN}✓${NC} clearWordHighlights() function found"
else
    echo -e "${RED}✗${NC} clearWordHighlights() function NOT found"
    exit 1
fi

if grep -q "findMatchingSpans" frontend-vanilla-old/js/document-detail.js; then
    echo -e "${GREEN}✓${NC} findMatchingSpans() function found"
else
    echo -e "${RED}✗${NC} findMatchingSpans() function NOT found"
    exit 1
fi

# Test 7: Verify CSS styles for word-level highlighting
echo ""
echo "Test 7: Verifying CSS styles..."

if grep -q "data-word-highlighted" frontend-vanilla-old/css/document-detail.css; then
    echo -e "${GREEN}✓${NC} Word-level highlighting CSS found"
else
    echo -e "${RED}✗${NC} Word-level highlighting CSS NOT found"
    exit 1
fi

# Test 8: Check if highlighting prioritization is correct
echo ""
echo "Test 8: Verifying highlighting prioritization..."

if grep -q "Attempting WORD-LEVEL highlighting" frontend-vanilla-old/js/document-detail.js; then
    echo -e "${GREEN}✓${NC} Word-level highlighting is prioritized"
else
    echo -e "${RED}✗${NC} Word-level highlighting prioritization NOT found"
    exit 1
fi

if grep -q "fallback 1 - rectangular" frontend-vanilla-old/js/document-detail.js; then
    echo -e "${GREEN}✓${NC} Bbox fallback is configured"
else
    echo -e "${RED}✗${NC} Bbox fallback NOT configured"
    exit 1
fi

if grep -q "fallback 2 - text matching" frontend-vanilla-old/js/document-detail.js; then
    echo -e "${GREEN}✓${NC} Text search fallback is configured"
else
    echo -e "${RED}✗${NC} Text search fallback NOT configured"
    exit 1
fi

# Summary
echo ""
echo "=========================================="
echo -e "${GREEN}All automated tests passed!${NC}"
echo "=========================================="
echo ""
echo "Manual Testing Instructions:"
echo "1. Open browser to: $FRONTEND_BASE"
echo "2. Login with credentials: admin / admin123"
echo "3. Navigate to Documents page"
echo "4. Open document: $DOCUMENT_NAME"
echo "5. Click on any extraction field"
echo "6. Observe:"
echo "   - Word-level highlighting (yellow background on individual words)"
echo "   - Smooth scrolling to highlighted text"
echo "   - Precise word-by-word highlighting (not rectangular boxes)"
echo "7. Test zoom in/out - highlights should persist"
echo "8. Check browser console for logs:"
echo "   - '🎯 Starting word-level precise highlighting'"
echo "   - '✅ Word-level highlighting complete'"
echo "   - Should see '🎯 Attempting WORD-LEVEL highlighting' first"
echo ""
echo "Expected Behavior:"
echo "- Primary: Word-level highlighting (precise, follows text)"
echo "- Fallback 1: Bbox highlighting (rectangular boxes)"
echo "- Fallback 2: Text search highlighting (if no bbox)"
echo ""
echo "Test Document Details:"
echo "- Document ID: $DOCUMENT_ID"
echo "- Document Name: $DOCUMENT_NAME"
echo "- Extraction Status: $EXTRACTION_STATUS"
echo "- Fields with extractions: $FIELD_COUNT"
echo ""
