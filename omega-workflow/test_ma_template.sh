#\!/bin/bash
echo "Testing M&A Template Copy Functionality"
echo "========================================"
echo ""

# Step 1: Initialize workflow
echo "1. Initializing workflow..."
WORKFLOW_ID=$(curl -s -X POST http://localhost:5001/api/analyze/workflows/create/init \
  -H "Content-Type: application/json" | python3 -c "import json,sys; print(json.load(sys.stdin)['workflowId'])")
echo "   Workflow ID: $WORKFLOW_ID"

# Step 2: Create from M&A template
echo ""
echo "2. Creating from M&A/Due Diligence template..."
TEMPLATE_RESPONSE=$(curl -s -X POST "http://localhost:5001/api/analyze/workflows/create/$WORKFLOW_ID/template" \
  -H "Content-Type: application/json" \
  -d '{"templateId": "ma-due-diligence", "templateName": "M&A/Due Diligence"}')

# Extract and display the response
echo "   Template Response:"
echo "$TEMPLATE_RESPONSE" | python3 -c "
import json, sys
try:
    data = json.load(sys.stdin)
    workflow = data.get('workflow', {})
    
    print(f'   - Success: {data.get(\"success\", False)}')
    print(f'   - Name: {workflow.get(\"name\", \"\")}')
    print(f'   - Description: {workflow.get(\"description\", \"\")}')
    print(f'   - Current Step: {workflow.get(\"currentStep\", 0)}')
    
    # Display fields with categories
    fields = workflow.get('fields', {})
    if isinstance(fields, dict):
        print('   - Fields by category:')
        for category, field_list in fields.items():
            print(f'     * {category}: {len(field_list)} fields')
            for field in field_list[:3]:  # Show first 3 fields
                print(f'       - {field}')
            if len(field_list) > 3:
                print(f'       ... and {len(field_list) - 3} more')
    
    # Display document types
    doc_types = workflow.get('documentTypes', [])
    print(f'   - Document Types: {len(doc_types)} types')
    for doc_type in doc_types[:3]:
        print(f'     * {doc_type}')
    if len(doc_types) > 3:
        print(f'     ... and {len(doc_types) - 3} more')
    
    # Display scoring profiles
    scoring = workflow.get('scoringProfiles', {})
    if isinstance(scoring, dict) and scoring:
        print(f'   - Scoring Profiles: {len(scoring)} profiles')
        for profile_name in list(scoring.keys())[:3]:
            print(f'     * {profile_name}')
    else:
        print('   - Scoring Profiles: None or empty')
        
except Exception as e:
    print(f'   Error parsing response: {e}')
    print('   Raw response:', data if 'data' in locals() else 'Could not parse')
"

echo ""
echo "3. Getting workflow state to verify all data..."
STATE_RESPONSE=$(curl -s http://localhost:5001/api/analyze/workflows/create/$WORKFLOW_ID)
echo "$STATE_RESPONSE" | python3 -c "
import json, sys
try:
    workflow = json.load(sys.stdin)
    
    # Check if all required fields are present
    has_name = bool(workflow.get('name'))
    has_description = bool(workflow.get('description'))
    has_fields = bool(workflow.get('fields'))
    has_doc_types = bool(workflow.get('documentTypes'))
    has_scoring = bool(workflow.get('scoringProfiles'))
    
    print('   Data verification:')
    print(f'   ✓ Has name: {\"Yes\" if has_name else \"No\"}')
    print(f'   ✓ Has description: {\"Yes\" if has_description else \"No\"}')
    print(f'   ✓ Has fields: {\"Yes\" if has_fields else \"No\"}')
    print(f'   ✓ Has document types: {\"Yes\" if has_doc_types else \"No\"}')
    print(f'   ✓ Has scoring profiles: {\"Yes\" if has_scoring else \"No\"}')
    
    if all([has_name, has_description, has_fields, has_doc_types, has_scoring]):
        print('')
        print('   ✅ SUCCESS: All M&A template data loaded correctly\!')
    else:
        print('')
        print('   ❌ FAILED: Some template data is missing')
        
except Exception as e:
    print(f'   Error: {e}')
"

echo ""
echo "========================================"
echo "Test completed. Check frontend at http://localhost:3000"
echo "Navigate to Workflows > Workflow Library > Click 'Copy Template' on M&A/Due Diligence"
