#!/bin/bash

echo "=========================================="
echo "OMEGA WORKFLOW - Field Loading Verification"
echo "=========================================="
echo ""

# Colors for output
GREEN='\033[0;32m'
RED='\033[0;31m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# Test 1: Backend API
echo "Test 1: Backend API /api/fields"
echo "-------------------------------------------"
response=$(curl -s http://localhost:5001/api/fields?limit=5)
total=$(echo "$response" | jq -r '.total')
count=$(echo "$response" | jq -r '.count')

if [ "$total" == "1354" ]; then
    echo -e "${GREEN}✓ PASS${NC} - API returns total: $total fields"
else
    echo -e "${RED}✗ FAIL${NC} - Expected 1354 fields, got: $total"
fi

if [ "$count" == "5" ]; then
    echo -e "${GREEN}✓ PASS${NC} - API respects limit parameter (count: $count)"
else
    echo -e "${RED}✗ FAIL${NC} - Expected count: 5, got: $count"
fi
echo ""

# Test 2: Full field fetch
echo "Test 2: Full Field Fetch (all 1,354 fields)"
echo "-------------------------------------------"
full_response=$(curl -s http://localhost:5001/api/fields)
full_count=$(echo "$full_response" | jq -r '.count')

if [ "$full_count" == "1354" ]; then
    echo -e "${GREEN}✓ PASS${NC} - API returns all $full_count fields when no limit specified"
else
    echo -e "${RED}✗ FAIL${NC} - Expected 1354 fields, got: $full_count"
fi
echo ""

# Test 3: Field structure
echo "Test 3: Field Data Structure"
echo "-------------------------------------------"
field=$(echo "$response" | jq -r '.fields[0]')
has_field_id=$(echo "$field" | jq 'has("field_id")')
has_name=$(echo "$field" | jq 'has("name")')
has_description=$(echo "$field" | jq 'has("description")')
has_type=$(echo "$field" | jq 'has("type")')

if [ "$has_field_id" == "true" ] && [ "$has_name" == "true" ] && [ "$has_description" == "true" ] && [ "$has_type" == "true" ]; then
    echo -e "${GREEN}✓ PASS${NC} - Field structure contains required properties"
    echo "  - field_id: ✓"
    echo "  - name: ✓"
    echo "  - description: ✓"
    echo "  - type: ✓"
else
    echo -e "${RED}✗ FAIL${NC} - Field structure missing required properties"
fi
echo ""

# Test 4: Sample field data
echo "Test 4: Sample Field Data"
echo "-------------------------------------------"
field_name=$(echo "$response" | jq -r '.fields[0].name')
field_type=$(echo "$response" | jq -r '.fields[0].type')
echo "First Field: $field_name"
echo "Type: $field_type"
echo ""

# Test 5: Frontend file changes
echo "Test 5: Frontend Code Changes"
echo "-------------------------------------------"
app_js="/home/ubuntu/contract1/omega-workflow/frontend/js/app.js"

if grep -q "await loadFieldsData()" "$app_js"; then
    echo -e "${GREEN}✓ PASS${NC} - app.js contains 'await loadFieldsData()'"
else
    echo -e "${RED}✗ FAIL${NC} - app.js missing 'await loadFieldsData()'"
fi

if grep -q "Fields loaded.*fields available" "$app_js"; then
    echo -e "${GREEN}✓ PASS${NC} - app.js has field loading confirmation log"
else
    echo -e "${RED}✗ FAIL${NC} - app.js missing field loading log"
fi

if grep -q "Step 2 page shown" "$app_js"; then
    echo -e "${GREEN}✓ PASS${NC} - app.js has Step 2 rendering logic"
else
    echo -e "${RED}✗ FAIL${NC} - app.js missing Step 2 rendering logic"
fi

if grep -q "Field Discovery page shown" "$app_js"; then
    echo -e "${GREEN}✓ PASS${NC} - app.js has Field Discovery rendering logic"
else
    echo -e "${RED}✗ FAIL${NC} - app.js missing Field Discovery rendering logic"
fi
echo ""

# Test 6: Server status
echo "Test 6: Server Status"
echo "-------------------------------------------"
backend_status=$(curl -s -o /dev/null -w "%{http_code}" http://localhost:5001/health || echo "000")
frontend_status=$(curl -s -o /dev/null -w "%{http_code}" http://localhost:3000/ || echo "000")

if [ "$backend_status" == "200" ]; then
    echo -e "${GREEN}✓ PASS${NC} - Backend server responding (port 5001)"
else
    echo -e "${YELLOW}⚠ WARNING${NC} - Backend server status: $backend_status"
fi

if [ "$frontend_status" == "200" ]; then
    echo -e "${GREEN}✓ PASS${NC} - Frontend server responding (port 3000)"
else
    echo -e "${YELLOW}⚠ WARNING${NC} - Frontend server status: $frontend_status"
fi
echo ""

# Summary
echo "=========================================="
echo "VERIFICATION COMPLETE"
echo "=========================================="
echo ""
echo "Next Steps:"
echo "1. Open browser to http://localhost:3000"
echo "2. Open browser console (F12)"
echo "3. Navigate to Workflows → Create Workflow → Step 2"
echo "4. Verify field list shows ~1,350 fields"
echo "5. Navigate to Field Discovery"
echo "6. Verify page shows '1354 Results'"
echo ""
echo "For detailed testing instructions, see:"
echo "  /home/ubuntu/contract1/omega-workflow/FIELD_LOADING_FIX_SUMMARY.md"
echo ""
