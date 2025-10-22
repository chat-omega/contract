#!/usr/bin/env python3
"""
FastAPI Backend for Omega Workflow Application
Modern async backend replacing Flask implementation
"""

import os
import json
import uuid
import tempfile
from datetime import datetime, timedelta
from typing import Optional, List, Dict, Any, Union
from pathlib import Path

from fastapi import FastAPI, HTTPException, Depends, UploadFile, File, Form, Query, status
from fastapi.security import HTTPBearer, HTTPAuthorizationCredentials
from fastapi.responses import FileResponse
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import JSONResponse
from pydantic import BaseModel, EmailStr, validator
import asyncio
import aiofiles
import aiosqlite
from jose import jwt

# Import async database layer
from database_async import AsyncDatabase
from extraction_service import ExtractionService

# Initialize FastAPI app
app = FastAPI(
    title="Omega Workflow API",
    description="Modern async API for document workflow management",
    version="2.0.0",
    docs_url="/api/docs",
    redoc_url="/api/redoc"
)

# Configure CORS
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # Configure appropriately for production
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Configuration
JWT_SECRET = os.getenv("JWT_SECRET", "omega-workflow-secret-key-change-in-production")
JWT_ALGORITHM = "HS256"
JWT_EXPIRATION_HOURS = 24
UPLOAD_DIR = Path("/app/uploads")
MAX_UPLOAD_SIZE = 50 * 1024 * 1024  # 50MB

# Initialize components
security = HTTPBearer()  # For required auth
security_optional = HTTPBearer(auto_error=False)  # For optional auth
db = AsyncDatabase()
extraction_service = None

# Ensure upload directory exists
UPLOAD_DIR.mkdir(parents=True, exist_ok=True)

# Startup event handler
@app.on_event("startup")
async def startup_event():
    """Load workflows from database and initialize services on startup"""
    global extraction_service

    # Clean up orphaned workflow assignments
    await db.cleanup_orphaned_assignments()

    # Load workflows
    await load_workflows_from_database()

    # Initialize extraction service
    extraction_service = ExtractionService(db)
    print("✅ Extraction service initialized")

# Pydantic models
class UserCreate(BaseModel):
    username: str
    email: EmailStr
    password: str
    
    @validator('username')
    def username_length(cls, v):
        if len(v) < 3:
            raise ValueError('Username must be at least 3 characters')
        return v
    
    @validator('password')
    def password_length(cls, v):
        if len(v) < 6:
            raise ValueError('Password must be at least 6 characters')
        return v

class UserLogin(BaseModel):
    username: str
    password: str

class UserResponse(BaseModel):
    id: int
    username: str
    email: str
    created_at: str

class TokenResponse(BaseModel):
    access_token: str
    token_type: str
    user: UserResponse

class DocumentResponse(BaseModel):
    id: str
    name: str
    filename: str
    size: int
    doc_type: str
    upload_date: str
    user_id: int

class UploadResponse(BaseModel):
    success: bool
    files: List[Dict[str, Any]]
    message: str
    failed_files: Optional[List[Dict[str, str]]] = None

class DocumentUpdate(BaseModel):
    name: str

    @validator('name')
    def name_not_empty(cls, v):
        if not v or not v.strip():
            raise ValueError('Document name cannot be empty')
        return v.strip()

# Authentication utilities
def create_access_token(data: dict) -> str:
    """Create JWT access token"""
    to_encode = data.copy()
    # Ensure subject is a string as required by JWT standard
    if "sub" in to_encode:
        to_encode["sub"] = str(to_encode["sub"])
    expire = datetime.utcnow() + timedelta(hours=JWT_EXPIRATION_HOURS)
    to_encode.update({"exp": expire})
    encoded_jwt = jwt.encode(to_encode, JWT_SECRET, algorithm=JWT_ALGORITHM)
    return encoded_jwt

def verify_password(plain_password: str, hashed_password: str) -> bool:
    """Verify password against PBKDF2 hash"""
    try:
        # Check if it's a pbkdf2 hash
        if hashed_password.startswith('pbkdf2:'):
            import hashlib
            parts = hashed_password.split(':')
            if len(parts) == 3:
                salt = parts[1]
                stored_hash = parts[2]
                salted_password = f"{salt}:{plain_password}"
                computed_hash = hashlib.pbkdf2_hmac('sha256', salted_password.encode(), salt.encode(), 100000)
                result = computed_hash.hex() == stored_hash
                print(f"🔐 PBKDF2 verification result: {result}")
                return result
        
        print(f"⚠️ Unknown hash format: {hashed_password[:20]}...")
        return False
        
    except Exception as e:
        print(f"Password verification error: {e}")
        return False

def get_password_hash(password: str) -> str:
    """Hash password using PBKDF2 (reliable fallback)"""
    # Use PBKDF2 directly for reliable password hashing
    import hashlib
    import secrets
    salt = secrets.token_hex(16)
    salted_password = f"{salt}:{password}"
    hashed = hashlib.pbkdf2_hmac('sha256', salted_password.encode(), salt.encode(), 100000)
    result = f"pbkdf2:{salt}:{hashed.hex()}"
    print(f"✅ Generated PBKDF2 hash: {result[:30]}...")
    return result

async def get_current_user(credentials: HTTPAuthorizationCredentials = Depends(security)) -> Dict[str, Any]:
    """Get current authenticated user from JWT token"""
    try:
        token = credentials.credentials
        print(f"🔐 Validating token (first 20 chars): {token[:20]}...")

        payload = jwt.decode(token, JWT_SECRET, algorithms=[JWT_ALGORITHM])
        print(f"✅ Token decoded successfully. Payload: {payload}")

        user_id_str = payload.get("sub")
        if user_id_str is None:
            print(f"❌ Token missing 'sub' claim")
            raise HTTPException(
                status_code=status.HTTP_401_UNAUTHORIZED,
                detail="Invalid authentication credentials",
                headers={"WWW-Authenticate": "Bearer"},
            )
        user_id = int(user_id_str)
        print(f"👤 User ID from token: {user_id}")

    except jwt.ExpiredSignatureError:
        print(f"❌ Token has expired")
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Token has expired",
            headers={"WWW-Authenticate": "Bearer"},
        )
    except jwt.JWTError as e:
        print(f"❌ JWT validation error: {e}")
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Invalid authentication credentials",
            headers={"WWW-Authenticate": "Bearer"},
        )

    user = await db.get_user_by_id(user_id)
    if user is None:
        print(f"❌ User {user_id} not found in database")
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="User not found",
            headers={"WWW-Authenticate": "Bearer"},
        )

    print(f"✅ User authenticated successfully: {user['username']} (ID: {user['id']})")
    return user

# Optional authentication for some endpoints
async def get_current_user_optional(credentials: Optional[HTTPAuthorizationCredentials] = Depends(security_optional)) -> Optional[Dict[str, Any]]:
    """Get current user if authenticated, None if not"""
    print(f"🔓 Optional auth check - credentials present: {credentials is not None}")
    if credentials is None:
        print(f"   No credentials provided")
        return None
    try:
        user = await get_current_user(credentials)
        print(f"   Optional auth successful")
        return user
    except HTTPException as e:
        print(f"   Optional auth failed: {e.detail}")
        return None

# Health check
@app.get("/api/health")
async def health_check():
    """Health check endpoint"""
    return {"status": "healthy", "service": "workflow-api-fastapi", "version": "2.0.0"}

# Authentication endpoints
@app.post("/api/auth/register")
async def register(user_data: UserCreate):
    """Register a new user"""
    try:
        # Check if user already exists
        existing_user = await db.get_user_by_username(user_data.username)
        if existing_user:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="Username already registered"
            )
        
        existing_email = await db.get_user_by_email(user_data.email)
        if existing_email:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="Email already registered"
            )
        
        # Hash password and create user
        hashed_password = get_password_hash(user_data.password)
        user = await db.create_user(user_data.username, user_data.email, hashed_password)
        
        if not user:
            raise HTTPException(
                status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
                detail="Failed to create user"
            )
        
        # Create access token
        access_token = create_access_token(data={"sub": user["id"]})

        # Calculate expiration timestamp
        expiration_time = datetime.utcnow() + timedelta(hours=JWT_EXPIRATION_HOURS)
        expires_in = int(expiration_time.timestamp())

        return {
            "success": True,
            "tokens": {
                "accessToken": access_token,
                "refreshToken": access_token,  # Using same token for now
                "expiresIn": expires_in
            },
            "user": dict(UserResponse(**user)),
            "message": "Registration successful"
        }
        
    except HTTPException:
        raise
    except Exception as e:
        print(f"Registration error: {e}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Registration failed"
        )

@app.post("/api/auth/login")
async def login(user_data: UserLogin):
    """Authenticate user and return token (accepts username OR email)"""
    try:
        print(f"🔐 Login attempt - username/email: {user_data.username}")

        # Try to get user by username first
        user = await db.get_user_by_username(user_data.username)
        print(f"   User found by username: {user is not None}")

        # If not found by username, try by email
        if not user:
            user = await db.get_user_by_email(user_data.username)
            print(f"   User found by email: {user is not None}")

        if not user:
            print(f"❌ User not found for: {user_data.username}")
            raise HTTPException(
                status_code=status.HTTP_401_UNAUTHORIZED,
                detail="Invalid username or password",
                headers={"WWW-Authenticate": "Bearer"},
            )

        print(f"   User object: username={user['username']}, email={user['email']}")
        print(f"   Password hash: {user['password_hash'][:30]}...")

        # Verify password
        password_valid = verify_password(user_data.password, user["password_hash"])
        print(f"   Password valid: {password_valid}")

        if not password_valid:
            print(f"❌ Invalid password for user: {user['username']}")
            raise HTTPException(
                status_code=status.HTTP_401_UNAUTHORIZED,
                detail="Invalid username or password",
                headers={"WWW-Authenticate": "Bearer"},
            )
        
        # Create access token
        access_token = create_access_token(data={"sub": user["id"]})

        # Calculate expiration timestamp
        expiration_time = datetime.utcnow() + timedelta(hours=JWT_EXPIRATION_HOURS)
        expires_in = int(expiration_time.timestamp())

        # Remove password hash from response
        user_response = {k: v for k, v in user.items() if k != "password_hash"}

        return {
            "success": True,
            "tokens": {
                "accessToken": access_token,
                "refreshToken": access_token,  # Using same token for now
                "expiresIn": expires_in
            },
            "user": dict(UserResponse(**user_response)),
            "message": "Login successful"
        }
        
    except HTTPException:
        raise
    except Exception as e:
        print(f"Login error: {e}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Login failed"
        )

