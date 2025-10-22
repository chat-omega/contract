#!/usr/bin/env python3
import os
import json
import uuid
import cgi
import tempfile
from datetime import datetime
from http.server import HTTPServer, BaseHTTPRequestHandler
from urllib.parse import urlparse, parse_qs
import re

# Import database layer
from database import db

PORT = int(os.environ.get('PORT', 5000))
HOST = '0.0.0.0'

# Legacy in-memory storage for workflow sessions (will be migrated to DB)
workflow_sessions = {}
saved_workflows = []

class WorkflowAPIHandler(BaseHTTPRequestHandler):
    def get_current_user(self):
        """Get current authenticated user from session token"""
        auth_header = self.headers.get('Authorization')
        if not auth_header or not auth_header.startswith('Bearer '):
            return None
            
        token = auth_header.split(' ')[1]
        return db.validate_session(token)
    
    def require_auth(self):
        """Require authentication for this request"""
        user = self.get_current_user()
        if not user:
            self.send_json_response(401, {'error': 'Authentication required'})
            return None
        return user
    
    def send_json_response(self, status_code, data):
        """Send JSON response with CORS headers"""
        self.send_response(status_code)
        self.send_header('Content-Type', 'application/json')
        self.send_header('Access-Control-Allow-Origin', '*')
        self.send_header('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS')
        self.send_header('Access-Control-Allow-Headers', 'Content-Type, Authorization')
        self.end_headers()
        self.wfile.write(json.dumps(data).encode('utf-8'))
    
    def do_OPTIONS(self):
        """Handle CORS preflight requests"""
        self.send_response(200)
        self.send_header('Access-Control-Allow-Origin', '*')
        self.send_header('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS')
        self.send_header('Access-Control-Allow-Headers', 'Content-Type, Authorization')
        self.end_headers()
    def do_GET(self):
        parsed_path = urlparse(self.path)
        
        # Health check
        if parsed_path.path == '/api/health':
            self.send_json_response(200, {'status': 'healthy', 'service': 'workflow-api'})
            
        # Get current user info (requires auth)
        elif parsed_path.path == '/api/auth/me':
            user = self.require_auth()
            if user:
                self.send_json_response(200, {'user': user})
            
        # Get existing workflows
        elif parsed_path.path == '/api/analyze/workflows':
            workflows = [
                {'id': 1, 'name': 'Contract Review Workflow', 'status': 'active', 'fields': 15, 'created': '2024-01-15'},
                {'id': 2, 'name': 'NDA Analysis', 'status': 'active', 'fields': 12, 'created': '2024-01-10'},
                {'id': 3, 'name': 'Lease Agreement Review', 'status': 'pending', 'fields': 20, 'created': '2024-01-05'}
            ]
            self.send_json_response(200, workflows)
            
        # Get workflow session state
        elif re.match(r'^/api/analyze/workflows/create/(\w+)$', parsed_path.path):
            workflow_id = parsed_path.path.split('/')[-1]
            if workflow_id in workflow_sessions:
                self.send_json_response(200, workflow_sessions[workflow_id])
            else:
                self.send_json_response(404, {'error': 'Workflow session not found'})
                
        # Get workflow templates
        elif parsed_path.path == '/api/analyze/workflows/templates':
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
            self.send_json_response(200, templates)
            
        # Documents endpoint - return user's documents (requires auth)
        elif parsed_path.path == '/api/documents':
            user = self.get_current_user()
            if user:
                documents = db.get_documents(user['user_id'])
                self.send_json_response(200, documents)
            else:
                # Return 401 with a clear message for unauthenticated requests
                self.send_json_response(401, {
                    'error': 'Authentication required',
                    'message': 'Please log in to view your documents',
                    'requiresAuth': True
                })
            
        # Get saved workflows
        elif parsed_path.path == '/api/workflows/saved':
            self.send_json_response(200, saved_workflows)
            
        # Get fields for Field Discovery
        elif parsed_path.path == '/api/fields':
            # Parse query parameters
            query_params = parse_qs(parsed_path.query)
            search = query_params.get('search', [None])[0]
            tags = query_params.get('tags', [None])[0]
            region = query_params.get('region', [None])[0]
            limit = query_params.get('limit', [None])[0]
            offset = query_params.get('offset', [None])[0]
            
            # Convert string parameters to appropriate types
            try:
                limit = int(limit) if limit else None
                offset = int(offset) if offset else None
            except ValueError:
                limit = None
                offset = None
            
            fields = db.get_fields(
                search=search,
                tags=tags, 
                region=region,
                limit=limit,
                offset=offset
            )
            
            total_count = db.get_field_count()
            
            self.send_json_response(200, {
                'fields': fields,
                'total': total_count,
                'count': len(fields)
            })
            
        # Get document's workflows
        elif re.match(r'^/api/documents/([\w-]+)/workflows$', parsed_path.path):
            doc_id = parsed_path.path.split('/')[-2]
            doc = next((d for d in uploaded_documents if d['id'] == doc_id), None)
            if doc:
                self.send_json_response(200, {
                    'workflowIds': doc.get('workflows', []),
                    'workflowNames': doc.get('workflowNames', [])
                })
            else:
                self.send_json_response(404, {'error': 'Document not found'})
                
        # Get specific document metadata (requires auth)
        elif re.match(r'^/api/documents/([\w-]+)$', parsed_path.path):
            user = self.require_auth()
            if user:
                doc_id = parsed_path.path.split('/')[-1]
                doc = db.get_document(doc_id, user['user_id'])
                if doc:
                    self.send_json_response(200, doc)
                else:
                    self.send_json_response(404, {'error': 'Document not found'})
                
        # Get document content (PDF) (requires auth)
        elif re.match(r'^/api/documents/([\w-]+)/content$', parsed_path.path):
            user = self.require_auth()
            if user:
                doc_id = parsed_path.path.split('/')[-2]
                doc = db.get_document(doc_id, user['user_id'])
                if doc:
                    # For demo purposes, return a sample PDF
                    # In real implementation, this would serve the actual file from doc['file_path']
                    self.send_response(200)
                    self.send_header('Content-Type', 'application/pdf')
                    self.send_header('Content-Disposition', f'inline; filename="{doc["name"]}"')
                    self.send_header('Access-Control-Allow-Origin', '*')
                    self.end_headers()
                    # Return empty response - client will handle fallback
                    self.wfile.write(b'')
                else:
                    self.send_json_response(404, {'error': 'Document not found'})
                
        # Get document extracted terms (requires auth)
        elif re.match(r'^/api/documents/([\w-]+)/terms$', parsed_path.path):
            user = self.require_auth()
            if user:
                doc_id = parsed_path.path.split('/')[-2]
                doc = db.get_document(doc_id, user['user_id'])
                if doc:
                    # Return dummy extracted terms data
                    dummy_terms = {
                    'documentId': doc_id,
                    'extractedTerms': {
                        'Title': [
                            {'term': 'CREDIT AGREEMENT', 'page': 1, 'confidence': 0.95}
                        ],
                        'Parties': [
                            {'term': 'BUZZFEED MEDIA ENTERPRISES, INC. (Borrower Agent)', 'page': 1, 'confidence': 0.92},
                            {'term': 'AFTER KICKS, INC.', 'page': 1, 'confidence': 0.89}
                        ],
                        'Term and Termination': [
                            {'term': 'Initial Term: 5 years', 'page': 3, 'confidence': 0.88},
                            {'term': 'Auto-renewal: Yes, unless terminated', 'page': 3, 'confidence': 0.85}
                        ],
                        'Financial Terms': [
                            {'term': 'Credit Limit: $50,000,000', 'page': 5, 'confidence': 0.94},
                            {'term': 'Interest Rate: LIBOR + 2.5%', 'page': 6, 'confidence': 0.91}
                        ],
                        'Boilerplate Provisions': [
                            {'term': 'Governing Law: New York', 'page': 45, 'confidence': 0.96},
                            {'term': 'Assignment: Requires consent', 'page': 42, 'confidence': 0.87}
                        ]
                    },
                    'extractedAt': '2024-01-15T10:30:00Z'
                    }
                    self.send_json_response(200, dummy_terms)
                else:
                    self.send_json_response(404, {'error': 'Document not found'})
            
        else:
            self.send_json_response(404, {'error': 'Not Found', 'path': parsed_path.path})
    
    def do_POST(self):
        parsed_path = urlparse(self.path)
        
        # Authentication endpoints
        if parsed_path.path == '/api/auth/register':
            self.handle_register()
        elif parsed_path.path == '/api/auth/login':
            self.handle_login()
        elif parsed_path.path == '/api/auth/logout':
            self.handle_logout()
        
        # Handle file uploads (requires auth)
        elif parsed_path.path == '/api/documents/upload':
            user = self.require_auth()
            if not user:
                return
                
            content_type = self.headers.get('Content-Type', '')
            if 'multipart/form-data' in content_type:
                # Parse multipart form data
                form = cgi.FieldStorage(
                    fp=self.rfile,
                    headers=self.headers,
                    environ={'REQUEST_METHOD': 'POST'}
                )
                
                uploaded_files = []
                if 'files' in form:
                    files = form['files']
                    if not isinstance(files, list):
                        files = [files]
                    
                    for file_item in files:
                        if file_item.filename:
                            # Store file info in database
                            doc_id = str(uuid.uuid4())[:8]
                            file_size = len(file_item.value) if hasattr(file_item, 'value') else 0
                            file_type = file_item.filename.split('.')[-1].upper() if '.' in file_item.filename else 'Unknown'
                            
                            # Save to database
                            doc_info = db.create_document(
                                user_id=user['user_id'],
                                doc_id=doc_id,
                                name=file_item.filename,
                                filename=file_item.filename,
                                size=file_size,
                                doc_type=file_type,
                                file_path=f'/app/uploads/{doc_id}_{file_item.filename}'  # Future file path
                            )
                            
                            if doc_info:
                                uploaded_files.append({
                                    'id': doc_id,
                                    'name': file_item.filename,
                                    'success': True
                                })
                                
                                # In a real app, you would save the file here
                                # For now, we just store metadata
                
                self.send_json_response(200, {
                    'success': True,
                    'files': uploaded_files,
                    'message': f'{len(uploaded_files)} file(s) uploaded successfully'
                })
                return
            else:
                self.send_json_response(400, {'error': 'Invalid content type for file upload'})
                return
        
        # Regular JSON body handling for other endpoints
        content_length = int(self.headers.get('Content-Length', 0))
        post_data = self.rfile.read(content_length) if content_length > 0 else b'{}'
        
        try:
            request_body = json.loads(post_data.decode('utf-8')) if post_data else {}
        except json.JSONDecodeError:
            request_body = {}
        
        # Initialize new workflow session
        if parsed_path.path == '/api/analyze/workflows/create/init':
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
            self.send_json_response(201, {'workflowId': workflow_id, 'session': workflow_sessions[workflow_id]})
            
        # Step 1: Name
        elif re.match(r'^/api/analyze/workflows/create/(\w+)/name$', parsed_path.path):
            workflow_id = parsed_path.path.split('/')[-2]
            if workflow_id not in workflow_sessions:
                workflow_sessions[workflow_id] = self.create_new_session(workflow_id)
            
            workflow_sessions[workflow_id]['name'] = request_body.get('name', '')
            workflow_sessions[workflow_id]['currentStep'] = 2
            workflow_sessions[workflow_id]['updatedAt'] = datetime.now().isoformat()
            self.send_json_response(200, {'success': True, 'workflow': workflow_sessions[workflow_id]})
            
        # Step 2: Fields
        elif re.match(r'^/api/analyze/workflows/create/(\w+)/fields$', parsed_path.path):
            workflow_id = parsed_path.path.split('/')[-2]
            if workflow_id not in workflow_sessions:
                workflow_sessions[workflow_id] = self.create_new_session(workflow_id)
                
            workflow_sessions[workflow_id]['fields'] = request_body.get('fields', [])
            workflow_sessions[workflow_id]['currentStep'] = 3
            workflow_sessions[workflow_id]['updatedAt'] = datetime.now().isoformat()
            self.send_json_response(200, {'success': True, 'workflow': workflow_sessions[workflow_id]})
            
        # Step 3: Details (Document Types & Description)
        elif re.match(r'^/api/analyze/workflows/create/(\w+)/details$', parsed_path.path):
            workflow_id = parsed_path.path.split('/')[-2]
            if workflow_id not in workflow_sessions:
                workflow_sessions[workflow_id] = self.create_new_session(workflow_id)
                
            workflow_sessions[workflow_id]['description'] = request_body.get('description', '')
            workflow_sessions[workflow_id]['documentTypes'] = request_body.get('documentTypes', [])
            workflow_sessions[workflow_id]['currentStep'] = 4
            workflow_sessions[workflow_id]['updatedAt'] = datetime.now().isoformat()
            self.send_json_response(200, {'success': True, 'workflow': workflow_sessions[workflow_id]})
            
        # Step 4: Scoring
        elif re.match(r'^/api/analyze/workflows/create/(\w+)/scoring$', parsed_path.path):
            workflow_id = parsed_path.path.split('/')[-2]
            if workflow_id not in workflow_sessions:
                workflow_sessions[workflow_id] = self.create_new_session(workflow_id)
                
            workflow_sessions[workflow_id]['scoringProfiles'] = request_body.get('scoringProfiles', [])
            workflow_sessions[workflow_id]['currentStep'] = 5
            workflow_sessions[workflow_id]['updatedAt'] = datetime.now().isoformat()
            self.send_json_response(200, {'success': True, 'workflow': workflow_sessions[workflow_id]})
            
        # Step 5: Review & Save
        elif re.match(r'^/api/analyze/workflows/create/(\w+)/review$', parsed_path.path):
            workflow_id = parsed_path.path.split('/')[-2]
            if workflow_id not in workflow_sessions:
                self.send_json_response(404, {'error': 'Workflow session not found'})
                return
                
            # Mark workflow as completed
            workflow_sessions[workflow_id]['status'] = 'active'
            workflow_sessions[workflow_id]['updatedAt'] = datetime.now().isoformat()
            workflow_sessions[workflow_id]['completedAt'] = datetime.now().isoformat()
            
            # Save workflow to the saved workflows list
            saved_workflow = workflow_sessions[workflow_id].copy()
            saved_workflow['id'] = str(len(saved_workflows) + 1000)  # Generate a permanent ID
            
            # Add field count for display
            if 'fields' in saved_workflow:
                if isinstance(saved_workflow['fields'], dict):
                    saved_workflow['fieldCount'] = sum(len(fields) for fields in saved_workflow['fields'].values())
                elif isinstance(saved_workflow['fields'], list):
                    saved_workflow['fieldCount'] = len(saved_workflow['fields'])
                else:
                    saved_workflow['fieldCount'] = 0
            
            saved_workflows.append(saved_workflow)
            
            self.send_json_response(200, {
                'success': True, 
                'message': 'Workflow saved successfully',
                'workflow': saved_workflow
            })
            
        # Template-based creation
        elif re.match(r'^/api/analyze/workflows/create/(\w+)/template$', parsed_path.path):
            workflow_id = parsed_path.path.split('/')[-2]
            template_id = request_body.get('templateId')
            template_name = request_body.get('templateName', '')
            
            # Create workflow from template
            if 'm&a' in template_name.lower() or 'due diligence' in template_name.lower() or 'mergers' in template_name.lower():
                workflow_sessions[workflow_id] = {
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
                    'scoringProfiles': {
                        'Due Diligence Scoring': {
                            'Exclusivity': {'points': 1, 'condition': 'is found'},
                            'Non-Compete': {'points': 1, 'condition': 'is found'},
                            'Most Favored Nation': {'points': 1, 'condition': 'is found'},
                            'Non-Solicit': {'points': 1, 'condition': 'is found'}
                        },
                        'Assignment Restrictions': {
                            'Can the agreement be assigned?': [
                                {'answer': 'c) Assignable with consent', 'points': 1},
                                {'answer': 'd) Agreement terminable if assigned', 'points': 1},
                                {'answer': 'e) Assignable with payment of a fee', 'points': 1},
                                {'answer': 'f) Not assignable', 'points': 1}
                            ]
                        },
                        'Terminable for Convenience': {
                            'Can the agreement be terminated for convenience?': [
                                {'answer': 'a) Unconditionally terminable for convenience', 'points': 1},
                                {'answer': 'b) Terminable for convenience with prior notice', 'points': 1},
                                {'answer': 'c) Terminable for convenience with payment of termination fee', 'points': 1},
                                {'answer': 'd) Terminable for convenience after a specified time period', 'points': 1},
                                {'answer': 'e) Terminable for convenience with other limitations or conditions', 'points': 1}
                            ]
                        },
                        'Change of Control Restrictions': {
                            'What are the obligations and requirements resulting from a Change of Control?': [
                                {'answer': 'c) Change of control requires consent', 'points': 1},
                                {'answer': 'd) Change of control requires other obligations', 'points': 1},
                                {'answer': 'e) Agreement terminable on change of control', 'points': 1}
                            ]
                        }
                    },
                    'status': 'draft',
                    'currentStep': 5,
                    'templateId': template_id,
                    'createdAt': datetime.now().isoformat(),
                    'updatedAt': datetime.now().isoformat()
                }
            elif template_id == 'msa-review' or 'msa' in template_name.lower():
                workflow_sessions[workflow_id] = {
                    'id': workflow_id,
                    'name': 'MSA Review',
                    'fields': {
                        'Basic Information': ['Title', 'Parties', 'Date'],
                        'Terms': ['Term', 'Termination', 'Payment Terms', 'Liability']
                    },
                    'description': 'Review Master Service Agreements for key terms',
                    'documentTypes': ['Master Service Agreement', 'MSA', 'Service Agreement'],
                    'scoringProfiles': {},
                    'status': 'draft',
                    'currentStep': 5,
                    'templateId': template_id,
                    'createdAt': datetime.now().isoformat(),
                    'updatedAt': datetime.now().isoformat()
                }
            elif template_id == 'nda-mutual' or 'nda' in template_name.lower():
                workflow_sessions[workflow_id] = {
                    'id': workflow_id,
                    'name': 'Mutual NDA Standard Review',
                    'fields': {
                        'Basic Information': ['Title', 'Parties', 'Date'],
                        'Confidentiality': ['Confidential Information', 'Term', 'Exceptions']
                    },
                    'description': 'Review mutual non-disclosure agreements',
                    'documentTypes': ['NDA', 'Non-Disclosure Agreement', 'Confidentiality Agreement'],
                    'scoringProfiles': {},
                    'status': 'draft',
                    'currentStep': 5,
                    'templateId': template_id,
                    'createdAt': datetime.now().isoformat(),
                    'updatedAt': datetime.now().isoformat()
                }
            elif 'leaselens' in template_name.lower() or 'short form' in template_name.lower():
                # LeaseLens - Short Form template
                workflow_sessions[workflow_id] = {
                    'id': workflow_id,
                    'name': 'LeaseLens - Short Form',
                    'fields': {
                        'Basic Information': ['Title', 'Parties', 'Date', 'Guarantor'],
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
                            'Renewal — Lease'
                        ],
                        'Use of Property': [
                            'Use of Premises',
                            'Parking',
                            'Description of Premises',
                            'Utilities'
                        ],
                        'Rent and Expenses': [
                            'Base Rent',
                            'Additional Rent',
                            'Rent Payment Date',
                            'Late Payment and Grace Period',
                            'Security Deposit/Letters of Credit',
                            '"Operating Expenses"/"Common Area Maintenance" Definition'
                        ],
                        'Boilerplate Provisions': [
                            'Notice'
                        ]
                    },
                    'description': 'Best suited for understanding the basic information in a North American lease.',
                    'documentTypes': ['Real Estate Agt'],
                    'scoringProfiles': {},
                    'status': 'draft',
                    'currentStep': 5,
                    'templateId': template_id,
                    'createdAt': datetime.now().isoformat(),
                    'updatedAt': datetime.now().isoformat()
                }
            elif 'lease' in template_name.lower():
                workflow_sessions[workflow_id] = {
                    'id': workflow_id,
                    'name': 'Commercial Lease Agreement Review',
                    'fields': {
                        'Basic Information': ['Title', 'Parties', 'Date'],
                        'Property Details': ['Property Description', 'Rent', 'Term', 'Renewal Options']
                    },
                    'description': 'Review commercial real estate leases',
                    'documentTypes': ['Lease Agreement', 'Commercial Lease', 'Rental Agreement'],
                    'scoringProfiles': {},
                    'status': 'draft',
                    'currentStep': 5,
                    'templateId': template_id,
                    'createdAt': datetime.now().isoformat(),
                    'updatedAt': datetime.now().isoformat()
                }
            else:
                # Default template - M&A for any unmatched
                workflow_sessions[workflow_id] = {
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
                    'templateId': template_id,
                    'createdAt': datetime.now().isoformat(),
                    'updatedAt': datetime.now().isoformat()
                }
                
            self.send_json_response(200, {'success': True, 'workflow': workflow_sessions[workflow_id]})
            
        # Assign workflows to document
        elif re.match(r'^/api/documents/([\w-]+)/workflows$', parsed_path.path):
            doc_id = parsed_path.path.split('/')[-2]
            doc = next((d for d in uploaded_documents if d['id'] == doc_id), None)
            if doc:
                doc['workflows'] = request_body.get('workflowIds', [])
                doc['workflowNames'] = request_body.get('workflowNames', [])
                self.send_json_response(200, {'success': True, 'message': 'Workflows assigned successfully'})
            else:
                self.send_json_response(404, {'error': 'Document not found'})
            
        else:
            self.send_json_response(404, {'error': 'Not Found', 'path': parsed_path.path})
    
    def do_DELETE(self):
        parsed_path = urlparse(self.path)
        
        # Delete document
        if re.match(r'^/api/documents/(\w+)$', parsed_path.path):
            doc_id = parsed_path.path.split('/')[-1]
            global uploaded_documents
            original_count = len(uploaded_documents)
            uploaded_documents = [doc for doc in uploaded_documents if doc['id'] != doc_id]
            if len(uploaded_documents) < original_count:
                self.send_json_response(200, {'success': True, 'message': 'Document deleted'})
            else:
                self.send_json_response(404, {'error': 'Document not found'})
        # Delete workflow session
        elif re.match(r'^/api/analyze/workflows/create/(\w+)$', parsed_path.path):
            workflow_id = parsed_path.path.split('/')[-1]
            if workflow_id in workflow_sessions:
                del workflow_sessions[workflow_id]
                self.send_json_response(200, {'success': True, 'message': 'Workflow session deleted'})
            else:
                self.send_json_response(404, {'error': 'Workflow session not found'})
        # Delete saved workflow
        elif re.match(r'^/api/workflows/saved/(\w+)$', parsed_path.path):
            workflow_id = parsed_path.path.split('/')[-1]
            global saved_workflows
            original_count = len(saved_workflows)
            saved_workflows = [wf for wf in saved_workflows if wf['id'] != workflow_id]
            if len(saved_workflows) < original_count:
                self.send_json_response(200, {'success': True, 'message': 'Workflow deleted'})
            else:
                self.send_json_response(404, {'error': 'Saved workflow not found'})
        else:
            self.send_json_response(404, {'error': 'Not Found', 'path': parsed_path.path})
    
    
    def create_new_session(self, workflow_id):
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
    
    
    def handle_register(self):
        """Handle user registration"""
        try:
            content_length = int(self.headers.get('Content-Length', 0))
            post_data = self.rfile.read(content_length) if content_length > 0 else b'{}'
            request_body = json.loads(post_data.decode('utf-8')) if post_data else {}
            
            username = request_body.get('username', '').strip()
            email = request_body.get('email', '').strip()
            password = request_body.get('password', '')
            
            # Validation
            if not username or len(username) < 3:
                self.send_json_response(400, {'error': 'Username must be at least 3 characters'})
                return
                
            if not email or '@' not in email:
                self.send_json_response(400, {'error': 'Valid email is required'})
                return
                
            if not password or len(password) < 6:
                self.send_json_response(400, {'error': 'Password must be at least 6 characters'})
                return
            
            # Create user
            user = db.create_user(username, email, password)
            if user:
                # Create session
                session_token = db.create_session(user['id'])
                self.send_json_response(201, {
                    'success': True,
                    'message': 'User created successfully',
                    'user': user,
                    'token': session_token
                })
            else:
                self.send_json_response(500, {'error': 'Failed to create user'})
                
        except ValueError as e:
            self.send_json_response(400, {'error': str(e)})
        except Exception as e:
            print(f"Registration error: {e}")
            self.send_json_response(500, {'error': 'Registration failed'})

    def handle_login(self):
        """Handle user login"""
        try:
            content_length = int(self.headers.get('Content-Length', 0))
            post_data = self.rfile.read(content_length) if content_length > 0 else b'{}'
            
            try:
                request_body = json.loads(post_data.decode('utf-8')) if post_data else {}
            except json.JSONDecodeError:
                print("Login error: Invalid JSON in request body")
                self.send_json_response(400, {'error': 'Invalid JSON format'})
                return
            
            username = request_body.get('username', '').strip()
            password = request_body.get('password', '')
            
            print(f"Login attempt for username: {username}")
            
            if not username or not password:
                print("Login error: Missing username or password")
                self.send_json_response(400, {'error': 'Username and password are required'})
                return
            
            # Authenticate user
            user = db.authenticate_user(username, password)
            if user:
                # Create session
                session_token = db.create_session(user['id'])
                if session_token:
                    print(f"Login successful for user: {username}")
                    self.send_json_response(200, {
                        'success': True,
                        'message': 'Login successful',
                        'user': user,
                        'token': session_token
                    })
                else:
                    print(f"Session creation failed for user: {username}")
                    self.send_json_response(500, {'error': 'Failed to create session'})
            else:
                print(f"Authentication failed for user: {username}")
                self.send_json_response(401, {'error': 'Invalid username or password'})
                
        except Exception as e:
            print(f"Login error: {e}")
            import traceback
            traceback.print_exc()
            self.send_json_response(500, {'error': 'Login failed - server error'})

    def handle_logout(self):
        """Handle user logout"""
        try:
            user = self.get_current_user()
            if user:
                # Get token from header
                auth_header = self.headers.get('Authorization')
                if auth_header and auth_header.startswith('Bearer '):
                    token = auth_header.split(' ')[1]
                    db.delete_session(token)
                    
                self.send_json_response(200, {
                    'success': True,
                    'message': 'Logout successful'
                })
            else:
                self.send_json_response(401, {'error': 'Not authenticated'})
                
        except Exception as e:
            print(f"Logout error: {e}")
            self.send_json_response(500, {'error': 'Logout failed'})
    
    def log_message(self, format, *args):
        print(f"[{self.address_string()}] {format % args}")

