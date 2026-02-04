#!/usr/bin/env python3
import sqlite3
import json

conn = sqlite3.connect("/app/database/omega.db")
cursor = conn.cursor()

# Get credit agreement extractions
cursor.execute("""
    SELECT e.id, e.document_id, e.results, d.filename
    FROM extractions e
    LEFT JOIN documents d ON e.document_id = d.id
    WHERE e.workflow_id = 35
    ORDER BY e.created_at DESC
    LIMIT 1
""")

row = cursor.fetchone()

if row:
    extraction_id, document_id, results_json, filename = row
    print(f"Document: {filename}")
    print(f"Extraction ID: {extraction_id}")
    print()

    results = json.loads(results_json)

    print(f"Total field IDs in results: {len(results)}")
    print()
    print("Field IDs and extraction counts:")
    print("-" * 80)

    for field_id, extractions in results.items():
        count = len(extractions) if isinstance(extractions, list) else 0
        sample_text = ""
        if count > 0:
            sample_text = extractions[0].get('text', '')[:60]

        print(f"{field_id}: {count} extraction(s)")
        if sample_text:
            print(f"  Sample: {sample_text}")
        print()

    print("-" * 80)
    print("\nNow let's check the fields table to see what these IDs map to:")
    print()

    cursor.execute("SELECT id, name, description FROM fields WHERE id IN ({})".format(
        ','.join(['?' for _ in results.keys()])
    ), list(results.keys()))

    fields = cursor.fetchall()
    print(f"Found {len(fields)} matching fields in the fields table:")
    for field in fields:
        field_id, name, desc = field
        extraction_count = len(results.get(field_id, []))
        print(f"\n{name}")
        print(f"  ID: {field_id}")
        print(f"  Extractions: {extraction_count}")
        if desc:
            print(f"  Description: {desc[:100]}")

conn.close()
