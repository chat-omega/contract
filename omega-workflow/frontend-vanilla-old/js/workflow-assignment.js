// Enhanced Workflow Assignment Functions

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

let selectedDocuments = new Set();
let selectedWorkflows = new Set();
let savedWorkflows = [];
let allDocuments = [];

// Document Selection Management
function updateWorkflowDropdownState() {
    const checkboxes = document.querySelectorAll('.checkbox-row:checked');
    const workflowsDropdown = document.getElementById('workflows-dropdown');
    const workflowsDropdownText = document.getElementById('workflows-dropdown-text');
    
    selectedDocuments.clear();
    checkboxes.forEach(checkbox => {
        selectedDocuments.add({
            id: checkbox.dataset.docId,
            name: checkbox.dataset.docName
        });
    });
    
    const selectedCount = selectedDocuments.size;
    
    if (selectedCount === 0) {
        workflowsDropdown.disabled = true;
        workflowsDropdownText.textContent = 'Workflows';
    } else {
        workflowsDropdown.disabled = false;
        workflowsDropdownText.textContent = `Workflows (${selectedCount} selected)`;
    }
}

// Open assign workflow modal
function openAssignWorkflowModal() {
    if (selectedDocuments.size === 0) return;
    
    const docCount = selectedDocuments.size;
    const assignDocCount = document.getElementById('assign-doc-count');
    const assignDocPlural = document.getElementById('assign-doc-plural');
    
    if (assignDocCount) assignDocCount.textContent = docCount;
    if (assignDocPlural) assignDocPlural.style.display = docCount === 1 ? 'none' : 'inline';
    
    const modal = document.getElementById('assign-workflow-modal');
    if (modal) {
        modal.style.display = 'flex';
        loadAvailableWorkflows();
    }
}

// Open remove workflow modal
function openRemoveWorkflowModal() {
    if (selectedDocuments.size === 0) return;
    
    const docCount = selectedDocuments.size;
    const removeDocCount = document.getElementById('remove-doc-count');
    const removeDocPlural = document.getElementById('remove-doc-plural');
    
    if (removeDocCount) removeDocCount.textContent = docCount;
    if (removeDocPlural) removeDocPlural.style.display = docCount === 1 ? 'none' : 'inline';
    
    const modal = document.getElementById('remove-workflow-modal');
    if (modal) {
        modal.style.display = 'flex';
        loadAssignedWorkflows();
    }
}

// Close modals
function closeAssignWorkflowModal() {
    const modal = document.getElementById('assign-workflow-modal');
    if (modal) {
        modal.style.display = 'none';
        selectedWorkflows.clear();
    }
}

function closeRemoveWorkflowModal() {
    const modal = document.getElementById('remove-workflow-modal');
    if (modal) {
        modal.style.display = 'none';
        selectedWorkflows.clear();
    }
}

// Load available workflows for assignment
async function loadAvailableWorkflows() {
    try {
        const workflowsResponse = await fetch('/api/workflows/saved', {
            headers: getAuthHeaders()
        });
        if (workflowsResponse.ok) {
            savedWorkflows = await workflowsResponse.json();
        } else {
            savedWorkflows = [];
        }

        displayAvailableWorkflowsForAssignment();

    } catch (error) {
        console.error('Error loading workflows:', error);
        displayAvailableWorkflowsForAssignment();
    }
}

// Load assigned workflows for removal
async function loadAssignedWorkflows() {
    try {
        // Get all unique workflows assigned to selected documents
        const assignedWorkflowsSet = new Set();
        
        for (const doc of selectedDocuments) {
            const response = await fetch(`/api/documents/${doc.id}/workflows`);
            if (response.ok) {
                const data = await response.json();
                if (data.workflowIds) {
                    data.workflowIds.forEach(id => assignedWorkflowsSet.add(id));
                }
            }
        }
        
        // Load saved workflows to get full workflow data
        const workflowsResponse = await fetch('/api/workflows/saved', {
            headers: getAuthHeaders()
        });
        if (workflowsResponse.ok) {
            savedWorkflows = await workflowsResponse.json();
        }
        
        const assignedWorkflows = savedWorkflows.filter(wf => assignedWorkflowsSet.has(wf.id));
        displayAssignedWorkflowsForRemoval(assignedWorkflows);
        
    } catch (error) {
        console.error('Error loading assigned workflows:', error);
        displayAssignedWorkflowsForRemoval([]);
    }
}

