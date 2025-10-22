// Document Detail Page JavaScript

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

class DocumentDetailPage {
    constructor() {
        this.currentDocument = null;
        this.pdfDoc = null;
        this.currentPage = 1;
        this.totalPages = 0;
        this.scale = 1.5;
        this.scrollContainer = null;
        this.pageContainers = [];
        this.renderedPages = new Set();
        this.searchResults = [];
        this.currentSearchIndex = -1;
        this.pageTextContent = new Map();
        this.isScrolling = false;
        this.scrollTimeout = null;

        this.init();
    }

    init() {
        // Get document ID from URL parameters
        const urlParams = new URLSearchParams(window.location.search);
        const documentId = urlParams.get('id');
        
        if (documentId) {
            this.loadDocument(documentId);
        } else {
            console.error('No document ID provided');
            this.showError('No document specified');
        }

        this.initializeEventHandlers();
        this.initializePDFViewer();
        this.initializePageInput();
    }

    initializeEventHandlers() {
        // Back button
        const backButton = document.getElementById('back-button');
        if (backButton) {
            backButton.addEventListener('click', () => this.goBack());
        }

        // Close button
        const closeButton = document.getElementById('close-document');
        if (closeButton) {
            closeButton.addEventListener('click', () => this.goBack());
        }

        // Category toggles
        document.querySelectorAll('.category-header').forEach(header => {
            header.addEventListener('click', (e) => {
                if (!e.target.closest('.btn-delete, .btn-edit')) {
                    this.toggleCategory(header);
                }
            });
        });

        // PDF controls
        this.initializePDFControls();
        
        // Search functionality
        this.initializeSearchFunctionality();

        // Export button
        const exportBtn = document.querySelector('.btn-export');
        if (exportBtn) {
            exportBtn.addEventListener('click', () => this.exportDocument());
        }

        // Page reference buttons - handlers are attached when buttons are created
        // See lines ~666-668 and ~772-774 where buttons call highlightExtraction()
    }

    initializePDFControls() {
        const prevBtn = document.getElementById('prev-page');
        const nextBtn = document.getElementById('next-page');
        const zoomInBtn = document.getElementById('zoom-in');
        const zoomOutBtn = document.getElementById('zoom-out');

        if (prevBtn) {
            prevBtn.addEventListener('click', () => this.previousPage());
        }
        if (nextBtn) {
            nextBtn.addEventListener('click', () => this.nextPage());
        }
        if (zoomInBtn) {
            zoomInBtn.addEventListener('click', () => this.zoomIn());
        }
        if (zoomOutBtn) {
            zoomOutBtn.addEventListener('click', () => this.zoomOut());
        }
    }

    initializePDFViewer() {
        this.scrollContainer = document.getElementById('pdf-scroll-container');
        
        // Set PDF.js worker (v5.4)
        if (typeof pdfjsLib !== 'undefined') {
            pdfjsLib.GlobalWorkerOptions.workerSrc = 'https://cdnjs.cloudflare.com/ajax/libs/pdf.js/5.4.296/pdf.worker.min.js';
        }
    }

    initializeSearchFunctionality() {
        const searchBtn = document.getElementById('btn-search');
        const searchModal = document.getElementById('search-modal');
        const closeSearchBtn = document.getElementById('close-search');
        const searchInput = document.getElementById('search-input');
        const searchPrevBtn = document.getElementById('search-prev');
        const searchNextBtn = document.getElementById('search-next');

        // Open search modal
        if (searchBtn) {
            searchBtn.addEventListener('click', () => {
                searchModal.style.display = 'flex';
                searchInput.focus();
            });
        }

        // Close search modal
        const closeSearch = () => {
            searchModal.style.display = 'none';
            this.clearSearchHighlights();
        };

        if (closeSearchBtn) {
            closeSearchBtn.addEventListener('click', closeSearch);
        }

        // Close on escape key
        document.addEventListener('keydown', (e) => {
            if (e.key === 'Escape' && searchModal.style.display === 'flex') {
                closeSearch();
            }
            // Ctrl+F to open search
            if (e.ctrlKey && e.key === 'f') {
                e.preventDefault();
                searchModal.style.display = 'flex';
                searchInput.focus();
            }
        });

        // Close on backdrop click
        searchModal.addEventListener('click', (e) => {
            if (e.target === searchModal) {
                closeSearch();
            }
        });

        // Search input handling
        if (searchInput) {
            let searchTimeout;
            searchInput.addEventListener('input', (e) => {
                clearTimeout(searchTimeout);
                searchTimeout = setTimeout(() => {
                    this.performSearch(e.target.value);
                }, 300);
            });

            searchInput.addEventListener('keydown', (e) => {
                if (e.key === 'Enter') {
                    if (e.shiftKey) {
                        this.goToPreviousSearchResult();
                    } else {
                        this.goToNextSearchResult();
                    }
                }
            });
        }

        // Search navigation
        if (searchPrevBtn) {
            searchPrevBtn.addEventListener('click', () => {
                this.goToPreviousSearchResult();
            });
        }

        if (searchNextBtn) {
            searchNextBtn.addEventListener('click', () => {
                this.goToNextSearchResult();
            });
        }
    }

    async loadDocument(documentId) {
        try {
            // Show loading state
            this.showLoading(true);

            // Load document metadata
            const documentResponse = await fetch(`/api/documents/${documentId}`, {
                headers: getAuthHeaders()
            });
            if (!documentResponse.ok) {
                if (documentResponse.status === 401) {
                    window.location.href = '/login.html';
                    return;
                }
                throw new Error('Failed to load document metadata');
            }

            this.currentDocument = await documentResponse.json();
            this.updateDocumentInfo();

            // Load assigned workflows and render fields dynamically
            const workflowData = await this.loadDocumentWorkflows(documentId);

            if (workflowData && workflowData.workflowIds && workflowData.workflowIds.length > 0) {
                // Load the first workflow's details
                const firstWorkflowId = workflowData.workflowIds[0];
                const workflow = await this.loadWorkflowDetails(firstWorkflowId);

                if (workflow) {
                    // Render workflow fields as categories
                    await this.renderWorkflowFields(workflow);

                    // Populate with extraction results
                    await this.populateExtractionResults(documentId, firstWorkflowId);
                } else {
                    this.showTermsError('Failed to load workflow details');
                }
            } else {
                this.showTermsMessage('No workflows assigned to this document');
            }

            // Load PDF content
            await this.loadPDF(documentId);

        } catch (error) {
            console.error('Error loading document:', error);
            this.showError('Failed to load document');
        } finally {
            this.showLoading(false);
        }
    }

    async loadDocumentWorkflows(documentId) {
        try {
            const response = await fetch(`/api/documents/${documentId}/workflows`);
            if (response.ok) {
                const data = await response.json();
                this.updateWorkflowsSection(data);

                // Trigger extraction for each workflow if not already done
                if (data.workflowIds && data.workflowIds.length > 0) {
                    for (let i = 0; i < data.workflowIds.length; i++) {
                        const workflowId = data.workflowIds[i];
                        await this.checkAndStartExtraction(documentId, workflowId);
                    }
                }

                return data;
            } else {
                console.warn('Failed to load document workflows');
                this.updateWorkflowsSection({ workflowIds: [], workflowNames: [] });
                return { workflowIds: [], workflowNames: [] };
            }
        } catch (error) {
            console.error('Error loading document workflows:', error);
            this.updateWorkflowsSection({ workflowIds: [], workflowNames: [] });
            return { workflowIds: [], workflowNames: [] };
        }
    }

    async loadWorkflowDetails(workflowId) {
        try {
            const response = await fetch(`/api/workflows/saved`, {
                headers: getAuthHeaders()
            });

            if (response.ok) {
                const workflows = await response.json();
                // Find the specific workflow by ID
                const workflow = workflows.find(w => w.id === workflowId);

                if (workflow) {
                    console.log('Loaded workflow details:', workflow);
                    return workflow;
                } else {
                    console.error('Workflow not found:', workflowId);
                    return null;
                }
            } else if (response.status === 401) {
                window.location.href = '/login.html';
                return null;
            } else {
                throw new Error('Failed to load workflow details');
            }
        } catch (error) {
            console.error('Error loading workflow details:', error);
            return null;
        }
    }

    updateWorkflowsSection(data) {
        const workflowSelect = document.querySelector('.workflow-select');
        if (!workflowSelect) return;

        // Clear existing options
        workflowSelect.innerHTML = '';

        if (data.workflowNames && data.workflowNames.length > 0) {
            // Add workflows as options
            data.workflowNames.forEach((name, index) => {
                const option = document.createElement('option');
                option.value = data.workflowIds[index];
                option.textContent = name;
                workflowSelect.appendChild(option);
            });

            // Add change handler for workflow switching
            workflowSelect.addEventListener('change', async (e) => {
                const selectedWorkflowId = e.target.value;
                await this.switchWorkflow(selectedWorkflowId);
            });
        } else {
            // No workflows assigned
            const option = document.createElement('option');
            option.textContent = 'No workflows assigned';
            option.disabled = true;
            workflowSelect.appendChild(option);
        }
    }

    async switchWorkflow(workflowId) {
        try {
            console.log('Switching to workflow:', workflowId);

            // Show loading state
            this.showTermsMessage('Loading workflow fields...');

            // Load workflow details
            const workflow = await this.loadWorkflowDetails(workflowId);

            if (workflow) {
                // Re-render workflow fields
                await this.renderWorkflowFields(workflow);

                // Populate with extraction results for this workflow
                const urlParams = new URLSearchParams(window.location.search);
                const documentId = urlParams.get('id');

                if (documentId) {
                    await this.populateExtractionResults(documentId, workflowId);
                }
            } else {
                this.showTermsError('Failed to load workflow details');
            }
        } catch (error) {
            console.error('Error switching workflow:', error);
            this.showTermsError('Failed to switch workflow');
        }
    }

