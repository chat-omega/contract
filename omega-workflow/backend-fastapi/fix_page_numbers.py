#!/usr/bin/env python3
"""
Migration script to fix off-by-one page number error
Subtracts 1 from all page numbers in extraction results
"""

import aiosqlite
import asyncio
import json

async def fix_page_numbers(document_id: str = None):
    """
    Fix page numbers in extraction results (subtract 1)

    Args:
        document_id: Optional document ID to fix. If None, fixes all documents.
    """
    db_path = '/app/database/omega.db'

    async with aiosqlite.connect(db_path) as db:
        # Get extractions to fix
        if document_id:
            query = "SELECT id, document_id, results FROM extractions WHERE document_id = ? AND results IS NOT NULL"
            params = (document_id,)
        else:
            query = "SELECT id, document_id, results FROM extractions WHERE results IS NOT NULL"
            params = ()

        async with db.execute(query, params) as cursor:
            extractions = await cursor.fetchall()

        print(f"Found {len(extractions)} extractions to fix")

        fixed_count = 0
        total_fields = 0

        for extraction_id, doc_id, results_json in extractions:
            try:
                # Parse results JSON
                results = json.loads(results_json)

                # Track if any changes were made
                modified = False

                # Iterate through all fields
                for field_id, field_data in results.items():
                    if isinstance(field_data, dict) and 'extractions' in field_data:
                        # Field data has extractions array
                        for extraction in field_data['extractions']:
                            if 'page' in extraction and extraction['page'] is not None:
                                # Subtract 1 from page number
                                old_page = extraction['page']
                                extraction['page'] = old_page - 1
                                modified = True
                                total_fields += 1
                                print(f"  Fixed: {field_id} page {old_page} → {extraction['page']}")
                    elif isinstance(field_data, list):
                        # Field data is directly an array of extractions
                        for extraction in field_data:
                            if isinstance(extraction, dict) and 'page' in extraction and extraction['page'] is not None:
                                # Subtract 1 from page number
                                old_page = extraction['page']
                                extraction['page'] = old_page - 1
                                modified = True
                                total_fields += 1
                                print(f"  Fixed: {field_id} page {old_page} → {extraction['page']}")

                # Save back if modified
                if modified:
                    updated_json = json.dumps(results)
                    await db.execute(
                        "UPDATE extractions SET results = ? WHERE id = ?",
                        (updated_json, extraction_id)
                    )
                    fixed_count += 1
                    print(f"✅ Updated extraction {extraction_id} for document {doc_id}")

            except Exception as e:
                print(f"❌ Error processing extraction {extraction_id}: {e}")
                continue

        # Commit changes
        await db.commit()

        print(f"\n=== Migration Complete ===")
        print(f"Fixed {fixed_count} extractions")
        print(f"Updated {total_fields} field pages")

        return fixed_count, total_fields

if __name__ == "__main__":
    import sys

    # Get document ID from command line if provided
    doc_id = sys.argv[1] if len(sys.argv) > 1 else None

    if doc_id:
        print(f"Fixing page numbers for document: {doc_id}")
    else:
        print("Fixing page numbers for ALL documents")

    # Run migration
    fixed, total = asyncio.run(fix_page_numbers(doc_id))

    print(f"\nDone! Fixed {total} pages across {fixed} extractions")
