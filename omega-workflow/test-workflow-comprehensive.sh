#!/bin/bash

# Comprehensive Workflow Testing Script
# Tests the create workflow and workflow library features

API_BASE="http://localhost:5001/api"
FRONTEND="http://localhost:3000"

echo "============================================"
echo "Workflow Features Comprehensive Test Suite"
echo "============================================"
echo ""

# Colors for output
GREEN='\033[0;32m'
RED='\033[0;31m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Test counters
PASSED=0
FAILED=0
TOTAL=0

# Helper function for test results
test_result() {
    TOTAL=$((TOTAL + 1))
    if [ $1 -eq 0 ]; then
        echo -e "${GREEN}✓ PASS${NC}: $2"
        PASSED=$((PASSED + 1))
    else
        echo -e "${RED}✗ FAIL${NC}: $2"
        FAILED=$((FAILED + 1))
    fi
}

echo "================================================"
echo "TEST 1: Backend API Health and Endpoints"
echo "================================================"
echo ""

# Test API health
echo -e "${BLUE}Testing API health endpoint...${NC}"
HEALTH=$(curl -s "$API_BASE/health")
if echo "$HEALTH" | grep -q '"status":"healthy"'; then
    test_result 0 "API health endpoint responding"
else
    test_result 1 "API health endpoint not responding"
fi

# Test fields endpoint
echo -e "${BLUE}Testing fields endpoint...${NC}"
FIELDS=$(curl -s "$API_BASE/fields")
FIELD_COUNT=$(echo "$FIELDS" | jq -r '.total' 2>/dev/null)
if [ "$FIELD_COUNT" = "1354" ]; then
    test_result 0 "Fields endpoint returns 1,354 fields"
else
    test_result 1 "Fields endpoint (expected 1354, got $FIELD_COUNT)"
fi

# Test workflow templates endpoint
echo -e "${BLUE}Testing workflow templates endpoint...${NC}"
TEMPLATES=$(curl -s "$API_BASE/analyze/workflows/templates")
TEMPLATE_COUNT=$(echo "$TEMPLATES" | jq 'length' 2>/dev/null)
if [ "$TEMPLATE_COUNT" -gt 0 ]; then
    test_result 0 "Workflow templates endpoint returns $TEMPLATE_COUNT templates"
else
    test_result 1 "Workflow templates endpoint"
fi

# Check for M&A template
MA_TEMPLATE=$(echo "$TEMPLATES" | jq -r '.[] | select(.id == "ma-due-diligence") | .name' 2>/dev/null)
if [ "$MA_TEMPLATE" = "M&A/Due Diligence" ]; then
    test_result 0 "M&A/Due Diligence template exists"
else
    test_result 1 "M&A/Due Diligence template not found"
fi

echo ""
echo "================================================"
echo "TEST 2: Workflow Creation Flow (API)"
echo "================================================"
echo ""

# Initialize workflow
echo -e "${BLUE}Initializing new workflow...${NC}"
INIT_RESPONSE=$(curl -s -X POST "$API_BASE/analyze/workflows/create/init")
WORKFLOW_ID=$(echo "$INIT_RESPONSE" | jq -r '.workflowId' 2>/dev/null)

if [ ! -z "$WORKFLOW_ID" ] && [ "$WORKFLOW_ID" != "null" ]; then
    test_result 0 "Workflow initialization (ID: $WORKFLOW_ID)"
else
    test_result 1 "Workflow initialization failed"
fi

