#!/usr/bin/env python3
import os
import json
import uuid
import tempfile
from datetime import datetime
from flask import Flask, request, jsonify, send_file
from flask_cors import CORS
from werkzeug.utils import secure_filename

# Import database layer
from database import db

app = Flask(__name__)
CORS(app)  # Enable CORS for all routes

# Configure upload size limits
app.config['MAX_CONTENT_LENGTH'] = 50 * 1024 * 1024  # 50MB limit
app.config['UPLOAD_FOLDER'] = '/app/uploads'

# Configure Flask for better stability
app.config['THREADED'] = True
app.config['DEBUG'] = False

PORT = int(os.environ.get('PORT', 5000))
HOST = '0.0.0.0'

# Error handler for file size limits
@app.errorhandler(413)
def request_entity_too_large(error):
    """Handle file size limit exceeded"""
    return jsonify({
        'error': 'File too large',
        'message': 'The uploaded file exceeds the maximum size limit.',
        'details': 'Maximum file size is 50MB per file'
    }), 413

# Legacy in-memory storage for workflow sessions (will be migrated to DB)
workflow_sessions = {}
saved_workflows = []

# Simple auth cache to reduce database load (expires after 5 minutes)
auth_cache = {}
AUTH_CACHE_TTL = 300  # 5 minutes

def get_current_user():
    """Get current authenticated user from session token"""
    auth_header = request.headers.get('Authorization')
    if not auth_header or not auth_header.startswith('Bearer '):
        return None
        
    token = auth_header.split(' ')[1]
    
    # Check cache first to reduce database load
    import time
    cache_key = f"session_{token}"
    if cache_key in auth_cache:
        cached_data, timestamp = auth_cache[cache_key]
        if time.time() - timestamp < AUTH_CACHE_TTL:
            return cached_data
        else:
            # Expired, remove from cache
            del auth_cache[cache_key]
    
    # Get from database
    user = db.validate_session(token)
    
    # Cache the result
    if user:
        auth_cache[cache_key] = (user, time.time())
    
    return user

def require_auth():
    """Require authentication for this request"""
    user = get_current_user()
    if not user:
        return jsonify({'error': 'Authentication required'}), 401
    return user

# Health check
@app.route('/api/health', methods=['GET'])
def health_check():
    return jsonify({'status': 'healthy', 'service': 'workflow-api'})

# Authentication endpoints
@app.route('/api/auth/register', methods=['POST'])
def register():
    """Handle user registration"""
    try:
        data = request.get_json() or {}
        
        username = data.get('username', '').strip()
        email = data.get('email', '').strip()
        password = data.get('password', '')
        
        # Validation
        if not username or len(username) < 3:
            return jsonify({'error': 'Username must be at least 3 characters'}), 400
            
        if not email or '@' not in email:
            return jsonify({'error': 'Valid email is required'}), 400
            
        if not password or len(password) < 6:
            return jsonify({'error': 'Password must be at least 6 characters'}), 400
        
        # Create user
        user = db.create_user(username, email, password)
        if user:
            # Create session
            session_token = db.create_session(user['id'])
            return jsonify({
                'success': True,
                'message': 'User created successfully',
                'user': user,
                'token': session_token
            }), 201
        else:
            return jsonify({'error': 'Failed to create user'}), 500
            
    except ValueError as e:
        return jsonify({'error': str(e)}), 400
    except Exception as e:
        print(f"Registration error: {e}")
        return jsonify({'error': 'Registration failed'}), 500

@app.route('/api/auth/login', methods=['POST'])
def login():
    """Handle user login"""
    try:
        data = request.get_json() or {}
        
        username = data.get('username', '').strip()
        password = data.get('password', '')
        
        print(f"Login attempt for username: {username}")
        
        if not username or not password:
            print("Login error: Missing username or password")
            return jsonify({'error': 'Username and password are required'}), 400
        
        # Authenticate user
        user = db.authenticate_user(username, password)
        if user:
            # Create session
            session_token = db.create_session(user['id'])
            if session_token:
                print(f"Login successful for user: {username}")
                return jsonify({
                    'success': True,
                    'message': 'Login successful',
                    'user': user,
                    'token': session_token
                })
            else:
                print(f"Session creation failed for user: {username}")
                return jsonify({'error': 'Failed to create session'}), 500
        else:
            print(f"Authentication failed for user: {username}")
            return jsonify({'error': 'Invalid username or password'}), 401
            
    except Exception as e:
        print(f"Login error: {e}")
        import traceback
        traceback.print_exc()
        return jsonify({'error': 'Login failed - server error'}), 500

