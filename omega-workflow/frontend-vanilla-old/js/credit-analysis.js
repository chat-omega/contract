/**
 * Credit Analysis Chat Interface
 * Handles chat functionality with file upload and message persistence
 */

class CreditAnalysisChat {
    constructor() {
        this.messages = [];
        this.chatInput = null;
        this.chatMessages = null;
        this.sendButton = null;
        this.fileUpload = null;
        this.initialized = false;
        this.STORAGE_KEY = 'credit_analysis_chat_history';
        this.API_BASE_URL = window.location.origin.includes('localhost')
            ? 'http://localhost:5001'
            : window.location.origin;
        this.currentDocumentId = null;
        this.pollingInterval = null;
    }

    /**
     * Initialize the chat interface
     */
    init() {
        if (this.initialized) {
            console.log('✅ Credit Analysis Chat already initialized');
            return;
        }

        console.log('🚀 Initializing Credit Analysis Chat');

        // Get DOM elements
        this.chatInput = document.getElementById('chat-input');
        this.chatMessages = document.getElementById('chat-messages');
        this.sendButton = document.getElementById('chat-send-btn');
        this.fileUpload = document.getElementById('file-upload');

        if (!this.chatInput || !this.chatMessages || !this.sendButton || !this.fileUpload) {
            console.error('❌ Credit Analysis Chat elements not found in DOM');
            return;
        }

        // Load chat history from localStorage
        this.loadChatHistory();

        // Set up event listeners
        this.setupEventListeners();

        // Render existing messages if any
        if (this.messages.length > 0) {
            this.renderMessages();
        }

        this.initialized = true;
        console.log('✅ Credit Analysis Chat initialized successfully');
    }

    /**
     * Set up event listeners
     */
    setupEventListeners() {
        // Send message on button click
        this.sendButton.addEventListener('click', () => this.handleSendMessage());

        // Send message on Enter key (Shift+Enter for new line)
        this.chatInput.addEventListener('keydown', (e) => {
            if (e.key === 'Enter' && !e.shiftKey) {
                e.preventDefault();
                this.handleSendMessage();
            }
        });

        // File upload handler
        this.fileUpload.addEventListener('change', (e) => this.handleFileUpload(e));

        // Tab switching (Fast Research / Deep Research)
        const tabs = document.querySelectorAll('.chat-tab');
        tabs.forEach(tab => {
            tab.addEventListener('click', (e) => this.handleTabSwitch(e));
        });

        // Sample question card clicks
        const sampleQuestionCards = document.querySelectorAll('.sample-question-card');
        sampleQuestionCards.forEach(card => {
            card.addEventListener('click', (e) => this.handleSampleQuestionClick(e));
        });

        // Back to chat button
        const backBtn = document.getElementById('back-to-chat-btn');
        if (backBtn) {
            backBtn.addEventListener('click', () => this.hideCreditReport());
        }

        // Follow-up question handler
        const followupBtn = document.getElementById('followup-send-btn');
        const followupInput = document.getElementById('followup-input');
        if (followupBtn && followupInput) {
            followupBtn.addEventListener('click', () => {
                const question = followupInput.value.trim();
                if (question) {
                    console.log('Follow-up:', question);
                    // TODO: Handle follow-up question (could expand report or add to bottom)
                    followupInput.value = '';
                }
            });

            // Allow Enter key to send follow-up
            followupInput.addEventListener('keydown', (e) => {
                if (e.key === 'Enter' && !e.shiftKey) {
                    e.preventDefault();
                    followupBtn.click();
                }
            });
        }
    }

    /**
     * Handle sending a message
     */
    handleSendMessage() {
        const message = this.chatInput.value.trim();

        if (!message) {
            return;
        }

        console.log('📤 Sending message:', message);

        // Add user message to chat
        this.addMessage({
            role: 'user',
            content: message,
            timestamp: new Date().toISOString()
        });

        // Send to credit analysis API
        this.sendCreditAnalysisQuery(message);

        // Clear input
        this.chatInput.value = '';
    }