    async renderWorkflowFields(workflow) {
        if (!workflow || !workflow.fields) {
            console.warn('No workflow or fields provided');
            this.showTermsError('No workflow fields configured');
            return;
        }

        const container = document.getElementById('extracted-terms-container');
        if (!container) {
            console.error('Terms container not found');
            return;
        }

        // Keep the header, clear the rest
        const header = container.querySelector('.section-header');
        container.innerHTML = '';
        if (header) {
            container.appendChild(header);
        }

        // Check if fields is a dict (grouped) or list
        const fields = workflow.fields;
        let categories = {};

        if (Array.isArray(fields)) {
            // Fields is a simple list - create a single "Extracted Fields" category
            categories['Extracted Fields'] = fields.map(field => {
                // Field can be either a string or an object with { name, fieldId }
                if (typeof field === 'string') {
                    return { name: field, fieldId: field };
                } else if (field && field.name) {
                    return { name: field.name, fieldId: field.fieldId || field.name };
                }
                return null;
            }).filter(f => f !== null);
        } else if (typeof fields === 'object') {
            // Fields is grouped by category
            categories = {};
            Object.entries(fields).forEach(([categoryName, categoryFields]) => {
                if (Array.isArray(categoryFields)) {
                    categories[categoryName] = categoryFields.map(field => {
                        if (typeof field === 'string') {
                            return { name: field, fieldId: field };
                        } else if (field && field.name) {
                            return { name: field.name, fieldId: field.fieldId || field.name };
                        }
                        return null;
                    }).filter(f => f !== null);
                }
            });
        }

        // Render each category
        Object.entries(categories).forEach(([categoryName, categoryFields]) => {
            if (categoryFields.length === 0) return;

            const categoryDiv = this.createCategoryElement(categoryName, categoryFields);
            container.appendChild(categoryDiv);
        });

        // If no categories were created, show empty state
        if (Object.keys(categories).length === 0) {
            const emptyState = document.createElement('div');
            emptyState.className = 'empty-state';
            emptyState.textContent = 'No fields configured for this workflow';
            container.appendChild(emptyState);
        }

        // Re-initialize event handlers for the new categories
        this.initializeCategoryHandlers();
    }

    createCategoryElement(categoryName, fields) {
        const categoryDiv = document.createElement('div');
        categoryDiv.className = 'term-category';

        // Create category header
        const headerDiv = document.createElement('div');
        headerDiv.className = 'category-header';
        headerDiv.dataset.category = categoryName.toLowerCase().replace(/\s+/g, '-');

        headerDiv.innerHTML = `
            <button class="category-toggle">
                <span class="material-icons">keyboard_arrow_down</span>
            </button>
            <span class="category-name">${categoryName} (${fields.length})</span>
            <div class="category-actions">
                <button class="btn-delete">Delete</button>
                <button class="btn-edit">Edit</button>
            </div>
        `;

        // Create category content
        const contentDiv = document.createElement('div');
        contentDiv.className = 'category-content';

        // Create placeholder term items for each field
        fields.forEach(field => {
            const termItem = document.createElement('div');
            termItem.className = 'term-item';
            termItem.dataset.fieldId = field.fieldId;

            termItem.innerHTML = `
                <h4 class="term-field-name">${field.name}</h4>
                <div class="term-value" style="color: #999; font-style: italic;">Extracting...</div>
            `;

            contentDiv.appendChild(termItem);
        });

        categoryDiv.appendChild(headerDiv);
        categoryDiv.appendChild(contentDiv);

        return categoryDiv;
    }

    initializeCategoryHandlers() {
        // Re-attach event handlers for category toggles
        document.querySelectorAll('.category-header').forEach(header => {
            // Remove existing listeners by cloning
            const newHeader = header.cloneNode(true);
            header.parentNode.replaceChild(newHeader, header);

            newHeader.addEventListener('click', (e) => {
                if (!e.target.closest('.btn-delete, .btn-edit')) {
                    this.toggleCategory(newHeader);
                }
            });
        });
    }

    async populateExtractionResults(documentId, workflowId) {
        try {
            console.log(`Fetching extraction results for document ${documentId}, workflow ${workflowId}`);

            const response = await fetch(
                `/api/documents/${documentId}/extraction/results?workflow_id=${workflowId}`,
                { headers: getAuthHeaders() }
            );

            if (!response.ok) {
                if (response.status === 401) {
                    window.location.href = '/login.html';
                    return;
                }
                throw new Error(`Failed to fetch extraction results: ${response.status}`);
            }

            const data = await response.json();

            if (data.status === 'complete' && data.fields) {
                console.log('Extraction results:', data.fields);
                this.updateTermsWithExtractionResults(data.fields);
            } else if (data.status === 'processing' || data.status === 'pending') {
                console.log('Extraction still in progress');
                this.showTermsMessage('Extraction in progress...');
            } else if (data.status === 'not_started') {
                console.log('Extraction not started');
                this.showTermsMessage('Waiting for extraction to start...');
            } else {
                console.warn('Extraction status:', data.status);
                this.showTermsMessage('No extraction results available yet');
            }
        } catch (error) {
            console.error('Error loading extraction results:', error);
            this.showTermsError('Failed to load extraction results');
        }
    }

    updateTermsWithExtractionResults(fields) {
        // Fields format: { field_id: { metadata, extractions, hasAnswers, answers, answerOptions, fieldName } }
        Object.entries(fields).forEach(([fieldId, fieldData]) => {
            // Find the term item with matching field ID
            const termItem = document.querySelector(`[data-field-id="${fieldId}"]`);

            if (termItem) {
                // Check if this is an answer-type field or text-type field
                if (fieldData.hasAnswers) {
                    this.renderAnswerField(termItem, fieldData);
                } else {
                    this.renderTextField(termItem, fieldData);
                }
            }
        });

        // Update categories count (fields found vs total)
        document.querySelectorAll('.term-category').forEach(category => {
            const items = category.querySelectorAll('.term-item');
            const foundItems = Array.from(items).filter(item => {
                const value = item.querySelector('.term-value');
                return value && value.textContent !== 'Not found' && value.textContent !== 'Extracting...';
            });

            const categoryNameSpan = category.querySelector('.category-name');
            if (categoryNameSpan) {
                const categoryText = categoryNameSpan.textContent.split('(')[0].trim();
                categoryNameSpan.textContent = `${categoryText} (${foundItems.length}/${items.length})`;
            }
        });

        // Hide loading message
        const loadingDiv = document.getElementById('terms-loading');
        if (loadingDiv) {
            loadingDiv.style.display = 'none';
        }
    }

    renderAnswerField(termItem, fieldData) {
        // Render answer-type fields with options and selected answer
        const termValueDiv = termItem.querySelector('.term-value');
        if (!termValueDiv) return;

        // Clear existing content
        termValueDiv.innerHTML = '';
        termValueDiv.style.color = '';
        termValueDiv.style.fontStyle = '';

        // Add answer-field class to termItem
        termItem.classList.add('answer-field');

        // Create answer options container
        const optionsContainer = document.createElement('div');
        optionsContainer.className = 'answer-options';

        const answerOptions = fieldData.answerOptions || {};
        const selectedAnswers = fieldData.answers || [];
        const selectedOption = selectedAnswers.length > 0 ? selectedAnswers[0].option : null;

        // Display each answer option
        Object.entries(answerOptions).forEach(([optionKey, optionValue]) => {
            const optionDiv = document.createElement('div');
            optionDiv.className = 'answer-option';

            // Highlight selected answer
            if (optionKey === selectedOption) {
                optionDiv.classList.add('selected');
            }

            optionDiv.textContent = `${optionKey}) ${optionValue}`;
            optionsContainer.appendChild(optionDiv);
        });

        termValueDiv.appendChild(optionsContainer);

        // Display selected answer label
        if (selectedOption) {
            const selectedLabel = document.createElement('div');
            selectedLabel.className = 'selected-answer-label';
            const selectedValue = selectedAnswers[0].value;
            selectedLabel.textContent = `Answer: ${selectedOption}) ${selectedValue}`;
            termValueDiv.appendChild(selectedLabel);
        } else {
            // No answer selected - unable to determine
            const undeterminedDiv = document.createElement('div');
            undeterminedDiv.className = 'answer-undetermined';
            undeterminedDiv.textContent = 'Unable to determine';
            termValueDiv.appendChild(undeterminedDiv);
        }

        // Display supporting extractions if available
        const extractions = fieldData.extractions || [];
        if (extractions.length > 0) {
            const supportingDiv = document.createElement('div');
            supportingDiv.className = 'supporting-evidence';

            const labelSpan = document.createElement('span');
            labelSpan.textContent = 'Supporting evidence:';
            labelSpan.style.fontWeight = '600';
            labelSpan.style.display = 'block';
            labelSpan.style.marginBottom = '8px';
            supportingDiv.appendChild(labelSpan);

            // Show all supporting extractions
            extractions.forEach(extraction => {
                const extractionDiv = document.createElement('div');
                extractionDiv.className = 'extraction-item';

                const textSpan = document.createElement('span');
                textSpan.className = 'extraction-text';
                const text = extraction.text || '';
                // FIXED: Show full text instead of truncating at 100 characters
                textSpan.textContent = text;
                extractionDiv.appendChild(textSpan);

                // Add page reference button
                if (extraction.page) {
                    const pageBtn = document.createElement('button');
                    pageBtn.className = 'btn-page-ref';
                    pageBtn.textContent = `Page ${extraction.page}`;
                    pageBtn.addEventListener('click', () => {
                        this.goToPage(extraction.page);
                    });
                    extractionDiv.appendChild(pageBtn);
                }

                supportingDiv.appendChild(extractionDiv);
            });

            termValueDiv.appendChild(supportingDiv);
        }
    }

