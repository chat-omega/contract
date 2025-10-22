#\!/bin/bash
echo "======================================"
echo "Testing M&A Template Frontend Display"
echo "======================================"

# Create workflow
WORKFLOW_ID=$(curl -s -X POST http://localhost:5001/api/analyze/workflows/create/init \
  -H "Content-Type: application/json" | python3 -c "import json,sys; print(json.load(sys.stdin)['workflowId'])")

# Apply M&A template
curl -s -X POST "http://localhost:5001/api/analyze/workflows/create/$WORKFLOW_ID/template" \
  -H "Content-Type: application/json" \
  -d '{"templateId": "ma-due-diligence", "templateName": "M&A/Due Diligence"}' > /dev/null

# Get the workflow state
echo "Checking workflow data structure:"
curl -s http://localhost:5001/api/analyze/workflows/create/$WORKFLOW_ID | python3 -c "
import json, sys
data = json.load(sys.stdin)

print('✓ Name:', data.get('name', 'MISSING'))
print('✓ Description:', data.get('description', 'MISSING')[:50] + '...')
print('✓ Current Step:', data.get('currentStep', 'MISSING'))

# Check fields
fields = data.get('fields', {})
if fields:
    print('✓ Fields Categories:', list(fields.keys()))
    total_fields = sum(len(f) for f in fields.values())
    print('  Total fields:', total_fields)

# Check scoring
scoring = data.get('scoringProfiles', {})
if scoring:
    print('✓ Scoring Profiles:', list(scoring.keys()))
    
# Check doc types
doc_types = data.get('documentTypes', [])
print('✓ Document Types:', len(doc_types), 'types')
"

echo ""
echo "======================================"
echo "Frontend should display all this data"
echo "at http://localhost:3000"
echo "======================================"
