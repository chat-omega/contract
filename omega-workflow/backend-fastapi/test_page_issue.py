#!/usr/bin/env python3
"""Check if page numbers are being set in extraction data"""
import sys
sys.path.insert(0, '/app')

import asyncio
import json
from database_async import AsyncDatabase

async def check_page_numbers():
    db = AsyncDatabase('/app/database/omega.db')

    doc_id = 'e37f9df8'
    wf_id = 14

    print(f"\nChecking page numbers for document: {doc_id}")
    print('='*80)

    extraction = await db.get_extraction_by_document_workflow(doc_id, wf_id)

    if not extraction or extraction['status'] != 'complete':
        print("No complete extraction found")
        return

    extraction_data = extraction.get('results', {})

    print(f"Total fields: {len(extraction_data)}\n")

    # Check page numbers
    has_page_count = 0
    no_page_count = 0

    for field_id, field_results in extraction_data.items():
        extractions_list = field_results if isinstance(field_results, list) else [field_results]

        for ext in extractions_list:
            page = ext.get('page')
            bbox = ext.get('bbox')
            text = ext.get('text', '')[:40]

            if page is not None and page != '':
                has_page_count += 1
            else:
                no_page_count += 1
                print(f"❌ Missing page number:")
                print(f"   Field: {field_id}")
                print(f"   Text: {text}...")
                print(f"   Has bbox: {bbox is not None}")

                # Check if page is in spans
                spans = ext.get('spans', [])
                if spans and len(spans) > 0:
                    first_span = spans[0]
                    span_page = first_span.get('page')
                    print(f"   Page in spans: {span_page}")
                print()

    total = has_page_count + no_page_count
    print(f"\nSummary:")
    print(f"  Extractions with page: {has_page_count}/{total} ({has_page_count*100/total:.1f}%)")
    print(f"  Extractions without page: {no_page_count}/{total} ({no_page_count*100/total:.1f}%)")

    if no_page_count > 0:
        print(f"\n⚠️ ISSUE FOUND: {no_page_count} extractions missing page numbers!")
        print("This prevents highlighting from working even if bbox exists.")

asyncio.run(check_page_numbers())
