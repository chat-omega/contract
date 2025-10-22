#!/usr/bin/env python3
"""
Simple Zuva API Test
Tests extraction with 2 fields from M&A template
"""

import asyncio
import os
from pathlib import Path
from zuva_client import ZuvaClient


async def test_simple_extraction():
    """Test extraction with 2 known good field IDs"""
    print("🧪 Testing Zuva API with Simple Extraction")
    print("=" * 60)

    # Known good field IDs from M&A template
    test_field_ids = [
        "25d677a1-70d0-43c2-9b36-d079733dd020",  # Title
        "98086156-f230-423c-b214-27f542e72708"   # Parties
    ]

    # Find BuzzFeed document
    document_path = "/app/uploads/e37f9df8_BuzzFeed Agreement.pdf"

    try:
        # Initialize Zuva client
        print("\n1. Initializing Zuva client...")
        client = ZuvaClient()
        print("   ✅ Client initialized")

        # Upload file
        print("\n2. Uploading document...")
        if not Path(document_path).exists():
            print(f"   ❌ Document not found: {document_path}")
            print(f"   Looking for alternative path...")
            # Try to find the document
            uploads_dir = Path("/app/uploads")
            if uploads_dir.exists():
                pdf_files = list(uploads_dir.glob("*BuzzFeed*.pdf"))
                if pdf_files:
                    document_path = str(pdf_files[0])
                    print(f"   Found: {document_path}")
                else:
                    print(f"   ❌ No BuzzFeed PDF found in {uploads_dir}")
                    return
            else:
                print(f"   ❌ Uploads directory not found: {uploads_dir}")
                return

        file_id, metadata = await client.upload_file(document_path)
        print(f"   ✅ File uploaded: {file_id}")
        print(f"   Size: {metadata.get('size', 'unknown')} bytes")

        # Request extraction
        print("\n3. Requesting field extraction...")
        print(f"   Field IDs: {test_field_ids}")
        request_id, request_data = await client.request_extraction(
            file_ids=[file_id],
            field_ids=test_field_ids
        )
        print(f"   ✅ Extraction requested: {request_id}")

        # Wait for extraction
        print("\n4. Waiting for extraction to complete...")
        status_data = await client.wait_for_extraction(request_id, max_wait=180, poll_interval=3)
        print(f"   ✅ Extraction complete!")
        print(f"   Status: {status_data}")

        # Get results
        print("\n5. Retrieving extraction results...")
        raw_results = await client.get_extraction_results(request_id)
        parsed_results = client.parse_extraction_results(raw_results)

        print(f"   ✅ Results retrieved!")
        print(f"   Fields extracted: {len(parsed_results)}")

        # Show sample results
        for field_id, extractions in parsed_results.items():
            print(f"\n   Field: {field_id}")
            for extraction in extractions[:2]:  # Show first 2
                print(f"     - Text: {extraction.get('text', 'N/A')[:100]}...")
                print(f"       Page: {extraction.get('page')}")
                print(f"       Confidence: {extraction.get('confidence')}")

        await client.close()

        print("\n" + "=" * 60)
        print("✅ TEST PASSED! Zuva API is working correctly!")
        print("=" * 60)

    except Exception as e:
        print(f"\n❌ TEST FAILED: {e}")
        print(f"   Error type: {type(e).__name__}")
        import traceback
        traceback.print_exc()
        raise


if __name__ == "__main__":
    asyncio.run(test_simple_extraction())
