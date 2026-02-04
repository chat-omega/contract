#!/usr/bin/env python3
"""
Check highlighting data for any field ID.
Usage: python check_field.py [field_id]
"""

import sqlite3
import json
import sys

DB_PATH = "/app/database/omega.db"

def check_field(field_id):
    conn = sqlite3.connect(DB_PATH)
    cursor = conn.cursor()

    # Get field name
    cursor.execute("SELECT name FROM fields WHERE field_id = ?", (field_id,))
    row = cursor.fetchone()
    field_name = row[0] if row else "Unknown Field"

    print("=" * 80)
    print(f"FIELD: {field_name}")
    print(f"ID: {field_id}")
    print("=" * 80)
    print()

    # Get all extractions with this field
    cursor.execute("""
        SELECT e.id, e.document_id, e.results, d.filename
        FROM extractions e
        LEFT JOIN documents d ON e.document_id = d.id
        WHERE e.workflow_id = 35
        ORDER BY e.created_at DESC
    """)

    documents = cursor.fetchall()
    total_extractions = 0
    total_working = 0

    for doc in documents:
        extraction_id, document_id, results_json, filename = doc
        results = json.loads(results_json)

        if field_id not in results:
            continue

        extractions = results[field_id]
        if not extractions:
            continue

        print(f"📄 {filename}")
        print(f"   Document ID: {document_id}")
        print(f"   Extraction ID: {extraction_id}")
        print(f"   Extractions: {len(extractions)}")
        print()

        for i, ext in enumerate(extractions, 1):
            total_extractions += 1

            page = ext.get('page')
            spans = ext.get('spans', [])

            has_page = page is not None
            has_bbox = False

            for span in spans:
                if span.get('bounds') or span.get('bboxes'):
                    has_bbox = True
                    break

            if has_page and has_bbox:
                total_working += 1
                status = "✅"
            else:
                status = "❌"

            print(f"   {status} Extraction {i}:")
            print(f"      Page: {page}")
            print(f"      Has bbox: {has_bbox}")
            print(f"      Text: {ext.get('text', '')[:60]}...")

            if has_bbox and spans:
                bounds = spans[0].get('bounds')
                if bounds:
                    print(f"      Coords: ({bounds['left']}, {bounds['top']}) to ({bounds['right']}, {bounds['bottom']})")
            print()

    conn.close()

    print("=" * 80)
    print("SUMMARY")
    print("=" * 80)
    print(f"Total extractions: {total_extractions}")
    print(f"Working (with page & bbox): {total_working}")
    print(f"Missing data: {total_extractions - total_working}")
    print(f"Success rate: {100 * total_working / total_extractions if total_extractions > 0 else 0:.1f}%")
    print()

    if total_working == total_extractions and total_extractions > 0:
        print("✅ All extractions have complete highlighting data!")
    elif total_extractions == 0:
        print("⚠️  No extractions found for this field")
    else:
        print("❌ Some extractions are missing highlighting data")

if __name__ == "__main__":
    if len(sys.argv) > 1:
        field_id = sys.argv[1]
    else:
        # Default to target field
        field_id = "8d6970e4-1a44-4f4d-8fcf-3140a6634213"
        print(f"No field ID provided, using default: {field_id}")
        print()

    check_field(field_id)
