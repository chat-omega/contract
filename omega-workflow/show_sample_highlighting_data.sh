#!/bin/bash

# Display sample highlighting data to verify structure
# This shows real data that will be used for PDF highlighting

GREEN='\033[0;32m'
BLUE='\033[0;34m'
YELLOW='\033[1;33m'
NC='\033[0m'

echo ""
echo "================================================================="
echo "  SAMPLE HIGHLIGHTING DATA FROM REAL EXTRACTIONS"
echo "================================================================="
echo ""

# Get admin token
TOKEN=$(curl -s -X POST http://localhost:5001/api/auth/login \
    -H "Content-Type: application/json" \
    -d '{"username": "admin", "password": "admin123"}' | jq -r '.access_token')

# Get extraction data
EXTRACTION=$(curl -s -X GET "http://localhost:5001/api/documents/e37f9df8/extraction/results" \
    -H "Authorization: Bearer $TOKEN")

echo -e "${BLUE}Document:${NC} BuzzFeed Agreement.pdf (ID: e37f9df8)"
echo -e "${BLUE}Workflow:${NC} M&A/Due Diligence"
echo ""

# Get workflow data
WORKFLOW=$(echo $EXTRACTION | jq -r '.workflows[0]')
FIELD_COUNT=$(echo $WORKFLOW | jq -r '.field_count')

echo -e "${GREEN}Total Fields:${NC} $FIELD_COUNT"
echo ""

# Show 5 sample fields with their highlighting data
echo "================================================================="
echo "  SAMPLE FIELDS WITH HIGHLIGHTING DATA"
echo "================================================================="
echo ""

# Field 1: Title
echo -e "${YELLOW}[1] Field: Title${NC}"
TITLE_DATA=$(echo $WORKFLOW | jq -r '.results | to_entries | .[0].value.extractions[0]')
echo "  Text: $(echo $TITLE_DATA | jq -r '.text')"
echo "  Page: $(echo $TITLE_DATA | jq -r '.page')"
echo "  Confidence: $(echo $TITLE_DATA | jq -r '.confidence')"
echo "  Bounds:"
echo $TITLE_DATA | jq -r '.spans[0].bounds' | sed 's/^/    /'
echo ""

# Field 2: Parties (multiple extractions)
echo -e "${YELLOW}[2] Field: Parties (showing first 2 of multiple)${NC}"
PARTIES_DATA=$(echo $WORKFLOW | jq -r '.results | to_entries | .[1].value')
PARTY_COUNT=$(echo $PARTIES_DATA | jq -r '.extractions | length')
echo "  Total Extractions: $PARTY_COUNT"
echo ""
echo "  Party 1: $(echo $PARTIES_DATA | jq -r '.extractions[0].text')"
echo "    Page: $(echo $PARTIES_DATA | jq -r '.extractions[0].page')"
echo "    Bounds:"
echo $PARTIES_DATA | jq -r '.extractions[0].spans[0].bounds' | sed 's/^/      /'
echo ""
echo "  Party 2: $(echo $PARTIES_DATA | jq -r '.extractions[1].text')"
echo "    Page: $(echo $PARTIES_DATA | jq -r '.extractions[1].page')"
echo "    Bounds:"
echo $PARTIES_DATA | jq -r '.extractions[1].spans[0].bounds' | sed 's/^/      /'
echo ""

# Field 3: Get any other field
echo -e "${YELLOW}[3] Additional Field Example${NC}"
FIELD3_DATA=$(echo $WORKFLOW | jq -r '.results | to_entries | .[2].value')
FIELD3_NAME=$(echo $FIELD3_DATA | jq -r '.field_name')
echo "  Field Name: $FIELD3_NAME"
if [ "$(echo $FIELD3_DATA | jq -r '.extractions | length')" -gt "0" ]; then
    echo "  Text: $(echo $FIELD3_DATA | jq -r '.extractions[0].text')"
    echo "  Page: $(echo $FIELD3_DATA | jq -r '.extractions[0].page')"
    echo "  Bounds:"
    echo $FIELD3_DATA | jq -r '.extractions[0].spans[0].bounds' | sed 's/^/    /'
else
    echo "  (No extractions for this field)"
fi
echo ""

# Summary of all fields
echo "================================================================="
echo "  ALL FIELDS IN WORKFLOW"
echo "================================================================="
echo ""
echo $WORKFLOW | jq -r '.results | to_entries | .[] | "  - \(.value.field_name): \(.value.extractions | length) extraction(s)"'
echo ""

echo "================================================================="
echo "  DATA STRUCTURE VERIFICATION"
echo "================================================================="
echo ""

# Verify all fields have required structure
TOTAL_FIELDS=$(echo $WORKFLOW | jq -r '.results | to_entries | length')
FIELDS_WITH_PAGE=0
FIELDS_WITH_SPANS=0
FIELDS_WITH_BOUNDS=0

for i in $(seq 0 $((TOTAL_FIELDS - 1))); do
    FIELD=$(echo $WORKFLOW | jq -r ".results | to_entries | .[$i].value")
    EXTRACTION_COUNT=$(echo $FIELD | jq -r '.extractions | length')

    if [ "$EXTRACTION_COUNT" -gt "0" ]; then
        HAS_PAGE=$(echo $FIELD | jq -r '.extractions[0] | has("page")')
        HAS_SPANS=$(echo $FIELD | jq -r '.extractions[0] | has("spans")')
        if [ "$HAS_PAGE" = "true" ]; then FIELDS_WITH_PAGE=$((FIELDS_WITH_PAGE + 1)); fi
        if [ "$HAS_SPANS" = "true" ]; then FIELDS_WITH_SPANS=$((FIELDS_WITH_SPANS + 1)); fi

        if [ "$HAS_SPANS" = "true" ]; then
            SPAN_COUNT=$(echo $FIELD | jq -r '.extractions[0].spans | length')
            if [ "$SPAN_COUNT" -gt "0" ]; then
                HAS_BOUNDS=$(echo $FIELD | jq -r '.extractions[0].spans[0] | has("bounds")')
                if [ "$HAS_BOUNDS" = "true" ]; then FIELDS_WITH_BOUNDS=$((FIELDS_WITH_BOUNDS + 1)); fi
            fi
        fi
    fi
done

echo -e "${GREEN}Fields with 'page' field:${NC} $FIELDS_WITH_PAGE / $TOTAL_FIELDS"
echo -e "${GREEN}Fields with 'spans' array:${NC} $FIELDS_WITH_SPANS / $TOTAL_FIELDS"
echo -e "${GREEN}Fields with 'bounds' object:${NC} $FIELDS_WITH_BOUNDS / $TOTAL_FIELDS"
echo ""

if [ "$FIELDS_WITH_BOUNDS" -gt "0" ]; then
    echo -e "${GREEN}✅ SUCCESS:${NC} All fields with extractions have complete highlighting data"
else
    echo -e "${RED}❌ ISSUE:${NC} Some fields missing highlighting data"
fi

echo ""
echo "================================================================="