// Display available workflows in card format
function displayAvailableWorkflowsForAssignment() {
    const container = document.getElementById('assign-available-workflows');
    if (!container) return;
    
    if (savedWorkflows.length === 0) {
        container.innerHTML = `
            <div class="empty-workflows">
                <div class="empty-state">
                    <span class="material-icons">account_tree</span>
                    <h4>No workflows available</h4>
                    <p>Create workflows using "Create Workflow" or copy from the Workflow Library.</p>
                </div>
            </div>
        `;
    } else {
        container.innerHTML = savedWorkflows.map(wf => `
            <div class="workflow-card" data-workflow-id="${wf.id}">
                <div class="workflow-card-header">
                    <input type="checkbox" 
                           id="assign-wf-${wf.id}" 
                           value="${wf.id}"
                           class="workflow-card-checkbox"
                           data-workflow-name="${wf.name}">
                    <label for="assign-wf-${wf.id}" class="workflow-card-title">${wf.name}</label>
                </div>
                <div class="workflow-card-meta">
                    <span class="workflow-field-count">${formatFieldCount(wf.fields)} fields</span>
                    ${wf.status ? `<span class="workflow-status status-${wf.status.toLowerCase()}">${wf.status}</span>` : ''}
                </div>
                ${wf.description ? `<p class="workflow-card-description">${wf.description}</p>` : ''}
            </div>
        `).join('');
        
        // Add event listeners to checkboxes
        document.querySelectorAll('.workflow-card-checkbox').forEach(checkbox => {
            checkbox.addEventListener('change', function() {
                const card = this.closest('.workflow-card');
                const workflowId = parseInt(this.value, 10); // Convert to integer
                if (this.checked) {
                    selectedWorkflows.add(workflowId);
                    card.classList.add('selected');
                } else {
                    selectedWorkflows.delete(workflowId);
                    card.classList.remove('selected');
                }
                updateAssignButtonState();
            });
        });
    }
}

// Display assigned workflows for removal
function displayAssignedWorkflowsForRemoval(workflows) {
    const container = document.getElementById('remove-assigned-workflows');
    if (!container) return;
    
    if (workflows.length === 0) {
        container.innerHTML = `
            <div class="empty-workflows">
                <div class="empty-state">
                    <span class="material-icons">rule</span>
                    <h4>No workflows assigned</h4>
                    <p>The selected documents don't have any workflows assigned.</p>
                </div>
            </div>
        `;
    } else {
        container.innerHTML = workflows.map(wf => `
            <div class="workflow-card" data-workflow-id="${wf.id}">
                <div class="workflow-card-header">
                    <input type="checkbox" 
                           id="remove-wf-${wf.id}" 
                           value="${wf.id}"
                           class="workflow-card-checkbox"
                           data-workflow-name="${wf.name}">
                    <label for="remove-wf-${wf.id}" class="workflow-card-title">${wf.name}</label>
                </div>
                <div class="workflow-card-meta">
                    <span class="workflow-field-count">${formatFieldCount(wf.fields)} fields</span>
                    ${wf.status ? `<span class="workflow-status status-${wf.status.toLowerCase()}">${wf.status}</span>` : ''}
                </div>
                ${wf.description ? `<p class="workflow-card-description">${wf.description}</p>` : ''}
            </div>
        `).join('');
        
        // Add event listeners to checkboxes
        document.querySelectorAll('.workflow-card-checkbox').forEach(checkbox => {
            checkbox.addEventListener('change', function() {
                const card = this.closest('.workflow-card');
                const workflowId = parseInt(this.value, 10); // Convert to integer
                if (this.checked) {
                    selectedWorkflows.add(workflowId);
                    card.classList.add('selected');
                } else {
                    selectedWorkflows.delete(workflowId);
                    card.classList.remove('selected');
                }
                updateRemoveButtonState();
            });
        });
    }
}

// Fix the field count display issue
function formatFieldCount(fields) {
    if (!fields) return '0';
    
    // Handle different field data types
    if (typeof fields === 'number') {
        return fields.toString();
    } else if (typeof fields === 'object' && fields !== null) {
        // If fields is an object, count the total fields
        if (Array.isArray(fields)) {
            return fields.length.toString();
        } else {
            // If it's an object with categories, sum all fields
            let totalFields = 0;
            Object.values(fields).forEach(category => {
                if (Array.isArray(category)) {
                    totalFields += category.length;
                }
            });
            return totalFields.toString();
        }
    } else if (typeof fields === 'string') {
        // Try to parse as number
        const parsed = parseInt(fields);
        return isNaN(parsed) ? '0' : parsed.toString();
    }
    
    return '0';
}

// Update button states
function updateAssignButtonState() {
    const saveBtn = document.getElementById('save-assign-btn');
    if (saveBtn) {
        saveBtn.disabled = selectedWorkflows.size === 0;
        saveBtn.textContent = selectedWorkflows.size === 0 ? 
            'Assign Selected' : 
            `Assign ${selectedWorkflows.size} Workflow${selectedWorkflows.size === 1 ? '' : 's'}`;
    }
}