@app.route('/api/auth/logout', methods=['POST'])
def logout():
    """Handle user logout"""
    try:
        user = get_current_user()
        if user:
            # Get token from header
            auth_header = request.headers.get('Authorization')
            if auth_header and auth_header.startswith('Bearer '):
                token = auth_header.split(' ')[1]
                db.delete_session(token)
                
            return jsonify({
                'success': True,
                'message': 'Logout successful'
            })
        else:
            return jsonify({'error': 'Not authenticated'}), 401
            
    except Exception as e:
        print(f"Logout error: {e}")
        return jsonify({'error': 'Logout failed'}), 500

# Get current user info (requires auth)
@app.route('/api/auth/me', methods=['GET'])
def get_me():
    user = require_auth()
    if isinstance(user, tuple):  # Error response
        return user
    return jsonify({'user': user})

# Documents endpoint - return user's documents (requires auth)
@app.route('/api/documents', methods=['GET'])
def get_documents():
    user = get_current_user()
    if user:
        documents = db.get_documents(user['user_id'])
        return jsonify(documents)
    else:
        # Return 401 with a clear message for unauthenticated requests
        return jsonify({
            'error': 'Authentication required',
            'message': 'Please log in to view your documents',
            'requiresAuth': True
        }), 401

# Document upload endpoint
@app.route('/api/documents/upload', methods=['POST'])
def upload_documents():
    try:
        print("🔍 Starting upload request...")
        
        user = get_current_user()
        if not user:
            print("❌ Authentication failed")
            return jsonify({'error': 'Authentication required', 'details': 'No valid authentication token provided'}), 401
        
        print(f"✅ Authenticated user: {user.get('username', 'unknown')} (ID: {user.get('user_id', 'unknown')})")
        
        if 'files' not in request.files:
            print("❌ No files in request")
            return jsonify({'error': 'No files provided', 'details': 'Request must include files in multipart form data'}), 400
        
        files = request.files.getlist('files')
        print(f"📁 Received {len(files)} file(s) for upload")
        
        if not files or all(not f.filename for f in files):
            print("❌ All files are empty or unnamed")
            return jsonify({'error': 'No valid files provided', 'details': 'All uploaded files are empty or have no filename'}), 400
        
        uploaded_files = []
        failed_files = []
        
        # Verify upload directory exists and is writable
        uploads_dir = '/app/uploads'
        try:
            os.makedirs(uploads_dir, exist_ok=True)
            print(f"✅ Upload directory ready: {uploads_dir}")
        except Exception as e:
            print(f"❌ Failed to create upload directory: {e}")
            return jsonify({'error': 'Server configuration error', 'details': f'Upload directory not accessible: {str(e)}'}), 500
        
        # Test database connectivity
        try:
            db.get_connection().close()
            print("✅ Database connection test successful")
        except Exception as e:
            print(f"❌ Database connection failed: {e}")
            return jsonify({'error': 'Database error', 'details': f'Cannot connect to database: {str(e)}'}), 500
        
        for file_item in files:
            if file_item and file_item.filename:
                doc_id = str(uuid.uuid4())[:8]
                filename = secure_filename(file_item.filename)
                
                print(f"📄 Processing file: {filename} (ID: {doc_id})")
                
                try:
                    # Get file size
                    file_item.seek(0, 2)  # Seek to end
                    file_size = file_item.tell()
                    file_item.seek(0)  # Reset to beginning
                    print(f"📏 File size: {file_size} bytes")
                    
                    if file_size == 0:
                        print(f"⚠️ Skipping empty file: {filename}")
                        failed_files.append({'name': filename, 'error': 'File is empty'})
                        continue
                    
                    if file_size > 50 * 1024 * 1024:  # 50MB limit
                        print(f"⚠️ File too large: {filename} ({file_size} bytes)")
                        failed_files.append({'name': filename, 'error': 'File size exceeds 50MB limit'})
                        continue
                    
                    file_type = filename.split('.')[-1].upper() if '.' in filename else 'Unknown'
                    file_path = f'/app/uploads/{doc_id}_{filename}'
                    
                    # Save the actual file to disk
                    print(f"💾 Saving file to: {file_path}")
                    file_item.save(file_path)
                    
                    # Verify file was saved correctly
                    if not os.path.exists(file_path):
                        raise Exception(f"File was not saved to {file_path}")
                    
                    actual_size = os.path.getsize(file_path)
                    if actual_size != file_size:
                        raise Exception(f"File size mismatch: expected {file_size}, got {actual_size}")
                    
                    print(f"✅ File saved successfully: {file_path} ({actual_size} bytes)")
                    
                    # Save to database
                    print(f"💾 Saving metadata to database...")
                    doc_info = db.create_document(
                        user_id=user['user_id'],
                        doc_id=doc_id,
                        name=filename,
                        filename=filename,
                        size=file_size,
                        doc_type=file_type,
                        file_path=file_path
                    )
                    
                    if doc_info:
                        uploaded_files.append({
                            'id': doc_id,
                            'name': filename,
                            'size': file_size,
                            'type': file_type,
                            'success': True
                        })
                        print(f"✅ Document metadata saved successfully: {doc_id}")
                    else:
                        # File was saved but database failed - clean up file
                        try:
                            os.remove(file_path)
                            print(f"🧹 Cleaned up file after database failure: {file_path}")
                        except:
                            pass
                        failed_files.append({'name': filename, 'error': 'Database save failed'})
                        print(f"❌ Failed to save document metadata for: {doc_id}")
                        
                except Exception as e:
                    error_msg = str(e)
                    print(f"❌ Error processing file {filename}: {error_msg}")
                    failed_files.append({'name': filename, 'error': error_msg})
                    
                    # Clean up partial file if it exists
                    try:
                        file_path = f'/app/uploads/{doc_id}_{filename}'
                        if os.path.exists(file_path):
                            os.remove(file_path)
                            print(f"🧹 Cleaned up partial file: {file_path}")
                    except:
                        pass
                    continue
        
        # Prepare response
        total_files = len(uploaded_files) + len(failed_files)
        success_count = len(uploaded_files)
        
        print(f"📊 Upload summary: {success_count}/{total_files} files uploaded successfully")
        
        if success_count == 0:
            # All files failed
            error_details = '; '.join([f"{f['name']}: {f['error']}" for f in failed_files])
            return jsonify({
                'error': 'All files failed to upload',
                'details': error_details,
                'failed_files': failed_files
            }), 400
        elif len(failed_files) > 0:
            # Some files failed
            return jsonify({
                'success': True,
                'files': uploaded_files,
                'failed_files': failed_files,
                'message': f'{success_count} file(s) uploaded successfully, {len(failed_files)} failed',
                'warning': 'Some files failed to upload'
            }), 200
        else:
            # All files succeeded
            return jsonify({
                'success': True,
                'files': uploaded_files,
                'message': f'{success_count} file(s) uploaded successfully'
            }), 200
            
    except Exception as e:
        print(f"❌ Unexpected error in upload endpoint: {e}")
        import traceback
        traceback.print_exc()
        return jsonify({
            'error': 'Server error during upload',
            'details': str(e)
        }), 500

