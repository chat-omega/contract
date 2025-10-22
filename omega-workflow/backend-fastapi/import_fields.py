#!/usr/bin/env python3
"""
Import fields from fields.json into the database
Async version for FastAPI backend
"""
import json
import os
import sys
import asyncio
from database_async import AsyncDatabase

async def import_fields():
    """Import fields from the JSON file"""
    # Try different possible paths for the fields.json file
    possible_paths = [
        '/app/design/fields.json',  # Container path (mounted)
        os.path.join(os.path.dirname(__file__), '../design/fields.json'),  # Local development
        os.path.join(os.path.dirname(__file__), 'fields.json'),  # Same directory
    ]

    json_path = None
    for path in possible_paths:
        if os.path.exists(path):
            json_path = path
            break

    if json_path is None:
        print(f"❌ Error: fields.json not found in any of these locations:")
        for path in possible_paths:
            print(f"  - {path}")
        return False

    try:
        # Load the JSON data
        print(f"📂 Loading fields from {json_path}")
        with open(json_path, 'r', encoding='utf-8') as f:
            fields_data = json.load(f)

        print(f"📊 Found {len(fields_data)} fields to import")

        # Initialize database
        db = AsyncDatabase()

        # Clear existing fields first (optional - uncomment if needed)
        # print("🗑️  Clearing existing fields...")
        # await db.clear_fields()

        # Import each field
        success_count = 0
        error_count = 0

        for i, field_data in enumerate(fields_data):
            try:
                # Validate required fields
                if not field_data.get('field_id'):
                    print(f"⚠️  Skipping field {i+1}: missing field_id")
                    error_count += 1
                    continue

                if not field_data.get('name'):
                    print(f"⚠️  Skipping field {i+1}: missing name")
                    error_count += 1
                    continue

                # Import the field
                if await db.create_field(field_data):
                    success_count += 1
                    if (success_count % 100) == 0:
                        print(f"✅ Imported {success_count} fields...")
                else:
                    error_count += 1
                    print(f"❌ Failed to import field: {field_data.get('name', 'Unknown')}")

            except Exception as e:
                error_count += 1
                print(f"❌ Error importing field {i+1}: {e}")

        # Final results
        print(f"\n📊 Import Results:")
        print(f"✅ Successfully imported: {success_count} fields")
        print(f"❌ Errors: {error_count} fields")

        total_count = await db.get_field_count()
        print(f"📁 Total in database: {total_count} fields")

        return success_count > 0

    except Exception as e:
        print(f"❌ Critical error during import: {e}")
        import traceback
        traceback.print_exc()
        return False

async def test_import():
    """Test the import by querying some fields"""
    print("\n🧪 Testing import...")

    db = AsyncDatabase()

    # Get total count
    total_count = await db.get_field_count()
    print(f"📊 Total fields in database: {total_count}")

    # Get first 5 fields
    fields = await db.get_fields(limit=5)
    print(f"📋 Sample fields:")
    for field in fields:
        print(f"  - {field['name']} ({field['field_id']})")
        print(f"    Tags: {field['tags']}")

    # Test search
    search_results = await db.get_fields(search="Assignment", limit=3)
    print(f"\n🔍 Search results for 'Assignment' ({len(search_results)} found):")
    for field in search_results:
        print(f"  - {field['name']}")

async def main():
    """Main entry point"""
    print("🚀 Starting field import process...")

    if await import_fields():
        await test_import()
        print("\n✅ Field import completed successfully!")
        return 0
    else:
        print("\n❌ Field import failed!")
        return 1

if __name__ == "__main__":
    sys.exit(asyncio.run(main()))
