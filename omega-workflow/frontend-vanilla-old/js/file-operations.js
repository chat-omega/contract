// File Operations (Rename & Delete) Functions

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

let selectedDocumentsForFiles = new Set();
let currentDocumentForRename = null;

// Files Dropdown State Management
function updateFilesDropdownState() {
    const checkboxes = document.querySelectorAll('.checkbox-row:checked');
    const filesDropdown = document.getElementById('files-dropdown');
    const filesDropdownText = document.getElementById('files-dropdown-text');

    selectedDocumentsForFiles.clear();
    checkboxes.forEach(checkbox => {
        selectedDocumentsForFiles.add({
            id: checkbox.dataset.docId,
            name: checkbox.dataset.docName
        });
    });

    const selectedCount = selectedDocumentsForFiles.size;

    if (selectedCount === 0) {
        filesDropdown.disabled = true;
        filesDropdownText.textContent = 'Files';
    } else {
        filesDropdown.disabled = false;
        filesDropdownText.textContent = `Files (${selectedCount} selected)`;
    }
}

// Open rename document modal
function openRenameDocumentModal() {
    // Only allow renaming a single document at a time
    if (selectedDocumentsForFiles.size !== 1) {
        showMessage('Please select exactly one document to rename', 'error');
        return;
    }

    const doc = Array.from(selectedDocumentsForFiles)[0];
    currentDocumentForRename = doc;

    const modal = document.getElementById('rename-document-modal');
    const input = document.getElementById('new-document-name');
    const charCount = document.getElementById('rename-char-count');
    const saveBtn = document.getElementById('save-rename-btn');

    if (modal && input) {
        // Pre-fill with current document name
        input.value = doc.name;
        if (charCount) {
            charCount.textContent = doc.name.length;
        }
        if (saveBtn) {
            saveBtn.disabled = false;
        }
        modal.style.display = 'flex';
        input.focus();
    }
}

// Open delete confirmation modal
function openDeleteDocumentModal() {
    if (selectedDocumentsForFiles.size === 0) return;

    const docCount = selectedDocumentsForFiles.size;
    const deleteDocCount = document.getElementById('delete-doc-count');
    const deleteDocPlural = document.getElementById('delete-doc-plural');
    const deleteWarningPlural = document.getElementById('delete-warning-plural');
    const deleteDocList = document.getElementById('delete-document-list');

    if (deleteDocCount) deleteDocCount.textContent = docCount;
    if (deleteDocPlural) deleteDocPlural.style.display = docCount === 1 ? '' : 's';
    if (deleteWarningPlural) deleteWarningPlural.textContent = docCount === 1 ? '' : 's';

    // Display list of documents to be deleted
    if (deleteDocList) {
        deleteDocList.innerHTML = Array.from(selectedDocumentsForFiles)
            .map(doc => `<div class="delete-document-item">
                <span class="material-icons">description</span>
                <span class="document-name">${doc.name}</span>
            </div>`)
            .join('');
    }

    const modal = document.getElementById('delete-document-modal');
    if (modal) {
        modal.style.display = 'flex';
    }
}

// Close modals
function closeRenameDocumentModal() {
    const modal = document.getElementById('rename-document-modal');
    const input = document.getElementById('new-document-name');

    if (modal) {
        modal.style.display = 'none';
    }
    if (input) {
        input.value = '';
    }
    currentDocumentForRename = null;
}

function closeDeleteDocumentModal() {
    const modal = document.getElementById('delete-document-modal');
    if (modal) {
        modal.style.display = 'none';
    }
}

// Rename document
async function renameDocument() {
    if (!currentDocumentForRename) return;

    const input = document.getElementById('new-document-name');
    const newName = input.value.trim();

    if (!newName) {
        showMessage('Document name cannot be empty', 'error');
        return;
    }

    if (newName === currentDocumentForRename.name) {
        closeRenameDocumentModal();
        return;
    }

    try {
        const response = await fetch(`/api/documents/${currentDocumentForRename.id}`, {
            method: 'PATCH',
            headers: getAuthHeaders(),
            body: JSON.stringify({ name: newName })
        });

        if (response.ok) {
            const data = await response.json();
            showMessage('Document renamed successfully', 'success');
            closeRenameDocumentModal();

            // Refresh the document list
            if (window.loadDocuments) {
                await window.loadDocuments();
            }
        } else {
            const error = await response.json();
            showMessage(error.detail || 'Error renaming document', 'error');
        }
    } catch (error) {
        console.error('Error renaming document:', error);
        showMessage('Error renaming document', 'error');
    }
}

// Delete documents
async function deleteDocuments() {
    if (selectedDocumentsForFiles.size === 0) return;

    try {
        const promises = [];

        for (const doc of selectedDocumentsForFiles) {
            promises.push(
                fetch(`/api/documents/${doc.id}`, {
                    method: 'DELETE',
                    headers: getAuthHeaders()
                })
            );
        }

        const results = await Promise.all(promises);
        const successCount = results.filter(r => r.ok).length;

        if (successCount === selectedDocumentsForFiles.size) {
            showMessage(`${successCount} document${successCount === 1 ? '' : 's'} deleted successfully`, 'success');
        } else {
            showMessage(`${successCount} of ${selectedDocumentsForFiles.size} documents deleted`, 'warning');
        }

        closeDeleteDocumentModal();

        // Clear selections
        selectedDocumentsForFiles.clear();
        const selectAllCheckbox = document.querySelector('.checkbox-all');
        if (selectAllCheckbox) {
            selectAllCheckbox.checked = false;
        }

        // Refresh the document list
        if (window.loadDocuments) {
            await window.loadDocuments();
        }

        // Update dropdown state
        updateFilesDropdownState();

    } catch (error) {
        console.error('Error deleting documents:', error);
        showMessage('Error deleting documents', 'error');
    }
}