# Get individual document metadata
@app.route('/api/documents/<document_id>', methods=['GET'])
def get_document_by_id(document_id):
    """Get individual document metadata by ID"""
    try:
        # Get current user
        user = get_current_user()
        if not user:
            return jsonify({'error': 'Authentication required'}), 401
        
        # Get document info from database
        document = db.get_document(document_id, user_id=user['user_id'])
        
        if not document:
            return jsonify({'error': 'Document not found'}), 404
        
        # Return document metadata
        return jsonify(document)
        
    except Exception as e:
        print(f"❌ Error fetching document {document_id}: {e}")
        return jsonify({'error': 'Internal server error'}), 500

# Serve document content
@app.route('/api/documents/<document_id>/content', methods=['GET'])
def get_document_content(document_id):
    try:
        # Get current user
        user = get_current_user()
        if not user:
            return jsonify({'error': 'Authentication required'}), 401
        
        # Get document info from database
        document = db.get_document(document_id, user_id=user['user_id'])
        
        if not document:
            return jsonify({'error': 'Document not found'}), 404
        
        file_path = document.get('file_path')
        if not file_path or not os.path.exists(file_path):
            return jsonify({'error': 'Document file not found'}), 404
        
        # Determine content type based on file extension
        filename = document.get('filename', '')
        if filename.lower().endswith('.pdf'):
            mimetype = 'application/pdf'
        elif filename.lower().endswith(('.doc', '.docx')):
            mimetype = 'application/msword'
        elif filename.lower().endswith(('.xls', '.xlsx')):
            mimetype = 'application/vnd.ms-excel'
        else:
            mimetype = 'application/octet-stream'
        
        # Send the file
        return send_file(
            file_path,
            mimetype=mimetype,
            as_attachment=False,  # Display in browser, not download
            download_name=filename
        )
        
    except Exception as e:
        print(f"❌ Error serving document {document_id}: {e}")
        return jsonify({'error': 'Internal server error'}), 500

