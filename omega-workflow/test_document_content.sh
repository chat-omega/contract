#!/bin/bash

echo "==========================================="
echo "Testing Document Content Serving"
echo "==========================================="

# Wait for backend to be ready
sleep 3

echo "1. Login and get authentication token..."
LOGIN_RESPONSE=$(curl -s -X POST http://localhost:5001/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"username": "admin", "password": "admin123"}')

TOKEN=$(echo $LOGIN_RESPONSE | python3 -c "import json,sys; print(json.load(sys.stdin)['token'])" 2>/dev/null)

if [ -z "$TOKEN" ] || [ "$TOKEN" = "None" ]; then
    echo "❌ Failed to get authentication token"
    echo "Response: $LOGIN_RESPONSE"
    exit 1
fi

echo "   ✅ Got authentication token: ${TOKEN:0:20}..."

echo ""
echo "2. Check if any documents exist..."
DOCS_RESPONSE=$(curl -s -H "Authorization: Bearer $TOKEN" http://localhost:5001/api/documents)
DOC_COUNT=$(echo $DOCS_RESPONSE | python3 -c "import json,sys; print(len(json.load(sys.stdin)))" 2>/dev/null)

echo "   Found $DOC_COUNT document(s)"

if [ "$DOC_COUNT" = "0" ]; then
    echo ""
    echo "3. Creating a test PDF file for upload..."
    # Create a simple test PDF
    cat > /tmp/test_document.txt << 'EOF'
This is a test document for upload.
It contains sample content to verify document viewing functionality.
EOF
    
    echo "   Created test file: /tmp/test_document.txt"
    
    echo ""
    echo "4. Uploading test document..."
    UPLOAD_RESPONSE=$(curl -s -X POST http://localhost:5001/api/documents/upload \
      -H "Authorization: Bearer $TOKEN" \
      -F "files=@/tmp/test_document.txt")
    
    UPLOAD_SUCCESS=$(echo $UPLOAD_RESPONSE | python3 -c "import json,sys; print(json.load(sys.stdin).get('success', False))" 2>/dev/null)
    
    if [ "$UPLOAD_SUCCESS" = "True" ]; then
        echo "   ✅ Document uploaded successfully"
        
        # Get the document ID
        DOC_ID=$(echo $UPLOAD_RESPONSE | python3 -c "import json,sys; print(json.load(sys.stdin)['files'][0]['id'])" 2>/dev/null)
        echo "   Document ID: $DOC_ID"
    else
        echo "   ❌ Document upload failed"
        echo "   Response: $UPLOAD_RESPONSE"
        exit 1
    fi
else
    echo ""
    echo "3. Getting first document ID..."
    DOC_ID=$(echo $DOCS_RESPONSE | python3 -c "import json,sys; print(json.load(sys.stdin)[0]['id'])" 2>/dev/null)
    echo "   Using document ID: $DOC_ID"
fi

echo ""
echo "4. Testing document content endpoint..."
CONTENT_RESPONSE=$(curl -s -w "HTTPSTATUS:%{http_code}" \
  -H "Authorization: Bearer $TOKEN" \
  http://localhost:5001/api/documents/$DOC_ID/content)

HTTP_STATUS=$(echo $CONTENT_RESPONSE | tr -d '\n' | sed -e 's/.*HTTPSTATUS://')
CONTENT_BODY=$(echo $CONTENT_RESPONSE | sed -e 's/HTTPSTATUS:.*//g')

echo "   HTTP Status: $HTTP_STATUS"

case $HTTP_STATUS in
    200)
        echo "   ✅ Document content accessible!"
        CONTENT_TYPE=$(curl -s -I -H "Authorization: Bearer $TOKEN" http://localhost:5001/api/documents/$DOC_ID/content | grep -i "content-type" | cut -d' ' -f2- | tr -d '\r')
        echo "   Content-Type: $CONTENT_TYPE"
        ;;
    401)
        echo "   ❌ Authentication required (401)"
        echo "   This means the frontend auth headers fix is needed"
        ;;
    404)
        echo "   ❌ Document not found (404)"
        echo "   Document might not exist or file path is incorrect"
        ;;
    *)
        echo "   ❌ Unexpected response: $HTTP_STATUS"
        echo "   Body: $CONTENT_BODY"
        ;;
esac

echo ""
echo "5. Testing document metadata endpoint..."
META_RESPONSE=$(curl -s -w "HTTPSTATUS:%{http_code}" \
  -H "Authorization: Bearer $TOKEN" \
  http://localhost:5001/api/documents/$DOC_ID)

META_HTTP_STATUS=$(echo $META_RESPONSE | tr -d '\n' | sed -e 's/.*HTTPSTATUS://')
echo "   Metadata HTTP Status: $META_HTTP_STATUS"

if [ "$META_HTTP_STATUS" = "200" ]; then
    echo "   ✅ Document metadata accessible"
else
    echo "   ❌ Document metadata failed: $META_HTTP_STATUS"
fi

echo ""
echo "==========================================="
if [ "$HTTP_STATUS" = "200" ] && [ "$META_HTTP_STATUS" = "200" ]; then
    echo "✅ DOCUMENT CONTENT SERVING IS WORKING!"
    echo ""
    echo "The fix should resolve the 'Sample PDF document' issue."
    echo "Users should now see their actual uploaded documents."
elif [ "$HTTP_STATUS" = "401" ]; then
    echo "⚠️ AUTHENTICATION ISSUE DETECTED"
    echo ""
    echo "The document content endpoint requires authentication,"
    echo "but the frontend wasn't sending auth headers."
    echo "The fix we applied should resolve this!"
else
    echo "❌ DOCUMENT CONTENT SERVING HAS ISSUES"
    echo ""
    echo "HTTP Status: $HTTP_STATUS"
    echo "Check backend logs for more details."
fi
echo ""
echo "Test document viewing at: http://localhost:3000"
echo "==========================================="