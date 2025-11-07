#!/usr/bin/env python3
import sqlite3

conn = sqlite3.connect('/app/database/omega.db')
conn.row_factory = sqlite3.Row
cursor = conn.cursor()

# Search for missing field IDs
searches = {
    'Majority/Supermajority': ['Majority', 'Supermajority'],
    'Assignment': ['Assignment', 'Lender'],
    'Defaulting Lender': ['Defaulting Lender'],
    'Costs and Expenses': ['Costs', 'Expenses', 'Indemnit'],
    'Administrative Agent': ['Administrative Agent', 'Collateral Agent'],
    'Electronic Signature': ['Electronic Signature'],
    'Notice': ['Notice', 'Electronic']
}

print("Finding fields for Credit Agreement template:\n")
for label, terms in searches.items():
    print(f"{label}:")
    query = "SELECT field_id, name, tags FROM fields WHERE " + " OR ".join(["name LIKE ?" for _ in terms])
    query += " ORDER BY name LIMIT 5"
    params = tuple([f'%{term}%' for term in terms])
    cursor.execute(query, params)
    results = cursor.fetchall()
    for r in results:
        tags = r['tags'] if r['tags'] else ''
        credit_tag = '⭐ CREDIT' if 'Credit' in tags or 'Facility' in tags else ''
        print(f"  {r['name']}: {r['field_id']} {credit_tag}")
    print()

conn.close()
