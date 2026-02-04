#!/usr/bin/env python3
"""
Backend API Tests for Credit Analysis Endpoints
Tests the /api/credit-analysis/* endpoints
"""

import asyncio
import sys
from pathlib import Path

# Test configuration
API_BASE_URL = "http://localhost:5001"


async def test_credit_analysis_endpoints():
    """Test Credit Analysis API endpoints"""

    print("=" * 80)
    print("CREDIT ANALYSIS API ENDPOINT TESTS")
    print("=" * 80)
    print()

    # Test credentials
    test_user = {
        "username": "testuser",
        "password": "testpass123"
    }

    tests_passed = 0
    tests_failed = 0

    try:
        import aiohttp

        async with aiohttp.ClientSession() as session:
            # Test 1: Login to get auth token
            print("Test 1: User Login")
            print("-" * 40)
            async with session.post(
                f"{API_BASE_URL}/api/login",
                json=test_user
            ) as resp:
                if resp.status == 200:
                    data = await resp.json()
                    token = data.get('token')
                    if token:
                        print("✅ Login successful, token received")
                        tests_passed += 1
                    else:
                        print("❌ Login succeeded but no token in response")
                        tests_failed += 1
                        return
                else:
                    # Try to create user
                    print("⚠️  Login failed, attempting to create user...")
                    async with session.post(
                        f"{API_BASE_URL}/api/register",
                        json={
                            "username": test_user["username"],
                            "email": f"{test_user['username']}@test.com",
                            "password": test_user["password"]
                        }
                    ) as reg_resp:
                        if reg_resp.status == 200:
                            print("✅ User created successfully")
                            # Try login again
                            async with session.post(
                                f"{API_BASE_URL}/api/login",
                                json=test_user
                            ) as login_resp:
                                if login_resp.status == 200:
                                    data = await login_resp.json()
                                    token = data.get('token')
                                    print("✅ Login successful after registration")
                                    tests_passed += 1
                                else:
                                    print("❌ Login failed even after registration")
                                    tests_failed += 1
                                    return
                        else:
                            print("❌ Failed to create user")
                            tests_failed += 1
                            return

            headers = {"Authorization": f"Bearer {token}"}
            print()

            # Test 2: Query credit analysis (without document)
            print("Test 2: Credit Analysis Query (General)")
            print("-" * 40)
            form_data = aiohttp.FormData()
            form_data.add_field('query', 'How do I perform credit analysis?')

            async with session.post(
                f"{API_BASE_URL}/api/credit-analysis/query",
                data=form_data,
                headers=headers
            ) as resp:
                if resp.status == 200:
                    data = await resp.json()
                    print(f"✅ Query processed: {resp.status}")
                    print(f"   Response: {data.get('message', '')[:100]}...")
                    tests_passed += 1
                else:
                    error_text = await resp.text()
                    print(f"❌ Query failed: {resp.status}")
                    print(f"   Error: {error_text[:200]}")
                    tests_failed += 1
            print()

            # Test 3: Upload credit document (if test file exists)
            print("Test 3: Credit Document Upload")
            print("-" * 40)

            # Look for a test PDF file
            test_pdf_paths = [
                "/app/uploads/test_credit_agreement.pdf",
                "/home/ubuntu/contract1/omega-workflow/test_credit.pdf",
                "/tmp/test_credit.pdf"
            ]

            test_pdf = None
            for pdf_path in test_pdf_paths:
                if Path(pdf_path).exists():
                    test_pdf = pdf_path
                    break

            if test_pdf:
                print(f"   Using test file: {test_pdf}")
                form_data = aiohttp.FormData()
                form_data.add_field('file',
                                  open(test_pdf, 'rb'),
                                  filename='test_credit.pdf',
                                  content_type='application/pdf')

                async with session.post(
                    f"{API_BASE_URL}/api/credit-analysis/upload",
                    data=form_data,
                    headers=headers
                ) as resp:
                    if resp.status == 200:
                        data = await resp.json()
                        document_id = data.get('document_id')
                        extraction_id = data.get('extraction_id')
                        print(f"✅ Upload successful: {resp.status}")
                        print(f"   Document ID: {document_id}")
                        print(f"   Extraction ID: {extraction_id}")
                        print(f"   Status: {data.get('status')}")
                        tests_passed += 1

                        # Test 4: Get credit analysis results
                        print()
                        print("Test 4: Get Credit Analysis Results")
                        print("-" * 40)

                        async with session.get(
                            f"{API_BASE_URL}/api/credit-analysis/document/{document_id}/results",
                            headers=headers
                        ) as results_resp:
                            if results_resp.status in [200, 202]:
                                results_data = await results_resp.json()
                                status = results_data.get('status')
                                print(f"✅ Results retrieved: {results_resp.status}")
                                print(f"   Status: {status}")

                                if status == 'complete':
                                    print(f"   Company: {results_data.get('company', {}).get('name')}")
                                    print(f"   Rating: {results_data.get('company', {}).get('rating')}")
                                    print(f"   PoD: {results_data.get('pod', {}).get('value')}")
                                    print(f"   Spread: {results_data.get('spread', {}).get('value')}")
                                elif status == 'processing':
                                    print(f"   ⏳ Extraction still in progress")

                                tests_passed += 1
                            else:
                                error_text = await results_resp.text()
                                print(f"❌ Failed to get results: {results_resp.status}")
                                print(f"   Error: {error_text[:200]}")
                                tests_failed += 1

                    else:
                        error_text = await resp.text()
                        print(f"❌ Upload failed: {resp.status}")
                        print(f"   Error: {error_text[:200]}")
                        tests_failed += 1
            else:
                print("⚠️  No test PDF file found, skipping upload test")
                print("   Create a test file at one of these paths:")
                for path in test_pdf_paths:
                    print(f"   - {path}")
                tests_failed += 1
            print()

    except ImportError:
        print("❌ Error: aiohttp not installed")
        print("   Install with: pip install aiohttp")
        tests_failed += 1
    except Exception as e:
        print(f"❌ Unexpected error: {e}")
        import traceback
        traceback.print_exc()
        tests_failed += 1

    # Summary
    print()
    print("=" * 80)
    print("TEST SUMMARY")
    print("=" * 80)
    print(f"✅ Tests Passed: {tests_passed}")
    print(f"❌ Tests Failed: {tests_failed}")
    print(f"📊 Total Tests: {tests_passed + tests_failed}")
    print()

    if tests_failed == 0:
        print("🎉 All tests passed!")
        return 0
    else:
        print("⚠️  Some tests failed")
        return 1


if __name__ == "__main__":
    exit_code = asyncio.run(test_credit_analysis_endpoints())
    sys.exit(exit_code)
