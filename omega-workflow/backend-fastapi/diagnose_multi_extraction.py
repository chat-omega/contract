#!/usr/bin/env python3
"""
Diagnostic script to investigate multi-extraction highlighting bug.
Checks the database and API response for the "Term and Renewal" field.
"""

import asyncio
import json
import aiosqlite

async def diagnose_term_and_renewal():
    """Diagnose the Term and Renewal field extractions."""
    print("=" * 80)
    print("DIAGNOSTIC: Term and Renewal Multi-Extraction Bug")
    print("=" * 80)

    db_path = "/app/database/omega.db"

    async with aiosqlite.connect(db_path) as db:
        # Get document ID (assuming it's document 1 - adjust if needed)
        cursor = await db.execute("SELECT id, name FROM documents LIMIT 1")
        doc = await cursor.fetchone()

        if not doc:
            print("❌ No documents found in database")
            return

        doc_id = doc[0]
        doc_filename = doc[1]
        print(f"\n📄 Document: {doc_filename} (ID: {doc_id})")

        # Find the "Term and Renewal" field
        cursor = await db.execute(
            "SELECT field_id, name, type FROM fields WHERE name LIKE ? OR name LIKE ?",
            ('%Term%Renewal%', '%term%renewal%')
        )
        term_field = await cursor.fetchone()

        if not term_field:
            print("\n❌ 'Term and Renewal' field not found in database")
            print("\nSearching for similar fields...")
            cursor = await db.execute(
                "SELECT field_id, name FROM fields WHERE name LIKE ? LIMIT 10",
                ('%Term%',)
            )
            similar_fields = await cursor.fetchall()
            for field in similar_fields:
                print(f"  - {field[1]} (ID: {field[0]})")
            return

        field_id = term_field[0]
        field_name = term_field[1]
        field_type = term_field[2]

        print(f"\n🔍 Field: {field_name}")
        print(f"   ID: {field_id}")
        print(f"   Type: {field_type}")

        # Check extractions table
        print(f"\n{'='*80}")
        print("CHECKING extractions TABLE")
        print('='*80)

        cursor = await db.execute(
            """
                SELECT
                    id,
                    document_id,
                    status,
                    results
                FROM extractions
                WHERE document_id = ? AND status = 'complete'
                ORDER BY id DESC
                LIMIT 1
            """,
            (doc_id,)
        )

        extraction_row = await cursor.fetchone()

        if not extraction_row:
            print(f"❌ No completed extractions found for document {doc_id}")
            return

        extraction_id = extraction_row[0]
        status = extraction_row[2]
        results_json = extraction_row[3]

        print(f"\n✅ Found extraction record:")
        print(f"  Extraction ID: {extraction_id}")
        print(f"  Status: {status}")

        # Parse results JSON
        if not results_json:
            print("\n❌ Results JSON is empty")
            return

        try:
            results = json.loads(results_json)
        except json.JSONDecodeError as e:
            print(f"\n❌ Failed to parse results JSON: {e}")
            return

        # Find the field in results
        if field_id not in results:
            print(f"\n❌ Field {field_id} not found in results")
            print(f"\nAvailable fields in results:")
            for fid in list(results.keys())[:10]:
                print(f"  - {fid}")
            return

        field_results = results[field_id]

        # Check if it's a list (multiple extractions) or dict (single extraction)
        if isinstance(field_results, list):
            extractions = field_results
        else:
            extractions = [field_results]

        print(f"\n✅ Found {len(extractions)} extraction(s) for '{field_name}':\n")

        for i, ext in enumerate(extractions, 1):
            print(f"\n{'─'*80}")
            print(f"EXTRACTION #{i}")
            print('─'*80)

            # Get basic info
            text = ext.get('text', '')
            confidence = ext.get('confidence', 0)
            spans = ext.get('spans', [])

            print(f"  Extracted Value: {text[:100]}...")
            print(f"  Confidence: {confidence}")
            print(f"  Spans: {len(spans)} span(s)")

            # Check each span
            for j, span in enumerate(spans[:3], 1):  # Show first 3 spans
                pages = span.get('pages', [])
                bounds = span.get('bounds', {})

                print(f"\n    Span {j}:")
                print(f"      Pages: {pages} (type: {[type(p).__name__ for p in pages]})")
                print(f"      Bounds: {bounds}")

        # Summary
        print(f"\n{'='*80}")
        print("SUMMARY")
        print('='*80)
        print(f"Total Extractions Found: {len(extractions)}")

        # Check for issues
        issues = []
        for i, ext in enumerate(extractions, 1):
            spans = ext.get('spans', [])

            if not spans:
                issues.append(f"Extraction #{i}: No spans data")
            else:
                for j, span in enumerate(spans, 1):
                    pages = span.get('pages', [])
                    bounds = span.get('bounds')

                    if not pages:
                        issues.append(f"Extraction #{i}, Span #{j}: Missing pages")
                    else:
                        for page in pages:
                            if not isinstance(page, int):
                                issues.append(f"Extraction #{i}, Span #{j}: page is {type(page).__name__}, not int (value: {page})")

                    if not bounds:
                        issues.append(f"Extraction #{i}, Span #{j}: Missing bounds")

        if issues:
            print("\n⚠️  ISSUES FOUND:")
            for issue in issues:
                print(f"  - {issue}")
        else:
            print("\n✅ No obvious data issues found")

        print("\n" + "="*80)
        print("Next step: Check the API endpoint response")
        print("="*80)
        print(f"\nTest API endpoint:")
        print(f"  GET /api/documents/{doc_id}/credit-analysis")
        print("\nOr get the full extraction:")
        print(f"  GET /api/documents/{doc_id}/extraction-results")

if __name__ == "__main__":
    asyncio.run(diagnose_term_and_renewal())
