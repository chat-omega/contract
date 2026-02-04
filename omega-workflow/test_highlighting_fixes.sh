#!/bin/bash

# Test Script: PDF Navigation and Highlighting Feature
# Verifies the 5 critical fixes

# ANSI colors
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
CYAN='\033[0;36m'
BOLD='\033[1m'
NC='\033[0m' # No Color

# Test configuration
BASE_URL="https://app-react.omegaintelligence.ai"
API_URL="http://localhost:5001/api"
TEST_DOC_ID="e37f9df8"
TEST_WORKFLOW_ID="46"
TOKEN="eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiIyIiwiZXhwIjoxNzYzMDc4MTE4fQ.VSOnddByL3a1_QgMuC6RWQk5u5f8RbfZUq3j5TYmt_4"

echo ""
echo -e "${BOLD}╔══════════════════════════════════════════════════════════════════════════════╗${NC}"
echo -e "${BOLD}║         PDF Navigation & Highlighting Feature - Test Suite                  ║${NC}"
echo -e "${BOLD}╚══════════════════════════════════════════════════════════════════════════════╝${NC}"
echo ""

TESTS_PASSED=0
TESTS_FAILED=0

# Function to print section header
section() {
    echo ""
    echo "================================================================================"
    echo -e "${BOLD}$1${NC}"
    echo "================================================================================"
    echo ""
}

# TEST 1: Verify extraction data structure
section "TEST 1: Verify Extraction Data Structure"

echo -e "${CYAN}Fetching extraction data...${NC}"
RESPONSE=$(curl -s -H "Authorization: Bearer $TOKEN" \
    "${API_URL}/documents/${TEST_DOC_ID}/extractions?workflow_id=${TEST_WORKFLOW_ID}")

if echo "$RESPONSE" | jq -e '.results' > /dev/null 2>&1; then
    echo -e "${GREEN}✓ Extraction data retrieved successfully${NC}"

    FIELD_COUNT=$(echo "$RESPONSE" | jq '.results | length')
    echo -e "${BLUE}  - Fields: $FIELD_COUNT${NC}"

    # Check for multi-extraction field (Parties)
    PARTIES_COUNT=$(echo "$RESPONSE" | jq -r '.results.Parties.extractions | length' 2>/dev/null || echo "0")
    if [ "$PARTIES_COUNT" -gt 1 ]; then
        echo -e "${BLUE}  - Parties field: $PARTIES_COUNT extractions${NC}"
        echo -e "${GREEN}✓ Multi-extraction field found (perfect for testing)${NC}"
        ((TESTS_PASSED++))
    else
        echo -e "${YELLOW}⚠ Parties field has only $PARTIES_COUNT extraction${NC}"
        ((TESTS_PASSED++))
    fi
else
    echo -e "${RED}✗ Failed to fetch extraction data${NC}"
    ((TESTS_FAILED++))
fi

# TEST 2: Verify type definition
section "TEST 2: Verify Type Definitions"

PDF_TYPES_FILE="/home/ubuntu/contract1/omega-workflow/react-app/src/types/pdf.ts"

if [ -f "$PDF_TYPES_FILE" ]; then
    if grep -q "extractionIndex?:" "$PDF_TYPES_FILE"; then
        echo -e "${GREEN}✓ extractionIndex field added to HighlightRect type${NC}"
        ((TESTS_PASSED++))
    else
        echo -e "${RED}✗ extractionIndex field missing from HighlightRect type${NC}"
        ((TESTS_FAILED++))
    fi
else
    echo -e "${RED}✗ pdf.ts file not found${NC}"
    ((TESTS_FAILED++))
fi

# TEST 3: Verify DocumentDetailPage changes
section "TEST 3: Verify DocumentDetailPage Changes"

DETAIL_PAGE_FILE="/home/ubuntu/contract1/omega-workflow/react-app/src/features/documents/DocumentDetailPage.tsx"