    renderTextField(termItem, fieldData) {
        // Render text-type fields with support for multiple extractions
        const termValueDiv = termItem.querySelector('.term-value');
        if (!termValueDiv) return;

        const extractions = fieldData.extractions || [];

        if (extractions && extractions.length > 0) {
            // Clear existing content
            termValueDiv.innerHTML = '';
            termValueDiv.style.color = '';
            termValueDiv.style.fontStyle = '';

            // Store first extraction data for highlighting
            const firstExtraction = extractions[0];
            termItem.dataset.extraction = JSON.stringify(firstExtraction);

            if (extractions.length === 1) {
                // Single extraction - display as before
                termValueDiv.textContent = firstExtraction.text || 'Not found';

                // Make term value clickable to highlight (will use text-search fallback if bbox unavailable)
                if (firstExtraction.page) {
                    termValueDiv.style.cursor = 'pointer';
                    termValueDiv.title = firstExtraction.bbox ? 'Click to highlight in document' : 'Click to find in document (text search)';
                    termValueDiv.addEventListener('click', async () => {
                        await this.highlightExtraction(firstExtraction);
                    });
                }

                // Add confidence indicator
                if (firstExtraction.confidence !== undefined) {
                    const confidenceSpan = document.createElement('span');
                    confidenceSpan.className = 'confidence-indicator';
                    confidenceSpan.style.marginLeft = '8px';
                    confidenceSpan.style.fontSize = '0.85em';
                    confidenceSpan.style.color = firstExtraction.confidence > 0.8 ? '#4caf50' : '#ff9800';
                    confidenceSpan.textContent = `(${Math.round(firstExtraction.confidence * 100)}%)`;
                    termValueDiv.appendChild(confidenceSpan);
                }
            } else {
                // Multiple extractions - display with expand/collapse
                const firstText = document.createTextNode(firstExtraction.text || 'Not found');
                termValueDiv.appendChild(firstText);

                // Add "+X more" toggle
                const toggleSpan = document.createElement('span');
                toggleSpan.className = 'more-extractions-toggle';
                toggleSpan.textContent = ` (+${extractions.length - 1} more)`;
                termValueDiv.appendChild(toggleSpan);

                // Create expandable section for additional extractions
                const expandableDiv = document.createElement('div');
                expandableDiv.className = 'additional-extractions';
                expandableDiv.style.display = 'none';

                extractions.slice(1).forEach((ext, idx) => {
                    const extDiv = document.createElement('div');
                    extDiv.className = 'extraction-item';
                    extDiv.textContent = `• ${ext.text}`;

                    // Make each extraction clickable for highlighting (will use fallback if bbox unavailable)
                    if (ext.page) {
                        extDiv.style.cursor = 'pointer';
                        extDiv.title = ext.bbox ? `Click to highlight on page ${ext.page}` : `Click to find on page ${ext.page} (text search)`;
                        extDiv.addEventListener('click', async () => {
                            await this.highlightExtraction(ext);
                        });
                    }

                    expandableDiv.appendChild(extDiv);
                });

                termValueDiv.appendChild(expandableDiv);

                // Toggle handler
                toggleSpan.addEventListener('click', () => {
                    const isVisible = expandableDiv.style.display === 'block';
                    expandableDiv.style.display = isVisible ? 'none' : 'block';
                    toggleSpan.textContent = isVisible ? ` (+${extractions.length - 1} more)` : ' (show less)';
                });
            }

            // Add page reference button if page info available
            let pageRefBtn = termItem.querySelector('.btn-page-ref');
            if (firstExtraction.page) {
                if (!pageRefBtn) {
                    const actionsDiv = document.createElement('div');
                    actionsDiv.className = 'term-actions';

                    pageRefBtn = document.createElement('button');
                    pageRefBtn.className = 'btn-page-ref';
                    pageRefBtn.textContent = `Page ${firstExtraction.page}`;
                    pageRefBtn.addEventListener('click', () => {
                        this.goToPage(firstExtraction.page);
                    });

                    actionsDiv.appendChild(pageRefBtn);
                    termItem.appendChild(actionsDiv);
                } else {
                    pageRefBtn.textContent = `Page ${firstExtraction.page}`;
                }
            }
        } else {
            // No extractions found for this field
            termValueDiv.style.color = '#999';
            termValueDiv.style.fontStyle = 'italic';
            termValueDiv.textContent = 'Not found';
        }
    }

    showTermsMessage(message) {
        const container = document.getElementById('extracted-terms-container');
        if (!container) return;

        let messageDiv = document.getElementById('terms-loading');
        if (!messageDiv) {
            messageDiv = document.createElement('div');
            messageDiv.id = 'terms-loading';
            messageDiv.className = 'empty-state';
            container.appendChild(messageDiv);
        }

        messageDiv.style.display = 'block';
        messageDiv.style.color = '#666';
        messageDiv.textContent = message;
    }

    showTermsError(message) {
        const container = document.getElementById('extracted-terms-container');
        if (!container) return;

        let errorDiv = document.getElementById('terms-loading');
        if (!errorDiv) {
            errorDiv = document.createElement('div');
            errorDiv.id = 'terms-loading';
            errorDiv.className = 'empty-state';
            container.appendChild(errorDiv);
        }

        errorDiv.style.display = 'block';
        errorDiv.style.color = '#f44336';
        errorDiv.textContent = message;
    }

    async loadExtractedTerms(documentId) {
        // This method is deprecated - now using populateExtractionResults
        console.log('loadExtractedTerms called (deprecated)');
    }

    async loadPDF(documentId) {
        try {
            const pdfUrl = `/api/documents/${documentId}/content`;
            
            // For demo purposes, use a sample PDF if the API endpoint doesn't exist
            const fallbackPdfUrl = 'data:application/pdf;base64,JVBERi0xLjQKMSAwIG9iago8PAovVHlwZSAvQ2F0YWxvZwovUGFnZXMgMiAwIFIKPj4KZW5kb2JqCjIgMCBvYmoKPDwKL1R5cGUgL1BhZ2VzCi9LaWRzIFsgMyAwIFIgXQovQ291bnQgMQo+PgplbmRvYmoKMyAwIG9iago8PAovVHlwZSAvUGFnZQovUGFyZW50IDIgMCBSCi9NZWRpYUJveCBbIDAgMCA2MTIgNzkyIF0KL1Jlc291cmNlcyA8PAovRm9udCA8PAovRjEgNCAwIFIKPj4KPj4KL0NvbnRlbnRzIDUgMCBSCj4+CmVuZG9iago0IDAgb2JqCjw8Ci9UeXBlIC9Gb250Ci9TdWJ0eXBlIC9UeXBlMQovQmFzZUZvbnQgL0hlbHZldGljYQo+PgplbmRvYmoKNSAwIG9iago8PAovTGVuZ3RoIDQ0Cj4+CnN0cmVhbQpCVAovRjEgMTIgVGYKNzIgNzIwIFRkCihTYW1wbGUgUERGIERvY3VtZW50KSBUagpFVAplbmRzdHJlYW0KZW5kb2JqCnhyZWYKMCA2CjAwMDAwMDAwMDAgNjU1MzUgZiAKMDAwMDAwMDAwOSAwMDAwMCBuIAowMDAwMDAwMDU4IDAwMDAwIG4gCjAwMDAwMDAxMTUgMDAwMDAgbiAKMDAwMDAwMDI0NSAwMDAwMCBuIAowMDAwMDAwMzIyIDAwMDAwIG4gCnRyYWlsZXIKPDwKL1NpemUgNgovUm9vdCAxIDAgUgo+PgpzdGFydHhyZWYKNDE0CiUlRU9G';

            let pdfData;
            try {
                console.log('🔍 Loading PDF content from:', pdfUrl);
                const response = await fetch(pdfUrl, {
                    headers: getAuthHeaders()
                });
                
                if (response.ok) {
                    console.log('✅ PDF content loaded successfully');
                    pdfData = await response.arrayBuffer();
                } else {
                    console.error('❌ PDF content request failed:', response.status, response.statusText);
                    if (response.status === 401) {
                        console.error('Authentication required for PDF content');
                        window.location.href = '/login.html';
                        return;
                    }
                    throw new Error(`PDF request failed: ${response.status} ${response.statusText}`);
                }
            } catch (error) {
                console.error('❌ Error loading PDF content:', error);
                console.warn('⚠️ Falling back to sample PDF document');
                
                // Show user-friendly error message
                this.showError('Could not load your document. Showing sample content instead.');
                
                // Use fallback for demo
                const base64Data = fallbackPdfUrl.split(',')[1];
                const binaryString = atob(base64Data);
                const bytes = new Uint8Array(binaryString.length);
                for (let i = 0; i < binaryString.length; i++) {
                    bytes[i] = binaryString.charCodeAt(i);
                }
                pdfData = bytes.buffer;
            }

            if (typeof pdfjsLib !== 'undefined') {
                this.pdfDoc = await pdfjsLib.getDocument({data: pdfData}).promise;
                this.totalPages = this.pdfDoc.numPages;
                this.currentPage = 1;
                this.updatePageInfo();
                await this.initializeContinuousScrolling();
            } else {
                this.showPDFError('PDF viewer not available');
            }

        } catch (error) {
            console.error('Error loading PDF:', error);
            this.showPDFError('Failed to load PDF document');
        }
    }

