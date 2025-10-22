#!/bin/bash
set -e

echo "========================================="
echo "Omega Workflow Backend - Starting Up"
echo "========================================="

# ✅ DEV MODE: Skip field import check to speed up startup
if [ "$DEV_MODE" = "true" ]; then
    echo "🚀 DEV MODE: Skipping field import check for faster startup"
    echo "   (Fields should already be imported from first run)"
else
    # Run field import on startup
    echo ""
    echo "📊 Checking if fields need to be imported..."
    FIELD_COUNT=$(python3 << 'PYTHON_EOF'
import asyncio
from database_async import AsyncDatabase

async def get_count():
    db = AsyncDatabase()
    count = await db.get_field_count()
    print(count, end='')

asyncio.run(get_count())
PYTHON_EOF
)

    echo "Current field count in database: $FIELD_COUNT"

    if [ "$FIELD_COUNT" -lt 100 ]; then
        echo "Field count is low ($FIELD_COUNT). Running import..."
        python3 /app/import_fields.py
    else
        echo "✅ Fields already imported ($FIELD_COUNT fields found)"
    fi
fi

echo ""
echo "========================================="
echo "Starting FastAPI Server"
echo "========================================="

# ✅ DEV MODE: Start with --reload if DEV_MODE is set
if [ "$DEV_MODE" = "true" ]; then
    echo "🔥 Starting with auto-reload enabled"
    exec uvicorn main:app --host 0.0.0.0 --port 5000 --reload
else
    exec uvicorn main:app --host 0.0.0.0 --port 5000
fi