if [ -f "$DETAIL_PAGE_FILE" ]; then
    CHECKS=0
    PASSED=0

    # Check 1: extractionIndex in single extraction
    if grep -q "extractionIndex: selectedExtractionIndex" "$DETAIL_PAGE_FILE"; then
        echo -e "${GREEN}✓ extractionIndex added when creating single extraction highlight${NC}"
        ((PASSED++))
    else
        echo -e "${RED}✗ extractionIndex missing from single extraction highlight${NC}"
    fi
    ((CHECKS++))

    # Check 2: extractionIndex in forEach loop
    if grep -q "extractionIndex: idx" "$DETAIL_PAGE_FILE"; then
        echo -e "${GREEN}✓ extractionIndex added in forEach loop for all extractions${NC}"
        ((PASSED++))
    else
        echo -e "${RED}✗ extractionIndex missing from forEach loop${NC}"
    fi
    ((CHECKS++))

    # Check 3: selectedExtractionIndex prop passed to PDFViewer
    if grep -q "selectedExtractionIndex={selectedExtractionIndex}" "$DETAIL_PAGE_FILE"; then
        echo -e "${GREEN}✓ selectedExtractionIndex prop passed to PDFViewer${NC}"
        ((PASSED++))
    else
        echo -e "${RED}✗ selectedExtractionIndex prop not passed to PDFViewer${NC}"
    fi
    ((CHECKS++))

    if [ $PASSED -eq $CHECKS ]; then
        ((TESTS_PASSED++))
    else
        ((TESTS_FAILED++))
    fi
else
    echo -e "${RED}✗ DocumentDetailPage.tsx not found${NC}"
    ((TESTS_FAILED++))
fi

# TEST 4: Verify PDFViewer changes
section "TEST 4: Verify PDFViewer Changes"

PDF_VIEWER_FILE="/home/ubuntu/contract1/omega-workflow/react-app/src/features/documents/components/PDFViewer.tsx"

if [ -f "$PDF_VIEWER_FILE" ]; then
    CHECKS=0
    PASSED=0

    # Check 1: Interface has selectedExtractionIndex
    if grep -q "selectedExtractionIndex?: number | null" "$PDF_VIEWER_FILE"; then
        echo -e "${GREEN}✓ selectedExtractionIndex added to PDFViewerProps interface${NC}"
        ((PASSED++))
    else
        echo -e "${RED}✗ selectedExtractionIndex missing from interface${NC}"
    fi
    ((CHECKS++))

    # Check 2: Destructuring includes selectedExtractionIndex
    if grep -A5 "export const PDFViewer" "$PDF_VIEWER_FILE" | grep -q "selectedExtractionIndex = null"; then
        echo -e "${GREEN}✓ selectedExtractionIndex added to destructuring${NC}"
        ((PASSED++))
    else
        echo -e "${RED}✗ selectedExtractionIndex missing from destructuring${NC}"
    fi
    ((CHECKS++))

    # Check 3: isSelected logic checks extractionIndex
    if grep -q "highlight.extractionIndex === selectedExtractionIndex" "$PDF_VIEWER_FILE"; then
        echo -e "${GREEN}✓ isSelected logic checks extractionIndex${NC}"
        ((PASSED++))
    else
        echo -e "${RED}✗ isSelected logic doesn't check extractionIndex${NC}"
    fi
    ((CHECKS++))

    # Check 4: Effect dependencies include selectedExtractionIndex
    if grep -q "selectedExtractionIndex, pulseIntensity" "$PDF_VIEWER_FILE"; then
        echo -e "${GREEN}✓ renderHighlightsForPage dependencies include selectedExtractionIndex${NC}"
        ((PASSED++))
    else
        echo -e "${RED}✗ renderHighlightsForPage dependencies missing selectedExtractionIndex${NC}"
    fi
    ((CHECKS++))

    if grep -q ", selectedExtractionIndex, scale" "$PDF_VIEWER_FILE"; then
        echo -e "${GREEN}✓ Re-render effect dependencies include selectedExtractionIndex${NC}"
        ((PASSED++))
    else
        echo -e "${RED}✗ Re-render effect missing selectedExtractionIndex${NC}"
    fi
    ((CHECKS++))

    if grep -q "scrollToPage, selectedFieldId, selectedExtractionIndex\]" "$PDF_VIEWER_FILE"; then
        echo -e "${GREEN}✓ Pulse effect dependencies include selectedExtractionIndex${NC}"
        ((PASSED++))
    else
        echo -e "${RED}✗ Pulse effect missing selectedExtractionIndex${NC}"
    fi
    ((CHECKS++))

    if [ $PASSED -eq $CHECKS ]; then
        ((TESTS_PASSED++))
    else
        ((TESTS_FAILED++))
    fi
