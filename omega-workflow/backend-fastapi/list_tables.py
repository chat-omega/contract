import asyncio
import aiosqlite

async def list_tables():
    async with aiosqlite.connect('/app/database/omega.db') as db:
        cursor = await db.execute('SELECT name FROM sqlite_master WHERE type="table"')
        rows = await cursor.fetchall()
        print("TABLES IN DATABASE:")
        for row in rows:
            print(f"  - {row[0]}")

asyncio.run(list_tables())
