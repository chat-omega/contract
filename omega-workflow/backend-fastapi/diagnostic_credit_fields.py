#!/usr/bin/env python3
"""
Comprehensive diagnostic script for PDF highlighting issues in credit agreement fields.
Analyzes all 54 fields to identify missing page/bbox data.
"""

import sqlite3
import json
from collections import defaultdict
from typing import Dict, List, Any

# Database path inside Docker container
DB_PATH = "/app/database/omega.db"

# Credit agreement field definitions from main.py (lines 825-909)
CREDIT_AGREEMENT_FIELDS = [
    {"id": "8d6970e4-1a44-4f4d-8fcf-3140a6634213", "name": "Can the agreement be assigned?"},
    {"id": "f3e7d8c2-4b5a-6c7d-8e9f-0a1b2c3d4e5f", "name": "Parties Involved"},
    {"id": "a1b2c3d4-e5f6-7890-abcd-ef1234567890", "name": "Effective Date"},
    {"id": "b2c3d4e5-f6a7-8901-bcde-f12345678901", "name": "Facility Amount"},
    {"id": "c3d4e5f6-a7b8-9012-cdef-123456789012", "name": "Currency"},
    {"id": "d4e5f6a7-b8c9-0123-def1-234567890123", "name": "Interest Rate"},
    {"id": "e5f6a7b8-c9d0-1234-ef12-345678901234", "name": "Maturity Date"},
    {"id": "f6a7b8c9-d0e1-2345-f123-456789012345", "name": "Purpose of Loan"},
    {"id": "a7b8c9d0-e1f2-3456-1234-567890123456", "name": "Repayment Terms"},
    {"id": "b8c9d0e1-f2a3-4567-2345-678901234567", "name": "Prepayment Provisions"},
    {"id": "c9d0e1f2-a3b4-5678-3456-789012345678", "name": "Security/Collateral"},
    {"id": "d0e1f2a3-b4c5-6789-4567-890123456789", "name": "Guarantees"},
    {"id": "e1f2a3b4-c5d6-7890-5678-901234567890", "name": "Financial Covenants"},
    {"id": "f2a3b4c5-d6e7-8901-6789-012345678901", "name": "Negative Covenants"},
    {"id": "a3b4c5d6-e7f8-9012-7890-123456789012", "name": "Affirmative Covenants"},
    {"id": "b4c5d6e7-f8a9-0123-8901-234567890123", "name": "Events of Default"},
    {"id": "c5d6e7f8-a9b0-1234-9012-345678901234", "name": "Conditions Precedent"},
    {"id": "d6e7f8a9-b0c1-2345-0123-456789012345", "name": "Representations and Warranties"},
    {"id": "e7f8a9b0-c1d2-3456-1234-567890123456", "name": "Fees and Expenses"},
    {"id": "f8a9b0c1-d2e3-4567-2345-678901234567", "name": "Amendments and Waivers"},
    {"id": "a9b0c1d2-e3f4-5678-3456-789012345678", "name": "Assignment and Transfer"},
    {"id": "b0c1d2e3-f4a5-6789-4567-890123456789", "name": "Governing Law"},
    {"id": "c1d2e3f4-a5b6-7890-5678-901234567890", "name": "Jurisdiction"},
    {"id": "d2e3f4a5-b6c7-8901-6789-012345678901", "name": "Notice Provisions"},
    {"id": "e3f4a5b6-c7d8-9012-7890-123456789012", "name": "Confidentiality"},
    {"id": "f4a5b6c7-d8e9-0123-8901-234567890123", "name": "Material Adverse Change"},
    {"id": "a5b6c7d8-e9f0-1234-9012-345678901234", "name": "Syndication Details"},
    {"id": "b6c7d8e9-f0a1-2345-0123-456789012345", "name": "Agent Bank Details"},
    {"id": "c7d8e9f0-a1b2-3456-1234-567890123456", "name": "Interest Payment Dates"},
    {"id": "d8e9f0a1-b2c3-4567-2345-678901234567", "name": "Commitment Reductions"},
    {"id": "e9f0a1b2-c3d4-5678-3456-789012345678", "name": "Mandatory Prepayments"},
    {"id": "f0a1b2c3-d4e5-6789-4567-890123456789", "name": "Use of Proceeds Restrictions"},
    {"id": "a1b2c3d4-e5f6-7890-5678-901234567891", "name": "Compliance Certificates"},
    {"id": "b2c3d4e5-f6a7-8901-6789-012345678902", "name": "Insurance Requirements"},
    {"id": "c3d4e5f6-a7b8-9012-7890-123456789013", "name": "Environmental Compliance"},
    {"id": "d4e5f6a7-b8c9-0123-8901-234567890124", "name": "ERISA Compliance"},
    {"id": "e5f6a7b8-c9d0-1234-9012-345678901235", "name": "Tax Matters"},
    {"id": "f6a7b8c9-d0e1-2345-0123-456789012346", "name": "Margin Stock"},
    {"id": "a7b8c9d0-e1f2-3456-1234-567890123457", "name": "Investment Company Act"},
    {"id": "b8c9d0e1-f2a3-4567-2345-678901234568", "name": "Public Utility Holding Company"},
    {"id": "c9d0e1f2-a3b4-5678-3456-789012345679", "name": "Sanctions and Anti-Corruption"},
    {"id": "d0e1f2a3-b4c5-6789-4567-890123456780", "name": "Beneficial Ownership Certification"},
    {"id": "e1f2a3b4-c5d6-7890-5678-901234567891", "name": "Patriot Act Compliance"},
    {"id": "f2a3b4c5-d6e7-8901-6789-012345678902", "name": "Withholding Taxes"},
    {"id": "a3b4c5d6-e7f8-9012-7890-123456789013", "name": "Increased Costs"},
    {"id": "b4c5d6e7-f8a9-0123-8901-234567890124", "name": "Illegality"},
    {"id": "c5d6e7f8-a9b0-1234-9012-345678901235", "name": "Break Funding Payments"},
    {"id": "d6e7f8a9-b0c1-2345-0123-456789012346", "name": "Mitigation Obligations"},
    {"id": "e7f8a9b0-c1d2-3456-1234-567890123457", "name": "Replacement of Lenders"},
    {"id": "f8a9b0c1-d2e3-4567-2345-678901234568", "name": "Survival of Obligations"},
    {"id": "a9b0c1d2-e3f4-5678-3456-789012345679", "name": "Severability"},
    {"id": "b0c1d2e3-f4a5-6789-4567-890123456780", "name": "Integration"},
    {"id": "c1d2e3f4-a5b6-7890-5678-901234567891", "name": "Counterparts"},
    {"id": "d2e3f4a5-b6c7-8901-6789-012345678902", "name": "Electronic Execution"}
]