# Get document extracted terms
@app.route('/api/documents/<document_id>/terms', methods=['GET'])
def get_document_terms(document_id):
    """Get extracted terms for a document"""
    try:
        # Get current user
        user = get_current_user()
        if not user:
            return jsonify({'error': 'Authentication required'}), 401
        
        # Verify document exists and belongs to user
        document = db.get_document(document_id, user_id=user['user_id'])
        if not document:
            return jsonify({'error': 'Document not found'}), 404
        
        # For now, return empty terms since extraction isn't implemented yet
        # In a real implementation, this would return extracted terms from the database
        return jsonify({
            'document_id': document_id,
            'terms': {},
            'categories': [],
            'extracted_at': None,
            'status': 'not_extracted'
        })
        
    except Exception as e:
        print(f"❌ Error fetching terms for document {document_id}: {e}")
        return jsonify({'error': 'Internal server error'}), 500

# Get existing workflows
@app.route('/api/analyze/workflows', methods=['GET'])
def get_workflows():
    workflows = [
        {'id': 1, 'name': 'Contract Review Workflow', 'status': 'active', 'fields': 15, 'created': '2024-01-15'},
        {'id': 2, 'name': 'NDA Analysis', 'status': 'active', 'fields': 12, 'created': '2024-01-10'},
        {'id': 3, 'name': 'Lease Agreement Review', 'status': 'pending', 'fields': 20, 'created': '2024-01-05'}
    ]
    return jsonify(workflows)

# Get workflow templates
@app.route('/api/analyze/workflows/templates', methods=['GET'])
def get_templates():
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
            'id': 'lease-commercial',
            'name': 'Commercial Lease Agreement Review',
            'category': 'Lease Playbook',
            'description': 'Review commercial real estate leases',
            'fields': ['Title', 'Parties', 'Date', 'Property Description', 'Rent', 'Term', 'Renewal Options'],
            'documentTypes': ['Lease Agreement', 'Commercial Lease', 'Rental Agreement']
        }
    ]
    return jsonify(templates)

# Get saved workflows
@app.route('/api/workflows/saved', methods=['GET'])
def get_saved_workflows():
    return jsonify(saved_workflows)

# Get fields for Field Discovery
@app.route('/api/fields', methods=['GET'])
def get_fields():
    search = request.args.get('search')
    tags = request.args.get('tags')
    region = request.args.get('region')
    limit = request.args.get('limit', type=int)
    offset = request.args.get('offset', type=int)
    
    fields = db.get_fields(
        search=search,
        tags=tags, 
        region=region,
        limit=limit,
        offset=offset
    )
    
    total_count = db.get_field_count()
    
    return jsonify({
        'fields': fields,
        'total': total_count,
        'count': len(fields)
    })

# Initialize new workflow session
@app.route('/api/analyze/workflows/create/init', methods=['POST'])
def init_workflow():
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
        'createdAt': datetime.now().isoformat(),
        'updatedAt': datetime.now().isoformat()
    }
    return jsonify({'workflowId': workflow_id, 'session': workflow_sessions[workflow_id]}), 201