if __name__ == '__main__':
    with HTTPServer((HOST, PORT), WorkflowAPIHandler) as httpd:
        print(f"""
========================================
Workflow API Server Running
========================================
Server is listening at:
  http://localhost:{PORT}/
  http://0.0.0.0:{PORT}/

Workflow Creation Endpoints:
  POST /api/analyze/workflows/create/init           - Initialize new workflow
  POST /api/analyze/workflows/create/{id}/name      - Step 1: Set name
  POST /api/analyze/workflows/create/{id}/fields    - Step 2: Select fields
  POST /api/analyze/workflows/create/{id}/details   - Step 3: Set details
  POST /api/analyze/workflows/create/{id}/scoring   - Step 4: Configure scoring
  POST /api/analyze/workflows/create/{id}/review    - Step 5: Review & save
  POST /api/analyze/workflows/create/{id}/template  - Create from template
  GET  /api/analyze/workflows/create/{id}           - Get workflow session
  DELETE /api/analyze/workflows/create/{id}         - Cancel workflow

Other Endpoints:
  GET /api/health                    - Health check
  GET /api/analyze/workflows          - List workflows
  GET /api/analyze/workflows/templates - List templates
  GET /api/documents                  - List documents

Press Ctrl+C to stop the server
========================================
        """)
        httpd.serve_forever()