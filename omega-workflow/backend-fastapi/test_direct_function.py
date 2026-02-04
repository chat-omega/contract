#!/usr/bin/env python3
"""Test the _get_single_workflow_results function directly"""
import sys
sys.path.insert(0, '/app')

import asyncio
import json

# Import the function from main
exec(open('/app/main.py').read(), globals())

async def test_function():
    doc_id = 'e37f9df8'
    workflow_id = 14

    print(f"Testing _get_single_workflow_results for doc={doc_id}, workflow={workflow_id}\n")

    result = await _get_single_workflow_results(doc_id, workflow_id)

    print(f"Status: {result.get('status')}")
    print(f"Field count: {result.get('fieldCount')}")

    if 'fields' in result:
        fields = result['fields']
        print(f"\nTotal fields in response: {len(fields)}")

        # Check first few fields
        bbox_count = 0
        no_bbox_count = 0

        for field_id, field_data in list(fields.items())[:5]:
            extractions = field_data.get('extractions', [])

            for ext in extractions:
                has_bbox = ext.get('bbox') is not None
                if has_bbox:
                    bbox_count += 1
                else:
                    no_bbox_count += 1

                text = ext.get('text', '')[:40]
                page = ext.get('page')

                print(f"\nField: {field_id}")
                print(f"  Has bbox: {has_bbox}")
                print(f"  Bbox: {ext.get('bbox')}")
                print(f"  Text: {text}...")
                print(f"  Page: {page}")
                break  # Just check first extraction

        print(f"\nSummary of first 5 fields:")
        print(f"  With bbox: {bbox_count}")
        print(f"  Without bbox: {no_bbox_count}")

        if bbox_count > 0:
            print("\n✅ SUCCESS: API is returning bbox data!")
        else:
            print("\n❌ FAIL: API is NOT returning bbox data")

asyncio.run(test_function())
