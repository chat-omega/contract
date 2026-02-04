#!/usr/bin/env python3
"""
Data Migration Script: Fix Extraction Page Numbers and Bboxes

This script fixes extraction data in the database where page numbers and bboxes
are null at the top level but exist in the spans data structure.

Usage:
    python3 migrate_extraction_data.py [--document-id DOC_ID] [--extraction-id EXT_ID] [--dry-run]

Examples:
    # Fix specific document
    python3 migrate_extraction_data.py --document-id e37f9df8

    # Fix specific extraction
    python3 migrate_extraction_data.py --extraction-id 4

    # Dry run (preview changes without saving)
    python3 migrate_extraction_data.py --document-id e37f9df8 --dry-run

    # Fix ALL extractions (use with caution!)
    python3 migrate_extraction_data.py
"""

import sqlite3
import json
import argparse
from typing import Dict, Any, List, Optional, Tuple


DB_PATH = "/app/database/omega.db"


def extract_page_from_spans(spans: List[Dict]) -> Optional[int]:
    """Extract page number from spans[0].pages.start"""
    if not spans or len(spans) == 0:
        return None

    first_span = spans[0]
    if 'pages' in first_span and isinstance(first_span['pages'], dict):
        page = first_span['pages'].get('start')
        if page is not None:
            # Convert from 0-indexed to 1-indexed
            return page + 1

    return None


def extract_bbox_from_spans(spans: List[Dict]) -> Optional[List]:
    """
    Extract bbox from spans data.
    Checks two possible locations:
    1. spans[0].bboxes[0].bounds[0] (array format)
    2. spans[0].bounds (direct object format)
    """
    if not spans or len(spans) == 0:
        return None

    first_span = spans[0]

    # Try location 1: spans[0].bboxes[0].bounds (array)
    if 'bboxes' in first_span and first_span['bboxes']:
        first_bbox_obj = first_span['bboxes'][0]
        if 'bounds' in first_bbox_obj:
            bounds = first_bbox_obj['bounds']
            if isinstance(bounds, list) and len(bounds) > 0:
                bound = bounds[0]
                if isinstance(bound, dict):
                    # Convert to [left, bottom, right, top] format
                    return [
                        bound.get('left'),
                        bound.get('bottom'),
                        bound.get('right'),
                        bound.get('top')
                    ]

    # Try location 2: spans[0].bounds (direct object)
    if 'bounds' in first_span:
        bound = first_span['bounds']
        if isinstance(bound, dict):
            # Convert to [left, bottom, right, top] format
            return [
                bound.get('left'),
                bound.get('bottom'),
                bound.get('right'),
                bound.get('top')
            ]

    return None


def fix_extraction_data(results_json: str) -> Tuple[str, int, int]:
    """
    Fix extraction data by extracting page and bbox from spans.

    Returns:
        Tuple of (fixed_json, fixed_count, total_count)
    """
    results = json.loads(results_json)
    fixed_count = 0
    total_count = 0

    for field_id, field_data in results.items():
        # Handle both old format (direct list) and new format (dict with 'extractions' key)
        if isinstance(field_data, list):
            extractions = field_data
        elif isinstance(field_data, dict) and 'extractions' in field_data:
            extractions = field_data['extractions']
        else:
            continue

        for extraction in extractions:
            total_count += 1
            needs_fix = False

            # Fix page if null
            if extraction.get('page') is None and 'spans' in extraction:
                page = extract_page_from_spans(extraction['spans'])
                if page is not None:
                    extraction['page'] = page
                    needs_fix = True

            # Fix bbox if null
            if extraction.get('bbox') is None and 'spans' in extraction:
                bbox = extract_bbox_from_spans(extraction['spans'])
                if bbox is not None:
                    extraction['bbox'] = bbox
                    needs_fix = True

            if needs_fix:
                fixed_count += 1

    return json.dumps(results), fixed_count, total_count


