#!/usr/bin/env python3
"""
Import document types and categories from JSON data into the database.
Run this script to populate the document_categories and document_types tables.
Supports 3-level hierarchy: Top Category → Sub Category → Types
"""

import asyncio
import aiosqlite
import json
from pathlib import Path

# Document types JSON data - 3-level hierarchical structure
# Level 1: Contract / Non-Contract
# Level 2: Categories (Debt Related Agt, Banking Document, etc.)
# Level 3: Types (Credit & Loan Agt, Banking Form, etc.)
DOCUMENT_TYPES_JSON = [
    {
        "category": "Contract",
        "children": [
            {
                "category": "Debt Related Agt",
                "types": [
                    "Credit & Loan Agt",
                    "Debt Security",
                    "Factoring Agt",
                    "Indenture",
                    "Letter of Credit"
                ]
            },
            {
                "category": "Debt Supplemental Agt",
                "types": [
                    "Assignment Agt",
                    "Commitment Letter",
                    "Debt Settlement Agt",
                    "Forbearance Agt",
                    "Guaranty",
                    "Intercreditor Agt",
                    "Loan Consent",
                    "Negative Pledge Agt",
                    "Note-Related Agt",
                    "Security Agt",
                    "Subordination Agt"
                ]
            },
            {
                "category": "Distribution Agt",
                "types": [
                    "Financial Services Distribution Agt",
                    "Publishing Agt",
                    "Reseller Agt",
                    "Wholesale Agt (Retail)"
                ]
            },
            {
                "category": "Employment Related Agt",
                "types": [
                    "Collective Bargaining Agt",
                    "Compensation Related Agt",
                    "Employee Matters Agt",
                    "Employment Agt",
                    "Retention Related Agt",
                    "Separation Related Agt"
                ]
            },
            {
                "category": "Equipment Related Agt",
                "types": [
                    "Equipment Lease",
                    "Equipment Purchase Agt",
                    "Guaranty"
                ]
            },
            {
                "category": "Equity Related Agt",
                "types": [
                    "Equity Commitment Letter",
                    "Equity Distribution Agt",
                    "Registration Rights Agt",
                    "Reorganization Agt",
                    "Securities Purchase Agt",
                    "Shareholder Rights Plan",
                    "Subscription Agt",
                    "Warrant Agt"
                ]
            },
            {
                "category": "Governance Agt",
                "types": [
                    "Director Agt",
                    "Franchise Related Agt",
                    "Joint Operating & Venture Agt",
                    "LLC Operating Agt",
                    "Partnership Agt",
                    "Shareholders Agt"
                ]
            },
            {
                "category": "IP Agt",
                "types": [
                    "EULA & Website Terms of Use",
                    "IP Purchase & Transfer Agt",
                    "License Agt",
                    "Royalty & Royalty Purchase Agt"
                ]
            },
            {
                "category": "Insurance Related Agt",
                "types": [
                    "Fund Participation Agt",
                    "Insurance Policy",
                    "Joint Insurance Agt",
                    "Reinsurance Agt",
                    "Split Dollar Agt"
                ]
            },
            {
                "category": "Investment Services Agt",
                "types": [
                    "Brokerage Agt",
                    "Custodial Agt",
                    "Investment Advisory Agt",
                    "Investor Relations Agt",
                    "Placement Agent Agt",
                    "Transfer Agent Services Agt",
                    "Underwriting Agt",
                    "Valuation Services Agt"
                ]
            },
            {
                "category": "Litigation Related Agt",
                "types": [
                    "Mediation Agt",
                    "Release & Waiver",
                    "Settlement Agt"
                ]
            },
            {
                "category": "M&A Purchase Agt",
                "types": [
                    "Asset Purchase Agt",
                    "Merger Agt",
                    "Stock Purchase Agt"
                ]
            },
            {
                "category": "M&A Supplemental Agt",
                "types": [
                    "Assignment Agt",
                    "Escrow Agt",
                    "Exchange Agt",
                    "Joint Filing Agt",
                    "Lockup Agt",
                    "Separation & Distribution Agt",
                    "Standstill Agt",
                    "Transition Services Agt",
                    "Voting or Support Agt"
                ]
            },
            {
                "category": "Privacy Related Agt",
                "types": [
                    "Business Associate Agt",
                    "Data Protection Agt"
                ]
            },
            {
                "category": "Real Estate Agt",
                "types": [
                    "Easement Agt",
                    "Lease Assignment & Consent to Lease Assignment",
                    "Lease Related Guaranty",
                    "Lease Renewal & Extension Agt",
                    "Lease Subordination Agt",
                    "Lease Termination Agt",
                    "Real Estate Lease",
                    "Real Estate Purchase Agt",
                    "Real Estate Sublease",
                    "Resource Lease"
                ]
            },
            {
                "category": "Restrictive Covenant Agt",
                "types": [
                    "Non Disclosure Agt and Confidentiality Agt"
                ]
            },
            {
                "category": "Service Agt",
                "types": [
                    "Construction Agt",
                    "Consulting Agt",
                    "Engagement Letter",
                    "Independent Contractor Agt",
                    "Management Agt",
                    "SaaS Agt",
                    "Service Level Agreement",
                    "Statement of Work"
                ]
            },
            {
                "category": "Structured Finance Agt",
                "types": [
                    "CLO",
                    "ISDA",
                    "Pooling and Servicing Agt",
                    "Repurchase Agreement",
                    "Securities Lending Agt"
                ]
            },
            {
                "category": "Supply Agt",
                "types": [
                    "Purchase Order & Terms of Sale",
                    "Quality Agt",
                    "Resource Supply Agt",
                    "Warranty"
                ]
            },
            {
                "category": "Tax Related Agt",
                "types": [
                    "Rollover Agt",
                    "Tax Matters Agt"
                ]
            }
        ]
    },
    {
        "category": "Non-Contract",
        "children": [
            {
                "category": "Banking Document",
                "types": [
                    "Banking Form",
                    "Loan Form",
                    "Power of Attorney",
                    "Wire Transfer"
                ]
            },
            {
                "category": "Catalogue",
                "types": []
            },
            {
                "category": "Code of Conduct",
                "types": []
            },
            {
                "category": "Corporate Governance Document",
                "types": [
                    "Articles and Company Constitution",
                    "Bylaws",
                    "Charter",
                    "Employment Related Plans",
                    "Minutes",
                    "Resolutions"
                ]
            },
            {
                "category": "Court & Tribunal Related Document",
                "types": [
                    "Affidavit",
                    "Arbitration Ruling",
                    "Court Opinion",
                    "Indictment",
                    "Pleadings and Motion Materials",
                    "Transcript"
                ]
            },
            {
                "category": "Disclosure Document",
                "types": [
                    "11-k",
                    "20-F",
                    "40-F",
                    "Alternative Monthly Report",
                    "Annual Information Form – 10-k",
                    "Annual Report",
                    "Business Acquisition Report",
                    "Conflict Minerals Report",
                    "Contribution Disclosure",
                    "Early Warning Report – Beneficial Ownership Report",
                    "Foreign Private Issuer Report",
                    "Information Statement",
                    "Insider Report",
                    "MD&A",
                    "Management Information Circular",
                    "Material Change Report – Current Report",
                    "Material Contracts",
                    "Offering Memorandum",
                    "Prospectus",
                    "Quarterly Report",
                    "Statement of Executive Compensation"
                ]
            },
            {
                "category": "Due Diligence Material",
                "types": [
                    "Due Diligence Checklist",
                    "Due Diligence Request List"
                ]
            },
            {
                "category": "Email",
                "types": []
            },
            {
                "category": "Financial Statement",
                "types": []
            },
            {
                "category": "Guide or Manual",
                "types": []
            },
            {
                "category": "Guidelines or Policy",
                "types": [
                    "Data Protection Policy & Standards",
                    "Director Comp. & Governance Policy",
                    "Environmental Policy",
                    "HR Policy",
                    "Outside Counsel Guidelines",
                    "Privacy Policy",
                    "Regulatory Guidance"
                ]
            },
            {
                "category": "HR Document",
                "types": [
                    "HR Form",
                    "Position Posting",
                    "Resume"
                ]
            },
            {
                "category": "IP Material",
                "types": [
                    "Copyright",
                    "Patent",
                    "Trademark"
                ]
            },
            {
                "category": "Insurance Form",
                "types": []
            },
            {
                "category": "Lease Document",
                "types": [
                    "Lease Abstract",
                    "Lease Application"
                ]
            },
            {
                "category": "Legislation",
                "types": [
                    "Regulation",
                    "Regulatory Notice",
                    "Statute–Bill or Legislative Amendment"
                ]
            },
            {
                "category": "Letter",
                "types": [
                    "Letter of Intent",
                    "Securities Commission Letter",
                    "Shareholder Letter"
                ]
            },
            {
                "category": "Medical Form",
                "types": [
                    "Consent Form",
                    "Referral Form",
                    "Release of Medical Records Form"
                ]
            },
            {
                "category": "Memorandum",
                "types": [
                    "Memorandum of Understanding"
                ]
            },
            {
                "category": "Officer's Certificate",
                "types": []
            },
            {
                "category": "Org. Chart",
                "types": []
            },
            {
                "category": "Payment Record",
                "types": [
                    "Invoice",
                    "Purchase Receipt"
                ]
            },
            {
                "category": "Presentation",
                "types": []
            },
            {
                "category": "Press Release",
                "types": []
            },
            {
                "category": "Publication or Report",
                "types": [
                    "Environmental Report",
                    "Peer-Reviewed",
                    "Technical Report"
                ]
            },
            {
                "category": "RFP Related Document",
                "types": []
            },
            {
                "category": "Tax Form",
                "types": []
            },
            {
                "category": "UCC Financing Statement",
                "types": []
            }
        ]
    }
]

