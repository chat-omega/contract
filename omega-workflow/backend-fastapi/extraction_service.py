#!/usr/bin/env python3
"""
Extraction Service Orchestrator Agent
Coordinates document field extraction using Zuva API
"""

import os
import asyncio
from typing import Optional, List, Dict, Any
from pathlib import Path

from zuva_client import ZuvaClient, ZuvaAPIError
from database_async import AsyncDatabase


class ExtractionService:
    """
    Extraction Service Orchestrator Agent

    Coordinates:
    - Document extraction workflow
    - Zuva API integration
    - Database state management
    - Error handling and retries
    """

    def __init__(self, db: AsyncDatabase, zuva_token: Optional[str] = None):
        """
        Initialize extraction service

        Args:
            db: Database instance
            zuva_token: Zuva API token (from env if not provided)
        """
        self.db = db
        self.zuva_token = zuva_token or os.getenv('ZUVA_API_TOKEN')
        self.zuva_client = None

        print(f"✅ Extraction service initialized")

    async def _get_zuva_client(self) -> ZuvaClient:
        """Get or create Zuva client instance"""
        if not self.zuva_client:
            self.zuva_client = ZuvaClient(api_token=self.zuva_token)
        return self.zuva_client

    async def start_extraction(
        self,
        document_id: str,
        workflow_id: int,
        document_path: str
    ) -> Dict[str, Any]:
        """
        Start extraction process for a document-workflow pair

        Args:
            document_id: Document ID
            workflow_id: Workflow ID
            document_path: Path to document file

        Returns:
            Extraction record with status
        """
        try:
            print(f"🚀 Starting extraction for document={document_id}, workflow={workflow_id}")

            # Check if extraction already exists
            existing = await self.db.get_extraction_by_document_workflow(
                document_id, workflow_id
            )

            if existing:
                if existing['status'] == 'complete':
                    print(f"✅ Extraction already complete, returning cached results")
                    return existing
                elif existing['status'] == 'processing':
                    print(f"⏳ Extraction already in progress")
                    return existing
                elif existing['status'] == 'failed':
                    print(f"🔄 Previous extraction failed, retrying...")
                    # Continue to retry

            # Get workflow to retrieve field IDs
            # We need to get the workflow without user_id check for extraction
            import aiosqlite
            async with aiosqlite.connect(self.db.db_path) as db:
                db.row_factory = aiosqlite.Row
                cursor = await db.execute("""
                    SELECT id, user_id, name, description, fields, document_types, status, created_at, updated_at
                    FROM workflows WHERE id = ?
                """, (workflow_id,))
                row = await cursor.fetchone()
                workflow = dict(row) if row else None

            if not workflow:
                raise ValueError(f"Workflow not found: {workflow_id}")

            # Parse field IDs from workflow
            import json
            fields_data = json.loads(workflow.get('fields', '[]'))

            # Extract field IDs - handle both object format and string format
            field_ids = []

            # Handle list format (array of objects or strings)
            if isinstance(fields_data, list):
                for field in fields_data:
                    if isinstance(field, dict):
                        # Object format: {"name": "Title", "fieldId": "uuid"}
                        field_id = field.get('fieldId') or field.get('field_id')
                        if field_id:
                            field_ids.append(field_id)
                    elif isinstance(field, str):
                        # String format: "uuid"
                        field_ids.append(field)

            # Handle nested category format (dict of arrays)
            elif isinstance(fields_data, dict):
                for category_name, category_fields in fields_data.items():
                    if isinstance(category_fields, list):
                        for field in category_fields:
                            if isinstance(field, dict):
                                field_id = field.get('fieldId') or field.get('field_id')
                                if field_id:
                                    field_ids.append(field_id)
                            elif isinstance(field, str):
                                field_ids.append(field)

            if not field_ids:
                raise ValueError(f"No fields configured in workflow {workflow_id}")

            # Validate field IDs are valid UUIDs
            import re
            UUID_PATTERN = re.compile(r'^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$', re.IGNORECASE)

            validated_field_ids = []
            invalid_fields = []

            for fid in field_ids:
                if UUID_PATTERN.match(str(fid)):
                    validated_field_ids.append(fid)
                else:
                    invalid_fields.append(fid)

            # Deduplicate validated field IDs
            validated_field_ids = list(dict.fromkeys(validated_field_ids))

            if invalid_fields:
                print(f"⚠️  Warning: {len(invalid_fields)} invalid field IDs filtered out from workflow {workflow_id}")
                for inv_field in invalid_fields[:5]:  # Show first 5
                    print(f"   - Invalid: '{inv_field}' (not a valid UUID)")
                if len(invalid_fields) > 5:
                    print(f"   ... and {len(invalid_fields) - 5} more")

            if not validated_field_ids:
                raise ValueError(
                    f"No valid field IDs found in workflow {workflow_id}. "
                    f"All {len(field_ids)} fields were invalid or missing fieldId. "
                    f"Fields must be valid UUIDs in format: xxxxxxxx-xxxx-xxxx-xxxx-xxxxxxxxxxxx"
                )

            field_ids = validated_field_ids

            print(f"📋 Extracting {len(field_ids)} fields")
            print(f"   Field IDs: {field_ids[:3]}{'...' if len(field_ids) > 3 else ''}")

            # Create or update extraction record
            if existing:
                extraction_id = existing['id']
                await self.db.update_extraction_status(extraction_id, 'pending')
                extraction = await self.db.get_extraction(extraction_id)
            else:
                extraction = await self.db.create_extraction(
                    document_id=document_id,
                    workflow_id=workflow_id
                )

            if not extraction:
                raise ValueError("Failed to create extraction record")

            extraction_id = extraction['id']

            # Start async extraction in background
            asyncio.create_task(
                self._process_extraction(
                    extraction_id=extraction_id,
                    document_path=document_path,
                    field_ids=field_ids
                )
            )

            return extraction

        except Exception as e:
            print(f"❌ Error starting extraction: {e}")
            raise

    async def _process_extraction(
        self,
        extraction_id: int,
        document_path: str,
        field_ids: List[str]
    ):
        """
        Process extraction in background

        Args:
            extraction_id: Extraction record ID
            document_path: Path to document file
            field_ids: List of field IDs to extract
        """
        try:
            # Update status to processing
            await self.db.update_extraction_status(extraction_id, 'processing')
            print(f"⚙️  Processing extraction {extraction_id}")

            # Get Zuva client
            client = await self._get_zuva_client()

            # Step 1: Upload file to Zuva (with timeout)
            print(f"📤 Uploading file to Zuva...")
            try:
                file_id, file_metadata = await asyncio.wait_for(
                    client.upload_file(document_path),
                    timeout=60.0  # 60 second timeout for upload
                )
            except asyncio.TimeoutError:
                raise ZuvaAPIError("File upload timeout after 60 seconds")

            # Update extraction with Zuva file ID
            extraction = await self.db.get_extraction(extraction_id)
            if extraction:
                # Store zuva_file_id
                import aiosqlite
                async with aiosqlite.connect(self.db.db_path) as db:
                    await db.execute("""
                        UPDATE extractions SET zuva_file_id = ? WHERE id = ?
                    """, (file_id, extraction_id))
                    await db.commit()

            # Step 2: Request extraction (with timeout)
            print(f"🔍 Requesting field extraction...")
            try:
                request_id, request_data = await asyncio.wait_for(
                    client.request_extraction(
                        file_ids=[file_id],
                        field_ids=field_ids
                    ),
                    timeout=30.0  # 30 second timeout for extraction request
                )
            except asyncio.TimeoutError:
                raise ZuvaAPIError("Extraction request timeout after 30 seconds")

            # Update extraction with request ID
            await self.db.update_extraction_status(
                extraction_id,
                'processing',
                zuva_request_id=request_id
            )

            # Step 3: Wait for extraction to complete (with built-in timeout)
            print(f"⏳ Waiting for extraction to complete...")
            status_data = await client.wait_for_extraction(request_id)

            # Step 4: Get results
            print(f"📥 Retrieving extraction results...")
            raw_results = await client.get_extraction_results(request_id)

            # Step 5: Parse and save results
            parsed_results, answer_metadata = client.parse_extraction_results(raw_results)
            print(f"✅ Extraction complete! Extracted {len(parsed_results)} fields")
            if answer_metadata:
                print(f"   📊 Answer-type fields: {len(answer_metadata)}")

            # Step 6: Enrich answer metadata with answer options from field definitions
            if answer_metadata:
                print(f"🔍 Fetching field definitions to enrich answer options...")
                field_definitions = await client.get_field_definitions()

                for field_id, metadata in answer_metadata.items():
                    field_def = next((f for f in field_definitions if f.get('field_id') == field_id), None)
                    if field_def and field_def.get('answer_options'):
                        metadata['answer_options'] = field_def['answer_options']
                        print(f"   ✅ Added answer options for {metadata.get('field_name')}")

            # Save to database
            await self.db.save_extraction_results(extraction_id, parsed_results, answer_metadata)

            print(f"✅ Extraction {extraction_id} completed successfully")

        except ZuvaAPIError as e:
            error_msg = f"Zuva API error: {e}"
            print(f"❌ {error_msg}")
            await self.db.update_extraction_status(
                extraction_id,
                'failed',
                error_message=error_msg
            )

        except Exception as e:
            error_msg = f"Extraction processing error: {e}"
            print(f"❌ {error_msg}")
            await self.db.update_extraction_status(
                extraction_id,
                'failed',
                error_message=error_msg
            )

    async def get_extraction_status(
        self,
        document_id: str,
        workflow_id: int
    ) -> Optional[Dict[str, Any]]:
        """
        Get extraction status for a document-workflow pair

        Args:
            document_id: Document ID
            workflow_id: Workflow ID

        Returns:
            Extraction record with status and results
        """
        try:
            extraction = await self.db.get_extraction_by_document_workflow(
                document_id, workflow_id
            )

            if not extraction:
                return None

            return {
                'id': extraction['id'],
                'status': extraction['status'],
                'results': extraction.get('results'),
                'error_message': extraction.get('error_message'),
                'created_at': extraction['created_at'],
                'started_at': extraction.get('started_at'),
                'completed_at': extraction.get('completed_at')
            }

        except Exception as e:
            print(f"❌ Error getting extraction status: {e}")
            return None

    async def get_extraction_results(
        self,
        document_id: str,
        workflow_id: int
    ) -> Optional[Dict[str, Any]]:
        """
        Get extraction results for a document-workflow pair

        Args:
            document_id: Document ID
            workflow_id: Workflow ID

        Returns:
            Parsed extraction results or None if not complete
        """
        try:
            extraction = await self.db.get_extraction_by_document_workflow(
                document_id, workflow_id
            )

            if not extraction:
                return None

            if extraction['status'] != 'complete':
                return None

            return extraction.get('results')

        except Exception as e:
            print(f"❌ Error getting extraction results: {e}")
            return None

    async def cancel_extraction(
        self,
        document_id: str,
        workflow_id: int
    ) -> bool:
        """
        Cancel an in-progress extraction

        Args:
            document_id: Document ID
            workflow_id: Workflow ID

        Returns:
            True if cancelled, False otherwise
        """
        try:
            extraction = await self.db.get_extraction_by_document_workflow(
                document_id, workflow_id
            )

            if not extraction:
                return False

            if extraction['status'] not in ['pending', 'processing']:
                return False

            # Update status to failed with cancellation message
            await self.db.update_extraction_status(
                extraction['id'],
                'failed',
                error_message='Cancelled by user'
            )

            return True

        except Exception as e:
            print(f"❌ Error cancelling extraction: {e}")
            return False

    async def cleanup(self):
        """Cleanup resources"""
        if self.zuva_client:
            await self.zuva_client.close()


# Example usage
async def test_extraction_service():
    """Test the extraction service"""
    print("🧪 Testing Extraction Service")
    print("=" * 50)

    try:
        db = AsyncDatabase()
        service = ExtractionService(db)

        # Test would require actual document and workflow
        # extraction = await service.start_extraction(
        #     document_id="test-doc",
        #     workflow_id="1",
        #     document_path="/path/to/document.pdf"
        # )
        # print(f"✅ Extraction started: {extraction}")

        print("✅ Service initialized successfully")

        await service.cleanup()

    except Exception as e:
        print(f"❌ Test failed: {e}")
        raise


if __name__ == "__main__":
    asyncio.run(test_extraction_service())
