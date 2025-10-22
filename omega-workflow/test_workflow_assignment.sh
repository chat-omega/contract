#!/bin/bash

echo "======================================"
echo "WORKFLOW ASSIGNMENT TESTING"
echo "======================================"
echo ""

# Colors for output
GREEN='\033[0;32m'
RED='\033[0;31m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# Test configuration
BACKEND_URL="http://localhost:5001"

echo "Step 1: Check available saved workflows..."
WORKFLOWS_RESPONSE=$(curl -s "$BACKEND_URL/api/workflows/saved")
echo "Saved workflows: $WORKFLOWS_RESPONSE"
echo ""

# Parse workflow IDs if any exist
WORKFLOW_COUNT=$(echo "$WORKFLOWS_RESPONSE" | python3 -c "import json,sys; data=json.load(sys.stdin); print(len(data))" 2>/dev/null || echo "0")
echo "Found $WORKFLOW_COUNT saved workflows"
echo ""

# If no workflows exist, create one for testing
if [ "$WORKFLOW_COUNT" -eq "0" ]; then
    echo "${YELLOW}No saved workflows found. Creating a test workflow...${NC}"

    # Initialize workflow creation
    WORKFLOW_ID=$(curl -s -X POST "$BACKEND_URL/api/analyze/workflows/create/init" \
      -H "Content-Type: application/json" | python3 -c "import json,sys; print(json.load(sys.stdin)['workflowId'])")

    echo "Created workflow ID: $WORKFLOW_ID"

    # Create from template
    curl -s -X POST "$BACKEND_URL/api/analyze/workflows/create/$WORKFLOW_ID/template" \
      -H "Content-Type: application/json" \
      -d '{"templateId": "ma-due-diligence", "templateName": "M&A/Due Diligence"}' > /dev/null

    # Set name
    curl -s -X POST "$BACKEND_URL/api/analyze/workflows/create/$WORKFLOW_ID/name" \
      -H "Content-Type: application/json" \
      -d '{"name": "Test Workflow for Assignment"}' > /dev/null

    # Save workflow
    curl -s -X POST "$BACKEND_URL/api/analyze/workflows/create/$WORKFLOW_ID/review" \
      -H "Content-Type: application/json" \
      -d '{}' > /dev/null

    echo "${GREEN}✅ Test workflow created${NC}"
    echo ""

    # Refresh workflow list
    WORKFLOWS_RESPONSE=$(curl -s "$BACKEND_URL/api/workflows/saved")
fi

