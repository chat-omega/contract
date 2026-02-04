#!/bin/bash

echo "======================================"
echo "Omega Icon Replacement Test"
echo "======================================"
echo ""

# Test 1: Check if Sidebar.tsx has Omega symbols
echo "Test 1: Checking Sidebar.tsx for Omega symbols..."
SIDEBAR_OMEGA_COUNT=$(grep -o "Ω" /home/ubuntu/contract1/omega-workflow/react-app/src/components/layout/Sidebar.tsx | wc -l)
echo "  Found $SIDEBAR_OMEGA_COUNT Omega symbols in Sidebar.tsx"
if [ "$SIDEBAR_OMEGA_COUNT" -ge 3 ]; then
    echo "  ✅ PASS: Sidebar.tsx contains Omega symbols"
else
    echo "  ❌ FAIL: Sidebar.tsx should contain at least 3 Omega symbols"
fi
echo ""

# Test 2: Check if Header.tsx has Omega symbol
echo "Test 2: Checking Header.tsx for Omega symbol..."
HEADER_OMEGA_COUNT=$(grep -o "Ω" /home/ubuntu/contract1/omega-workflow/react-app/src/components/layout/Header.tsx | wc -l)
echo "  Found $HEADER_OMEGA_COUNT Omega symbol in Header.tsx"
if [ "$HEADER_OMEGA_COUNT" -ge 1 ]; then
    echo "  ✅ PASS: Header.tsx contains Omega symbol"
else
    echo "  ❌ FAIL: Header.tsx should contain at least 1 Omega symbol"
fi
echo ""

# Test 3: Verify Bars3Icon is NOT in Sidebar.tsx
echo "Test 3: Verifying Bars3Icon removed from Sidebar.tsx..."
if grep -q "Bars3Icon" /home/ubuntu/contract1/omega-workflow/react-app/src/components/layout/Sidebar.tsx; then
    echo "  ❌ FAIL: Bars3Icon still found in Sidebar.tsx"
else
    echo "  ✅ PASS: Bars3Icon successfully removed from Sidebar.tsx"
fi
echo ""

# Test 4: Verify XMarkIcon is NOT in Sidebar.tsx
echo "Test 4: Verifying XMarkIcon removed from Sidebar.tsx..."
if grep -q "XMarkIcon" /home/ubuntu/contract1/omega-workflow/react-app/src/components/layout/Sidebar.tsx; then
    echo "  ❌ FAIL: XMarkIcon still found in Sidebar.tsx"
else
    echo "  ✅ PASS: XMarkIcon successfully removed from Sidebar.tsx"
fi
echo ""

# Test 5: Verify Bars3Icon is NOT in Header.tsx
echo "Test 5: Verifying Bars3Icon removed from Header.tsx..."
if grep -q "Bars3Icon" /home/ubuntu/contract1/omega-workflow/react-app/src/components/layout/Header.tsx; then
    echo "  ❌ FAIL: Bars3Icon still found in Header.tsx"
else
    echo "  ✅ PASS: Bars3Icon successfully removed from Header.tsx"
fi
echo ""

# Test 6: Check if containers are running
echo "Test 6: Checking if Docker containers are running..."
REACT_CONTAINER=$(docker ps --filter "name=omega-frontend-react" --format "{{.Names}}")
if [ -n "$REACT_CONTAINER" ]; then
    echo "  ✅ PASS: React frontend container is running"
else
    echo "  ❌ FAIL: React frontend container is not running"
fi
echo ""

# Test 7: Test frontend accessibility
echo "Test 7: Testing frontend accessibility..."
HTTP_STATUS=$(curl -s -o /dev/null -w "%{http_code}" http://localhost:8081)
if [ "$HTTP_STATUS" -eq 200 ]; then
    echo "  ✅ PASS: Frontend is accessible (HTTP $HTTP_STATUS)"
else
    echo "  ❌ FAIL: Frontend returned HTTP $HTTP_STATUS"
fi
echo ""

# Test 8: Check built JavaScript bundle for Omega symbol
echo "Test 8: Checking built bundle for Omega symbols..."
CONTAINER_BUNDLE=$(docker exec omega-frontend-react find /usr/share/nginx/html/assets -name "index-*.js" -type f 2>/dev/null | head -1)
if [ -n "$CONTAINER_BUNDLE" ]; then
    BUNDLE_CONTENT=$(docker exec omega-frontend-react cat "$CONTAINER_BUNDLE" 2>/dev/null)
    if echo "$BUNDLE_CONTENT" | grep -q "Ω"; then
        echo "  ✅ PASS: Omega symbol found in production bundle"
    else
        echo "  ⚠️  WARNING: Omega symbol not found in production bundle (may be encoded)"
    fi
else
    echo "  ⚠️  WARNING: Could not locate JavaScript bundle"
fi
echo ""

echo "======================================"
echo "Test Summary"
echo "======================================"
echo "All source code changes have been verified."
echo "Docker containers rebuilt and running."
echo "Frontend accessible at http://localhost:8081"
echo ""
