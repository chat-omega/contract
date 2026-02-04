#!/bin/bash
# Manual Verification Script for PDF Highlighting Fix

echo "========================================="
echo "PDF HIGHLIGHTING FIX VERIFICATION"
echo "========================================="
echo ""

# Check container status
echo "1. Checking container status..."
docker ps --format "table {{.Names}}\t{{.Status}}" | grep -E "(frontend-react|backend)"
echo ""

# Check new bundle is deployed
echo "2. Checking deployed React bundle..."
BUNDLE=$(curl -s https://app-react.omegaintelligence.ai/ | grep -o 'index-[^"]*\.js')
echo "   Bundle: $BUNDLE"
echo ""

# Test API
echo "3. Testing API endpoints..."
TOKEN=$(curl -s -X POST https://app-react.omegaintelligence.ai/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"username":"admin","password":"admin123"}' | jq -r '.access_token')
echo "   Token: ${TOKEN:0:30}..."

# Test document API
DOC_STATUS=$(curl -s -H "Authorization: Bearer $TOKEN" \
  "https://app-react.omegaintelligence.ai/api/documents/e37f9df8" | jq -r '.id // "error"')
echo "   Document API: $DOC_STATUS"

# Test extraction API
EXTRACTION_COUNT=$(curl -s -H "Authorization: Bearer $TOKEN" \
  "https://app-react.omegaintelligence.ai/api/documents/e37f9df8/extraction/results?workflow_id=46" | jq '.field_count // 0')
echo "   Extractions: $EXTRACTION_COUNT fields"
echo ""

# Test document page
echo "4. Testing document page route..."
DOC_PAGE_STATUS=$(curl -s -o /dev/null -w "%{http_code}" \
  "https://app-react.omegaintelligence.ai/documents/e37f9df8")
echo "   /documents/e37f9df8: HTTP $DOC_PAGE_STATUS"
echo ""

echo "========================================="
echo "MANUAL VERIFICATION STEPS:"
echo "========================================="
echo ""
echo "1. Open https://app-react.omegaintelligence.ai/login"
echo "2. Login with: admin / admin123"
echo "3. Go to: https://app-react.omegaintelligence.ai/documents/e37f9df8"
echo "4. Wait for PDF to load"
echo "5. Expand a field in the Extraction Panel (left sidebar)"
echo "6. Click on an extraction result (with 'Page: X' label)"
echo ""
echo "EXPECTED BEHAVIOR:"
echo "- Page navigates to the correct page"
echo "- Yellow/blue highlight rectangle appears on the extracted text"
echo "- Highlight pulses briefly when first displayed"
echo ""
echo "CONSOLE LOGS TO CHECK (F12 > Console):"
echo "- [DIAGNOSTIC] Highlight re-render proceeding (scrolling check removed)"
echo "- [PDFViewer] Rendering X highlights on page Y"
echo "- [DIAGNOSTIC] Highlights computed: { count: X, ... }"
echo ""
echo "========================================="