    async initializeContinuousScrolling() {
        if (!this.scrollContainer || !this.pdfDoc) return;

        // Clear container
        this.scrollContainer.innerHTML = '';
        this.pageContainers = [];
        this.renderedPages.clear();

        // Create page containers for all pages
        for (let pageNum = 1; pageNum <= this.totalPages; pageNum++) {
            const pageContainer = this.createPageContainer(pageNum);
            this.scrollContainer.appendChild(pageContainer);
            this.pageContainers.push(pageContainer);
        }

        // Setup scroll listener for dynamic rendering
        this.setupScrollListener();

        // Wait for container to be fully laid out before rendering
        // This ensures scrollContainer.clientWidth is properly calculated
        await new Promise(resolve => requestAnimationFrame(resolve));
        await new Promise(resolve => requestAnimationFrame(resolve));

        // Render visible pages initially
        await this.renderVisiblePages();

        // Extract text content for search
        await this.extractAllTextContent();
    }

    createPageContainer(pageNum) {
        const container = document.createElement('div');
        container.className = 'pdf-page-container';
        container.dataset.pageNum = pageNum;
        container.style.minHeight = '100px'; // Small placeholder, will be updated after render

        const loadingDiv = document.createElement('div');
        loadingDiv.className = 'pdf-page-loading';
        loadingDiv.textContent = `Loading page ${pageNum}...`;
        container.appendChild(loadingDiv);

        return container;
    }

    setupScrollListener() {
        if (!this.scrollContainer) return;

        this.scrollContainer.addEventListener('scroll', () => {
            this.isScrolling = true;
            
            // Update current page based on scroll position
            this.updateCurrentPageFromScroll();
            
            // Debounce rendering
            clearTimeout(this.scrollTimeout);
            this.scrollTimeout = setTimeout(async () => {
                await this.renderVisiblePages();
                this.isScrolling = false;
            }, 100);
        });
    }

    updateCurrentPageFromScroll() {
        if (!this.scrollContainer || this.pageContainers.length === 0) return;

        const scrollTop = this.scrollContainer.scrollTop;
        const containerHeight = this.scrollContainer.clientHeight;
        const viewportCenter = scrollTop + containerHeight / 2;

        // Find which page is in the center of the viewport
        let newCurrentPage = 1;
        for (let i = 0; i < this.pageContainers.length; i++) {
            const container = this.pageContainers[i];
            const containerTop = container.offsetTop;
            const containerBottom = containerTop + container.offsetHeight;
            
            if (viewportCenter >= containerTop && viewportCenter <= containerBottom) {
                newCurrentPage = i + 1;
                break;
            }
        }

        if (newCurrentPage !== this.currentPage) {
            this.currentPage = newCurrentPage;
            this.updatePageInfo();
            this.updatePDFControls();
        }
    }

    async renderVisiblePages() {
        if (!this.scrollContainer || this.pageContainers.length === 0) return;

        const scrollTop = this.scrollContainer.scrollTop;
        const containerHeight = this.scrollContainer.clientHeight;
        const buffer = containerHeight; // Render pages within this buffer

        const visibleStart = Math.max(0, scrollTop - buffer);
        const visibleEnd = scrollTop + containerHeight + buffer;

        const pagesToRender = [];

        for (let i = 0; i < this.pageContainers.length; i++) {
            const container = this.pageContainers[i];
            const pageNum = i + 1;
            const containerTop = container.offsetTop;
            const containerBottom = containerTop + container.offsetHeight;

            // Check if page is in visible range
            if (containerBottom >= visibleStart && containerTop <= visibleEnd) {
                if (!this.renderedPages.has(pageNum)) {
                    pagesToRender.push(pageNum);
                }
            }
        }

        // Render pages in batches to avoid blocking UI
        for (const pageNum of pagesToRender) {
            await this.renderPage(pageNum);
            // Small delay to keep UI responsive
            await new Promise(resolve => setTimeout(resolve, 10));
        }
    }

    async renderPage(pageNum) {
        if (!this.pdfDoc || this.renderedPages.has(pageNum)) return;

        try {
            const page = await this.pdfDoc.getPage(pageNum);

            // Calculate scale to fit container width
            const container = this.pageContainers[pageNum - 1];
            if (!container) return;

            const containerWidth = this.scrollContainer.clientWidth;
            const pageViewport = page.getViewport({scale: 1});

            // Use fallback scale if container width is not yet available
            // This prevents rendering at scale 0 when container hasn't laid out yet
            let scale;
            if (containerWidth > 0) {
                // Calculate scale to fit the container width
                // Note: .pdf-scroll-container has padding: 0, so no adjustment needed
                scale = containerWidth / pageViewport.width;
            } else {
                // Fallback to global scale when container width is invalid
                scale = this.scale;
                console.warn(`⚠️ Container width is ${containerWidth}, using fallback scale: ${scale}`);
            }

            console.log(`📏 Page ${pageNum} - Container: ${containerWidth}px, Page Width: ${pageViewport.width}px, Scale: ${scale.toFixed(3)}`);

            const viewport = page.getViewport({scale: scale});

            // Clear loading content
            container.innerHTML = '';

            // CRITICAL FIX: Remove the 100px minHeight constraint that was hiding content
            // This allows the container to expand to show the full canvas
            container.style.minHeight = '';

            // Create canvas
            const canvas = document.createElement('canvas');
            canvas.className = 'pdf-page-canvas';
            canvas.width = viewport.width;
            canvas.height = viewport.height;
            // Set CSS dimensions to match canvas dimensions (in pixels, not percentage)
            // This ensures the canvas displays at the correct size
            canvas.style.width = `${viewport.width}px`;
            canvas.style.height = `${viewport.height}px`;

            container.appendChild(canvas);

            // Create overlay for search highlights (must match canvas exactly)
            const overlay = document.createElement('div');
            overlay.className = 'pdf-page-overlay';
            overlay.dataset.pageNum = pageNum;
            overlay.style.width = `${viewport.width}px`;
            overlay.style.height = `${viewport.height}px`;
            container.appendChild(overlay);

            const ctx = canvas.getContext('2d');
            const renderContext = {
                canvasContext: ctx,
                viewport: viewport
            };

            await page.render(renderContext).promise;
            this.renderedPages.add(pageNum);

            // Render text layer for text selection and accessibility
            const textLayerDiv = document.createElement('div');
            textLayerDiv.className = 'pdf-text-layer';
            textLayerDiv.style.width = `${viewport.width}px`;
            textLayerDiv.style.height = `${viewport.height}px`;
            container.appendChild(textLayerDiv);

            try {
                const textContent = await page.getTextContent();
                pdfjsLib.renderTextLayer({
                    textContentSource: textContent,
                    container: textLayerDiv,
                    viewport: viewport,
                    enhanceTextSelection: true
                });
            } catch (textError) {
                console.warn(`Text layer rendering failed for page ${pageNum}:`, textError);
            }

            // Store the scale for this page for coordinate transformations
            container.dataset.scale = scale;

        } catch (error) {
            console.error(`Error rendering page ${pageNum}:`, error);
        }
    }

    updateDocumentInfo() {
        if (!this.currentDocument) return;

        const titleElement = document.getElementById('document-title');
        if (titleElement) {
            titleElement.textContent = this.currentDocument.name || 'Document';
        }

        const filenameElement = document.querySelector('.document-filename');
        if (filenameElement) {
            filenameElement.textContent = this.currentDocument.filename || this.currentDocument.name;
        }

        const timestampElement = document.querySelector('.document-timestamp');
        if (timestampElement) {
            const date = new Date(this.currentDocument.uploadedAt || Date.now());
            timestampElement.textContent = date.toLocaleString();
        }

        // Update document type chips dynamically
        this.updateDocumentTypeChips();
    }

    updateDocumentTypeChips() {
        const container = document.getElementById('document-type-chips');
        if (!container || !this.currentDocument) return;

        // Clear existing chips
        container.innerHTML = '';

        // Get document types from the document metadata
        // Only show if we have real data from API
        const types = this.currentDocument.documentTypes || this.currentDocument.classifications || [];

        if (types.length === 0) {
            // If no types, hide the container
            container.style.display = 'none';
            return;
        }

        // Show container and populate with real data
        container.style.display = 'flex';
        types.forEach(type => {
            const chip = document.createElement('span');
            chip.className = 'document-type-chip';
            chip.textContent = type;
            container.appendChild(chip);
        });
    }

    toggleCategory(header) {
        const content = header.nextElementSibling;
        const toggle = header.querySelector('.category-toggle');
        const isCollapsed = header.classList.contains('collapsed');

        if (isCollapsed) {
            header.classList.remove('collapsed');
            content.style.display = 'block';
            toggle.querySelector('.material-icons').textContent = 'keyboard_arrow_down';
        } else {
            header.classList.add('collapsed');
            content.style.display = 'none';
            toggle.querySelector('.material-icons').textContent = 'keyboard_arrow_right';
        }
    }

    // PDF Navigation
    async previousPage() {
        if (this.currentPage > 1) {
            await this.goToPage(this.currentPage - 1);
        }
    }

    async nextPage() {
        if (this.currentPage < this.totalPages) {
            await this.goToPage(this.currentPage + 1);
        }
    }

    async goToPage(pageNum) {
        if (pageNum >= 1 && pageNum <= this.totalPages && this.pageContainers.length > 0) {
            const targetContainer = this.pageContainers[pageNum - 1];
            if (targetContainer && this.scrollContainer) {
                // Smooth scroll to the target page
                targetContainer.scrollIntoView({ 
                    behavior: 'smooth', 
                    block: 'start' 
                });
                
                // Update current page
                this.currentPage = pageNum;
                this.updatePageInfo();
                this.updatePDFControls();
                
                // Ensure the target page is rendered
                if (!this.renderedPages.has(pageNum)) {
                    await this.renderPage(pageNum);
                }
            }
        }
    }