@app.get("/api/auth/me")
async def get_me(current_user: Dict[str, Any] = Depends(get_current_user)):
    """Get current user information"""
    user_response = {k: v for k, v in current_user.items() if k != "password_hash"}
    return {"user": dict(UserResponse(**user_response))}

# Fields endpoints
@app.get("/api/fields")
async def get_fields(
    search: Optional[str] = None,
    tags: Optional[str] = None,
    region: Optional[str] = None,
    limit: Optional[int] = None,
    offset: Optional[int] = None
):
    """Get available fields for workflow creation"""
    try:
        # Get fields from database
        fields = await db.get_fields(
            search=search,
            tags=tags,
            region=region,
            limit=limit,
            offset=offset
        )

        # Get total count (with same filters)
        total_count = await db.get_field_count(
            search=search,
            tags=tags,
            region=region
        )

        return {
            "fields": fields,
            "total": total_count,
            "count": len(fields)
        }
    except Exception as e:
        print(f"Error fetching fields: {e}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Failed to fetch fields"
        )

# Document types endpoints
@app.get("/api/document-types")
async def get_document_types():
    """Get all document types organized by category (hierarchical structure)"""
    try:
        document_types = await db.get_document_types_hierarchical()

        return {
            "success": True,
            "categories": document_types,
            "total_categories": len(document_types),
            "total_types": sum(len(cat['types']) for cat in document_types)
        }
    except Exception as e:
        print(f"Error fetching document types: {e}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Failed to fetch document types"
        )

# Document endpoints
@app.get("/api/documents")
async def get_documents(current_user: Optional[Dict[str, Any]] = Depends(get_current_user_optional)):
    """Get user's documents with workflow information (requires authentication)"""
    print(f"📄 GET /api/documents - current_user: {current_user['username'] if current_user else 'None'}")

    if not current_user:
        print(f"❌ No current_user - returning 401")
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Authentication required"
        )

    print(f"✅ Fetching documents for user {current_user['id']}")
    documents = await db.get_documents(current_user["id"])

    # Add workflow information and map field names for frontend compatibility
    for doc in documents:
        # Get workflows
        workflow_ids = await db.get_document_workflows(doc["id"])
        workflow_names = []

        for wf_id in workflow_ids:
            workflow = next((wf for wf in saved_workflows if wf['id'] == wf_id), None)
            if workflow:
                workflow_names.append(workflow['name'])

        doc["workflows"] = workflow_ids
        doc["workflowNames"] = workflow_names

        # Map database field names to frontend-expected field names
        doc["type"] = doc.get("doc_type", "Unknown")  # Map doc_type -> type
        doc["uploadedAt"] = doc.get("upload_date")  # Map upload_date -> uploadedAt
        doc["uploadedBy"] = "You"  # Could be enhanced to show actual username

    print(f"   Returning {len(documents)} documents with mapped fields")
    return documents

@app.post("/api/documents/upload", response_model=UploadResponse)
async def upload_documents(
    files: List[UploadFile] = File(...),
    current_user: Dict[str, Any] = Depends(get_current_user)
):
    """Upload multiple documents"""
    if not files:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="No files provided"
        )
    
    uploaded_files = []
    failed_files = []
    
    for file in files:
        if not file.filename:
            failed_files.append({"name": "unnamed", "error": "No filename provided"})
            continue
        
        try:
            # Validate file size
            content = await file.read()
            if len(content) == 0:
                failed_files.append({"name": file.filename, "error": "File is empty"})
                continue
            
            if len(content) > MAX_UPLOAD_SIZE:
                failed_files.append({
                    "name": file.filename, 
                    "error": f"File size exceeds {MAX_UPLOAD_SIZE // (1024*1024)}MB limit"
                })
                continue
            
            # Generate unique document ID and save file
            doc_id = str(uuid.uuid4())[:8]
            file_extension = Path(file.filename).suffix
            safe_filename = f"{doc_id}_{file.filename}"
            file_path = UPLOAD_DIR / safe_filename
            
            # Save file asynchronously
            async with aiofiles.open(file_path, 'wb') as f:
                await f.write(content)
            
            # Save to database
            doc_info = await db.create_document(
                user_id=current_user["id"],
                doc_id=doc_id,
                name=file.filename,
                filename=file.filename,
                size=len(content),
                doc_type=file_extension.upper().lstrip('.') or 'Unknown',
                file_path=str(file_path)
            )
            
            if doc_info:
                uploaded_files.append({
                    "id": doc_id,
                    "name": file.filename,
                    "size": len(content),
                    "type": file_extension.upper().lstrip('.') or 'Unknown',
                    "success": True
                })
            else:
                # Clean up file if database save failed
                try:
                    file_path.unlink()
                except:
                    pass
                failed_files.append({"name": file.filename, "error": "Database save failed"})
                
        except Exception as e:
            failed_files.append({"name": file.filename, "error": str(e)})
            continue
    
    success_count = len(uploaded_files)
    total_files = success_count + len(failed_files)
    
    if success_count == 0:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="All files failed to upload",
            headers={"X-Failed-Files": json.dumps(failed_files)}
        )
    
    message = f"{success_count} file(s) uploaded successfully"
    if failed_files:
        message += f", {len(failed_files)} failed"
    
    return UploadResponse(
        success=True,
        files=uploaded_files,
        message=message,
        failed_files=failed_files if failed_files else None
    )

@app.get("/api/documents/{document_id}")
async def get_document_by_id(
    document_id: str,
    current_user: Dict[str, Any] = Depends(get_current_user)
):
    """Get document metadata by ID"""
    document = await db.get_document(document_id, user_id=current_user["id"])
    
    if not document:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Document not found"
        )
    
    return document

@app.get("/api/documents/{document_id}/content")
async def get_document_content(
    document_id: str,
    current_user: Dict[str, Any] = Depends(get_current_user)
):
    """Serve document content"""
    document = await db.get_document(document_id, user_id=current_user["id"])
    
    if not document:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Document not found"
        )
    
    file_path = Path(document["file_path"])
    if not file_path.exists():
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Document file not found"
        )
    
    # Determine media type
    filename = document["filename"]
    if filename.lower().endswith('.pdf'):
        media_type = 'application/pdf'
    elif filename.lower().endswith(('.doc', '.docx')):
        media_type = 'application/msword'
    elif filename.lower().endswith(('.xls', '.xlsx')):
        media_type = 'application/vnd.ms-excel'
    else:
        media_type = 'application/octet-stream'
    
    return FileResponse(
        file_path,
        media_type=media_type,
        filename=filename
    )

@app.get("/api/documents/{document_id}/terms")
async def get_document_terms(
    document_id: str,
    current_user: Dict[str, Any] = Depends(get_current_user)
):
    """Get extracted terms for a document"""
    document = await db.get_document(document_id, user_id=current_user["id"])
    
    if not document:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Document not found"
        )
    
    # Placeholder for term extraction
    return {
        "document_id": document_id,
        "terms": {},
        "categories": [],
        "extracted_at": None,
        "status": "not_extracted"
    }

@app.patch("/api/documents/{document_id}")
async def update_document(
    document_id: str,
    update_data: DocumentUpdate,
    current_user: Dict[str, Any] = Depends(get_current_user)
):
    """Update document metadata (rename)"""
    # Verify document exists and belongs to user
    document = await db.get_document(document_id, user_id=current_user["id"])

    if not document:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Document not found"
        )

    # Update document
    updated_doc = await db.update_document(
        document_id,
        current_user["id"],
        name=update_data.name
    )

    if not updated_doc:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Failed to update document"
        )

    return {
        "success": True,
        "message": "Document renamed successfully",
        "document": updated_doc
    }

@app.delete("/api/documents/{document_id}")
async def delete_document(
    document_id: str,
    current_user: Dict[str, Any] = Depends(get_current_user)
):
    """Delete a document and its file"""
    # Verify document exists and belongs to user
    document = await db.get_document(document_id, user_id=current_user["id"])

    if not document:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Document not found"
        )

    # Delete from database first
    success = await db.delete_document(document_id, current_user["id"])

    if not success:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Failed to delete document"
        )

    # Delete physical file
    try:
        file_path = Path(document["file_path"])
        if file_path.exists():
            file_path.unlink()
            print(f"✅ Deleted file: {file_path}")
        else:
            print(f"⚠️  File not found (already deleted?): {file_path}")
    except Exception as e:
        # Log error but don't fail the request since DB record is already deleted
        print(f"⚠️  Error deleting file: {e}")

    return {
        "success": True,
        "message": "Document deleted successfully"
    }

# Workflow endpoints (simplified for now)
@app.get("/api/analyze/workflows")
async def get_workflows():
    """Get available workflows"""
    workflows = [
        {'id': 1, 'name': 'Contract Review Workflow', 'status': 'active', 'fields': 15, 'created': '2024-01-15'},
        {'id': 2, 'name': 'NDA Analysis', 'status': 'active', 'fields': 12, 'created': '2024-01-10'},
        {'id': 3, 'name': 'Lease Agreement Review', 'status': 'pending', 'fields': 20, 'created': '2024-01-05'}
    ]
    return workflows

