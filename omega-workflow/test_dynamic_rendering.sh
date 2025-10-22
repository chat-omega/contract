#!/bin/bash

# Test script for dynamic workflow field rendering
# This tests the complete flow from user registration to viewing extraction results

set -e

BASE_URL="http://localhost:5001"
FRONTEND_URL="http://localhost:3000"

echo "=================================================="
echo "Dynamic Workflow Rendering Test"
echo "=================================================="
echo ""

# Generate unique test credentials
TIMESTAMP=$(date +%s)
TEST_USER="testuser${TIMESTAMP}"
TEST_EMAIL="test${TIMESTAMP}@example.com"
TEST_PASSWORD="testpassword123"

echo "Test credentials:"
echo "  Username: ${TEST_USER}"
echo "  Email: ${TEST_EMAIL}"
echo ""

# Step 1: Register user
echo "Step 1: Registering test user..."
REGISTER_RESPONSE=$(curl -s -X POST "${BASE_URL}/api/auth/register" \
  -H "Content-Type: application/json" \
  -d "{
    \"username\": \"${TEST_USER}\",
    \"email\": \"${TEST_EMAIL}\",
    \"password\": \"${TEST_PASSWORD}\"
  }")

echo "Registration response: ${REGISTER_RESPONSE}"

# Extract token
TOKEN=$(echo "${REGISTER_RESPONSE}" | python3 -c "import sys, json; print(json.load(sys.stdin)['token'])" 2>/dev/null || echo "")

if [ -z "$TOKEN" ]; then
    echo "❌ Failed to register user or extract token"
    exit 1
fi

echo "✅ User registered successfully"
echo "   Token: ${TOKEN:0:20}..."
echo ""

# Step 2: Create a workflow with grouped fields
echo "Step 2: Creating workflow with grouped fields..."

# Initialize workflow
WORKFLOW_INIT=$(curl -s -X POST "${BASE_URL}/api/workflows/new" \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer ${TOKEN}")

WORKFLOW_ID=$(echo "${WORKFLOW_INIT}" | python3 -c "import sys, json; print(json.load(sys.stdin)['workflow']['id'])" 2>/dev/null || echo "")

if [ -z "$WORKFLOW_ID" ]; then
    echo "❌ Failed to initialize workflow"
    exit 1
fi

echo "✅ Workflow initialized: ${WORKFLOW_ID}"

# Add workflow name
curl -s -X POST "${BASE_URL}/api/workflows/${WORKFLOW_ID}" \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer ${TOKEN}" \
  -d "{
    \"step\": \"name\",
    \"name\": \"Test Dynamic Workflow ${TIMESTAMP}\"
  }" > /dev/null

# Add grouped fields
curl -s -X POST "${BASE_URL}/api/workflows/${WORKFLOW_ID}" \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer ${TOKEN}" \
  -d '{
    "step": "fields",
    "fields": {
      "Basic Information": [
        {"name": "Title", "fieldId": "dc.title"},
        {"name": "Parties", "fieldId": "dc.parties"},
        {"name": "Effective Date", "fieldId": "dc.effective_date"}
      ],
      "Financial Terms": [
        {"name": "Total Amount", "fieldId": "dc.total_amount"},
        {"name": "Payment Terms", "fieldId": "dc.payment_terms"}
      ],
      "Term and Termination": [
        {"name": "Term", "fieldId": "dc.term"},
        {"name": "Termination Notice Period", "fieldId": "dc.termination_notice"}
      ]
    }
  }' > /dev/null

# Add details
curl -s -X POST "${BASE_URL}/api/workflows/${WORKFLOW_ID}" \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer ${TOKEN}" \
  -d '{
    "step": "details",
    "description": "Test workflow for dynamic rendering",
    "documentTypes": ["Contract", "Credit & Loan Agt"]
  }' > /dev/null

