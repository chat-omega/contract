#!/usr/bin/env python3
"""Test the complete flow from database to API response"""
import sys
sys.path.insert(0, '/app')

import asyncio
import json
from database_async import AsyncDatabase

def _enrich_extraction_bbox(extraction):
    """
    Enrich extraction with bbox from spans if bbox is null
    """
    # If bbox already exists, return as-is
    if extraction.get('bbox') is not None:
        return extraction

    # Try to extract bbox from spans
    spans = extraction.get('spans', [])
    if spans and len(spans) > 0:
        first_span = spans[0]
        bboxes = first_span.get('bboxes', [])
        if bboxes and len(bboxes) > 0:
            first_bbox_obj = bboxes[0]
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

async def test_full_flow():
    db = AsyncDatabase('/app/database/omega.db')

    for doc_id, wf_id in [('37fb6240', 35), ('e37f9df8', 14)]:
        print(f"\n{'='*80}")
        print(f"Document: {doc_id} | Workflow: {wf_id}")
        print('='*80)

        # Get extraction from database
        extraction = await db.get_extraction_by_document_workflow(doc_id, wf_id)

        if not extraction or extraction['status'] != 'complete':
            print("No complete extraction found")
            continue

        extraction_data = extraction.get('results', {})

        print(f"Total fields: {len(extraction_data)}")

        # Simulate what the API does
        before_enrich_with_bbox = 0
        before_enrich_without_bbox = 0
        after_enrich_with_bbox = 0

        for field_id, field_results in extraction_data.items():
            extractions_list = field_results if isinstance(field_results, list) else [field_results]

            for ext in extractions_list:
                # Count before enrichment
                if ext.get('bbox') is not None:
                    before_enrich_with_bbox += 1
                else:
                    before_enrich_without_bbox += 1

                # Apply enrichment
                enriched = _enrich_extraction_bbox(ext)

                # Count after enrichment
                if enriched.get('bbox') is not None:
                    after_enrich_with_bbox += 1

        total = before_enrich_with_bbox + before_enrich_without_bbox

        print(f"\nBEFORE enrichment:")
        print(f"  With bbox: {before_enrich_with_bbox}/{total} ({before_enrich_with_bbox*100/total:.1f}%)")
        print(f"  Without bbox: {before_enrich_without_bbox}/{total} ({before_enrich_without_bbox*100/total:.1f}%)")

        print(f"\nAFTER enrichment:")
        print(f"  With bbox: {after_enrich_with_bbox}/{total} ({after_enrich_with_bbox*100/total:.1f}%)")

        enriched_count = after_enrich_with_bbox - before_enrich_with_bbox
        print(f"\n✅ Enrichment added bbox to {enriched_count} fields")

        if doc_id == 'e37f9df8' and after_enrich_with_bbox == total:
            print("✅ SUCCESS: All fields now have bbox for document e37f9df8!")
        elif doc_id == 'e37f9df8':
            print(f"⚠️ WARNING: {total - after_enrich_with_bbox} fields still missing bbox")

asyncio.run(test_full_flow())
