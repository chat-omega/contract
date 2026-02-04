#!/usr/bin/env python3
"""Make an actual API call to test the response"""
import requests
import json

# Test with document e37f9df8 which should have bbox extracted from spans
doc_id = 'e37f9df8'
workflow_id = 14

url = f'http://localhost:5000/api/documents/{doc_id}/extraction/results?workflow_id={workflow_id}'

print(f"Making API call to: {url}")
print("Note: This may fail if auth is required\n")

try:
    response = requests.get(url)
    print(f"Status code: {response.status_code}")

    if response.status_code == 200:
        data = response.json()

        print(f"\nResponse keys: {list(data.keys())}")
        print(f"Status: {data.get('status')}")
        print(f"Field count: {data.get('fieldCount')}")

        if 'fields' in data:
            fields = data['fields']
            print(f"\nTotal fields in response: {len(fields)}")

            # Check a few fields for bbox
            sample_fields = list(fields.items())[:3]
            for field_id, field_data in sample_fields:
                extractions = field_data.get('extractions', [])
                print(f"\nField: {field_id}")
                print(f"  Extraction count: {len(extractions)}")

                if extractions:
                    first_ext = extractions[0]
                    has_bbox = first_ext.get('bbox') is not None
                    text = first_ext.get('text', '')[:40]
                    page = first_ext.get('page')

                    print(f"  First extraction:")
                    print(f"    Has bbox: {has_bbox}")
                    print(f"    Text: {text}...")
                    print(f"    Page: {page}")
                    if has_bbox:
                        print(f"    Bbox: {first_ext.get('bbox')}")

    elif response.status_code == 401:
        print("\n⚠️ Authentication required - cannot test API without token")
    else:
        print(f"\nResponse: {response.text[:500]}")

except requests.exceptions.ConnectionError:
    print("❌ Connection error - is the backend running?")
except Exception as e:
    print(f"❌ Error: {e}")
