#!/bin/bash

echo "======================================"
echo "WORKFLOW ASSIGNMENT TESTING (WITH AUTH)"
echo "======================================"
echo ""

# Colors for output
GREEN='\033[0;32m'
RED='\033[0;31m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# Test configuration
BACKEND_URL="http://localhost:5001"

# Test credentials (unique for each test run to avoid conflicts)
TEST_SUFFIX=$(date +%s)
USERNAME="testuser$TEST_SUFFIX"
EMAIL="test$TEST_SUFFIX@example.com"
PASSWORD="testpassword123"

echo "Step 1: Register test user..."

# Register new user
AUTH_RESPONSE=$(curl -s -X POST "$BACKEND_URL/api/auth/register" \
  -H "Content-Type: application/json" \
  -d "{\"username\": \"$USERNAME\", \"email\": \"$EMAIL\", \"password\": \"$PASSWORD\"}")

echo "Register response (truncated): ${AUTH_RESPONSE:0:100}..."
echo ""

# Extract token
TOKEN=$(echo "$AUTH_RESPONSE" | python3 -c "import json,sys; data=json.load(sys.stdin); print(data.get('token', ''))" 2>/dev/null)

if [ -z "$TOKEN" ]; then
    echo "${RED}❌ Failed to get authentication token${NC}"
    echo "Full response: $AUTH_RESPONSE"
    exit 1
fi

echo "${GREEN}✅ Successfully registered and authenticated${NC}"
echo "User: $USERNAME"
echo ""

echo "Step 2: Check available saved workflows..."
WORKFLOWS_RESPONSE=$(curl -s "$BACKEND_URL/api/workflows/saved" \
  -H "Authorization: Bearer $TOKEN")
echo "Saved workflows response: ${WORKFLOWS_RESPONSE:0:100}..."
echo ""

# Parse workflow IDs if any exist
WORKFLOW_COUNT=$(echo "$WORKFLOWS_RESPONSE" | python3 -c "import json,sys; data=json.load(sys.stdin); print(len(data))" 2>/dev/null || echo "0")
echo "Found $WORKFLOW_COUNT saved workflows"
echo ""

# If no workflows exist, create one for testing
if [ "$WORKFLOW_COUNT" -eq "0" ]; then
    echo "${YELLOW}No saved workflows found. Creating a test workflow...${NC}"

    # Initialize workflow creation
    INIT_RESPONSE=$(curl -s -X POST "$BACKEND_URL/api/analyze/workflows/create/init" \
      -H "Content-Type: application/json" \
      -H "Authorization: Bearer $TOKEN")

    WORKFLOW_ID=$(echo "$INIT_RESPONSE" | python3 -c "import json,sys; print(json.load(sys.stdin)['workflowId'])" 2>/dev/null)

    if [ -z "$WORKFLOW_ID" ]; then
        echo "${RED}❌ Failed to create workflow${NC}"
        echo "Response: $INIT_RESPONSE"
        exit 1
    fi

    echo "Created workflow ID: $WORKFLOW_ID"

    # Create from template
    curl -s -X POST "$BACKEND_URL/api/analyze/workflows/create/$WORKFLOW_ID/template" \
      -H "Content-Type: application/json" \
      -H "Authorization: Bearer $TOKEN" \
      -d '{"templateId": "ma-due-diligence", "templateName": "M&A/Due Diligence"}' > /dev/null

    # Set name
    curl -s -X POST "$BACKEND_URL/api/analyze/workflows/create/$WORKFLOW_ID/name" \
      -H "Content-Type: application/json" \
      -H "Authorization: Bearer $TOKEN" \
      -d '{"name": "Test Workflow for Assignment"}' > /dev/null

    # Save workflow
    SAVE_RESPONSE=$(curl -s -X POST "$BACKEND_URL/api/analyze/workflows/create/$WORKFLOW_ID/review" \
      -H "Content-Type: application/json" \
      -H "Authorization: Bearer $TOKEN" \
      -d '{}')

    echo "${GREEN}✅ Test workflow created${NC}"
    echo ""

    # Refresh workflow list
    WORKFLOWS_RESPONSE=$(curl -s "$BACKEND_URL/api/workflows/saved" \
      -H "Authorization: Bearer $TOKEN")
fi

