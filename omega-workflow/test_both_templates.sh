#!/bin/bash
echo "============================================"
echo "Testing Both M&A and LeaseLens Templates"
echo "============================================"

# Clear any existing saved workflows
echo "1. Clearing existing workflows..."
curl -s http://localhost:5001/api/workflows/saved | python3 -c "
import json, sys, subprocess
workflows = json.load(sys.stdin)
for wf in workflows:
    subprocess.run(['curl', '-s', '-X', 'DELETE', f'http://localhost:5001/api/workflows/saved/{wf[\"id\"]}'], capture_output=True)
print(f'   Cleared {len(workflows)} existing workflow(s)')
"

# Test M&A template
echo ""
echo "2. Creating M&A/Due Diligence workflow..."
MA_WORKFLOW_ID=$(curl -s -X POST http://localhost:5001/api/analyze/workflows/create/init \
  -H "Content-Type: application/json" | python3 -c "import json,sys; print(json.load(sys.stdin)['workflowId'])")

curl -s -X POST "http://localhost:5001/api/analyze/workflows/create/$MA_WORKFLOW_ID/template" \
  -H "Content-Type: application/json" \
  -d '{"templateId": "ma-due-diligence", "templateName": "M&A/Due Diligence"}' > /dev/null

curl -s -X POST "http://localhost:5001/api/analyze/workflows/create/$MA_WORKFLOW_ID/name" \
  -H "Content-Type: application/json" \
  -d '{"name": "M&A Due Diligence Review"}' > /dev/null

MA_RESULT=$(curl -s -X POST "http://localhost:5001/api/analyze/workflows/create/$MA_WORKFLOW_ID/review" \
  -H "Content-Type: application/json" \
  -d '{}')
echo "   M&A workflow saved"

# Test LeaseLens template
echo ""
echo "3. Creating LeaseLens - Short Form workflow..."
LEASE_WORKFLOW_ID=$(curl -s -X POST http://localhost:5001/api/analyze/workflows/create/init \
  -H "Content-Type: application/json" | python3 -c "import json,sys; print(json.load(sys.stdin)['workflowId'])")

curl -s -X POST "http://localhost:5001/api/analyze/workflows/create/$LEASE_WORKFLOW_ID/template" \
  -H "Content-Type: application/json" \
  -d '{"templateId": "leaselens-short", "templateName": "LeaseLens - Short Form"}' > /dev/null

curl -s -X POST "http://localhost:5001/api/analyze/workflows/create/$LEASE_WORKFLOW_ID/name" \
  -H "Content-Type: application/json" \
  -d '{"name": "Commercial Lease Analysis"}' > /dev/null

LEASE_RESULT=$(curl -s -X POST "http://localhost:5001/api/analyze/workflows/create/$LEASE_WORKFLOW_ID/review" \
  -H "Content-Type: application/json" \
  -d '{}')
echo "   LeaseLens workflow saved"

# Display saved workflows
echo ""
echo "4. Checking saved workflows:"
echo "============================"
curl -s http://localhost:5001/api/workflows/saved | python3 -c "
import json, sys
workflows = json.load(sys.stdin)
for wf in workflows:
    print(f\"✓ {wf['name']}\")
    fields = wf.get('fields', {})
    if isinstance(fields, dict):
        total = sum(len(f) for f in fields.values())
        print(f'  - Categories: {len(fields)}')
        print(f'  - Total Fields: {total}')
    elif isinstance(fields, list):
        print(f'  - Fields: {len(fields)}')
    
    doc_types = wf.get('documentTypes', [])
    print(f'  - Document Types: {len(doc_types)}')
    
    scoring = wf.get('scoringProfiles', {})
    if scoring:
        print(f'  - Scoring Profiles: {len(scoring)}')
    print()
"

echo "============================================"
echo "Test complete! Both templates created."
echo "You can verify in the browser at:"
echo "http://localhost:3000"
echo "============================================"