echo "Step 2: Get first workflow ID for testing..."
FIRST_WORKFLOW=$(echo "$WORKFLOWS_RESPONSE" | python3 -c "
import json, sys
data = json.load(sys.stdin)
if data:
    print(json.dumps({'id': data[0]['id'], 'name': data[0]['name']}))
else:
    print('{}')
")

WORKFLOW_ID=$(echo "$FIRST_WORKFLOW" | python3 -c "import json,sys; data=json.load(sys.stdin); print(data.get('id', ''))")
WORKFLOW_NAME=$(echo "$FIRST_WORKFLOW" | python3 -c "import json,sys; data=json.load(sys.stdin); print(data.get('name', ''))")

if [ -z "$WORKFLOW_ID" ]; then
    echo "${RED}❌ No workflows available for testing${NC}"
    exit 1
fi

echo "Using workflow: $WORKFLOW_NAME (ID: $WORKFLOW_ID)"
echo ""

echo "Step 3: Check available documents..."
DOCS_RESPONSE=$(curl -s "$BACKEND_URL/api/documents")
echo "Documents response: $DOCS_RESPONSE"
echo ""

DOC_COUNT=$(echo "$DOCS_RESPONSE" | python3 -c "import json,sys; data=json.load(sys.stdin); print(len(data))" 2>/dev/null || echo "0")
echo "Found $DOC_COUNT documents"
echo ""

if [ "$DOC_COUNT" -eq "0" ]; then
    echo "${RED}❌ No documents available for testing${NC}"
    echo "Please upload a document first through the UI"
    exit 1
fi

# Get first document ID
FIRST_DOC=$(echo "$DOCS_RESPONSE" | python3 -c "
import json, sys
data = json.load(sys.stdin)
if data:
    print(json.dumps({'id': data[0]['id'], 'name': data[0]['name']}))
else:
    print('{}')
")

DOC_ID=$(echo "$FIRST_DOC" | python3 -c "import json,sys; data=json.load(sys.stdin); print(data.get('id', ''))")
DOC_NAME=$(echo "$FIRST_DOC" | python3 -c "import json,sys; data=json.load(sys.stdin); print(data.get('name', ''))")

echo "Using document: $DOC_NAME (ID: $DOC_ID)"
echo ""

echo "Step 4: Test GET /api/documents/{document_id}/workflows (before assignment)..."
BEFORE_WORKFLOWS=$(curl -s "$BACKEND_URL/api/documents/$DOC_ID/workflows")
echo "Current workflows: $BEFORE_WORKFLOWS"
echo ""

echo "Step 5: Test PUT /api/documents/{document_id}/workflows (assign workflow)..."
ASSIGN_RESPONSE=$(curl -s -X PUT "$BACKEND_URL/api/documents/$DOC_ID/workflows" \
  -H "Content-Type: application/json" \
  -d "{\"workflowIds\": [\"$WORKFLOW_ID\"]}")

echo "Assignment response: $ASSIGN_RESPONSE"
echo ""

# Check if assignment was successful
SUCCESS=$(echo "$ASSIGN_RESPONSE" | python3 -c "import json,sys; data=json.load(sys.stdin); print(data.get('success', False))")

if [ "$SUCCESS" == "True" ]; then
    echo "${GREEN}✅ Workflow assigned successfully${NC}"
else
    echo "${RED}❌ Workflow assignment failed${NC}"
    exit 1
fi
echo ""

echo "Step 6: Test GET /api/documents/{document_id}/workflows (after assignment)..."
AFTER_WORKFLOWS=$(curl -s "$BACKEND_URL/api/documents/$DOC_ID/workflows")
echo "Updated workflows: $AFTER_WORKFLOWS"
echo ""

# Verify the workflow was assigned
ASSIGNED_COUNT=$(echo "$AFTER_WORKFLOWS" | python3 -c "import json,sys; data=json.load(sys.stdin); print(len(data.get('workflowIds', [])))")

if [ "$ASSIGNED_COUNT" -gt "0" ]; then
    echo "${GREEN}✅ Workflow appears in document workflows${NC}"
else
    echo "${RED}❌ Workflow not found in document workflows${NC}"
    exit 1
fi
echo ""

echo "Step 7: Test GET /api/documents (verify workflow info in documents list)..."
UPDATED_DOCS=$(curl -s "$BACKEND_URL/api/documents")
DOC_WITH_WORKFLOWS=$(echo "$UPDATED_DOCS" | python3 -c "
import json, sys
data = json.load(sys.stdin)
doc = next((d for d in data if d['id'] == '$DOC_ID'), None)
if doc:
    print(json.dumps({'workflows': doc.get('workflows', []), 'workflowNames': doc.get('workflowNames', [])}))
else:
    print('{}')
")

echo "Document workflow info: $DOC_WITH_WORKFLOWS"
echo ""

HAS_WORKFLOWS=$(echo "$DOC_WITH_WORKFLOWS" | python3 -c "import json,sys; data=json.load(sys.stdin); print(len(data.get('workflows', [])) > 0)")

if [ "$HAS_WORKFLOWS" == "True" ]; then
    echo "${GREEN}✅ Document list includes workflow information${NC}"
else
    echo "${RED}❌ Document list missing workflow information${NC}"
    exit 1
fi
echo ""

echo "Step 8: Test workflow removal..."
REMOVE_RESPONSE=$(curl -s -X PUT "$BACKEND_URL/api/documents/$DOC_ID/workflows" \
  -H "Content-Type: application/json" \
  -d '{"workflowIds": []}')

echo "Removal response: $REMOVE_RESPONSE"
echo ""

# Verify removal
AFTER_REMOVAL=$(curl -s "$BACKEND_URL/api/documents/$DOC_ID/workflows")
REMOVAL_COUNT=$(echo "$AFTER_REMOVAL" | python3 -c "import json,sys; data=json.load(sys.stdin); print(len(data.get('workflowIds', [])))")

if [ "$REMOVAL_COUNT" -eq "0" ]; then
    echo "${GREEN}✅ Workflows removed successfully${NC}"
else
    echo "${RED}❌ Workflows not removed${NC}"
    exit 1
fi
echo ""

echo "Step 9: Re-assign workflow for frontend testing..."
curl -s -X PUT "$BACKEND_URL/api/documents/$DOC_ID/workflows" \
  -H "Content-Type: application/json" \
  -d "{\"workflowIds\": [\"$WORKFLOW_ID\"]}" > /dev/null

echo "${GREEN}✅ Workflow re-assigned for frontend testing${NC}"
echo ""

echo "======================================"
echo "${GREEN}ALL TESTS PASSED ✅${NC}"
echo "======================================"
echo ""
echo "Summary:"
echo "  • Backend API endpoints working correctly"
echo "  • Workflow assignment persists to database"
echo "  • Document list includes workflow information"
echo "  • Workflow removal works correctly"
echo ""
echo "Next steps:"
echo "  1. Open http://app.omegaintelligence.ai/ in browser"
echo "  2. Check documents page - should show '$WORKFLOW_NAME' under Workflows column"
echo "  3. Click on '$DOC_NAME' to open detail page"
echo "  4. Verify workflow dropdown shows only '$WORKFLOW_NAME'"