    initializePageInput() {
        const pageInput = document.getElementById('page-input');
        if (pageInput) {
            // Update input when current page changes
            pageInput.value = this.currentPage;
            
            // Handle input changes
            pageInput.addEventListener('change', (e) => {
                const pageNum = parseInt(e.target.value);
                if (!isNaN(pageNum)) {
                    this.goToPage(pageNum);
                } else {
                    // Reset to current page if invalid
                    e.target.value = this.currentPage;
                }
            });

            // Handle enter key
            pageInput.addEventListener('keydown', (e) => {
                if (e.key === 'Enter') {
                    const pageNum = parseInt(e.target.value);
                    if (!isNaN(pageNum)) {
                        this.goToPage(pageNum);
                    }
                    e.target.blur(); // Remove focus
                }
            });

            // Select all text when focused
            pageInput.addEventListener('focus', (e) => {
                e.target.select();
            });
        }
    }

    // Zoom functions
    async zoomIn() {
        this.scale = Math.min(this.scale * 1.25, 3.0);
        await this.reRenderAllPages();
        this.updateZoomLevel();
    }

    async zoomOut() {
        this.scale = Math.max(this.scale / 1.25, 0.25);
        await this.reRenderAllPages();
        this.updateZoomLevel();
    }

    async reRenderAllPages() {
        // Clear all rendered pages and re-render visible ones
        this.renderedPages.clear();
        
        // Reset all containers to loading state
        for (let i = 0; i < this.pageContainers.length; i++) {
            const container = this.pageContainers[i];
            const pageNum = i + 1;
            container.innerHTML = '';
            container.style.minHeight = '800px';
            
            const loadingDiv = document.createElement('div');
            loadingDiv.className = 'pdf-page-loading';
            loadingDiv.textContent = `Loading page ${pageNum}...`;
            container.appendChild(loadingDiv);
        }
        
        // Re-render visible pages
        await this.renderVisiblePages();
    }

    updatePageInfo() {
        const pageInput = document.getElementById('page-input');
        const pageTotal = document.getElementById('page-total');
        
        if (pageInput && !this.isScrolling) {
            // Only update if user isn't currently editing the input
            if (document.activeElement !== pageInput) {
                pageInput.value = this.currentPage;
            }
            pageInput.max = this.totalPages;
        }
        
        if (pageTotal) {
            pageTotal.textContent = ` of ${this.totalPages}`;
        }
    }

    updateZoomLevel() {
        const zoomLevel = document.getElementById('zoom-level');
        if (zoomLevel) {
            zoomLevel.textContent = `${Math.round(this.scale * 100)}%`;
        }
    }

    updatePDFControls() {
        const prevBtn = document.getElementById('prev-page');
        const nextBtn = document.getElementById('next-page');

        if (prevBtn) {
            prevBtn.disabled = this.currentPage <= 1;
        }
        if (nextBtn) {
            nextBtn.disabled = this.currentPage >= this.totalPages;
        }

        this.updatePageInfo();
        this.updateZoomLevel();
    }

    // Search functionality methods
    async extractAllTextContent() {
        if (!this.pdfDoc) return;

        console.log('Extracting text content for search...');
        
        for (let pageNum = 1; pageNum <= this.totalPages; pageNum++) {
            try {
                const page = await this.pdfDoc.getPage(pageNum);
                const textContent = await page.getTextContent();
                this.pageTextContent.set(pageNum, textContent);
                
                // Show progress for large documents
                if (pageNum % 10 === 0 || pageNum === this.totalPages) {
                    console.log(`Extracted text from ${pageNum}/${this.totalPages} pages`);
                }
            } catch (error) {
                console.error(`Error extracting text from page ${pageNum}:`, error);
            }
        }
        
        console.log('Text extraction completed');
    }

    async performSearch(searchTerm) {
        if (!searchTerm || searchTerm.trim().length === 0) {
            this.clearSearchHighlights();
            this.updateSearchResults([]);
            return;
        }

        const searchText = searchTerm.trim().toLowerCase();
        const results = [];

        // Search through all pages
        for (let pageNum = 1; pageNum <= this.totalPages; pageNum++) {
            const textContent = this.pageTextContent.get(pageNum);
            if (!textContent) continue;

            // Combine all text items into a single string for this page
            let pageText = '';
            const textItems = [];
            
            textContent.items.forEach(item => {
                textItems.push({
                    text: item.str,
                    transform: item.transform,
                    width: item.width,
                    height: item.height
                });
                pageText += item.str + ' ';
            });

            pageText = pageText.toLowerCase();
            
            // Find all matches in this page
            let searchIndex = 0;
            while ((searchIndex = pageText.indexOf(searchText, searchIndex)) !== -1) {
                // Find which text item contains this match
                let charCount = 0;
                for (let i = 0; i < textItems.length; i++) {
                    const item = textItems[i];
                    const itemText = item.text.toLowerCase();
                    
                    if (charCount <= searchIndex && charCount + itemText.length + 1 > searchIndex) {
                        // Found the text item containing the match
                        results.push({
                            pageNum: pageNum,
                            textItem: item,
                            matchIndex: searchIndex - charCount,
                            searchTerm: searchTerm
                        });
                        break;
                    }
                    charCount += itemText.length + 1; // +1 for the space we added
                }
                
                searchIndex += searchText.length;
            }
        }

        this.searchResults = results;
        this.currentSearchIndex = results.length > 0 ? 0 : -1;
        
        this.updateSearchResults(results);
        this.highlightSearchResults();
        
        if (results.length > 0) {
            await this.goToSearchResult(0);
        }
    }

    updateSearchResults(results) {
        const searchResultsCount = document.getElementById('search-results-count');
        const searchPrevBtn = document.getElementById('search-prev');
        const searchNextBtn = document.getElementById('search-next');

        if (searchResultsCount) {
            if (results.length === 0) {
                searchResultsCount.textContent = '0 results';
            } else {
                searchResultsCount.textContent = `${this.currentSearchIndex + 1} of ${results.length} results`;
            }
        }

        if (searchPrevBtn) {
            searchPrevBtn.disabled = results.length === 0 || this.currentSearchIndex <= 0;
        }

        if (searchNextBtn) {
            searchNextBtn.disabled = results.length === 0 || this.currentSearchIndex >= results.length - 1;
        }
    }

    async highlightSearchResults() {
        // Clear existing highlights
        this.clearSearchHighlights();

        if (this.searchResults.length === 0) return;

        for (let i = 0; i < this.searchResults.length; i++) {
            const result = this.searchResults[i];
            const pageNum = result.pageNum;
            
            // Ensure the page is rendered before highlighting
            if (!this.renderedPages.has(pageNum)) {
                await this.renderPage(pageNum);
            }
            
            await this.highlightSearchResult(result, i === this.currentSearchIndex);
        }
    }

    async highlightSearchResult(result, isCurrent = false) {
        const { pageNum, textItem } = result;
        const overlay = document.querySelector(`[data-page-num="${pageNum}"].pdf-page-overlay`);
        
        if (!overlay) return;

        // Get page for viewport calculation
        const page = await this.pdfDoc.getPage(pageNum);
        const viewport = page.getViewport({scale: this.scale});

        // Calculate highlight position
        const transform = textItem.transform;
        const x = transform[4];
        const y = viewport.height - transform[5]; // PDF coordinates are bottom-up
        const width = textItem.width;
        const height = textItem.height || 12; // Fallback height

        // Create highlight element
        const highlight = document.createElement('div');
        highlight.className = `search-highlight ${isCurrent ? 'current' : ''}`;
        highlight.style.left = `${x}px`;
        highlight.style.top = `${y - height}px`;
        highlight.style.width = `${width}px`;
        highlight.style.height = `${height}px`;
        highlight.dataset.resultIndex = this.searchResults.indexOf(result);

        overlay.appendChild(highlight);
    }

    clearSearchHighlights() {
        const highlights = document.querySelectorAll('.search-highlight');
        highlights.forEach(highlight => highlight.remove());
    }

    // Extraction Highlighting Methods
    async highlightExtraction(extraction) {
        console.log('🎯 Highlighting extraction:', extraction);

        if (!extraction || !extraction.page) {
            console.error('❌ Missing page data:', {
                hasExtraction: !!extraction,
                hasPage: !!extraction?.page
            });
            return;
        }

        const pageNum = extraction.page;

        // CHANGED: Use bbox for precision (like OpenContracts), fallback to text search
        // Bbox provides pixel-perfect highlighting when available
        // Research shows bbox-based is industry standard (OpenContracts, OpenAI Contract Agent)
        if (extraction.bbox) {
            console.log(`📄 Page ${pageNum} - using bbox (primary method - precise)`);
            try {
                await this.highlightWithBbox(extraction, pageNum);
            } catch (error) {
                console.error(`❌ Bbox highlighting failed:`, error);
                console.log(`📄 Falling back to text search`);
                if (extraction.text && extraction.text.length >= 3) {
                    await this.highlightWithTextSearch(extraction, pageNum);
                }
            }
        } else if (extraction.text && extraction.text.length >= 3) {
            // Fallback to text search only if no bbox available
            console.log(`📄 Page ${pageNum} - using text search (fallback - no bbox)`);
            await this.highlightWithTextSearch(extraction, pageNum);
        } else {
            console.warn(`⚠️ Cannot highlight: no valid bbox or text (text length: ${extraction.text?.length || 0})`);
        }
    }

