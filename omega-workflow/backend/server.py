#!/usr/bin/env python3
import os
import json
from http.server import HTTPServer, SimpleHTTPRequestHandler
from urllib.parse import urlparse, parse_qs
import socketserver

PORT = int(os.environ.get('PORT', 5000))
HOST = '0.0.0.0'

class APIHandler(SimpleHTTPRequestHandler):
    def do_GET(self):
        parsed_path = urlparse(self.path)
        
        if parsed_path.path == '/api/health':
            self.send_response(200)
            self.send_header('Content-Type', 'application/json')
            self.send_header('Access-Control-Allow-Origin', '*')
            self.end_headers()
            response = {'status': 'healthy', 'service': 'backend-api'}
            self.wfile.write(json.dumps(response).encode())
            
        elif parsed_path.path == '/api/documents':
            self.send_response(200)
            self.send_header('Content-Type', 'application/json')
            self.send_header('Access-Control-Allow-Origin', '*')
            self.end_headers()
            documents = [
                {'id': 1, 'name': 'Document 1', 'type': 'pdf', 'size': '2.5 MB'},
                {'id': 2, 'name': 'Document 2', 'type': 'docx', 'size': '1.2 MB'},
                {'id': 3, 'name': 'Document 3', 'type': 'xlsx', 'size': '3.7 MB'}
            ]
            self.wfile.write(json.dumps(documents).encode())
            
        elif parsed_path.path == '/api/workflows':
            self.send_response(200)
            self.send_header('Content-Type', 'application/json')
            self.send_header('Access-Control-Allow-Origin', '*')
            self.end_headers()
            workflows = [
                {'id': 1, 'name': 'Workflow Alpha', 'status': 'active'},
                {'id': 2, 'name': 'Workflow Beta', 'status': 'pending'},
                {'id': 3, 'name': 'Workflow Gamma', 'status': 'completed'}
            ]
            self.wfile.write(json.dumps(workflows).encode())
            
        else:
            self.send_response(404)
            self.send_header('Content-Type', 'application/json')
            self.end_headers()
            error = {'error': 'Not Found', 'path': parsed_path.path}
            self.wfile.write(json.dumps(error).encode())
    
    def do_OPTIONS(self):
        self.send_response(200)
        self.send_header('Access-Control-Allow-Origin', '*')
        self.send_header('Access-Control-Allow-Methods', 'GET, POST, OPTIONS')
        self.send_header('Access-Control-Allow-Headers', 'Content-Type')
        self.end_headers()
    
    def log_message(self, format, *args):
        print(f"[{self.address_string()}] {format % args}")

if __name__ == '__main__':
    with socketserver.TCPServer((HOST, PORT), APIHandler) as httpd:
        print(f"""
========================================
Backend API Server Running
========================================
Server is listening at:
  http://localhost:{PORT}/
  http://0.0.0.0:{PORT}/

Available endpoints:
  GET /api/health     - Health check
  GET /api/documents  - List documents
  GET /api/workflows  - List workflows

Press Ctrl+C to stop the server
========================================
        """)
        httpd.serve_forever()