# Add a catch-all for other workflow endpoints to maintain compatibility
@app.route('/api/analyze/workflows/create/<workflow_id>', methods=['GET'])
@app.route('/api/analyze/workflows/create/<workflow_id>/<step>', methods=['POST'])
def workflow_operations(workflow_id, step=None):
    if request.method == 'GET':
        if workflow_id in workflow_sessions:
            return jsonify(workflow_sessions[workflow_id])
        else:
            return jsonify({'error': 'Workflow session not found'}), 404
    
    # Handle POST requests for workflow steps
    data = request.get_json() or {}
    
    if workflow_id not in workflow_sessions:
        workflow_sessions[workflow_id] = create_new_session(workflow_id)
    
    if step == 'name':
        workflow_sessions[workflow_id]['name'] = data.get('name', '')
        workflow_sessions[workflow_id]['currentStep'] = 2
    elif step == 'fields':
        workflow_sessions[workflow_id]['fields'] = data.get('fields', [])
        workflow_sessions[workflow_id]['currentStep'] = 3
    elif step == 'details':
        workflow_sessions[workflow_id]['description'] = data.get('description', '')
        workflow_sessions[workflow_id]['documentTypes'] = data.get('documentTypes', [])
        workflow_sessions[workflow_id]['currentStep'] = 4
    elif step == 'scoring':
        workflow_sessions[workflow_id]['scoringProfiles'] = data.get('scoringProfiles', [])
        workflow_sessions[workflow_id]['currentStep'] = 5
    elif step == 'review':
        # Save workflow
        workflow_sessions[workflow_id]['status'] = 'active'
        workflow_sessions[workflow_id]['completedAt'] = datetime.now().isoformat()
        
        saved_workflow = workflow_sessions[workflow_id].copy()
        saved_workflow['id'] = str(len(saved_workflows) + 1000)
        
        if 'fields' in saved_workflow:
            if isinstance(saved_workflow['fields'], dict):
                saved_workflow['fieldCount'] = sum(len(fields) for fields in saved_workflow['fields'].values())
            elif isinstance(saved_workflow['fields'], list):
                saved_workflow['fieldCount'] = len(saved_workflow['fields'])
            else:
                saved_workflow['fieldCount'] = 0
        
        saved_workflows.append(saved_workflow)
        
        return jsonify({
            'success': True, 
            'message': 'Workflow saved successfully',
            'workflow': saved_workflow
        })
    elif step == 'template':
        # Handle template creation - simplified version
        template_name = data.get('templateName', '')
        workflow_sessions[workflow_id] = create_template_workflow(workflow_id, template_name)
        return jsonify({'success': True, 'workflow': workflow_sessions[workflow_id]})
    
    workflow_sessions[workflow_id]['updatedAt'] = datetime.now().isoformat()
    return jsonify({'success': True, 'workflow': workflow_sessions[workflow_id]})

def create_new_session(workflow_id):
    return {
        'id': workflow_id,
        'name': '',
        'fields': [],
        'description': '',
        'documentTypes': [],
        'scoringProfiles': [],
        'status': 'draft',
        'currentStep': 1,
        'createdAt': datetime.now().isoformat(),
        'updatedAt': datetime.now().isoformat()
    }

def create_template_workflow(workflow_id, template_name):
    """Create workflow from template"""
    if 'm&a' in template_name.lower() or 'due diligence' in template_name.lower():
        return {
            'id': workflow_id,
            'name': 'M&A/Due Diligence',
            'fields': {
                'Basic Information': ['Title', 'Parties', 'Date'],
                'Term and Termination': [
                    'Term and Renewal',
                    'Does the agreement auto renew?',
                    'Can the agreement be terminated for convenience?'
                ],
                'Boilerplate Provisions': [
                    'Can the agreement be assigned?',
                    'What are the obligations and requirements resulting from a Change of Control?',
                    'Exclusivity',
                    'Non-Compete',
                    'Non-Solicit',
                    'Most Favored Nation',
                    'Can notice be given electronically?',
                    'Governing Law'
                ]
            },
            'description': 'Best suited for understanding the basic information in a variety of agreements when doing due diligence.',
            'documentTypes': ['Distribution Agt', 'Employment Related Agt', 'Governance Agt', 'IP Agt', 'Service Agt', 'Supply Agt'],
            'scoringProfiles': {},
            'status': 'draft',
            'currentStep': 5,
            'createdAt': datetime.now().isoformat(),
            'updatedAt': datetime.now().isoformat()
        }
    # Add other templates as needed
    return create_new_session(workflow_id)

if __name__ == '__main__':
    print(f"""
========================================
Flask Workflow API Server Running
========================================
Server is listening at:
  http://localhost:{PORT}/
  http://0.0.0.0:{PORT}/

Authentication Endpoints:
  POST /api/auth/login                - User login
  POST /api/auth/register             - User registration
  POST /api/auth/logout               - User logout
  GET  /api/auth/me                   - Get current user

Other Endpoints:
  GET /api/health                     - Health check
  GET /api/analyze/workflows          - List workflows
  GET /api/analyze/workflows/templates - List templates
  GET /api/documents                  - List documents

Press Ctrl+C to stop the server
========================================
        """)
    app.run(host=HOST, port=PORT, debug=False, threaded=True)