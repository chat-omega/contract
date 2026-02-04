#!/usr/bin/env python3
"""Verify the fix by adding page extraction to _enrich_extraction_bbox"""
import sys
sys.path.insert(0, '/app')

import asyncio
import json
from database_async import AsyncDatabase

def _enrich_extraction_bbox_FIXED(extraction):
    """
    FIXED VERSION: Enrich extraction with bbox AND page from spans if missing
    """
    # If bbox already exists, return as-is
    if extraction.get('bbox') is not None:
        # But still extract page if missing
        if extraction.get('page') is None:
            spans = extraction.get('spans', [])
            if spans and len(spans) > 0:
                first_span = spans[0]
                bboxes = first_span.get('bboxes', [])
                if bboxes and len(bboxes) > 0:
                    first_bbox_obj = bboxes[0]
                    page = first_bbox_obj.get('page')
                    if page is not None:
                        extraction['page'] = page
        return extraction

    # Try to extract bbox AND page from spans
    spans = extraction.get('spans', [])
    if spans and len(spans) > 0:
        first_span = spans[0]
        bboxes = first_span.get('bboxes', [])
        if bboxes and len(bboxes) > 0:
            first_bbox_obj = bboxes[0]

            # Extract page number (THE FIX!)
            page = first_bbox_obj.get('page')
            if page is not None and extraction.get('page') is None:
                extraction['page'] = page

            bounds = first_bbox_obj.get('bounds', [])
            if bounds and len(bounds) > 0:
                bound = bounds[0]
                # Convert to [left, bottom, right, top] format for PDF coordinates
                extraction['bbox'] = [
                    bound.get('left'),
                    bound.get('bottom'),
                    bound.get('right'),
                    bound.get('top')
                ]

    return extraction

async def test_fix():
    db = AsyncDatabase('/app/database/omega.db')

    doc_id = 'e37f9df8'
    wf_id = 14

    print(f"\nTesting fix for document: {doc_id}")
    print('='*80)

    extraction = await db.get_extraction_by_document_workflow(doc_id, wf_id)

    if not extraction or extraction['status'] != 'complete':
        print("No complete extraction found")
        return

    extraction_data = extraction.get('results', {})

    # Test the fixed function
    bbox_count = 0
    page_count = 0
    both_count = 0

    for field_id, field_results in extraction_data.items():
        extractions_list = field_results if isinstance(field_results, list) else [field_results]

        for ext in extractions_list:
            # Apply FIXED enrichment
            enriched = _enrich_extraction_bbox_FIXED(ext.copy())

            has_bbox = enriched.get('bbox') is not None
            has_page = enriched.get('page') is not None

            if has_bbox:
                bbox_count += 1
            if has_page:
                page_count += 1
            if has_bbox and has_page:
                both_count += 1

    total = bbox_count  # Assume all should have bbox
    print(f"\nResults with FIXED enrichment:")
    print(f"  Extractions with bbox: {bbox_count}")
    print(f"  Extractions with page: {page_count}")
    print(f"  Extractions with BOTH bbox AND page: {both_count}")

    if both_count == page_count == bbox_count == 57:
        print(f"\n✅ SUCCESS! All {both_count} extractions now have BOTH bbox and page!")
        print("This will fix the highlighting bug.")
    else:
        print(f"\n❌ Not all extractions enriched correctly")

    # Show a sample
    print(f"\nSample enriched extraction:")
    for field_id, field_results in list(extraction_data.items())[:1]:
        extractions_list = field_results if isinstance(field_results, list) else [field_results]
        enriched = _enrich_extraction_bbox_FIXED(extractions_list[0].copy())
        print(f"  Text: {enriched.get('text', '')[:40]}...")
        print(f"  Page: {enriched.get('page')}")
        print(f"  Bbox: {enriched.get('bbox')}")

asyncio.run(test_fix())