    /**
     * Handle file upload
     */
    handleFileUpload(event) {
        const file = event.target.files[0];

        if (!file) {
            return;
        }

        console.log('📎 File uploaded:', file.name, file.type, file.size);

        // Add user message indicating file upload
        this.addMessage({
            role: 'user',
            content: `📎 Uploaded file: ${file.name}`,
            timestamp: new Date().toISOString(),
            isFileUpload: true,
            fileName: file.name,
            fileSize: file.size,
            fileType: file.type
        });

        // Upload to API
        this.uploadCreditDocument(file);

        // Clear file input
        event.target.value = '';
    }

    /**
     * Handle tab switching
     */
    handleTabSwitch(event) {
        const clickedTab = event.target;
        const allTabs = document.querySelectorAll('.chat-tab');

        // Update active state
        allTabs.forEach(tab => tab.classList.remove('active'));
        clickedTab.classList.add('active');

        console.log('🔄 Switched to tab:', clickedTab.textContent);
    }

    /**
     * Handle sample question card click
     */
    handleSampleQuestionClick(event) {
        // Get the question text from the data attribute
        const card = event.currentTarget;
        const question = card.dataset.question;

        console.log('📝 Sample question clicked:', question);

        // Populate the chat input with the question
        this.chatInput.value = question;

        // Focus the input field
        this.chatInput.focus();

        // Optional: Auto-scroll to the input
        this.chatInput.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
    }

    /**
     * Add a message to the chat
     */
    addMessage(message) {
        this.messages.push(message);
        this.renderMessage(message);
        this.saveChatHistory();
        this.scrollToBottom();
    }

    /**
     * Render all messages
     */
    renderMessages() {
        // Clear welcome message
        this.chatMessages.innerHTML = '';

        this.messages.forEach(message => {
            this.renderMessage(message);
        });

        this.scrollToBottom();
    }

    /**
     * Render a single message
     */
    renderMessage(message) {
        // Remove sample questions on first real message
        const sampleQuestions = this.chatMessages.querySelector('.sample-questions');
        if (sampleQuestions && message.role !== 'system') {
            sampleQuestions.remove();
        }

        const messageDiv = document.createElement('div');
        messageDiv.className = `chat-message chat-message-${message.role}`;

        // Format timestamp
        const time = new Date(message.timestamp).toLocaleTimeString([], {
            hour: '2-digit',
            minute: '2-digit'
        });

        if (message.role === 'system') {
            messageDiv.innerHTML = `
                <div class="chat-message-system">
                    <span class="material-icons">info</span>
                    <span>${this.escapeHtml(message.content)}</span>
                </div>
            `;
        } else if (message.isFileUpload) {
            const fileSizeKB = (message.fileSize / 1024).toFixed(2);
            messageDiv.innerHTML = `
                <div class="chat-message-content">
                    <div class="file-upload-indicator">
                        <span class="material-icons">insert_drive_file</span>
                        <div class="file-info">
                            <div class="file-name">${this.escapeHtml(message.fileName)}</div>
                            <div class="file-meta">${fileSizeKB} KB</div>
                        </div>
                    </div>
                    <div class="chat-message-time">${time}</div>
                </div>
            `;
        } else {
            const avatar = message.role === 'user' ? 'person' : 'analytics';
            messageDiv.innerHTML = `
                <div class="chat-message-avatar">
                    <span class="material-icons">${avatar}</span>
                </div>
                <div class="chat-message-content">
                    <div class="chat-message-text">${this.formatMessageContent(message.content)}</div>
                    <div class="chat-message-time">${time}</div>
                </div>
            `;
        }

        this.chatMessages.appendChild(messageDiv);
    }

