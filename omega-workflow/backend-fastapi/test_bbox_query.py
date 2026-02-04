#!/usr/bin/env python3
import sqlite3
import json
import sys

def analyze_extraction(doc_id):
    conn = sqlite3.connect('/app/database/omega.db')
    cursor = conn.cursor()

    print(f"\n{'='*80}")
    print(f"DOCUMENT: {doc_id}")
    print('='*80)

    # Get extraction record
    cursor.execute('''
        SELECT id, document_id, status, workflow_id, results, answer_metadata
        FROM extractions
        WHERE document_id = ?
    ''', (doc_id,))

    extraction = cursor.fetchone()

    if not extraction:
        print(f"No extraction found for document {doc_id}")
        return

    extraction_id, doc_id_db, status, workflow_id, results_json, answer_metadata = extraction
    print(f"Extraction ID: {extraction_id}")
    print(f"Status: {status}")
    print(f"Workflow ID: {workflow_id}")

    # Parse results
    if results_json:
        try:
            results = json.loads(results_json)
            print(f"\nTotal fields in results: {len(results)}")

            # Analyze each field
            for field_id, field_data in results.items():
                extractions = field_data if isinstance(field_data, list) else [field_data]

                for idx, ext in enumerate(extractions):
                    has_bbox = ext.get('bbox') is not None
                    has_spans = ext.get('spans') is not None

                    # Try to extract bbox from spans
                    bbox_from_spans = None
                    if has_spans and not has_bbox:
                        spans = ext.get('spans', [])
                        if spans and len(spans) > 0:
                            first_span = spans[0]
                            bboxes = first_span.get('bboxes', [])
                            if bboxes and len(bboxes) > 0:
                                first_bbox_obj = bboxes[0]
                                bounds = first_bbox_obj.get('bounds', [])
                                if bounds and len(bounds) > 0:
                                    bound = bounds[0]
                                    bbox_from_spans = [
                                        bound.get('left'),
                                        bound.get('bottom'),
                                        bound.get('right'),
                                        bound.get('top')
                                    ]

                    text = ext.get('text', '')[:40]
                    page = ext.get('page')

                    bbox_status = "HAS_BBOX" if has_bbox else ("CAN_EXTRACT_FROM_SPANS" if bbox_from_spans else "NO_BBOX")

                    print(f"\n  Field: {field_id}")
                    print(f"    Status: {bbox_status}")
                    print(f"    Text: {text}...")
                    print(f"    Page: {page}")
                    print(f"    Has spans: {has_spans}")
                    if bbox_from_spans:
                        print(f"    Bbox from spans: {bbox_from_spans}")
                    if has_bbox:
                        print(f"    Bbox: {ext.get('bbox')}")

        except Exception as e:
            print(f"Error parsing results: {e}")
            import traceback
            traceback.print_exc()

    conn.close()

# Test both documents
for doc_id in ['37fb6240', 'e37f9df8']:
    analyze_extraction(doc_id)
