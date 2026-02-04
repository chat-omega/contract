#!/usr/bin/env python3
import sqlite3
import json

conn = sqlite3.connect("/app/database/omega.db")
cursor = conn.cursor()

# Get credit agreement extractions (workflow_id = 35)
cursor.execute("""
    SELECT e.id, e.document_id, e.workflow_id, e.results, d.filename
    FROM extractions e
    LEFT JOIN documents d ON e.document_id = d.id
    WHERE e.workflow_id = 35
    LIMIT 1
""")

row = cursor.fetchone()

if not row:
    print("No credit agreement extractions found (workflow_id=35)")
    print("\nLet me check what workflow IDs exist:")
    cursor.execute("SELECT DISTINCT workflow_id FROM extractions")
    workflows = cursor.fetchall()
    print("Available workflow IDs:")
    for wf in workflows:
        print(f"  - {wf[0]}")
else:
    extraction_id, document_id, workflow_id, results_json, filename = row
    print(f"Found credit agreement extraction:")
    print(f"  Extraction ID: {extraction_id}")
    print(f"  Document ID: {document_id}")
    print(f"  Filename: {filename}")
    print(f"  Workflow ID: {workflow_id}")
    print()

    if results_json:
        try:
            results = json.loads(results_json)
            print("Results structure:")
            print(f"  Type: {type(results)}")

            if isinstance(results, dict):
                print(f"  Keys: {list(results.keys())}")

                # Show first field
                if results:
                    first_key = list(results.keys())[0]
                    print(f"\nSample field ('{first_key}'):")
                    print(json.dumps(results[first_key], indent=2)[:500])
            elif isinstance(results, list):
                print(f"  Length: {len(results)}")
                if results:
                    print(f"\nFirst item:")
                    print(json.dumps(results[0], indent=2)[:500])

        except Exception as e:
            print(f"Error parsing results JSON: {e}")
            print(f"Raw results (first 500 chars): {results_json[:500]}")
    else:
        print("No results found")

conn.close()