    /**
     * Format message content (convert markdown-like syntax to HTML)
     */
    formatMessageContent(content) {
        let formatted = this.escapeHtml(content);

        // Bold text: **text**
        formatted = formatted.replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>');

        // Bullet points: lines starting with - or *
        formatted = formatted.replace(/^[-*]\s(.+)$/gm, '<li>$1</li>');
        if (formatted.includes('<li>')) {
            formatted = formatted.replace(/(<li>.*<\/li>)/s, '<ul>$1</ul>');
        }

        // Line breaks
        formatted = formatted.replace(/\n/g, '<br>');

        return formatted;
    }

    /**
     * Escape HTML to prevent XSS
     */
    escapeHtml(text) {
        const div = document.createElement('div');
        div.textContent = text;
        return div.innerHTML;
    }

    /**
     * Send query to Credit Analysis API
     */
    async sendCreditAnalysisQuery(userMessage) {
        try {
            // Show loading message
            const loadingMessage = {
                role: 'assistant',
                content: '⏳ Processing your request...',
                timestamp: new Date().toISOString(),
                isLoading: true
            };
            this.addMessage(loadingMessage);

            // Get auth token
            const token = localStorage.getItem('token');
            if (!token) {
                throw new Error('Please log in to use credit analysis');
            }

            // Prepare form data
            const formData = new FormData();
            formData.append('query', userMessage);
            if (this.currentDocumentId) {
                formData.append('document_id', this.currentDocumentId);
            }

            // Call API
            const response = await fetch(`${this.API_BASE_URL}/api/credit-analysis/query`, {
                method: 'POST',
                headers: {
                    'Authorization': `Bearer ${token}`
                },
                body: formData
            });

            // Remove loading message
            this.messages = this.messages.filter(msg => !msg.isLoading);
            this.renderMessages();

            if (!response.ok) {
                const errorData = await response.json();
                throw new Error(errorData.detail || 'Query failed');
            }

            const data = await response.json();

            // Handle response based on status
            if (data.success && data.status === 'complete') {
                // We have complete results - show credit report
                await this.displayCreditReport(data);
            } else {
                // Show informational response
                let responseText = data.message || 'To perform credit analysis, please upload a credit agreement document.';

                if (data.suggestions && data.suggestions.length > 0) {
                    responseText += '\n\n**Next Steps:**\n';
                    data.suggestions.forEach(suggestion => {
                        responseText += `- ${suggestion}\n`;
                    });
                }

                this.addMessage({
                    role: 'assistant',
                    content: responseText,
                    timestamp: new Date().toISOString()
                });
            }

        } catch (error) {
            console.error('Credit analysis query error:', error);

            // Remove loading message
            this.messages = this.messages.filter(msg => !msg.isLoading);
            this.renderMessages();

            this.addMessage({
                role: 'assistant',
                content: `❌ Error: ${error.message}\n\nPlease try again or contact support if the issue persists.`,
                timestamp: new Date().toISOString()
            });
        }
    }

    /**
     * Upload credit document to API
     */
    async uploadCreditDocument(file) {
        try {
            // Show loading message
            const loadingMessage = {
                role: 'assistant',
                content: `⏳ Uploading "${file.name}" and starting credit analysis extraction...`,
                timestamp: new Date().toISOString(),
                isLoading: true
            };
            this.addMessage(loadingMessage);

            // Get auth token
            const token = localStorage.getItem('token');
            if (!token) {
                throw new Error('Please log in to upload documents');
            }

            // Prepare form data
            const formData = new FormData();
            formData.append('file', file);

            // Call upload API
            const response = await fetch(`${this.API_BASE_URL}/api/credit-analysis/upload`, {
                method: 'POST',
                headers: {
                    'Authorization': `Bearer ${token}`
                },
                body: formData
            });

            // Remove loading message
            this.messages = this.messages.filter(msg => !msg.isLoading);
            this.renderMessages();

            if (!response.ok) {
                const errorData = await response.json();
                throw new Error(errorData.detail || 'Upload failed');
            }

            const data = await response.json();

            if (!data.success) {
                throw new Error(data.error || 'Upload failed');
            }

            // Store document ID for future queries
            this.currentDocumentId = data.document_id;

            // Show success message
            const successMessage = `✅ Document uploaded successfully!\n\n**Extraction Started:**\n- Document: ${file.name}\n- Extraction ID: ${data.extraction_id}\n- Status: ${data.status}\n\n⏳ Analyzing credit agreement... This may take 30-60 seconds.`;

            this.addMessage({
                role: 'assistant',
                content: successMessage,
                timestamp: new Date().toISOString()
            });

            // Start polling for extraction results
            this.startPollingForResults(data.document_id, data.extraction_id);

        } catch (error) {
            console.error('Credit document upload error:', error);

            // Remove loading message
            this.messages = this.messages.filter(msg => !msg.isLoading);
            this.renderMessages();

            this.addMessage({
                role: 'assistant',
                content: `❌ Upload Error: ${error.message}\n\nPlease ensure the file is a valid PDF and try again.`,
                timestamp: new Date().toISOString()
            });
        }
    }

