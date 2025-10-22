# Extraction Results API Endpoint Documentation

## Endpoint

```
GET /api/documents/{document_id}/extraction/results
```

## Description

Retrieves extraction results for a document with optional workflow filtering. Returns field-level extraction data enriched with metadata including field names, descriptions, types, and tags.

## Authentication

**Required**: Yes

**Type**: Bearer Token

**Header**: `Authorization: Bearer {token}`

## Path Parameters

| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| `document_id` | string | Yes | The unique identifier of the document |

## Query Parameters

| Parameter | Type | Required | Default | Description |
|-----------|------|----------|---------|-------------|
| `workflow_id` | string | No | null | The workflow ID to filter results. If omitted, returns results for all workflows associated with the document. |

## Response Codes

| Code | Description |
|------|-------------|
| 200 | Success - Returns extraction results |
| 401 | Unauthorized - Invalid or missing authentication token |
| 404 | Not Found - Document not found or user doesn't have access |
| 500 | Internal Server Error - Server-side error occurred |

## Response Formats

### Success Response (Single Workflow - Status: Complete)

```json
{
  "status": "complete",
  "documentId": "e37f9df8",
  "workflowId": "4",
  "workflowName": "Contract Review Workflow",
  "extractedAt": "2025-01-17T10:30:00.000Z",
  "startedAt": "2025-01-17T10:28:00.000Z",
  "createdAt": "2025-01-17T10:27:00.000Z",
  "fieldCount": 5,
  "fields": {
    "25d677a1-70d0-43c2-9b36-d079733dd020": {
      "metadata": {
        "field_id": "25d677a1-70d0-43c2-9b36-d079733dd020",
        "name": "Document Name",
        "description": "The title or name of the document",
        "type": "text",
        "region": "US",
        "tags": ["basic", "identification"]
      },
      "extractions": [
        {
          "text": "Master Service Agreement",
          "page": 1,
          "bbox": [100, 200, 300, 250],
          "confidence": 0.95
        }
      ]
    },
    "98086156-f230-423c-b214-27f542e72708": {
      "metadata": {
        "field_id": "98086156-f230-423c-b214-27f542e72708",
        "name": "Parties",
        "description": "The parties involved in the agreement",
        "type": "list",
        "region": "US",
        "tags": ["parties", "contract"]
      },
      "extractions": [
        {
          "text": "Acme Corporation",
          "page": 1,
          "bbox": [100, 300, 400, 330],
          "confidence": 0.92
        },
        {
          "text": "BuzzFeed Inc.",
          "page": 1,
          "bbox": [100, 340, 400, 370],
          "confidence": 0.94
        }
      ]
    }
  }
}
```

### Success Response (Multiple Workflows)

```json
{
  "status": "success",
  "documentId": "e37f9df8",
  "workflowCount": 2,
  "workflows": [
    {
      "status": "complete",
      "documentId": "e37f9df8",
      "workflowId": "4",
      "workflowName": "Contract Review Workflow",
      "extractedAt": "2025-01-17T10:30:00.000Z",
      "startedAt": "2025-01-17T10:28:00.000Z",
      "createdAt": "2025-01-17T10:27:00.000Z",
      "fieldCount": 5,
      "fields": { /* field data */ }
    },
    {
      "status": "processing",
      "message": "Extraction is processing",
      "documentId": "e37f9df8",
      "workflowId": "5",
      "startedAt": "2025-01-17T10:32:00.000Z",
      "createdAt": "2025-01-17T10:31:00.000Z"
    }
  ]
}
```

### Not Found Response

```json
{
  "status": "not_found",
  "message": "No extractions found for this document and workflow"
}
```

### Processing Response

```json
{
  "status": "processing",
  "message": "Extraction is processing",
  "documentId": "e37f9df8",
  "workflowId": "4",
  "extractedAt": null,
  "startedAt": "2025-01-17T10:28:00.000Z",
  "createdAt": "2025-01-17T10:27:00.000Z",
  "errorMessage": null
}
```

### Failed Response

```json
{
  "status": "failed",
  "message": "Extraction is failed",
  "documentId": "e37f9df8",
  "workflowId": "4",
  "extractedAt": null,
  "startedAt": "2025-01-17T10:28:00.000Z",
  "createdAt": "2025-01-17T10:27:00.000Z",
  "errorMessage": "Zuva API timeout error"
}
```