function updateRemoveButtonState() {
    const saveBtn = document.getElementById('save-remove-btn');
    if (saveBtn) {
        saveBtn.disabled = selectedWorkflows.size === 0;
        saveBtn.textContent = selectedWorkflows.size === 0 ? 
            'Remove Selected' : 
            `Remove ${selectedWorkflows.size} Workflow${selectedWorkflows.size === 1 ? '' : 's'}`;
    }
}

// Save workflow assignments
async function saveWorkflowAssignments() {
    if (selectedDocuments.size === 0 || selectedWorkflows.size === 0) return;

    try {
        const promises = [];

        for (const doc of selectedDocuments) {
            // Get current workflows for this document
            const currentResponse = await fetch(`/api/documents/${doc.id}/workflows`, {
                headers: getAuthHeaders()
            });
            let currentWorkflows = [];
            if (currentResponse.ok) {
                const currentData = await currentResponse.json();
                currentWorkflows = currentData.workflowIds || [];
            } else {
                console.error(`Failed to get workflows for ${doc.name}:`, currentResponse.status);
            }

            // Add new workflows (avoiding duplicates)
            const updatedWorkflows = [...new Set([...currentWorkflows, ...selectedWorkflows])];

            // Make PUT request and check response
            const response = await fetch(`/api/documents/${doc.id}/workflows`, {
                method: 'PUT',
                headers: getAuthHeaders(),
                body: JSON.stringify({
                    workflowIds: updatedWorkflows
                })
            });

            if (!response.ok) {
                const errorData = await response.json().catch(() => ({}));
                throw new Error(errorData.detail || `HTTP ${response.status}: Failed to assign workflows to ${doc.name}`);
            }

            promises.push(response);
        }

        // Wait for all to complete (though they're already awaited above)
        await Promise.all(promises.map(p => Promise.resolve(p)));

        // Update document displays
        for (const doc of selectedDocuments) {
            await updateDocumentWorkflowDisplay(doc.id);
        }

        closeAssignWorkflowModal();
        showMessage(`Workflows assigned to ${selectedDocuments.size} document${selectedDocuments.size === 1 ? '' : 's'}`, 'success');

    } catch (error) {
        console.error('Error assigning workflows:', error);
        const message = error.message || 'Error assigning workflows. Please check console for details.';
        showMessage(message, 'error');
    }
}

// Remove workflow assignments
async function removeWorkflowAssignments() {
    if (selectedDocuments.size === 0 || selectedWorkflows.size === 0) return;

    try {
        const promises = [];

        for (const doc of selectedDocuments) {
            // Get current workflows for this document
            const currentResponse = await fetch(`/api/documents/${doc.id}/workflows`, {
                headers: getAuthHeaders()
            });
            let currentWorkflows = [];
            if (currentResponse.ok) {
                const currentData = await currentResponse.json();
                currentWorkflows = currentData.workflowIds || [];
            } else {
                console.error(`Failed to get workflows for ${doc.name}:`, currentResponse.status);
            }

            // Remove selected workflows
            const updatedWorkflows = currentWorkflows.filter(wfId => !selectedWorkflows.has(wfId));

            // Make PUT request and check response
            const response = await fetch(`/api/documents/${doc.id}/workflows`, {
                method: 'PUT',
                headers: getAuthHeaders(),
                body: JSON.stringify({
                    workflowIds: updatedWorkflows
                })
            });

            if (!response.ok) {
                const errorData = await response.json().catch(() => ({}));
                throw new Error(errorData.detail || `HTTP ${response.status}: Failed to remove workflows from ${doc.name}`);
            }

            promises.push(response);
        }

        // Wait for all to complete (though they're already awaited above)
        await Promise.all(promises.map(p => Promise.resolve(p)));

        // Update document displays
        for (const doc of selectedDocuments) {
            await updateDocumentWorkflowDisplay(doc.id);
        }

        closeRemoveWorkflowModal();
        showMessage(`Workflows removed from ${selectedDocuments.size} document${selectedDocuments.size === 1 ? '' : 's'}`, 'success');

    } catch (error) {
        console.error('Error removing workflows:', error);
        const message = error.message || 'Error removing workflows. Please check console for details.';
        showMessage(message, 'error');
    }
}

// Update document workflow display in the table
async function updateDocumentWorkflowDisplay(docId) {
    try {
        const response = await fetch(`/api/documents/${docId}/workflows`);
        if (response.ok) {
            const data = await response.json();
            const workflowCell = document.getElementById(`doc-workflows-${docId}`);
            
            if (workflowCell && data.workflowNames) {
                if (data.workflowNames.length > 0) {
                    workflowCell.innerHTML = data.workflowNames
                        .map(wf => `<span class="chip workflow-chip">${wf}</span>`)
                        .join('');
                } else {
                    workflowCell.innerHTML = '<span class="text-muted">No workflows</span>';
                }
            }
        }
    } catch (error) {
        console.error('Error updating document workflow display:', error);
    }
}

