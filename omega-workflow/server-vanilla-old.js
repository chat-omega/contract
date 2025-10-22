const http = require('http');
const fs = require('fs');
const path = require('path');

const PORT = 5000;
const HOST = '0.0.0.0'; // Listen on all interfaces

const server = http.createServer((req, res) => {
    console.log(`${new Date().toISOString()} - ${req.method} ${req.url}`);

    // Serve the main HTML file
    if (req.url === '/' || req.url === '/documents.html') {
        const htmlPath = fs.existsSync(path.join(__dirname, 'frontend/index.html'))
            ? path.join(__dirname, 'frontend/index.html')
            : path.join(__dirname, 'documents_clean.html');

        fs.readFile(htmlPath, (err, data) => {
            if (err) {
                res.writeHead(500, { 'Content-Type': 'text/plain' });
                res.end('Error loading page: ' + err.message);
                return;
            }
            res.writeHead(200, { 'Content-Type': 'text/html' });
            res.end(data);
        });
    }
    // Serve static assets (CSS, JS, images)
    else if (req.url.startsWith('/css/') || req.url.startsWith('/js/') || req.url.startsWith('/images/')) {
        const filePath = path.join(__dirname, 'frontend', req.url);

        // Determine content type
        const ext = path.extname(filePath);
        const contentTypes = {
            '.css': 'text/css',
            '.js': 'application/javascript',
            '.json': 'application/json',
            '.png': 'image/png',
            '.jpg': 'image/jpeg',
            '.jpeg': 'image/jpeg',
            '.gif': 'image/gif',
            '.svg': 'image/svg+xml'
        };
        const contentType = contentTypes[ext] || 'text/plain';

        fs.readFile(filePath, (err, data) => {
            if (err) {
                res.writeHead(404, { 'Content-Type': 'text/plain' });
                res.end('File not found');
                return;
            }
            res.writeHead(200, { 'Content-Type': contentType });
            res.end(data);
        });
    }
    else {
        // Return 404 for all other requests
        res.writeHead(404, { 'Content-Type': 'text/plain' });
        res.end('Not Found');
    }
});

server.listen(PORT, HOST, () => {
    console.log(`
========================================
Server is running successfully!
========================================
Access the document at:
  http://localhost:${PORT}/
  http://${HOST}:${PORT}/
  
The HTML file has been cleaned:
  - All Zuva.ai references removed
  - All external navigation disabled
  - Clicking on links will not redirect anywhere
  
Press Ctrl+C to stop the server
========================================
    `);
});

// Handle graceful shutdown
process.on('SIGINT', () => {
    console.log('\nShutting down server...');
    server.close(() => {
        console.log('Server stopped.');
        process.exit(0);
    });
});