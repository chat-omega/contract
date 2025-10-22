// Document Upload and Management Functions
console.log('🔧 UPLOAD.JS LOADED - Version 20251016-v3 - Fixed Syntax Error + Exported Functions');
let selectedFiles = [];

// Helper function to get authentication headers
function getAuthHeaders() {
    const token = localStorage.getItem('authToken');
    const headers = {
        'Content-Type': 'application/json'
    };
    
    if (token) {
        headers['Authorization'] = `Bearer ${token}`;
    }
    
    return headers;
}

// Helper function for multipart form headers (for file uploads)
function getAuthFormHeaders() {
    const token = localStorage.getItem('authToken');
    const headers = {};
    
    if (token) {
        headers['Authorization'] = `Bearer ${token}`;
    }
    
    return headers;
}

// Function to open document detail page
function openDocumentDetail(docId) {
    // Navigate to document detail page with document ID
    window.location.href = `document-detail.html?id=${docId}`;
}

function openUploadModal() {
    console.log('📤 openUploadModal() called');
    const modal = document.getElementById('upload-modal');
    console.log('📤 Upload modal element found:', !!modal);

    if (modal) {
        console.log('📤 Setting modal display to flex...');
        modal.style.display = 'flex';
        selectedFiles = [];
        resetUploadModal();
        console.log('✅ Upload modal opened successfully');
    } else {
        console.error('❌ ERROR: Upload modal element (#upload-modal) not found in DOM!');
    }
}

function closeUploadModal() {
    const modal = document.getElementById('upload-modal');
    if (modal) {
        modal.style.display = 'none';
        selectedFiles = [];
        resetUploadModal();
    }
}

function resetUploadModal() {
    const fileList = document.getElementById('file-list');
    const fileItems = document.getElementById('file-items');
    const uploadBtn = document.getElementById('upload-btn');
    const progressDiv = document.getElementById('upload-progress');
    const fileInput = document.getElementById('file-input');
    
    if (fileList) fileList.style.display = 'none';
    if (fileItems) fileItems.innerHTML = '';
    if (uploadBtn) uploadBtn.disabled = true;
    if (progressDiv) progressDiv.style.display = 'none';
    if (fileInput) fileInput.value = '';
}

function handleFileSelect(files) {
    selectedFiles = Array.from(files);
    displaySelectedFiles();
}

function displaySelectedFiles() {
    const fileList = document.getElementById('file-list');
    const fileItems = document.getElementById('file-items');
    const uploadBtn = document.getElementById('upload-btn');
    
    if (!fileList || !fileItems || !uploadBtn) return;
    
    if (selectedFiles.length > 0) {
        fileList.style.display = 'block';
        fileItems.innerHTML = selectedFiles.map((file, index) => `
            <div class="file-item">
                <span class="material-icons">insert_drive_file</span>
                <span class="file-name">${file.name}</span>
                <span class="file-size">${formatFileSize(file.size)}</span>
                <button class="remove-file" data-index="${index}">
                    <span class="material-icons">close</span>
                </button>
            </div>
        `).join('');
        
        uploadBtn.disabled = false;
        
        // Add remove file handlers
        document.querySelectorAll('.remove-file').forEach(btn => {
            btn.addEventListener('click', function() {
                const index = parseInt(this.dataset.index);
                selectedFiles.splice(index, 1);
                displaySelectedFiles();
            });
        });
    } else {
        fileList.style.display = 'none';
        uploadBtn.disabled = true;
    }
}

function formatFileSize(bytes) {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return Math.round(bytes / Math.pow(k, i) * 100) / 100 + ' ' + sizes[i];
}

