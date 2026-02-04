#!/usr/bin/env python3
"""
Show exactly what data the frontend receives for highlighting.
This simulates what the API endpoint returns.
"""

import sqlite3
import json

DB_PATH = "/app/database/omega.db"
TARGET_FIELD_ID = "8d6970e4-1a44-4f4d-8fcf-3140a6634213"  # Can the agreement be assigned?

def show_frontend_data():
    conn = sqlite3.connect(DB_PATH)
    cursor = conn.cursor()

    # Get one document's extractions (BuzzFeed Agreement)
    cursor.execute("""
        SELECT e.results, d.filename
        FROM extractions e
        LEFT JOIN documents d ON e.document_id = d.id
        WHERE e.workflow_id = 35 AND e.document_id = 'e37f9df8'
        LIMIT 1
    """)

    row = cursor.fetchone()
    if not row:
        print("Document not found")
        return

    results_json, filename = row
    results = json.loads(results_json)

    print("=" * 80)
    print(f"FRONTEND DATA STRUCTURE - {filename}")
    print("=" * 80)
    print()

    if TARGET_FIELD_ID in results:
        extractions = results[TARGET_FIELD_ID]

        print(f"Field: 'Can the agreement be assigned?'")
        print(f"Total extractions: {len(extractions)}")
        print()

        # Show first extraction in detail
        print("SAMPLE EXTRACTION #1 (full structure):")
        print("-" * 80)
        print(json.dumps(extractions[0], indent=2))
        print()

        # Show highlighting coordinates for all extractions
        print("=" * 80)
        print("HIGHLIGHTING COORDINATES FOR ALL EXTRACTIONS")
        print("=" * 80)
        print()

        for i, ext in enumerate(extractions, 1):
            print(f"Extraction {i}:")
            print(f"  Text: {ext['text'][:70]}...")
            print(f"  Page: {ext['page']}")
            print(f"  Confidence: {ext['confidence']:.4f}")

            if ext.get('spans'):
                for j, span in enumerate(ext['spans'], 1):
                    bounds = span.get('bounds')
                    if bounds:
                        print(f"  Span {j} bounds:")
                        print(f"    top: {bounds['top']}, left: {bounds['left']}")
                        print(f"    bottom: {bounds['bottom']}, right: {bounds['right']}")

                    # Check for alternative bbox format
                    if span.get('bboxes'):
                        print(f"  Span {j} has 'bboxes' array: {len(span['bboxes'])} bbox(es)")
            print()

    conn.close()

    print("=" * 80)
    print("IMPLEMENTATION GUIDE")
    print("=" * 80)
    print()
    print("To implement highlighting in the frontend:")
    print()
    print("1. Get the extraction results from the API")
    print("2. For each extraction, use:")
    print("   - extraction.page -> which page to highlight on")
    print("   - extraction.spans[].bounds -> coordinates for the highlight box")
    print()
    print("3. The bounds object has:")
    print("   - top: y-coordinate of top edge")
    print("   - left: x-coordinate of left edge")
    print("   - bottom: y-coordinate of bottom edge")
    print("   - right: x-coordinate of right edge")
    print()
    print("4. These coordinates are in PDF coordinate space")
    print("   (origin at top-left, measured in points)")
    print()
    print("5. PDF.js example:")
    print("""
    const viewport = page.getViewport({ scale: 1.0 });
    const canvas = document.createElement('canvas');
    const context = canvas.getContext('2d');

    // For each span with bounds
    const [x1, y1, x2, y2] = [
        bounds.left,
        bounds.top,
        bounds.right,
        bounds.bottom
    ];

    // Draw highlight rectangle
    context.fillStyle = 'rgba(255, 255, 0, 0.3)';
    context.fillRect(x1, y1, x2 - x1, y2 - y1);
    """)

if __name__ == "__main__":
    show_frontend_data()
