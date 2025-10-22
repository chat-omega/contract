#!/usr/bin/env python3
"""
Import document types and categories from JSON data into the database.
Run this script to populate the document_categories and document_types tables.
"""

import asyncio
import aiosqlite
import json
from pathlib import Path

# Document types JSON data
DOCUMENT_TYPES_JSON = {
    "Contract": [
        "M&A Purchase Agt",
        "Equity Related Agt",
        "Investment Services Agt",
        "Supply Agt",
        "Distribution Agt",
        "Service Agt",
        "Governance Agt",
        "IP Agt",
        "Equipment Related Agt",
        "Real Estate Agt",
        "Non-Disclosure Agt",
        "Employment Agt"
    ],
    "Debt Related": [
        "Credit & Loan Agt",
        "Debt Related Agt",
        "Debt Supplemental Agt",
        "Forbearance Agt"
    ],
    "Distribution": [
        "Distribution Agt"
    ],
    "Email": [],
    "Employment": [
        "Employment Agt"
    ],
    "Equipment Related": [
        "Equipment Related Agt"
    ],
    "Equity Related": [
        "Equity Related Agt"
    ],
    "Governance": [
        "Governance Agt"
    ],
    "IP": [
        "IP Agt"
    ],
    "Investment Services": [
        "Investment Services Agt"
    ],
    "M&A": [
        "M&A Purchase Agt"
    ],
    "Non-Disclosure": [
        "Non-Disclosure Agt"
    ],
    "Privacy Related": [
        "Privacy Related Agt"
    ],
    "Real Estate": [
        "Real Estate Agt"
    ],
    "Service": [
        "Service Agt"
    ],
    "Structured Finance": [
        "Structured Finance Agt"
    ],
    "Supply": [
        "Supply Agt"
    ],
    "Prospectus": [
        "Prospectus"
    ],
    "Catalogue": [],
    "Other": [
        "Other"
    ],
    "Filings": []
}

# Database path
DB_PATH = Path(__file__).parent / "database" / "omega.db"


async def import_document_types():
    """Import document types and categories into the database."""

    print("=" * 60)
    print("DOCUMENT TYPES IMPORT SCRIPT")
    print("=" * 60)
    print()

    # Ensure database directory exists
    DB_PATH.parent.mkdir(parents=True, exist_ok=True)

    print(f"📁 Database: {DB_PATH}")
    print()

    async with aiosqlite.connect(str(DB_PATH)) as db:
        # Clear existing data (for re-imports)
        print("🗑️  Clearing existing document types data...")
        await db.execute("DELETE FROM document_types")
        await db.execute("DELETE FROM document_categories")
        await db.commit()
        print("   ✅ Existing data cleared")
        print()

        # Import categories and types
        print("📥 Importing document types...")
        print()

        category_count = 0
        type_count = 0
        display_order = 1

        for category_name, types in DOCUMENT_TYPES_JSON.items():
            # Insert category
            cursor = await db.execute(
                "INSERT INTO document_categories (name, display_order) VALUES (?, ?)",
                (category_name, display_order)
            )
            category_id = cursor.lastrowid
            category_count += 1

            print(f"   📂 {category_name}")

            # Insert types for this category
            if types:
                type_order = 1
                for type_name in types:
                    await db.execute(
                        """INSERT INTO document_types
                           (category_id, name, display_order)
                           VALUES (?, ?, ?)""",
                        (category_id, type_name, type_order)
                    )
                    type_count += 1
                    type_order += 1
                    print(f"      └─ {type_name}")
            else:
                # Category with no subtypes - create a type with same name as category
                await db.execute(
                    """INSERT INTO document_types
                       (category_id, name, display_order)
                       VALUES (?, ?, ?)""",
                    (category_id, category_name, 1)
                )
                type_count += 1
                print(f"      └─ {category_name} (standalone)")

            display_order += 1

        await db.commit()

        print()
        print("=" * 60)
        print("IMPORT SUMMARY")
        print("=" * 60)
        print(f"✅ Categories imported: {category_count}")
        print(f"✅ Document types imported: {type_count}")
        print()

        # Verify import
        print("🔍 Verifying import...")
        cursor = await db.execute("SELECT COUNT(*) FROM document_categories")
        cat_count = (await cursor.fetchone())[0]

        cursor = await db.execute("SELECT COUNT(*) FROM document_types")
        type_count_db = (await cursor.fetchone())[0]

        print(f"   Categories in DB: {cat_count}")
        print(f"   Types in DB: {type_count_db}")
        print()

        # Show sample data
        print("📋 Sample data:")
        cursor = await db.execute("""
            SELECT c.name as category, dt.name as type
            FROM document_categories c
            LEFT JOIN document_types dt ON c.id = dt.category_id
            ORDER BY c.display_order, dt.display_order
            LIMIT 10
        """)
        rows = await cursor.fetchall()
        for row in rows:
            print(f"   {row[0]} → {row[1]}")
        print()

        print("=" * 60)
        print("✅ IMPORT COMPLETE!")
        print("=" * 60)


if __name__ == "__main__":
    asyncio.run(import_document_types())