# Save workflow (finalize)
SAVE_RESPONSE=$(curl -s -X POST "${BASE_URL}/api/workflows/${WORKFLOW_ID}" \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer ${TOKEN}" \
  -d '{"step": "review"}')

SAVED_WORKFLOW_ID=$(echo "${SAVE_RESPONSE}" | python3 -c "import sys, json; print(json.load(sys.stdin)['workflow']['id'])" 2>/dev/null || echo "")

if [ -z "$SAVED_WORKFLOW_ID" ]; then
    echo "❌ Failed to save workflow"
    exit 1
fi

echo "✅ Workflow saved: ${SAVED_WORKFLOW_ID}"
echo ""

# Step 3: Upload a test document
echo "Step 3: Uploading test document..."

# Create a simple test PDF
TEST_PDF="/tmp/test_doc_${TIMESTAMP}.pdf"
echo "%PDF-1.4
1 0 obj<</Type/Catalog/Pages 2 0 R>>endobj
2 0 obj<</Type/Pages/Count 1/Kids[3 0 R]>>endobj
3 0 obj<</Type/Page/Parent 2 0 R/MediaBox[0 0 612 792]/Resources<</Font<</F1 4 0 R>>>>/Contents 5 0 R>>endobj
4 0 obj<</Type/Font/Subtype/Type1/BaseFont/Helvetica>>endobj
5 0 obj<</Length 44>>stream
BT
/F1 12 Tf
100 700 Td
(Test Document) Tj
ET
endstream
endobj
xref
0 6
0000000000 65535 f
0000000009 00000 n
0000000058 00000 n
0000000115 00000 n
0000000245 00000 n
0000000322 00000 n
trailer<</Size 6/Root 1 0 R>>
startxref
414
%%EOF" > "${TEST_PDF}"

# Upload document
UPLOAD_RESPONSE=$(curl -s -X POST "${BASE_URL}/api/documents/upload" \
  -H "Authorization: Bearer ${TOKEN}" \
  -F "file=@${TEST_PDF}")

DOC_ID=$(echo "${UPLOAD_RESPONSE}" | python3 -c "import sys, json; print(json.load(sys.stdin)['documents'][0]['id'])" 2>/dev/null || echo "")

if [ -z "$DOC_ID" ]; then
    echo "❌ Failed to upload document"
    exit 1
fi

echo "✅ Document uploaded: ${DOC_ID}"
echo ""

# Step 4: Assign workflow to document
echo "Step 4: Assigning workflow to document..."

ASSIGN_RESPONSE=$(curl -s -X PUT "${BASE_URL}/api/documents/${DOC_ID}/workflows" \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer ${TOKEN}" \
  -d "{\"workflowIds\": [\"${SAVED_WORKFLOW_ID}\"]}")

echo "Assignment response: ${ASSIGN_RESPONSE}"
echo "✅ Workflow assigned to document"
echo ""

# Step 5: Verify workflow retrieval
echo "Step 5: Verifying workflow retrieval..."

WORKFLOWS_RESPONSE=$(curl -s -X GET "${BASE_URL}/api/documents/${DOC_ID}/workflows")
echo "Workflows for document: ${WORKFLOWS_RESPONSE}"

RETRIEVED_WORKFLOW_ID=$(echo "${WORKFLOWS_RESPONSE}" | python3 -c "import sys, json; data=json.load(sys.stdin); print(data['workflowIds'][0] if data['workflowIds'] else '')" 2>/dev/null || echo "")

if [ "$RETRIEVED_WORKFLOW_ID" != "$SAVED_WORKFLOW_ID" ]; then
    echo "❌ Workflow ID mismatch"
    exit 1
fi

echo "✅ Workflow retrieval successful"
echo ""

# Step 6: Verify workflow details endpoint
echo "Step 6: Verifying workflow details endpoint..."

WORKFLOW_DETAILS=$(curl -s -X GET "${BASE_URL}/api/workflows/saved" \
  -H "Authorization: Bearer ${TOKEN}")

echo "Workflow details (first 500 chars):"
echo "${WORKFLOW_DETAILS}" | head -c 500
echo "..."
echo ""

# Check if the workflow has the correct structure
HAS_GROUPED_FIELDS=$(echo "${WORKFLOW_DETAILS}" | python3 -c "
import sys, json
data = json.load(sys.stdin)
for wf in data:
    if wf['id'] == '${SAVED_WORKFLOW_ID}':
        fields = wf.get('fields', {})
        if isinstance(fields, dict) and 'Basic Information' in fields:
            print('true')
            sys.exit(0)
print('false')
" 2>/dev/null || echo "false")

if [ "$HAS_GROUPED_FIELDS" != "true" ]; then
    echo "❌ Workflow fields not properly grouped"
    exit 1
fi

echo "✅ Workflow has grouped fields structure"
echo ""

# Step 7: Check frontend files
echo "Step 7: Verifying frontend deployment..."

# Check HTML
HTML_CHECK=$(curl -s "${FRONTEND_URL}/document-detail.html" | grep -c "extracted-terms-container" || echo "0")
if [ "$HTML_CHECK" -eq "0" ]; then
    echo "❌ Frontend HTML not updated"
    exit 1
fi

echo "✅ Frontend HTML deployed correctly"

# Check JavaScript
JS_CHECK=$(curl -s "${FRONTEND_URL}/js/document-detail.js" | grep -c "renderWorkflowFields" || echo "0")
if [ "$JS_CHECK" -eq "0" ]; then
    echo "❌ Frontend JavaScript not updated"
    exit 1
fi

echo "✅ Frontend JavaScript deployed correctly"
echo ""

# Step 8: Summary
echo "=================================================="
echo "Test Summary"
echo "=================================================="
echo ""
echo "✅ All backend API tests passed"
echo "✅ Frontend files deployed correctly"
echo ""
echo "Test document created:"
echo "  Document ID: ${DOC_ID}"
echo "  Workflow ID: ${SAVED_WORKFLOW_ID}"
echo "  Workflow Name: Test Dynamic Workflow ${TIMESTAMP}"
echo ""
echo "To test in browser:"
echo "  1. Login with: ${TEST_USER} / ${TEST_PASSWORD}"
echo "  2. Navigate to: ${FRONTEND_URL}/document-detail.html?id=${DOC_ID}"
echo "  3. Verify that:"
echo "     - Categories are dynamically rendered (Basic Information, Financial Terms, etc.)"
echo "     - Fields are shown with 'Extracting...' initially"
echo "     - Workflow dropdown shows 'Test Dynamic Workflow ${TIMESTAMP}'"
echo ""
echo "Expected behavior:"
echo "  - No hardcoded dummy data"
echo "  - Categories created from workflow.fields structure"
echo "  - Each field shows as a term item with placeholder text"
echo "  - Extraction results populate when available"
echo ""

# Cleanup
rm -f "${TEST_PDF}"

echo "Test completed successfully!"
