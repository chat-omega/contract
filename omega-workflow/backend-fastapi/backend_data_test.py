#!/usr/bin/env python3
"""Test backend extraction data for document e37f9df8"""
import sqlite3
import json

conn = sqlite3.connect('/app/database/omega.db')
cursor = conn.cursor()

print('=' * 80)
print('BACKEND EXTRACTION DATA TEST FOR DOCUMENT e37f9df8')
print('=' * 80)
print()

# Get extraction record
cursor.execute('''
    SELECT id, document_id, workflow_id, status, results
    FROM extractions
    WHERE document_id = 'e37f9df8' AND workflow_id = 14
''')

row = cursor.fetchone()

if not row:
    print('No extraction found')
    exit(1)

ext_id, doc_id, workflow_id, status, results_json = row

print(f'Extraction ID: {ext_id}')
print(f'Document ID: {doc_id}')
print(f'Workflow ID: {workflow_id}')
print(f'Status: {status}')
print()

results = json.loads(results_json)

# Get field names
cursor.execute('SELECT field_id, name FROM fields')
field_names = {row[0]: row[1] for row in cursor.fetchall()}

print(f'Total fields: {len(results)}')
print()

# Sample 3 fields
sample_count = 0
for field_id, extractions in results.items():
    if sample_count >= 3:
        break

    field_name = field_names.get(field_id, 'Unknown')
    print(f'Field: {field_name} ({field_id})')
    print(f'  Extractions: {len(extractions)}')

    if extractions:
        ext = extractions[0]
        print(f'  Text: "{ext.get("text", "")[:60]}..."')
        print(f'  Page: {ext.get("page")}')
        bbox = ext.get('bbox')
        if isinstance(bbox, list) and len(bbox) == 4:
            print(f'  BBox: [x={bbox[0]}, y={bbox[1]}, w={bbox[2]}, h={bbox[3]}]')
        elif bbox:
            print(f'  BBox: {bbox}')
        else:
            print(f'  BBox: MISSING')
    print()
    sample_count += 1

# Data quality check
total = 0
missing_page = 0
missing_bbox = 0
pages = set()

for field_id, extractions in results.items():
    for ext in extractions:
        total += 1
        if ext.get('page') is None:
            missing_page += 1
        else:
            pages.add(ext.get('page'))
        if not ext.get('bbox'):
            missing_bbox += 1

print('=' * 80)
print('DATA QUALITY SUMMARY')
print('=' * 80)
print(f'Total extractions: {total}')
print(f'Missing page numbers: {missing_page}')
print(f'Missing bbox: {missing_bbox}')
print(f'Unique pages: {len(pages)}')
if pages:
    print(f'Page range: {min(pages)} to {max(pages)}')
    print(f'Page numbering: {"1-based" if 1 in pages and 0 not in pages else "0-based"}')

print()
if missing_page == 0 and missing_bbox == 0:
    print('RESULT: Backend data is CORRECT')
else:
    print('RESULT: Backend data has ISSUES')

conn.close()