### Error Response (401 Unauthorized)

```json
{
  "detail": "Invalid authentication credentials"
}
```

### Error Response (404 Not Found)

```json
{
  "detail": "Document not found"
}
```

## Field Schema

### Field Metadata Object

| Property | Type | Description |
|----------|------|-------------|
| `field_id` | string | Unique identifier for the field (UUID) |
| `name` | string | Human-readable name of the field |
| `description` | string | Detailed description of what the field represents |
| `type` | string | Data type of the field (text, date, number, list, etc.) |
| `region` | string | Geographic region the field applies to |
| `tags` | array[string] | Categorization tags for the field |

### Extraction Object

| Property | Type | Description |
|----------|------|-------------|
| `text` | string | The extracted text value |
| `page` | integer | Page number where the text was found (1-indexed) |
| `bbox` | array[number] | Bounding box coordinates [x1, y1, x2, y2] |
| `confidence` | number | Confidence score (0.0 to 1.0) |

## Usage Examples

### cURL

#### Get All Workflow Results
```bash
curl -X GET "http://localhost:5001/api/documents/e37f9df8/extraction/results" \
  -H "Authorization: Bearer YOUR_TOKEN_HERE"
```

#### Get Specific Workflow Results
```bash
curl -X GET "http://localhost:5001/api/documents/e37f9df8/extraction/results?workflow_id=4" \
  -H "Authorization: Bearer YOUR_TOKEN_HERE"
```

### Python (requests)

```python
import requests

BASE_URL = "http://localhost:5001"
token = "YOUR_TOKEN_HERE"
doc_id = "e37f9df8"
workflow_id = "4"

headers = {
    "Authorization": f"Bearer {token}"
}

# Get all workflow results
response = requests.get(
    f"{BASE_URL}/api/documents/{doc_id}/extraction/results",
    headers=headers
)
results = response.json()
print(f"Found {results.get('workflowCount', 0)} workflows")

# Get specific workflow results
response = requests.get(
    f"{BASE_URL}/api/documents/{doc_id}/extraction/results",
    params={"workflow_id": workflow_id},
    headers=headers
)
results = response.json()
print(f"Status: {results['status']}")
print(f"Fields extracted: {results.get('fieldCount', 0)}")
```

### JavaScript (Fetch API)

```javascript
const BASE_URL = 'http://localhost:5001';
const token = 'YOUR_TOKEN_HERE';
const docId = 'e37f9df8';
const workflowId = '4';

const headers = {
  'Authorization': `Bearer ${token}`
};

// Get all workflow results
fetch(`${BASE_URL}/api/documents/${docId}/extraction/results`, { headers })
  .then(response => response.json())
  .then(data => {
    console.log(`Found ${data.workflowCount || 0} workflows`);
    console.log(data);
  });

// Get specific workflow results
fetch(`${BASE_URL}/api/documents/${docId}/extraction/results?workflow_id=${workflowId}`, { headers })
  .then(response => response.json())
  .then(data => {
    console.log(`Status: ${data.status}`);
    console.log(`Fields extracted: ${data.fieldCount || 0}`);
    console.log(data);
  });
```

### React Example

```jsx
import React, { useState, useEffect } from 'react';

function ExtractionResults({ documentId, workflowId, token }) {
  const [results, setResults] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchResults = async () => {
      try {
        const url = workflowId
          ? `/api/documents/${documentId}/extraction/results?workflow_id=${workflowId}`
          : `/api/documents/${documentId}/extraction/results`;

        const response = await fetch(url, {
          headers: {
            'Authorization': `Bearer ${token}`
          }
        });

        if (!response.ok) {
          throw new Error(`HTTP error! status: ${response.status}`);
        }

        const data = await response.json();
        setResults(data);
      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    fetchResults();
  }, [documentId, workflowId, token]);

  if (loading) return <div>Loading extraction results...</div>;
  if (error) return <div>Error: {error}</div>;
  if (!results) return <div>No results found</div>;

  return (
    <div className="extraction-results">
      <h2>Extraction Results</h2>
      <p>Status: {results.status}</p>
      {results.workflowName && <p>Workflow: {results.workflowName}</p>}
      {results.fieldCount && <p>Fields: {results.fieldCount}</p>}

      {results.fields && (
        <div className="fields">
          {Object.entries(results.fields).map(([fieldId, field]) => (
            <div key={fieldId} className="field">
              <h3>{field.metadata.name}</h3>
              <p>{field.metadata.description}</p>
              {field.extractions.map((extraction, index) => (
                <div key={index} className="extraction">
                  <p>{extraction.text}</p>
                  <small>Page {extraction.page} | Confidence: {(extraction.confidence * 100).toFixed(1)}%</small>
                </div>
              ))}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

export default ExtractionResults;
```