# Database path - use the same path as the application
# Application uses /app/database/omega.db
DB_PATH = Path(__file__).parent / "database" / "omega.db"


async def import_document_types():
    """Import document types and categories into the database with 3-level hierarchy."""

    print("=" * 80)
    print("DOCUMENT TYPES IMPORT SCRIPT - 3-Level Hierarchical Structure")
    print("=" * 80)
    print()

    # Ensure database directory exists
    DB_PATH.parent.mkdir(parents=True, exist_ok=True)

    print(f"📁 Database: {DB_PATH}")
    print()

    async with aiosqlite.connect(str(DB_PATH)) as db:
        # Create tables with updated schema
        print("📋 Creating/updating database schema...")

        # Drop existing tables to recreate with new schema
        await db.execute("DROP TABLE IF EXISTS document_types")
        await db.execute("DROP TABLE IF EXISTS document_categories")

        # Create document_categories table with parent_category_id for hierarchy
        await db.execute("""
            CREATE TABLE IF NOT EXISTS document_categories (
                id INTEGER PRIMARY KEY AUTOINCREMENT,
                name TEXT NOT NULL,
                parent_category_id INTEGER,
                display_order INTEGER,
                level INTEGER DEFAULT 1,
                created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                FOREIGN KEY (parent_category_id) REFERENCES document_categories (id) ON DELETE CASCADE,
                UNIQUE(parent_category_id, name)
            )
        """)

        # Create document_types table
        await db.execute("""
            CREATE TABLE IF NOT EXISTS document_types (
                id INTEGER PRIMARY KEY AUTOINCREMENT,
                category_id INTEGER NOT NULL,
                name TEXT NOT NULL,
                display_order INTEGER,
                created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                FOREIGN KEY (category_id) REFERENCES document_categories (id) ON DELETE CASCADE,
                UNIQUE(category_id, name)
            )
        """)

        await db.commit()
        print("   ✅ Database schema ready (3-level hierarchy support)")
        print()

        # Import 3-level hierarchical data
        print("📥 Importing document types (3-level hierarchy)...")
        print()

        top_category_count = 0
        sub_category_count = 0
        type_count = 0
        top_level_order = 1

        for top_level in DOCUMENT_TYPES_JSON:
            # Level 1: Insert top-level category (Contract / Non-Contract)
            top_category_name = top_level['category']
            cursor = await db.execute(
                """INSERT INTO document_categories
                   (name, parent_category_id, display_order, level)
                   VALUES (?, NULL, ?, 1)""",
                (top_category_name, top_level_order)
            )
            top_category_id = cursor.lastrowid
            top_category_count += 1

            print(f"   📁 {top_category_name} (Level 1)")

            # Level 2: Insert sub-categories (Debt Related Agt, Banking Document, etc.)
            sub_level_order = 1
            for sub_category in top_level.get('children', []):
                sub_category_name = sub_category['category']
                cursor = await db.execute(
                    """INSERT INTO document_categories
                       (name, parent_category_id, display_order, level)
                       VALUES (?, ?, ?, 2)""",
                    (sub_category_name, top_category_id, sub_level_order)
                )
                sub_category_id = cursor.lastrowid
                sub_category_count += 1

                print(f"      📂 {sub_category_name} (Level 2)")

                # Level 3: Insert types under this sub-category
                types = sub_category.get('types', [])
                if types:
                    type_order = 1
                    for type_name in types:
                        await db.execute(
                            """INSERT INTO document_types
                               (category_id, name, display_order)
                               VALUES (?, ?, ?)""",
                            (sub_category_id, type_name, type_order)
                        )
                        type_count += 1
                        type_order += 1
                        print(f"         └─ {type_name} (Type)")
                else:
                    # Category with no types - create a type with same name as category
                    await db.execute(
                        """INSERT INTO document_types
                           (category_id, name, display_order)
                           VALUES (?, ?, 1)""",
                        (sub_category_id, sub_category_name)
                    )
                    type_count += 1
                    print(f"         └─ {sub_category_name} (Type - standalone)")

                sub_level_order += 1

            top_level_order += 1
            print()

        await db.commit()

        print("=" * 80)
        print("IMPORT SUMMARY")
        print("=" * 80)
        print(f"✅ Top-level categories imported: {top_category_count} (Contract, Non-Contract)")
        print(f"✅ Sub-categories imported: {sub_category_count}")
        print(f"✅ Document types imported: {type_count}")
        print(f"📊 Total items: {top_category_count + sub_category_count + type_count}")
        print()

        # Verify import
        print("🔍 Verifying import...")
        cursor = await db.execute("SELECT COUNT(*) FROM document_categories WHERE level = 1")
        top_count = (await cursor.fetchone())[0]

        cursor = await db.execute("SELECT COUNT(*) FROM document_categories WHERE level = 2")
        sub_count = (await cursor.fetchone())[0]

        cursor = await db.execute("SELECT COUNT(*) FROM document_types")
        type_count_db = (await cursor.fetchone())[0]

        print(f"   Level 1 (top) categories in DB: {top_count}")
        print(f"   Level 2 (sub) categories in DB: {sub_count}")
        print(f"   Level 3 (types) in DB: {type_count_db}")
        print()

        # Show sample hierarchical data
        print("📋 Sample hierarchical data:")
        cursor = await db.execute("""
            SELECT
                tc.name as top_category,
                sc.name as sub_category,
                dt.name as type
            FROM document_categories tc
            LEFT JOIN document_categories sc ON tc.id = sc.parent_category_id
            LEFT JOIN document_types dt ON sc.id = dt.category_id
            WHERE tc.level = 1
            ORDER BY tc.display_order, sc.display_order, dt.display_order
            LIMIT 15
        """)
        rows = await cursor.fetchall()
        for row in rows:
            if row[2]:  # Has type
                print(f"   {row[0]} → {row[1]} → {row[2]}")
            elif row[1]:  # Has sub-category but no type shown
                print(f"   {row[0]} → {row[1]}")
        print()

        print("=" * 80)
        print("✅ IMPORT COMPLETE!")
        print("=" * 80)


if __name__ == "__main__":
    asyncio.run(import_document_types())