    /**
     * Start polling for extraction results
     */
    async startPollingForResults(documentId, extractionId) {
        // Clear any existing poll interval
        if (this.pollingInterval) {
            clearInterval(this.pollingInterval);
        }

        let pollCount = 0;
        const maxPolls = 60; // Max 5 minutes (60 * 5 seconds)

        this.pollingInterval = setInterval(async () => {
            pollCount++;

            try {
                const token = localStorage.getItem('token');
                const response = await fetch(
                    `${this.API_BASE_URL}/api/credit-analysis/document/${documentId}/results`,
                    {
                        headers: {
                            'Authorization': `Bearer ${token}`
                        }
                    }
                );

                if (response.ok || response.status === 202) {
                    const data = await response.json();

                    if (data.status === 'complete') {
                        // Stop polling
                        clearInterval(this.pollingInterval);
                        this.pollingInterval = null;

                        // Show success message
                        this.addMessage({
                            role: 'assistant',
                            content: `✅ Credit analysis complete! Displaying results...`,
                            timestamp: new Date().toISOString()
                        });

                        // Display credit report
                        await this.displayCreditReport(data);

                    } else if (data.status === 'failed') {
                        // Stop polling
                        clearInterval(this.pollingInterval);
                        this.pollingInterval = null;

                        this.addMessage({
                            role: 'assistant',
                            content: `❌ Extraction failed: ${data.error || 'Unknown error'}\n\nPlease try uploading the document again.`,
                            timestamp: new Date().toISOString()
                        });
                    }
                    // Continue polling if status is 'processing'

                } else if (response.status === 404) {
                    // Stop polling - document not found
                    clearInterval(this.pollingInterval);
                    this.pollingInterval = null;

                    this.addMessage({
                        role: 'assistant',
                        content: `❌ Document not found. Please try uploading again.`,
                        timestamp: new Date().toISOString()
                    });
                }

            } catch (error) {
                console.error('Polling error:', error);
            }

            // Stop after max polls
            if (pollCount >= maxPolls) {
                clearInterval(this.pollingInterval);
                this.pollingInterval = null;

                this.addMessage({
                    role: 'assistant',
                    content: `⏱️ Extraction is taking longer than expected. Please check back later or contact support.`,
                    timestamp: new Date().toISOString()
                });
            }

        }, 5000); // Poll every 5 seconds
    }

    /**
     * Display credit report with real data
     */
    async displayCreditReport(data) {
        // Populate credit report with real data
        this.populateCreditReport(data);

        // Show credit report view
        document.getElementById('chat-view').style.display = 'none';
        document.getElementById('credit-report-view').style.display = 'flex';

        // Render charts with real data
        this.renderCharts(data.pod, data.spread);
    }

    /**
     * Guess document type from filename
     */
    guessDocumentType(fileName) {
        const lower = fileName.toLowerCase();
        if (lower.includes('balance') || lower.includes('sheet')) return 'Balance Sheet';
        if (lower.includes('income') || lower.includes('statement')) return 'Income Statement';
        if (lower.includes('cash') || lower.includes('flow')) return 'Cash Flow Statement';
        if (lower.includes('credit') || lower.includes('report')) return 'Credit Report';
        if (lower.includes('contract') || lower.includes('agreement')) return 'Contract/Agreement';
        return 'Financial Document';
    }

