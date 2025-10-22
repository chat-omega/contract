#!/usr/bin/env python3
"""
Test script for the new extraction results endpoint
"""

import requests
import json

# Configuration
BASE_URL = "http://localhost:5001"
TEST_USER = "admin"
TEST_PASSWORD = "admin123"

def test_extraction_results_endpoint():
    """Test the extraction results endpoint"""

    print("=" * 60)
    print("Testing Extraction Results Endpoint")
    print("=" * 60)

    # Step 1: Login
    print("\n1. Logging in...")
    login_response = requests.post(
        f"{BASE_URL}/api/auth/login",
        json={"username": TEST_USER, "password": TEST_PASSWORD}
    )

    if login_response.status_code != 200:
        print(f"❌ Login failed: {login_response.status_code}")
        print(f"   Response: {login_response.text}")
        return False

    login_data = login_response.json()
    token = login_data.get('token')
    print(f"✅ Login successful! Token: {token[:20]}...")

    headers = {"Authorization": f"Bearer {token}"}

    # Step 2: Get documents
    print("\n2. Getting documents...")
    docs_response = requests.get(
        f"{BASE_URL}/api/documents",
        headers=headers
    )

    if docs_response.status_code != 200:
        print(f"❌ Failed to get documents: {docs_response.status_code}")
        return False

    documents = docs_response.json()
    print(f"✅ Found {len(documents)} documents")

    if not documents:
        print("⚠️  No documents found, cannot test extraction endpoint")
        return True

    # Use first document for testing
    test_doc = documents[0]
    doc_id = test_doc['id']
    print(f"   Testing with document: {doc_id} - {test_doc.get('name')}")

    # Step 3: Get workflows for document
    print("\n3. Getting workflows for document...")
    workflows_response = requests.get(
        f"{BASE_URL}/api/documents/{doc_id}/workflows",
        headers=headers
    )

    if workflows_response.status_code != 200:
        print(f"❌ Failed to get workflows: {workflows_response.status_code}")
        return False

    workflows_data = workflows_response.json()
    workflow_ids = workflows_data.get('workflowIds', [])
    print(f"✅ Document has {len(workflow_ids)} workflows assigned")

    # Step 4: Test extraction results endpoint WITHOUT workflow_id
    print("\n4. Testing GET /api/documents/{doc_id}/extraction/results (all workflows)...")
    results_response = requests.get(
        f"{BASE_URL}/api/documents/{doc_id}/extraction/results",
        headers=headers
    )

    print(f"   Status Code: {results_response.status_code}")

    if results_response.status_code == 200:
        results_data = results_response.json()
        print(f"✅ Response received!")
        print(f"   Status: {results_data.get('status')}")
        print(f"   Message: {results_data.get('message', 'N/A')}")
        print(f"   Workflow Count: {results_data.get('workflowCount', 0)}")
        print(f"\n   Full Response:")
        print(json.dumps(results_data, indent=2))
    else:
        print(f"❌ Request failed")
        print(f"   Response: {results_response.text}")

    # Step 5: Test extraction results endpoint WITH workflow_id
    if workflow_ids:
        workflow_id = workflow_ids[0]
        print(f"\n5. Testing GET /api/documents/{doc_id}/extraction/results?workflow_id={workflow_id}...")
        results_response = requests.get(
            f"{BASE_URL}/api/documents/{doc_id}/extraction/results",
            params={"workflow_id": workflow_id},
            headers=headers
        )

        print(f"   Status Code: {results_response.status_code}")

        if results_response.status_code == 200:
            results_data = results_response.json()
            print(f"✅ Response received!")
            print(f"   Status: {results_data.get('status')}")
            print(f"   Message: {results_data.get('message', 'N/A')}")
            print(f"   Workflow Name: {results_data.get('workflowName', 'N/A')}")
            print(f"   Field Count: {results_data.get('fieldCount', 0)}")
            print(f"\n   Full Response:")
            print(json.dumps(results_data, indent=2))
        else:
            print(f"❌ Request failed")
            print(f"   Response: {results_response.text}")

    print("\n" + "=" * 60)
    print("✅ Test completed successfully!")
    print("=" * 60)
    return True

if __name__ == "__main__":
    try:
        test_extraction_results_endpoint()
    except Exception as e:
        print(f"\n❌ Test failed with error: {e}")
        import traceback
        traceback.print_exc()
