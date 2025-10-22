#\!/bin/bash
echo "Testing Employment Agreements Template"
echo "======================================"

# Initialize workflow
WORKFLOW_ID=$(curl -s -X POST http://localhost:5001/api/analyze/workflows/create/init \
  -H "Content-Type: application/json" | python3 -c "import json,sys; print(json.load(sys.stdin)['workflowId'])")
echo "Workflow ID: $WORKFLOW_ID"

# Apply Employment Agreements template
curl -s -X POST "http://localhost:5001/api/analyze/workflows/create/$WORKFLOW_ID/template" \
  -H "Content-Type: application/json" \
  -d '{"templateId": "employment-agreements", "templateName": "Employment Agreements"}' > /dev/null

# Get and display workflow info
curl -s http://localhost:5001/api/analyze/workflows/create/$WORKFLOW_ID | python3 -c "
import json, sys
data = json.load(sys.stdin)

print(f'✓ Name: {data.get(\"name\", \"MISSING\")}')
print(f'✓ Description: {data.get(\"description\", \"MISSING\")}')

# Check fields
fields = data.get('fields', {})
if fields:
    print('\n✓ Fields by Category:')
    total = 0
    for category, field_list in fields.items():
        print(f'  {category}: {len(field_list)} fields')
        total += len(field_list)
    print(f'\nTotal Fields: {total}')
    
    print('\n✓ Sample fields:')
    for category, field_list in fields.items():
        print(f'  {category}:')
        for field in field_list[:2]:
            print(f'    - {field}')

# Check doc types
doc_types = data.get('documentTypes', [])
print(f'\n✓ Document Types: {\", \".join(doc_types)}')
"

echo ""
echo "======================================"
echo "Employment Agreements template test complete\!"
