#!/usr/bin/env python3
import sqlite3
import json

conn = sqlite3.connect("/app/database/omega.db")
cursor = conn.cursor()

# Get credit agreement extractions
cursor.execute("""
    SELECT e.results
    FROM extractions e
    WHERE e.workflow_id = 35
    ORDER BY e.created_at DESC
    LIMIT 1
""")

row = cursor.fetchone()
results = json.loads(row[0])
field_ids = list(results.keys())

print(f"Found {len(field_ids)} field IDs in extraction results")
print()

# Get field names
cursor.execute(f"""
    SELECT field_id, name, description
    FROM fields
    WHERE field_id IN ({','.join(['?' for _ in field_ids])})
""", field_ids)

fields_map = {}
for row in cursor.fetchall():
    fields_map[row[0]] = {
        'name': row[1],
        'description': row[2]
    }

print("Field ID mapping:")
print("="*80)
for field_id in field_ids:
    extraction_count = len(results[field_id])
    field_info = fields_map.get(field_id, {'name': 'UNKNOWN', 'description': None})

    print(f"\n{field_info['name']}")
    print(f"  ID: {field_id}")
    print(f"  Extractions: {extraction_count}")

    if extraction_count > 0:
        sample = results[field_id][0]
        has_page = sample.get('page') is not None
        has_bbox = sample.get('bbox') is not None
        has_spans_bbox = False

        spans = sample.get('spans', [])
        if spans and isinstance(spans, list):
            for span in spans:
                if span.get('bounds') or span.get('bbox') or span.get('bboxes'):
                    has_spans_bbox = True
                    break

        status = "✅" if (has_page and (has_bbox or has_spans_bbox)) else "❌"
        print(f"  Status: {status} (page={has_page}, bbox={has_bbox}, spans_bbox={has_spans_bbox})")
        print(f"  Sample text: {sample.get('text', '')[:60]}")

conn.close()
