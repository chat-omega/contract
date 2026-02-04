#!/usr/bin/env python3
import sqlite3

conn = sqlite3.connect("/app/database/omega.db")
cursor = conn.cursor()

# Get all tables
cursor.execute("SELECT name FROM sqlite_master WHERE type='table'")
tables = cursor.fetchall()

print("All tables in database:")
for table in tables:
    print(f"  - {table[0]}")

print("\n" + "="*80 + "\n")

# Check each relevant table
for table_name in ['documents', 'extractions', 'field_extractions']:
    try:
        cursor.execute(f"PRAGMA table_info({table_name})")
        columns = cursor.fetchall()
        print(f"{table_name} table schema:")
        for col in columns:
            print(f"  {col[1]} ({col[2]})")
        print()
    except:
        print(f"{table_name} table does not exist\n")

conn.close()
