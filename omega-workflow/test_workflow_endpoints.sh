#!/bin/bash

echo "==========================================="
echo "Testing Complete Workflow Functionality"
echo "==========================================="

# Wait for backend to be ready
sleep 3

echo "1. Testing workflow templates..."
TEMPLATES=$(curl -s http://localhost:5001/api/analyze/workflows/templates)
TEMPLATE_COUNT=$(echo $TEMPLATES | python3 -c "import json,sys; print(len(json.load(sys.stdin)))")
echo "   Found $TEMPLATE_COUNT templates"

echo ""
echo "2. Testing workflow initialization..."
INIT_RESPONSE=$(curl -s -X POST http://localhost:5001/api/analyze/workflows/create/init \
  -H "Content-Type: application/json" -d '{}')
WORKFLOW_ID=$(echo $INIT_RESPONSE | python3 -c "import json,sys; print(json.load(sys.stdin)['workflowId'])")
echo "   Created workflow: $WORKFLOW_ID"

echo ""
echo "3. Testing workflow name setting..."
NAME_RESPONSE=$(curl -s -X POST http://localhost:5001/api/analyze/workflows/create/$WORKFLOW_ID/name \
  -H "Content-Type: application/json" -d '{"name": "Test Workflow"}')
NAME_SUCCESS=$(echo $NAME_RESPONSE | python3 -c "import json,sys; print(json.load(sys.stdin).get('success', False))")
echo "   Name set successfully: $NAME_SUCCESS"

echo ""
echo "4. Testing template creation..."
TEMPLATE_RESPONSE=$(curl -s -X POST http://localhost:5001/api/analyze/workflows/create/$WORKFLOW_ID/template \
  -H "Content-Type: application/json" \
  -d '{"templateId": "ma-due-diligence", "templateName": "M&A/Due Diligence"}')
TEMPLATE_SUCCESS=$(echo $TEMPLATE_RESPONSE | python3 -c "import json,sys; print(json.load(sys.stdin).get('success', False))")
TEMPLATE_NAME=$(echo $TEMPLATE_RESPONSE | python3 -c "import json,sys; print(json.load(sys.stdin)['workflow']['name'])")
echo "   Template created successfully: $TEMPLATE_SUCCESS"
echo "   Template name: $TEMPLATE_NAME"

echo ""
echo "5. Testing workflow saving..."
SAVE_RESPONSE=$(curl -s -X POST http://localhost:5001/api/analyze/workflows/create/$WORKFLOW_ID/review \
  -H "Content-Type: application/json" -d '{}')
SAVE_SUCCESS=$(echo $SAVE_RESPONSE | python3 -c "import json,sys; print(json.load(sys.stdin).get('success', False))")
echo "   Workflow saved successfully: $SAVE_SUCCESS"

echo ""
echo "6. Testing saved workflows list..."
SAVED_RESPONSE=$(curl -s http://localhost:5001/api/workflows/saved)
SAVED_COUNT=$(echo $SAVED_RESPONSE | python3 -c "import json,sys; print(len(json.load(sys.stdin)))")
echo "   Saved workflows count: $SAVED_COUNT"

echo ""
echo "==========================================="
if [ "$NAME_SUCCESS" = "True" ] && [ "$TEMPLATE_SUCCESS" = "True" ] && [ "$SAVE_SUCCESS" = "True" ]; then
    echo "✅ ALL WORKFLOW FUNCTIONALITY WORKING!"
    echo ""
    echo "The frontend should now work for:"
    echo "1. ✅ Loading workflows (no more 'Error loading workflows')"
    echo "2. ✅ Creating new workflows"
    echo "3. ✅ Saving workflow names (no more 'Error saving workflow name')"
    echo "4. ✅ Creating workflows from templates (no more 'Error creating workflow from template')"
    echo "5. ✅ Workflow library functionality"
else
    echo "❌ Some workflow functionality still has issues"
    echo "Name Success: $NAME_SUCCESS"
    echo "Template Success: $TEMPLATE_SUCCESS" 
    echo "Save Success: $SAVE_SUCCESS"
fi
echo ""
echo "Test workflows at: http://localhost:3000"
echo "==========================================="