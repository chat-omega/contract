import asyncio
import aiosqlite

async def check_schema():
    async with aiosqlite.connect('/app/database/omega.db') as db:
        cursor = await db.execute('PRAGMA table_info(extractions)')
        rows = await cursor.fetchall()
        print("EXTRACTIONS TABLE SCHEMA:")
        for row in rows:
            print(f"  {row}")

asyncio.run(check_schema())
