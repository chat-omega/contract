#!/bin/bash

# Manual Word-Level Highlighting Test
# Opens browser and provides step-by-step instructions

echo "=========================================="
echo "Manual Word-Level Highlighting Test"
echo "=========================================="
echo ""

# Get token
echo "Step 1: Getting authentication token..."
TOKEN_RESPONSE=$(curl -s -X POST "http://localhost:5001/api/auth/login" \
    -H "Content-Type: application/json" \
    -d '{"username":"admin","password":"admin123"}')

TOKEN=$(echo $TOKEN_RESPONSE | grep -o '"access_token":"[^"]*' | cut -d'"' -f4)

if [ -z "$TOKEN" ]; then
    echo "Failed to get token"
    exit 1
fi

echo "Token obtained: ${TOKEN:0:20}..."
echo ""

# Get documents
echo "Step 2: Getting documents..."
DOCS=$(curl -s -X GET "http://localhost:5001/api/documents" \
    -H "Authorization: Bearer $TOKEN")

DOC_ID=$(echo $DOCS | grep -o '"id":"[^"]*' | head -1 | cut -d'"' -f4)

if [ -z "$DOC_ID" ]; then
    echo "No documents found"
    exit 1
fi

echo "Document ID: $DOC_ID"
echo ""

# Verify JavaScript code
echo "Step 3: Verifying JavaScript code in served files..."
JS_CHECK=$(curl -s http://localhost:3003/js/document-detail.js | grep -c "highlightExtractionWordLevel")

if [ $JS_CHECK -gt 0 ]; then
    echo "✓ Word-level highlighting function found in served JS ($JS_CHECK occurrences)"
else
    echo "✗ Word-level highlighting function NOT found in served JS"
    exit 1
fi

# Check if CSS is served
CSS_CHECK=$(curl -s http://localhost:3003/css/document-detail.css | grep -c "data-word-highlighted")

if [ $CSS_CHECK -gt 0 ]; then
    echo "✓ Word-level highlighting CSS found ($CSS_CHECK occurrences)"
else
    echo "✗ Word-level highlighting CSS NOT found"
fi

echo ""
echo "=========================================="
echo "Manual Testing Steps"
echo "=========================================="
echo ""
echo "1. Open your browser to:"
echo "   http://localhost:3003/login.html"
echo ""
echo "2. Login with:"
echo "   Username: admin"
echo "   Password: admin123"
echo ""
echo "3. Navigate to Documents page"
echo ""
echo "4. Click on the first document (ID: $DOC_ID)"
echo ""
echo "5. Open the browser console (F12)"
echo ""
echo "6. Click on any extraction field in the right panel"
echo ""
echo "7. Look for these console messages:"
echo "   • '🎯 Starting word-level precise highlighting'"
echo "   • '✅ Word-level highlighting complete'"
echo "   • '✅ Found ${N} matching spans'"
echo ""
echo "8. Verify highlighting in PDF:"
echo "   • Words should have yellow background (not boxes)"
echo "   • Highlighting should follow text precisely"
echo "   • Should see rgba(255, 255, 0, 0.4) background"
echo ""
echo "9. Test zoom:"
echo "   • Click zoom in/out buttons"
echo "   • Highlights should persist after zoom"
echo ""
echo "10. Check DOM:"
echo "    In console, run:"
echo "    document.querySelectorAll('.pdf-text-layer span[data-word-highlighted=\"true\"]').length"
echo "    Should return > 0 when highlighting is active"
echo ""
echo "=========================================="
echo "Debug Commands (run in browser console)"
echo "=========================================="
echo ""
echo "# Check if class exists:"
echo "typeof DocumentDetailManager"
echo ""
echo "# Check if methods exist:"
echo "const dm = window.documentDetailManager;"
echo "typeof dm.highlightExtractionWordLevel"
echo "typeof dm.clearWordHighlights"
echo ""
echo "# Check highlighted spans:"
echo "document.querySelectorAll('.pdf-text-layer span[data-word-highlighted=\"true\"]').length"
echo ""
echo "# Check text layer:"
echo "document.querySelectorAll('.pdf-text-layer').length"
echo ""
echo "# Check text layer spans:"
echo "document.querySelectorAll('.pdf-text-layer span').length"
echo ""