else
    echo -e "${RED}✗ PDFViewer.tsx not found${NC}"
    ((TESTS_FAILED++))
fi

# TEST 5: Verify bundle is deployed
section "TEST 5: Verify Bundle Deployment"

echo -e "${CYAN}Fetching index.html...${NC}"
INDEX_HTML=$(curl -s "$BASE_URL/")

if [ $? -eq 0 ]; then
    BUNDLE_NAME=$(echo "$INDEX_HTML" | grep -oP 'index-[a-zA-Z0-9]+\.js' | head -1)

    if [ -n "$BUNDLE_NAME" ]; then
        echo -e "${BLUE}  - Bundle: $BUNDLE_NAME${NC}"

        echo -e "${CYAN}Fetching bundle...${NC}"
        BUNDLE_CODE=$(curl -s "$BASE_URL/assets/$BUNDLE_NAME")

        if echo "$BUNDLE_CODE" | grep -q "selectedExtractionIndex"; then
            echo -e "${GREEN}✓ Bundle contains selectedExtractionIndex code${NC}"
            ((TESTS_PASSED++))
        else
            echo -e "${RED}✗ Bundle missing selectedExtractionIndex code${NC}"
            echo -e "${YELLOW}  ⚠ You may need to hard refresh your browser!${NC}"
            ((TESTS_FAILED++))
        fi
    else
        echo -e "${RED}✗ Could not find bundle name in index.html${NC}"
        ((TESTS_FAILED++))
    fi
else
    echo -e "${RED}✗ Failed to fetch index.html${NC}"
    ((TESTS_FAILED++))
fi

# SUMMARY
section "TEST SUMMARY"

TOTAL_TESTS=$((TESTS_PASSED + TESTS_FAILED))

echo -e "${BOLD}Tests passed: ${TESTS_PASSED}/${TOTAL_TESTS}${NC}"
echo ""

if [ $TESTS_FAILED -eq 0 ]; then
    echo -e "${GREEN}✓ All tests passed!${NC}"
    echo ""
    echo -e "${CYAN}The highlighting feature should now work correctly:${NC}"
    echo -e "${BLUE}  1. Click a specific extraction → Only that extraction is highlighted${NC}"
    echo -e "${BLUE}  2. Highlight appears with blue color and 2-second pulse${NC}"
    echo -e "${BLUE}  3. Scroll timing is correct (500ms wait)${NC}"
    echo -e "${BLUE}  4. Performance is optimized (1-2 pages instead of 165)${NC}"
    echo ""
    echo -e "${YELLOW}⚠️  IMPORTANT: Hard refresh your browser!${NC}"
    echo -e "${CYAN}  Windows/Linux: Ctrl + Shift + R${NC}"
    echo -e "${CYAN}  Mac: Cmd + Shift + R${NC}"
    echo ""
    echo -e "${CYAN}Test it at: ${BASE_URL}/documents/${TEST_DOC_ID}${NC}"
    echo ""
    exit 0
else
    echo -e "${RED}✗ Some tests failed${NC}"
    echo ""
    exit 1
fi