async function uploadFiles() {
    console.log('🚀 UPLOAD FUNCTION CALLED - Version 20251011-v4');
    
    const progressDiv = document.getElementById('upload-progress');
    const progressFill = document.getElementById('progress-fill');
    const progressText = document.getElementById('progress-text');
    const uploadBtn = document.getElementById('upload-btn');
    
    console.log('📋 Upload elements found:', {
        progressDiv: !!progressDiv,
        progressFill: !!progressFill,
        progressText: !!progressText,
        uploadBtn: !!uploadBtn
    });
    
    // Validate file sizes before upload (50MB per file limit)
    const maxFileSize = 50 * 1024 * 1024; // 50MB in bytes
    const oversizedFiles = selectedFiles.filter(file => file.size > maxFileSize);
    
    if (oversizedFiles.length > 0) {
        const fileList = oversizedFiles.map(f => `${f.name} (${formatFileSize(f.size)})`).join(', ');
        const errorMessage = `File(s) too large: ${fileList}. Maximum file size is 50MB per file.`;
        console.log('❌ File size validation failed:', errorMessage);
        showUploadError(errorMessage);
        return;
    }
    
    progressDiv.style.display = 'block';
    uploadBtn.disabled = true;
    progressText.textContent = 'Uploading...';
    progressFill.style.width = '20%';
    
    const formData = new FormData();
    selectedFiles.forEach(file => {
        formData.append('files', file);
    });
    
    console.log(`📤 Starting upload of ${selectedFiles.length} file(s)`);
    
    try {
        const response = await fetch('/api/documents/upload', {
            method: 'POST',
            headers: getAuthFormHeaders(),
            body: formData
        });
        
        console.log(`📥 Upload response status: ${response.status}`);
        
        // Enhanced error handling with detailed logging
        let result;
        const contentType = response.headers.get('content-type') || 'unknown';
        const responseSize = response.headers.get('content-length') || 'unknown';
        
        console.log('📋 Response details:', {
            status: response.status,
            statusText: response.statusText,
            contentType: contentType,
            contentLength: responseSize,
            url: response.url
        });
        
        // Handle specific HTTP status codes
        if (response.status === 413) {
            console.log('🚫 HTTP 413: File too large error detected');
            try {
                result = await response.json();
                console.log('📋 413 JSON response:', result);
            } catch (parseError) {
                console.log('📋 413 response not JSON, creating structured error');
                result = {
                    error: 'File too large',
                    message: 'One or more files exceed the 50MB size limit.',
                    details: 'Please select smaller files and try again.'
                };
            }
            throw new Error(result.message || result.error || 'File size limit exceeded');
            
        } else if (response.status === 502) {
            console.log('🚫 HTTP 502: Backend service unavailable');
            throw new Error('Backend service temporarily unavailable. Please try again in a moment.');
            
        } else if (response.status === 504) {
            console.log('🚫 HTTP 504: Request timeout');
            throw new Error('Upload timed out. Please try with smaller files or check your connection.');
            
        } else {
            // Handle normal responses (both success and other errors)
            try {
                result = await response.json();
                console.log('📋 Parsed response:', result);
            } catch (parseError) {
                console.error('❌ JSON parse error for status', response.status, ':', parseError);
                
                // Try to get response text for debugging
                try {
                    const responseText = await response.text();
                    console.log('📋 Raw response text (first 500 chars):', responseText.substring(0, 500));
                    
                    // Check if it's HTML (common for proxy errors)
                    if (responseText.includes('<!DOCTYPE') || responseText.includes('<html')) {
                        throw new Error('Server returned an HTML page instead of data. Please try again.');
                    } else {
                        throw new Error(`Server returned invalid data format (Status: ${response.status})`);
                    }
                } catch (textError) {
                    console.error('❌ Could not read response text:', textError);
                    throw new Error(`Server communication error (Status: ${response.status})`);
                }
            }
        }
        
        if (response.ok) {
            progressFill.style.width = '100%';
            
            if (result.warning) {
                // Some files failed
                progressText.textContent = 'Upload completed with warnings';
                showUploadResults(result);
                
                setTimeout(() => {
                    closeUploadModal();
                    loadDocuments();
                }, 3000);
            } else {
                // All files succeeded
                progressText.textContent = 'Upload complete!';
                
                setTimeout(() => {
                    closeUploadModal();
                    loadDocuments();
                }, 1500);
            }
        } else {
            // Server returned an error status
            throw new Error(result.details || result.error || 'Upload failed');
        }
    } catch (error) {
        console.error('❌ UPLOAD ERROR CAUGHT - Version 20251011-v4:', error);
        console.error('❌ Error type:', typeof error);
        console.error('❌ Error message:', error.message);
        console.error('❌ Error stack:', error.stack);
        
        // Show detailed error message
        const errorMessage = getDetailedErrorMessage(error);
        console.log('📝 Generated error message:', errorMessage);
        showUploadError(errorMessage);
        
        progressDiv.style.display = 'none';
        uploadBtn.disabled = false;
    }
}