TARGET_FIELD_ID = "8d6970e4-1a44-4f4d-8fcf-3140a6634213"
TARGET_FIELD_NAME = "Can the agreement be assigned?"

def connect_db():
    """Connect to the SQLite database."""
    try:
        conn = sqlite3.connect(DB_PATH)
        conn.row_factory = sqlite3.Row
        return conn
    except Exception as e:
        print(f"❌ Error connecting to database: {e}")
        return None

def get_credit_agreement_documents(conn):
    """Get all documents that have been analyzed with the credit-agreement workflow."""
    cursor = conn.cursor()
    cursor.execute("""
        SELECT e.id, e.document_id, e.results, d.filename
        FROM extractions e
        LEFT JOIN documents d ON e.document_id = d.id
        WHERE e.workflow_id = 35
        ORDER BY e.created_at DESC
    """)
    return cursor.fetchall()

def analyze_field_extractions(results_dict: dict, field_id: str, field_name: str) -> Dict[str, Any]:
    """Analyze extractions for a specific field from the results JSON."""

    if field_id not in results_dict:
        return {
            "status": "no_extractions",
            "count": 0,
            "details": []
        }

    extractions = results_dict[field_id]

    if not extractions or not isinstance(extractions, list):
        return {
            "status": "no_extractions",
            "count": 0,
            "details": []
        }

    details = []
    working_count = 0
    missing_page_count = 0
    missing_bbox_count = 0
    missing_both_count = 0

    for ext in extractions:
        # Get field values
        text = ext.get('text', '')
        page = ext.get('page')
        bbox = ext.get('bbox')
        spans = ext.get('spans', [])
        confidence = ext.get('confidence', 0)

        has_page = page is not None
        has_bbox = bbox is not None
        has_spans_with_bbox = False

        # Check if spans have bbox data
        if spans and isinstance(spans, list):
            for span in spans:
                if isinstance(span, dict) and (span.get('bbox') or span.get('bboxes') or span.get('bounds')):
                    has_spans_with_bbox = True
                    break

        # Categorize
        if has_page and (has_bbox or has_spans_with_bbox):
            status = "working"
            working_count += 1
        elif not has_page and not has_bbox and not has_spans_with_bbox:
            status = "missing_both"
            missing_both_count += 1
        elif not has_page:
            status = "missing_page"
            missing_page_count += 1
        else:
            status = "missing_bbox"
            missing_bbox_count += 1

        # Get bbox sample
        bbox_sample = None
        if has_spans_with_bbox and spans:
            span = spans[0]
            bbox_sample = span.get('bounds') or span.get('bbox') or span.get('bboxes', [{}])[0] if span.get('bboxes') else None

        details.append({
            "text": text[:100] if text else None,
            "page": page,
            "has_bbox": has_bbox,
            "has_spans_with_bbox": has_spans_with_bbox,
            "bbox_sample": bbox_sample,
            "spans_count": len(spans) if spans else 0,
            "confidence": confidence,
            "status": status
        })

    # Determine overall status
    if missing_both_count == len(extractions):
        overall_status = "missing_both"
    elif missing_page_count > 0 or missing_bbox_count > 0 or missing_both_count > 0:
        overall_status = "partial"
    else:
        overall_status = "working"

    return {
        "status": overall_status,
        "count": len(extractions),
        "working": working_count,
        "missing_page": missing_page_count,
        "missing_bbox": missing_bbox_count,
        "missing_both": missing_both_count,
        "details": details
    }