@app.get("/api/analyze/workflows/templates")
async def get_templates():
    """Get workflow templates"""
    templates = [
        {
            'id': 'msa-review',
            'name': 'MSA Review',
            'category': 'MSA/Org Playbook',
            'description': 'Review Master Service Agreements for key terms',
            'fields': ['Title', 'Parties', 'Date', 'Term', 'Termination', 'Payment Terms', 'Liability'],
            'documentTypes': ['Master Service Agreement', 'MSA', 'Service Agreement']
        },
        {
            'id': 'nda-mutual',
            'name': 'Mutual NDA Standard Review',
            'category': 'NDA',
            'description': 'Review mutual non-disclosure agreements',
            'fields': ['Title', 'Parties', 'Date', 'Confidential Information', 'Term', 'Exceptions'],
            'documentTypes': ['NDA', 'Non-Disclosure Agreement', 'Confidentiality Agreement']
        },
        {
            'id': 'ma-due-diligence',
            'name': 'M&A/Due Diligence',
            'category': 'M&A',
            'description': 'Best suited for understanding the basic information in a variety of agreements when doing due diligence.',
            'fields': ['25d677a1-70d0-43c2-9b36-d079733dd020', '98086156-f230-423c-b214-27f542e72708', 'fc5ba010-671b-427f-82cb-95c02d4c704c', '3b45b113-2b4d-42c0-a73d-cccaba4efdf6', 'c83868ae-269a-4a1b-b2af-c53e5f91efca', 'ec9b6b77-0eac-488b-a43c-486fc2940098'],
            'documentTypes': ['Distribution Agt', 'Employment Related Agt', 'Governance Agt', 'IP Agt', 'Service Agt', 'Supply Agt']
        },
        {
            'id': 'leaselens-short',
            'name': 'LeaseLens - Short Form',
            'category': 'Real Estate',
            'description': 'Best suited for understanding the basic information in a North American lease.',
            'fields': ['Property Address', 'Parties', 'Date', 'Premises type', 'Base rent amount', 'Term Duration'],
            'documentTypes': ['Real Estate Agt']
        },
        {
            'id': 'leaselens-long',
            'name': 'LeaseLens - Long Form',
            'category': 'Real Estate',
            'description': 'Expands upon the short form version by providing additional information in a North American lease.',
            'fields': ['Title', 'Parties', 'Date', 'Guarantor', 'Premises Type', 'Base Rent'],
            'documentTypes': ['Real Estate Agt']
        },
        {
            'id': 'customer-finance-ops-privacy',
            'name': 'Customer Agreements - Finance/Ops/Privacy Terms',
            'category': 'Customer Agreements',
            'description': 'Best suited for understanding the finance, operations and privacy information in a customer agreement.',
            'fields': ['Title', 'Parties', 'Date', 'Termination', 'Price Increases/Escalation', 'Confidentiality'],
            'documentTypes': ['Distribution Agt', 'IP Agt', 'Service Agt', 'Supply Agt']
        },
        {
            'id': 'customer-revops',
            'name': 'Customer Agreements - RevOps Terms',
            'category': 'Customer Agreements',
            'description': 'Best suited for understanding the revenue operations information in a customer agreement.',
            'fields': ['Title', 'Parties', 'Date', 'Term and Renewal', 'Pricing', 'Payment Due Dates'],
            'documentTypes': ['Distribution Agt', 'IP Agt', 'Service Agt', 'Supply Agt']
        },
        {
            'id': 'vendor-supplier',
            'name': 'Vendor/Supplier Agreements',
            'category': 'Vendor/Supplier',
            'description': 'Best suited for understanding the basic information in a vendor and supplier agreement.',
            'fields': ['Title', 'Parties', 'Date', 'Term and Renewal', 'Pricing', 'Service Level'],
            'documentTypes': ['Distribution Agt', 'Service Agt', 'Supply Agt']
        },
        {
            'id': 'ndas',
            'name': 'NDAs',
            'category': 'NDA',
            'description': 'Best suited for understanding the basic information in a non-disclosure agreement.',
            'fields': ['Title', 'Parties', 'Date', 'Initial Term', 'Confidential Information Definition', 'Non-Compete'],
            'documentTypes': ['Restrictive Covenant Agt']
        },
        {
            'id': 'employment-agreements',
            'name': 'Employment Agreements',
            'category': 'Employment',
            'description': 'Best suited for understanding the basic information in an employee agreement.',
            'fields': ['Title', 'Parties', 'Date', 'Employee Name', 'Position/Title', 'Base Salary'],
            'documentTypes': ['Employment Related Agt']
        }
    ]
    return templates

# Workflow session management
workflow_sessions = {}
saved_workflows = []

async def load_workflows_from_database():
    """Load all workflows from database into memory on startup"""
    global saved_workflows
    try:
        print("📚 Loading workflows from database...")
        # For now, we'll load workflows from a system user (ID 1) or all users
        # Note: This should eventually be refactored to query all workflows across all users

        # Get all users and their workflows
        # Since we don't have a get_all_users method, we'll track workflows by a marker
        # For simplicity, we'll use a fixed workflow ID range check

        # Actually, workflows stored in DB are per-user, but saved_workflows is global
        # We need to query all workflows regardless of user
        # The database get_workflows method requires user_id, so we need a different approach

        # For now, let's load workflows for all known users
        # This is a simplified approach - in production, you'd want a get_all_workflows() method

        loaded_workflows = []
        # Try to load workflows for user IDs 1-100 (adjust based on your user base)
        for user_id in range(1, 101):
            user_workflows = await db.get_workflows(user_id)
            for wf in user_workflows:
                # Convert database workflow to saved_workflows format
                workflow_dict = {
                    'id': wf['id'],  # Keep as integer for consistency with database
                    'name': wf['name'],
                    'description': wf.get('description', ''),
                    'fields': json.loads(wf['fields']) if wf['fields'] else [],
                    'documentTypes': json.loads(wf['document_types']) if wf['document_types'] else [],
                    'status': wf.get('status', 'active'),
                    'createdAt': wf.get('created_at', ''),
                    'updatedAt': wf.get('updated_at', '')
                }

                # Calculate field count
                if isinstance(workflow_dict['fields'], dict):
                    workflow_dict['fieldCount'] = sum(len(fields) for fields in workflow_dict['fields'].values())
                elif isinstance(workflow_dict['fields'], list):
                    workflow_dict['fieldCount'] = len(workflow_dict['fields'])
                else:
                    workflow_dict['fieldCount'] = 0

                loaded_workflows.append(workflow_dict)

        saved_workflows = loaded_workflows
        print(f"✅ Loaded {len(saved_workflows)} workflows from database")

    except Exception as e:
        print(f"⚠️  Warning: Failed to load workflows from database: {e}")
        print("   Starting with empty workflows list")

# Pydantic models for workflow operations
class WorkflowInit(BaseModel):
    pass

class WorkflowName(BaseModel):
    name: str

class WorkflowTemplate(BaseModel):
    templateId: str
    templateName: str

class WorkflowFields(BaseModel):
    fields: List[str]

class WorkflowDetails(BaseModel):
    description: str
    documentTypes: List[str]

class WorkflowScoring(BaseModel):
    scoringProfiles: List[Dict[str, Any]]

class WorkflowAssignment(BaseModel):
    workflowIds: List[Union[str, int]]

# Field validation helper functions
async def validate_field_ids(field_ids: list, db_instance: AsyncDatabase) -> tuple[bool, list]:
    """
    Validate that all field_ids exist in the fields table
    Returns (is_valid, invalid_field_ids)

    Note: If field names are provided instead of UUIDs, they will be validated against field names in database
    """
    if not field_ids:
        return True, []

    # Separate field IDs (UUIDs) from field names
    import re
    uuid_pattern = r'^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$'
    field_id_list = [fid for fid in field_ids if re.match(uuid_pattern, fid, re.IGNORECASE)]
    field_name_list = [fid for fid in field_ids if not re.match(uuid_pattern, fid, re.IGNORECASE)]

    invalid_ids = []

    # Validate field IDs (UUIDs)
    if field_id_list:
        placeholders = ','.join(['?'] * len(field_id_list))
        query = f"SELECT field_id FROM fields WHERE field_id IN ({placeholders})"

        try:
            import aiosqlite
            async with await db_instance.get_connection() as conn:
                conn.row_factory = None  # We only need values
                cursor = await conn.execute(query, tuple(field_id_list))
                results = await cursor.fetchall()
                valid_ids = {row[0] for row in results}

                invalid_ids.extend([fid for fid in field_id_list if fid not in valid_ids])
        except Exception as e:
            print(f"Error validating field_ids: {e}")
            raise

    # Validate field names
    if field_name_list:
        placeholders = ','.join(['?'] * len(field_name_list))
        query = f"SELECT name FROM fields WHERE name IN ({placeholders})"

        try:
            import aiosqlite
            async with await db_instance.get_connection() as conn:
                conn.row_factory = None  # We only need values
                cursor = await conn.execute(query, tuple(field_name_list))
                results = await cursor.fetchall()
                valid_names = {row[0] for row in results}

                invalid_ids.extend([fname for fname in field_name_list if fname not in valid_names])
        except Exception as e:
            print(f"Error validating field names: {e}")
            raise

    return len(invalid_ids) == 0, invalid_ids

def extract_field_ids_from_workflow(fields_data):
    """
    Extract all field_ids from workflow.fields structure
    Supports: dict of groups, list of fields, objects with fieldId
    """
    field_ids = []

    if isinstance(fields_data, dict):
        # Grouped structure: { "Group": [fields] }
        for group_fields in fields_data.values():
            if isinstance(group_fields, list):
                for field in group_fields:
                    if isinstance(field, dict) and 'fieldId' in field:
                        field_ids.append(field['fieldId'])
                    elif isinstance(field, str):
                        # Field ID as string
                        field_ids.append(field)
            elif isinstance(group_fields, str):
                # Field ID directly as value
                field_ids.append(group_fields)
    elif isinstance(fields_data, list):
        # Flat list
        for field in fields_data:
            if isinstance(field, dict) and 'fieldId' in field:
                field_ids.append(field['fieldId'])
            elif isinstance(field, str):
                field_ids.append(field)

    return list(set(field_ids))  # Remove duplicates

# Additional workflow endpoints
@app.get("/api/workflows/saved")
async def get_saved_workflows(current_user: Dict[str, Any] = Depends(get_current_user)):
    """Get saved workflows - dynamically loads from database for current user"""
    try:
        # Get workflows from database for current user
        user_workflows = await db.get_workflows(current_user['id'])

        formatted_workflows = []
        for wf in user_workflows:
            # Convert database workflow to saved_workflows format
            workflow_dict = {
                'id': wf['id'],  # Keep as integer for consistency with database
                'name': wf['name'],
                'description': wf.get('description', ''),
                'fields': json.loads(wf['fields']) if wf['fields'] else [],
                'documentTypes': json.loads(wf['document_types']) if wf['document_types'] else [],
                'status': wf.get('status', 'active'),
                'createdAt': wf.get('created_at', ''),
                'updatedAt': wf.get('updated_at', '')
            }

            # Calculate field count
            if isinstance(workflow_dict['fields'], dict):
                workflow_dict['fieldCount'] = sum(len(fields) for fields in workflow_dict['fields'].values())
            elif isinstance(workflow_dict['fields'], list):
                workflow_dict['fieldCount'] = len(workflow_dict['fields'])
            else:
                workflow_dict['fieldCount'] = 0

            formatted_workflows.append(workflow_dict)

        return formatted_workflows

    except Exception as e:
        print(f"⚠️  Error loading workflows from database: {e}")
        # Fallback to static list (should rarely be needed)
        return saved_workflows