    async highlightWithBbox(extraction, pageNum) {
        // Clear previous highlights
        this.clearExtractionHighlights();

        // Navigate to page
        await this.goToPage(pageNum);

        // Retry logic to ensure overlay exists
        const maxRetries = 3;
        let overlayFound = false;

        for (let attempt = 1; attempt <= maxRetries; attempt++) {
            console.log(`Attempt ${attempt}/${maxRetries} to render page ${pageNum}`);

            // Ensure page is rendered
            if (!this.renderedPages.has(pageNum)) {
                await this.renderPage(pageNum);
            }

            // Wait for DOM to settle
            await new Promise(resolve => setTimeout(resolve, 200));

            // Check if overlay exists
            const overlay = document.querySelector(`[data-page-num="${pageNum}"].pdf-page-overlay`);
            if (overlay) {
                console.log(`✅ Overlay found on attempt ${attempt}`);
                overlayFound = true;
                break;
            } else {
                console.warn(`⚠️ No overlay found on attempt ${attempt}`);
                // Force re-render by removing from rendered set
                this.renderedPages.delete(pageNum);
            }
        }

        if (!overlayFound) {
            console.error(`❌ Failed to find/create overlay after ${maxRetries} attempts`);
            // Try to create it manually
            await this.ensureOverlayExists(pageNum);
        }

        // Add highlight
        await this.highlightExtractionBbox(extraction, pageNum);
    }

    async highlightWithTextSearch(extraction, pageNum) {
        const searchText = extraction.text;
        if (!searchText || searchText.length < 3) {
            console.warn('⚠️ Text too short for search');
            return;
        }

        console.log(`🔍 Text search for: "${searchText.substring(0, 50)}${searchText.length > 50 ? '...' : ''}"`);

        // Clear previous highlights
        this.clearExtractionHighlights();

        // Navigate to page
        await this.goToPage(pageNum);

        // Ensure page is rendered
        if (!this.renderedPages.has(pageNum)) {
            await this.renderPage(pageNum);
        }

        // Wait for page to be ready
        await new Promise(resolve => setTimeout(resolve, 300));

        // Get text content for this page
        if (!this.pageTextContent.has(pageNum)) {
            try {
                const page = await this.pdfDoc.getPage(pageNum);
                const textContent = await page.getTextContent();
                this.pageTextContent.set(pageNum, textContent);
            } catch (error) {
                console.error(`Error getting text content for page ${pageNum}:`, error);
                return;
            }
        }

        const textContent = this.pageTextContent.get(pageNum);
        const container = this.pageContainers[pageNum - 1];
        const scale = parseFloat(container.dataset.scale) || this.scale;
        const page = await this.pdfDoc.getPage(pageNum);
        const viewport = page.getViewport({scale: scale});

        // Enhanced text matching with normalization
        const normalizeText = (text) => {
            return text.toLowerCase()
                .replace(/\s+/g, ' ')  // Normalize whitespace
                .replace(/[^\w\s]/g, '') // Remove punctuation
                .trim();
        };

        const searchNorm = normalizeText(searchText);
        const matches = [];

        // Strategy 1: Exact match (case-insensitive)
        textContent.items.forEach((item, index) => {
            if (item.str.toLowerCase().includes(searchText.toLowerCase())) {
                matches.push({item, index, score: 100, method: 'exact'});
            }
        });

        // Strategy 2: Normalized match (if no exact match)
        if (matches.length === 0) {
            textContent.items.forEach((item, index) => {
                const itemNorm = normalizeText(item.str);
                if (itemNorm.includes(searchNorm)) {
                    matches.push({item, index, score: 80, method: 'normalized'});
                }
            });
        }

        // Strategy 3: Multi-word spanning match (combine adjacent items)
        if (matches.length === 0 && searchText.split(' ').length > 1) {
            for (let i = 0; i < textContent.items.length - 1; i++) {
                let combined = '';
                let itemGroup = [];

                for (let j = i; j < Math.min(i + 10, textContent.items.length); j++) {
                    combined += textContent.items[j].str + ' ';
                    itemGroup.push(textContent.items[j]);

                    if (normalizeText(combined).includes(searchNorm)) {
                        // Found spanning match - use first and last items to create bounds
                        matches.push({
                            item: itemGroup[0],
                            itemGroup: itemGroup,
                            index: i,
                            score: 60,
                            method: 'spanning'
                        });
                        break;
                    }
                }
            }
        }

        // Strategy 4: Partial match (if still no match and text is long enough)
        if (matches.length === 0 && searchNorm.length > 10) {
            const partialSearch = searchNorm.substring(0, Math.max(10, Math.floor(searchNorm.length * 0.7)));
            textContent.items.forEach((item, index) => {
                const itemNorm = normalizeText(item.str);
                if (itemNorm.includes(partialSearch)) {
                    matches.push({item, index, score: 40, method: 'partial'});
                }
            });
        }

        if (matches.length === 0) {
            console.warn(`⚠️ Text not found on page ${pageNum}: "${searchText.substring(0, 30)}..."`);
            return;
        }

        // Sort by score (highest first)
        matches.sort((a, b) => b.score - a.score);
        const bestMatch = matches[0];

        console.log(`✅ Found ${matches.length} match(es), using ${bestMatch.method} match (score: ${bestMatch.score})`);

        // Calculate highlight position
        let x, y, width, height;

        if (bestMatch.itemGroup) {
            // Spanning match - calculate bounding box for all items
            const firstItem = bestMatch.itemGroup[0];
            const lastItem = bestMatch.itemGroup[bestMatch.itemGroup.length - 1];

            const x1 = firstItem.transform[4] * scale;
            const y1 = viewport.height - (firstItem.transform[5] * scale);
            const x2 = (lastItem.transform[4] + lastItem.width) * scale;
            const y2 = viewport.height - ((lastItem.transform[5] - lastItem.height) * scale);

            x = Math.min(x1, x2);
            y = Math.min(y1, y2);
            width = Math.abs(x2 - x1);
            height = Math.abs(y2 - y1);

            console.log(`📏 Spanning highlight: ${bestMatch.itemGroup.length} text items`);
        } else {
            // Single item match
            const match = bestMatch.item;
            const transform = match.transform;
            x = transform[4] * scale;
            y = viewport.height - (transform[5] * scale);
            width = match.width * scale;
            height = match.height * scale || 12 * scale; // Fallback height
        }

        // Get or create overlay with CONSISTENT dimensions
        let overlay = document.querySelector(`[data-page-num="${pageNum}"].pdf-page-overlay`);
        if (!overlay) {
            overlay = document.createElement('div');
            overlay.className = 'pdf-page-overlay';
            overlay.dataset.pageNum = String(pageNum);
            container.appendChild(overlay);
        }

        // CRITICAL: Always set overlay dimensions to match canvas exactly
        overlay.style.width = `${viewport.width}px`;
        overlay.style.height = `${viewport.height}px`;
        overlay.style.position = 'absolute';
        overlay.style.top = '0';
        overlay.style.left = '0';

        console.log(`📐 Highlight position: x=${x.toFixed(1)}, y=${y.toFixed(1)}, w=${width.toFixed(1)}, h=${height.toFixed(1)}`);

        // Create highlight
        const highlight = document.createElement('div');
        highlight.className = 'extraction-highlight';
        highlight.style.position = 'absolute';
        highlight.style.left = `${x}px`;
        highlight.style.top = `${y}px`;
        highlight.style.width = `${width}px`;
        highlight.style.height = `${height}px`;
        highlight.style.backgroundColor = 'rgba(255, 255, 0, 0.3)';
        highlight.style.border = '2px solid rgba(255, 235, 0, 0.6)';
        highlight.style.boxSizing = 'border-box';
        highlight.style.pointerEvents = 'none';
        highlight.style.zIndex = '10';
        highlight.style.animation = 'highlightPulse 1s ease-in-out 2';

        overlay.appendChild(highlight);
        console.log(`✅ Text-search highlight added (${bestMatch.method} match)`);

        // Scroll into view
        setTimeout(() => {
            highlight.scrollIntoView({behavior: 'smooth', block: 'center'});
        }, 100);
    }

