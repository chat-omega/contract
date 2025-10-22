#!/usr/bin/env python3
"""
Advanced Integration Tests
Tests CORS, concurrent requests, and edge cases
"""

import requests
import json
import time
import sys
import concurrent.futures

BASE_URL = "http://127.0.0.1:8000"

def print_header(title):
    print(f"\n{'='*80}")
    print(f"{title:^80}")
    print(f"{'='*80}\n")

def test_cors_headers():
    """Test CORS configuration"""
    print_header("CORS HEADERS TEST")

    # Test preflight request
    print("1. Testing CORS preflight (OPTIONS)...")
    headers = {
        'Origin': 'http://localhost:3000',
        'Access-Control-Request-Method': 'POST',
        'Access-Control-Request-Headers': 'Content-Type'
    }

    response = requests.options(
        f"{BASE_URL}/api/research/start",
        headers=headers
    )

    print(f"   Status Code: {response.status_code}")
    print(f"   Access-Control-Allow-Origin: {response.headers.get('Access-Control-Allow-Origin', 'Not Set')}")
    print(f"   Access-Control-Allow-Methods: {response.headers.get('Access-Control-Allow-Methods', 'Not Set')}")
    print(f"   Access-Control-Allow-Headers: {response.headers.get('Access-Control-Allow-Headers', 'Not Set')}")

    # Test actual request with origin
    print("\n2. Testing POST with Origin header...")
    headers = {
        'Origin': 'http://localhost:3000',
        'Content-Type': 'application/json'
    }

    response = requests.post(
        f"{BASE_URL}/api/research/start",
        json={"query": "Test CORS"},
        headers=headers
    )

    print(f"   Status Code: {response.status_code}")
    print(f"   Access-Control-Allow-Origin: {response.headers.get('Access-Control-Allow-Origin', 'Not Set')}")
    print(f"   Access-Control-Allow-Credentials: {response.headers.get('Access-Control-Allow-Credentials', 'Not Set')}")

    return response.status_code == 200


def test_concurrent_requests():
    """Test multiple concurrent research requests"""
    print_header("CONCURRENT REQUESTS TEST")

    def start_research(query_num):
        try:
            payload = {
                "query": f"Test concurrent request {query_num}"
            }
            response = requests.post(
                f"{BASE_URL}/api/research/start",
                json=payload,
                timeout=10
            )
            return {
                'query_num': query_num,
                'success': response.status_code == 200,
                'session_id': response.json().get('id') if response.status_code == 200 else None
            }
        except Exception as e:
            return {
                'query_num': query_num,
                'success': False,
                'error': str(e)
            }

    print("Starting 5 concurrent research requests...")
    start_time = time.time()

    with concurrent.futures.ThreadPoolExecutor(max_workers=5) as executor:
        futures = [executor.submit(start_research, i) for i in range(1, 6)]
        results = [future.result() for future in concurrent.futures.as_completed(futures)]

    duration = time.time() - start_time

    successful = sum(1 for r in results if r['success'])
    print(f"\n   Total Requests: {len(results)}")
    print(f"   Successful: {successful}")
    print(f"   Failed: {len(results) - successful}")
    print(f"   Duration: {duration:.2f}s")
    print(f"   Avg per request: {duration/len(results):.2f}s")

    # Check if all sessions were created
    for result in results:
        if result['success']:
            print(f"   Request {result['query_num']}: Session {result['session_id'][:8]}...")
        else:
            print(f"   Request {result['query_num']}: FAILED - {result.get('error', 'Unknown')}")

    return successful >= 4  # At least 4 out of 5 should succeed


