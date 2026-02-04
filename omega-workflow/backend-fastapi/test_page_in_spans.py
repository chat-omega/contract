#!/usr/bin/env python3
"""Check if page numbers are in spans data"""
import sys
sys.path.insert(0, '/app')

import asyncio
import json
from database_async import AsyncDatabase

async def check_page_in_spans():
    db = AsyncDatabase('/app/database/omega.db')

    doc_id = 'e37f9df8'
    wf_id = 14

    print(f"\nChecking spans data for document: {doc_id}")
    print('='*80)

    extraction = await db.get_extraction_by_document_workflow(doc_id, wf_id)

    if not extraction or extraction['status'] != 'complete':
        print("No complete extraction found")
        return

    extraction_data = extraction.get('results', {})

    # Just check first few extractions
    count = 0
    for field_id, field_results in extraction_data.items():
        extractions_list = field_results if isinstance(field_results, list) else [field_results]

        for ext in extractions_list:
            count += 1
            if count > 3:  # Only check first 3
                break

            text = ext.get('text', '')[:40]
            page = ext.get('page')
            spans = ext.get('spans', [])

            print(f"\nExtraction {count}:")
            print(f"  Text: {text}...")
            print(f"  page field: {page}")
            print(f"  Has spans: {len(spans) > 0}")

            if spans and len(spans) > 0:
                first_span = spans[0]
                print(f"  First span keys: {list(first_span.keys())}")

                # Check for page in span
                if 'page' in first_span:
                    print(f"  ✅ Page in span: {first_span['page']}")
                else:
                    print(f"  ❌ No 'page' key in span")

                # Check bbox structure
                bboxes = first_span.get('bboxes', [])
                if bboxes and len(bboxes) > 0:
                    first_bbox = bboxes[0]
                    print(f"  Bbox keys: {list(first_bbox.keys())}")

                    # Check if page is in bbox
                    if 'page' in first_bbox:
                        print(f"  ✅ Page in bbox: {first_bbox['page']}")

                    bounds = first_bbox.get('bounds', [])
                    if bounds and len(bounds) > 0:
                        print(f"  Bounds keys: {list(bounds[0].keys())}")

        if count > 3:
            break

asyncio.run(check_page_in_spans())