@app.get("/api/workflows/saved/{workflow_id}")
async def get_saved_workflow_by_id(workflow_id: str):
    """Get a specific saved workflow by ID"""
    # Find workflow in saved_workflows list
    workflow = next((wf for wf in saved_workflows if wf['id'] == workflow_id), None)

    if not workflow:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Workflow not found"
        )

    return workflow

@app.post("/api/workflows/saved/{workflow_id}/edit")
async def create_edit_session_from_saved_workflow(workflow_id: str):
    """Create an editable workflow session from a saved workflow"""
    # Find the saved workflow
    saved_workflow = next((wf for wf in saved_workflows if wf['id'] == workflow_id), None)

    if not saved_workflow:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Workflow not found"
        )

    # Create a new session ID for editing
    session_id = str(uuid.uuid4())[:8]

    # Create a new workflow session with the saved workflow data
    workflow_sessions[session_id] = {
        'id': session_id,
        'savedWorkflowId': workflow_id,  # Track the original workflow ID
        'name': saved_workflow.get('name', ''),
        'fields': saved_workflow.get('fields', []),
        'description': saved_workflow.get('description', ''),
        'documentTypes': saved_workflow.get('documentTypes', []),
        'scoringProfiles': saved_workflow.get('scoringProfiles', []),
        'status': 'draft',
        'currentStep': 5,  # Go directly to review step
        'createdAt': saved_workflow.get('createdAt', datetime.utcnow().isoformat()),
        'updatedAt': datetime.utcnow().isoformat(),
        'isEditing': True  # Flag to indicate this is an edit session
    }

    return {
        'success': True,
        'sessionId': session_id,
        'workflow': workflow_sessions[session_id]
    }

@app.delete("/api/workflows/saved/all")
async def delete_all_saved_workflows(current_user: Dict[str, Any] = Depends(get_current_user)):
    """Delete all saved workflows for the current user"""
    global saved_workflows

    # Get user's workflows from database
    user_workflows = await db.get_workflows(current_user["id"])
    original_count = len(user_workflows)

    # Delete each workflow from database
    for workflow in user_workflows:
        await db.delete_workflow(workflow["id"], current_user["id"])

    # Also remove from in-memory cache
    saved_workflows = [wf for wf in saved_workflows if wf.get('user_id') != current_user["id"]]

    return {
        "success": True,
        "count": original_count,
        "message": f"Successfully deleted {original_count} workflow{'s' if original_count != 1 else ''}"
    }

@app.delete("/api/workflows/saved/{workflow_id}")
async def delete_saved_workflow(workflow_id: str, current_user: Dict[str, Any] = Depends(get_current_user)):
    """Delete a saved workflow (with authentication and authorization)"""
    global saved_workflows

    try:
        # Convert workflow_id to integer for database lookup
        workflow_id_int = int(workflow_id)
    except ValueError:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Invalid workflow ID format"
        )

    # Delete from database
    success = await db.delete_workflow(workflow_id_int, current_user["id"])

    if not success:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Workflow not found or you don't have permission to delete it"
        )

    # Also remove from in-memory cache if present
    saved_workflows = [wf for wf in saved_workflows if wf['id'] != workflow_id]

    return {
        "success": True,
        "message": "Workflow deleted successfully"
    }

@app.post("/api/analyze/workflows/create/init")
async def init_workflow():
    """Initialize a new workflow session"""
    workflow_id = str(uuid.uuid4())[:8]  # Short ID for simplicity
    workflow_sessions[workflow_id] = {
        'id': workflow_id,
        'name': '',
        'fields': [],
        'description': '',
        'documentTypes': [],
        'scoringProfiles': [],
        'status': 'draft',
        'currentStep': 1,
        'createdAt': datetime.utcnow().isoformat(),
        'updatedAt': datetime.utcnow().isoformat()
    }
    return {'workflowId': workflow_id, 'session': workflow_sessions[workflow_id]}

@app.get("/api/analyze/workflows/create/{workflow_id}")
async def get_workflow(workflow_id: str):
    """Get workflow session by ID"""
    if workflow_id in workflow_sessions:
        return workflow_sessions[workflow_id]
    else:
        raise HTTPException(status_code=404, detail="Workflow session not found")

@app.post("/api/analyze/workflows/create/{workflow_id}/name")
async def set_workflow_name(workflow_id: str, workflow_data: WorkflowName):
    """Set workflow name"""
    if workflow_id not in workflow_sessions:
        raise HTTPException(status_code=404, detail="Workflow session not found")
    
    workflow_sessions[workflow_id]['name'] = workflow_data.name
    workflow_sessions[workflow_id]['currentStep'] = 2
    workflow_sessions[workflow_id]['updatedAt'] = datetime.utcnow().isoformat()
    
    return {'success': True, 'workflow': workflow_sessions[workflow_id]}