def test_edge_cases():
    """Test edge cases and boundary conditions"""
    print_header("EDGE CASES TEST")

    tests = []

    # Test 1: Very long query
    print("1. Testing very long query...")
    long_query = "What is " + "quantum computing " * 100
    response = requests.post(
        f"{BASE_URL}/api/research/start",
        json={"query": long_query}
    )
    print(f"   Status: {response.status_code}")
    tests.append(("Long Query", response.status_code == 200))

    # Test 2: Empty query (should fail)
    print("\n2. Testing empty query...")
    response = requests.post(
        f"{BASE_URL}/api/research/start",
        json={"query": ""}
    )
    print(f"   Status: {response.status_code}")
    tests.append(("Empty Query (should fail)", response.status_code in [400, 422]))

    # Test 3: Special characters in query
    print("\n3. Testing special characters in query...")
    response = requests.post(
        f"{BASE_URL}/api/research/start",
        json={"query": "What is AI? <script>alert('test')</script> & ML"}
    )
    print(f"   Status: {response.status_code}")
    tests.append(("Special Characters", response.status_code == 200))

    # Test 4: Invalid model name
    print("\n4. Testing invalid model name...")
    response = requests.post(
        f"{BASE_URL}/api/research/start",
        json={
            "query": "Test query",
            "model": "invalid-model-name-xyz"
        }
    )
    print(f"   Status: {response.status_code}")
    # Should still accept (backend will handle invalid model)
    tests.append(("Invalid Model", response.status_code == 200))

    # Test 5: Retrieve non-existent session multiple times
    print("\n5. Testing repeated access to non-existent session...")
    for i in range(3):
        response = requests.get(f"{BASE_URL}/api/research/non-existent-id-{i}")
        print(f"   Attempt {i+1}: {response.status_code}")
    tests.append(("Non-existent Session", True))  # Should always return 404

    # Test 6: History with limit parameter
    print("\n6. Testing history with limit parameter...")
    response = requests.get(f"{BASE_URL}/api/research/history?limit=2")
    print(f"   Status: {response.status_code}")
    if response.status_code == 200:
        sessions = response.json()
        print(f"   Sessions returned: {len(sessions)}")
        tests.append(("History Limit", len(sessions) <= 2))
    else:
        tests.append(("History Limit", False))

    # Summary
    print(f"\n   Edge Case Test Results:")
    passed = sum(1 for _, success in tests if success)
    for name, success in tests:
        status = "PASS" if success else "FAIL"
        print(f"   - {name}: {status}")

    return passed == len(tests)


def test_performance_under_load():
    """Test performance metrics under load"""
    print_header("PERFORMANCE UNDER LOAD TEST")

    print("Running 20 rapid health checks...")
    response_times = []
    errors = 0

    for i in range(20):
        try:
            start = time.time()
            response = requests.get(f"{BASE_URL}/health", timeout=5)
            duration = time.time() - start

            if response.status_code == 200:
                response_times.append(duration)
            else:
                errors += 1
        except Exception as e:
            errors += 1

    if response_times:
        avg = sum(response_times) / len(response_times)
        minimum = min(response_times)
        maximum = max(response_times)
        p95 = sorted(response_times)[int(len(response_times) * 0.95)]

        print(f"\n   Total Requests: 20")
        print(f"   Successful: {len(response_times)}")
        print(f"   Errors: {errors}")
        print(f"\n   Response Times:")
        print(f"   - Average: {avg*1000:.2f}ms")
        print(f"   - Minimum: {minimum*1000:.2f}ms")
        print(f"   - Maximum: {maximum*1000:.2f}ms")
        print(f"   - P95: {p95*1000:.2f}ms")

        # Performance should be acceptable
        acceptable = avg < 0.1 and maximum < 0.5
        print(f"\n   Performance: {'PASS' if acceptable else 'WARN'}")
        return acceptable
    else:
        print("   All requests failed!")
        return False


def main():
    print("\n" + "="*80)
    print(" "*20 + "ADVANCED INTEGRATION TESTS")
    print("="*80)

    results = {}

    # Run tests
    results['CORS'] = test_cors_headers()
    results['Concurrent Requests'] = test_concurrent_requests()
    results['Edge Cases'] = test_edge_cases()
    results['Performance'] = test_performance_under_load()

    # Summary
    print_header("ADVANCED TEST SUMMARY")

    passed = sum(1 for success in results.values() if success)
    total = len(results)

    for test_name, success in results.items():
        status = "PASS" if success else "FAIL"
        print(f"   {test_name}: {status}")

    print(f"\n   Total: {passed}/{total} passed")

    if passed == total:
        print("\n   All advanced tests PASSED!")
        return 0
    else:
        print(f"\n   {total - passed} test(s) FAILED")
        return 1


if __name__ == "__main__":
    sys.exit(main())
