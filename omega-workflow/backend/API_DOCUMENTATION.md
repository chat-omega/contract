# Omega Workflow API Documentation

## Overview

Comprehensive Express + TypeScript backend API for document processing and workflow management.

**Base URL:** `http://localhost:3000/api`

## Authentication

All authenticated endpoints require a JWT token in the Authorization header:

```
Authorization: Bearer <your_jwt_token>
```

### Default Test Users

- **Admin:** email: `admin@example.com`, password: `password123`
- **User:** email: `user@example.com`, password: `password123`
- **Viewer:** email: `viewer@example.com`, password: `password123`

## API Endpoints

### Authentication Routes (`/api/auth`)

#### POST /api/auth/login
User login - Returns user data and JWT tokens

**Request Body:**
```json
{
  "email": "admin@example.com",
  "password": "password123"
}
```

**Response:**
```json
{
  "success": true,
  "data": {
    "user": { "id": "user-1", "email": "admin@example.com", ... },
    "tokens": {
      "accessToken": "jwt_token",
      "refreshToken": "refresh_token"
    }
  },
  "message": "Login successful"
}
```

#### POST /api/auth/register
User registration

**Request Body:**
```json
{
  "email": "newuser@example.com",
  "password": "password123",
  "username": "newuser",
  "firstName": "John",
  "lastName": "Doe"
}
```

#### POST /api/auth/logout
User logout (requires authentication)

#### POST /api/auth/refresh
Refresh access token

**Request Body:**
```json
{
  "refreshToken": "your_refresh_token"
}
```

#### GET /api/auth/me
Get current user profile (requires authentication)

#### PUT /api/auth/profile
Update user profile (requires authentication)

#### POST /api/auth/change-password
Change user password (requires authentication)

#### GET /api/auth/users
Get all users (admin only)

#### PUT /api/auth/users/:userId/role
Update user role (admin only)

#### POST /api/auth/users/:userId/deactivate
Deactivate user account (admin only)

---

### Document Routes (`/api/documents`)

#### GET /api/documents
List all documents with filtering and pagination (requires authentication)

**Query Parameters:**
- `page` (optional): Page number (default: 1)
- `limit` (optional): Items per page (default: 10)
- `status` (optional): Filter by status (uploaded, processing, processed, failed, archived)
- `uploadedBy` (optional): Filter by uploader ID
- `workflowId` (optional): Filter by workflow ID
- `search` (optional): Search in name, filename, tags

**Response:**
```json
{
  "success": true,
  "data": [...],
  "pagination": {
    "page": 1,
    "limit": 10,
    "total": 2,
    "totalPages": 1
  }
}
```

#### GET /api/documents/stats
Get document statistics (requires authentication)

#### GET /api/documents/:id
Get single document by ID (requires authentication)

#### POST /api/documents
Upload new document (requires user or admin role)

**Request (multipart/form-data):**
- `file`: The document file
- `name`: Document name (required)
- `tags`: Array of tags (optional)
- `workflowId`: Workflow ID (optional)
- `metadata`: Additional metadata (optional)

#### PUT /api/documents/:id
Update document (requires user or admin role)

#### DELETE /api/documents/:id
Delete document (requires user or admin role)

#### POST /api/documents/:id/extract
Trigger document extraction (requires user or admin role)

---

### Workflow Routes (`/api/workflows`)

#### GET /api/workflows
List all workflows (requires authentication)

**Query Parameters:**
- `page`, `limit`: Pagination
- `status`: Filter by status (active, inactive, draft, archived)
- `createdBy`: Filter by creator ID

#### GET /api/workflows/stats
Get workflow statistics (requires authentication)

#### GET /api/workflows/:id
Get workflow by ID (requires authentication)

#### POST /api/workflows
Create new workflow (requires user or admin role)

**Request Body:**
```json
{
  "name": "Contract Processing Workflow",
  "description": "Process legal contracts",
  "steps": [
    {
      "name": "Extract Data",
      "type": "extraction",
      "order": 1,
      "config": { "fields": ["parties", "date"] }
    }
  ],
  "config": {
    "autoAssign": true
  }
}
```

#### PUT /api/workflows/:id
Update workflow (requires user or admin role)

#### DELETE /api/workflows/:id
Delete workflow (requires user or admin role)

#### POST /api/workflows/:id/assign
Assign workflow to documents (requires user or admin role)

**Request Body:**
```json
{
  "documentIds": ["doc-1", "doc-2"]
}
```

#### POST /api/workflows/:id/unassign
Unassign workflow from documents (requires user or admin role)