function showMessage(message, type) {
    // Simple message display - can be enhanced with a proper toast system
    const messageDiv = document.createElement('div');
    messageDiv.className = `message message-${type}`;
    messageDiv.textContent = message;
    messageDiv.style.position = 'fixed';
    messageDiv.style.top = '20px';
    messageDiv.style.right = '20px';
    messageDiv.style.padding = '12px 20px';
    messageDiv.style.borderRadius = '4px';
    messageDiv.style.zIndex = '9999';
    messageDiv.style.backgroundColor = type === 'success' ? '#4caf50' : '#f44336';
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

// Initialize event listeners
function initializeWorkflowAssignment() {
    // Workflow dropdown toggle
    const workflowsDropdown = document.getElementById('workflows-dropdown');
    const workflowsDropdownMenu = document.getElementById('workflows-dropdown-menu');
    
    if (workflowsDropdown && workflowsDropdownMenu) {
        workflowsDropdown.addEventListener('click', function(e) {
            if (!this.disabled) {
                e.stopPropagation();
                const isVisible = workflowsDropdownMenu.style.display === 'block';
                workflowsDropdownMenu.style.display = isVisible ? 'none' : 'block';
            }
        });
        
        // Close dropdown when clicking outside
        document.addEventListener('click', function() {
            workflowsDropdownMenu.style.display = 'none';
        });
    }
    
    // Dropdown menu items
    const assignWorkflowBtn = document.getElementById('assign-workflow-btn');
    const removeWorkflowBtn = document.getElementById('remove-workflow-btn');
    
    if (assignWorkflowBtn) {
        assignWorkflowBtn.addEventListener('click', function(e) {
            e.stopPropagation();
            workflowsDropdownMenu.style.display = 'none';
            openAssignWorkflowModal();
        });
    }
    
    if (removeWorkflowBtn) {
        removeWorkflowBtn.addEventListener('click', function(e) {
            e.stopPropagation();
            workflowsDropdownMenu.style.display = 'none';
            openRemoveWorkflowModal();
        });
    }
    
    // Assign modal event listeners
    const closeAssignBtn = document.getElementById('close-assign-modal');
    const cancelAssignBtn = document.getElementById('cancel-assign-btn');
    const saveAssignBtn = document.getElementById('save-assign-btn');
    const assignModal = document.getElementById('assign-workflow-modal');
    
    if (closeAssignBtn) closeAssignBtn.addEventListener('click', closeAssignWorkflowModal);
    if (cancelAssignBtn) cancelAssignBtn.addEventListener('click', closeAssignWorkflowModal);
    if (saveAssignBtn) saveAssignBtn.addEventListener('click', saveWorkflowAssignments);
    
    if (assignModal) {
        assignModal.addEventListener('click', function(e) {
            if (e.target === assignModal) closeAssignWorkflowModal();
        });
    }
    
    // Remove modal event listeners
    const closeRemoveBtn = document.getElementById('close-remove-modal');
    const cancelRemoveBtn = document.getElementById('cancel-remove-btn');
    const saveRemoveBtn = document.getElementById('save-remove-btn');
    const removeModal = document.getElementById('remove-workflow-modal');
    
    if (closeRemoveBtn) closeRemoveBtn.addEventListener('click', closeRemoveWorkflowModal);
    if (cancelRemoveBtn) cancelRemoveBtn.addEventListener('click', closeRemoveWorkflowModal);
    if (saveRemoveBtn) saveRemoveBtn.addEventListener('click', removeWorkflowAssignments);
    
    if (removeModal) {
        removeModal.addEventListener('click', function(e) {
            if (e.target === removeModal) closeRemoveWorkflowModal();
        });
    }
    
    // Select all checkbox functionality
    const selectAllCheckbox = document.querySelector('.checkbox-all');
    if (selectAllCheckbox) {
        selectAllCheckbox.addEventListener('change', function() {
            const rowCheckboxes = document.querySelectorAll('.checkbox-row');
            rowCheckboxes.forEach(checkbox => {
                checkbox.checked = this.checked;
            });
            updateWorkflowDropdownState();
        });
    }
}

// Initialize when DOM is loaded
document.addEventListener('DOMContentLoaded', initializeWorkflowAssignment);

// Export functions for global access
window.updateWorkflowDropdownState = updateWorkflowDropdownState;
window.openAssignWorkflowModal = openAssignWorkflowModal;
window.openRemoveWorkflowModal = openRemoveWorkflowModal;