function getDetailedErrorMessage(error) {
    if (error.message) {
        // If it's a structured error with details
        if (error.message.includes('Authentication required')) {
            return 'Authentication failed. Please log in again and try uploading.';
        } else if (error.message.includes('File size exceeds')) {
            return 'One or more files are too large. Maximum file size is 50MB.';
        } else if (error.message.includes('Database error')) {
            return 'Server database error. Please try again later or contact support.';
        } else if (error.message.includes('Upload directory not accessible')) {
            return 'Server storage error. Please try again later or contact support.';
        } else {
            return `Upload failed: ${error.message}`;
        }
    } else {
        return 'Upload failed due to network or server error. Please check your connection and try again.';
    }
}

function showUploadError(message) {
    console.log('🔴 SHOWING UPLOAD ERROR - Version 20251011-v4:', message);
    
    // Create or update error display
    const progressDiv = document.getElementById('upload-progress');
    if (progressDiv) {
        progressDiv.innerHTML = `
            <div style="text-align: center; padding: 16px; color: #dc2626;">
                <div style="font-size: 24px; margin-bottom: 8px;">❌</div>
                <div style="font-weight: bold; margin-bottom: 8px;">Upload Failed</div>
                <div style="font-size: 14px; line-height: 1.4;">${message}</div>
                <button onclick="resetUploadError()" style="margin-top: 16px; padding: 8px 16px; background: #dc2626; color: white; border: none; border-radius: 4px; cursor: pointer;">
                    Try Again
                </button>
            </div>
        `;
        progressDiv.style.display = 'block';
    } else {
        // Fallback to alert if progress div is not available
        alert(message);
    }
}

function showUploadResults(result) {
    const progressDiv = document.getElementById('upload-progress');
    if (progressDiv && result.failed_files && result.failed_files.length > 0) {
        const successCount = result.files ? result.files.length : 0;
        const failedCount = result.failed_files.length;
        
        const failedList = result.failed_files.map(f => 
            `• ${f.name}: ${f.error}`
        ).join('\n');
        
        progressDiv.innerHTML = `
            <div style="text-align: center; padding: 16px;">
                <div style="font-size: 24px; margin-bottom: 8px;">⚠️</div>
                <div style="font-weight: bold; margin-bottom: 8px;">Partial Upload Success</div>
                <div style="font-size: 14px; margin-bottom: 12px;">
                    ${successCount} file(s) uploaded successfully<br>
                    ${failedCount} file(s) failed
                </div>
                <div style="text-align: left; font-size: 12px; background: #f9f9f9; padding: 8px; border-radius: 4px; margin: 8px 0;">
                    <strong>Failed files:</strong><br>
                    ${failedList}
                </div>
            </div>
        `;
    }
}

function resetUploadError() {
    const progressDiv = document.getElementById('upload-progress');
    const uploadBtn = document.getElementById('upload-btn');
    
    if (progressDiv) {
        progressDiv.style.display = 'none';
    }
    if (uploadBtn) {
        uploadBtn.disabled = false;
    }
}