---

### Scoring Routes (`/api/scoring`)

#### GET /api/scoring/profiles
List all scoring profiles (requires authentication)

#### GET /api/scoring/profiles/:id
Get scoring profile by ID (requires authentication)

#### POST /api/scoring/profiles
Create new scoring profile (requires user or admin role)

**Request Body:**
```json
{
  "name": "Contract Quality Assessment",
  "description": "Evaluates contract completeness",
  "criteria": [
    {
      "name": "Has All Parties",
      "field": "extractedData.parties",
      "weight": 20,
      "operator": "contains",
      "scoreIfMatch": 20,
      "scoreIfNoMatch": 0
    }
  ],
  "weightingMethod": "weighted",
  "thresholds": [
    {
      "level": "Excellent",
      "minScore": 90,
      "maxScore": 100
    }
  ]
}
```

#### PUT /api/scoring/profiles/:id
Update scoring profile (requires user or admin role)

#### DELETE /api/scoring/profiles/:id
Delete scoring profile (requires user or admin role)

#### GET /api/scoring/results/:documentId
Get scoring results for a document (requires authentication)

#### POST /api/scoring/score
Score a document with a profile (requires user or admin role)

**Request Body:**
```json
{
  "documentId": "doc-1",
  "profileId": "profile-1"
}
```

---

### Field Routes (`/api/fields`)

#### GET /api/fields
Search fields with filters (requires authentication)

**Query Parameters:**
- `page`, `limit`: Pagination
- `type`: Filter by field type (text, number, date, boolean, email, url, phone, currency, percentage, array, object)
- `category`: Filter by category
- `isRequired`: Filter by required status (true/false)
- `search`: Search in name, displayName, description

#### GET /api/fields/stats
Get field statistics (requires authentication)

#### GET /api/fields/categories
Get all field categories (requires authentication)

#### GET /api/fields/types
Get field types with counts (requires authentication)

#### GET /api/fields/most-used
Get most used fields (requires authentication)

**Query Parameters:**
- `limit`: Number of fields to return (default: 10)

#### GET /api/fields/recently-used
Get recently used fields (requires authentication)

#### GET /api/fields/by-name/:name
Get field by name (requires authentication)

#### GET /api/fields/:id
Get field by ID (requires authentication)

#### POST /api/fields
Create new field (admin only)

**Request Body:**
```json
{
  "name": "contractAmount",
  "displayName": "Contract Amount",
  "type": "currency",
  "description": "Total monetary value",
  "category": "Financial",
  "isRequired": true,
  "validationRules": [
    {
      "type": "min",
      "value": 0,
      "message": "Amount must be positive"
    }
  ]
}
```

#### PUT /api/fields/:id
Update field (admin only)

#### DELETE /api/fields/:id
Delete field (admin only)

---

## Common Response Formats

### Success Response
```json
{
  "success": true,
  "data": { ... },
  "message": "Operation successful"
}
```

### Error Response
```json
{
  "status": "fail",
  "message": "Error description",
  "stack": "..." (development only)
}
```

### Paginated Response
```json
{
  "success": true,
  "data": [...],
  "pagination": {
    "page": 1,
    "limit": 10,
    "total": 50,
    "totalPages": 5
  }
}
```

## Status Codes

- **200** OK - Success
- **201** Created - Resource created successfully
- **400** Bad Request - Invalid input
- **401** Unauthorized - Authentication required or failed
- **403** Forbidden - Insufficient permissions
- **404** Not Found - Resource not found
- **409** Conflict - Resource conflict (duplicate, etc.)
- **422** Unprocessable Entity - Validation failed
- **500** Internal Server Error - Server error

## Rate Limiting

Currently not implemented. Can be added with express-rate-limit.

## CORS

Configurable via `CORS_ORIGIN` environment variable.

## Development

Start development server:
```bash
npm run dev
```

Build for production:
```bash
npm run build
```

Start production server:
```bash
npm start
```

## Environment Variables

See `.env.example` for all available configuration options.

Required:
- `JWT_SECRET`: Secret key for JWT tokens
- `PORT`: Server port (default: 3000)

## Testing

The API includes comprehensive mock data for all endpoints. All endpoints are functional and return realistic test data.

## Security Notes

1. Change `JWT_SECRET` in production
2. Use strong passwords
3. Enable HTTPS in production
4. Implement rate limiting for production
5. Add input sanitization for production use
6. Implement proper password hashing (bcrypt) in production

## Support

For issues or questions, refer to the README.md file.