def main():
    print("=" * 80)
    print("PDF HIGHLIGHTING DIAGNOSTIC REPORT")
    print("Credit Agreement Fields Analysis (54 Fields)")
    print("=" * 80)
    print()

    conn = connect_db()
    if not conn:
        return

    try:
        # Get documents
        print("🔍 Finding credit agreement documents...")
        documents = get_credit_agreement_documents(conn)

        if not documents:
            print("❌ No credit agreement documents found!")
            return

        print(f"✅ Found {len(documents)} document(s) analyzed with credit-agreement workflow")
        print()

        for doc in documents:
            extraction_id = doc[0]
            document_id = doc[1]
            results_json = doc[2]
            filename = doc[3]

            print(f"📄 Analyzing Document: {filename}")
            print(f"   Document ID: {document_id}")
            print(f"   Extraction ID: {extraction_id}")
            print("-" * 80)
            print()

            # Parse results JSON
            try:
                results = json.loads(results_json) if results_json else {}
            except Exception as e:
                print(f"❌ Error parsing results JSON: {e}")
                continue

            if not results:
                print("❌ No results found in extraction")
                continue

            print(f"📊 Found {len(results)} fields in extraction results")
            print()

            # Category counters
            categories = {
                "working": [],
                "missing_page": [],
                "missing_bbox": [],
                "missing_both": [],
                "no_extractions": []
            }

            # Analyze each field
            for field in CREDIT_AGREEMENT_FIELDS:
                field_id = field['id']
                field_name = field['name']

                result = analyze_field_extractions(results, field_id, field_name)

                if result['status'] == 'no_extractions':
                    categories['no_extractions'].append({
                        'field_id': field_id,
                        'field_name': field_name,
                        'result': result
                    })
                elif result['status'] == 'working':
                    categories['working'].append({
                        'field_id': field_id,
                        'field_name': field_name,
                        'result': result
                    })
                else:
                    # Categorize based on most common issue
                    if result['missing_both'] > result['missing_page'] and result['missing_both'] > result['missing_bbox']:
                        categories['missing_both'].append({
                            'field_id': field_id,
                            'field_name': field_name,
                            'result': result
                        })
                    elif result['missing_page'] > result['missing_bbox']:
                        categories['missing_page'].append({
                            'field_id': field_id,
                            'field_name': field_name,
                            'result': result
                        })
                    else:
                        categories['missing_bbox'].append({
                            'field_id': field_id,
                            'field_name': field_name,
                            'result': result
                        })

            # Print summary
            print("📊 SUMMARY")
            print("=" * 80)
            print(f"✅ Working (has page & bbox):        {len(categories['working'])} fields")
            print(f"⚠️  Missing page only:                {len(categories['missing_page'])} fields")
            print(f"⚠️  Missing bbox only:                {len(categories['missing_bbox'])} fields")
            print(f"❌ Missing both page & bbox:         {len(categories['missing_both'])} fields")
            print(f"📭 No extractions at all:            {len(categories['no_extractions'])} fields")
            print(f"📝 Total fields analyzed:            {len(CREDIT_AGREEMENT_FIELDS)} fields")
            print()

            # Detailed breakdown
            for category_name, icon in [
                ('missing_both', '❌'),
                ('missing_bbox', '⚠️'),
                ('missing_page', '⚠️'),
                ('no_extractions', '📭')
            ]:
                if categories[category_name]:
                    print(f"{icon} {category_name.upper().replace('_', ' ')}")
                    print("-" * 80)
                    for item in categories[category_name]:
                        field_name = item['field_name']
                        field_id = item['field_id']
                        result = item['result']

                        is_target = field_id == TARGET_FIELD_ID
                        marker = " 🎯 TARGET FIELD" if is_target else ""

                        print(f"\n  Field: {field_name}{marker}")
                        print(f"  ID: {field_id}")

                        if result['status'] == 'no_extractions':
                            print(f"  Status: No extractions found")
                        else:
                            print(f"  Status: {result['count']} extraction(s) found")
                            print(f"    - Working: {result['working']}")
                            print(f"    - Missing page: {result['missing_page']}")
                            print(f"    - Missing bbox: {result['missing_bbox']}")
                            print(f"    - Missing both: {result['missing_both']}")

                            # Show sample extraction
                            if result['details']:
                                sample = result['details'][0]
                                print(f"\n  Sample extraction:")
                                print(f"    Text: {sample['text']}")
                                print(f"    Page: {sample['page']}")
                                print(f"    Has bbox: {sample['has_bbox']}")
                                print(f"    Has spans with bbox: {sample['has_spans_with_bbox']}")
                                if sample['bbox_sample']:
                                    print(f"    Bbox sample: {sample['bbox_sample']}")
                                print(f"    Spans count: {sample['spans_count']}")
                                print(f"    Confidence: {sample['confidence']:.4f}")
                    print()

            # Show working fields
            if categories['working']:
                print("✅ WORKING FIELDS (Sample)")
                print("-" * 80)
                for item in categories['working'][:5]:  # Show first 5
                    field_name = item['field_name']
                    result = item['result']
                    print(f"  • {field_name}: {result['count']} extraction(s), all working")
                if len(categories['working']) > 5:
                    print(f"  ... and {len(categories['working']) - 5} more")
                print()

            print()
            print("=" * 80)
            print("🔍 TARGET FIELD ANALYSIS")
            print("=" * 80)

            # Find target field
            target_result = None
            for category in categories.values():
                for item in category:
                    if item['field_id'] == TARGET_FIELD_ID:
                        target_result = item
                        break
                if target_result:
                    break

            if target_result:
                print(f"Field: {TARGET_FIELD_NAME}")
                print(f"ID: {TARGET_FIELD_ID}")
                result = target_result['result']

                if result['status'] == 'no_extractions':
                    print("❌ Status: NO EXTRACTIONS FOUND")
                    print("\nThis field has not been extracted at all!")
                else:
                    print(f"Status: {result['status'].upper()}")
                    print(f"Total extractions: {result['count']}")
                    print(f"  - Working: {result['working']}")
                    print(f"  - Missing page: {result['missing_page']}")
                    print(f"  - Missing bbox: {result['missing_bbox']}")
                    print(f"  - Missing both: {result['missing_both']}")
                    print()

                    print("Detailed extraction breakdown:")
                    for i, detail in enumerate(result['details'], 1):
                        print(f"\n  Extraction {i}:")
                        print(f"    Text: {detail['text']}")
                        print(f"    Page: {detail['page']}")
                        print(f"    Has bbox: {detail['has_bbox']}")
                        print(f"    Has spans with bbox: {detail['has_spans_with_bbox']}")
                        if detail['bbox_sample']:
                            print(f"    Bbox sample: {detail['bbox_sample']}")
                        print(f"    Spans count: {detail['spans_count']}")
                        print(f"    Confidence: {detail['confidence']:.4f}")
                        print(f"    Status: {detail['status']}")
            else:
                print("❌ Target field not found in analysis!")

            print()
            print("=" * 80)
            print("💡 RECOMMENDATIONS")
            print("=" * 80)

            total_issues = (len(categories['missing_page']) +
                          len(categories['missing_bbox']) +
                          len(categories['missing_both']))

            if total_issues == 0:
                print("✅ All fields are working correctly!")
            else:
                print(f"⚠️  {total_issues} fields have highlighting issues")
                print()
                print("Recommended actions:")
                print()

                if categories['no_extractions']:
                    print(f"1. {len(categories['no_extractions'])} fields have no extractions:")
                    print("   - These fields may not be present in the document")
                    print("   - Or the extraction prompt needs improvement")
                    print()

                if categories['missing_both'] or categories['missing_bbox']:
                    print(f"2. {len(categories['missing_both']) + len(categories['missing_bbox'])} fields missing bbox data:")
                    print("   - The enrichment function should add bbox data")
                    print("   - Check if PDF text extraction includes coordinates")
                    print("   - Verify the _enrich_extraction_with_pdf_data() function is working")
                    print()

                if categories['missing_page']:
                    print(f"3. {len(categories['missing_page'])} fields missing page numbers:")
                    print("   - The extraction process should capture page numbers")
                    print("   - Verify the LLM is returning page information")
                    print("   - Check if the prompt instructs to include page numbers")
                    print()

                print("4. Next steps:")
                print("   - Run the enrichment function on affected extractions")
                print("   - Check PDF structure and text layer quality")
                print("   - Review extraction prompts for page number instructions")
                print("   - Test with a different credit agreement document")

            print()
            print("=" * 80)

    finally:
        conn.close()

if __name__ == "__main__":
    main()
