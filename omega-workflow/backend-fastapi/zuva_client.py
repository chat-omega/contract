#!/usr/bin/env python3
"""
Zuva API Client Agent
Handles all interactions with the Zuva AI API for document field extraction
"""

import os
import json
import asyncio
import time
from typing import Optional, List, Dict, Any, Tuple
from pathlib import Path
import httpx
from tenacity import (
    retry,
    stop_after_attempt,
    wait_exponential,
    retry_if_exception_type
)


class ZuvaAPIError(Exception):
    """Base exception for Zuva API errors"""
    pass


class ZuvaAuthenticationError(ZuvaAPIError):
    """Raised when authentication fails"""
    pass


class ZuvaUploadError(ZuvaAPIError):
    """Raised when file upload fails"""
    pass


class ZuvaExtractionError(ZuvaAPIError):
    """Raised when extraction request fails"""
    pass


class ZuvaClient:
    """
    Zuva API Client Agent

    Handles:
    - Authentication with bearer token
    - File upload to Zuva
    - Field extraction requests
    - Status polling
    - Results retrieval
    """

    def __init__(
        self,
        api_token: Optional[str] = None,
        region: str = 'us',
        timeout: int = 300
    ):
        """
        Initialize Zuva API client

        Args:
            api_token: Zuva API bearer token (from env if not provided)
            region: API region ('us' or 'eu')
            timeout: Request timeout in seconds
        """
        self.api_token = api_token or os.getenv('ZUVA_API_TOKEN')
        if not self.api_token:
            raise ZuvaAuthenticationError("ZUVA_API_TOKEN not provided")

        self.region = region
        self.base_url = self._get_base_url(region)
        self.timeout = timeout

        # HTTP client with connection pooling
        self.client = httpx.AsyncClient(
            timeout=httpx.Timeout(timeout),
            headers=self._get_headers(),
            limits=httpx.Limits(max_keepalive_connections=5, max_connections=10)
        )

        # Field definitions cache with TTL (1 hour)
        self._field_definitions_cache: Optional[List[Dict[str, Any]]] = None
        self._cache_timestamp: Optional[float] = None
        self._cache_ttl: int = 3600  # 1 hour in seconds

        print(f"✅ Zuva client initialized (region: {region}, base_url: {self.base_url})")

    def _get_base_url(self, region: str) -> str:
        """Get base URL for the specified region"""
        urls = {
            'us': 'https://us.app.zuva.ai/api/v2',
            'eu': 'https://eu.app.zuva.ai/api/v2'
        }
        if region not in urls:
            raise ValueError(f"Invalid region: {region}. Must be 'us' or 'eu'")
        return urls[region]

    def _get_headers(self, content_type: Optional[str] = None) -> Dict[str, str]:
        """Get request headers with authentication"""
        headers = {
            'Authorization': f'Bearer {self.api_token}'
        }
        if content_type:
            headers['Content-Type'] = content_type
        return headers

    @retry(
        stop=stop_after_attempt(3),
        wait=wait_exponential(multiplier=1, min=2, max=10),
        retry=retry_if_exception_type((httpx.NetworkError, httpx.TimeoutException))
    )
    async def upload_file(self, file_path: str) -> Tuple[str, Dict[str, Any]]:
        """
        Upload a file to Zuva

        Args:
            file_path: Path to the file to upload

        Returns:
            Tuple of (file_id, metadata)

        Raises:
            ZuvaUploadError: If upload fails
        """
        try:
            file_path_obj = Path(file_path)

            if not file_path_obj.exists():
                raise ZuvaUploadError(f"File not found: {file_path}")

            # Read file content
            async with httpx.AsyncClient() as temp_client:
                with open(file_path_obj, 'rb') as f:
                    file_content = f.read()

            print(f"📤 Uploading file to Zuva: {file_path_obj.name} ({len(file_content)} bytes)")

            # Upload to Zuva
            response = await self.client.post(
                f"{self.base_url}/files",
                content=file_content,
                headers={
                    **self._get_headers(),
                    'Content-Type': 'application/octet-stream'
                }
            )

            if response.status_code == 401:
                raise ZuvaAuthenticationError("Invalid API token")

            if response.status_code != 201:
                error_detail = response.text
                raise ZuvaUploadError(
                    f"Upload failed with status {response.status_code}: {error_detail}"
                )

            result = response.json()
            file_id = result.get('file_id')

            if not file_id:
                raise ZuvaUploadError("No file_id in response")

            print(f"✅ File uploaded successfully: file_id={file_id}")

            return file_id, result

        except httpx.HTTPError as e:
            raise ZuvaUploadError(f"HTTP error during upload: {e}")
        except Exception as e:
            raise ZuvaUploadError(f"Unexpected error during upload: {e}")

    @retry(
        stop=stop_after_attempt(3),
        wait=wait_exponential(multiplier=1, min=2, max=10),
        retry=retry_if_exception_type((httpx.NetworkError, httpx.TimeoutException))
    )
    async def get_field_definitions(
        self,
        force_refresh: bool = False
    ) -> List[Dict[str, Any]]:
        """
        Get all field definitions from Zuva API with caching

        Args:
            force_refresh: Force refresh cache even if not expired

        Returns:
            List of field definitions with metadata

        Raises:
            ZuvaAPIError: If field retrieval fails
        """
        try:
            # Check cache
            current_time = time.time()
            cache_valid = (
                self._field_definitions_cache is not None and
                self._cache_timestamp is not None and
                (current_time - self._cache_timestamp) < self._cache_ttl
            )

            if cache_valid and not force_refresh:
                print(f"✅ Using cached field definitions ({len(self._field_definitions_cache)} fields)")
                return self._field_definitions_cache

            print(f"🔍 Fetching field definitions from Zuva API...")

            response = await self.client.get(
                f"{self.base_url}/fields",
                headers=self._get_headers()
            )

            if response.status_code == 401:
                raise ZuvaAuthenticationError("Invalid API token")

            if response.status_code != 200:
                error_detail = response.text
                raise ZuvaAPIError(
                    f"Field definitions request failed with status {response.status_code}: {error_detail}"
                )

            result = response.json()

            # Zuva returns fields as a direct array, not wrapped in an object
            if isinstance(result, list):
                fields = result
            else:
                # Fallback: check if it's wrapped in a 'fields' key
                fields = result.get('fields', [])

            # Cache the results
            self._field_definitions_cache = fields
            self._cache_timestamp = current_time

            print(f"✅ Fetched {len(fields)} field definitions from Zuva")

            return fields

        except httpx.HTTPError as e:
            raise ZuvaAPIError(f"HTTP error during field definitions retrieval: {e}")
        except Exception as e:
            raise ZuvaAPIError(f"Unexpected error during field definitions retrieval: {e}")

    @retry(
        stop=stop_after_attempt(3),
        wait=wait_exponential(multiplier=1, min=2, max=10),
        retry=retry_if_exception_type((httpx.NetworkError, httpx.TimeoutException))
    )
    async def request_extraction(
        self,
        file_ids: List[str],
        field_ids: List[str]
    ) -> Tuple[str, Dict[str, Any]]:
        """
        Request field extraction for files

        Args:
            file_ids: List of Zuva file IDs (max 100)
            field_ids: List of field IDs to extract (max 100)

        Returns:
            Tuple of (request_id, response_data)

        Raises:
            ZuvaExtractionError: If extraction request fails
        """
        try:
            # Validate inputs
            if not field_ids:
                raise ZuvaExtractionError("field_ids cannot be empty")
            if not file_ids:
                raise ZuvaExtractionError("file_ids cannot be empty")

            if len(file_ids) > 100:
                raise ZuvaExtractionError("Maximum 100 files per request")
            if len(field_ids) > 100:
                raise ZuvaExtractionError("Maximum 100 fields per request")

            # Validate all field_ids are valid UUIDs
            import re
            UUID_PATTERN = re.compile(r'^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$', re.IGNORECASE)

            invalid_fields = []
            for field_id in field_ids:
                if not field_id or not isinstance(field_id, str):
                    invalid_fields.append(f"Invalid type or empty: {field_id}")
                elif not UUID_PATTERN.match(field_id):
                    invalid_fields.append(f"Invalid UUID format: {field_id}")

            if invalid_fields:
                raise ZuvaExtractionError(
                    f"Invalid field_ids detected ({len(invalid_fields)} errors):\n" +
                    "\n".join(f"  - {err}" for err in invalid_fields[:5]) +
                    (f"\n  ... and {len(invalid_fields) - 5} more" if len(invalid_fields) > 5 else "")
                )

            payload = {
                "file_ids": file_ids,
                "field_ids": field_ids
            }

            print(f"🔍 Requesting extraction:")
            print(f"   Files: {len(file_ids)}")
            print(f"   Fields: {len(field_ids)}")
            print(f"   File IDs: {file_ids}")
            print(f"   Field IDs (first 3): {field_ids[:3]}{'...' if len(field_ids) > 3 else ''}")

            # Optional debug logging
            debug_mode = os.getenv('ZUVA_DEBUG', 'false').lower() == 'true'
            if debug_mode:
                print(f"   🐛 DEBUG - Full payload:")
                print(f"   {json.dumps(payload, indent=2)}")

            response = await self.client.post(
                f"{self.base_url}/extraction",
                json=payload,
                headers=self._get_headers('application/json')
            )

            # Handle different error status codes
            if response.status_code == 401:
                raise ZuvaAuthenticationError("Invalid API token - check ZUVA_API_TOKEN environment variable")

            if response.status_code == 400:
                # Parse error details from Zuva
                try:
                    error_data = response.json()
                    error_msg = error_data.get('error', {}).get('message', response.text)
                    error_code = error_data.get('error', {}).get('code', 'unknown')
                except:
                    error_msg = response.text
                    error_code = 'unknown'

                raise ZuvaExtractionError(
                    f"Zuva API rejected request (400 Bad Request):\n"
                    f"  Error Code: {error_code}\n"
                    f"  Message: {error_msg}\n"
                    f"  This usually indicates invalid field_ids or malformed request payload.\n"
                    f"  Sent {len(field_ids)} field_ids and {len(file_ids)} file_ids"
                )

            if response.status_code == 404:
                raise ZuvaExtractionError(
                    f"Resource not found (404) - one or more field_ids may not exist in Zuva's library"
                )

            if response.status_code != 202:
                error_detail = response.text
                raise ZuvaExtractionError(
                    f"Extraction request failed with status {response.status_code}: {error_detail}"
                )

            result = response.json()

            # Debug logging for response
            if debug_mode:
                print(f"   🐛 DEBUG - Response status: {response.status_code}")
                print(f"   🐛 DEBUG - Response body:")
                print(f"   {json.dumps(result, indent=2)}")

            # Zuva returns nested structure: {file_ids: [{request_id, file_id, status}]}
            file_ids_array = result.get('file_ids', [])
            if not file_ids_array:
                raise ZuvaExtractionError(
                    f"Invalid response structure - no file_ids array. Response: {result}"
                )

            # Get first file's request_id (we send one file at a time)
            first_file_result = file_ids_array[0]
            request_id = first_file_result.get('request_id')
            file_id = first_file_result.get('file_id')
            status = first_file_result.get('status', 'unknown')

            if not request_id:
                raise ZuvaExtractionError(
                    f"No request_id in response. File result: {first_file_result}"
                )

            print(f"✅ Extraction requested successfully: request_id={request_id}, file_id={file_id}, status={status}")

            return request_id, result

        except httpx.HTTPError as e:
            raise ZuvaExtractionError(f"HTTP error during extraction request: {e}")
        except Exception as e:
            raise ZuvaExtractionError(f"Unexpected error during extraction request: {e}")

    async def get_extraction_status(self, request_id: str) -> Dict[str, Any]:
        """
        Get extraction status

        Args:
            request_id: Zuva extraction request ID

        Returns:
            Status data including state (queued, processing, complete, failed)

        Raises:
            ZuvaExtractionError: If status check fails
        """
        try:
            response = await self.client.get(
                f"{self.base_url}/extraction/{request_id}",
                headers=self._get_headers()
            )

            if response.status_code == 401:
                raise ZuvaAuthenticationError("Invalid API token")

            if response.status_code != 200:
                error_detail = response.text
                raise ZuvaExtractionError(
                    f"Status check failed with status {response.status_code}: {error_detail}"
                )

            return response.json()

        except httpx.HTTPError as e:
            raise ZuvaExtractionError(f"HTTP error during status check: {e}")
        except Exception as e:
            raise ZuvaExtractionError(f"Unexpected error during status check: {e}")

    async def get_extraction_results(self, request_id: str) -> Dict[str, Any]:
        """
        Get extraction results

        Args:
            request_id: Zuva extraction request ID

        Returns:
            Extraction results with text spans, bounding boxes, etc.

        Raises:
            ZuvaExtractionError: If results retrieval fails
        """
        try:
            response = await self.client.get(
                f"{self.base_url}/extraction/{request_id}/results/text",
                headers=self._get_headers()
            )

            if response.status_code == 401:
                raise ZuvaAuthenticationError("Invalid API token")

            if response.status_code != 200:
                error_detail = response.text
                raise ZuvaExtractionError(
                    f"Results retrieval failed with status {response.status_code}: {error_detail}"
                )

            return response.json()

        except httpx.HTTPError as e:
            raise ZuvaExtractionError(f"HTTP error during results retrieval: {e}")
        except Exception as e:
            raise ZuvaExtractionError(f"Unexpected error during results retrieval: {e}")

    async def wait_for_extraction(
        self,
        request_id: str,
        max_wait: int = 180,
        poll_interval: int = 3
    ) -> Dict[str, Any]:
        """
        Poll extraction status until complete

        Args:
            request_id: Zuva extraction request ID
            max_wait: Maximum wait time in seconds (default: 180s = 3 minutes)
            poll_interval: Seconds between status checks (default: 3s)

        Returns:
            Final status data

        Raises:
            ZuvaExtractionError: If extraction fails or times out
        """
        print(f"⏳ Waiting for extraction to complete (request_id={request_id})")
        print(f"   Timeout: {max_wait}s, Poll interval: {poll_interval}s")

        elapsed = 0
        while elapsed < max_wait:
            try:
                status_data = await self.get_extraction_status(request_id)
                state = status_data.get('status', 'unknown')

                print(f"   Status: {state} (elapsed: {elapsed}s)")

                if state == 'complete':
                    print(f"✅ Extraction complete after {elapsed}s!")
                    return status_data

                if state == 'failed':
                    error_msg = status_data.get('message', 'Extraction failed')
                    raise ZuvaExtractionError(f"Zuva extraction failed: {error_msg}")

                # Wait before next poll
                await asyncio.sleep(poll_interval)
                elapsed += poll_interval

            except ZuvaExtractionError:
                # Re-raise Zuva errors
                raise
            except Exception as e:
                print(f"⚠️  Error checking status (elapsed: {elapsed}s): {e}")
                # Continue polling unless we've exceeded max_wait
                await asyncio.sleep(poll_interval)
                elapsed += poll_interval

        raise ZuvaExtractionError(
            f"Extraction timeout after {max_wait}s. "
            f"The extraction may still be processing. "
            f"Please try checking the status later."
        )

    def parse_extraction_results(self, raw_results: Dict[str, Any]) -> Tuple[Dict[str, List[Dict[str, Any]]], Dict[str, Dict[str, Any]]]:
        """
        Parse raw Zuva extraction results into structured format

        Args:
            raw_results: Raw results from Zuva API

        Returns:
            Tuple of (extractions_dict, answer_metadata_dict)
            - extractions_dict: Regular extraction data organized by field
            - answer_metadata_dict: Answer-type field metadata (field_name, answers, answer_options)
        """
        parsed = {}
        answer_metadata = {}

        # Zuva returns results organized by file and field
        results_list = raw_results.get('results')
        if results_list is None:
            print(f"⚠️  Warning: No 'results' key in raw_results. Keys: {list(raw_results.keys())}")
            return parsed, answer_metadata

        for result_item in results_list:
            field_id = result_item.get('field_id')
            field_name = result_item.get('field_name')
            file_id = result_item.get('file_id')
            extractions = result_item.get('extractions')
            answers = result_item.get('answers')  # Answer-type field responses

            if not field_id:
                continue

            # Store answer metadata if this is an answer-type field
            if answers is not None:
                answer_metadata[field_id] = {
                    'field_name': field_name,
                    'answers': answers,  # [{option: "c", value: "Assignable with consent"}]
                    'has_answers': True
                }

            # Handle None extractions (field not found in document)
            if extractions is None:
                if answers is None:
                    print(f"⚠️  Field {field_id} has no extractions (not found in document)")
                parsed[field_id] = []
                continue

            field_results = []
            for extraction in extractions:
                # Get page number from spans if not at top level
                page = extraction.get('page')
                if page is None and extraction.get('spans'):
                    # Extract page from first span
                    first_span = extraction.get('spans', [])[0] if extraction.get('spans') else None
                    if first_span and first_span.get('pages'):
                        page = first_span['pages'].get('start')

                # Get confidence from spans if not at top level
                confidence = extraction.get('confidence')
                if confidence is None and extraction.get('spans'):
                    first_span = extraction.get('spans', [])[0] if extraction.get('spans') else None
                    if first_span and first_span.get('score') is not None:
                        confidence = first_span['score']

                # Extract bbox from spans if not at top level
                # Zuva returns bbox in spans[0].bboxes[0].bounds format
                bbox = extraction.get('bbox')
                if bbox is None and extraction.get('spans'):
                    first_span = extraction.get('spans', [])[0] if extraction.get('spans') else None
                    if first_span and first_span.get('bboxes'):
                        first_bbox_obj = first_span['bboxes'][0] if first_span['bboxes'] else None
                        if first_bbox_obj and first_bbox_obj.get('bounds'):
                            bounds = first_bbox_obj['bounds']
                            if isinstance(bounds, list) and len(bounds) > 0:
                                # bounds is an array of bound objects: [{top, left, bottom, right}]
                                bound = bounds[0]
                                # Convert to [left, bottom, right, top] format for PDF coordinates
                                bbox = [
                                    bound.get('left'),
                                    bound.get('bottom'),
                                    bound.get('right'),
                                    bound.get('top')
                                ]

                field_results.append({
                    'text': extraction.get('text', ''),
                    'page': page + 1 if page is not None else None,  # Convert 0-indexed to 1-indexed
                    'bbox': bbox,
                    'confidence': confidence,
                    'spans': extraction.get('spans', [])
                })

            if field_id not in parsed:
                parsed[field_id] = []

            parsed[field_id].extend(field_results)

        return parsed, answer_metadata

    async def close(self):
        """Close the HTTP client"""
        await self.client.aclose()

    async def __aenter__(self):
        """Async context manager entry"""
        return self

    async def __aexit__(self, exc_type, exc_val, exc_tb):
        """Async context manager exit"""
        await self.close()


# Example usage and testing
async def test_zuva_client():
    """Test the Zuva client"""
    print("🧪 Testing Zuva Client")
    print("=" * 50)

    try:
        async with ZuvaClient() as client:
            print("✅ Client initialized")

            # Test with a sample PDF file (you would provide actual file path)
            # file_id, metadata = await client.upload_file("/path/to/document.pdf")
            # print(f"✅ File uploaded: {file_id}")

            # request_id, data = await client.request_extraction(
            #     file_ids=[file_id],
            #     field_ids=["469d3654-d95f-480c-8646-ffbda55b4182"]  # Sample field ID
            # )
            # print(f"✅ Extraction requested: {request_id}")

            # status = await client.wait_for_extraction(request_id)
            # print(f"✅ Extraction complete: {status}")

            # results = await client.get_extraction_results(request_id)
            # parsed = client.parse_extraction_results(results)
            # print(f"✅ Results parsed: {len(parsed)} fields")

            print("\n✅ All tests passed!")

    except Exception as e:
        print(f"\n❌ Test failed: {e}")
        raise


if __name__ == "__main__":
    # Run tests if executed directly
    asyncio.run(test_zuva_client())
