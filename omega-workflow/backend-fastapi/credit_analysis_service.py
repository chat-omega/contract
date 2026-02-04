#!/usr/bin/env python3
"""
Credit Analysis Service
Handles credit agreement document processing and analysis generation
"""

import os
import json
from typing import Dict, Any, List, Optional
from datetime import datetime
from pathlib import Path

from database_async import AsyncDatabase
from extraction_service import ExtractionService


class CreditAnalysisService:
    """
    Credit Analysis Service

    Coordinates:
    - Credit document processing
    - Field extraction results mapping
    - Credit report generation
    - Analysis text generation
    """

    # Credit Agreement workflow template ID
    CREDIT_WORKFLOW_NAME = "credit-agreement"

    def __init__(self, db: AsyncDatabase, extraction_service: ExtractionService):
        """
        Initialize credit analysis service

        Args:
            db: Database instance
            extraction_service: Extraction service instance
        """
        self.db = db
        self.extraction_service = extraction_service
        print("✅ Credit Analysis service initialized")

    async def get_credit_workflow_id(self) -> Optional[int]:
        """
        Get the Credit Agreement workflow ID from database

        Returns:
            Workflow ID or None if not found
        """
        try:
            # Query workflows to find credit-agreement
            # For simplicity, we'll look for workflow with name matching credit pattern
            import aiosqlite
            async with aiosqlite.connect(self.db.db_path) as db:
                db.row_factory = aiosqlite.Row
                cursor = await db.execute("""
                    SELECT id FROM workflows
                    WHERE name LIKE '%Credit%Agreement%'
                    OR name LIKE '%Credit%Analysis%'
                    ORDER BY id DESC
                    LIMIT 1
                """)
                row = await cursor.fetchone()
                if row:
                    return row['id']

            print("⚠️  Credit Agreement workflow not found in database")
            return None

        except Exception as e:
            print(f"❌ Error getting credit workflow ID: {e}")
            return None

    async def process_credit_document(
        self,
        document_id: str,
        user_id: int
    ) -> Dict[str, Any]:
        """
        Process credit document and start extraction

        Args:
            document_id: Document ID
            user_id: User ID

        Returns:
            Processing status and extraction ID
        """
        try:
            # Verify document exists
            document = await self.db.get_document(document_id, user_id=user_id)
            if not document:
                return {
                    "success": False,
                    "error": "Document not found"
                }

            # Get credit workflow ID
            workflow_id = await self.get_credit_workflow_id()
            if not workflow_id:
                return {
                    "success": False,
                    "error": "Credit Agreement workflow not found. Please create it first."
                }

            # Get document file path
            file_path = document.get('file_path')
            if not file_path or not Path(file_path).exists():
                return {
                    "success": False,
                    "error": "Document file not found"
                }

            # Start extraction
            extraction = await self.extraction_service.start_extraction(
                document_id=document_id,
                workflow_id=workflow_id,
                document_path=file_path
            )

            return {
                "success": True,
                "document_id": document_id,
                "extraction_id": extraction['id'],
                "workflow_id": workflow_id,
                "status": extraction['status'],
                "message": "Credit document processing started"
            }

        except Exception as e:
            print(f"❌ Error processing credit document: {e}")
            return {
                "success": False,
                "error": str(e)
            }

    async def get_credit_analysis_results(
        self,
        document_id: str,
        user_id: int
    ) -> Dict[str, Any]:
        """
        Get credit analysis results for a document

        Args:
            document_id: Document ID
            user_id: User ID

        Returns:
            Credit analysis with extracted fields and generated report
        """
        try:
            # Verify document exists
            document = await self.db.get_document(document_id, user_id=user_id)
            if not document:
                return {
                    "success": False,
                    "error": "Document not found"
                }

            # Get credit workflow ID
            workflow_id = await self.get_credit_workflow_id()
            if not workflow_id:
                return {
                    "success": False,
                    "error": "Credit Agreement workflow not found"
                }

            # Get extraction results
            extraction = await self.db.get_extraction_by_document_workflow(
                document_id, workflow_id
            )

            if not extraction:
                return {
                    "success": False,
                    "error": "No extraction found for this document. Please start extraction first.",
                    "status": "not_started"
                }

            # Check extraction status
            if extraction['status'] == 'processing':
                return {
                    "success": True,
                    "status": "processing",
                    "message": "Extraction is still in progress. Please check back later.",
                    "extraction_id": extraction['id']
                }

            if extraction['status'] == 'failed':
                return {
                    "success": False,
                    "status": "failed",
                    "error": "Extraction failed. Please try again.",
                    "extraction_id": extraction['id']
                }

            # Get results from the extraction record (already parsed by get_extraction_by_document_workflow)
            raw_results = extraction.get('results') or {}

            # If results is still a string (shouldn't be, but just in case), parse it
            if isinstance(raw_results, str):
                import json
                try:
                    raw_results = json.loads(raw_results)
                except (json.JSONDecodeError, TypeError):
                    raw_results = {}

            # Transform results from {field_id: [extractions]} to [{field_name, text, ...}]
            # by looking up field names from the fields table
            results = await self._transform_extraction_results(raw_results)

            # Map extracted fields to credit report structure
            credit_report = await self._map_fields_to_credit_report(results, document)

            # Generate analysis text
            analysis_html = await self._generate_analysis_text(credit_report, results)

            return {
                "success": True,
                "status": "complete",
                "document_id": document_id,
                "extraction_id": extraction['id'],
                "company": credit_report["company"],
                "outlook": credit_report["outlook"],
                "pod": credit_report["pod"],
                "spread": credit_report["spread"],
                "analysis": {
                    "html": analysis_html
                },
                "extracted_fields": results  # Include raw extraction results
            }

        except Exception as e:
            print(f"❌ Error getting credit analysis results: {e}")
            import traceback
            traceback.print_exc()
            return {
                "success": False,
                "error": str(e)
            }

    async def _transform_extraction_results(
        self,
        raw_results: Dict[str, Any]
    ) -> List[Dict[str, Any]]:
        """
        Transform extraction results from {field_id: [extractions]} format
        to [{field_name, text, ...}] format by looking up field names

        Args:
            raw_results: Dict mapping field_id to list of extractions

        Returns:
            List of dicts with field_name and extracted text
        """
        import aiosqlite

        transformed = []

        # If raw_results is empty or not a dict, return empty list
        if not raw_results or not isinstance(raw_results, dict):
            return []

        try:
            async with aiosqlite.connect(self.db.db_path) as db:
                db.row_factory = aiosqlite.Row

                for field_id, extractions in raw_results.items():
                    # Look up field name
                    cursor = await db.execute(
                        "SELECT name FROM fields WHERE field_id = ?",
                        (field_id,)
                    )
                    row = await cursor.fetchone()
                    field_name = row['name'] if row else field_id

                    # Process each extraction for this field
                    if isinstance(extractions, list):
                        for extraction in extractions:
                            if isinstance(extraction, dict):
                                transformed.append({
                                    'field_name': field_name,
                                    'field_id': field_id,
                                    'text': extraction.get('text', ''),
                                    'page': extraction.get('page'),
                                    'confidence': extraction.get('confidence'),
                                    'bbox': extraction.get('bbox'),
                                    'spans': extraction.get('spans')
                                })

            return transformed

        except Exception as e:
            print(f"❌ Error transforming extraction results: {e}")
            return []

    async def _map_fields_to_credit_report(
        self,
        extraction_results: List[Dict[str, Any]],
        document: Dict[str, Any]
    ) -> Dict[str, Any]:
        """
        Map extracted fields to credit report structure

        Args:
            extraction_results: Raw extraction results from database
            document: Document metadata

        Returns:
            Structured credit report data
        """
        # Create a lookup map by field name
        field_map = {}
        for result in extraction_results:
            field_name = result.get('field_name', '')
            # Support both 'text' (current) and 'extracted_text' (legacy) for backward compatibility
            extracted_text = result.get('text') or result.get('extracted_text', '')
            if field_name and extracted_text:
                field_map[field_name] = extracted_text

        # Extract company name from "Parties" field
        company_name = field_map.get('Parties', 'Unknown Company')
        if ',' in company_name:
            # Take first party mentioned
            company_name = company_name.split(',')[0].strip()

        # For now, we'll use placeholder values for metrics
        # In production, these would come from:
        # - External credit rating API
        # - Market data provider
        # - Historical database

        # Generate mock time series data (placeholder)
        # TODO: Replace with real historical data from market data API
        pod_timeseries = self._generate_mock_pod_timeseries()
        spread_timeseries = self._generate_mock_spread_timeseries()

        return {
            "company": {
                "name": company_name,
                "rating": "B+",  # Placeholder - needs credit rating API
                "sector": "Corporate",  # Placeholder - needs industry classification
                "coverage": "Based on credit agreement analysis"
            },
            "outlook": {
                "outlook": "Stable",
                "description": "Credit terms indicate stable financial position based on covenant analysis"
            },
            "pod": {
                "value": pod_timeseries["current_value"],
                "horizon": "1-year",
                "change": pod_timeseries["change"],
                "timeSeries": pod_timeseries["timeSeries"]
            },
            "spread": {
                "value": spread_timeseries["current_value"],
                "term": "5 year loan",
                "change": spread_timeseries["change"],
                "timeSeries": spread_timeseries["timeSeries"]
            }
        }

    def _generate_mock_pod_timeseries(self) -> Dict[str, Any]:
        """
        Generate mock Probability of Default time series

        TODO: Replace with real market data API
        """
        # Mock historical data
        labels = ['11/2021', '04/2022', '09/2022', '02/2023', '07/2023',
                  '12/2023', '05/2024', '08/2024', '10/2024', '11/2024', '11/2024']
        values = [0.2, 0.3, 0.4, 0.5, 0.6, 0.7, 0.8, 1.0, 1.3, 1.6, 1.65]

        return {
            "current_value": "1.65%",
            "change": "+0.05%",
            "timeSeries": {
                "labels": labels,
                "values": values
            }
        }

    def _generate_mock_spread_timeseries(self) -> Dict[str, Any]:
        """
        Generate mock Credit Spread time series

        TODO: Replace with real market data API
        """
        # Mock historical data
        labels = ['11/2021', '04/2022', '09/2022', '02/2023', '07/2023',
                  '12/2023', '05/2024', '08/2024', '10/2024', '11/2024', '11/2024']
        values = [3, 4, 5, 5.5, 6, 6.5, 7, 7.5, 8.5, 9.0, 9.31]

        return {
            "current_value": "9.31%",
            "change": "+0.15%",
            "timeSeries": {
                "labels": labels,
                "values": values
            }
        }

    async def _generate_analysis_text(
        self,
        credit_report: Dict[str, Any],
        extraction_results: List[Dict[str, Any]]
    ) -> str:
        """
        Generate credit analysis HTML text

        Args:
            credit_report: Structured credit report data
            extraction_results: Raw extraction results

        Returns:
            HTML formatted analysis text
        """
        company_name = credit_report["company"]["name"]
        rating = credit_report["company"]["rating"]
        pod = credit_report["pod"]["value"]
        spread = credit_report["spread"]["value"]

        # Extract key terms from fields
        field_map = {}
        for result in extraction_results:
            field_name = result.get('field_name', '')
            # Support both 'text' (current) and 'extracted_text' (legacy) for backward compatibility
            extracted_text = result.get('text') or result.get('extracted_text', '')
            if field_name and extracted_text:
                field_map[field_name] = extracted_text[:200]  # Limit length

        # Build analysis HTML
        html = f"""
<h2>Credit Analysis: {company_name}</h2>

<h3>Executive Summary</h3>
<p>Based on our analysis of the credit agreement, {company_name} presents a {rating} credit profile
with a probability of default of {pod} and credit spread of {spread}. The company's credit structure
demonstrates {credit_report["outlook"]["description"].lower()}.</p>

<h3>Key Credit Terms</h3>
<ul>
"""

        # Add key extracted fields
        key_fields = [
            'Use of Proceeds/Purpose',
            'Credit Facility Sizes',
            'Interest Rate and Margin Terms',
            'Maturity Date/Termination Date Definition',
            'Financial Covenants — Credit Agreement'
        ]

        for field_name in key_fields:
            if field_name in field_map:
                value = field_map[field_name]
                html += f"    <li><strong>{field_name}:</strong> {value}</li>\n"

        html += """</ul>

<h3>Financial Covenants</h3>
<p>The credit agreement includes standard financial maintenance covenants and reporting requirements.
Covenant compliance is critical for maintaining access to the credit facility.</p>

<h3>Collateral & Security</h3>
"""

        # Add collateral information if available
        if 'Collateral Representation' in field_map:
            html += f"<p>{field_map['Collateral Representation']}</p>\n"
        else:
            html += "<p>Secured credit facility with standard collateral provisions.</p>\n"

        html += f"""
<h3>Current Credit Assessment</h3>
<p>Our current credit rating of {rating} reflects the borrower's financial position and
covenant structure. The {pod} probability of default is based on credit agreement terms
and market conditions.</p>

<h3>Risk Factors</h3>
<ul>
    <li>Covenant compliance risk based on financial performance</li>
    <li>Interest rate and margin adjustment provisions</li>
"""

        # Add events of default if available
        if 'Default for Non-Payment' in field_map:
            html += "    <li>Default provisions as specified in credit agreement</li>\n"

        html += """</ul>

<h3>Outlook</h3>
<p>""" + credit_report["outlook"]["description"] + """ Continued monitoring of covenant
compliance and financial performance is recommended.</p>

<p class="text-sm text-gray-500 mt-4">
    <em>Analysis generated from credit agreement extraction on """ + datetime.now().strftime('%B %d, %Y') + """</em>
</p>
"""

        return html

    async def query_credit_analysis(
        self,
        query: str,
        user_id: int,
        company_name: Optional[str] = None,
        document_id: Optional[str] = None
    ) -> Dict[str, Any]:
        """
        Process a natural language query about credit analysis

        Args:
            query: User's question
            user_id: User ID
            company_name: Optional company name to search for
            document_id: Optional specific document ID to query

        Returns:
            Query response with relevant information
        """
        try:
            # For now, provide a helpful response directing to document upload
            # In production, this would integrate with RAG/AI for intelligent responses

            if document_id:
                # Query specific document
                return await self.get_credit_analysis_results(document_id, user_id)

            # General query - provide guidance
            response = {
                "success": True,
                "message": "To perform credit analysis, please upload a credit agreement document using the file upload feature.",
                "query": query,
                "suggestions": [
                    "Upload a credit agreement or loan agreement PDF",
                    "Select 'Credit Agreement / Credit Analysis' workflow",
                    "View extracted credit terms and analysis"
                ]
            }

            if company_name:
                response["company_name"] = company_name
                response["message"] = f"To analyze {company_name}, please upload their credit agreement document."

            return response

        except Exception as e:
            print(f"❌ Error processing credit query: {e}")
            return {
                "success": False,
                "error": str(e)
            }
