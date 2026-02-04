#!/usr/bin/env python3
"""
Test the extraction API endpoint for document e37f9df8
"""
import requests
import json

API_BASE_URL = "http://localhost:5001"
DOCUMENT_ID = "e37f9df8"
WORKFLOW_ID = 14

def test_extraction_api():
    """Test extraction API with authentication"""

    print("=" * 80)
    print("EXTRACTION API TEST FOR DOCUMENT e37f9df8")
    print("=" * 80)
    print()

    # Test credentials
    test_user = {
        "username": "testuser",
        "password": "testpass123"
    }

    # Step 1: Login
    print("Step 1: Authenticating...")
    try:
        resp = requests.post(f"{API_BASE_URL}/api/auth/login", json=test_user)

        if resp.status_code == 200:
            data = resp.json()
            token = data.get('token')
            print(f"✅ Login successful")
        else:
            # Try to register
            print("⚠️  Login failed, attempting registration...")
            reg_resp = requests.post(
                f"{API_BASE_URL}/api/auth/register",
                json={
                    "username": test_user["username"],
                    "email": f"{test_user['username']}@test.com",
                    "password": test_user["password"]
                }
            )

            if reg_resp.status_code == 200:
                print("✅ User registered")
                # Login again
                resp = requests.post(f"{API_BASE_URL}/api/auth/login", json=test_user)
                if resp.status_code == 200:
                    data = resp.json()
                    token = data.get('token')
                    print(f"✅ Login successful")
                else:
                    print(f"❌ Login failed: {resp.status_code}")
                    return
            else:
                print(f"❌ Registration failed: {reg_resp.status_code}")
                return
    except Exception as e:
        print(f"❌ Authentication error: {e}")
        return

    print()

    # Step 2: Test extraction status endpoint
    print(f"Step 2: Testing extraction status endpoint...")
    headers = {"Authorization": f"Bearer {token}"}

    try:
        url = f"{API_BASE_URL}/api/documents/{DOCUMENT_ID}/extraction/status"
        print(f"URL: {url}")

        resp = requests.get(url, headers=headers)
        print(f"Status Code: {resp.status_code}")

        if resp.status_code == 200:
            data = resp.json()
            print("✅ Status endpoint successful")
            print(f"Response keys: {list(data.keys())}")
            print(json.dumps(data, indent=2))
        else:
            print(f"❌ Status endpoint failed")
            print(f"Response: {resp.text[:500]}")
    except Exception as e:
        print(f"❌ Error: {e}")

    print()
    print("-" * 80)
    print()

    # Step 3: Test extraction results endpoint
    print(f"Step 3: Testing extraction results endpoint...")

    try:
        url = f"{API_BASE_URL}/api/documents/{DOCUMENT_ID}/extraction/results"
        params = {"workflow_id": WORKFLOW_ID}
        print(f"URL: {url}")
        print(f"Params: {params}")

        resp = requests.get(url, headers=headers, params=params)
        print(f"Status Code: {resp.status_code}")

        if resp.status_code == 200:
            data = resp.json()
            print("✅ Results endpoint successful")
            print()
            print("=== API RESPONSE STRUCTURE ===")
            print(f"Response keys: {list(data.keys())}")
            print(f"Status: {data.get('status')}")
            print(f"Field count: {data.get('fieldCount')}")
            print()

            if 'fields' in data:
                fields = data['fields']
                print(f"Total fields: {len(fields)}")
                print()

                # Sample 3 fields
                sample_count = 0
                for field_id, field_data in fields.items():
                    if sample_count >= 3:
                        break

                    print(f"=== Field {sample_count + 1}: {field_id} ===")
                    print(f"Field name: {field_data.get('name', 'N/A')}")

                    extractions = field_data.get('extractions', [])
                    print(f"Extraction count: {len(extractions)}")

                    if extractions:
                        # Show first extraction
                        first_ext = extractions[0]
                        print(f"\nFirst extraction:")
                        print(f"  Text: \"{first_ext.get('text', '')[:80]}...\"")
                        print(f"  Page: {first_ext.get('page')}")
                        print(f"  Has bbox: {'bbox' in first_ext}")

                        if 'bbox' in first_ext:
                            bbox = first_ext['bbox']
                            bbox_type = type(bbox).__name__
                            print(f"  BBox type: {bbox_type}")

                            if isinstance(bbox, dict):
                                print(f"  BBox (dict): x={bbox.get('x')}, y={bbox.get('y')}, width={bbox.get('width')}, height={bbox.get('height')}")
                            elif isinstance(bbox, list):
                                print(f"  BBox (array): {bbox}")
                                if len(bbox) == 4:
                                    print(f"  Interpreted: [x={bbox[0]}, y={bbox[1]}, width={bbox[2]}, height={bbox[3]}]")
                            else:
                                print(f"  BBox (other): {bbox}")

                        # If multiple extractions, show second one
                        if len(extractions) > 1:
                            second_ext = extractions[1]
                            print(f"\nSecond extraction:")
                            print(f"  Text: \"{second_ext.get('text', '')[:80]}...\"")
                            print(f"  Page: {second_ext.get('page')}")
                            print(f"  Has bbox: {'bbox' in second_ext}")

                    print()
                    sample_count += 1

                print()
                print("=== DATA QUALITY VERIFICATION ===")

                # Check all extractions for page numbers and bbox
                total_extractions = 0
                missing_page = 0
                missing_bbox = 0
                pages_found = set()

                for field_id, field_data in fields.items():
                    extractions = field_data.get('extractions', [])
                    for ext in extractions:
                        total_extractions += 1
                        page = ext.get('page')
                        bbox = ext.get('bbox')

                        if page is None:
                            missing_page += 1
                        else:
                            pages_found.add(page)

                        if not bbox:
                            missing_bbox += 1

                print(f"Total extractions: {total_extractions}")
                print(f"Missing page numbers: {missing_page}")
                print(f"Missing bbox data: {missing_bbox}")
                print(f"Unique pages found: {sorted(pages_found)}")
                print(f"Page numbering: {'1-based' if 1 in pages_found and 0 not in pages_found else '0-based' if 0 in pages_found else 'mixed/unknown'}")

                if missing_page == 0 and missing_bbox == 0:
                    print("\n✅ DATA QUALITY: EXCELLENT - All extractions have page numbers and bbox")
                elif missing_page > 0:
                    print(f"\n⚠️  DATA QUALITY: WARNING - {missing_page} extractions missing page numbers")
                elif missing_bbox > 0:
                    print(f"\n⚠️  DATA QUALITY: WARNING - {missing_bbox} extractions missing bbox")
            else:
                print("⚠️  No 'fields' key in response")
                print(f"Response structure: {json.dumps(data, indent=2)[:1000]}")

        else:
            print(f"❌ Results endpoint failed")
            print(f"Response: {resp.text[:500]}")

    except Exception as e:
        print(f"❌ Error: {e}")
        import traceback
        traceback.print_exc()

    print()
    print("=" * 80)
    print("TEST COMPLETE")
    print("=" * 80)

if __name__ == "__main__":
    test_extraction_api()
