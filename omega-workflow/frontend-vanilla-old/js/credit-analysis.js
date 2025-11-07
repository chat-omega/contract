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

        // Instead of adding to chat, show credit report
        this.showCreditReport(message);

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

        // Generate mock analysis response
        setTimeout(() => {
            this.generateFileAnalysisResponse(file);
        }, 1500 + Math.random() * 1000);

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
     * Generate a mock response from the assistant
     */
    generateMockResponse(userMessage) {
        const responses = [
            `I understand you're inquiring about "${userMessage}". In credit analysis, this typically involves assessing various financial metrics including liquidity ratios, debt-to-equity ratios, and cash flow patterns.\n\nKey considerations:\n- Historical financial performance\n- Industry benchmarks\n- Market conditions\n- Management quality\n\nWould you like me to provide a detailed analysis?`,

            `Thank you for your question about "${userMessage}". Based on our risk engine analysis:\n\n**Credit Assessment Factors:**\n- Payment history and track record\n- Current debt obligations\n- Revenue stability\n- Industry sector risk\n\nI can provide more specific insights if you share additional details or upload relevant financial documents.`,

            `Analyzing your query regarding "${userMessage}"...\n\n**Key Findings:**\n- Credit risk assessment requires comprehensive data\n- Multiple financial indicators should be considered\n- Industry context is crucial\n\nPlease upload financial statements or provide more details for a thorough analysis.`,
        ];

        const randomResponse = responses[Math.floor(Math.random() * responses.length)];

        this.addMessage({
            role: 'assistant',
            content: randomResponse,
            timestamp: new Date().toISOString()
        });
    }

    /**
     * Generate a mock file analysis response
     */
    generateFileAnalysisResponse(file) {
        const fileName = file.name;
        const response = `I've received your document "${fileName}". Here's a preliminary analysis:\n\n**Document Review:**\n- Document type detected: ${this.guessDocumentType(fileName)}\n- File size: ${(file.size / 1024).toFixed(2)} KB\n\n**Next Steps:**\nI'm analyzing the document content to extract key financial metrics and credit indicators. In a production environment, this would include:\n- Automated data extraction\n- Financial ratio calculations\n- Risk scoring\n- Comparative analysis\n\nWould you like me to focus on any specific aspects of the credit analysis?`;

        this.addMessage({
            role: 'assistant',
            content: response,
            timestamp: new Date().toISOString()
        });
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
    showCreditReport(question) {
        console.log('📊 Showing credit report for:', question);

        // Hide chat container
        document.querySelector('.chat-container').style.display = 'none';
        document.querySelector('.credit-analysis-header').style.display = 'none';

        // Show report view
        const reportView = document.getElementById('credit-report-view');
        reportView.style.display = 'block';

        // Populate report with data
        this.populateCreditReport(question);

        // Render charts
        setTimeout(() => this.renderCharts(), 100);
    }

    /**
     * Hide credit report and return to chat
     */
    hideCreditReport() {
        document.querySelector('.chat-container').style.display = 'flex';
        document.querySelector('.credit-analysis-header').style.display = 'block';
        document.getElementById('credit-report-view').style.display = 'none';
    }

    /**
     * Populate credit report with data
     */
    populateCreditReport(question) {
        // Dummy data for First Brands
        const reportData = {
            company: 'First Brands Group, LLC',
            rating: 'D',
            sector: 'Automotive',
            coverage: 'High coverage quality',
            outlook: 'Stable',
            outlookDesc: 'Risk is medium and rating is expected to remain stable',
            pod: {
                value: '1.65%',
                horizon: '1-year',
                change: '+0.05%',
                data: [0.2, 0.3, 0.4, 0.5, 0.6, 0.7, 0.8, 1.0, 1.3, 1.6, 1.65]
            },
            spread: {
                value: '9.31%',
                term: '5 year loan',
                change: '+0.15%',
                data: [3, 4, 5, 5.5, 6, 6.5, 7, 7.5, 8.5, 9.0, 9.31]
            }
        };

        // Populate company info card
        const companyCard = document.getElementById('company-info-card');
        companyCard.innerHTML = `
            <h2>${reportData.company}</h2>
            <div class="rating-badge ${reportData.rating === 'D' ? 'rating-d' : ''}">Rating ${reportData.rating}</div>
            <p class="sector">${reportData.sector}</p>
            <p class="coverage">${reportData.coverage}</p>
            <div class="outlook-section">
                <h4>Outlook <span class="outlook-badge">${reportData.outlook}</span></h4>
                <p>${reportData.outlookDesc}</p>
            </div>
        `;

        // Populate stats
        document.getElementById('pod-stat').innerHTML = `
            <strong>${reportData.pod.value}</strong> over a ${reportData.pod.horizon} horizon<br>
            <span class="change">Increased by ${reportData.pod.change} last mo.</span>
        `;

        document.getElementById('spread-stat').innerHTML = `
            <strong>${reportData.spread.value}</strong> for ${reportData.spread.term}<br>
            <span class="change">Increased by ${reportData.spread.change} last mo.</span>
        `;

        // Populate analysis text
        const analysisText = this.getAnalysisText();
        document.getElementById('credit-report-content').innerHTML = `
            <div class="report-content">
                ${analysisText}
            </div>
        `;
    }

    /**
     * Get formatted analysis text
     */
    getAnalysisText() {
        const rawText = `
            <h2>Credit Analysis: First Brands Group, LLC</h2>

            <p>Based on my comprehensive analysis using OmegaIntelligence.ai's proprietary credit assessment system, here's the current credit profile for First Brands Group, LLC:</p>

            <h3>Current Credit Assessment</h3>
            <ul>
                <li><strong>Current Letter Rating:</strong> D (as of October 2025)</li>
                <li><strong>Probability of Default (1-year):</strong> 1.65% (October 2025)</li>
                <li><strong>Z-Spread (5-year):</strong> 931 basis points (9.31%)</li>
            </ul>

            <h3>Recent Credit Profile Changes</h3>
            <p>The company has experienced severe credit deterioration over the past year, with OmegaIntelligence.ai's proprietary rating system capturing this decline:</p>
            <ul>
                <li><strong>March 2025:</strong> C2 rating with 1,017 bps z-spread</li>
                <li><strong>September 2025:</strong> Downgraded to D rating with 916 bps z-spread</li>
                <li><strong>October 2025:</strong> Maintained D rating with 931 bps z-spread</li>
            </ul>
            <p>This represents a dramatic deterioration from the B4 ratings (around 700 bps z-spread) maintained through most of 2024.</p>

            <h3>Market Context and Peer Comparison</h3>
            <p>First Brands Group significantly underperforms its automotive aftermarket peers:</p>
            <p><strong>Industry Peer Z-Spreads (Current):</strong></p>
            <ul>
                <li>Federal Mogul: 288 bps</li>
                <li>Standard Motor Products: 366 bps</li>
                <li>Brake Parts Inc: 596 bps</li>
                <li>BBB Industries: 1,023 bps</li>
                <li>First Brands Group: 931 bps</li>
            </ul>
            <p>The company's current z-spread of 931 bps places it in the bottom 10% of automotive companies in OmegaIntelligence.ai's universe, indicating severe distress.</p>

            <h3>Key Risk Factors from OmegaIntelligence.ai Analysis</h3>
            <p><strong>Macroeconomic Exposures:</strong></p>
            <ul>
                <li><strong>Interest Rate Sensitivity:</strong> +37.6% (highly vulnerable to rate increases)</li>
                <li><strong>Equity Market Exposure:</strong> -38.5% (benefits from market declines)</li>
                <li><strong>Technology Exposure:</strong> -10.2% (negative correlation)</li>
                <li><strong>Oil Price Sensitivity:</strong> +1.7% (minimal exposure)</li>
            </ul>

            <h3>Current Market Developments</h3>
            <p>The credit deterioration captured by OmegaIntelligence.ai's system has been validated by recent market events. First Brands Group filed for Chapter 11 bankruptcy in September 2025 after carrying approximately $9-10 billion in total debt against $5 billion in annual revenue.</p>
            <p>Traditional rating agencies followed similar trajectories:</p>
            <ul>
                <li><strong>Fitch:</strong> Downgraded from B+ to CCC before withdrawing ratings</li>
                <li><strong>S&P:</strong> Downgraded from B+ to D following bankruptcy filing</li>
            </ul>

            <h3>OmegaIntelligence.ai's Unique Insights</h3>
            <p>OmegaIntelligence.ai's comprehensive market data integration identified several warning signals that traditional agencies may have missed:</p>
            <ul>
                <li><strong>Early Detection:</strong> The system flagged deterioration to C-level ratings in March 2025, months before the September bankruptcy</li>
                <li><strong>Comprehensive Risk Assessment:</strong> Integration of off-balance-sheet exposures and supply chain financing risks</li>
                <li><strong>Peer-Relative Analysis:</strong> Clear identification of the company's position in the bottom decile of automotive credit quality</li>
                <li><strong>Macroeconomic Vulnerability:</strong> High interest rate sensitivity (37.6%) correctly predicted vulnerability to the current rate environment</li>
            </ul>
            <p>The D rating and 931 bps z-spread reflect the company's current distressed status, with the bankruptcy filing validating OmegaIntelligence.ai's early warning signals about deteriorating creditworthiness in this highly leveraged automotive aftermarket consolidation story.</p>

            <h3>Follow-up Analysis Options</h3>
            <ol>
                <li><strong>Recovery Analysis</strong> - What are the potential recovery rates for different debt tranches in the Chapter 11 proceedings, and how do similar automotive bankruptcies typically resolve?</li>
                <li><strong>Sector Contagion Risk</strong> - Which other highly leveraged automotive aftermarket companies might face similar distress, and what early warning indicators should we monitor?</li>
                <li><strong>Portfolio Impact Assessment</strong> - For investors holding similar automotive credits, what hedging strategies or portfolio adjustments would be most effective given the sector's current stress?</li>
            </ol>

            <p><em>This case demonstrates the value of advanced credit analytics in providing timely risk assessment and highlights the importance of continuous monitoring in today's volatile credit environment.</em></p>

            <p><em>Analysis powered by OmegaIntelligence.ai - For more information, visit <a href="https://omegaintelligence.ai" target="_blank">https://omegaintelligence.ai</a></em></p>
        `;

        return rawText;
    }

    /**
     * Render charts using Chart.js
     */
    renderCharts() {
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

        // Probability of Default Chart
        const podCtx = document.getElementById('pod-chart').getContext('2d');
        window.podChartInstance = new Chart(podCtx, {
            type: 'line',
            data: {
                labels: ['11/2021', '04/2022', '09/2022', '02/2023', '07/2023', '12/2023', '05/2024', '10/2024', '03/2025', '08/2025'],
                datasets: [{
                    label: 'Probability of default %',
                    data: [0.2, 0.3, 0.4, 0.5, 0.6, 0.7, 0.8, 1.0, 1.3, 1.6, 1.65],
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
                        max: 2.0,
                        ticks: {
                            callback: function(value) {
                                return value + '%';
                            }
                        }
                    }
                }
            }
        });

        // Credit Spread Chart
        const spreadCtx = document.getElementById('spread-chart').getContext('2d');
        window.spreadChartInstance = new Chart(spreadCtx, {
            type: 'line',
            data: {
                labels: ['11/2021', '04/2022', '09/2022', '02/2023', '07/2023', '12/2023', '05/2024', '10/2024', '03/2025', '08/2025'],
                datasets: [{
                    label: 'Credit Spread',
                    data: [3, 4, 5, 5.5, 6, 6.5, 7, 7.5, 8.5, 9.0, 9.31],
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
                        min: 0,
                        max: 15,
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
