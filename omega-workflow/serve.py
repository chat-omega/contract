#!/usr/bin/env python3
import http.server
import socketserver
import os

PORT = 9090
DIRECTORY = "/home/ubuntu/contract1/omega-workflow"

class MyHTTPRequestHandler(http.server.SimpleHTTPRequestHandler):
    def __init__(self, *args, **kwargs):
        super().__init__(*args, directory=DIRECTORY, **kwargs)
    
    def end_headers(self):
        # Add headers to prevent 403 errors
        self.send_header('Access-Control-Allow-Origin', '*')
        self.send_header('Access-Control-Allow-Methods', 'GET, OPTIONS')
        self.send_header('Cache-Control', 'no-store, no-cache, must-revalidate')
        super().end_headers()
    
    def do_GET(self):
        # Redirect root to the cleaned HTML file
        if self.path == '/':
            self.path = '/documents_clean.html'
        return super().do_GET()

# Change to the directory
os.chdir(DIRECTORY)

# Create and start the server
with socketserver.TCPServer(("0.0.0.0", PORT), MyHTTPRequestHandler) as httpd:
    print(f"""
========================================
Server is running successfully!
========================================
The cleaned HTML file is being served at:

  http://localhost:{PORT}/
  http://localhost:{PORT}/documents_clean.html
  http://0.0.0.0:{PORT}/

Features:
  - All Zuva.ai references have been removed
  - All external navigation is disabled
  - Root URL (/) redirects to documents_clean.html
  - CORS headers added to prevent 403 errors

Press Ctrl+C to stop the server
========================================
    """)
    httpd.serve_forever()