    /**
     * Scroll chat to bottom
     */
    scrollToBottom() {
        setTimeout(() => {
            this.chatMessages.scrollTop = this.chatMessages.scrollHeight;
        }, 100);
    }

    /**
     * Save chat history to localStorage
     */
    saveChatHistory() {
        try {
            localStorage.setItem(this.STORAGE_KEY, JSON.stringify(this.messages));
            console.log('💾 Chat history saved:', this.messages.length, 'messages');
        } catch (error) {
            console.error('❌ Error saving chat history:', error);
        }
    }

    /**
     * Load chat history from localStorage
     */
    loadChatHistory() {
        try {
            const saved = localStorage.getItem(this.STORAGE_KEY);
            if (saved) {
                this.messages = JSON.parse(saved);
                console.log('📂 Loaded chat history:', this.messages.length, 'messages');
            }
        } catch (error) {
            console.error('❌ Error loading chat history:', error);
            this.messages = [];
        }
    }

    /**
     * Show credit report view
     */

    /**
     * Hide credit report and return to chat
     */
    hideCreditReport() {
        document.querySelector('.chat-container').style.display = 'flex';
        document.querySelector('.credit-analysis-header').style.display = 'block';
        document.getElementById('credit-report-view').style.display = 'none';
    }

    /**
     * Populate credit report with data from API
     */
    populateCreditReport(data) {
        // Extract data from API response
        const company = data.company || {};
        const outlook = data.outlook || {};
        const pod = data.pod || {};
        const spread = data.spread || {};
        const analysis = data.analysis || {};

        // Populate company info card
        const companyCard = document.getElementById('company-info-card');
        const ratingClass = company.rating ? `rating-${company.rating.toLowerCase().replace('+', 'plus').replace('-', 'minus')}` : '';

        companyCard.innerHTML = `
            <h2>${company.name || 'Unknown Company'}</h2>
            <div class="rating-badge ${ratingClass}">Rating ${company.rating || 'N/A'}</div>
            <p class="sector">${company.sector || 'Sector not specified'}</p>
            <p class="coverage">${company.coverage || 'Based on credit agreement analysis'}</p>
            <div class="outlook-section">
                <h4>Outlook <span class="outlook-badge">${outlook.outlook || 'Stable'}</span></h4>
                <p>${outlook.description || 'No outlook description available'}</p>
            </div>
        `;

        // Populate stats
        document.getElementById('pod-stat').innerHTML = `
            <strong>${pod.value || 'N/A'}</strong> over a ${pod.horizon || '1-year'} horizon<br>
            <span class="change">${pod.change || 'No change data'}</span>
        `;

        document.getElementById('spread-stat').innerHTML = `
            <strong>${spread.value || 'N/A'}</strong> for ${spread.term || '5 year loan'}<br>
            <span class="change">${spread.change || 'No change data'}</span>
        `;

        // Populate analysis text
        const analysisText = analysis.html || '<p>No analysis available</p>';
        document.getElementById('credit-report-content').innerHTML = `
            <div class="report-content">
                ${analysisText}
            </div>
        `;
    }