## Status Values

| Status | Description |
|--------|-------------|
| `complete` | Extraction completed successfully |
| `processing` | Extraction is currently in progress |
| `pending` | Extraction has been queued but not started |
| `failed` | Extraction encountered an error |
| `not_found` | No extraction record exists |
| `not_available` | Results are not yet available |
| `success` | (Multiple workflows only) All workflows retrieved |

## Common Use Cases

### 1. Display Extraction Results in UI

```javascript
// Fetch and display extraction results for a document
const displayResults = async (documentId, token) => {
  const response = await fetch(
    `/api/documents/${documentId}/extraction/results`,
    { headers: { 'Authorization': `Bearer ${token}` }}
  );
  const data = await response.json();

  if (data.status === 'success' || data.status === 'complete') {
    // Display results to user
    renderResults(data);
  } else if (data.status === 'processing') {
    // Show loading indicator
    showLoadingState();
    // Poll for updates
    setTimeout(() => displayResults(documentId, token), 5000);
  } else if (data.status === 'failed') {
    // Show error message
    showError(data.errorMessage);
  }
};
```

### 2. Export Extraction Results

```python
def export_extraction_results(document_id, workflow_id, token, output_file):
    """Export extraction results to JSON file"""
    response = requests.get(
        f"http://localhost:5001/api/documents/{document_id}/extraction/results",
        params={"workflow_id": workflow_id},
        headers={"Authorization": f"Bearer {token}"}
    )

    if response.status_code == 200:
        data = response.json()
        with open(output_file, 'w') as f:
            json.dump(data, f, indent=2)
        print(f"Results exported to {output_file}")
    else:
        print(f"Error: {response.status_code}")
```

### 3. Compare Multiple Workflow Results

```python
def compare_workflow_results(document_id, token):
    """Compare extraction results across multiple workflows"""
    response = requests.get(
        f"http://localhost:5001/api/documents/{document_id}/extraction/results",
        headers={"Authorization": f"Bearer {token}"}
    )

    data = response.json()

    if data['status'] == 'success':
        for workflow in data['workflows']:
            print(f"Workflow: {workflow['workflowName']}")
            print(f"  Status: {workflow['status']}")
            print(f"  Fields: {workflow.get('fieldCount', 0)}")
            print()
```

## Notes

1. **Field Metadata**: All fields are enriched with metadata from the fields table. If a field is not found in the database, minimal metadata is returned with the field_id as the name.

2. **Workflow Names**: Workflow names are fetched from the workflows table. If a workflow is not found, the workflow_id is used as a fallback.

3. **Multiple Extractions**: A single field can have multiple extractions (e.g., multiple parties in a contract). Each extraction includes its own page number, bounding box, and confidence score.

4. **Error Handling**: The endpoint gracefully handles missing documents, incomplete extractions, and database errors. Always check the `status` field in the response.

5. **Authentication**: All requests must include a valid Bearer token. Tokens can be obtained from the `/api/auth/login` endpoint.

6. **Performance**: For documents with many workflows, consider using the `workflow_id` parameter to fetch results for specific workflows rather than all at once.

## Related Endpoints

- `POST /api/documents/{document_id}/extract` - Start extraction for a document
- `GET /api/documents/{document_id}/extraction/status` - Check extraction status
- `GET /api/documents/{document_id}/workflows` - Get workflows assigned to a document
- `GET /api/workflows/saved` - List all saved workflows

## Changelog

### Version 2.0.0 (2025-01-17)
- Initial implementation
- Support for single and multiple workflow queries
- Field metadata enrichment
- Comprehensive error handling
- Optional workflow_id parameter

---

**API Version**: 2.0.0
**Last Updated**: 2025-01-17
**Maintained By**: Omega Workflow Backend Team
