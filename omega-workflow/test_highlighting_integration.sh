#!/bin/bash

# Comprehensive Integration Test for PDF Highlighting Feature
# Tests backend APIs, frontend serving, and data structure integrity

set -e  # Exit on error

# Color codes for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# Test counters
PASSED=0
FAILED=0

# Test results array
declare -a RESULTS

echo "=========================================="
echo "PDF HIGHLIGHTING INTEGRATION TEST SUITE"
echo "=========================================="
echo ""

# Function to print test result
print_result() {
    local test_name=$1
    local status=$2
    local message=$3

    if [ "$status" = "PASS" ]; then
        echo -e "${GREEN}✅ PASS${NC}: $test_name"
        PASSED=$((PASSED + 1))
        RESULTS+=("✅ $test_name")
    else
        echo -e "${RED}❌ FAIL${NC}: $test_name"
        echo -e "   ${RED}Error: $message${NC}"
        FAILED=$((FAILED + 1))
        RESULTS+=("❌ $test_name - $message")
    fi
}

# Test 1: Backend API Accessibility
echo "Test 1: Backend API Accessibility"
echo "-----------------------------------"
RESPONSE=$(curl -s -o /dev/null -w "%{http_code}" http://localhost:5001/api/docs || echo "000")
if [ "$RESPONSE" = "200" ]; then
    print_result "Backend API Accessibility" "PASS" ""
else
    print_result "Backend API Accessibility" "FAIL" "HTTP $RESPONSE - Backend not accessible"
fi
echo ""

# Test 2: Frontend Accessibility
echo "Test 2: Vanilla Frontend Accessibility"
echo "---------------------------------------"
RESPONSE=$(curl -s -o /dev/null -w "%{http_code}" http://localhost:3003 || echo "000")
if [ "$RESPONSE" = "200" ]; then
    print_result "Vanilla Frontend Accessibility" "PASS" ""
else
    print_result "Vanilla Frontend Accessibility" "FAIL" "HTTP $RESPONSE - Frontend not accessible"
fi
echo ""

# Test 3: document-detail.js File Serving
echo "Test 3: document-detail.js File Serving"
echo "----------------------------------------"
JS_RESPONSE=$(curl -s -o /dev/null -w "%{http_code}" http://localhost:3003/js/document-detail.js || echo "000")
JS_SIZE=$(curl -s -o /dev/null -w "%{size_download}" http://localhost:3003/js/document-detail.js || echo "0")
if [ "$JS_RESPONSE" = "200" ] && [ "$JS_SIZE" -gt "50000" ]; then
    print_result "document-detail.js File Serving" "PASS" "Size: ${JS_SIZE} bytes"
    echo "   File size: ${JS_SIZE} bytes (> 50KB indicates complete file)"
else
    print_result "document-detail.js File Serving" "FAIL" "HTTP $JS_RESPONSE, Size: $JS_SIZE bytes"
fi
echo ""

# Test 4: User Authentication
echo "Test 4: User Authentication"
echo "---------------------------"
AUTH_RESPONSE=$(curl -s -X POST http://localhost:5001/api/auth/login \
    -H "Content-Type: application/json" \
    -d '{"username": "highlighttest", "password": "test123456"}' || echo '{"error": "request failed"}')

TOKEN=$(echo $AUTH_RESPONSE | jq -r '.access_token // empty')
if [ -n "$TOKEN" ] && [ "$TOKEN" != "null" ]; then
    print_result "User Authentication" "PASS" ""
    echo "   Token: ${TOKEN:0:20}..."
else
    print_result "User Authentication" "FAIL" "No access_token in response"
    echo "   Response: $AUTH_RESPONSE"
fi
echo ""

# Test 5: Document List API
echo "Test 5: Document List API"
echo "-------------------------"
if [ -n "$TOKEN" ]; then
    DOCS_RESPONSE=$(curl -s -X GET http://localhost:5001/api/documents \
        -H "Authorization: Bearer $TOKEN" || echo '{"error": "request failed"}')

    DOC_COUNT=$(echo $DOCS_RESPONSE | jq -r '. | length // 0')
    if [ "$DOC_COUNT" -gt "0" ]; then
        print_result "Document List API" "PASS" ""
        echo "   Documents found: $DOC_COUNT"
        echo "   Sample document:"
        echo $DOCS_RESPONSE | jq -r '.[0] | {id, filename, upload_date}' | sed 's/^/   /'
    else
        print_result "Document List API" "FAIL" "No documents returned"
        echo "   Response: $DOCS_RESPONSE"
    fi
else
    print_result "Document List API" "FAIL" "Skipped - No authentication token"
fi
echo ""

# Test 6: Extraction API - Data Structure Verification
echo "Test 6: Extraction API - Data Structure"
echo "----------------------------------------"
if [ -n "$TOKEN" ]; then
    # Test with known document ID
    TEST_DOC_ID="e37f9df8"

    EXTRACTION_RESPONSE=$(curl -s -X GET "http://localhost:5001/api/extractions?document_id=$TEST_DOC_ID" \
        -H "Authorization: Bearer $TOKEN" || echo '{"error": "request failed"}')

    # Check if response has extractions
    EXTRACTION_COUNT=$(echo $EXTRACTION_RESPONSE | jq -r '. | length // 0')

    if [ "$EXTRACTION_COUNT" -gt "0" ]; then
        # Verify data structure has required fields
        HAS_PAGE=$(echo $EXTRACTION_RESPONSE | jq -r '.[0] | has("page")')
        HAS_SPANS=$(echo $EXTRACTION_RESPONSE | jq -r '.[0] | has("spans")')

        # Check if spans have bounds
        FIRST_SPAN=$(echo $EXTRACTION_RESPONSE | jq -r '.[0].spans[0] // empty')
        HAS_BOUNDS="false"
        if [ -n "$FIRST_SPAN" ]; then
            HAS_BOUNDS=$(echo $FIRST_SPAN | jq -r 'has("bounds")')
        fi

        if [ "$HAS_PAGE" = "true" ] && [ "$HAS_SPANS" = "true" ] && [ "$HAS_BOUNDS" = "true" ]; then
            print_result "Extraction API - Data Structure" "PASS" ""
            echo "   Extractions found: $EXTRACTION_COUNT"
            echo "   ✓ Has 'page' field"
            echo "   ✓ Has 'spans' array"
            echo "   ✓ Spans have 'bounds' objects"
            echo ""
            echo "   Sample extraction (first field):"
            echo $EXTRACTION_RESPONSE | jq -r '.[0] | {field_name, page, value: .value[0:50], spans: .spans[0]}' | sed 's/^/   /'
        else
            print_result "Extraction API - Data Structure" "FAIL" "Missing required fields"
            echo "   Has page: $HAS_PAGE"
            echo "   Has spans: $HAS_SPANS"
            echo "   Spans have bounds: $HAS_BOUNDS"
        fi
    else
        print_result "Extraction API - Data Structure" "FAIL" "No extractions returned for document $TEST_DOC_ID"
        echo "   Response: $EXTRACTION_RESPONSE"
    fi
else
    print_result "Extraction API - Data Structure" "FAIL" "Skipped - No authentication token"
fi
echo ""

# Test 7: Multiple Field Verification
echo "Test 7: Multiple Field Extraction Verification"
echo "-----------------------------------------------"
if [ -n "$TOKEN" ] && [ "$EXTRACTION_COUNT" -gt "0" ]; then
    # Test at least 3 different fields
    FIELDS_TO_TEST=3
    FIELDS_WITH_HIGHLIGHTS=0

    for i in $(seq 0 $((FIELDS_TO_TEST - 1))); do
        FIELD_NAME=$(echo $EXTRACTION_RESPONSE | jq -r ".[$i].field_name // empty")
        if [ -n "$FIELD_NAME" ]; then
            HAS_PAGE=$(echo $EXTRACTION_RESPONSE | jq -r ".[$i] | has(\"page\")")
            SPAN_COUNT=$(echo $EXTRACTION_RESPONSE | jq -r ".[$i].spans | length // 0")

            if [ "$HAS_PAGE" = "true" ] && [ "$SPAN_COUNT" -gt "0" ]; then
                FIELDS_WITH_HIGHLIGHTS=$((FIELDS_WITH_HIGHLIGHTS + 1))
                echo "   ✓ Field '$FIELD_NAME': Page present, $SPAN_COUNT spans"
            else
                echo "   ✗ Field '$FIELD_NAME': Missing highlighting data"
            fi
        fi
    done

    if [ "$FIELDS_WITH_HIGHLIGHTS" -ge "3" ]; then
        print_result "Multiple Field Extraction Verification" "PASS" ""
        echo "   $FIELDS_WITH_HIGHLIGHTS/$FIELDS_TO_TEST fields have complete highlighting data"
    else
        print_result "Multiple Field Extraction Verification" "FAIL" "Only $FIELDS_WITH_HIGHLIGHTS/$FIELDS_TO_TEST fields have highlighting data"
    fi
else
    print_result "Multiple Field Extraction Verification" "FAIL" "Skipped - Prerequisites not met"
fi
echo ""

# Test 8: Bounds Structure Verification
echo "Test 8: Bounds Structure Verification"
echo "--------------------------------------"
if [ -n "$TOKEN" ] && [ "$EXTRACTION_COUNT" -gt "0" ]; then
    # Check first extraction's first span bounds
    BOUNDS=$(echo $EXTRACTION_RESPONSE | jq -r '.[0].spans[0].bounds // empty')

    if [ -n "$BOUNDS" ]; then
        HAS_X=$(echo $BOUNDS | jq -r 'has("x")')
        HAS_Y=$(echo $BOUNDS | jq -r 'has("y")')
        HAS_WIDTH=$(echo $BOUNDS | jq -r 'has("width")')
        HAS_HEIGHT=$(echo $BOUNDS | jq -r 'has("height")')

        if [ "$HAS_X" = "true" ] && [ "$HAS_Y" = "true" ] && [ "$HAS_WIDTH" = "true" ] && [ "$HAS_HEIGHT" = "true" ]; then
            print_result "Bounds Structure Verification" "PASS" ""
            echo "   Bounds structure:"
            echo $BOUNDS | jq '.' | sed 's/^/   /'
        else
            print_result "Bounds Structure Verification" "FAIL" "Bounds missing required properties"
            echo "   Has x: $HAS_X, y: $HAS_Y, width: $HAS_WIDTH, height: $HAS_HEIGHT"
        fi
    else
        print_result "Bounds Structure Verification" "FAIL" "No bounds found in first span"
    fi
else
    print_result "Bounds Structure Verification" "FAIL" "Skipped - Prerequisites not met"
fi
echo ""

# Test 9: Admin User Document Access
echo "Test 9: Admin User Document Access"
echo "-----------------------------------"
# Login as admin to verify document ownership
ADMIN_AUTH=$(curl -s -X POST http://localhost:5001/api/auth/login \
    -H "Content-Type: application/json" \
    -d '{"username": "admin", "password": "admin123"}' || echo '{"error": "request failed"}')

ADMIN_TOKEN=$(echo $ADMIN_AUTH | jq -r '.access_token // empty')
if [ -n "$ADMIN_TOKEN" ] && [ "$ADMIN_TOKEN" != "null" ]; then
    ADMIN_DOCS=$(curl -s -X GET http://localhost:5001/api/documents \
        -H "Authorization: Bearer $ADMIN_TOKEN" || echo '[]')

    ADMIN_DOC_COUNT=$(echo $ADMIN_DOCS | jq -r '. | length // 0')
    HAS_TEST_DOC=$(echo $ADMIN_DOCS | jq -r '.[] | select(.id == "e37f9df8") | .id')

    if [ "$ADMIN_DOC_COUNT" -gt "0" ]; then
        print_result "Admin User Document Access" "PASS" ""
        echo "   Admin has access to $ADMIN_DOC_COUNT documents"
        if [ -n "$HAS_TEST_DOC" ]; then
            echo "   ✓ Test document (e37f9df8) found in admin's documents"
        fi
    else
        print_result "Admin User Document Access" "FAIL" "Admin has no documents"
    fi
else
    print_result "Admin User Document Access" "FAIL" "Admin authentication failed"
fi
echo ""

# Final Summary
echo "=========================================="
echo "TEST SUMMARY"
echo "=========================================="
echo ""
echo -e "${GREEN}PASSED: $PASSED${NC}"
echo -e "${RED}FAILED: $FAILED${NC}"
echo ""

if [ $FAILED -eq 0 ]; then
    echo -e "${GREEN}✅ ALL TESTS PASSED!${NC}"
    echo ""
    echo "Integration test suite completed successfully."
    echo "The PDF highlighting feature is ready for manual browser testing."
else
    echo -e "${YELLOW}⚠️  SOME TESTS FAILED${NC}"
    echo ""
    echo "Review the failures above and address issues before manual testing."
fi

echo ""
echo "=========================================="
echo "DETAILED RESULTS"
echo "=========================================="
for result in "${RESULTS[@]}"; do
    echo "$result"
done

echo ""
echo "=========================================="
echo "NEXT STEPS"
echo "=========================================="
echo ""
echo "1. Manual Browser Testing:"
echo "   - Open http://localhost:3003/login.html"
echo "   - Login as: highlight@test.com / test123456"
echo "   - Navigate to a document (e.g., BuzzFeed Agreement.pdf - ID: e37f9df8)"
echo "   - Verify PDF highlighting appears when hovering over extracted fields"
echo ""
echo "2. Cross-browser Testing:"
echo "   - Test in Chrome, Firefox, Safari"
echo "   - Verify highlighting works consistently"
echo ""
echo "3. Performance Testing:"
echo "   - Test with documents containing many extractions"
echo "   - Verify highlighting renders smoothly"
echo ""

exit $FAILED