    /**
     * Render charts using Chart.js with real data
     */
    renderCharts(podData, spreadData) {
        if (typeof Chart === 'undefined') {
            console.error('Chart.js not loaded');
            return;
        }

        // Destroy existing charts if they exist
        if (window.podChartInstance) {
            window.podChartInstance.destroy();
        }
        if (window.spreadChartInstance) {
            window.spreadChartInstance.destroy();
        }

        // Extract time series data from API response
        const podTimeSeries = podData?.timeSeries || {};
        const spreadTimeSeries = spreadData?.timeSeries || {};

        const podLabels = podTimeSeries.labels || [];
        const podValues = podTimeSeries.values || [];
        const spreadLabels = spreadTimeSeries.labels || [];
        const spreadValues = spreadTimeSeries.values || [];

        // Probability of Default Chart
        const podCtx = document.getElementById('pod-chart')?.getContext('2d');
        if (podCtx) {
            window.podChartInstance = new Chart(podCtx, {
                type: 'line',
                data: {
                    labels: podLabels,
                    datasets: [{
                        label: 'Probability of default %',
                        data: podValues,
                        borderColor: '#ef4444',
                        backgroundColor: 'rgba(239, 68, 68, 0.1)',
                        tension: 0.4,
                        fill: true
                    }]
                },
                options: {
                    responsive: true,
                    maintainAspectRatio: false,
                    plugins: {
                        legend: {
                            display: false
                        }
                    },
                    scales: {
                        y: {
                            beginAtZero: true,
                            ticks: {
                                callback: function(value) {
                                    return value + '%';
                                }
                            }
                        }
                    }
                }
            });
        }

        // Credit Spread Chart
        const spreadCtx = document.getElementById('spread-chart')?.getContext('2d');
        if (spreadCtx) {
            window.spreadChartInstance = new Chart(spreadCtx, {
                type: 'line',
                data: {
                    labels: spreadLabels,
                    datasets: [{
                        label: 'Credit Spread',
                        data: spreadValues,
                        borderColor: '#6366f1',
                        backgroundColor: 'rgba(99, 102, 241, 0.2)',
                        fill: true,
                        tension: 0.4
                    }]
                },
                options: {
                    responsive: true,
                    maintainAspectRatio: false,
                    plugins: {
                        legend: {
                            display: false
                        }
                    },
                    scales: {
                        y: {
                            beginAtZero: true,
                            ticks: {
                                callback: function(value) {
                                    return value + '%';
                                }
                            }
                        }
                    }
                }
            });
        }
    }

    /**
     * Clear chat history
     */
    clearChatHistory() {
        this.messages = [];
        this.chatMessages.innerHTML = `
            <div class="sample-questions">
                <button class="sample-question-card" data-question="Perform Credit Analysis on First Brands">
                    <span class="sample-question-text">Perform Credit Analysis on First Brands</span>
                    <span class="material-icons">arrow_forward</span>
                </button>
                <button class="sample-question-card" data-question="What is the Credit Rating of SpaceX">
                    <span class="sample-question-text">What is the Credit Rating of SpaceX</span>
                    <span class="material-icons">arrow_forward</span>
                </button>
                <button class="sample-question-card" data-question="How is the credit quality of OpenAI">
                    <span class="sample-question-text">How is the credit quality of OpenAI</span>
                    <span class="material-icons">arrow_forward</span>
                </button>
                <button class="sample-question-card" data-question="Analyze Anthropic's creditworthiness">
                    <span class="sample-question-text">Analyze Anthropic's creditworthiness</span>
                    <span class="material-icons">arrow_forward</span>
                </button>
            </div>
        `;

        // Re-attach event listeners to the new sample question cards
        const sampleQuestionCards = document.querySelectorAll('.sample-question-card');
        sampleQuestionCards.forEach(card => {
            card.addEventListener('click', (e) => this.handleSampleQuestionClick(e));
        });

        this.saveChatHistory();
        console.log('🗑️ Chat history cleared');
    }
}

// Global instance
let creditAnalysisChatInstance = null;

/**
 * Initialize Credit Analysis Chat
 * Called from app.js when the page is shown
 */
function initCreditAnalysisChat() {
    if (!creditAnalysisChatInstance) {
        creditAnalysisChatInstance = new CreditAnalysisChat();
    }
    creditAnalysisChatInstance.init();
}

// Auto-initialize when DOM is ready if on credit-analysis page
document.addEventListener('DOMContentLoaded', function() {
    const creditAnalysisPage = document.getElementById('credit-analysis-page');
    if (creditAnalysisPage && creditAnalysisPage.style.display !== 'none') {
        initCreditAnalysisChat();
    }
});