def migrate_extraction(conn: sqlite3.Connection, extraction_id: int, dry_run: bool = False) -> Tuple[int, int]:
    """
    Migrate a single extraction.

    Returns:
        Tuple of (fixed_count, total_count)
    """
    cursor = conn.cursor()

    # Get extraction data
    cursor.execute("""
        SELECT id, document_id, workflow_id, results
        FROM extractions
        WHERE id = ?
    """, (extraction_id,))

    row = cursor.fetchone()
    if not row:
        print(f"⚠️  Extraction {extraction_id} not found")
        return 0, 0

    extraction_id, document_id, workflow_id, results_json = row

    if not results_json:
        print(f"⚠️  Extraction {extraction_id} has no results")
        return 0, 0

    print(f"\n📄 Processing extraction {extraction_id} (document={document_id}, workflow={workflow_id})")

    # Fix the data
    fixed_json, fixed_count, total_count = fix_extraction_data(results_json)

    if fixed_count == 0:
        print(f"  ✅ No fixes needed ({total_count} extractions already have page/bbox)")
    else:
        print(f"  🔧 Fixed {fixed_count}/{total_count} extractions")

        if not dry_run:
            # Update database
            cursor.execute("""
                UPDATE extractions
                SET results = ?
                WHERE id = ?
            """, (fixed_json, extraction_id))
            conn.commit()
            print(f"  💾 Saved to database")
        else:
            print(f"  🔍 DRY RUN - Changes not saved")

    return fixed_count, total_count


def migrate_document(conn: sqlite3.Connection, document_id: str, dry_run: bool = False) -> Tuple[int, int]:
    """
    Migrate all extractions for a document.

    Returns:
        Tuple of (total_fixed_count, total_extraction_count)
    """
    cursor = conn.cursor()

    # Get all extractions for document
    cursor.execute("""
        SELECT id
        FROM extractions
        WHERE document_id = ?
        ORDER BY id
    """, (document_id,))

    extraction_ids = [row[0] for row in cursor.fetchall()]

    if not extraction_ids:
        print(f"⚠️  No extractions found for document {document_id}")
        return 0, 0

    print(f"\n🎯 Migrating {len(extraction_ids)} extractions for document {document_id}")

    total_fixed = 0
    total_count = 0

    for extraction_id in extraction_ids:
        fixed, count = migrate_extraction(conn, extraction_id, dry_run)
        total_fixed += fixed
        total_count += count

    return total_fixed, total_count


def migrate_all(conn: sqlite3.Connection, dry_run: bool = False) -> Tuple[int, int]:
    """
    Migrate ALL extractions in database.

    Returns:
        Tuple of (total_fixed_count, total_extraction_count)
    """
    cursor = conn.cursor()

    # Get all extraction IDs
    cursor.execute("SELECT id FROM extractions ORDER BY id")
    extraction_ids = [row[0] for row in cursor.fetchall()]

    if not extraction_ids:
        print("⚠️  No extractions found in database")
        return 0, 0

    print(f"\n🌍 Migrating ALL {len(extraction_ids)} extractions in database")
    print("⚠️  This may take a while...")

    total_fixed = 0
    total_count = 0

    for extraction_id in extraction_ids:
        fixed, count = migrate_extraction(conn, extraction_id, dry_run)
        total_fixed += fixed
        total_count += count

    return total_fixed, total_count


def main():
    parser = argparse.ArgumentParser(
        description="Fix extraction data with missing page numbers and bboxes"
    )
    parser.add_argument(
        '--document-id',
        help="Fix all extractions for a specific document"
    )
    parser.add_argument(
        '--extraction-id',
        type=int,
        help="Fix a specific extraction by ID"
    )
    parser.add_argument(
        '--dry-run',
        action='store_true',
        help="Preview changes without saving to database"
    )

    args = parser.parse_args()

    print("=" * 60)
    print("📦 Extraction Data Migration Script")
    print("=" * 60)

    # Connect to database
    conn = sqlite3.connect(DB_PATH)

    try:
        if args.extraction_id:
            # Fix specific extraction
            total_fixed, total_count = migrate_extraction(
                conn,
                args.extraction_id,
                dry_run=args.dry_run
            )
        elif args.document_id:
            # Fix all extractions for document
            total_fixed, total_count = migrate_document(
                conn,
                args.document_id,
                dry_run=args.dry_run
            )
        else:
            # Fix all extractions
            print("\n⚠️  WARNING: This will migrate ALL extractions in the database!")
            response = input("Are you sure? (yes/no): ")
            if response.lower() != 'yes':
                print("❌ Cancelled")
                return

            total_fixed, total_count = migrate_all(conn, dry_run=args.dry_run)

        # Summary
        print("\n" + "=" * 60)
        print("📊 Migration Summary")
        print("=" * 60)
        print(f"  Total extractions processed: {total_count}")
        print(f"  Extractions fixed: {total_fixed}")
        print(f"  Already correct: {total_count - total_fixed}")

        if args.dry_run:
            print("\n🔍 DRY RUN - No changes were saved to database")
        else:
            print("\n✅ Migration complete - Changes saved to database")

    finally:
        conn.close()


if __name__ == "__main__":
    main()
