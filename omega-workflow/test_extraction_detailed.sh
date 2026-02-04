#!/bin/bash
set -e

# Get admin token
ADMIN_TOKEN=$(curl -s -X POST http://localhost:5001/api/auth/login \
    -H "Content-Type: application/json" \
    -d '{"username": "admin", "password": "admin123"}' | jq -r '.access_token')

echo "Testing Extraction API for Document e37f9df8"
echo "=============================================="
echo ""

# Get extractions
EXTRACTIONS=$(curl -s -X GET "http://localhost:5001/api/extractions?document_id=e37f9df8" \
    -H "Authorization: Bearer $ADMIN_TOKEN")

# Check if extractions is an array or object
echo "Response type:"
echo "$EXTRACTIONS" | jq 'type'
echo ""

# If it's an object with data field, extract it
if echo "$EXTRACTIONS" | jq -e '.data' > /dev/null 2>&1; then
    echo "Extractions are in .data field"
    EXTRACTION_ARRAY=$(echo "$EXTRACTIONS" | jq '.data')
else
    echo "Extractions are at root level"
    EXTRACTION_ARRAY="$EXTRACTIONS"
fi

# Count extractions
COUNT=$(echo "$EXTRACTION_ARRAY" | jq 'length // 0')
echo "Total extractions: $COUNT"
echo ""

# Show first extraction
if [ "$COUNT" -gt "0" ]; then
    echo "First Extraction Sample:"
    echo "$EXTRACTION_ARRAY" | jq '.[0]'
    echo ""

    echo "Data Structure Check:"
    echo "  Has 'page': $(echo "$EXTRACTION_ARRAY" | jq '.[0] | has("page")')"
    echo "  Has 'spans': $(echo "$EXTRACTION_ARRAY" | jq '.[0] | has("spans")')"
    echo "  Has 'field_name': $(echo "$EXTRACTION_ARRAY" | jq '.[0] | has("field_name")')"
    echo "  Has 'value': $(echo "$EXTRACTION_ARRAY" | jq '.[0] | has("value")')"
    echo ""

    # Check spans structure
    SPAN_COUNT=$(echo "$EXTRACTION_ARRAY" | jq '.[0].spans | length // 0')
    echo "  Span count in first extraction: $SPAN_COUNT"

    if [ "$SPAN_COUNT" -gt "0" ]; then
        echo "  First span structure:"
        echo "$EXTRACTION_ARRAY" | jq '.[0].spans[0]'
        echo ""
        echo "  First span has 'bounds': $(echo "$EXTRACTION_ARRAY" | jq '.[0].spans[0] | has("bounds")')"
        echo "  Bounds structure:"
        echo "$EXTRACTION_ARRAY" | jq '.[0].spans[0].bounds'
    fi
else
    echo "No extractions found for this document"
fi