# Set workflow name
if [ ! -z "$WORKFLOW_ID" ]; then
    echo -e "${BLUE}Setting workflow name...${NC}"
    NAME_RESPONSE=$(curl -s -X POST "$API_BASE/analyze/workflows/create/$WORKFLOW_ID/name" \
        -H "Content-Type: application/json" \
        -d '{"name": "Test Workflow"}')

    if echo "$NAME_RESPONSE" | grep -q '"success":true'; then
        test_result 0 "Set workflow name"
    else
        test_result 1 "Set workflow name"
    fi

    # Set workflow fields
    echo -e "${BLUE}Setting workflow fields...${NC}"
    FIELDS_RESPONSE=$(curl -s -X POST "$API_BASE/analyze/workflows/create/$WORKFLOW_ID/fields" \
        -H "Content-Type: application/json" \
        -d '{"fields": ["Title", "Parties", "Date"]}')

    if echo "$FIELDS_RESPONSE" | grep -q '"success":true'; then
        test_result 0 "Set workflow fields"
    else
        test_result 1 "Set workflow fields"
    fi

    # Set workflow details
    echo -e "${BLUE}Setting workflow details...${NC}"
    DETAILS_RESPONSE=$(curl -s -X POST "$API_BASE/analyze/workflows/create/$WORKFLOW_ID/details" \
        -H "Content-Type: application/json" \
        -d '{"description": "Test workflow description", "documentTypes": ["Service Agt"]}')

    if echo "$DETAILS_RESPONSE" | grep -q '"success":true'; then
        test_result 0 "Set workflow details"
    else
        test_result 1 "Set workflow details"
    fi

    # Set scoring profiles
    echo -e "${BLUE}Setting scoring profiles...${NC}"
    SCORING_RESPONSE=$(curl -s -X POST "$API_BASE/analyze/workflows/create/$WORKFLOW_ID/scoring" \
        -H "Content-Type: application/json" \
        -d '{"scoringProfiles": []}')

    if echo "$SCORING_RESPONSE" | grep -q '"success":true'; then
        test_result 0 "Set scoring profiles"
    else
        test_result 1 "Set scoring profiles"
    fi
fi

echo ""
echo "================================================"
echo "TEST 3: Template Copy Feature (API)"
echo "================================================"
echo ""

# Test creating workflow from M&A template
echo -e "${BLUE}Creating workflow from M&A template...${NC}"
TEMPLATE_WORKFLOW_ID=$(uuidgen | cut -c1-8)
TEMPLATE_RESPONSE=$(curl -s -X POST "$API_BASE/analyze/workflows/create/$TEMPLATE_WORKFLOW_ID/template" \
    -H "Content-Type: application/json" \
    -d '{"templateId": "ma-due-diligence", "templateName": "M&A/Due Diligence"}')

if echo "$TEMPLATE_RESPONSE" | grep -q '"success":true'; then
    test_result 0 "Created workflow from M&A template"

    # Verify template fields were populated
    TEMPLATE_NAME=$(echo "$TEMPLATE_RESPONSE" | jq -r '.workflow.name' 2>/dev/null)
    if [ "$TEMPLATE_NAME" = "M&A/Due Diligence" ]; then
        test_result 0 "Template workflow has correct name"
    else
        test_result 1 "Template workflow name (got: $TEMPLATE_NAME)"
    fi

    # Check if fields were populated
    HAS_FIELDS=$(echo "$TEMPLATE_RESPONSE" | jq '.workflow.fields' 2>/dev/null)
    if [ ! -z "$HAS_FIELDS" ] && [ "$HAS_FIELDS" != "null" ]; then
        test_result 0 "Template workflow has fields populated"
    else
        test_result 1 "Template workflow fields not populated"
    fi

    # Check if currentStep is 5 (review step)
    CURRENT_STEP=$(echo "$TEMPLATE_RESPONSE" | jq -r '.workflow.currentStep' 2>/dev/null)
    if [ "$CURRENT_STEP" = "5" ]; then
        test_result 0 "Template workflow goes to review step (Step 5)"
    else
        test_result 1 "Template workflow step (expected 5, got $CURRENT_STEP)"
    fi
else
    test_result 1 "Failed to create workflow from M&A template"
fi

echo ""
echo "================================================"
echo "TEST 4: Frontend Accessibility"
echo "================================================"
echo ""

# Test frontend is accessible
echo -e "${BLUE}Testing frontend accessibility...${NC}"
FRONTEND_RESPONSE=$(curl -s "$FRONTEND" | head -1)
if echo "$FRONTEND_RESPONSE" | grep -q "<!DOCTYPE html>"; then
    test_result 0 "Frontend is accessible at $FRONTEND"
else
    test_result 1 "Frontend accessibility"
fi

# Test app.js is accessible
echo -e "${BLUE}Testing app.js accessibility...${NC}"
APPJS_RESPONSE=$(curl -s "$FRONTEND/js/app.js" | head -5)
if echo "$APPJS_RESPONSE" | grep -q "Application state"; then
    test_result 0 "app.js is accessible"
else
    test_result 1 "app.js accessibility"
fi