async function loadDocuments() {
    console.log('🔄 loadDocuments() called');

    try {
        // Check if we have an auth token
        const token = localStorage.getItem('authToken');
        console.log('🔑 Auth token present:', !!token);
        if (token) {
            console.log('🔑 Token preview (first 20 chars):', token.substring(0, 20) + '...');
        } else {
            console.warn('⚠️  No auth token found in localStorage');
            displayAuthRequiredMessage();
            return;
        }

        const headers = getAuthHeaders();
        console.log('📤 Request headers:', Object.keys(headers));

        const response = await fetch('/api/documents', {
            headers: headers
        });

        console.log('📥 Response status:', response.status, response.statusText);
        console.log('📥 Response headers:', Object.fromEntries(response.headers.entries()));

        if (response.ok) {
            const documents = await response.json();
            console.log('✅ Documents loaded successfully:', documents.length, 'documents');
            displayDocuments(documents);
        } else if (response.status === 401) {
            // Authentication failed - token is invalid or expired
            console.error('❌ Authentication failed (401)');
            console.log('   Token was sent but backend rejected it');
            console.log('   This usually means the token is invalid or expired');

            // Try to get error details
            try {
                const errorData = await response.json();
                console.error('   Error details:', errorData);
            } catch (e) {
                console.error('   Could not parse error response');
            }

            displayAuthRequiredMessage();
        } else {
            console.error('❌ Failed to load documents:', response.status, response.statusText);

            // Try to get error details
            try {
                const errorData = await response.json();
                console.error('   Error details:', errorData);
            } catch (e) {
                console.error('   Could not parse error response');
            }

            displayDocuments([]);
        }
    } catch (error) {
        console.error('❌ Error loading documents:', error);
        console.error('   Error type:', error.name);
        console.error('   Error message:', error.message);
        console.error('   Error stack:', error.stack);

        // Check if user has a token to determine if it's an auth issue or network issue
        const token = localStorage.getItem('authToken');
        if (!token) {
            console.log('   No token found - showing auth required message');
            displayAuthRequiredMessage();
        } else {
            console.log('   Token exists but request failed - showing empty documents');
            displayDocuments([]);
        }
    }
}

function displayDocuments(documents) {
    console.log('📋 displayDocuments() called with', documents ? documents.length : 0, 'documents');

    const tbody = document.getElementById('documents-tbody');
    const paginationInfo = document.getElementById('pagination-info');

    if (!tbody) {
        console.error('❌ documents-tbody element not found');
        return;
    }

    try {
        if (!documents || documents.length === 0) {
            tbody.innerHTML = `
                <tr>
                    <td colspan="7" style="text-align: center; padding: 40px; color: #6b7280;">
                        <div>
                            <span class="material-icons" style="font-size: 48px; margin-bottom: 16px; display: block;">folder_open</span>
                            <p style="margin: 0;">No documents uploaded yet</p>
                            <p style="margin: 8px 0 0 0; font-size: 14px;">Click "Add Documents" to upload your first document</p>
                        </div>
                    </td>
                </tr>
            `;
            if (paginationInfo) {
                paginationInfo.textContent = '0–0 of 0';
            }
        } else {
        tbody.innerHTML = documents.map(doc => `
            <tr data-doc-id="${doc.id}">
                <td><input type="checkbox" class="checkbox-row" data-doc-id="${doc.id}" data-doc-name="${doc.name}"></td>
                <td>
                    <span class="material-icons doc-icon">insert_drive_file</span>
                    <span class="document-name-link" data-doc-id="${doc.id}" style="cursor: pointer; color: #1976d2; text-decoration: none;" onmouseover="this.style.textDecoration='underline'" onmouseout="this.style.textDecoration='none'">${doc.name}</span>
                </td>
                <td>${formatDate(doc.uploadedAt)}</td>
                <td>${doc.uploadedBy || 'You'}</td>
                <td>${doc.type ? `<span class="chip">${doc.type}</span>` : ''}</td>
                <td id="doc-workflows-${doc.id}">
                    ${doc.workflowNames && doc.workflowNames.length > 0 ? 
                        doc.workflowNames.map(wf => `<span class="chip workflow-chip">${wf}</span>`).join('') : 
                        '<span class="text-muted">No workflows</span>'}
                </td>
                <td>${doc.reviewers || ''}</td>
            </tr>
        `).join('');
        
        // Add event listeners for document row checkboxes
        document.querySelectorAll('.checkbox-row').forEach(checkbox => {
            checkbox.addEventListener('change', function() {
                // Defensive check: make sure the function exists
                if (typeof updateWorkflowDropdownState === 'function') {
                    updateWorkflowDropdownState();
                } else {
                    console.warn('⚠️  updateWorkflowDropdownState is not defined yet');
                }

                // Also update Files dropdown state
                if (typeof updateFilesDropdownState === 'function') {
                    updateFilesDropdownState();
                } else {
                    console.warn('⚠️  updateFilesDropdownState is not defined yet');
                }
            });
        });

        // Add event listeners for document name links
        document.querySelectorAll('.document-name-link').forEach(link => {
            link.addEventListener('click', function(e) {
                e.preventDefault();
                e.stopPropagation(); // Prevent row selection
                const docId = this.dataset.docId;
                openDocumentDetail(docId);
            });
        });
        
        if (paginationInfo) {
            const start = documents.length > 0 ? 1 : 0;
            paginationInfo.textContent = `${start}–${documents.length} of ${documents.length}`;
        }

        console.log('✅ displayDocuments() completed successfully');
        }
    } catch (error) {
        console.error('❌ Error in displayDocuments():', error);
        console.error('   Error details:', error.message);
        console.error('   Error stack:', error.stack);

        // Show error state in the table
        tbody.innerHTML = `
            <tr>
                <td colspan="7" style="text-align: center; padding: 40px; color: #dc2626;">
                    <div>
                        <span class="material-icons" style="font-size: 48px; margin-bottom: 16px; display: block;">error</span>
                        <p style="margin: 0; font-weight: bold;">Error displaying documents</p>
                        <p style="margin: 8px 0 0 0; font-size: 14px;">${error.message}</p>
                    </div>
                </td>
            </tr>
        `;
    }
}