@app.post("/api/analyze/workflows/create/{workflow_id}/template")
async def create_workflow_from_template(workflow_id: str, template_data: WorkflowTemplate):
    """Create workflow from template with field_id validation"""
    if workflow_id not in workflow_sessions:
        # Create new session if it doesn't exist
        workflow_sessions[workflow_id] = {
            'id': workflow_id,
            'name': '',
            'fields': [],
            'description': '',
            'documentTypes': [],
            'scoringProfiles': [],
            'status': 'draft',
            'currentStep': 1,
            'createdAt': datetime.utcnow().isoformat(),
            'updatedAt': datetime.utcnow().isoformat()
        }

    # Create workflow from template
    template_name = template_data.templateName
    if 'm&a' in template_name.lower() or 'due diligence' in template_name.lower():
        workflow_sessions[workflow_id] = {
            'id': workflow_id,
            'name': 'M&A/Due Diligence',
            'fields': {
                'Basic Information': [
                    {'fieldId': '25d677a1-70d0-43c2-9b36-d079733dd020', 'name': 'Title'},
                    {'fieldId': '98086156-f230-423c-b214-27f542e72708', 'name': 'Parties'},
                    {'fieldId': 'fc5ba010-671b-427f-82cb-95c02d4c704c', 'name': 'Date'}
                ],
                'Term and Termination': [
                    {'fieldId': '3b45b113-2b4d-42c0-a73d-cccaba4efdf6', 'name': 'Term and Renewal'},
                    {'fieldId': 'c0e6f4a1-4d5b-46ca-9e04-3a898a33dc99', 'name': 'Does the agreement auto renew?'},
                    {'fieldId': 'aeb035ac-b0c6-44fb-bbec-9bd3864f3036', 'name': 'Can the agreement be terminated for convenience?'}
                ],
                'Boilerplate Provisions': [
                    {'fieldId': '8d6970e4-1a44-4f4d-8fcf-3140a6634213', 'name': 'Can the agreement be assigned?'},
                    {'fieldId': '7dc542ae-79f2-462f-962e-24f07e2c4a3e', 'name': 'What are the obligations and requirements resulting from a Change of Control?'},
                    {'fieldId': 'ec9b6b77-0eac-488b-a43c-486fc2940098', 'name': 'Exclusivity'},
                    {'fieldId': 'af3b7aea-6e51-4851-a763-555824c3ceb1', 'name': 'Non-Compete'},
                    {'fieldId': '473457de-b82c-49b2-81a0-5b70303d6605', 'name': 'Non-Solicit'},
                    {'fieldId': 'd5596bb0-1bab-4569-a0a5-7d2117f19c44', 'name': 'Most Favored Nation'},
                    {'fieldId': '47516578-8a4a-451d-8147-7cd84d4d5f1c', 'name': 'Can notice be given electronically?'},
                    {'fieldId': 'c83868ae-269a-4a1b-b2af-c53e5f91efca', 'name': 'Governing Law'}
                ]
            },
            'description': 'Best suited for understanding the basic information in a variety of agreements when doing due diligence.',
            'documentTypes': ['Distribution Agt', 'Employment Related Agt', 'Governance Agt', 'IP Agt', 'Service Agt', 'Supply Agt'],
            'scoringProfiles': [
                {
                    'name': 'Due Diligence Scoring',
                    'description': 'Scores based on presence of restrictive covenant clauses',
                    'rules': [
                        {'fieldId': 'ec9b6b77-0eac-488b-a43c-486fc2940098', 'fieldName': 'Exclusivity', 'condition': 'is_found', 'points': 1},
                        {'fieldId': 'af3b7aea-6e51-4851-a763-555824c3ceb1', 'fieldName': 'Non-Compete', 'condition': 'is_found', 'points': 1},
                        {'fieldId': 'd5596bb0-1bab-4569-a0a5-7d2117f19c44', 'fieldName': 'Most Favored Nation', 'condition': 'is_found', 'points': 1},
                        {'fieldId': '473457de-b82c-49b2-81a0-5b70303d6605', 'fieldName': 'Non-Solicit', 'condition': 'is_found', 'points': 1}
                    ]
                },
                {
                    'name': 'Assignment Restrictions',
                    'description': 'Scores based on assignment restrictiveness',
                    'rules': [
                        {'fieldId': '8d6970e4-1a44-4f4d-8fcf-3140a6634213', 'fieldName': 'Can the agreement be assigned?', 'answer': 'c) Assignable with consent', 'points': 1},
                        {'fieldId': '8d6970e4-1a44-4f4d-8fcf-3140a6634213', 'fieldName': 'Can the agreement be assigned?', 'answer': 'd) Agreement terminable if assigned', 'points': 1},
                        {'fieldId': '8d6970e4-1a44-4f4d-8fcf-3140a6634213', 'fieldName': 'Can the agreement be assigned?', 'answer': 'e) Assignable with payment of a fee', 'points': 1},
                        {'fieldId': '8d6970e4-1a44-4f4d-8fcf-3140a6634213', 'fieldName': 'Can the agreement be assigned?', 'answer': 'f) Not assignable', 'points': 1}
                    ]
                },
                {
                    'name': 'Terminable for Convenience',
                    'description': 'Scores based on termination flexibility',
                    'rules': [
                        {'fieldId': 'aeb035ac-b0c6-44fb-bbec-9bd3864f3036', 'fieldName': 'Can the agreement be terminated for convenience?', 'answer': 'a) Unconditionally terminable for convenience', 'points': 1},
                        {'fieldId': 'aeb035ac-b0c6-44fb-bbec-9bd3864f3036', 'fieldName': 'Can the agreement be terminated for convenience?', 'answer': 'b) Terminable for convenience with prior notice', 'points': 1},
                        {'fieldId': 'aeb035ac-b0c6-44fb-bbec-9bd3864f3036', 'fieldName': 'Can the agreement be terminated for convenience?', 'answer': 'c) Terminable for convenience with payment of termination fee', 'points': 1},
                        {'fieldId': 'aeb035ac-b0c6-44fb-bbec-9bd3864f3036', 'fieldName': 'Can the agreement be terminated for convenience?', 'answer': 'd) Terminable for convenience after a specified time period', 'points': 1},
                        {'fieldId': 'aeb035ac-b0c6-44fb-bbec-9bd3864f3036', 'fieldName': 'Can the agreement be terminated for convenience?', 'answer': 'e) Terminable for convenience with other limitations or conditions', 'points': 1}
                    ]
                },
                {
                    'name': 'Change of Control Restrictions',
                    'description': 'Scores based on change of control obligations',
                    'rules': [
                        {'fieldId': '7dc542ae-79f2-462f-962e-24f07e2c4a3e', 'fieldName': 'What are the obligations and requirements resulting from a Change of Control?', 'answer': 'c) Change of control requires consent', 'points': 1},
                        {'fieldId': '7dc542ae-79f2-462f-962e-24f07e2c4a3e', 'fieldName': 'What are the obligations and requirements resulting from a Change of Control?', 'answer': 'd) Change of control requires other obligations', 'points': 1},
                        {'fieldId': '7dc542ae-79f2-462f-962e-24f07e2c4a3e', 'fieldName': 'What are the obligations and requirements resulting from a Change of Control?', 'answer': 'e) Agreement terminable on change of control', 'points': 1}
                    ]
                }
            ],
            'status': 'draft',
            'currentStep': 5,
            'createdAt': datetime.utcnow().isoformat(),
            'updatedAt': datetime.utcnow().isoformat()
        }
    elif 'leaselens' in template_name.lower() and 'short form' in template_name.lower():
        workflow_sessions[workflow_id] = {
            'id': workflow_id,
            'name': 'LeaseLens - Short Form',
            'fields': {
                'Basic Information': ['Title', 'Parties', 'Date'],
                'Property Basics/Information': [
                    'Property Address',
                    'Premises type',
                    'Premises size',
                    'Property type',
                    'Common Area Maintenance (CAM)'
                ],
                'Term and Termination': [
                    'Commencement Date',
                    'Expiration Date',
                    'Term Duration',
                    'Does the lease auto renew?',
                    'Renewal options',
                    'Early termination right for landlord',
                    'Early termination right for tenant',
                    'Early termination penalties'
                ],
                'Use of Property': [
                    'Permitted use',
                    'Exclusive use',
                    'Prohibited uses',
                    'Operating hours',
                    'Co-tenancy requirements',
                    'Radius restrictions',
                    'Signage rights',
                    'Parking',
                    'ADA compliance responsibility'
                ],
                'Rent and Expenses': [
                    'Base rent amount',
                    'Base rent payment frequency',
                    'Percentage rent',
                    'Rent escalation',
                    'Security deposit',
                    'Utilities responsibility',
                    'Property taxes responsibility',
                    'Insurance requirements'
                ],
                'Boilerplate Provisions': [
                    'Can the lease be assigned?',
                    'Can the lease be sublet?',
                    'Notice requirements',
                    'Default and cure periods',
                    'Governing Law'
                ]
            },
            'description': 'Best suited for understanding the basic information in a North American lease.',
            'documentTypes': ['Real Estate Agt'],
            'scoringProfiles': {},
            'status': 'draft',
            'currentStep': 5,
            'createdAt': datetime.utcnow().isoformat(),
            'updatedAt': datetime.utcnow().isoformat()
        }
    elif 'leaselens' in template_name.lower() and 'long form' in template_name.lower():
        workflow_sessions[workflow_id] = {
            'id': workflow_id,
            'name': 'LeaseLens - Long Form',
            'fields': {
                'Basic Information': [
                    'Title',
                    'Parties',
                    'Date',
                    'Guarantor'
                ],
                'Property Basics/Information': [
                    'Premises Type',
                    'Address of Premises',
                    'Square Footage of Premises'
                ],
                'Term and Termination': [
                    'Initial Term',
                    'Commencement Date (Short Form)',
                    'Commencement Date (Long Form)',
                    'Expiration Date — Lease',
                    'Renewal — Lease',
                    'Unilateral Tenant Termination Rights',
                    'Termination for Casualty — Lease',
                    'Casualty',
                    'Holdover',
                    'Surrender',
                    'Recapture',
                    'Termination Damages — Lease'
                ],
                'Use of Property': [
                    'Use of Premises',
                    'Parking',
                    'Description of Premises',
                    'Utilities',
                    'Prohibited Use',
                    'Signage',
                    'Permitted Alterations/Additions',
                    'Non-Disturbance/Quiet Enjoyment',
                    'Relocation',
                    'Operating Covenant',
                    'Right to Enter/Right of Inspection'
                ],
                'Rent and Expenses': [
                    'Base Rent',
                    'Additional Rent',
                    'Rent Payment Date',
                    'Late Payment and Grace Period',
                    'Security Deposit/Letters of Credit',
                    '"Operating Expenses"/"Common Area Maintenance" Definition',
                    'Liability Cap',
                    'Net Lease',
                    'Gross Up'
                ],
                'Transfer Provisions': [
                    'Permitted Subletting and Transfers',
                    'Purchase Options and Rights of First Refusal/First Offer - Lease',
                    'Landlord Consent for Lease Transfer',
                    'Tenant Transfer Rights to Affiliate',
                    'Additional Conditions for Transfer',
                    'Lease Transfer Fees',
                    'Sublease/Assignment Profit-Sharing',
                    'Change of Control — Lease'
                ],
                'Default Provisions': [
                    'Events of Default — Lease',
                    'Landlord Remedies Upon Events of Default',
                    'Landlord\'s Default — Cure Periods',
                    'Tenant\'s Default — Cure Periods for Monetary Defaults',
                    'Default or Termination for Bankruptcy/Insolvency'
                ],
                'Other Obligations': [
                    'Insurance — Lease',
                    'Tenant Insurance Obligations',
                    'Subordination',
                    'Attornment',
                    'Estoppel Certificate Requirements',
                    'Subrogation Waiver',
                    'Indemnity',
                    'Environmental Indemnity'
                ],
                'Boilerplate Provisions': [
                    'Notice',
                    'Survival',
                    'Force Majeure — Lease',
                    'Governing Law'
                ]
            },
            'description': 'Expands upon the short form version by providing additional information in a North American lease.',
            'documentTypes': ['Real Estate Agt'],
            'scoringProfiles': {},
            'status': 'draft',
            'currentStep': 5,
            'createdAt': datetime.utcnow().isoformat(),
            'updatedAt': datetime.utcnow().isoformat()
        }
    elif 'finance/ops/privacy' in template_name.lower() or 'finance-ops-privacy' in template_name.lower():
        workflow_sessions[workflow_id] = {
            'id': workflow_id,
            'name': 'Customer Agreements - Finance/Ops/Privacy Terms',
            'fields': {
                'Basic Information': [
                    'Title',
                    'Parties',
                    'Date'
                ],
                'Termination': [
                    'Termination',
                    'Can the agreement be terminated for convenience?',
                    'Effects of Termination',
                    'Liability on Termination'
                ],
                'Pricing/Payment': [
                    'Price Increases/Escalation',
                    'Non-Refundable Amounts',
                    'Payment Due Dates',
                    'Early Payment Discount',
                    'Discounts',
                    'Currency'
                ],
                'Confidentiality': [
                    'Confidentiality',
                    'Personnel/Third Party Confidentiality Requirements',
                    'Permitted Use of Data/Confidential Information'
                ],
                'Data Security': [
                    'Security Measures (General)',
                    'Notification Upon Data Breach',
                    'Duty to Investigate/Monitor/Assist Upon Breach',
                    'Assistance with Data Subject Requests',
                    'Procedures for Data Subject Requests',
                    'Transfer of Data',
                    'Right to Create Aggregated/Statistical Data',
                    'Do Not Sell Personal Information',
                    'Customer License Grant',
                    'Backups of Customer Data',
                    'Privacy Officer'
                ],
                'Product/Service Requirements': [
                    'Service Level',
                    'Minimum Purchase Amounts',
                    'Performance Obligation — Supplies, Purchases and Sales',
                    'Performance Obligation — Services',
                    'Product Returns',
                    'Customer Feedback'
                ],
                'Insurance': [
                    'Insurance',
                    'Certificate of Insurance'
                ],
                'Subcontracting': [
                    'Subcontracting',
                    'Business Continuity'
                ],
                'Boilerplate Provisions': [
                    'Can notice be given electronically?',
                    'Non-Solicit',
                    'Disclaimer of Liability — Loss of Data',
                    'Limitation of Liability — Financial Cap',
                    'Indemnity',
                    'Governing Law'
                ]
            },
            'description': 'Best suited for understanding the finance, operations and privacy information in a customer agreement.',
            'documentTypes': ['Distribution Agt', 'IP Agt', 'Service Agt', 'Supply Agt'],
            'scoringProfiles': {},
            'status': 'draft',
            'currentStep': 5,
            'createdAt': datetime.utcnow().isoformat(),
            'updatedAt': datetime.utcnow().isoformat()
        }
    elif 'revops' in template_name.lower():
        workflow_sessions[workflow_id] = {
            'id': workflow_id,
            'name': 'Customer Agreements - RevOps Terms',
            'fields': {
                'Basic Information': [
                    'Title',
                    'Parties',
                    'Date'
                ],
                'Term and Termination': [
                    'Term and Renewal',
                    'Does the agreement auto renew?',
                    'Can the agreement be terminated for convenience?'
                ],
                'Pricing': [
                    'Pricing',
                    'Price Increases/Escalation',
                    'Inflation Adjustment',
                    'Discounts'
                ],
                'Payment': [
                    'Upfront/Initial Payments',
                    'Non-Refundable Amounts',
                    'Payment Due Dates',
                    'Interest on Overdue Payments'
                ],
                'Invoice/Purchase Order Requirements': [
                    'Invoice Frequency',
                    'Invoice Requirements',
                    'Billing Address',
                    'Purchase Order Requirements',
                    'Minimum Purchase Amounts'
                ],
                'Boilerplate Provisions': [
                    'Publicity',
                    'Can the agreement be assigned?',
                    'Change of Control',
                    'Exclusivity',
                    'Non-Compete',
                    'Non-Solicit',
                    'Most Favored Nation',
                    'Confidentiality',
                    'Force Majeure',
                    'Amendment',
                    'Can notice be given electronically?',
                    'Governing Law'
                ]
            },
            'description': 'Best suited for understanding the revenue operations information in a customer agreement.',
            'documentTypes': ['Distribution Agt', 'IP Agt', 'Service Agt', 'Supply Agt'],
            'scoringProfiles': {},
            'status': 'draft',
            'currentStep': 5,
            'createdAt': datetime.utcnow().isoformat(),
            'updatedAt': datetime.utcnow().isoformat()
        }
    elif 'vendor' in template_name.lower() or 'supplier' in template_name.lower():
        workflow_sessions[workflow_id] = {
            'id': workflow_id,
            'name': 'Vendor/Supplier Agreements',
            'fields': {
                'Basic Information': [
                    'Title',
                    'Parties',
                    'Date'
                ],
                'Term and Termination': [
                    'Term and Renewal',
                    'Does the agreement auto renew?',
                    'Can the agreement be terminated for convenience?'
                ],
                'Pricing': [
                    'Pricing',
                    'Price Increases/Escalation',
                    'Inflation Adjustment'
                ],
                'Payment': [
                    'Upfront/Initial Payments',
                    'Non-Refundable Amounts',
                    'Payment Due Dates',
                    'Interest on Overdue Payments',
                    'Minimum Purchase Amounts'
                ],
                'Shipping/Delivery': [
                    'Purchase Order Changes/Cancellation',
                    'Shipping/Delivery Terms'
                ],
                'Product/Service Requirements': [
                    'Service Level',
                    'Change Control/Change Management',
                    'Insurance',
                    'Warranty'
                ],
                'Boilerplate Provisions': [
                    'Confidentiality',
                    'Force Majeure',
                    'Arbitration',
                    'Foreign Corrupt Practices Act Compliance',
                    'Anti-Terrorism Law Compliance',
                    'Most Favored Nation',
                    'Limitation of Liability',
                    'Indemnity',
                    'Governing Law'
                ]
            },
            'description': 'Best suited for understanding the basic information in a vendor and supplier agreement.',
            'documentTypes': ['Distribution Agt', 'Service Agt', 'Supply Agt'],
            'scoringProfiles': {},
            'status': 'draft',
            'currentStep': 5,
            'createdAt': datetime.utcnow().isoformat(),
            'updatedAt': datetime.utcnow().isoformat()
        }
    elif 'nda' in template_name.lower():
        workflow_sessions[workflow_id] = {
            'id': workflow_id,
            'name': 'NDAs',
            'fields': {
                'Basic Information': [
                    'Title',
                    'Parties',
                    'Date'
                ],
                'Term and Termination': [
                    'Initial Term'
                ],
                'Confidential Information': [
                    '"Confidential Information" Definition',
                    'Ownership of Confidential Information',
                    'What triggers the requirement to return or destroy confidential information/data?',
                    'Is there a requirement to certify that Confidential Information/Data has been returned or destroyed?'
                ],
                'Boilerplate Provisions': [
                    'Non-Compete',
                    'Non-Solicit',
                    'Notice',
                    'Governing Law'
                ]
            },
            'description': 'Best suited for understanding the basic information in a non-disclosure agreement.',
            'documentTypes': ['Restrictive Covenant Agt'],
            'scoringProfiles': {},
            'status': 'draft',
            'currentStep': 5,
            'createdAt': datetime.utcnow().isoformat(),
            'updatedAt': datetime.utcnow().isoformat()
        }
    elif 'employment' in template_name.lower():
        workflow_sessions[workflow_id] = {
            'id': workflow_id,
            'name': 'Employment Agreements',
            'fields': {
                'Basic Information': [
                    'Title',
                    'Parties',
                    'Date',
                    'Employee Name',
                    'Position/Title'
                ],
                'Salary/Bonus': [
                    'Base Salary',
                    'Bonus/Commission',
                    'Option/Equity Grant'
                ],
                'Term and Termination': [
                    'Initial Term',
                    'Start Date — Employment',
                    'Notice of Termination Without Cause or Good Reason',
                    'Pay in Lieu of Notice',
                    'Severance Payments and Benefits'
                ],
                'Boilerplate Provisions': [
                    'Non-Compete',
                    'Non-Solicit',
                    'Non-Disparagement',
                    'Governing Law'
                ]
            },
            'description': 'Best suited for understanding the basic information in an employee agreement.',
            'documentTypes': ['Employment Related Agt'],
            'scoringProfiles': {},
            'status': 'draft',
            'currentStep': 5,
            'createdAt': datetime.utcnow().isoformat(),
            'updatedAt': datetime.utcnow().isoformat()
        }
    else:
        # Default template handling
        workflow_sessions[workflow_id]['name'] = template_data.templateName
        workflow_sessions[workflow_id]['currentStep'] = 2
        workflow_sessions[workflow_id]['updatedAt'] = datetime.utcnow().isoformat()
    
    return {'success': True, 'workflow': workflow_sessions[workflow_id]}