    async highlightExtractionBbox(extraction, pageNum) {
        console.log(`🔎 Finding overlay for page ${pageNum}`);

        // Try to find overlay
        let overlay = document.querySelector(`[data-page-num="${pageNum}"].pdf-page-overlay`);

        if (!overlay) {
            console.warn(`⚠️ Overlay not found with standard selector`);

            // Try container-based approach
            const container = this.pageContainers[pageNum - 1];
            if (container) {
                console.log(`📦 Checking container for page ${pageNum}`);
                overlay = container.querySelector('.pdf-page-overlay');

                if (!overlay) {
                    console.error(`❌ No overlay in container. Creating new one...`);
                    overlay = document.createElement('div');
                    overlay.className = 'pdf-page-overlay';
                    overlay.dataset.pageNum = String(pageNum);
                    container.appendChild(overlay);
                    console.log(`✅ Overlay created`);
                }
            } else {
                console.error(`❌ No container for page ${pageNum}`);
                return;
            }
        }

        console.log(`✅ Overlay found:`, overlay);

        // Get the container and its scale
        const container = this.pageContainers[pageNum - 1];
        const scale = parseFloat(container.dataset.scale) || this.scale;

        // Get page for viewport calculation
        const page = await this.pdfDoc.getPage(pageNum);
        const viewport = page.getViewport({scale: scale});

        // CRITICAL: Get PDF's actual mediaBox dimensions with robust fallback
        let pdfMediaBoxWidth = null;
        let pdfMediaBoxHeight = null;

        // Try page.view first (preferred - gives true mediaBox)
        if (page.view && Array.isArray(page.view) && page.view.length === 4) {
            pdfMediaBoxWidth = page.view[2] - page.view[0];
            pdfMediaBoxHeight = page.view[3] - page.view[1];
            console.log(`📐 PDF MediaBox (page.view): ${pdfMediaBoxWidth.toFixed(1)} x ${pdfMediaBoxHeight.toFixed(1)}`);
        }
        // Fallback to viewport.viewBox
        else if (viewport.viewBox && Array.isArray(viewport.viewBox) && viewport.viewBox.length === 4) {
            pdfMediaBoxWidth = viewport.viewBox[2] - viewport.viewBox[0];
            pdfMediaBoxHeight = viewport.viewBox[3] - viewport.viewBox[1];
            console.log(`⚠️ PDF MediaBox (viewport.viewBox fallback): ${pdfMediaBoxWidth.toFixed(1)} x ${pdfMediaBoxHeight.toFixed(1)}`);
        }
        // Last resort: calculate from viewport at scale=1
        else {
            const unscaledViewport = page.getViewport({scale: 1});
            pdfMediaBoxWidth = unscaledViewport.width;
            pdfMediaBoxHeight = unscaledViewport.height;
            console.log(`⚠️ PDF MediaBox (viewport scale=1 fallback): ${pdfMediaBoxWidth.toFixed(1)} x ${pdfMediaBoxHeight.toFixed(1)}`);
        }

        // Validate mediaBox dimensions
        if (!pdfMediaBoxWidth || !pdfMediaBoxHeight || isNaN(pdfMediaBoxWidth) || isNaN(pdfMediaBoxHeight)) {
            console.error('❌ Could not determine PDF dimensions!');
            console.error('   page.view:', page.view);
            console.error('   viewport.viewBox:', viewport.viewBox);
            throw new Error('Unable to get PDF dimensions for bbox transformation');
        }

        console.log(`📺 Viewport dimensions: ${viewport.width.toFixed(1)} x ${viewport.height.toFixed(1)}`);
        console.log(`📏 Display scale: ${scale.toFixed(4)}`);

        // CRITICAL: Set overlay dimensions to match canvas exactly
        overlay.style.width = `${viewport.width}px`;
        overlay.style.height = `${viewport.height}px`;
        overlay.style.position = 'absolute';
        overlay.style.top = '0';
        overlay.style.left = '0';

        // Debug: Log canvas and overlay dimensions
        const canvas = container.querySelector('.pdf-page-canvas');
        console.log(`🖼️ Canvas dimensions: ${canvas?.width}x${canvas?.height}`);
        console.log(`📦 Overlay dimensions: ${overlay.style.width} x ${overlay.style.height}`);
        console.log(`📦 Container dimensions: ${container.offsetWidth}x${container.offsetHeight}`);

        // CORRECTED: Zuva bbox uses TOP-LEFT origin (same as canvas/screen)
        // Bbox format: [left, bottomY, right, topY] where bottomY > topY (Y increases downward)
        const bbox = extraction.bbox;

        // Handle both array format and object format
        let left, right, topY, bottomY;
        if (Array.isArray(bbox)) {
            // Array format: [left, bottomY, right, topY] (TOP-LEFT origin, confusingly ordered)
            // bottomY > topY because Y increases downward (top of text has smaller Y)
            [left, bottomY, right, topY] = bbox;
            console.log(`📐 Bbox array [L,B,R,T]: [${left}, ${bottomY}, ${right}, ${topY}] (top-left origin)`);
        } else {
            // Object format: {left, right, top, bottom}
            left = bbox.left;
            right = bbox.right;
            topY = bbox.top;
            bottomY = bbox.bottom;
            console.log(`📐 Bbox object: {left=${left}, top=${topY}, right=${right}, bottom=${bottomY}}`);
        }

        // VALIDATION: Ensure bbox coordinates are valid
        if (left >= right) {
            console.error(`❌ Invalid bbox: left (${left}) >= right (${right})`);
            throw new Error('Invalid bbox: left >= right');
        }
        // For top-left origin: bottomY > topY (bottom is further down page, has higher Y)
        if (bottomY <= topY) {
            console.error(`❌ Invalid bbox: bottomY (${bottomY}) <= topY (${topY}) - expected bottomY > topY in top-left origin`);
            throw new Error('Invalid bbox: bottomY must be > topY');
        }

        // FIXED: Calculate coordinate space conversion scale
        // Bbox coordinates are in PDF's mediaBox coordinate space
        // Need to transform FROM: PDF mediaBox space TO: Viewport display space
        const coordScaleX = viewport.width / pdfMediaBoxWidth;
        const coordScaleY = viewport.height / pdfMediaBoxHeight;

        console.log(`🔄 Coordinate space conversion:`);
        console.log(`   MediaBox: ${pdfMediaBoxWidth.toFixed(1)} x ${pdfMediaBoxHeight.toFixed(1)}`);
        console.log(`   Viewport: ${viewport.width.toFixed(1)} x ${viewport.height.toFixed(1)}`);
        console.log(`   Scale X: ${coordScaleX.toFixed(4)}, Scale Y: ${coordScaleY.toFixed(4)}`);
        console.log(`   (Previous display scale ${scale.toFixed(4)} was WRONG for bbox transform!)`);

        // VALIDATION: Verify scale is reasonable
        if (coordScaleX > 2.0 || coordScaleY > 2.0) {
            console.warn(`⚠️ Coordinate scale suspiciously large: X=${coordScaleX.toFixed(4)}, Y=${coordScaleY.toFixed(4)}`);
            console.warn(`   This suggests mediaBox dimensions may be wrong`);
            console.warn(`   MediaBox: ${pdfMediaBoxWidth.toFixed(1)} x ${pdfMediaBoxHeight.toFixed(1)}`);
            console.warn(`   Viewport: ${viewport.width.toFixed(1)} x ${viewport.height.toFixed(1)}`);
        }
        if (coordScaleX < 0.1 || coordScaleY < 0.1) {
            console.warn(`⚠️ Coordinate scale suspiciously small: X=${coordScaleX.toFixed(4)}, Y=${coordScaleY.toFixed(4)}`);
            console.warn(`   Expected range: 0.3 - 2.0 for most PDFs`);
        }

        // Apply correct coordinate space transformation
        const x = left * coordScaleX;
        const y = topY * coordScaleY;
        const width = (right - left) * coordScaleX;
        const height = (bottomY - topY) * coordScaleY;

        console.log(`📍 Bbox transform: [${left}, ${bottomY}, ${right}, ${topY}] →`);
        console.log(`   Canvas: x=${x.toFixed(1)}, y=${y.toFixed(1)}, w=${width.toFixed(1)}, h=${height.toFixed(1)}`);
        console.log(`   Previous WRONG: x=${(left * scale).toFixed(1)}, y=${(topY * scale).toFixed(1)} (would be beyond viewport!)`);

        // VALIDATION: Check if highlight is within viewport bounds
        if (x < 0 || y < 0 || x + width > viewport.width || y + height > viewport.height) {
            console.warn(`⚠️ Highlight extends beyond viewport:`,
                `x=${x.toFixed(1)}, y=${y.toFixed(1)}, w=${width.toFixed(1)}, h=${height.toFixed(1)}`,
                `viewport: ${viewport.width.toFixed(1)}x${viewport.height.toFixed(1)}`);
            // Clamp to viewport bounds
            const clampedX = Math.max(0, Math.min(x, viewport.width));
            const clampedY = Math.max(0, Math.min(y, viewport.height));
            const clampedWidth = Math.min(width, viewport.width - clampedX);
            const clampedHeight = Math.min(height, viewport.height - clampedY);
            console.log(`📐 Clamped to: x=${clampedX.toFixed(1)}, y=${clampedY.toFixed(1)}, w=${clampedWidth.toFixed(1)}, h=${clampedHeight.toFixed(1)}`);
        }

        console.log(`🎯 Final canvas coords: x=${x.toFixed(1)}, y=${y.toFixed(1)}, w=${width.toFixed(1)}, h=${height.toFixed(1)}`);

        // Create highlight element
        const highlight = document.createElement('div');
        highlight.className = 'extraction-highlight';
        highlight.style.position = 'absolute';
        highlight.style.left = `${x}px`;
        highlight.style.top = `${y}px`;
        highlight.style.width = `${width}px`;
        highlight.style.height = `${height}px`;
        highlight.style.backgroundColor = 'rgba(255, 255, 0, 0.3)'; // Light yellow - 30% opacity
        highlight.style.border = '2px solid rgba(255, 235, 0, 0.6)'; // Darker yellow border
        highlight.style.boxSizing = 'border-box';
        highlight.style.pointerEvents = 'none';
        highlight.style.zIndex = '10';
        highlight.style.animation = 'highlightPulse 1s ease-in-out 2';

        overlay.appendChild(highlight);
        console.log(`✅ Highlight added to overlay`);

        // Scroll highlight into view if needed
        setTimeout(() => {
            highlight.scrollIntoView({
                behavior: 'smooth',
                block: 'center'
            });
        }, 100);
    }

    async ensureOverlayExists(pageNum) {
        const container = this.pageContainers[pageNum - 1];
        if (!container) {
            console.error(`❌ No container for page ${pageNum}`);
            return false;
        }

        let overlay = container.querySelector('.pdf-page-overlay');
        if (!overlay) {
            console.log(`🔧 Creating missing overlay for page ${pageNum}`);
            overlay = document.createElement('div');
            overlay.className = 'pdf-page-overlay';
            overlay.dataset.pageNum = String(pageNum);
            container.appendChild(overlay);
            console.log(`✅ Overlay created and appended`);
        } else {
            console.log(`✅ Overlay already exists for page ${pageNum}`);
        }

        return true;
    }

    clearExtractionHighlights() {
        const highlights = document.querySelectorAll('.extraction-highlight');
        highlights.forEach(highlight => highlight.remove());
    }

    async goToSearchResult(index) {
        if (index < 0 || index >= this.searchResults.length) return;

        this.currentSearchIndex = index;
        const result = this.searchResults[index];
        
        // Navigate to the page containing this result
        await this.goToPage(result.pageNum);
        
        // Update highlights to show current result
        await this.highlightSearchResults();
        
        // Update search navigation
        this.updateSearchResults(this.searchResults);
    }

    async goToNextSearchResult() {
        if (this.searchResults.length === 0) return;
        
        const nextIndex = (this.currentSearchIndex + 1) % this.searchResults.length;
        await this.goToSearchResult(nextIndex);
    }

