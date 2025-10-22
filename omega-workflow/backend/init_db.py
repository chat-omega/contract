#!/usr/bin/env python3
"""
Database initialization script for OMEGA Workflow Application

This script initializes the SQLite database with the required tables and
creates default data for testing and development.
"""

import sys
import os
from database import db

def init_database():
    """Initialize database with tables and default data"""
    print("Initializing OMEGA database...")
    
    try:
        # The database initialization is handled by the Database class constructor
        # This will create all tables if they don't exist
        print("✓ Database tables created/verified")
        
        # Check if admin user exists
        admin_user = db.authenticate_user('admin', 'admin123')
        if admin_user:
            print("✓ Default admin user found")
        else:
            print("! Default admin user not found - will be created on first API startup")
        
        # Clean up expired sessions
        cleaned_sessions = db.cleanup_expired_sessions()
        if cleaned_sessions > 0:
            print(f"✓ Cleaned up {cleaned_sessions} expired sessions")
        
        print("\n" + "="*50)
        print("Database initialization completed successfully!")
        print("="*50)
        print("\nDefault credentials:")
        print("Username: admin")
        print("Password: admin123")
        print("\nThe database is ready for use.")
        
        return True
        
    except Exception as e:
        print(f"✗ Database initialization failed: {e}")
        return False

def check_database_status():
    """Check the current status of the database"""
    print("Checking database status...")
    
    try:
        # Test database connection
        conn = db.get_connection()
        
        # Check tables exist
        cursor = conn.execute("SELECT name FROM sqlite_master WHERE type='table'")
        tables = [row[0] for row in cursor.fetchall()]
        
        print(f"✓ Database connection successful")
        print(f"✓ Tables found: {', '.join(tables)}")
        
        # Check user count
        cursor = conn.execute("SELECT COUNT(*) as count FROM users")
        user_count = cursor.fetchone()[0]
        print(f"✓ Users in database: {user_count}")
        
        # Check document count
        cursor = conn.execute("SELECT COUNT(*) as count FROM documents")
        doc_count = cursor.fetchone()[0]
        print(f"✓ Documents in database: {doc_count}")
        
        # Check session count
        cursor = conn.execute("SELECT COUNT(*) as count FROM user_sessions")
        session_count = cursor.fetchone()[0]
        print(f"✓ Active sessions: {session_count}")
        
        conn.close()
        return True
        
    except Exception as e:
        print(f"✗ Database check failed: {e}")
        return False

def create_test_data():
    """Create test data for development"""
    print("Creating test data...")
    
    try:
        # Create test users
        test_users = [
            {'username': 'testuser', 'email': 'test@example.com', 'password': 'test123'},
            {'username': 'demo', 'email': 'demo@example.com', 'password': 'demo123'},
        ]
        
        for user_data in test_users:
            try:
                user = db.create_user(user_data['username'], user_data['email'], user_data['password'])
                if user:
                    print(f"✓ Created test user: {user_data['username']}")
                else:
                    print(f"! Test user {user_data['username']} may already exist")
            except ValueError as e:
                print(f"! Test user {user_data['username']}: {e}")
        
        print("✓ Test data creation completed")
        return True
        
    except Exception as e:
        print(f"✗ Test data creation failed: {e}")
        return False

def reset_database():
    """Reset database by dropping all tables and recreating them"""
    print("WARNING: This will delete all data!")
    confirm = input("Are you sure you want to reset the database? (yes/no): ")
    
    if confirm.lower() != 'yes':
        print("Database reset cancelled.")
        return False
    
    try:
        conn = db.get_connection()
        
        # Drop all tables
        tables = ['user_sessions', 'document_workflows', 'documents', 'workflows', 'users']
        for table in tables:
            try:
                conn.execute(f"DROP TABLE IF EXISTS {table}")
                print(f"✓ Dropped table: {table}")
            except Exception as e:
                print(f"! Error dropping table {table}: {e}")
        
        conn.commit()
        conn.close()
        
        # Reinitialize database
        db.init_database()
        print("✓ Database reset and reinitialized successfully")
        
        return True
        
    except Exception as e:
        print(f"✗ Database reset failed: {e}")
        return False

def main():
    """Main function to handle command line arguments"""
    if len(sys.argv) < 2:
        print("OMEGA Database Management Tool")
        print("Usage: python init_db.py <command>")
        print("\nCommands:")
        print("  init       - Initialize database with tables and default data")
        print("  status     - Check database status")
        print("  testdata   - Create test data for development")
        print("  reset      - Reset database (WARNING: deletes all data)")
        return
    
    command = sys.argv[1].lower()
    
    if command == 'init':
        init_database()
    elif command == 'status':
        check_database_status()
    elif command == 'testdata':
        create_test_data()
    elif command == 'reset':
        reset_database()
    else:
        print(f"Unknown command: {command}")
        print("Use 'python init_db.py' to see available commands")

if __name__ == '__main__':
    main()