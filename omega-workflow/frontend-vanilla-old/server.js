const express = require('express');
const path = require('path');
const { createProxyMiddleware } = require('http-proxy-middleware');

const app = express();
const PORT = process.env.PORT || 3000;

// Multer configuration removed - uploads proxied directly to FastAPI backend

// Configure body parser for regular JSON requests
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ limit: '10mb', extended: true }));

// Multer error handling removed - uploads now proxied directly to FastAPI backend

// Upload endpoint removed - now handled by general API proxy below
// The FastAPI backend handles multipart/form-data natively via UploadFile

// Special proxy configuration for auth endpoints with longer timeout
app.use('/api/auth', createProxyMiddleware({
    target: 'http://backend-fastapi:5000',
    changeOrigin: true,
    timeout: 30000, // 30 second timeout for auth
    logLevel: 'debug',
    onError: (err, req, res) => {
        console.error('🚨 Auth Proxy Error:', {
            code: err.code,
            message: err.message,
            url: req.url,
            method: req.method
        });
        
        if (res.headersSent) {
            console.warn('⚠️ Auth response already sent');
            return;
        }
        
        try {
            return res.status(500).json({ 
                error: 'Authentication service error', 
                message: 'Login service temporarily unavailable. Please try again.',
                code: err.code
            });
        } catch (responseError) {
            console.error('🚨 Error sending auth error response:', responseError);
        }
    },
    onProxyReq: (proxyReq, req, res) => {
        console.log(`🔐 Auth Proxying: ${req.method} ${req.url}`);
    }
}));

// Proxy configuration for other API endpoints
app.use('/api', createProxyMiddleware({
    target: 'http://backend-fastapi:5000',
    changeOrigin: true,
    timeout: 30000, // 30 second timeout to match nginx
    onError: (err, req, res) => {
        console.error('🚨 Proxy Error:', {
            code: err.code,
            message: err.message,
            url: req.url,
            method: req.method
        });
        
        if (res.headersSent) {
            console.warn('⚠️ Response already sent, cannot send error response');
            return;
        }
        
        // Always return JSON responses, never HTML
        const isJsonRequest = req.headers['content-type']?.includes('application/json') || 
                             req.headers['accept']?.includes('application/json');
        
        try {
            if (err.code === 'ECONNRESET' || err.code === 'ECONNREFUSED') {
                return res.status(502).json({ 
                    error: 'Backend service unavailable', 
                    message: 'The backend service is temporarily unavailable. Please try again in a moment.',
                    code: err.code
                });
            } else if (err.code === 'ETIMEDOUT' || err.message?.includes('timeout')) {
                return res.status(504).json({ 
                    error: 'Request timeout', 
                    message: 'The request took too long to complete. Please try again.',
                    code: err.code 
                });
            } else {
                return res.status(500).json({ 
                    error: 'Proxy error', 
                    message: 'An unexpected error occurred. Please try again.',
                    code: err.code
                });
            }
        } catch (responseError) {
            console.error('🚨 Error sending error response:', responseError);
        }
    },
    onProxyReq: (proxyReq, req, res) => {
        if (req.url !== '/api/health') { // Don't log health checks
            console.log(`🔄 Proxying: ${req.method} ${req.url}`);
        }
    }
}));

// Serve static files
app.use(express.static(path.join(__dirname)));

// Route all requests to index.html
app.get('*', (req, res) => {
    res.sendFile(path.join(__dirname, 'index.html'));
});

// Start server
app.listen(PORT, '0.0.0.0', () => {
    console.log(`
========================================
Document Management App is running!
========================================
The application is available at:

  http://localhost:${PORT}/
  http://0.0.0.0:${PORT}/

Features:
  ✓ Collapsible sidebar with smooth transitions
  ✓ Interactive navigation menu
  ✓ Document management interface
  ✓ Responsive design for mobile devices
  ✓ All external references removed
  ✓ Fully self-contained application

Press Ctrl+C to stop the server
========================================
    `);
});
