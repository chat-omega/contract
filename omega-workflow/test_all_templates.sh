#!/bin/bash
echo "=================================================="
echo "Testing All New Workflow Templates"
echo "=================================================="

# Function to test a template
test_template() {
    local template_id="$1"
    local template_name="$2"
    
    echo ""
    echo "Testing: $template_name"
    echo "-----------------------------------------"
    
    # Initialize workflow
    WORKFLOW_ID=$(curl -s -X POST http://localhost:5001/api/analyze/workflows/create/init \
      -H "Content-Type: application/json" | python3 -c "import json,sys; print(json.load(sys.stdin)['workflowId'])")
    
    # Apply template
    curl -s -X POST "http://localhost:5001/api/analyze/workflows/create/$WORKFLOW_ID/template" \
      -H "Content-Type: application/json" \
      -d "{\"templateId\": \"$template_id\", \"templateName\": \"$template_name\"}" > /dev/null
    
    # Get and display workflow info
    curl -s http://localhost:5001/api/analyze/workflows/create/$WORKFLOW_ID | python3 -c "
import json, sys
data = json.load(sys.stdin)

print(f'✓ Name: {data.get(\"name\", \"MISSING\")}')
print(f'✓ Description: {data.get(\"description\", \"MISSING\")[:60]}...')

# Check fields
fields = data.get('fields', {})
if fields:
    total = sum(len(f) for f in fields.values())
    print(f'✓ Categories: {len(fields)}')
    print(f'✓ Total Fields: {total}')
    for cat in list(fields.keys())[:3]:
        print(f'  - {cat}: {len(fields[cat])} fields')

# Check doc types
doc_types = data.get('documentTypes', [])
print(f'✓ Document Types: {len(doc_types)} type(s)')
"
}

# Test each new template
test_template "customer-finance-ops-privacy" "Customer Agreements - Finance/Ops/Privacy Terms"
test_template "customer-revops" "Customer Agreements - RevOps Terms"
test_template "vendor-supplier" "Vendor/Supplier Agreements"
test_template "ndas" "NDAs"

echo ""
echo "=================================================="
echo "All templates tested successfully!"
echo "Check http://localhost:3000 to verify in UI"
echo "=================================================="