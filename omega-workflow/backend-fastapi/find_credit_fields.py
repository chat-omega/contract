#!/usr/bin/env python3
"""
Find fields in database that match Credit Agreement template requirements
"""
import sqlite3
import json

# Connect to database
conn = sqlite3.connect('/app/database/omega.db')
conn.row_factory = sqlite3.Row
cursor = conn.cursor()

# Define field requirements for Credit Agreement template
credit_agreement_fields = {
    'Basic Information': [
        'Title',
        'Parties',
        'Date',
        'Use of Proceeds'
    ],
    'Facility Structure & Economics': [
        'Credit Facility',
        'Maturity Date',
        'Termination Date',
        'Incremental',
        'Accordion',
        'Interest Rate',
        'LIBOR',
        'SOFR',
        'Margin',
        'Commitment Fee',
        'Administrative Agent Fee'
    ],
    'Repayment, Amortization & Prepayments': [
        'Scheduled Repayment',
        'Amortization',
        'Interest Payment',
        'Mandatory Prepayment',
        'Prepayment Premium',
        'Call Protection',
        'Change of Control',
        'Anticipated Repayment Date'
    ],
    'Collateral, Guarantees & Borrowing Base': [
        'Collateral',
        'Security',
        'Guarantee',
        'Borrowing Base'
    ],
    'Affirmative & Information Covenants': [
        'Financial Statements',
        'Information Reporting',
        'Books',
        'Records',
        'Inspection',
        'Use of Proceeds',
        'Anti-Corruption',
        'Sanctions'
    ],
    'Negative Covenants': [
        'Indebtedness',
        'Liens',
        'Negative Pledge',
        'Restricted Payments',
        'Investments',
        'Acquisitions',
        'Asset Sale',
        'Disposition',
        'Affiliate',
        'Related-Party',
        'Increased Costs',
        'Capital Requirements',
        'Tax gross-up'
    ],
    'Financial Covenants & Definitions': [
        'Financial Covenant',
        'Leverage Ratio',
        'Interest Coverage',
        'Debt Service Coverage',
        'EBITDA',
        'Consolidated Net Income',
        'Fixed Charges'
    ],
    'Conditions to Closing / Funding': [
        'Consummation',
        'Acquisition Condition',
        'Merger Condition',
        'Financial Information Condition',
        'Government Authorization',
        'Third Party Authorization'
    ],
    'Events of Default & Remedies': [
        'Default for Non-Payment',
        'Default',
        'Misrepresentation',
        'Insolvency',
        'Bankruptcy',
        'Judgment',
        'Invalidity',
        'Unlawfulness',
        'Pension',
        'Cross Default',
        'Cross Acceleration'
    ],
    'Lender Mechanics, Amendments & Transfers': [
        'Majority',
        'Supermajority',
        'Affected Lender',
        'Assignment Rights',
        'Defaulting Lender',
        'Costs and Expenses',
        'Indemnities',
        'Administrative Agent',
        'Collateral Agent'
    ],
    'Boilerplate / General Provisions': [
        'Electronic Signature',
        'Governing Law',
        'Government Authorization',
        'Notices',
        'Electronic Communication'
    ]
}

# Search for each field
results = {}
for group, search_terms in credit_agreement_fields.items():
    print(f"\n{'='*80}")
    print(f"GROUP: {group}")
    print('='*80)

    group_results = []
    for term in search_terms:
        cursor.execute("""
            SELECT field_id, name, description, tags
            FROM fields
            WHERE name LIKE ?
            ORDER BY name
            LIMIT 5
        """, (f'%{term}%',))

        matches = cursor.fetchall()
        if matches:
            print(f"\n  Search: '{term}' - Found {len(matches)} matches:")
            for row in matches:
                tags_raw = row['tags']
                tags = json.loads(tags_raw) if tags_raw else []
                # Prefer Credit/Facility Agreement tagged fields
                is_credit_tagged = any('Credit' in str(tag) or 'Facility' in str(tag) for tag in tags) if tags else False
                print(f"    ✓ {row['name']}")
                print(f"      ID: {row['field_id']}")
                if tags:
                    print(f"      Tags: {', '.join(str(t) for t in tags[:3])}")
                else:
                    print(f"      Tags: None")
                if is_credit_tagged:
                    print(f"      ⭐ CREDIT/FACILITY TAGGED")

                group_results.append({
                    'field_id': row['field_id'],
                    'name': row['name'],
                    'tags': tags,
                    'is_credit_tagged': is_credit_tagged
                })
        else:
            print(f"\n  Search: '{term}' - No matches found")

    results[group] = group_results

conn.close()

print(f"\n\n{'='*80}")
print("SUMMARY")
print('='*80)
print(f"Total groups: {len(results)}")
for group, fields in results.items():
    print(f"  {group}: {len(fields)} fields found")