# Verify selectedFields initialization in app.js
echo -e "${BLUE}Verifying selectedFields Set initialization in app.js...${NC}"
SELECTED_FIELDS_INIT=$(curl -s "$FRONTEND/js/app.js" | grep -c "selectedFields: new Set()")
if [ "$SELECTED_FIELDS_INIT" -gt 0 ]; then
    test_result 0 "selectedFields initialized as Set in app.js ($SELECTED_FIELDS_INIT occurrences)"
else
    test_result 1 "selectedFields Set initialization not found"
fi

echo ""
echo "================================================"
echo "TEST 5: JavaScript Code Verification"
echo "================================================"
echo ""

# Check for workflow-related functions
echo -e "${BLUE}Checking workflow-related functions in app.js...${NC}"

# Check for workflow initialization
WORKFLOW_INIT=$(curl -s "$FRONTEND/js/app.js" | grep -c "initWorkflow\|createWorkflow")
if [ "$WORKFLOW_INIT" -gt 0 ]; then
    test_result 0 "Workflow initialization functions exist"
else
    test_result 1 "Workflow initialization functions"
fi

# Check for template copy functionality
TEMPLATE_COPY=$(curl -s "$FRONTEND/js/app.js" | grep -c "copyTemplate\|populateWorkflowFromTemplate")
if [ "$TEMPLATE_COPY" -gt 0 ]; then
    test_result 0 "Template copy functions exist"
else
    test_result 1 "Template copy functions"
fi

# Check for field selection functions
FIELD_SELECTION=$(curl -s "$FRONTEND/js/app.js" | grep -c "selectedFields")
if [ "$FIELD_SELECTION" -gt 5 ]; then
    test_result 0 "Field selection code exists ($FIELD_SELECTION references)"
else
    test_result 1 "Field selection code (only $FIELD_SELECTION references)"
fi

echo ""
echo "================================================"
echo "TEST 6: Database and Storage"
echo "================================================"
echo ""

# Check if database file exists
DB_PATH="/home/ubuntu/contract1/omega-workflow/backend-fastapi/data/workflow.db"
if [ -f "$DB_PATH" ]; then
    test_result 0 "Database file exists at $DB_PATH"

    # Get database size
    DB_SIZE=$(ls -lh "$DB_PATH" | awk '{print $5}')
    echo -e "${YELLOW}  Database size: $DB_SIZE${NC}"
else
    test_result 1 "Database file not found"
fi

echo ""
echo "================================================"
echo "TEST SUMMARY"
echo "================================================"
echo ""
echo -e "Total Tests:  ${BLUE}$TOTAL${NC}"
echo -e "Passed:       ${GREEN}$PASSED${NC}"
echo -e "Failed:       ${RED}$FAILED${NC}"
echo ""

if [ $FAILED -eq 0 ]; then
    echo -e "${GREEN}All tests passed! ✓${NC}"
    PASS_RATE=100
else
    PASS_RATE=$((PASSED * 100 / TOTAL))
    echo -e "${YELLOW}Pass Rate: $PASS_RATE%${NC}"
fi

echo ""
echo "================================================"
echo "MANUAL TESTING INSTRUCTIONS"
echo "================================================"
echo ""
echo "The following tests require manual verification in a browser:"
echo ""
echo "1. Navigate to: $FRONTEND"
echo "2. Click 'Create Workflow' in the sidebar"
echo "3. Verify Step 1 loads without JavaScript errors"
echo "4. Complete the workflow creation flow:"
echo "   - Step 1: Enter workflow name"
echo "   - Step 2: Select fields (verify selectedFields Set works)"
echo "   - Step 3: Add description and document types"
echo "   - Step 4: Configure scoring (optional)"
echo "   - Step 5: Review and save"
echo ""
echo "5. Navigate to 'Workflows' in sidebar"
echo "6. Switch to 'Workflow Library' tab"
echo "7. Click 'Copy Template' on M&A template"
echo "8. Verify it loads to Step 5 with pre-populated data"
echo ""
echo "9. Open browser console (F12) and check for:"
echo "   - No JavaScript errors"
echo "   - AppState.workflow.selectedFields is a Set"
echo "   - Check with: AppState.workflow.selectedFields instanceof Set"
echo ""
echo "================================================"
echo ""

exit $FAILED
