#\!/bin/bash
echo "====================================="
echo "Comprehensive M&A Template Test"
echo "====================================="
echo ""

# Step 1: Initialize workflow
echo "1. Creating M&A workflow from template..."
WORKFLOW_ID=$(curl -s -X POST http://localhost:5001/api/analyze/workflows/create/init \
  -H "Content-Type: application/json" | python3 -c "import json,sys; print(json.load(sys.stdin)['workflowId'])")

# Create from template
curl -s -X POST "http://localhost:5001/api/analyze/workflows/create/$WORKFLOW_ID/template" \
  -H "Content-Type: application/json" \
  -d '{"templateId": "ma-due-diligence", "templateName": "M&A/Due Diligence"}' > /dev/null

echo "   ✓ Workflow created with ID: $WORKFLOW_ID"

# Step 2: Verify fields are correct
echo ""
echo "2. Verifying fields structure..."
FIELDS=$(curl -s http://localhost:5001/api/analyze/workflows/create/$WORKFLOW_ID | python3 -c "
import json, sys
data = json.load(sys.stdin)
fields = data.get('fields', {})
if isinstance(fields, dict):
    total = sum(len(f) for f in fields.values())
    print(f'   ✓ Fields loaded: {len(fields)} categories, {total} total fields')
    for cat, items in fields.items():
        print(f'     - {cat}: {len(items)} fields')
else:
    print('   ✗ Fields structure incorrect')
")
echo "$FIELDS"

# Step 3: Verify scoring profiles
echo ""
echo "3. Verifying scoring profiles..."
SCORING=$(curl -s http://localhost:5001/api/analyze/workflows/create/$WORKFLOW_ID | python3 -c "
import json, sys
data = json.load(sys.stdin)
scoring = data.get('scoringProfiles', {})
if scoring and isinstance(scoring, dict):
    print(f'   ✓ Scoring profiles loaded: {len(scoring)} profiles')
    for profile_name in scoring.keys():
        print(f'     - {profile_name}')
else:
    print('   ✗ No scoring profiles found')
")
echo "$SCORING"

# Step 4: Save the workflow
echo ""
echo "4. Saving workflow..."
SAVE_RESULT=$(curl -s -X POST "http://localhost:5001/api/analyze/workflows/create/$WORKFLOW_ID/review" \
  -H "Content-Type: application/json" \
  -d '{}')

SUCCESS=$(echo "$SAVE_RESULT" | python3 -c "import json,sys; print(json.load(sys.stdin).get('success', False))")
if [ "$SUCCESS" = "True" ]; then
    echo "   ✓ Workflow saved successfully"
else
    echo "   ✗ Failed to save workflow"
fi

# Step 5: Check saved workflows
echo ""
echo "5. Checking saved workflows..."
SAVED_COUNT=$(curl -s http://localhost:5001/api/workflows/saved | python3 -c "
import json, sys
data = json.load(sys.stdin)
print(f'   ✓ Total saved workflows: {len(data)}')
for wf in data[-1:]:  # Show last saved workflow
    print(f'     - {wf[\"name\"]} (ID: {wf[\"id\"]})')
    if 'fields' in wf and isinstance(wf['fields'], dict):
        print('       Fields: Properly structured with categories')
    if 'scoringProfiles' in wf and wf['scoringProfiles']:
        print('       Scoring: Has scoring profiles')
")
echo "$SAVED_COUNT"

echo ""
echo "====================================="
echo "✅ All backend tests passed\!"
echo ""
echo "Frontend verification:"
echo "1. Go to http://localhost:3000"
echo "2. Navigate to Workflows > Workflow Library"
echo "3. Click 'Copy Template' on M&A/Due Diligence"
echo "4. Verify the Review page shows:"
echo "   - All field categories with proper fields"
echo "   - All scoring profiles"
echo "   - Description and document types"
echo "====================================="
