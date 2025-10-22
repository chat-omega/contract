#!/usr/bin/env python3
"""
Async Database Layer for Omega Workflow Application
Modern async SQLite implementation using aiosqlite
"""

import aiosqlite
import asyncio
import os
import json
import hashlib
from datetime import datetime
from typing import Optional, List, Dict, Any
from pathlib import Path

class AsyncDatabase:
    def __init__(self, db_path: str = "/app/database/omega.db"):
        self.db_path = db_path
        self.db_dir = Path(db_path).parent
        
        # Ensure database directory exists
        self.db_dir.mkdir(parents=True, exist_ok=True)
        
        # Initialize database on startup
        asyncio.create_task(self.init_database())
    
    async def init_database(self):
        """Initialize database tables"""
        async with aiosqlite.connect(self.db_path) as db:
            # Enable foreign keys
            await db.execute("PRAGMA foreign_keys = ON")
            
            # Users table
            await db.execute("""
                CREATE TABLE IF NOT EXISTS users (
                    id INTEGER PRIMARY KEY AUTOINCREMENT,
                    username TEXT UNIQUE NOT NULL,
                    email TEXT UNIQUE NOT NULL,
                    password_hash TEXT NOT NULL,
                    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
                )
            """)
            
            # Documents table
            await db.execute("""
                CREATE TABLE IF NOT EXISTS documents (
                    id TEXT PRIMARY KEY,
                    user_id INTEGER NOT NULL,
                    name TEXT NOT NULL,
                    filename TEXT NOT NULL,
                    size INTEGER NOT NULL,
                    doc_type TEXT NOT NULL,
                    file_path TEXT NOT NULL,
                    upload_date TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                    FOREIGN KEY (user_id) REFERENCES users (id) ON DELETE CASCADE
                )
            """)
            
            # Document terms table (for future term extraction)
            await db.execute("""
                CREATE TABLE IF NOT EXISTS document_terms (
                    id INTEGER PRIMARY KEY AUTOINCREMENT,
                    document_id TEXT NOT NULL,
                    term_name TEXT NOT NULL,
                    term_value TEXT,
                    category TEXT,
                    confidence REAL,
                    extracted_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                    FOREIGN KEY (document_id) REFERENCES documents (id) ON DELETE CASCADE
                )
            """)
            
            # Workflows table (for future workflow management)
            await db.execute("""
                CREATE TABLE IF NOT EXISTS workflows (
                    id INTEGER PRIMARY KEY AUTOINCREMENT,
                    user_id INTEGER NOT NULL,
                    name TEXT NOT NULL,
                    description TEXT,
                    fields TEXT,  -- JSON string
                    document_types TEXT,  -- JSON string
                    status TEXT DEFAULT 'draft',
                    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                    FOREIGN KEY (user_id) REFERENCES users (id) ON DELETE CASCADE
                )
            """)

            # Document workflows association table
            await db.execute("""
                CREATE TABLE IF NOT EXISTS document_workflows (
                    id INTEGER PRIMARY KEY AUTOINCREMENT,
                    document_id TEXT NOT NULL,
                    workflow_id INTEGER NOT NULL,
                    assigned_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                    FOREIGN KEY (document_id) REFERENCES documents (id) ON DELETE CASCADE,
                    UNIQUE(document_id, workflow_id)
                )
            """)

            # Fields table for storing field discovery information
            await db.execute("""
                CREATE TABLE IF NOT EXISTS fields (
                    field_id TEXT PRIMARY KEY,
                    name TEXT NOT NULL,
                    description TEXT,
                    type TEXT,
                    region TEXT,
                    custom INTEGER DEFAULT 0,
                    created_at TIMESTAMP,
                    last_updated TIMESTAMP,
                    tags TEXT,
                    languages TEXT,
                    document_types TEXT,
                    jurisdictions TEXT,
                    imported_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
                )
            """)

            # Extractions table for storing Zuva API extraction results
            await db.execute("""
                CREATE TABLE IF NOT EXISTS extractions (
                    id INTEGER PRIMARY KEY AUTOINCREMENT,
                    document_id TEXT NOT NULL,
                    workflow_id INTEGER NOT NULL,
                    zuva_file_id TEXT,
                    zuva_request_id TEXT,
                    status TEXT DEFAULT 'pending',
                    results TEXT,
                    answer_metadata TEXT,
                    error_message TEXT,
                    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                    started_at TIMESTAMP,
                    completed_at TIMESTAMP,
                    FOREIGN KEY (document_id) REFERENCES documents (id) ON DELETE CASCADE,
                    UNIQUE(document_id, workflow_id)
                )
            """)

            # Document type categories table
            await db.execute("""
                CREATE TABLE IF NOT EXISTS document_categories (
                    id INTEGER PRIMARY KEY AUTOINCREMENT,
                    name TEXT UNIQUE NOT NULL,
                    display_order INTEGER,
                    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
                )
            """)

            # Individual document types table
            await db.execute("""
                CREATE TABLE IF NOT EXISTS document_types (
                    id INTEGER PRIMARY KEY AUTOINCREMENT,
                    category_id INTEGER NOT NULL,
                    name TEXT NOT NULL,
                    display_order INTEGER,
                    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                    FOREIGN KEY (category_id) REFERENCES document_categories (id) ON DELETE CASCADE,
                    UNIQUE(category_id, name)
                )
            """)

            # Create indexes for better performance
            await db.execute("CREATE INDEX IF NOT EXISTS idx_documents_user_id ON documents(user_id)")
            await db.execute("CREATE INDEX IF NOT EXISTS idx_documents_upload_date ON documents(upload_date)")
            await db.execute("CREATE INDEX IF NOT EXISTS idx_document_terms_document_id ON document_terms(document_id)")
            await db.execute("CREATE INDEX IF NOT EXISTS idx_workflows_user_id ON workflows(user_id)")
            await db.execute("CREATE INDEX IF NOT EXISTS idx_document_workflows_document_id ON document_workflows(document_id)")
            await db.execute("CREATE INDEX IF NOT EXISTS idx_document_workflows_workflow_id ON document_workflows(workflow_id)")
            await db.execute("CREATE INDEX IF NOT EXISTS idx_fields_name ON fields(name)")
            await db.execute("CREATE INDEX IF NOT EXISTS idx_fields_region ON fields(region)")
            await db.execute("CREATE INDEX IF NOT EXISTS idx_extractions_document_id ON extractions(document_id)")
            await db.execute("CREATE INDEX IF NOT EXISTS idx_extractions_workflow_id ON extractions(workflow_id)")
            await db.execute("CREATE INDEX IF NOT EXISTS idx_extractions_status ON extractions(status)")
            await db.execute("CREATE INDEX IF NOT EXISTS idx_document_types_category ON document_types(category_id)")

            await db.commit()
            print("✅ Database initialized successfully")
    
    # User management methods
    async def create_user(self, username: str, email: str, password_hash: str) -> Optional[Dict[str, Any]]:
        """Create a new user"""
        try:
            async with aiosqlite.connect(self.db_path) as db:
                cursor = await db.execute("""
                    INSERT INTO users (username, email, password_hash)
                    VALUES (?, ?, ?)
                """, (username, email, password_hash))
                
                await db.commit()
                user_id = cursor.lastrowid
                
                # Return the created user
                return await self.get_user_by_id(user_id)
                
        except Exception as e:
            print(f"❌ Error creating user: {e}")
            return None
    
    async def get_user_by_id(self, user_id: int) -> Optional[Dict[str, Any]]:
        """Get user by ID"""
        try:
            async with aiosqlite.connect(self.db_path) as db:
                db.row_factory = aiosqlite.Row
                cursor = await db.execute("""
                    SELECT id, username, email, password_hash, created_at, updated_at
                    FROM users WHERE id = ?
                """, (user_id,))
                
                row = await cursor.fetchone()
                if row:
                    return dict(row)
                return None
                
        except Exception as e:
            print(f"❌ Error getting user by ID: {e}")
            return None
    
    async def get_user_by_username(self, username: str) -> Optional[Dict[str, Any]]:
        """Get user by username"""
        try:
            async with aiosqlite.connect(self.db_path) as db:
                db.row_factory = aiosqlite.Row
                cursor = await db.execute("""
                    SELECT id, username, email, password_hash, created_at, updated_at
                    FROM users WHERE username = ?
                """, (username,))
                
                row = await cursor.fetchone()
                if row:
                    return dict(row)
                return None
                
        except Exception as e:
            print(f"❌ Error getting user by username: {e}")
            return None
    
    async def get_user_by_email(self, email: str) -> Optional[Dict[str, Any]]:
        """Get user by email"""
        try:
            async with aiosqlite.connect(self.db_path) as db:
                db.row_factory = aiosqlite.Row
                cursor = await db.execute("""
                    SELECT id, username, email, password_hash, created_at, updated_at
                    FROM users WHERE email = ?
                """, (email,))
                
                row = await cursor.fetchone()
                if row:
                    return dict(row)
                return None
                
        except Exception as e:
            print(f"❌ Error getting user by email: {e}")
            return None
    
    # Document management methods
    async def create_document(self, user_id: int, doc_id: str, name: str, filename: str, 
                            size: int, doc_type: str, file_path: str) -> Optional[Dict[str, Any]]:
        """Create a new document record"""
        try:
            async with aiosqlite.connect(self.db_path) as db:
                await db.execute("""
                    INSERT INTO documents (id, user_id, name, filename, size, doc_type, file_path)
                    VALUES (?, ?, ?, ?, ?, ?, ?)
                """, (doc_id, user_id, name, filename, size, doc_type, file_path))
                
                await db.commit()
                
                # Return the created document
                return await self.get_document(doc_id, user_id)
                
        except Exception as e:
            print(f"❌ Error creating document: {e}")
            return None
    
    async def get_document(self, doc_id: str, user_id: int) -> Optional[Dict[str, Any]]:
        """Get document by ID and user ID"""
        try:
            async with aiosqlite.connect(self.db_path) as db:
                db.row_factory = aiosqlite.Row
                cursor = await db.execute("""
                    SELECT id, user_id, name, filename, size, doc_type, file_path, upload_date, updated_at
                    FROM documents WHERE id = ? AND user_id = ?
                """, (doc_id, user_id))
                
                row = await cursor.fetchone()
                if row:
                    return dict(row)
                return None
                
        except Exception as e:
            print(f"❌ Error getting document: {e}")
            return None
    
    async def get_documents(self, user_id: int, limit: int = 100, offset: int = 0) -> List[Dict[str, Any]]:
        """Get all documents for a user"""
        try:
            async with aiosqlite.connect(self.db_path) as db:
                db.row_factory = aiosqlite.Row
                cursor = await db.execute("""
                    SELECT id, user_id, name, filename, size, doc_type, file_path, upload_date, updated_at
                    FROM documents 
                    WHERE user_id = ?
                    ORDER BY upload_date DESC
                    LIMIT ? OFFSET ?
                """, (user_id, limit, offset))
                
                rows = await cursor.fetchall()
                return [dict(row) for row in rows]
                
        except Exception as e:
            print(f"❌ Error getting documents: {e}")
            return []
    
    async def delete_document(self, doc_id: str, user_id: int) -> bool:
        """Delete a document"""
        try:
            async with aiosqlite.connect(self.db_path) as db:
                cursor = await db.execute("""
                    DELETE FROM documents WHERE id = ? AND user_id = ?
                """, (doc_id, user_id))

                await db.commit()
                return cursor.rowcount > 0

        except Exception as e:
            print(f"❌ Error deleting document: {e}")
            return False

    async def update_document(self, doc_id: str, user_id: int, name: Optional[str] = None) -> Optional[Dict[str, Any]]:
        """Update document metadata (rename)"""
        try:
            async with aiosqlite.connect(self.db_path) as db:
                # Build dynamic update query
                updates = []
                params = []

                if name is not None:
                    if not name or not name.strip():
                        print(f"❌ Document name cannot be empty")
                        return None
                    updates.append("name = ?")
                    params.append(name.strip())

                if not updates:
                    # No updates requested, return existing document
                    return await self.get_document(doc_id, user_id)

                # Always update the updated_at timestamp
                updates.append("updated_at = CURRENT_TIMESTAMP")
                params.extend([doc_id, user_id])

                query = f"""
                    UPDATE documents
                    SET {', '.join(updates)}
                    WHERE id = ? AND user_id = ?
                """

                cursor = await db.execute(query, params)
                await db.commit()

                if cursor.rowcount > 0:
                    return await self.get_document(doc_id, user_id)
                return None

        except Exception as e:
            print(f"❌ Error updating document: {e}")
            return None

    # Term extraction methods (for future implementation)
    async def save_document_terms(self, document_id: str, terms: List[Dict[str, Any]]) -> bool:
        """Save extracted terms for a document"""
        try:
            async with aiosqlite.connect(self.db_path) as db:
                # Delete existing terms first
                await db.execute("DELETE FROM document_terms WHERE document_id = ?", (document_id,))
                
                # Insert new terms
                for term in terms:
                    await db.execute("""
                        INSERT INTO document_terms (document_id, term_name, term_value, category, confidence)
                        VALUES (?, ?, ?, ?, ?)
                    """, (
                        document_id,
                        term.get('name', ''),
                        term.get('value', ''),
                        term.get('category', ''),
                        term.get('confidence', 0.0)
                    ))
                
                await db.commit()
                return True
                
        except Exception as e:
            print(f"❌ Error saving document terms: {e}")
            return False
    
    async def get_document_terms(self, document_id: str) -> List[Dict[str, Any]]:
        """Get extracted terms for a document"""
        try:
            async with aiosqlite.connect(self.db_path) as db:
                db.row_factory = aiosqlite.Row
                cursor = await db.execute("""
                    SELECT term_name, term_value, category, confidence, extracted_at
                    FROM document_terms 
                    WHERE document_id = ?
                    ORDER BY category, term_name
                """, (document_id,))
                
                rows = await cursor.fetchall()
                return [dict(row) for row in rows]
                
        except Exception as e:
            print(f"❌ Error getting document terms: {e}")
            return []
    
    # Workflow management methods (simplified for now)
    async def create_workflow(self, user_id: int, name: str, description: str = "",
                            fields: str = "[]", document_types: str = "[]", status: str = "draft") -> Optional[Dict[str, Any]]:
        """Create a new workflow"""
        try:
            async with aiosqlite.connect(self.db_path) as db:
                cursor = await db.execute("""
                    INSERT INTO workflows (user_id, name, description, fields, document_types, status)
                    VALUES (?, ?, ?, ?, ?, ?)
                """, (user_id, name, description, fields, document_types, status))
                
                await db.commit()
                workflow_id = cursor.lastrowid
                
                # Return the created workflow
                return await self.get_workflow(workflow_id, user_id)
                
        except Exception as e:
            print(f"❌ Error creating workflow: {e}")
            return None
    
    async def get_workflow(self, workflow_id: int, user_id: int) -> Optional[Dict[str, Any]]:
        """Get workflow by ID and user ID"""
        try:
            async with aiosqlite.connect(self.db_path) as db:
                db.row_factory = aiosqlite.Row
                cursor = await db.execute("""
                    SELECT id, user_id, name, description, fields, document_types, status, created_at, updated_at
                    FROM workflows WHERE id = ? AND user_id = ?
                """, (workflow_id, user_id))
                
                row = await cursor.fetchone()
                if row:
                    return dict(row)
                return None
                
        except Exception as e:
            print(f"❌ Error getting workflow: {e}")
            return None
    
    async def get_workflows(self, user_id: int) -> List[Dict[str, Any]]:
        """Get all workflows for a user"""
        try:
            async with aiosqlite.connect(self.db_path) as db:
                db.row_factory = aiosqlite.Row
                cursor = await db.execute("""
                    SELECT id, user_id, name, description, fields, document_types, status, created_at, updated_at
                    FROM workflows
                    WHERE user_id = ?
                    ORDER BY created_at DESC
                """, (user_id,))

                rows = await cursor.fetchall()
                return [dict(row) for row in rows]

        except Exception as e:
            print(f"❌ Error getting workflows: {e}")
            return []

    async def update_workflow(self, workflow_id: int, user_id: int, name: Optional[str] = None,
                            description: Optional[str] = None, fields: Optional[str] = None,
                            document_types: Optional[str] = None, status: Optional[str] = None) -> bool:
        """Update an existing workflow"""
        try:
            async with aiosqlite.connect(self.db_path) as db:
                # Build dynamic update query
                updates = []
                params = []

                if name is not None:
                    updates.append("name = ?")
                    params.append(name)

                if description is not None:
                    updates.append("description = ?")
                    params.append(description)

                if fields is not None:
                    updates.append("fields = ?")
                    params.append(fields)

                if document_types is not None:
                    updates.append("document_types = ?")
                    params.append(document_types)

                if status is not None:
                    updates.append("status = ?")
                    params.append(status)

                if not updates:
                    # No updates requested
                    return True

                # Always update the updated_at timestamp
                updates.append("updated_at = CURRENT_TIMESTAMP")
                params.extend([workflow_id, user_id])

                query = f"""
                    UPDATE workflows
                    SET {', '.join(updates)}
                    WHERE id = ? AND user_id = ?
                """

                cursor = await db.execute(query, params)
                await db.commit()

                return cursor.rowcount > 0

        except Exception as e:
            print(f"❌ Error updating workflow: {e}")
            return False

    async def delete_workflow(self, workflow_id: int, user_id: int) -> bool:
        """Delete a workflow (only if it belongs to the user)"""
        try:
            async with aiosqlite.connect(self.db_path) as db:
                # Enable foreign keys to ensure CASCADE deletes work
                await db.execute("PRAGMA foreign_keys = ON")

                # First, verify the workflow belongs to this user
                cursor = await db.execute("""
                    SELECT id FROM workflows
                    WHERE id = ? AND user_id = ?
                """, (workflow_id, user_id))

                workflow = await cursor.fetchone()

                if not workflow:
                    print(f"❌ Workflow {workflow_id} not found or doesn't belong to user {user_id}")
                    return False

                # Delete the workflow (CASCADE will handle document_workflows)
                await db.execute("DELETE FROM workflows WHERE id = ?", (workflow_id,))
                await db.commit()

                print(f"✅ Deleted workflow {workflow_id} for user {user_id} (CASCADE removed assignments)")
                return True

        except Exception as e:
            print(f"❌ Error deleting workflow: {e}")
            return False

    # Document-Workflow association methods
    async def assign_workflows_to_document(self, document_id: str, workflow_ids: List[int]) -> bool:
        """Assign workflows to a document"""
        try:
            async with aiosqlite.connect(self.db_path) as db:
                # First, remove existing assignments
                await db.execute("DELETE FROM document_workflows WHERE document_id = ?", (document_id,))
                print(f"✅ Cleared existing workflow assignments for document {document_id}")

                # Insert new assignments
                for workflow_id in workflow_ids:
                    try:
                        await db.execute("""
                            INSERT INTO document_workflows (document_id, workflow_id)
                            VALUES (?, ?)
                        """, (document_id, workflow_id))
                        print(f"✅ Assigned workflow {workflow_id} to document {document_id}")
                    except aiosqlite.IntegrityError as ie:
                        print(f"❌ Constraint violation assigning workflow {workflow_id}: {ie}")
                        raise

                await db.commit()
                print(f"✅ Successfully assigned {len(workflow_ids)} workflows to document {document_id}")
                return True

        except aiosqlite.IntegrityError as e:
            print(f"❌ Database integrity error assigning workflows: {e}")
            print(f"   Document ID: {document_id}, Workflow IDs: {workflow_ids}")
            return False
        except Exception as e:
            print(f"❌ Unexpected error assigning workflows to document: {e}")
            print(f"   Document ID: {document_id}, Workflow IDs: {workflow_ids}")
            import traceback
            traceback.print_exc()
            return False

    async def cleanup_orphaned_assignments(self) -> int:
        """
        Remove orphaned document_workflows where:
        1. Document and workflow belong to different users (cross-user orphans)
        2. Workflow has been deleted entirely (dangling references)
        Returns the number of orphaned assignments removed.
        """
        try:
            async with aiosqlite.connect(self.db_path) as db:
                # Enable foreign keys for this connection
                await db.execute("PRAGMA foreign_keys = ON")

                # Clean up cross-user orphaned assignments
                cursor = await db.execute("""
                    DELETE FROM document_workflows
                    WHERE EXISTS (
                        SELECT 1
                        FROM documents d, workflows w
                        WHERE document_workflows.document_id = d.id
                        AND document_workflows.workflow_id = w.id
                        AND d.user_id != w.user_id
                    )
                """)
                cross_user_count = cursor.rowcount

                # Clean up references to deleted workflows (dangling references)
                cursor = await db.execute("""
                    DELETE FROM document_workflows
                    WHERE NOT EXISTS (
                        SELECT 1 FROM workflows
                        WHERE workflows.id = document_workflows.workflow_id
                    )
                """)
                deleted_workflow_count = cursor.rowcount

                await db.commit()

                total_deleted = cross_user_count + deleted_workflow_count

                if total_deleted > 0:
                    print(f"✅ Cleaned up {cross_user_count} cross-user and {deleted_workflow_count} deleted workflow orphan(s)")
                else:
                    print("✅ No orphaned workflow assignments found")

                return total_deleted

        except Exception as e:
            print(f"❌ Error cleaning up orphaned assignments: {e}")
            import traceback
            traceback.print_exc()
            return 0

    async def get_document_workflows(self, document_id: str) -> List[int]:
        """Get workflow IDs assigned to a document"""
        try:
            async with aiosqlite.connect(self.db_path) as db:
                cursor = await db.execute("""
                    SELECT workflow_id
                    FROM document_workflows
                    WHERE document_id = ?
                    ORDER BY assigned_at DESC
                """, (document_id,))

                rows = await cursor.fetchall()
                return [row[0] for row in rows]

        except Exception as e:
            print(f"❌ Error getting document workflows: {e}")
            return []

    async def remove_workflows_from_document(self, document_id: str, workflow_ids: List[int]) -> bool:
        """Remove specific workflow assignments from a document"""
        try:
            async with aiosqlite.connect(self.db_path) as db:
                placeholders = ','.join('?' * len(workflow_ids))
                await db.execute(f"""
                    DELETE FROM document_workflows
                    WHERE document_id = ? AND workflow_id IN ({placeholders})
                """, (document_id, *workflow_ids))

                await db.commit()
                return True

        except Exception as e:
            print(f"❌ Error removing workflows from document: {e}")
            return False

    # Field management methods
    async def create_field(self, field_data: Dict[str, Any]) -> bool:
        """Create a new field record"""
        try:
            async with aiosqlite.connect(self.db_path) as db:
                await db.execute("""
                    INSERT OR REPLACE INTO fields (
                        field_id, name, description, type, region, custom,
                        created_at, last_updated, tags, languages,
                        document_types, jurisdictions
                    ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
                """, (
                    field_data.get('field_id'),
                    field_data.get('name'),
                    field_data.get('description'),
                    field_data.get('type'),
                    field_data.get('region'),
                    1 if field_data.get('custom', False) else 0,
                    field_data.get('created'),
                    field_data.get('last_updated'),
                    json.dumps(field_data.get('tags', [])),
                    json.dumps(field_data.get('languages', [])),
                    json.dumps(field_data.get('document_types', [])),
                    json.dumps(field_data.get('jurisdictions', []))
                ))

                await db.commit()
                return True

        except Exception as e:
            print(f"❌ Error creating field: {e}")
            return False

    async def get_fields(self, search: Optional[str] = None, tags: Optional[str] = None,
                        region: Optional[str] = None, limit: Optional[int] = None,
                        offset: Optional[int] = None) -> List[Dict[str, Any]]:
        """Get fields with optional search and filtering"""
        try:
            async with aiosqlite.connect(self.db_path) as db:
                db.row_factory = aiosqlite.Row
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

                cursor = await db.execute(query, params)
                rows = await cursor.fetchall()
                fields = []

                for row in rows:
                    field = dict(row)
                    # Parse JSON fields
                    for json_field in ['tags', 'languages', 'document_types', 'jurisdictions']:
                        if field.get(json_field):
                            try:
                                field[json_field] = json.loads(field[json_field])
                            except (json.JSONDecodeError, TypeError):
                                field[json_field] = []
                        else:
                            field[json_field] = []
                    fields.append(field)

                return fields

        except Exception as e:
            print(f"❌ Error fetching fields: {e}")
            return []

    async def get_field_count(self, search: Optional[str] = None, tags: Optional[str] = None,
                             region: Optional[str] = None) -> int:
        """Get total number of fields in database"""
        try:
            async with aiosqlite.connect(self.db_path) as db:
                query = 'SELECT COUNT(*) as count FROM fields WHERE 1=1'
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

                cursor = await db.execute(query, params)
                result = await cursor.fetchone()
                return result[0] if result else 0

        except Exception as e:
            print(f"❌ Error getting field count: {e}")
            return 0

    async def clear_fields(self) -> bool:
        """Clear all fields (for reimporting)"""
        try:
            async with aiosqlite.connect(self.db_path) as db:
                await db.execute('DELETE FROM fields')
                await db.commit()
                return True

        except Exception as e:
            print(f"❌ Error clearing fields: {e}")
            return False

    # Extraction management methods
    async def create_extraction(
        self,
        document_id: str,
        workflow_id: int,
        zuva_file_id: Optional[str] = None
    ) -> Optional[Dict[str, Any]]:
        """Create a new extraction record"""
        try:
            async with aiosqlite.connect(self.db_path) as db:
                cursor = await db.execute("""
                    INSERT INTO extractions (document_id, workflow_id, zuva_file_id, status)
                    VALUES (?, ?, ?, 'pending')
                """, (document_id, workflow_id, zuva_file_id))

                await db.commit()
                extraction_id = cursor.lastrowid

                # Return the created extraction
                return await self.get_extraction(extraction_id)

        except Exception as e:
            print(f"❌ Error creating extraction: {e}")
            return None

    async def get_extraction(self, extraction_id: int) -> Optional[Dict[str, Any]]:
        """Get extraction by ID"""
        try:
            async with aiosqlite.connect(self.db_path) as db:
                db.row_factory = aiosqlite.Row
                cursor = await db.execute("""
                    SELECT id, document_id, workflow_id, zuva_file_id, zuva_request_id,
                           status, results, error_message, created_at, started_at, completed_at
                    FROM extractions WHERE id = ?
                """, (extraction_id,))

                row = await cursor.fetchone()
                if row:
                    extraction = dict(row)
                    # Parse JSON results if present
                    if extraction.get('results'):
                        try:
                            extraction['results'] = json.loads(extraction['results'])
                        except (json.JSONDecodeError, TypeError):
                            extraction['results'] = None
                    return extraction
                return None

        except Exception as e:
            print(f"❌ Error getting extraction: {e}")
            return None

    async def get_extraction_by_document_workflow(
        self,
        document_id: str,
        workflow_id: int
    ) -> Optional[Dict[str, Any]]:
        """Get extraction by document ID and workflow ID"""
        try:
            async with aiosqlite.connect(self.db_path) as db:
                db.row_factory = aiosqlite.Row
                cursor = await db.execute("""
                    SELECT id, document_id, workflow_id, zuva_file_id, zuva_request_id,
                           status, results, answer_metadata, error_message, created_at, started_at, completed_at
                    FROM extractions
                    WHERE document_id = ? AND workflow_id = ?
                """, (document_id, workflow_id))

                row = await cursor.fetchone()
                if row:
                    extraction = dict(row)
                    # Parse JSON results if present
                    if extraction.get('results'):
                        try:
                            extraction['results'] = json.loads(extraction['results'])
                        except (json.JSONDecodeError, TypeError):
                            extraction['results'] = None
                    # Parse JSON answer_metadata if present
                    if extraction.get('answer_metadata'):
                        try:
                            extraction['answer_metadata'] = json.loads(extraction['answer_metadata'])
                        except (json.JSONDecodeError, TypeError):
                            extraction['answer_metadata'] = None
                    return extraction
                return None

        except Exception as e:
            print(f"❌ Error getting extraction by document and workflow: {e}")
            return None

    async def update_extraction_status(
        self,
        extraction_id: int,
        status: str,
        zuva_request_id: Optional[str] = None,
        error_message: Optional[str] = None
    ) -> bool:
        """Update extraction status"""
        try:
            async with aiosqlite.connect(self.db_path) as db:
                updates = ["status = ?"]
                params = [status]

                if zuva_request_id:
                    updates.append("zuva_request_id = ?")
                    params.append(zuva_request_id)

                if error_message:
                    updates.append("error_message = ?")
                    params.append(error_message)

                # Update timestamps based on status
                if status == 'processing':
                    updates.append("started_at = CURRENT_TIMESTAMP")
                elif status in ['complete', 'failed']:
                    updates.append("completed_at = CURRENT_TIMESTAMP")

                params.append(extraction_id)

                query = f"""
                    UPDATE extractions
                    SET {', '.join(updates)}
                    WHERE id = ?
                """

                cursor = await db.execute(query, params)
                await db.commit()

                return cursor.rowcount > 0

        except Exception as e:
            print(f"❌ Error updating extraction status: {e}")
            return False

    async def save_extraction_results(
        self,
        extraction_id: int,
        results: Dict[str, Any],
        answer_metadata: Optional[Dict[str, Any]] = None
    ) -> bool:
        """Save extraction results and answer metadata"""
        try:
            async with aiosqlite.connect(self.db_path) as db:
                results_json = json.dumps(results)
                answer_metadata_json = json.dumps(answer_metadata) if answer_metadata else None

                await db.execute("""
                    UPDATE extractions
                    SET results = ?,
                        answer_metadata = ?,
                        status = 'complete',
                        completed_at = CURRENT_TIMESTAMP
                    WHERE id = ?
                """, (results_json, answer_metadata_json, extraction_id))

                await db.commit()
                print(f"✅ Saved extraction results for extraction_id={extraction_id}")
                if answer_metadata:
                    print(f"   📊 Saved answer metadata for {len(answer_metadata)} answer-type fields")
                return True

        except Exception as e:
            print(f"❌ Error saving extraction results: {e}")
            import traceback
            traceback.print_exc()
            return False

    async def get_document_extractions(self, document_id: str) -> List[Dict[str, Any]]:
        """Get all extractions for a document"""
        try:
            async with aiosqlite.connect(self.db_path) as db:
                db.row_factory = aiosqlite.Row
                cursor = await db.execute("""
                    SELECT id, document_id, workflow_id, zuva_file_id, zuva_request_id,
                           status, results, error_message, created_at, started_at, completed_at
                    FROM extractions
                    WHERE document_id = ?
                    ORDER BY created_at DESC
                """, (document_id,))

                rows = await cursor.fetchall()
                extractions = []

                for row in rows:
                    extraction = dict(row)
                    # Parse JSON results if present
                    if extraction.get('results'):
                        try:
                            extraction['results'] = json.loads(extraction['results'])
                        except (json.JSONDecodeError, TypeError):
                            extraction['results'] = None
                    extractions.append(extraction)

                return extractions

        except Exception as e:
            print(f"❌ Error getting document extractions: {e}")
            return []

    # Utility methods
    async def get_connection(self):
        """Get database connection with foreign keys enabled"""
        conn = await aiosqlite.connect(self.db_path)
        await conn.execute("PRAGMA foreign_keys = ON")
        return conn

    async def close(self):
        """Close database connections (for cleanup)"""
        # aiosqlite doesn't maintain persistent connections, so nothing to close
        pass

    # Document type management methods
    async def get_document_types_hierarchical(self) -> List[Dict[str, Any]]:
        """Get all document types organized by category"""
        try:
            async with aiosqlite.connect(self.db_path) as db:
                db.row_factory = aiosqlite.Row

                # Get all categories with their types
                cursor = await db.execute("""
                    SELECT
                        c.id as category_id,
                        c.name as category_name,
                        c.display_order as category_order,
                        dt.id as type_id,
                        dt.name as type_name,
                        dt.display_order as type_order
                    FROM document_categories c
                    LEFT JOIN document_types dt ON c.id = dt.category_id
                    ORDER BY c.display_order, dt.display_order
                """)

                rows = await cursor.fetchall()

                # Organize data into hierarchical structure
                categories = {}
                for row in rows:
                    category_id = row['category_id']

                    if category_id not in categories:
                        categories[category_id] = {
                            'id': category_id,
                            'name': row['category_name'],
                            'display_order': row['category_order'],
                            'types': []
                        }

                    # Add type if it exists
                    if row['type_id']:
                        categories[category_id]['types'].append({
                            'id': row['type_id'],
                            'name': row['type_name'],
                            'display_order': row['type_order']
                        })

                # Convert to list sorted by display order
                result = sorted(categories.values(), key=lambda x: x['display_order'])
                return result

        except Exception as e:
            print(f"❌ Error getting hierarchical document types: {e}")
            return []

    async def get_document_categories(self) -> List[Dict[str, Any]]:
        """Get all document categories"""
        try:
            async with aiosqlite.connect(self.db_path) as db:
                db.row_factory = aiosqlite.Row
                cursor = await db.execute("""
                    SELECT id, name, display_order, created_at
                    FROM document_categories
                    ORDER BY display_order
                """)

                rows = await cursor.fetchall()
                return [dict(row) for row in rows]

        except Exception as e:
            print(f"❌ Error getting document categories: {e}")
            return []

    async def get_document_types_by_category(self, category_id: int) -> List[Dict[str, Any]]:
        """Get all document types for a specific category"""
        try:
            async with aiosqlite.connect(self.db_path) as db:
                db.row_factory = aiosqlite.Row
                cursor = await db.execute("""
                    SELECT id, category_id, name, display_order, created_at
                    FROM document_types
                    WHERE category_id = ?
                    ORDER BY display_order
                """, (category_id,))

                rows = await cursor.fetchall()
                return [dict(row) for row in rows]

        except Exception as e:
            print(f"❌ Error getting document types by category: {e}")
            return []