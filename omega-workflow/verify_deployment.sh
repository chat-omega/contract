#!/bin/bash

echo "Testing frontend deployment..."
echo ""

# Test 1: HTML changes
echo "1. Checking HTML changes:"
if curl -s http://localhost:3000/document-detail.html | grep -q "extracted-terms-container"; then
    echo "   ✅ Container ID added"
else
    echo "   ❌ Container ID not found"
fi

if curl -s http://localhost:3000/document-detail.html | grep -q "terms-loading"; then
    echo "   ✅ Loading placeholder added"
else
    echo "   ❌ Loading placeholder not found"
fi

if curl -s http://localhost:3000/document-detail.html | grep -q "BUZZFEED"; then
    echo "   ❌ Hardcoded data still present"
else
    echo "   ✅ Hardcoded data removed"
fi

echo ""

# Test 2: JavaScript functions
echo "2. Checking JavaScript functions:"

JS_FILE=$(curl -s http://localhost:3000/js/document-detail.js)

if echo "$JS_FILE" | grep -q "async loadWorkflowDetails"; then
    echo "   ✅ loadWorkflowDetails function added"
else
    echo "   ❌ loadWorkflowDetails function missing"
fi

if echo "$JS_FILE" | grep -q "async renderWorkflowFields"; then
    echo "   ✅ renderWorkflowFields function added"
else
    echo "   ❌ renderWorkflowFields function missing"
fi

if echo "$JS_FILE" | grep -q "async populateExtractionResults"; then
    echo "   ✅ populateExtractionResults function added"
else
    echo "   ❌ populateExtractionResults function missing"
fi

if echo "$JS_FILE" | grep -q "async switchWorkflow"; then
    echo "   ✅ switchWorkflow function added"
else
    echo "   ❌ switchWorkflow function missing"
fi

if echo "$JS_FILE" | grep -q "createCategoryElement"; then
    echo "   ✅ createCategoryElement function added"
else
    echo "   ❌ createCategoryElement function missing"
fi

if echo "$JS_FILE" | grep -q "updateTermsWithExtractionResults"; then
    echo "   ✅ updateTermsWithExtractionResults function added"
else
    echo "   ❌ updateTermsWithExtractionResults function missing"
fi

echo ""

# Test 3: Backend API
echo "3. Backend API check:"
if curl -s http://localhost:5001/api/workflows/saved > /dev/null; then
    echo "   ✅ Workflows API accessible"
else
    echo "   ❌ Workflows API not accessible"
fi

echo ""
echo "✅ Deployment verification complete!"
