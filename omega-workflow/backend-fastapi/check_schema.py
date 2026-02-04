#!/usr/bin/env python3
import asyncio
import aiosqlite

async def check_schema():
    async with aiosqlite.connect('/app/database/omega.db') as db:
        # Check fields table
        cursor = await db.execute('PRAGMA table_info(fields)')
        rows = await cursor.fetchall()
        print("FIELDS TABLE SCHEMA:")
        for row in rows:
            print(f"  {row}")

        # Check extraction_results table
        cursor = await db.execute('PRAGMA table_info(extraction_results)')
        rows = await cursor.fetchall()
        print("\nEXTRACTION_RESULTS TABLE SCHEMA:")
        for row in rows:
            print(f"  {row}")

        # Check documents table
        cursor = await db.execute('PRAGMA table_info(documents)')
        rows = await cursor.fetchall()
        print("\nDOCUMENTS TABLE SCHEMA:")
        for row in rows:
            print(f"  {row}")

asyncio.run(check_schema())