@app.post("/api/analyze/workflows/create/{workflow_id}/fields")
async def set_workflow_fields(workflow_id: str, fields_data: WorkflowFields):
    """Set workflow fields"""
    if workflow_id not in workflow_sessions:
        raise HTTPException(status_code=404, detail="Workflow session not found")
    
    workflow_sessions[workflow_id]['fields'] = fields_data.fields
    workflow_sessions[workflow_id]['currentStep'] = 3
    workflow_sessions[workflow_id]['updatedAt'] = datetime.utcnow().isoformat()
    
    return {'success': True, 'workflow': workflow_sessions[workflow_id]}

@app.post("/api/analyze/workflows/create/{workflow_id}/details")
async def set_workflow_details(workflow_id: str, details_data: WorkflowDetails):
    """Set workflow details"""
    if workflow_id not in workflow_sessions:
        raise HTTPException(status_code=404, detail="Workflow session not found")
    
    workflow_sessions[workflow_id]['description'] = details_data.description
    workflow_sessions[workflow_id]['documentTypes'] = details_data.documentTypes
    workflow_sessions[workflow_id]['currentStep'] = 4
    workflow_sessions[workflow_id]['updatedAt'] = datetime.utcnow().isoformat()
    
    return {'success': True, 'workflow': workflow_sessions[workflow_id]}

@app.post("/api/analyze/workflows/create/{workflow_id}/scoring")
async def set_workflow_scoring(workflow_id: str, scoring_data: WorkflowScoring):
    """Set workflow scoring profiles"""
    if workflow_id not in workflow_sessions:
        raise HTTPException(status_code=404, detail="Workflow session not found")
    
    workflow_sessions[workflow_id]['scoringProfiles'] = scoring_data.scoringProfiles
    workflow_sessions[workflow_id]['currentStep'] = 5
    workflow_sessions[workflow_id]['updatedAt'] = datetime.utcnow().isoformat()
    
    return {'success': True, 'workflow': workflow_sessions[workflow_id]}

@app.post("/api/analyze/workflows/create/{workflow_id}/review")
async def save_workflow(
    workflow_id: str,
    current_user: Dict[str, Any] = Depends(get_current_user)
):
    """Save/finalize workflow with field_id validation (requires authentication)"""
    if workflow_id not in workflow_sessions:
        raise HTTPException(status_code=404, detail="Workflow session not found")

    # Get authenticated user ID
    user_id = current_user["id"]

    # Extract field_ids from workflow for validation
    workflow_fields = workflow_sessions[workflow_id].get('fields', [])
    field_ids = extract_field_ids_from_workflow(workflow_fields)

    print(f"Validating {len(field_ids)} field_ids for workflow '{workflow_sessions[workflow_id].get('name')}'")

    # Validate field_ids exist in database
    if field_ids:
        try:
            is_valid, invalid_field_ids = await validate_field_ids(field_ids, db)

            if not is_valid:
                print(f"Validation failed: Invalid field_ids found: {invalid_field_ids}")
                return JSONResponse(
                    status_code=400,
                    content={
                        "success": False,
                        "error": f"Invalid field_ids: {', '.join(invalid_field_ids)}",
                        "invalid_field_ids": invalid_field_ids,
                        "message": "One or more field_ids do not exist in the database. Please verify the field_ids and try again."
                    }
                )

            print(f"All field_ids validated successfully")
        except Exception as e:
            print(f"Error during field_id validation: {e}")
            raise HTTPException(
                status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
                detail=f"Failed to validate field_ids: {str(e)}"
            )

    # Save workflow
    workflow_sessions[workflow_id]['status'] = 'active'
    workflow_sessions[workflow_id]['completedAt'] = datetime.utcnow().isoformat()

    # Check if this is an edit (updating existing workflow) or new workflow
    is_editing = workflow_sessions[workflow_id].get('isEditing', False)
    saved_workflow_id = workflow_sessions[workflow_id].get('savedWorkflowId')

    # Save to database
    try:
        if is_editing and saved_workflow_id:
            # Update existing workflow in database
            print(f"Updating existing workflow {saved_workflow_id}")

            # Update workflow in database
            success = await db.update_workflow(
                workflow_id=int(saved_workflow_id),
                user_id=user_id,
                name=workflow_sessions[workflow_id].get('name', 'Unnamed Workflow'),
                description=workflow_sessions[workflow_id].get('description', ''),
                fields=json.dumps(workflow_sessions[workflow_id].get('fields', [])),
                document_types=json.dumps(workflow_sessions[workflow_id].get('documentTypes', [])),
                status='active'
            )

            if not success:
                raise HTTPException(
                    status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
                    detail="Failed to update workflow in database"
                )

            # Use the existing workflow ID
            workflow_id_db = saved_workflow_id
            print(f"Successfully updated workflow {workflow_id_db}")
        else:
            # Create new workflow
            print(f"Creating new workflow")
            db_workflow = await db.create_workflow(
                user_id=user_id,
                name=workflow_sessions[workflow_id].get('name', 'Unnamed Workflow'),
                description=workflow_sessions[workflow_id].get('description', ''),
                fields=json.dumps(workflow_sessions[workflow_id].get('fields', [])),
                document_types=json.dumps(workflow_sessions[workflow_id].get('documentTypes', [])),
                status='active'
            )

            if not db_workflow:
                raise HTTPException(
                    status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
                    detail="Failed to save workflow to database"
                )

            # Use database ID for the saved workflow
            workflow_id_db = str(db_workflow['id'])
            print(f"Successfully created workflow {workflow_id_db}")
    except Exception as e:
        print(f"Error saving workflow to database: {e}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Failed to save workflow: {str(e)}"
        )

    # Create saved workflow dict for in-memory list
    saved_workflow = workflow_sessions[workflow_id].copy()
    saved_workflow['id'] = workflow_id_db

    # Calculate field count
    if 'fields' in saved_workflow:
        if isinstance(saved_workflow['fields'], dict):
            saved_workflow['fieldCount'] = sum(len(fields) for fields in saved_workflow['fields'].values())
        elif isinstance(saved_workflow['fields'], list):
            saved_workflow['fieldCount'] = len(saved_workflow['fields'])
        else:
            saved_workflow['fieldCount'] = 0

    # Add to in-memory list (check if already exists to avoid duplicates)
    existing_workflow = next((wf for wf in saved_workflows if wf['id'] == workflow_id_db), None)
    if not existing_workflow:
        saved_workflows.append(saved_workflow)
    else:
        # Update existing workflow
        saved_workflows[saved_workflows.index(existing_workflow)] = saved_workflow

    return {
        'success': True,
        'message': 'Workflow saved successfully',
        'workflow': saved_workflow
    }