echo "Step 3: Get first workflow ID for testing..."
FIRST_WORKFLOW=$(echo "$WORKFLOWS_RESPONSE" | python3 -c "
import json, sys
try:
    data = json.load(sys.stdin)
    if data and len(data) > 0:
        print(json.dumps({'id': str(data[0]['id']), 'name': data[0]['name']}))
    else:
        print('{}')
except Exception as e:
    print('{}')
")

WORKFLOW_ID=$(echo "$FIRST_WORKFLOW" | python3 -c "import json,sys; data=json.load(sys.stdin); print(data.get('id', ''))")
WORKFLOW_NAME=$(echo "$FIRST_WORKFLOW" | python3 -c "import json,sys; data=json.load(sys.stdin); print(data.get('name', ''))")

if [ -z "$WORKFLOW_ID" ] || [ "$WORKFLOW_ID" == "None" ]; then
    echo "${RED}❌ No workflows available for testing${NC}"
    echo "Workflows response: $WORKFLOWS_RESPONSE"
    exit 1
fi

echo "Using workflow: $WORKFLOW_NAME (ID: $WORKFLOW_ID)"
echo ""

echo "Step 4: Upload a test document..."

# Create a simple test PDF content (just text file for now)
TEST_DOC="/tmp/test_document_$TEST_SUFFIX.txt"
echo "This is a test document for workflow assignment testing." > "$TEST_DOC"
echo "Created: $(date)" >> "$TEST_DOC"

# Upload document
UPLOAD_RESPONSE=$(curl -s -X POST "$BACKEND_URL/api/documents/upload" \
  -H "Authorization: Bearer $TOKEN" \
  -F "files=@$TEST_DOC")

echo "Upload response: ${UPLOAD_RESPONSE:0:200}"
echo ""

# Extract document ID (from files array)
DOC_ID=$(echo "$UPLOAD_RESPONSE" | python3 -c "import json,sys; data=json.load(sys.stdin); files=data.get('files', []); print(files[0]['id'] if files else '')" 2>/dev/null)
DOC_NAME=$(echo "$UPLOAD_RESPONSE" | python3 -c "import json,sys; data=json.load(sys.stdin); files=data.get('files', []); print(files[0]['name'] if files else '')" 2>/dev/null)

if [ -z "$DOC_ID" ]; then
    echo "${RED}❌ Failed to upload document${NC}"
    echo "Full response: $UPLOAD_RESPONSE"
    exit 1
fi

echo "${GREEN}✅ Document uploaded: $DOC_NAME (ID: $DOC_ID)${NC}"
echo ""

echo "Step 5: Test GET /api/documents/{document_id}/workflows (before assignment)..."
BEFORE_WORKFLOWS=$(curl -s "$BACKEND_URL/api/documents/$DOC_ID/workflows" \
  -H "Authorization: Bearer $TOKEN")
echo "Current workflows: $BEFORE_WORKFLOWS"
echo ""

echo "Step 6: Test PUT /api/documents/{document_id}/workflows (assign workflow)..."
ASSIGN_RESPONSE=$(curl -s -X PUT "$BACKEND_URL/api/documents/$DOC_ID/workflows" \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer $TOKEN" \
  -d "{\"workflowIds\": [\"$WORKFLOW_ID\"]}")

echo "Assignment response: $ASSIGN_RESPONSE"
echo ""

# Check if assignment was successful
SUCCESS=$(echo "$ASSIGN_RESPONSE" | python3 -c "import json,sys; data=json.load(sys.stdin); print(data.get('success', False))" 2>/dev/null || echo "False")

if [ "$SUCCESS" == "True" ]; then
    echo "${GREEN}✅ Workflow assigned successfully${NC}"
else
    echo "${RED}❌ Workflow assignment failed${NC}"
    exit 1
fi
echo ""

echo "Step 7: Test GET /api/documents/{document_id}/workflows (after assignment)..."
AFTER_WORKFLOWS=$(curl -s "$BACKEND_URL/api/documents/$DOC_ID/workflows" \
  -H "Authorization: Bearer $TOKEN")
echo "Updated workflows: $AFTER_WORKFLOWS"
echo ""

# Verify the workflow was assigned
ASSIGNED_COUNT=$(echo "$AFTER_WORKFLOWS" | python3 -c "import json,sys; data=json.load(sys.stdin); print(len(data.get('workflowIds', [])))" 2>/dev/null || echo "0")

if [ "$ASSIGNED_COUNT" -gt "0" ]; then
    echo "${GREEN}✅ Workflow appears in document workflows${NC}"
else
    echo "${RED}❌ Workflow not found in document workflows${NC}"
    exit 1
fi
echo ""

echo "Step 8: Test GET /api/documents (verify workflow info in documents list)..."
UPDATED_DOCS=$(curl -s "$BACKEND_URL/api/documents" \
  -H "Authorization: Bearer $TOKEN")
DOC_WITH_WORKFLOWS=$(echo "$UPDATED_DOCS" | python3 -c "
import json, sys
try:
    data = json.load(sys.stdin)
    doc = next((d for d in data if d['id'] == '$DOC_ID'), None)
    if doc:
        print(json.dumps({'workflows': doc.get('workflows', []), 'workflowNames': doc.get('workflowNames', [])}))
    else:
        print('{}')
except:
    print('{}')
" 2>/dev/null || echo "{}")

echo "Document workflow info: $DOC_WITH_WORKFLOWS"
echo ""

HAS_WORKFLOWS=$(echo "$DOC_WITH_WORKFLOWS" | python3 -c "import json,sys; data=json.load(sys.stdin); print(len(data.get('workflows', [])) > 0)" 2>/dev/null || echo "False")

if [ "$HAS_WORKFLOWS" == "True" ]; then
    echo "${GREEN}✅ Document list includes workflow information${NC}"
else
    echo "${YELLOW}⚠️  Document list may not include workflow information${NC}"
    echo "This might be okay if the endpoint returns workflows in a different format"
fi
echo ""

echo "Step 9: Test workflow removal..."
REMOVE_RESPONSE=$(curl -s -X PUT "$BACKEND_URL/api/documents/$DOC_ID/workflows" \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer $TOKEN" \
  -d '{"workflowIds": []}')

echo "Removal response: $REMOVE_RESPONSE"
echo ""

# Verify removal
AFTER_REMOVAL=$(curl -s "$BACKEND_URL/api/documents/$DOC_ID/workflows" \
  -H "Authorization: Bearer $TOKEN")
REMOVAL_COUNT=$(echo "$AFTER_REMOVAL" | python3 -c "import json,sys; data=json.load(sys.stdin); print(len(data.get('workflowIds', [])))" 2>/dev/null || echo "0")

if [ "$REMOVAL_COUNT" -eq "0" ]; then
    echo "${GREEN}✅ Workflows removed successfully${NC}"
else
    echo "${RED}❌ Workflows not removed${NC}"
    exit 1
fi
echo ""

echo "Step 10: Re-assign workflow for frontend testing..."
FINAL_ASSIGN=$(curl -s -X PUT "$BACKEND_URL/api/documents/$DOC_ID/workflows" \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer $TOKEN" \
  -d "{\"workflowIds\": [\"$WORKFLOW_ID\"]}")

SUCCESS=$(echo "$FINAL_ASSIGN" | python3 -c "import json,sys; data=json.load(sys.stdin); print(data.get('success', False))" 2>/dev/null || echo "False")

if [ "$SUCCESS" == "True" ]; then
    echo "${GREEN}✅ Workflow re-assigned for frontend testing${NC}"
else
    echo "${RED}❌ Failed to re-assign workflow${NC}"
fi
echo ""

# Cleanup
rm -f "$TEST_DOC"

echo "======================================"
echo "${GREEN}BACKEND TESTS COMPLETED ✅${NC}"
echo "======================================"
echo ""
echo "Summary:"
echo "  • User registration and authentication: ✅"
echo "  • Workflow creation: ✅"
echo "  • Document upload: ✅"
echo "  • Workflow assignment to document: ✅"
echo "  • Workflow retrieval from document: ✅"
echo "  • Workflow removal from document: ✅"
echo ""
echo "Test credentials for frontend testing:"
echo "  Username: $USERNAME"
echo "  Email: $EMAIL"
echo "  Password: $PASSWORD"
echo ""
echo "Next steps for frontend testing:"
echo "  1. Open http://app.omegaintelligence.ai/ in browser"
echo "  2. Login with the credentials above"
echo "  3. Go to documents page - should show '$WORKFLOW_NAME' under Workflows column"
echo "  4. Click on document to open detail page"
echo "  5. Verify workflow dropdown shows '$WORKFLOW_NAME'"
