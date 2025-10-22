// API configuration and helper functions
const API_BASE = '/api';

// API helper class for workflow operations
class WorkflowAPI {
    constructor() {
        this.workflowId = null;
    }
    
    // Initialize a new workflow session
    async initWorkflow() {
        try {
            const response = await fetch(`${API_BASE}/analyze/workflows/create/init`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({})
            });
            
            if (!response.ok) {
                throw new Error('Failed to initialize workflow');
            }
            
            const data = await response.json();
            this.workflowId = data.workflowId;
            console.log('Workflow initialized:', this.workflowId);
            return data;
        } catch (error) {
            console.error('Error initializing workflow:', error);
            throw error;
        }
    }
    
    // Step 1: Set workflow name
    async setWorkflowName(name) {
        if (!this.workflowId) {
            await this.initWorkflow();
        }

        const token = localStorage.getItem('authToken');

        try {
            const response = await fetch(`${API_BASE}/analyze/workflows/create/${this.workflowId}/name`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    ...(token && { 'Authorization': `Bearer ${token}` })
                },
                body: JSON.stringify({ name })
            });
            
            if (!response.ok) {
                throw new Error('Failed to set workflow name');
            }
            
            const data = await response.json();
            console.log('Workflow name set:', name);
            return data;
        } catch (error) {
            console.error('Error setting workflow name:', error);
            throw error;
        }
    }
    
    // Step 2: Set workflow fields
    async setWorkflowFields(fields) {
        if (!this.workflowId) {
            throw new Error('Workflow not initialized');
        }

        const token = localStorage.getItem('authToken');

        try {
            const response = await fetch(`${API_BASE}/analyze/workflows/create/${this.workflowId}/fields`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    ...(token && { 'Authorization': `Bearer ${token}` })
                },
                body: JSON.stringify({ fields: Array.from(fields) })
            });
            
            if (!response.ok) {
                throw new Error('Failed to set workflow fields');
            }
            
            const data = await response.json();
            console.log('Workflow fields set:', fields.size, 'fields');
            return data;
        } catch (error) {
            console.error('Error setting workflow fields:', error);
            throw error;
        }
    }
    
    // Step 3: Set workflow details (description and document types)
    async setWorkflowDetails(description, documentTypes) {
        if (!this.workflowId) {
            throw new Error('Workflow not initialized');
        }

        const token = localStorage.getItem('authToken');

        try {
            const response = await fetch(`${API_BASE}/analyze/workflows/create/${this.workflowId}/details`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    ...(token && { 'Authorization': `Bearer ${token}` })
                },
                body: JSON.stringify({
                    description,
                    documentTypes: Array.from(documentTypes)
                })
            });
            
            if (!response.ok) {
                throw new Error('Failed to set workflow details');
            }
            
            const data = await response.json();
            console.log('Workflow details set');
            return data;
        } catch (error) {
            console.error('Error setting workflow details:', error);
            throw error;
        }
    }
    
    // Step 4: Set scoring profiles
    async setWorkflowScoring(scoringProfiles) {
        if (!this.workflowId) {
            throw new Error('Workflow not initialized');
        }

        const token = localStorage.getItem('authToken');

        try {
            const response = await fetch(`${API_BASE}/analyze/workflows/create/${this.workflowId}/scoring`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    ...(token && { 'Authorization': `Bearer ${token}` })
                },
                body: JSON.stringify({ scoringProfiles })
            });
            
            if (!response.ok) {
                throw new Error('Failed to set workflow scoring');
            }
            
            const data = await response.json();
            console.log('Workflow scoring set');
            return data;
        } catch (error) {
            console.error('Error setting workflow scoring:', error);
            throw error;
        }
    }
    
    // Step 5: Review and save workflow
    async saveWorkflow() {
        if (!this.workflowId) {
            throw new Error('Workflow not initialized');
        }

        const token = localStorage.getItem('authToken');

        try {
            const response = await fetch(`${API_BASE}/analyze/workflows/create/${this.workflowId}/review`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    ...(token && { 'Authorization': `Bearer ${token}` })
                },
                body: JSON.stringify({
                    workflowId: this.workflowId
                })
            });
            
            if (!response.ok) {
                throw new Error('Failed to save workflow');
            }
            
            const data = await response.json();
            console.log('Workflow saved successfully');
            
            // Clear the workflow ID after saving
            this.workflowId = null;
            
            return data;
        } catch (error) {
            console.error('Error saving workflow:', error);
            throw error;
        }
    }
    
    // Create workflow from template
    async createFromTemplate(templateId, templateName = '') {
        // Initialize a new workflow session
        await this.initWorkflow();

        const token = localStorage.getItem('authToken');

        try {
            const response = await fetch(`${API_BASE}/analyze/workflows/create/${this.workflowId}/template`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    ...(token && { 'Authorization': `Bearer ${token}` })
                },
                body: JSON.stringify({ templateId, templateName })
            });
            
            if (!response.ok) {
                throw new Error('Failed to create workflow from template');
            }
            
            const data = await response.json();
            console.log('Workflow created from template:', templateId);
            return data;
        } catch (error) {
            console.error('Error creating workflow from template:', error);
            throw error;
        }
    }
    
    // Get current workflow state
    async getWorkflowState() {
        if (!this.workflowId) {
            return null;
        }
        
        try {
            const response = await fetch(`${API_BASE}/analyze/workflows/create/${this.workflowId}`, {
                method: 'GET',
                headers: {
                    'Content-Type': 'application/json'
                }
            });
            
            if (!response.ok) {
                throw new Error('Failed to get workflow state');
            }
            
            const data = await response.json();
            return data;
        } catch (error) {
            console.error('Error getting workflow state:', error);
            return null;
        }
    }
    
    // Cancel workflow creation
    async cancelWorkflow() {
        if (!this.workflowId) {
            return;
        }
        
        try {
            const response = await fetch(`${API_BASE}/analyze/workflows/create/${this.workflowId}`, {
                method: 'DELETE',
                headers: {
                    'Content-Type': 'application/json'
                }
            });
            
            if (!response.ok) {
                throw new Error('Failed to cancel workflow');
            }
            
            const data = await response.json();
            console.log('Workflow cancelled');
            this.workflowId = null;
            return data;
        } catch (error) {
            console.error('Error cancelling workflow:', error);
            throw error;
        }
    }
    
    // Get list of existing workflows
    async getWorkflows() {
        try {
            const response = await fetch(`${API_BASE}/analyze/workflows`, {
                method: 'GET',
                headers: {
                    'Content-Type': 'application/json'
                }
            });
            
            if (!response.ok) {
                throw new Error('Failed to get workflows');
            }
            
            const data = await response.json();
            return data;
        } catch (error) {
            console.error('Error getting workflows:', error);
            return [];
        }
    }
    
    // Get workflow templates
    async getTemplates() {
        try {
            const response = await fetch(`${API_BASE}/analyze/workflows/templates`, {
                method: 'GET',
                headers: {
                    'Content-Type': 'application/json'
                }
            });

            if (!response.ok) {
                throw new Error('Failed to get templates');
            }

            const data = await response.json();
            return data;
        } catch (error) {
            console.error('Error getting templates:', error);
            return [];
        }
    }

    // Create an edit session for an existing workflow
    async createEditSession(workflowId) {
        try {
            const response = await fetch(`${API_BASE}/workflows/saved/${workflowId}/edit`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                }
            });

            if (!response.ok) {
                throw new Error('Failed to create edit session');
            }

            const data = await response.json();
            if (data.success && data.sessionId) {
                this.workflowId = data.sessionId;
                console.log('Edit session created:', data.sessionId);
            }
            return data;
        } catch (error) {
            console.error('Error creating edit session:', error);
            throw error;
        }
    }

    // Load workflow data from a session
    async loadWorkflowSession(sessionId) {
        try {
            const response = await fetch(`${API_BASE}/analyze/workflows/create/${sessionId}`, {
                method: 'GET',
                headers: {
                    'Content-Type': 'application/json'
                }
            });

            if (!response.ok) {
                throw new Error('Failed to load workflow session');
            }

            const data = await response.json();
            this.workflowId = sessionId;
            console.log('Workflow session loaded:', sessionId);
            return data;
        } catch (error) {
            console.error('Error loading workflow session:', error);
            throw error;
        }
    }
}

// Create a global instance
const workflowAPI = new WorkflowAPI();