    async goToPreviousSearchResult() {
        if (this.searchResults.length === 0) return;
        
        const prevIndex = this.currentSearchIndex <= 0 ? 
            this.searchResults.length - 1 : 
            this.currentSearchIndex - 1;
        await this.goToSearchResult(prevIndex);
    }

    showLoading(show) {
        const loadingElement = document.getElementById('pdf-loading');
        const canvas = document.getElementById('pdf-canvas');
        
        if (loadingElement) {
            loadingElement.style.display = show ? 'flex' : 'none';
        }
        if (canvas) {
            canvas.style.display = show ? 'none' : 'block';
        }
    }

    showError(message) {
        const loadingElement = document.getElementById('pdf-loading');
        if (loadingElement) {
            loadingElement.innerHTML = `
                <div class="error-icon" style="color: #f44336; font-size: 32px;">⚠</div>
                <p style="color: #f44336;">${message}</p>
            `;
            loadingElement.style.display = 'flex';
        }
    }

    showPDFError(message) {
        const canvas = document.getElementById('pdf-canvas');
        if (canvas) {
            canvas.style.display = 'none';
        }
        
        const viewer = document.getElementById('pdf-viewer');
        if (viewer) {
            viewer.innerHTML = `
                <div class="pdf-error" style="display: flex; flex-direction: column; align-items: center; gap: 16px; color: #666;">
                    <div style="font-size: 48px; color: #f44336;">📄</div>
                    <p>${message}</p>
                    <p style="font-size: 12px;">This is a demo - PDF viewing would work with actual documents.</p>
                </div>
            `;
        }
    }

    exportDocument() {
        if (this.currentDocument) {
            // In a real implementation, this would trigger a download
            console.log('Exporting document:', this.currentDocument.name);
            alert('Export functionality would be implemented here');
        }
    }

    goBack() {
        // Navigate back to documents page
        window.location.href = 'index.html#documents';
    }

    // Extraction Methods
    async checkAndStartExtraction(documentId, workflowId) {
        try {
            // Check extraction status first
            const statusResponse = await fetch(
                `/api/documents/${documentId}/extraction/status?workflow_id=${workflowId}`,
                { headers: getAuthHeaders() }
            );

            if (statusResponse.ok) {
                const statusData = await statusResponse.json();

                if (statusData.status === 'complete') {
                    // Load results
                    console.log('✅ Extraction already complete for workflow:', workflowId);
                    await this.loadExtractionResults(documentId, workflowId);
                } else if (statusData.status === 'processing' || statusData.status === 'pending') {
                    // Poll for status
                    console.log('⏳ Extraction in progress for workflow:', workflowId);
                    this.pollExtractionStatus(documentId, workflowId);
                } else if (statusData.status === 'not_started' || statusData.status === 'failed') {
                    // Start extraction
                    console.log('🚀 Starting extraction for workflow:', workflowId);
                    await this.startExtraction(documentId, workflowId);
                }
            }
        } catch (error) {
            console.error('Error checking extraction status:', error);
        }
    }

    async startExtraction(documentId, workflowId) {
        try {
            const response = await fetch(
                `/api/documents/${documentId}/extract?workflow_id=${workflowId}`,
                {
                    method: 'POST',
                    headers: getAuthHeaders()
                }
            );

            if (response.ok) {
                const data = await response.json();
                console.log('✅ Extraction started:', data);

                // Show extraction in progress indicator
                this.showExtractionStatus(workflowId, 'processing');

                // Start polling for results
                this.pollExtractionStatus(documentId, workflowId);
            } else {
                console.error('Failed to start extraction:', response.status);
            }
        } catch (error) {
            console.error('Error starting extraction:', error);
        }
    }

    pollExtractionStatus(documentId, workflowId) {
        // Poll every 5 seconds for extraction status with 3-minute timeout
        let pollCount = 0;
        const MAX_POLLS = 36; // 36 × 5 seconds = 3 minutes
        const startTime = Date.now();

        const pollInterval = setInterval(async () => {
            pollCount++;
            const elapsedSeconds = Math.floor((Date.now() - startTime) / 1000);

            // Check for timeout
            if (pollCount >= MAX_POLLS) {
                clearInterval(pollInterval);
                console.error('❌ Extraction timeout after 3 minutes');
                this.showExtractionTimeout(workflowId, documentId);
                return;
            }

            try {
                const statusResponse = await fetch(
                    `/api/documents/${documentId}/extraction/status?workflow_id=${workflowId}`,
                    { headers: getAuthHeaders() }
                );

                if (statusResponse.ok) {
                    const statusData = await statusResponse.json();

                    if (statusData.status === 'complete') {
                        // Stop polling and load results
                        clearInterval(pollInterval);
                        console.log('✅ Extraction completed for workflow:', workflowId);
                        await this.loadExtractionResults(documentId, workflowId);
                        this.showExtractionStatus(workflowId, 'complete');
                    } else if (statusData.status === 'failed') {
                        // Stop polling on failure
                        clearInterval(pollInterval);
                        console.error('❌ Extraction failed for workflow:', workflowId);
                        this.showExtractionStatus(workflowId, 'failed', statusData.error_message);
                    } else {
                        // Update status display with elapsed time
                        this.showExtractionStatus(workflowId, statusData.status, null, elapsedSeconds);
                    }
                } else {
                    console.warn('Status check failed:', statusResponse.status);
                }
            } catch (error) {
                console.error('Error polling extraction status:', error);
                // Don't stop polling on network errors, might be temporary
            }
        }, 5000); // Poll every 5 seconds
    }

    async loadExtractionResults(documentId, workflowId) {
        try {
            const response = await fetch(
                `/api/documents/${documentId}/extraction/results?workflow_id=${workflowId}`,
                { headers: getAuthHeaders() }
            );

            if (response.ok) {
                const data = await response.json();
                if (data.status === 'complete' && data.results) {
                    console.log('📊 Extraction results loaded:', data.results);
                    this.updateExtractedTermsWithRealData(data.results);
                }
            }
        } catch (error) {
            console.error('Error loading extraction results:', error);
        }
    }

    showExtractionStatus(workflowId, status, errorMessage = null, elapsedSeconds = null) {
        // Update UI to show extraction status
        const statusMessages = {
            'pending': '⏳ Extraction queued...',
            'processing': '⚙️ Extracting fields...',
            'complete': '✅ Extraction complete',
            'failed': '❌ Extraction failed'
        };

        let message = statusMessages[status] || status;

        // Add elapsed time for processing status
        if (status === 'processing' && elapsedSeconds !== null) {
            message += ` (${elapsedSeconds}s)`;
        }

        // Add error message if failed
        if (status === 'failed' && errorMessage) {
            message += `: ${errorMessage}`;
        }

        console.log(`Workflow ${workflowId}: ${message}`);

        // Update UI status indicator
        const container = document.getElementById('extracted-terms-container');
        if (container) {
            let statusDiv = container.querySelector('.extraction-status-indicator');

            if (!statusDiv && status !== 'complete') {
                // Create status indicator if it doesn't exist
                statusDiv = document.createElement('div');
                statusDiv.className = 'extraction-status-indicator';
                statusDiv.style.cssText = 'padding: 12px; margin: 12px 0; border-radius: 4px; text-align: center; font-size: 14px;';

                // Insert at the top of container
                if (container.firstChild) {
                    container.insertBefore(statusDiv, container.firstChild);
                } else {
                    container.appendChild(statusDiv);
                }
            }

            if (statusDiv) {
                statusDiv.textContent = message;

                // Style based on status
                if (status === 'processing' || status === 'pending') {
                    statusDiv.style.backgroundColor = '#e3f2fd';
                    statusDiv.style.color = '#1976d2';
                    statusDiv.style.border = '1px solid #1976d2';
                } else if (status === 'failed') {
                    statusDiv.style.backgroundColor = '#ffebee';
                    statusDiv.style.color = '#c62828';
                    statusDiv.style.border = '1px solid #c62828';
                } else if (status === 'complete') {
                    // Remove status indicator when complete
                    statusDiv.remove();
                }
            }
        }
    }

    showExtractionTimeout(workflowId, documentId) {
        // Show timeout error with retry option
        const container = document.getElementById('extracted-terms-container');
        if (!container) return;

        let timeoutDiv = container.querySelector('.extraction-timeout-error');

        if (!timeoutDiv) {
            timeoutDiv = document.createElement('div');
            timeoutDiv.className = 'extraction-timeout-error';
            timeoutDiv.style.cssText = 'padding: 20px; margin: 12px 0; border-radius: 8px; text-align: center; background: #fff3e0; color: #e65100; border: 2px solid #ff9800;';

            timeoutDiv.innerHTML = `
                <div style="font-size: 24px; margin-bottom: 12px;">⏱️</div>
                <div style="font-weight: bold; margin-bottom: 8px;">Extraction Timeout</div>
                <div style="margin-bottom: 16px;">The extraction is taking longer than expected (3 minutes). This might be due to a large document or temporary API issues.</div>
                <button class="btn-retry-extraction" style="padding: 8px 16px; background: #ff9800; color: white; border: none; border-radius: 4px; cursor: pointer; font-size: 14px;">
                    Retry Extraction
                </button>
            `;

            // Insert at the top
            if (container.firstChild) {
                container.insertBefore(timeoutDiv, container.firstChild);
            } else {
                container.appendChild(timeoutDiv);
            }

            // Add retry button handler
            const retryBtn = timeoutDiv.querySelector('.btn-retry-extraction');
            if (retryBtn) {
                retryBtn.addEventListener('click', async () => {
                    timeoutDiv.remove();
                    await this.startExtraction(documentId, workflowId);
                });
            }
        }
    }

}


// Initialize the document detail page when DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
    new DocumentDetailPage();
});

// Global functions for testing
window.DocumentDetailPage = DocumentDetailPage;