function displayAuthRequiredMessage() {
    const tbody = document.getElementById('documents-tbody');
    const paginationInfo = document.getElementById('pagination-info');
    
    if (!tbody) return;
    
    tbody.innerHTML = `
        <tr>
            <td colspan="7" style="text-align: center; padding: 40px; color: #6b7280;">
                <div>
                    <span class="material-icons" style="font-size: 48px; margin-bottom: 16px; display: block; color: #f59e0b;">lock</span>
                    <h3 style="margin: 0 0 8px 0; color: #374151;">Authentication Required</h3>
                    <p style="margin: 8px 0 16px 0;">Please log in to view and manage your documents</p>
                    <button onclick="window.location.href='/login.html'" style="background: #1976d2; color: white; border: none; padding: 8px 16px; border-radius: 4px; cursor: pointer;">
                        Go to Login
                    </button>
                </div>
            </td>
        </tr>
    `;
    
    if (paginationInfo) {
        paginationInfo.textContent = '0–0 of 0';
    }
}

function formatDate(dateString) {
    if (!dateString) return '';
    const date = new Date(dateString);
    const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
    return `${months[date.getMonth()]} ${date.getDate()}, ${date.getFullYear()}`;
}

// Initialize upload modal event handlers
function initializeUploadModal() {
    // Close modal button
    const closeBtn = document.getElementById('close-upload-modal');
    if (closeBtn) {
        closeBtn.addEventListener('click', closeUploadModal);
    }
    
    // Cancel button
    const cancelBtn = document.getElementById('cancel-upload-btn');
    if (cancelBtn) {
        cancelBtn.addEventListener('click', closeUploadModal);
    }
    
    // Browse files button
    const browseBtn = document.getElementById('browse-files-btn');
    const fileInput = document.getElementById('file-input');
    if (browseBtn && fileInput) {
        browseBtn.addEventListener('click', () => fileInput.click());
        fileInput.addEventListener('change', (e) => handleFileSelect(e.target.files));
    }
    
    // Upload button
    const uploadBtn = document.getElementById('upload-btn');
    if (uploadBtn) {
        uploadBtn.addEventListener('click', uploadFiles);
    }
    
    // Drag and drop
    const dropZone = document.getElementById('drop-zone');
    if (dropZone) {
        dropZone.addEventListener('dragover', (e) => {
            e.preventDefault();
            dropZone.classList.add('drag-over');
        });
        
        dropZone.addEventListener('dragleave', () => {
            dropZone.classList.remove('drag-over');
        });
        
        dropZone.addEventListener('drop', (e) => {
            e.preventDefault();
            dropZone.classList.remove('drag-over');
            handleFileSelect(e.dataTransfer.files);
        });
    }
    
    // Click outside modal to close
    const modal = document.getElementById('upload-modal');
    if (modal) {
        modal.addEventListener('click', (e) => {
            if (e.target === modal) {
                closeUploadModal();
            }
        });
    }
}

// Initialize on page load
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', () => {
        initializeUploadModal();
        loadDocuments();
    });
} else {
    initializeUploadModal();
    loadDocuments();
}

// Export functions for global access (needed by app.js and other files)
window.openUploadModal = openUploadModal;
window.closeUploadModal = closeUploadModal;
window.loadDocuments = loadDocuments;