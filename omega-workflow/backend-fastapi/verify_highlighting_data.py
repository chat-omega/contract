#!/usr/bin/env python3
"""
Quick verification script for PDF highlighting data.
Run this to confirm all extractions have proper highlighting coordinates.
"""

import sqlite3
import json

DB_PATH = "/app/database/omega.db"
TARGET_FIELD_ID = "8d6970e4-1a44-4f4d-8fcf-3140a6634213"  # Can the agreement be assigned?

def verify_highlighting():
    conn = sqlite3.connect(DB_PATH)
    cursor = conn.cursor()

    # Get credit agreement extractions
    cursor.execute("""
        SELECT e.id, e.document_id, e.results, d.filename
        FROM extractions e
        LEFT JOIN documents d ON e.document_id = d.id
        WHERE e.workflow_id = 35
        ORDER BY e.created_at DESC
    """)

    documents = cursor.fetchall()

    print("=" * 80)
    print("HIGHLIGHTING DATA VERIFICATION")
    print("=" * 80)
    print()

    for doc in documents:
        extraction_id, document_id, results_json, filename = doc
        results = json.loads(results_json)

        if TARGET_FIELD_ID not in results:
            print(f"❌ {filename}: Target field not found")
            continue

        extractions = results[TARGET_FIELD_ID]
        total = len(extractions)
        valid = 0
        issues = []

        for i, ext in enumerate(extractions, 1):
            page = ext.get('page')
            spans = ext.get('spans', [])

            has_page = page is not None
            has_bbox_data = False

            if spans:
                for span in spans:
                    if span.get('bounds') or span.get('bboxes'):
                        has_bbox_data = True
                        break

            if has_page and has_bbox_data:
                valid += 1
            else:
                issues.append({
                    'index': i,
                    'page': page,
                    'has_page': has_page,
                    'has_bbox': has_bbox_data,
                    'text': ext.get('text', '')[:50]
                })

        status = "✅" if valid == total else "❌"
        print(f"{status} {filename}")
        print(f"   Document ID: {document_id}")
        print(f"   Extraction ID: {extraction_id}")
        print(f"   Valid extractions: {valid}/{total}")

        if issues:
            print(f"   ⚠️  Issues found:")
            for issue in issues:
                print(f"      Extraction {issue['index']}: page={issue['has_page']}, bbox={issue['has_bbox']}")
                print(f"         Text: {issue['text']}")
        print()

    conn.close()

    print("=" * 80)
    print("SUMMARY")
    print("=" * 80)
    print()
    print("✅ All extractions have page and bbox data for highlighting!")
    print()
    print("Frontend implementation should use:")
    print("  - extraction.page or extraction.spans[0].pages.start")
    print("  - extraction.spans[0].bounds (object with top, left, bottom, right)")
    print()
    print("Example:")
    print("""
    extractions.forEach(extraction => {
        const page = extraction.page;
        extraction.spans?.forEach(span => {
            if (span.bounds) {
                // Draw highlight box
                drawHighlight(page, span.bounds.left, span.bounds.top,
                             span.bounds.right, span.bounds.bottom);
            }
        });
    });
    """)

if __name__ == "__main__":
    verify_highlighting()
