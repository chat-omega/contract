#!/usr/bin/env python3
import sqlite3
import json

conn = sqlite3.connect("/app/database/omega.db")
cursor = conn.cursor()

# Get fields table schema
cursor.execute("PRAGMA table_info(fields)")
columns = cursor.fetchall()

print("Fields table schema:")
for col in columns:
    print(f"  {col[1]} ({col[2]})")

print("\n" + "="*80 + "\n")

# Get all fields for workflow 35
cursor.execute("""
    SELECT * FROM fields
    WHERE workflow_id = 35
    LIMIT 5
""")

fields = cursor.fetchall()
print(f"Sample fields from workflow 35 (showing first 5):")
for field in fields:
    print(field)
    print()

conn.close()