# Document-Workflow assignment endpoints
@app.get("/api/documents/{document_id}/workflows")
async def get_document_workflows(document_id: str):
    """Get workflows assigned to a document (filters out deleted workflows)"""
    try:
        # Get workflow IDs from database
        workflow_ids = await db.get_document_workflows(document_id)

        # Filter out non-existent workflows and get their names
        valid_workflow_ids = []
        workflow_names = []
        for wf_id in workflow_ids:
            workflow = next((wf for wf in saved_workflows if wf['id'] == wf_id), None)
            if workflow:
                valid_workflow_ids.append(wf_id)
                workflow_names.append(workflow['name'])
            else:
                # Log orphaned reference (will be cleaned up on next startup)
                print(f"⚠️  Workflow {wf_id} assigned to document {document_id} no longer exists")

        return {
            "workflowIds": valid_workflow_ids,  # Only return valid workflow IDs
            "workflowNames": workflow_names
        }
    except Exception as e:
        print(f"Error getting document workflows: {e}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Failed to get document workflows"
        )

@app.put("/api/documents/{document_id}/workflows")
async def assign_document_workflows(
    document_id: str,
    assignment: WorkflowAssignment,
    current_user: Dict[str, Any] = Depends(get_current_user)
):
    """Assign workflows to a document"""
    try:
        # Verify document belongs to user
        document = await db.get_document(document_id, user_id=current_user["id"])
        if not document:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="Document not found"
            )

        # Convert string workflow IDs to integers
        try:
            workflow_ids_int = [int(wf_id) for wf_id in assignment.workflowIds]
        except (ValueError, TypeError) as e:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail=f"Invalid workflow ID format: {e}"
            )

        # Validate that all workflows are active and belong to the user
        for wf_id in workflow_ids_int:
            workflow = await db.get_workflow(wf_id, current_user["id"])
            if not workflow:
                # Check if workflow exists for any user (to distinguish between not found vs access denied)
                async with aiosqlite.connect(db.db_path) as conn:
                    cursor = await conn.execute("SELECT name, user_id FROM workflows WHERE id = ?", (wf_id,))
                    other_workflow = await cursor.fetchone()

                if other_workflow:
                    # Workflow exists but belongs to another user
                    raise HTTPException(
                        status_code=status.HTTP_403_FORBIDDEN,
                        detail=f"Workflow {wf_id} ('{other_workflow[0]}') does not belong to you. You can only assign your own workflows to documents."
                    )
                else:
                    # Workflow doesn't exist at all
                    raise HTTPException(
                        status_code=status.HTTP_404_NOT_FOUND,
                        detail=f"Workflow {wf_id} not found. It may have been deleted."
                    )

        # Assign workflows
        success = await db.assign_workflows_to_document(document_id, workflow_ids_int)

        if not success:
            raise HTTPException(
                status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
                detail="Failed to assign workflows"
            )

        return {
            "success": True,
            "message": "Workflows assigned successfully"
        }
    except HTTPException:
        raise
    except Exception as e:
        print(f"Error assigning workflows: {e}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Failed to assign workflows"
        )

# Extraction endpoints

# Helper functions for extraction results
async def _enrich_field_metadata(field_id: str) -> Dict[str, Any]:
    """
    Enrich field ID with metadata from fields table

    Args:
        field_id: Field ID to enrich

    Returns:
        Dictionary with field metadata (name, description, type, etc.)
    """
    try:
        # Query fields table
        fields = await db.get_fields()
        field_data = next((f for f in fields if f['field_id'] == field_id), None)

        if field_data:
            return {
                'field_id': field_id,
                'name': field_data.get('name', field_id),
                'description': field_data.get('description', ''),
                'type': field_data.get('type', 'text'),
                'region': field_data.get('region', ''),
                'tags': field_data.get('tags', [])
            }
        else:
            # Return minimal metadata if field not found in database
            return {
                'field_id': field_id,
                'name': field_id,
                'description': '',
                'type': 'text',
                'region': '',
                'tags': []
            }
    except Exception as e:
        print(f"Warning: Could not enrich field metadata for {field_id}: {e}")
        return {
            'field_id': field_id,
            'name': field_id,
            'description': '',
            'type': 'text',
            'region': '',
            'tags': []
        }

def _enrich_extraction_bbox(extraction: Dict[str, Any]) -> Dict[str, Any]:
    """
    Enrich extraction with bbox from spans if bbox is null
    This handles cached data that was stored before bbox extraction was added

    Args:
        extraction: Single extraction object

    Returns:
        Extraction with bbox populated from spans if needed
    """
    # If bbox already exists, return as-is
    if extraction.get('bbox') is not None:
        return extraction

    # Try to extract bbox from spans
    spans = extraction.get('spans', [])
    if spans and len(spans) > 0:
        first_span = spans[0]
        bboxes = first_span.get('bboxes', [])
        if bboxes and len(bboxes) > 0:
            first_bbox_obj = bboxes[0]
            bounds = first_bbox_obj.get('bounds', [])
            if bounds and len(bounds) > 0:
                bound = bounds[0]
                # Convert to [left, bottom, right, top] format for PDF coordinates
                extraction['bbox'] = [
                    bound.get('left'),
                    bound.get('bottom'),
                    bound.get('right'),
                    bound.get('top')
                ]

    return extraction


async def _get_single_workflow_results(document_id: str, workflow_id: int) -> Dict[str, Any]:
    """
    Get extraction results for a single document-workflow pair with enriched field metadata

    Args:
        document_id: Document ID
        workflow_id: Workflow ID

    Returns:
        Extraction results with field metadata
    """
    try:
        # Query extractions table
        extraction = await db.get_extraction_by_document_workflow(
            document_id, workflow_id
        )

        if not extraction:
            return {
                "status": "not_found",
                "message": "No extractions found for this document and workflow"
            }

        # Check status
        if extraction['status'] != 'complete':
            return {
                "status": extraction['status'],
                "message": f"Extraction is {extraction['status']}",
                "documentId": document_id,
                "workflowId": workflow_id,
                "extractedAt": extraction.get('completed_at'),
                "startedAt": extraction.get('started_at'),
                "createdAt": extraction.get('created_at'),
                "errorMessage": extraction.get('error_message')
            }

        # Parse results JSON
        extraction_data = extraction.get('results', {})
        answer_metadata = extraction.get('answer_metadata', {})

        if not extraction_data:
            return {
                "status": "complete",
                "message": "Extraction complete but no results available",
                "documentId": document_id,
                "workflowId": workflow_id,
                "extractedAt": extraction.get('completed_at'),
                "fields": {}
            }

        # Fetch workflow to get field names and structure
        workflow = None
        workflow_name = None
        try:
            # Get workflow without user_id restriction for extraction results
            import aiosqlite
            async with aiosqlite.connect(db.db_path) as conn:
                conn.row_factory = aiosqlite.Row
                cursor = await conn.execute("""
                    SELECT id, user_id, name, description, fields, document_types, status, created_at, updated_at
                    FROM workflows WHERE id = ?
                """, (workflow_id,))
                row = await cursor.fetchone()
                workflow = dict(row) if row else None
                if workflow:
                    workflow_name = workflow.get('name', f'Workflow {workflow_id}')
        except Exception as e:
            print(f"Warning: Could not fetch workflow {workflow_id}: {e}")

        # Build response with enriched field details
        enriched_fields = {}

        # Iterate through extraction results and enrich with metadata
        for field_id, field_results in extraction_data.items():
            # Get field metadata
            field_metadata = await _enrich_field_metadata(field_id)

            # Check if this is an answer-type field
            field_answer_metadata = answer_metadata.get(field_id) if answer_metadata else None

            # Enrich extractions with bbox from spans if needed
            extractions_list = field_results if isinstance(field_results, list) else [field_results]
            enriched_extractions = [_enrich_extraction_bbox(ext) for ext in extractions_list]

            # Structure: { field_id: { metadata, extractions, answers, answerOptions } }
            field_data = {
                'metadata': field_metadata,
                'extractions': enriched_extractions
            }

            # Add answer-specific data if available
            if field_answer_metadata:
                field_data['hasAnswers'] = True
                field_data['answers'] = field_answer_metadata.get('answers', [])  # [{option: "c", value: "..."}]
                field_data['answerOptions'] = field_answer_metadata.get('answer_options', {})  # {a: "...", b: "..."}
                field_data['fieldName'] = field_answer_metadata.get('field_name', '')
            else:
                field_data['hasAnswers'] = False

            enriched_fields[field_id] = field_data

        response = {
            "status": "complete",
            "documentId": document_id,
            "workflowId": workflow_id,
            "workflowName": workflow_name,
            "extractedAt": extraction.get('completed_at'),
            "startedAt": extraction.get('started_at'),
            "createdAt": extraction.get('created_at'),
            "fieldCount": len(enriched_fields),
            "fields": enriched_fields
        }

        return response

    except Exception as e:
        print(f"Error fetching single workflow extraction results: {e}")
        raise