// Show message notification
function showMessage(message, type) {
    const messageDiv = document.createElement('div');
    messageDiv.className = `message message-${type}`;
    messageDiv.textContent = message;
    messageDiv.style.position = 'fixed';
    messageDiv.style.top = '20px';
    messageDiv.style.right = '20px';
    messageDiv.style.padding = '12px 20px';
    messageDiv.style.borderRadius = '4px';
    messageDiv.style.zIndex = '9999';

    if (type === 'success') {
        messageDiv.style.backgroundColor = '#4caf50';
    } else if (type === 'warning') {
        messageDiv.style.backgroundColor = '#ff9800';
    } else {
        messageDiv.style.backgroundColor = '#f44336';
    }

    messageDiv.style.color = 'white';
    messageDiv.style.fontWeight = '500';
    messageDiv.style.boxShadow = '0 2px 8px rgba(0,0,0,0.2)';

    document.body.appendChild(messageDiv);

    setTimeout(() => {
        if (messageDiv.parentNode) {
            messageDiv.remove();
        }
    }, 3000);
}

// Initialize file operations
function initializeFileOperations() {
    // Files dropdown toggle
    const filesDropdown = document.getElementById('files-dropdown');
    const filesDropdownMenu = document.getElementById('files-dropdown-menu');

    if (filesDropdown && filesDropdownMenu) {
        filesDropdown.addEventListener('click', function(e) {
            if (!this.disabled) {
                e.stopPropagation();
                const isVisible = filesDropdownMenu.style.display === 'block';
                filesDropdownMenu.style.display = isVisible ? 'none' : 'block';
            }
        });

        // Close dropdown when clicking outside
        document.addEventListener('click', function() {
            filesDropdownMenu.style.display = 'none';
        });
    }

    // Dropdown menu items
    const renameDocumentBtn = document.getElementById('rename-document-btn');
    const deleteDocumentBtn = document.getElementById('delete-document-btn');

    if (renameDocumentBtn) {
        renameDocumentBtn.addEventListener('click', function(e) {
            e.stopPropagation();
            filesDropdownMenu.style.display = 'none';
            openRenameDocumentModal();
        });
    }

    if (deleteDocumentBtn) {
        deleteDocumentBtn.addEventListener('click', function(e) {
            e.stopPropagation();
            filesDropdownMenu.style.display = 'none';
            openDeleteDocumentModal();
        });
    }

    // Rename modal event listeners
    const closeRenameBtn = document.getElementById('close-rename-modal');
    const cancelRenameBtn = document.getElementById('cancel-rename-btn');
    const saveRenameBtn = document.getElementById('save-rename-btn');
    const renameModal = document.getElementById('rename-document-modal');
    const renameInput = document.getElementById('new-document-name');
    const renameCharCount = document.getElementById('rename-char-count');

    if (closeRenameBtn) closeRenameBtn.addEventListener('click', closeRenameDocumentModal);
    if (cancelRenameBtn) cancelRenameBtn.addEventListener('click', closeRenameDocumentModal);
    if (saveRenameBtn) saveRenameBtn.addEventListener('click', renameDocument);

    if (renameModal) {
        renameModal.addEventListener('click', function(e) {
            if (e.target === renameModal) closeRenameDocumentModal();
        });
    }

    if (renameInput && renameCharCount && saveRenameBtn) {
        renameInput.addEventListener('input', function() {
            const length = this.value.length;
            renameCharCount.textContent = length;
            saveRenameBtn.disabled = length === 0 || this.value.trim() === '';
        });

        // Allow Enter key to submit
        renameInput.addEventListener('keypress', function(e) {
            if (e.key === 'Enter' && !saveRenameBtn.disabled) {
                renameDocument();
            }
        });
    }

    // Delete modal event listeners
    const closeDeleteBtn = document.getElementById('close-delete-modal');
    const cancelDeleteBtn = document.getElementById('cancel-delete-btn');
    const confirmDeleteBtn = document.getElementById('confirm-delete-btn');
    const deleteModal = document.getElementById('delete-document-modal');

    if (closeDeleteBtn) closeDeleteBtn.addEventListener('click', closeDeleteDocumentModal);
    if (cancelDeleteBtn) cancelDeleteBtn.addEventListener('click', closeDeleteDocumentModal);
    if (confirmDeleteBtn) confirmDeleteBtn.addEventListener('click', deleteDocuments);

    if (deleteModal) {
        deleteModal.addEventListener('click', function(e) {
            if (e.target === deleteModal) closeDeleteDocumentModal();
        });
    }
}

// Initialize when DOM is loaded
document.addEventListener('DOMContentLoaded', initializeFileOperations);

// Export functions for global access
window.updateFilesDropdownState = updateFilesDropdownState;
window.openRenameDocumentModal = openRenameDocumentModal;
window.openDeleteDocumentModal = openDeleteDocumentModal;
