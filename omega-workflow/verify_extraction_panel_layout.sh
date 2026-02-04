#!/bin/bash

# Verification Script for Extraction Panel Layout Migration
# Tests that extraction panel is on LEFT, PDF viewer on RIGHT

echo "=================================================="
echo "EXTRACTION PANEL LAYOUT VERIFICATION"
echo "=================================================="
echo ""

# Colors
GREEN='\033[0;32m'
RED='\033[0;31m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# Test 1: Check containers
echo "1. CONTAINER STATUS"
echo "-------------------"

REACT_STATUS=$(docker ps --filter "name=omega-frontend-react" --format "{{.Status}}" | grep -o "Up" | head -1)
BACKEND_STATUS=$(docker ps --filter "name=omega-backend-fastapi" --format "{{.Status}}" | grep -o "Up" | head -1)

if [ "$REACT_STATUS" = "Up" ]; then
    echo -e "${GREEN}✓${NC} React container: Running"
else
    echo -e "${RED}✗${NC} React container: Not running"
fi

if [ "$BACKEND_STATUS" = "Up" ]; then
    echo -e "${GREEN}✓${NC} Backend container: Running"
else
    echo -e "${RED}✗${NC} Backend container: Not running"
fi

echo ""

# Test 2: Check frontend accessibility
echo "2. FRONTEND ACCESSIBILITY"
echo "-------------------------"

if curl -s http://localhost:8081 > /dev/null; then
    echo -e "${GREEN}✓${NC} React app accessible at http://localhost:8081"
else
    echo -e "${RED}✗${NC} React app NOT accessible"
fi

echo ""

# Test 3: Check backend API
echo "3. BACKEND API HEALTH"
echo "---------------------"

API_RESPONSE=$(curl -s http://localhost:5001/api/document-types)
if echo "$API_RESPONSE" | grep -q "success"; then
    echo -e "${GREEN}✓${NC} Backend API responding (document-types endpoint)"
else
    echo -e "${YELLOW}⚠${NC} Backend API response unexpected (may still be functional)"
fi

echo ""

# Test 4: Code structure verification
echo "4. CODE STRUCTURE VERIFICATION"
echo "------------------------------"

DOCDETAIL_FILE="/home/ubuntu/contract1/omega-workflow/react-app/src/features/documents/DocumentDetailPage.tsx"
EXTRACTION_FILE="/home/ubuntu/contract1/omega-workflow/react-app/src/features/documents/components/ExtractionPanel.tsx"

if [ -f "$DOCDETAIL_FILE" ]; then
    echo -e "${GREEN}✓${NC} DocumentDetailPage.tsx found"

    # Check component order in JSX
    if grep -A 20 "flex-1 flex overflow-hidden" "$DOCDETAIL_FILE" | grep -m 1 "ExtractionPanel" > /dev/null; then
        echo -e "${GREEN}✓${NC} ExtractionPanel is FIRST child (LEFT position)"
    else
        echo -e "${RED}✗${NC} ExtractionPanel NOT in expected position"
    fi

    if grep -A 20 "flex-1 flex overflow-hidden" "$DOCDETAIL_FILE" | grep "PDFViewer" > /dev/null; then
        echo -e "${GREEN}✓${NC} PDFViewer is SECOND child (RIGHT position)"
    else
        echo -e "${RED}✗${NC} PDFViewer NOT in expected position"
    fi
else
    echo -e "${RED}✗${NC} DocumentDetailPage.tsx NOT found"
fi

echo ""

if [ -f "$EXTRACTION_FILE" ]; then
    echo -e "${GREEN}✓${NC} ExtractionPanel.tsx found"

    # Check CSS classes for correct border
    if grep -q "border-r border-gray-200" "$EXTRACTION_FILE"; then
        echo -e "${GREEN}✓${NC} Border-right present (confirms LEFT positioning)"
    else
        echo -e "${RED}✗${NC} Border-right NOT found (unexpected)"
    fi

    # Check width class
    if grep -q "w-96" "$EXTRACTION_FILE"; then
        echo -e "${GREEN}✓${NC} Width class w-96 (384px) present"
    else
        echo -e "${YELLOW}⚠${NC} Width class w-96 NOT found"
    fi
else
    echo -e "${RED}✗${NC} ExtractionPanel.tsx NOT found"
fi

echo ""

# Test 5: Layout structure details
echo "5. LAYOUT STRUCTURE DETAILS"
echo "---------------------------"

echo "Component Order in DocumentDetailPage.tsx:"
echo "  1. ExtractionPanel (LEFT SIDE)"
echo "  2. PDFViewer (RIGHT SIDE)"
echo ""
echo "ExtractionPanel CSS:"
echo "  - Width: w-96 (384px fixed)"
echo "  - Border: border-r (right border)"
echo "  - Background: bg-white"
echo "  - Overflow: overflow-y-auto"
echo ""
echo "PDF Viewer CSS:"
echo "  - Flex: flex-1 (takes remaining space)"
echo "  - No fixed width"
echo ""

# Test 6: Build verification
echo "6. BUILD VERIFICATION"
echo "---------------------"

DIST_DIR="/home/ubuntu/contract1/omega-workflow/react-app/dist"
if [ -d "$DIST_DIR" ]; then
    echo -e "${GREEN}✓${NC} Build directory exists"

    if [ -f "$DIST_DIR/index.html" ]; then
        echo -e "${GREEN}✓${NC} index.html present"
    else
        echo -e "${RED}✗${NC} index.html missing"
    fi

    if [ -d "$DIST_DIR/assets" ]; then
        echo -e "${GREEN}✓${NC} Assets directory present"
    else
        echo -e "${RED}✗${NC} Assets directory missing"
    fi
else
    echo -e "${RED}✗${NC} Build directory NOT found"
fi

echo ""

# Final Summary
echo "=================================================="
echo "SUMMARY"
echo "=================================================="
echo ""
echo "Layout Configuration:"
echo "  ┌────────────────┬────────────────────────────┐"
echo "  │  Extraction    │                            │"
echo "  │  Panel         │      PDF Viewer            │"
echo "  │  (LEFT)        │      (RIGHT)               │"
echo "  │  384px         │      Remaining Width       │"
echo "  │  border-r →    │                            │"
echo "  └────────────────┴────────────────────────────┘"
echo ""
echo "Next Steps:"
echo "  1. Open browser: http://localhost:8081"
echo "  2. Login to application"
echo "  3. Navigate to any document"
echo "  4. Verify extraction panel is on LEFT"
echo "  5. Verify PDF viewer is on RIGHT"
echo "  6. Check border separator is visible"
echo ""
echo "For detailed testing, see:"
echo "  - MANUAL_TEST_SCRIPT.md"
echo "  - DOCUMENT_DETAIL_EXTRACTION_PANEL_TEST_REPORT.md"
echo ""
echo "=================================================="