async def _get_all_workflow_results(document_id: str) -> Dict[str, Any]:
    """
    Get extraction results for all workflows associated with a document

    Args:
        document_id: Document ID

    Returns:
        List of extraction results for all workflows
    """
    try:
        # Get all extractions for this document
        extractions = await db.get_document_extractions(document_id)

        if not extractions:
            return {
                "status": "not_found",
                "message": "No extractions found for this document",
                "documentId": document_id,
                "workflows": []
            }

        # Build response with all workflows
        workflow_results = []

        for extraction in extractions:
            workflow_id = extraction['workflow_id']

            # Get results for each workflow
            try:
                workflow_result = await _get_single_workflow_results(document_id, workflow_id)
                workflow_results.append(workflow_result)
            except Exception as e:
                print(f"Warning: Could not get results for workflow {workflow_id}: {e}")
                workflow_results.append({
                    "status": "error",
                    "workflowId": workflow_id,
                    "message": f"Error retrieving results: {str(e)}"
                })

        return {
            "status": "success",
            "documentId": document_id,
            "workflowCount": len(workflow_results),
            "workflows": workflow_results
        }

    except Exception as e:
        print(f"Error fetching all workflow extraction results: {e}")
        raise

@app.post("/api/documents/{document_id}/extract")
async def start_document_extraction(
    document_id: str,
    workflow_id: int,
    current_user: Dict[str, Any] = Depends(get_current_user)
):
    """Start field extraction for a document-workflow pair"""
    try:
        # Verify document belongs to user
        document = await db.get_document(document_id, user_id=current_user["id"])
        if not document:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="Document not found"
            )

        # Get document file path
        file_path = document.get('file_path')
        if not file_path or not Path(file_path).exists():
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="Document file not found"
            )

        # Start extraction
        extraction = await extraction_service.start_extraction(
            document_id=document_id,
            workflow_id=workflow_id,
            document_path=file_path
        )

        return {
            "success": True,
            "extraction_id": extraction['id'],
            "status": extraction['status'],
            "message": "Extraction started successfully"
        }

    except HTTPException:
        raise
    except Exception as e:
        print(f"Error starting extraction: {e}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Failed to start extraction: {str(e)}"
        )

@app.get("/api/documents/{document_id}/extraction/status")
async def get_extraction_status(
    document_id: str,
    workflow_id: int,
    current_user: Dict[str, Any] = Depends(get_current_user)
):
    """Get extraction status for a document-workflow pair"""
    try:
        # Verify document belongs to user
        document = await db.get_document(document_id, user_id=current_user["id"])
        if not document:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="Document not found"
            )

        # Get extraction status
        status_data = await extraction_service.get_extraction_status(
            document_id=document_id,
            workflow_id=workflow_id
        )

        if not status_data:
            return {
                "status": "not_started",
                "message": "No extraction has been started for this document-workflow pair"
            }

        return status_data

    except HTTPException:
        raise
    except Exception as e:
        print(f"Error getting extraction status: {e}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Failed to get extraction status"
        )

@app.get("/api/documents/{document_id}/extraction/results")
async def get_extraction_results(
    document_id: str,
    workflow_id: Optional[int] = Query(None, description="Workflow ID (optional - returns all workflows if omitted)"),
    current_user: Dict[str, Any] = Depends(get_current_user)
):
    """
    Get extraction results for a document
    Returns results mapped by field_id with extracted text, page, confidence
    Supports both single workflow (with workflow_id) and multiple workflows (without workflow_id)
    """
    try:
        # Verify document belongs to user
        document = await db.get_document(document_id, user_id=current_user["id"])
        if not document:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="Document not found"
            )

        # If workflow_id provided, return single workflow results
        if workflow_id:
            return await _get_single_workflow_results(document_id, workflow_id)

        # Otherwise, return all workflow results for this document
        return await _get_all_workflow_results(document_id)

    except HTTPException:
        raise
    except Exception as e:
        print(f"Error getting extraction results: {e}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Failed to get extraction results: {str(e)}"
        )

# ==================== Market Maps API Endpoints ====================

@app.get("/api/market-maps/trending")
async def get_market_trends():
    """Get trending market data for visualization"""
    return {
        "success": True,
        "data": {
            "marketName": "M&A Targets for Goqii - Digital Health, Wellness, and Connected Wearables",
            "growthRate": 15,
            "lastUpdated": "2025-10-17T16:00:00Z",
            "trends": [
                {
                    "id": 1,
                    "title": "Convergence of Health Data Ecosystems",
                    "description": "The market is shifting rapidly toward platforms that seamlessly integrate wearable data with electronic health records, insurance systems, and clinical workflows.",
                    "color": "blue"
                },
                {
                    "id": 2,
                    "title": "Personalized Preventive Care at Scale",
                    "description": "Advances in AI-driven analytics and longitudinal data collection are fueling the rise of hyper-personalized, preventive health solutions.",
                    "color": "green"
                }
            ]
        }
    }

@app.get("/api/market-maps/market-size")
async def get_market_size():
    """Get market size metrics and data"""
    return {
        "success": True,
        "data": {
            "estimatedCompanies": 700,
            "currentMarketSize": None,
            "growthRateClass": None,
            "segments": [
                {
                    "name": "Wearable Electronics",
                    "value": 82200000000,
                    "year": 2025,
                    "source": "https://www.rdworldonline.com/global-wearable-electronics-market"
                },
                {
                    "name": "Wearable Medical Devices",
                    "value": 33990000000,
                    "year": 2025,
                    "source": "https://www.fortunebusinessinsights.com/wearable-medical-devices-market"
                },
                {
                    "name": "Smartwatches",
                    "value": 49530000000,
                    "year": 2025,
                    "source": "https://www.statista.com/statistics/wearables-market-value"
                }
            ]
        }
    }

@app.get("/api/market-maps/strategies")
async def get_ma_strategies():
    """Get M&A strategy recommendations"""
    return {
        "success": True,
        "data": {
            "currentState": {
                "offerings": "AI-powered preventive healthcare platform integrating consumer wearables (proprietary GOQii band), connected fitness apps (GOQii Care), and chronic disease management.",
                "keyAssets": "Large Indian user base (millions), proprietary wearable hardware, data-based ecosystem (API with apps), partnerships with corporates and insurers.",
                "financialProfile": "Estimated at Series C+ level, $30–70M revenue per year",
                "currentTrajectory": "Rapid expansion into B2B (employer health benefits, insurance)"
            },
            "acquisitionTargets": [
                {
                    "id": 1,
                    "type": "AI Health Analytics Startups",
                    "valueRange": "5-20M",
                    "growthRate": "20-40% CAGR",
                    "description": "Early-commercial-traction, pre-scale acquisitions with differentiated predictive health models",
                    "recommended": True
                },
                {
                    "id": 2,
                    "type": "Digital Health Coaching Platforms",
                    "valueRange": "5-30M",
                    "growthRate": "15-35% CAGR",
                    "description": "Personalized coaching platforms, scalable content/AI, established coaching methodologies",
                    "recommended": True
                }
            ],
            "transformationStories": [
                {
                    "id": 1,
                    "title": "AI Supercharger: Clinical-Grade Health Intelligence",
                    "growthPotential": "+20-70%",
                    "currentState": "Preventive health platform with strong engagement",
                    "acquire": "A $20–60M revenue AI health analytics startup",
                    "futureState": "GOQii integrates proprietary AI risk prediction into its wearables",
                    "integrationTime": "6–18 months"
                }
            ]
        }
    }

@app.get("/api/market-maps/companies")
async def get_target_companies(category: str = None):
    """Get list of potential M&A target companies"""
    companies = [
        {"name": "Remo+", "category": "Digital Health Coaching Platforms"},
        {"name": "Blaze", "category": "Digital Health Coaching Platforms"},
        {"name": "Vera", "category": "Wearable Medical Devices"},
        {"name": "Audicus", "category": "Wearable Medical Devices"},
        {"name": "Speck", "category": "Smartwatches with Health Tracking"},
        {"name": "Iamme", "category": "Digital Health Coaching Platforms"},
        {"name": "BODI", "category": "Digital Health Coaching Platforms"},
        {"name": "Kurbao", "category": "Smartwatches with Health Tracking"},
        {"name": "Withings", "category": "Wearable Medical Devices"},
        {"name": "Fitbit", "category": "Wearable Medical Devices"},
        {"name": "Garmin", "category": "Smartwatches with Health Tracking"},
        {"name": "Apple", "category": "Smartwatches with Health Tracking"},
        {"name": "Samsung", "category": "Smartwatches with Health Tracking"}
    ]

    if category:
        companies = [c for c in companies if c["category"] == category]

    return {
        "success": True,
        "total": len(companies),
        "estimated_total": 2000,
        "data": companies
    }

@app.get("/api/market-maps/analyses")
async def get_market_analyses():
    """Get market analysis documents"""
    return {
        "success": True,
        "data": [
            {
                "id": 1,
                "name": "New Document",
                "category": "Market",
                "lastUpdated": None,
                "createdAt": "2025-10-17T16:00:00Z"
            }
        ]
    }

@app.post("/api/market-maps/analyst-qa")
async def submit_analyst_question(question: dict):
    """Submit a question to the AI analyst"""
    return {
        "success": True,
        "answer": "This is a sample AI analyst response. In production, this would be powered by an AI model analyzing market intelligence data.",
        "sources": [
            "Market intelligence database",
            "Industry reports",
            "Company filings"
        ]
    }

# Error handlers
@app.exception_handler(Exception)
async def general_exception_handler(request, exc):
    """Handle unexpected errors"""
    print(f"Unexpected error: {exc}")
    return JSONResponse(
        status_code=500,
        content={"error": "Internal server error", "detail": "An unexpected error occurred"}
    )

if __name__ == "__main__":
    import uvicorn
    print("""
========================================
FastAPI Workflow API Server Starting
========================================
Server will be available at:
  http://localhost:5000/
  http://0.0.0.0:5000/

API Documentation:
  http://localhost:5000/api/docs
  http://localhost:5000/api/redoc

Authentication Endpoints:
  POST /api/auth/login                - User login
  POST /api/auth/register             - User registration
  GET  /api/auth/me                   - Get current user

Other Endpoints:
  GET /api/health                     - Health check
  GET /api/analyze/workflows          - List workflows
  GET /api/analyze/workflows/templates - List templates
  GET /api/documents                  - List documents

Press Ctrl+C to stop the server
========================================
    """)
