import asyncio
import aiosqlite

async def check_status():
    async with aiosqlite.connect('/app/database/omega.db') as db:
        cursor = await db.execute(
            "SELECT id, document_id, status, zuva_file_id FROM extractions"
        )
        rows = await cursor.fetchall()
        print(f"Found {len(rows)} extraction records:")
        for row in rows:
            print(f"  ID: {row[0]}, Doc: {row[1]}, Status: {row[2]}, Zuva File: {row[3]}")

asyncio.run(check_status())
