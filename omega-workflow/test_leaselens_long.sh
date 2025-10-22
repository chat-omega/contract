#!/bin/bash
echo "============================================"
echo "Testing LeaseLens - Long Form Template"
echo "============================================"

# Step 1: Initialize workflow
WORKFLOW_ID=$(curl -s -X POST http://localhost:5001/api/analyze/workflows/create/init \
  -H "Content-Type: application/json" | python3 -c "import json,sys; print(json.load(sys.stdin)['workflowId'])")
echo "1. Workflow initialized: $WORKFLOW_ID"

# Step 2: Apply LeaseLens Long Form template
curl -s -X POST "http://localhost:5001/api/analyze/workflows/create/$WORKFLOW_ID/template" \
  -H "Content-Type: application/json" \
  -d '{"templateId": "leaselens-long", "templateName": "LeaseLens - Long Form"}' > /dev/null
echo "2. LeaseLens - Long Form template applied"

# Step 3: Get and display workflow structure
echo ""
echo "3. Checking workflow data structure:"
echo "===================================="
curl -s http://localhost:5001/api/analyze/workflows/create/$WORKFLOW_ID | python3 -c "
import json, sys
data = json.load(sys.stdin)

print('✓ Name:', data.get('name', 'MISSING'))
print('✓ Description:', data.get('description', 'MISSING'))
print('✓ Current Step:', data.get('currentStep', 'MISSING'))

# Check fields
fields = data.get('fields', {})
if fields:
    print('\n✓ Fields by Category:')
    for category, field_list in fields.items():
        print(f'  {category}: {len(field_list)} fields')
    
    total_fields = sum(len(f) for f in fields.values())
    print(f'\n  Total fields: {total_fields}')
    
    # Show some sample fields from each category
    print('\n✓ Sample fields from each category:')
    for category, field_list in fields.items():
        print(f'  {category}:')
        for field in field_list[:2]:
            print(f'    - {field}')

# Check doc types
doc_types = data.get('documentTypes', [])
print('\n✓ Document Types:', ', '.join(doc_types) if doc_types else 'MISSING')

# Check scoring profiles (should be empty for LeaseLens)
scoring = data.get('scoringProfiles', {})
print('✓ Scoring Profiles:', 'None (as expected)' if not scoring else list(scoring.keys()))
"

echo ""
echo "============================================"
echo "LeaseLens - Long Form template test complete!"
echo "Check http://localhost:3000 to verify"
echo "the template displays correctly."
echo "============================================"