#!/usr/bin/env python3
"""Test what the API actually returns to the frontend"""
import sys
import os
sys.path.insert(0, '/app')

import asyncio
from database_async import AsyncDatabase

async def test_api_response():
    # Initialize database
    db = AsyncDatabase('/app/database/omega.db')

    for doc_id in ['37fb6240', 'e37f9df8']:
        print(f"\n{'='*80}")
        print(f"API Response for Document: {doc_id}")
        print('='*80)

        # Simulate what the API endpoint does
        extraction = await db.get_extraction_by_document_workflow(doc_id, 35 if doc_id == '37fb6240' else 14)

        if not extraction:
            print(f"No extraction found")
            continue

        print(f"Status: {extraction['status']}")

        if extraction['status'] != 'complete':
            print(f"Extraction not complete")
            continue

        extraction_data = extraction.get('results', {})

        if not extraction_data:
            print("No results data")
            continue

        print(f"\nTotal fields: {len(extraction_data)}")

        # Count fields with and without bbox
        fields_with_bbox = 0
        fields_without_bbox = 0
        fields_with_spans_no_bbox = 0

        for field_id, field_results in extraction_data.items():
            extractions_list = field_results if isinstance(field_results, list) else [field_results]

            for ext in extractions_list:
                has_bbox = ext.get('bbox') is not None
                has_spans = ext.get('spans') is not None

                if has_bbox:
                    fields_with_bbox += 1
                elif has_spans:
                    # Check if we can extract from spans
                    spans = ext.get('spans', [])
                    if spans and len(spans) > 0:
                        first_span = spans[0]
                        bboxes = first_span.get('bboxes', [])
                        if bboxes and len(bboxes) > 0:
                            first_bbox_obj = bboxes[0]
                            bounds = first_bbox_obj.get('bounds', [])
                            if bounds and len(bounds) > 0:
                                fields_with_spans_no_bbox += 1
                            else:
                                fields_without_bbox += 1
                        else:
                            fields_without_bbox += 1
                    else:
                        fields_without_bbox += 1
                else:
                    fields_without_bbox += 1

        total = fields_with_bbox + fields_without_bbox + fields_with_spans_no_bbox

        print(f"\nField extraction analysis:")
        print(f"  Fields with bbox: {fields_with_bbox}/{total} ({fields_with_bbox*100/total:.1f}%)")
        print(f"  Fields with spans (no bbox): {fields_with_spans_no_bbox}/{total} ({fields_with_spans_no_bbox*100/total:.1f}%)")
        print(f"  Fields without bbox or spans: {fields_without_bbox}/{total} ({fields_without_bbox*100/total:.1f}%)")

        print(f"\n_enrich_extraction_bbox function should convert {fields_with_spans_no_bbox} fields")

asyncio.run(test_api_response())
