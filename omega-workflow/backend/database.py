#!/usr/bin/env python3
import sqlite3
import os
import json
import hashlib
import secrets
from datetime import datetime, timedelta
import bcrypt

DATABASE_PATH = os.environ.get('DATABASE_PATH', '/app/database/omega.db')

class Database:
    def __init__(self):
        self.db_path = DATABASE_PATH
        # Ensure database directory exists
        os.makedirs(os.path.dirname(self.db_path), exist_ok=True)
        self.init_database()

    def get_connection(self):
        """Get database connection with proper row factory"""
        conn = sqlite3.connect(self.db_path)
        conn.row_factory = sqlite3.Row
        return conn

    def init_database(self):
        """Initialize database with required tables"""
        conn = self.get_connection()
        try:
            # Users table
            conn.execute('''
                CREATE TABLE IF NOT EXISTS users (
                    id INTEGER PRIMARY KEY AUTOINCREMENT,
                    username VARCHAR(50) UNIQUE NOT NULL,
                    email VARCHAR(100) UNIQUE NOT NULL,
                    password_hash VARCHAR(255) NOT NULL,
                    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                    last_login TIMESTAMP
                )
            ''')

            # Documents table
            conn.execute('''
                CREATE TABLE IF NOT EXISTS documents (
                    id VARCHAR(50) PRIMARY KEY,
                    user_id INTEGER NOT NULL,
                    name VARCHAR(255) NOT NULL,
                    filename VARCHAR(255) NOT NULL,
                    size INTEGER,
                    type VARCHAR(50),
                    file_path VARCHAR(500),
                    uploaded_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                    FOREIGN KEY (user_id) REFERENCES users (id)
                )
            ''')

            # User sessions table
            conn.execute('''
                CREATE TABLE IF NOT EXISTS user_sessions (
                    id VARCHAR(100) PRIMARY KEY,
                    user_id INTEGER NOT NULL,
                    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                    expires_at TIMESTAMP NOT NULL,
                    FOREIGN KEY (user_id) REFERENCES users (id)
                )
            ''')

            # Workflows table
            conn.execute('''
                CREATE TABLE IF NOT EXISTS workflows (
                    id INTEGER PRIMARY KEY AUTOINCREMENT,
                    user_id INTEGER NOT NULL,
                    name VARCHAR(255) NOT NULL,
                    description TEXT,
                    fields TEXT,
                    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                    FOREIGN KEY (user_id) REFERENCES users (id)
                )
            ''')

            # Document workflows mapping table
            conn.execute('''
                CREATE TABLE IF NOT EXISTS document_workflows (
                    id INTEGER PRIMARY KEY AUTOINCREMENT,
                    document_id VARCHAR(50) NOT NULL,
                    workflow_id INTEGER NOT NULL,
                    assigned_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                    FOREIGN KEY (document_id) REFERENCES documents (id),
                    FOREIGN KEY (workflow_id) REFERENCES workflows (id)
                )
            ''')

            # Fields table for storing field discovery information
            conn.execute('''
                CREATE TABLE IF NOT EXISTS fields (
                    field_id VARCHAR(100) PRIMARY KEY,
                    name VARCHAR(255) NOT NULL,
                    description TEXT,
                    type VARCHAR(50),
                    region VARCHAR(100),
                    custom BOOLEAN DEFAULT FALSE,
                    created_at TIMESTAMP,
                    last_updated TIMESTAMP,
                    tags TEXT,
                    languages TEXT,
                    document_types TEXT,
                    jurisdictions TEXT,
                    imported_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
                )
            ''')

            conn.commit()
            
            # Create default admin user if no users exist
            self.create_default_user()
            
        except Exception as e:
            print(f"Database initialization error: {e}")
            conn.rollback()
        finally:
            conn.close()

    def create_default_user(self):
        """Create default admin user if no users exist"""
        conn = self.get_connection()
        try:
            cursor = conn.execute("SELECT COUNT(*) as count FROM users")
            user_count = cursor.fetchone()['count']
            
            if user_count == 0:
                # Create default admin user
                admin_password = "admin123"  # In production, use a secure default
                password_hash = bcrypt.hashpw(admin_password.encode('utf-8'), bcrypt.gensalt())
                
                conn.execute('''
                    INSERT INTO users (username, email, password_hash)
                    VALUES (?, ?, ?)
                ''', ("admin", "admin@omega.com", password_hash.decode('utf-8')))
                
                conn.commit()
                print("Default admin user created: admin / admin123")
                
        except Exception as e:
            print(f"Error creating default user: {e}")
            conn.rollback()
        finally:
            conn.close()

    # User management methods
    def create_user(self, username, email, password):
        """Create a new user"""
        conn = self.get_connection()
        try:
            # Hash password
            password_hash = bcrypt.hashpw(password.encode('utf-8'), bcrypt.gensalt())
            
            cursor = conn.execute('''
                INSERT INTO users (username, email, password_hash)
                VALUES (?, ?, ?)
            ''', (username, email, password_hash.decode('utf-8')))
            
            user_id = cursor.lastrowid
            conn.commit()
            
            # Return user info (without password)
            return self.get_user_by_id(user_id)
            
        except sqlite3.IntegrityError as e:
            conn.rollback()
            if "username" in str(e):
                raise ValueError("Username already exists")
            elif "email" in str(e):
                raise ValueError("Email already exists")
            else:
                raise ValueError("User creation failed")
        except Exception as e:
            conn.rollback()
            raise ValueError(f"User creation failed: {e}")
        finally:
            conn.close()

    def authenticate_user(self, username, password):
        """Authenticate user and return user info if valid"""
        conn = self.get_connection()
        try:
            cursor = conn.execute('''
                SELECT id, username, email, password_hash
                FROM users 
                WHERE username = ? OR email = ?
            ''', (username, username))
            
            user = cursor.fetchone()
            if not user:
                return None
                
            # Check password
            if bcrypt.checkpw(password.encode('utf-8'), user['password_hash'].encode('utf-8')):
                # Update last login
                conn.execute('''
                    UPDATE users SET last_login = CURRENT_TIMESTAMP
                    WHERE id = ?
                ''', (user['id'],))
                conn.commit()
                
                # Return user info (without password)
                return {
                    'id': user['id'],
                    'username': user['username'],
                    'email': user['email']
                }
            
            return None
            
        except Exception as e:
            print(f"Authentication error: {e}")
            return None
        finally:
            conn.close()

    def get_user_by_id(self, user_id):
        """Get user by ID"""
        conn = self.get_connection()
        try:
            cursor = conn.execute('''
                SELECT id, username, email, created_at, last_login
                FROM users 
                WHERE id = ?
            ''', (user_id,))
            
            user = cursor.fetchone()
            if user:
                return dict(user)
            return None
            
        except Exception as e:
            print(f"Error fetching user: {e}")
            return None
        finally:
            conn.close()

    # Session management methods
    def create_session(self, user_id):
        """Create a new session for user"""
        conn = self.get_connection()
        try:
            session_id = secrets.token_urlsafe(32)
            expires_at = datetime.now() + timedelta(days=7)  # 7 days expiry
            
            conn.execute('''
                INSERT INTO user_sessions (id, user_id, expires_at)
                VALUES (?, ?, ?)
            ''', (session_id, user_id, expires_at))
            
            conn.commit()
            return session_id
            
        except Exception as e:
            print(f"Session creation error: {e}")
            conn.rollback()
            return None
        finally:
            conn.close()

    def validate_session(self, session_id):
        """Validate session and return user info if valid"""
        conn = self.get_connection()
        try:
            cursor = conn.execute('''
                SELECT s.user_id, u.username, u.email
                FROM user_sessions s
                JOIN users u ON s.user_id = u.id
                WHERE s.id = ? AND s.expires_at > CURRENT_TIMESTAMP
            ''', (session_id,))
            
            session = cursor.fetchone()
            if session:
                return {
                    'user_id': session['user_id'],
                    'username': session['username'],
                    'email': session['email']
                }
            return None
            
        except Exception as e:
            print(f"Session validation error: {e}")
            return None
        finally:
            conn.close()

    def delete_session(self, session_id):
        """Delete a session (logout)"""
        conn = self.get_connection()
        try:
            conn.execute('DELETE FROM user_sessions WHERE id = ?', (session_id,))
            conn.commit()
            return True
        except Exception as e:
            print(f"Session deletion error: {e}")
            return False
        finally:
            conn.close()

    def cleanup_expired_sessions(self):
        """Clean up expired sessions"""
        conn = self.get_connection()
        try:
            cursor = conn.execute('''
                DELETE FROM user_sessions 
                WHERE expires_at < CURRENT_TIMESTAMP
            ''')
            deleted_count = cursor.rowcount
            conn.commit()
            return deleted_count
        except Exception as e:
            print(f"Session cleanup error: {e}")
            return 0
        finally:
            conn.close()

    # Document management methods
    def create_document(self, user_id, doc_id, name, filename, size, doc_type, file_path):
        """Create a new document record"""
        conn = self.get_connection()
        try:
            conn.execute('''
                INSERT INTO documents (id, user_id, name, filename, size, type, file_path)
                VALUES (?, ?, ?, ?, ?, ?, ?)
            ''', (doc_id, user_id, name, filename, size, doc_type, file_path))
            
            conn.commit()
            return self.get_document(doc_id, user_id)
            
        except Exception as e:
            print(f"Document creation error: {e}")
            conn.rollback()
            return None
        finally:
            conn.close()

    def get_documents(self, user_id):
        """Get all documents for a user"""
        conn = self.get_connection()
        try:
            cursor = conn.execute('''
                SELECT d.*, 
                       GROUP_CONCAT(w.name) as workflow_names
                FROM documents d
                LEFT JOIN document_workflows dw ON d.id = dw.document_id
                LEFT JOIN workflows w ON dw.workflow_id = w.id
                WHERE d.user_id = ?
                GROUP BY d.id
                ORDER BY d.uploaded_at DESC
            ''', (user_id,))
            
            documents = []
            for row in cursor.fetchall():
                doc = dict(row)
                doc['workflowNames'] = row['workflow_names'].split(',') if row['workflow_names'] else []
                documents.append(doc)
            
            return documents
            
        except Exception as e:
            print(f"Error fetching documents: {e}")
            return []
        finally:
            conn.close()

    def get_document(self, doc_id, user_id):
        """Get a specific document"""
        conn = self.get_connection()
        try:
            cursor = conn.execute('''
                SELECT * FROM documents 
                WHERE id = ? AND user_id = ?
            ''', (doc_id, user_id))
            
            document = cursor.fetchone()
            if document:
                return dict(document)
            return None
            
        except Exception as e:
            print(f"Error fetching document: {e}")
            return None
        finally:
            conn.close()

    def delete_document(self, doc_id, user_id):
        """Delete a document"""
        conn = self.get_connection()
        try:
            # Delete workflow associations first
            conn.execute('DELETE FROM document_workflows WHERE document_id = ?', (doc_id,))
            
            # Delete document
            cursor = conn.execute('''
                DELETE FROM documents 
                WHERE id = ? AND user_id = ?
            ''', (doc_id, user_id))
            
            deleted = cursor.rowcount > 0
            conn.commit()
            return deleted
            
        except Exception as e:
            print(f"Document deletion error: {e}")
            conn.rollback()
            return False
        finally:
            conn.close()

    # Workflow management methods
    def create_workflow(self, user_id, name, description, fields):
        """Create a new workflow"""
        conn = self.get_connection()
        try:
            cursor = conn.execute('''
                INSERT INTO workflows (user_id, name, description, fields)
                VALUES (?, ?, ?, ?)
            ''', (user_id, name, description, json.dumps(fields)))
            
            workflow_id = cursor.lastrowid
            conn.commit()
            return self.get_workflow(workflow_id, user_id)
            
        except Exception as e:
            print(f"Workflow creation error: {e}")
            conn.rollback()
            return None
        finally:
            conn.close()

    def get_workflows(self, user_id):
        """Get all workflows for a user"""
        conn = self.get_connection()
        try:
            cursor = conn.execute('''
                SELECT * FROM workflows 
                WHERE user_id = ?
                ORDER BY created_at DESC
            ''', (user_id,))
            
            workflows = []
            for row in cursor.fetchall():
                workflow = dict(row)
                workflow['fields'] = json.loads(workflow['fields']) if workflow['fields'] else []
                workflows.append(workflow)
            
            return workflows
            
        except Exception as e:
            print(f"Error fetching workflows: {e}")
            return []
        finally:
            conn.close()

    def get_workflow(self, workflow_id, user_id):
        """Get a specific workflow"""
        conn = self.get_connection()
        try:
            cursor = conn.execute('''
                SELECT * FROM workflows 
                WHERE id = ? AND user_id = ?
            ''', (workflow_id, user_id))
            
            workflow = cursor.fetchone()
            if workflow:
                result = dict(workflow)
                result['fields'] = json.loads(result['fields']) if result['fields'] else []
                return result
            return None
            
        except Exception as e:
            print(f"Error fetching workflow: {e}")
            return None
        finally:
            conn.close()

    # Field management methods
    def create_field(self, field_data):
        """Create a new field record"""
        conn = self.get_connection()
        try:
            conn.execute('''
                INSERT INTO fields (
                    field_id, name, description, type, region, custom, 
                    created_at, last_updated, tags, languages, 
                    document_types, jurisdictions
                ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
            ''', (
                field_data.get('field_id'),
                field_data.get('name'),
                field_data.get('description'),
                field_data.get('type'),
                field_data.get('region'),
                field_data.get('custom', False),
                field_data.get('created'),
                field_data.get('last_updated'),
                json.dumps(field_data.get('tags', [])),
                json.dumps(field_data.get('languages', [])),
                json.dumps(field_data.get('document_types', [])),
                json.dumps(field_data.get('jurisdictions', []))
            ))
            
            conn.commit()
            return True
            
        except Exception as e:
            print(f"Field creation error: {e}")
            conn.rollback()
            return False
        finally:
            conn.close()

    def get_fields(self, search=None, tags=None, region=None, limit=None, offset=None):
        """Get fields with optional search and filtering"""
        conn = self.get_connection()
        try:
            query = 'SELECT * FROM fields WHERE 1=1'
            params = []
            
            if search:
                query += ' AND (name LIKE ? OR description LIKE ?)'
                search_term = f'%{search}%'
                params.extend([search_term, search_term])
            
            if tags:
                query += ' AND tags LIKE ?'
                params.append(f'%{tags}%')
            
            if region:
                query += ' AND region = ?'
                params.append(region)
            
            query += ' ORDER BY name'
            
            if limit:
                query += ' LIMIT ?'
                params.append(limit)
                if offset:
                    query += ' OFFSET ?'
                    params.append(offset)
            
            cursor = conn.execute(query, params)
            fields = []
            
            for row in cursor.fetchall():
                field = dict(row)
                # Parse JSON fields
                for json_field in ['tags', 'languages', 'document_types', 'jurisdictions']:
                    if field[json_field]:
                        try:
                            field[json_field] = json.loads(field[json_field])
                        except json.JSONDecodeError:
                            field[json_field] = []
                    else:
                        field[json_field] = []
                fields.append(field)
            
            return fields
            
        except Exception as e:
            print(f"Error fetching fields: {e}")
            return []
        finally:
            conn.close()

    def get_field_count(self):
        """Get total number of fields in database"""
        conn = self.get_connection()
        try:
            cursor = conn.execute('SELECT COUNT(*) as count FROM fields')
            result = cursor.fetchone()
            return result['count'] if result else 0
        except Exception as e:
            print(f"Error getting field count: {e}")
            return 0
        finally:
            conn.close()

    def clear_fields(self):
        """Clear all fields (for reimporting)"""
        conn = self.get_connection()
        try:
            conn.execute('DELETE FROM fields')
            conn.commit()
            return True
        except Exception as e:
            print(f"Error clearing fields: {e}")
            conn.rollback()
            return False
        finally:
            conn.close()

# Global database instance
db = Database()