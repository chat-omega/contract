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

// Authentication check - return status instead of automatically redirecting
async function checkAuthentication() {
    console.log('🔐 checkAuthentication started');

    // Skip auth check for auth pages
    if (window.location.pathname.includes('login') || window.location.pathname.includes('register')) {
        console.log('🔐 Skipping auth check for auth pages');
        return true; // Allow auth pages to load
    }

    // Check if auth manager is available
    if (typeof window.authManager === 'undefined') {
        console.error('❌ ERROR: authManager not found! auth.js should be loaded before app.js');
        console.error('   Check that auth.js is included in index.html before app.js');
        return false;
    }

    console.log('🔐 authManager found, checking auth status');

    try {
        const user = await window.authManager.checkAuth();

        if (!user) {
            console.log('🔐 User not authenticated, allowing app to continue with limited functionality');
            // Return false but don't redirect automatically
            // This allows the app to function with limited capabilities
            return false;
        }

        console.log('🔐 User authenticated:', user);
        // Update UI with user info
        updateUserUI(user);
        return true;
    } catch (error) {
        console.error('❌ Authentication check error:', error);
        return false;
    }
}

function updateUserUI(user) {
    // Update any user-specific UI elements
    const userElements = document.querySelectorAll('[data-user-info]');
    userElements.forEach(element => {
        const info = element.dataset.userInfo;
        if (info === 'username') {
            element.textContent = user.username;
        } else if (info === 'email') {
            element.textContent = user.email;
        }
    });
}

// Add logout functionality
function initializeLogout() {
    const logoutLinks = document.querySelectorAll('[href="#logout"]');
    logoutLinks.forEach(link => {
        link.addEventListener('click', (e) => {
            e.preventDefault();
            if (confirm('Are you sure you want to log out?')) {
                window.authManager.logout();
            }
        });
    });
}

// Application state
const AppState = {
    sidebarCollapsed: localStorage.getItem('sidebarCollapsed') === 'true' || false,
    searchPanelOpen: false,
    selectedDocuments: new Set(),
    workflow: {
        name: '',
        description: '',
        selectedFields: new Set(),
        fieldGroups: {}, // { "Group Name": ["Field1", "Field2", ...] }
        documentTypes: new Set(),
        scoringProfiles: [],
        activeProfile: 'profileA',
        currentPage: 1,
        searchQuery: '',
        fieldsPerPage: 10,
        fieldsPerPageOptions: [10, 25, 50, 100],
        lastUsedGroup: 'Basic Information', // Track last group used for adding fields
        isEditMode: false,
        editWorkflowId: null
    }
};

// Field data structure with 1354+ fields
// Comprehensive field data structure with metadata for Field Discovery
const FIELD_DISCOVERY_DATA = [
    {
        id: 'fd001',
        name: '40 Act Assignment',
        description: 'This AI field captures restrictions on "Assignment" within the meaning of the U.S. Investment Advisers Act of 1940 or the U.S. Investment Company Act of 1940.',
        type: 'Text',
        jurisdictions: ['United Kingdom', 'United States'],
        documentTypes: ['Investment Services Agt', 'Supply Agt', 'Distribution Agt', 'Service Agt', 'Other', 'Governance Agt', 'IP Agt', 'Equipment Related Agt'],
        language: 'English',
        tags: ['M&A Due Diligence']
    },
    {
        id: 'fd002',
        name: 'Absence of Certain Changes Representation',
        description: 'This AI field captures representations that no event has occurred that has had a material adverse effect, typically since the date of the last audited financial statements of the business.',
        type: 'Text',
        jurisdictions: ['Australia', 'Canada', 'United Kingdom', 'United States'],
        documentTypes: ['M&A Purchase Agt', 'Equity Related Agt', 'Other'],
        language: 'English',
        tags: ['M&A Due Diligence', 'M&A Purchase Agreement']
    },
    {
        id: 'fd003',
        name: 'Absence of Litigation',
        description: 'This AI field captures representations to the representation of each party in International Swaps and Derivatives Association agreements that there is no actual or pending litigation against it that would affect the legality, validity or enforceability of the documents.',
        type: 'Text',
        jurisdictions: ['United Kingdom', 'United States'],
        documentTypes: ['Structured Finance Agt'],
        language: 'English',
        tags: ['ISDA']
    },
    {
        id: 'fd004',
        name: 'Abtreten von Rechten und Pflichten',
        description: 'Dieses AI Field unterstützt bei der Möglichkeit von Umfang der Abtretbarkeit von Rechten und Pflichten aus dem Vertrag (z.B. der Gesellschaftervereinbarung) an Dritte.',
        type: 'Text',
        jurisdictions: ['Germany'],
        documentTypes: ['Coming Soon'],
        language: 'German',
        tags: ['Deutschland Aktienbesitz', 'Deutschland Gesellschaftsrecht & -Transaktionen', 'Deutschland Immobilienrecht & -Transaktionen', 'Deutschland Vertragsrecht']
    },
    {
        id: 'fd005',
        name: 'Abwerbeverbot',
        description: 'Dieses AI Field unterstützt Regelungen, welche das (Giver/Restriction) Abwerben von Mitarbeitern des Vertragspartners oder der Gesellschaft nach Vertragsende einschränken oder verbieten.',
        type: 'Text',
        jurisdictions: ['Germany'],
        documentTypes: ['Coming Soon'],
        language: 'German',
        tags: ['Deutschland Aktienbesitz', 'Deutschland Gesellschaftsrecht & -Transaktionen', 'Deutschland Vertragsrecht']
    },
    {
        id: 'fd006',
        name: 'Acceleration',
        description: 'This AI field captures the circumstances under which trustees and holders may declare the principal and accrued interest on all the corporate debt securities due and payable.',
        type: 'Text',
        jurisdictions: ['Canada', 'United States'],
        documentTypes: ['Debt Related Agt', 'Debt Supplemental Agt'],
        language: 'English',
        tags: ['Bond Indentures']
    },
    {
        id: 'fd007',
        name: 'Accounting Changes Covenant',
        description: 'This AI field captures covenants of a borrower not to make any changes to its accounting practices, change its fiscal year end or change its accounting reference date.',
        type: 'Text',
        jurisdictions: ['Australia', 'Canada', 'United Kingdom', 'United States'],
        documentTypes: ['Debt Related Agt', 'Debt Supplemental Agt', 'Other'],
        language: 'English',
        tags: ['Credit/Facility Agreements']
    },
    {
        id: 'fd008',
        name: 'Accounting of Disclosures of Protected Health Information',
        description: 'This AI field captures the requirement for business associates to provide an accounting of disclosures of protected health information pursuant to the Health Insurance Portability and Accountability Act (HIPAA).',
        type: 'Text',
        jurisdictions: ['United States'],
        documentTypes: ['Privacy Related Agt'],
        language: 'English',
        tags: ['Business Associate Agreements']
    },
    {
        id: 'fd009',
        name: 'Accounting Policies',
        description: 'This AI field captures information regarding the general accounting policies of a limited partnership or limited liability company, including the basis on which the books are to be kept.',
        type: 'Text',
        jurisdictions: ['Canada', 'United States'],
        documentTypes: ['Governance Agt', 'Other'],
        language: 'English',
        tags: ['LPA/LLC']
    },
    {
        id: 'fd010',
        name: '"Accounts" Definition',
        description: 'This AI field captures the definitions of "Accounts" or "Receivables" typically referenced in the borrowing base formula for asset-based loans.',
        type: 'Text',
        jurisdictions: ['Canada', 'United States'],
        documentTypes: ['Debt Related Agt', 'Debt Supplemental Agt', 'Other'],
        language: 'English',
        tags: ['Credit/Facility Agreements']
    }
];

// Workflow template definitions
const WORKFLOW_TEMPLATES = {
    'ma-diligence': {
        id: 'ma-diligence',
        name: 'M&A/Due Diligence',
        workflowName: 'M&A/Due Diligence',
        description: 'Best suited for understanding the basic information in a variety of agreements when doing due diligence.',
        fields: [
            // Basic Information
            'Title', 'Parties', 'Date',
            // Term and Termination  
            'Term and Renewal', 'Does the agreement auto renew?', 'Can the agreement be terminated for convenience?',
            // Boilerplate Provisions
            'Can the agreement be assigned?', 'What are the obligations and requirements resulting from a Change of Control?',
            'Exclusivity', 'Non-Compete', 'Non-Solicit', 'Most Favored Nation', 'Can notice be given electronically?', 'Governing Law'
        ],
        documentTypes: ['Distribution Agt', 'Employment Related Agt', 'Governance Agt', 'IP Agt', 'Service Agt', 'Supply Agt'],
        scoringProfiles: [
            {
                id: 'due-diligence-scoring',
                name: 'Due Diligence Scoring',
                criteria: [
                    {
                        id: 'exclusivity',
                        name: 'Exclusivity',
                        points: 1,
                        conditions: [{
                            type: 'field_exists',
                            fieldName: 'Exclusivity',
                            description: 'Exclusivity is found'
                        }]
                    },
                    {
                        id: 'non-compete',
                        name: 'Non-Compete',
                        points: 1,
                        conditions: [{
                            type: 'field_exists',
                            fieldName: 'Non-Compete',
                            description: 'Non-Compete is found'
                        }]
                    },
                    {
                        id: 'most-favored-nation',
                        name: 'Most Favored Nation',
                        points: 1,
                        conditions: [{
                            type: 'field_exists',
                            fieldName: 'Most Favored Nation',
                            description: 'Most Favored Nation is found'
                        }]
                    },
                    {
                        id: 'non-solicit',
                        name: 'Non-Solicit',
                        points: 1,
                        conditions: [{
                            type: 'field_exists',
                            fieldName: 'Non-Solicit',
                            description: 'Non-Solicit is found'
                        }]
                    },
                    {
                        id: 'assignment-restrictions',
                        name: 'Assignment Restrictions',
                        points: 1,
                        conditionLogic: 'OR',
                        conditions: [
                            {
                                type: 'field_value',
                                fieldName: 'Can the agreement be assigned?',
                                operator: 'contains',
                                value: 'c) Assignable with consent',
                                description: 'Can the agreement be assigned? has answer c) Assignable with consent'
                            },
                            {
                                type: 'field_value',
                                fieldName: 'Can the agreement be assigned?',
                                operator: 'contains',
                                value: 'd) Agreement terminable if assigned',
                                description: 'Can the agreement be assigned? has answer d) Agreement terminable if assigned'
                            },
                            {
                                type: 'field_value',
                                fieldName: 'Can the agreement be assigned?',
                                operator: 'contains',
                                value: 'e) Assignable with payment of a fee',
                                description: 'Can the agreement be assigned? has answer e) Assignable with payment of a fee'
                            },
                            {
                                type: 'field_value',
                                fieldName: 'Can the agreement be assigned?',
                                operator: 'contains',
                                value: 'f) Not assignable',
                                description: 'Can the agreement be assigned? has answer f) Not assignable'
                            }
                        ]
                    },
                    {
                        id: 'terminable-convenience',
                        name: 'Terminable for Convenience',
                        points: 1,
                        conditionLogic: 'OR',
                        conditions: [
                            {
                                type: 'field_value',
                                fieldName: 'Can the agreement be terminated for convenience?',
                                operator: 'contains',
                                value: 'a) Unconditionally terminable for convenience',
                                description: 'Can the agreement be terminated for convenience? has answer a) Unconditionally terminable for convenience'
                            },
                            {
                                type: 'field_value',
                                fieldName: 'Can the agreement be terminated for convenience?',
                                operator: 'contains',
                                value: 'b) Terminable for convenience with prior notice',
                                description: 'Can the agreement be terminated for convenience? has answer b) Terminable for convenience with prior notice'
                            },
                            {
                                type: 'field_value',
                                fieldName: 'Can the agreement be terminated for convenience?',
                                operator: 'contains',
                                value: 'c) Terminable for convenience with payment of termination fee',
                                description: 'Can the agreement be terminated for convenience? has answer c) Terminable for convenience with payment of termination fee'
                            },
                            {
                                type: 'field_value',
                                fieldName: 'Can the agreement be terminated for convenience?',
                                operator: 'contains',
                                value: 'd) Terminable for convenience after a specified time period',
                                description: 'Can the agreement be terminated for convenience? has answer d) Terminable for convenience after a specified time period'
                            },
                            {
                                type: 'field_value',
                                fieldName: 'Can the agreement be terminated for convenience?',
                                operator: 'contains',
                                value: 'e) Terminable for convenience with other limitations or conditions',
                                description: 'Can the agreement be terminated for convenience? has answer e) Terminable for convenience with other limitations or conditions'
                            }
                        ]
                    },
                    {
                        id: 'change-control-restrictions',
                        name: 'Change of Control Restrictions',
                        points: 1,
                        conditionLogic: 'OR',
                        conditions: [
                            {
                                type: 'field_value',
                                fieldName: 'What are the obligations and requirements resulting from a Change of Control?',
                                operator: 'contains',
                                value: 'c) Change of control requires consent',
                                description: 'What are the obligations and requirements resulting from a Change of Control? has answer c) Change of control requires consent'
                            },
                            {
                                type: 'field_value',
                                fieldName: 'What are the obligations and requirements resulting from a Change of Control?',
                                operator: 'contains',
                                value: 'd) Change of control requires other obligations',
                                description: 'What are the obligations and requirements resulting from a Change of Control? has answer d) Change of control requires other obligations'
                            },
                            {
                                type: 'field_value',
                                fieldName: 'What are the obligations and requirements resulting from a Change of Control?',
                                operator: 'contains',
                                value: 'e) Agreement terminable on change of control',
                                description: 'What are the obligations and requirements resulting from a Change of Control? has answer e) Agreement terminable on change of control'
                            }
                        ]
                    }
                ]
            }
        ]
    }
};

// Simplified field data for workflow creation
const FIELD_DATA = {
    'Basic Information': [
        'Title', 'Parties', 'Date', 'Guarantor', 'Employee Name', 'Employer', 'Start Date'
    ],
    'Term and Termination': [
        'Term and Renewal', 'Does the agreement auto renew?', 'Can the agreement be terminated for convenience?',
        'Initial Term', 'Commencement Date (Short Form)', 'Commencement Date (Long Form)', 'Expiration Date — Lease',
        'Renewal — Lease'
    ],
    'Boilerplate Provisions': [
        'Can the agreement be assigned?', 'What are the obligations and requirements resulting from a Change of Control?',
        'Exclusivity', 'Non-Compete', 'Non-Solicit', 'Most Favored Nation', 'Can notice be given electronically?',
        'Governing Law', 'Notice'
    ],
    'Property Basics/Information': [
        'Premises Type', 'Address of Premises', 'Square Footage of Premises'
    ],
    'Use of Property': [
        'Use of Premises', 'Parking', 'Description of Premises', 'Utilities'
    ],
    'Rent and Expenses': [
        'Base Rent', 'Additional Rent', 'Rent Payment Date', 'Late Payment and Grace Period',
        'Security Deposit/Letters of Credit', '"Operating Expenses"/"Common Area Maintenance" Definition'
    ],
    'Confidentiality': [
        'Definition of Confidential Information', 'Permitted Use', 'Non-Disclosure Obligations',
        'Return of Confidential Information', 'Duration of Confidentiality', 'Exceptions to Confidentiality',
        'Residual Knowledge', 'No License Grant'
    ],
    'Case Information': [
        'Case Name', 'Case Number', 'Court', 'Judge', 'Filing Date'
    ],
    'Parties': [
        'Plaintiff', 'Defendant', 'Other Parties'
    ],
    'Key Dates': [
        'Answer Due Date', 'Discovery Cutoff', 'Trial Date'
    ],
    'Compensation': [
        'Base Salary', 'Bonus', 'Equity/Stock Options', 'Benefits', 'Severance'
    ],
    'Restrictive Covenants': [
        'Non-Competition', 'Non-Solicitation', 'Confidentiality', 'Intellectual Property Assignment'
    ],
    'Financial Terms': [
        'Purchase Price', 'Payment Terms', 'Currency', 'Interest Rate', 'Late Fees', 'Penalties',
        'Credit Limits', 'Security', 'Collateral', 'Guarantees'
    ],
    'Intellectual Property': [
        'Patents', 'Trademarks', 'Copyrights', 'Trade Secrets', 'Licenses', 'Royalties',
        'IP Assignment', 'IP Indemnification', 'IP Warranties'
    ],
    'Compliance and Regulatory': [
        'Regulatory Approvals', 'Compliance Requirements', 'Environmental Compliance',
        'Data Protection', 'Privacy Requirements', 'Export Control', 'Anti-Corruption'
    ],
    'Insurance and Liability': [
        'Insurance Requirements', 'Liability Caps', 'Indemnification', 'Force Majeure',
        'Risk Allocation', 'Limitation of Liability'
    ],
    'Performance and Quality': [
        'Service Levels', 'Performance Standards', 'Quality Metrics', 'Benchmarks',
        'Remedies for Non-Performance', 'Liquidated Damages'
    ],
    'Change Management': [
        'Change Requests', 'Scope Changes', 'Price Adjustments', 'Timeline Modifications',
        'Amendment Procedures'
    ]
};

// Document types for Step 3 (loaded from API)
let DOCUMENT_TYPES_HIERARCHICAL = [];
let DOCUMENT_TYPES_LOADING = false;

// Field Discovery state
const FieldDiscoveryState = {
    currentPage: 1,
    itemsPerPage: 10,
    searchQuery: '',
    sortBy: 'alphabetical',
    activeTab: 'search-filter',
    filteredResults: [],
    allFields: [],
    isLoading: false
};

// Fetch fields from API with detailed error handling
async function fetchFieldsFromAPI(searchQuery = '', limit = null, offset = null) {
    try {
        FieldDiscoveryState.isLoading = true;

        const params = new URLSearchParams();
        if (searchQuery) params.append('search', searchQuery);
        if (limit) params.append('limit', limit);
        if (offset) params.append('offset', offset);

        const url = `/api/fields?${params.toString()}`;
        console.log(`📡 Fetching: ${url}`);

        const response = await fetch(url);

        console.log(`📊 Response status: ${response.status} ${response.statusText}`);

        if (!response.ok) {
            const errorText = await response.text();
            console.error(`❌ API Error Response: ${errorText}`);
            throw new Error(`HTTP ${response.status}: ${response.statusText} - ${errorText}`);
        }

        const data = await response.json();
        console.log(`✅ Received ${data.fields?.length || 0} fields from API`);

        return data;
    } catch (error) {
        console.error('❌ Error fetching fields:', error.message);
        console.error('Full error:', error);
        throw error; // Re-throw instead of silently returning empty data
    } finally {
        FieldDiscoveryState.isLoading = false;
    }
}

// Load initial fields data with localStorage caching
async function loadFieldsData() {
    console.log('📋 Loading fields data...');

    // Check localStorage cache first
    const CACHE_KEY = 'omega_fields_cache';
    const CACHE_DURATION = 60 * 60 * 1000; // 1 hour in milliseconds

    try {
        const cached = localStorage.getItem(CACHE_KEY);
        if (cached) {
            const { fields, timestamp } = JSON.parse(cached);
            const age = Date.now() - timestamp;

            if (age < CACHE_DURATION) {
                console.log(`✅ Using cached fields (${fields.length} fields, age: ${Math.round(age/1000)}s)`);
                FieldDiscoveryState.allFields = fields;
                FieldDiscoveryState.filteredResults = [...fields];
                initializeCommonWorkflowFields();
                return; // Use cache, skip API call
            } else {
                console.log('⏰ Cache expired, fetching fresh data...');
            }
        }
    } catch (cacheError) {
        console.warn('⚠️ Cache read error, will fetch from API:', cacheError);
    }

    // Fetch from API if no cache or cache expired
    console.log('📡 Fetching fields from API...');
    try {
        const data = await fetchFieldsFromAPI();

        if (!data || !data.fields || data.fields.length === 0) {
            throw new Error('API returned no fields');
        }

        FieldDiscoveryState.allFields = data.fields;
        FieldDiscoveryState.filteredResults = [...FieldDiscoveryState.allFields];

        console.log(`✅ Loaded ${data.count} fields from API (total in memory: ${FieldDiscoveryState.allFields.length})`);
        console.log(`📊 FieldDiscoveryState.allFields is now populated and ready for use`);

        // Save to cache
        try {
            localStorage.setItem(CACHE_KEY, JSON.stringify({
                fields: FieldDiscoveryState.allFields,
                timestamp: Date.now()
            }));
            console.log('💾 Saved fields to localStorage cache');
        } catch (saveError) {
            console.warn('⚠️ Could not save to cache:', saveError);
        }

        // Initialize some common workflow fields if they exist
        initializeCommonWorkflowFields();
    } catch (error) {
        console.error('❌ Failed to load fields data:', error);
        // Fallback to empty data
        FieldDiscoveryState.allFields = [];
        FieldDiscoveryState.filteredResults = [];
        throw error; // Re-throw so caller knows it failed
    }
}

// Initialize common workflow fields from database
function initializeCommonWorkflowFields() {
    // Try to find common fields in the database to pre-select
    const commonFieldNames = ['Title', 'Parties', 'Date'];
    const allFields = getAllFields();

    commonFieldNames.forEach(fieldName => {
        const found = allFields.find(field => field.name === fieldName);
        if (found) {
            AppState.workflow.selectedFields.add(fieldName);
        }
    });

    console.log(`🎯 Initialized ${AppState.workflow.selectedFields.size} common workflow fields`);
}

// Load document types from API
async function loadDocumentTypes() {
    if (DOCUMENT_TYPES_LOADING) {
        console.log('⏳ Document types already loading...');
        return;
    }

    if (DOCUMENT_TYPES_HIERARCHICAL.length > 0) {
        console.log('✅ Document types already loaded');
        return;
    }

    console.log('📋 Loading document types...');
    DOCUMENT_TYPES_LOADING = true;

    try {
        const response = await fetch('/api/document-types');

        if (!response.ok) {
            throw new Error(`HTTP ${response.status}: ${response.statusText}`);
        }

        const data = await response.json();

        if (!data || !data.categories || data.categories.length === 0) {
            throw new Error('API returned no document types');
        }

        DOCUMENT_TYPES_HIERARCHICAL = data.categories;
        console.log(`✅ Loaded ${data.total_categories} categories with ${data.total_types} document types`);

        return true;
    } catch (error) {
        console.error('❌ Failed to load document types:', error);
        // Fallback to empty data
        DOCUMENT_TYPES_HIERARCHICAL = [];
        return false;
    } finally {
        DOCUMENT_TYPES_LOADING = false;
    }
}

// Initialize application
document.addEventListener('DOMContentLoaded', async function() {
    console.log('='.repeat(80));
    console.log('🚀 OMEGA WORKFLOW - FRONTEND DIAGNOSTIC LOG');
    console.log('='.repeat(80));
    console.log('📅 Page loaded at:', new Date().toISOString());
    console.log('🌐 Current URL:', window.location.href);
    console.log('🔐 LocalStorage auth token present:', !!localStorage.getItem('authToken'));
    if (localStorage.getItem('authToken')) {
        const token = localStorage.getItem('authToken');
        console.log('🔑 Token (first 30 chars):', token.substring(0, 30) + '...');
    }
    console.log('='.repeat(80));

    // Check authentication first but continue initialization regardless
    console.log('\n🔐 Starting authentication check...');
    const isAuthenticated = await checkAuthentication();
    console.log('🔐 Authentication result:', isAuthenticated);

    if (!isAuthenticated) {
        console.log('⚠️  NOT AUTHENTICATED - Limited functionality');
        console.log('   → Documents will show "Authentication Required" message');
        console.log('   → Upload will require login first');
        console.log('   → Please login at /login.html to access full features');
        // Store auth state for conditional features
        window.appAuthState = { authenticated: false };
    } else {
        console.log('✅ AUTHENTICATED SUCCESSFULLY');
        console.log('   → Documents should load automatically');
        console.log('   → Upload functionality is available');
        console.log('   → Workflow assignment is available');
        window.appAuthState = { authenticated: true };
    }
    
    // Always initialize basic app functionality
    console.log('🚀 Calling handleInitialRoute');
    handleInitialRoute();

    initializeSidebar();

    // Load fields data for Field Discovery BEFORE initializing pages that need it
    console.log('📡 Loading fields data...');
    await loadFieldsData();
    console.log(`✅ Fields loaded: ${FieldDiscoveryState.allFields.length} fields available`);

    // Load document types for workflow creation Step 3
    console.log('📡 Loading document types...');
    await loadDocumentTypes();
    console.log(`✅ Document types loaded: ${DOCUMENT_TYPES_HIERARCHICAL.length} categories available`);

    initializeToolbar();
    initializeDataTable();
    initializeDropdowns();
    initializeWorkflowsPage();
    initializeLogout();

    initializeCreateWorkflowPage();
    initializeCreateWorkflowStep2Page();
    initializeCreateWorkflowStep3Page();
    initializeCreateWorkflowStep4Page();
    initializeCreateWorkflowStep5Page();
    initializeFieldDiscoveryPage();

    // Initialize return links for all workflow creation pages
    initializeReturnLinks();

    // Apply initial state
    if (AppState.sidebarCollapsed) {
        document.getElementById('sidebar').classList.add('collapsed');
    }

    console.log('✅ Application initialization complete');
});

// Handle initial route on page load
function handleInitialRoute() {
    try {
        const path = window.location.pathname;
        console.log('🚀 handleInitialRoute called with path:', path);
        
        // Don't update history on initial load
        switchPage(path, false);
        
        // Update active navigation item
        updateActiveNavigation(path);
    } catch (error) {
        console.error('❌ Error in handleInitialRoute:', error);
        // Fallback to documents page
        switchPage('documents', false);
    }
}

// Update active navigation based on current path
function updateActiveNavigation(path) {
    // Remove active class from all nav items
    document.querySelectorAll('.nav-item, .sub-item').forEach(item => {
        item.classList.remove('active');
    });
    
    // Find and activate the matching navigation item
    const normalizedPath = path.replace(/^\//, '') || 'documents';
    const matchingLink = document.querySelector(`[href="#${normalizedPath}"], [href="/${normalizedPath}"], [href="${normalizedPath}"]`);
    if (matchingLink) {
        const navItem = matchingLink.closest('.nav-item, .sub-item');
        if (navItem) {
            navItem.classList.add('active');
        }
    }
}

// Handle browser back/forward navigation
window.addEventListener('popstate', function(event) {
    const path = window.location.pathname;
    // Don't update history on popstate
    switchPage(path, false);
    updateActiveNavigation(path);
});

// Sidebar functionality
function initializeSidebar() {
    const sidebar = document.getElementById('sidebar');
    const sidebarToggle = document.getElementById('sidebar-toggle');
    const mobileMenuToggle = document.getElementById('mobile-menu-toggle');
    const mainContent = document.querySelector('.main-content');
    
    // Desktop sidebar toggle
    sidebarToggle.addEventListener('click', function() {
        AppState.sidebarCollapsed = !AppState.sidebarCollapsed;
        sidebar.classList.toggle('collapsed');
        mainContent.classList.toggle('sidebar-collapsed');
        
        // Rotate toggle icon
        const icon = this.querySelector('.material-icons');
        icon.textContent = AppState.sidebarCollapsed ? 'chevron_right' : 'chevron_left';
        
        // Save state
        localStorage.setItem('sidebarCollapsed', AppState.sidebarCollapsed);
    });
    
    // Mobile menu toggle
    mobileMenuToggle.addEventListener('click', function() {
        sidebar.classList.toggle('mobile-open');
    });
    
    // Expandable menu sections
    const expandableSections = document.querySelectorAll('.nav-item.expandable');
    expandableSections.forEach(section => {
        section.addEventListener('click', function(e) {
            e.preventDefault();
            const sectionId = this.dataset.section;
            const submenu = document.getElementById(`${sectionId}-menu`);
            const expandIcon = this.querySelector('.expand-icon');
            
            // Toggle submenu
            submenu.classList.toggle('open');
            
            // Rotate expand icon
            expandIcon.textContent = submenu.classList.contains('open') ? 'expand_less' : 'expand_more';
        });
    });
    
    // Set initial state for analyze menu (open by default)
    const analyzeMenu = document.getElementById('analyze-menu');
    if (analyzeMenu) {
        analyzeMenu.classList.add('open');
        document.querySelector('[data-section="analyze"] .expand-icon').textContent = 'expand_less';
    }
    
    // Handle navigation clicks
    const navLinks = document.querySelectorAll('.nav-item a, .sub-item a');
    navLinks.forEach(link => {
        link.addEventListener('click', function(e) {
            e.preventDefault();
            
            // Remove active class from all items
            document.querySelectorAll('.nav-item, .sub-item').forEach(item => {
                item.classList.remove('active');
            });
            
            // Add active class to clicked item
            const listItem = this.closest('.nav-item, .sub-item');
            if (listItem) {
                listItem.classList.add('active');
            }
            
            // Handle page switching - convert hash to path
            const href = this.getAttribute('href');
            const path = href.startsWith('#') ? href.substring(1) : href;
            switchPage(path);
            
            // Log navigation event
            console.log('Navigation to:', href);
        });
    });
}

// Toolbar functionality
function initializeToolbar() {
    // Search & Filter toggle
    const searchToggle = document.getElementById('search-filter-toggle');
    const searchPanel = document.getElementById('search-panel');
    
    if (searchToggle && searchPanel) {
        searchToggle.addEventListener('click', function() {
            AppState.searchPanelOpen = !AppState.searchPanelOpen;
            searchPanel.style.display = AppState.searchPanelOpen ? 'block' : 'none';
            
            // Update icon
            const icon = this.querySelector('.material-icons:last-child');
            icon.textContent = AppState.searchPanelOpen ? 'keyboard_arrow_up' : 'keyboard_arrow_down';
        });
    }
    
    // Add Documents button with defensive check for race condition
    const addDocsBtn = document.getElementById('add-documents-btn');
    if (addDocsBtn) {
        console.log('📤 Add Documents button found, attaching click handler');
        addDocsBtn.addEventListener('click', function() {
            console.log('📤 Add Documents button clicked');

            // Defensive check: ensure upload.js has loaded and exported the function
            if (typeof window.openUploadModal === 'function') {
                console.log('📤 Opening upload modal...');
                window.openUploadModal();
            } else {
                console.error('❌ openUploadModal is not defined yet! upload.js may not have loaded.');
                console.log('🔄 Retrying in 100ms...');

                // Retry once after a short delay
                setTimeout(() => {
                    if (typeof window.openUploadModal === 'function') {
                        console.log('✅ openUploadModal found on retry, opening modal...');
                        window.openUploadModal();
                    } else {
                        console.error('❌ openUploadModal still not available after retry');
                        alert('Upload feature is still loading. Please refresh the page and try again.');
                    }
                }, 100);
            }
        });
    } else {
        console.error('❌ Add Documents button (#add-documents-btn) not found in DOM');
    }
    
    // Switch Organization button
    const switchOrgBtn = document.querySelector('.switch-org-btn');
    if (switchOrgBtn) {
        switchOrgBtn.addEventListener('click', function() {
            alert('Switch Organization dialog would open here');
        });
    }
    
    // Submit Feedback button
    const feedbackBtn = document.querySelector('.feedback-btn');
    if (feedbackBtn) {
        feedbackBtn.addEventListener('click', function() {
            alert('Feedback form would open here');
        });
    }
}

// Data table functionality
function initializeDataTable() {
    // Select all checkbox
    const selectAllCheckbox = document.querySelector('.checkbox-all');
    const rowCheckboxes = document.querySelectorAll('.checkbox-row');
    
    if (selectAllCheckbox) {
        selectAllCheckbox.addEventListener('change', function() {
            rowCheckboxes.forEach(checkbox => {
                checkbox.checked = this.checked;
                updateSelectedDocuments(checkbox, this.checked);
            });
            updateToolbarButtons();
        });
    }
    
    // Individual row checkboxes
    rowCheckboxes.forEach(checkbox => {
        checkbox.addEventListener('change', function() {
            updateSelectedDocuments(this, this.checked);
            updateSelectAllCheckbox();
            updateToolbarButtons();
        });
    });
    
    // Row click to select
    const tableRows = document.querySelectorAll('.data-table tbody tr');
    tableRows.forEach((row, index) => {
        row.addEventListener('click', function(e) {
            // Don't toggle if clicking on checkbox directly
            if (e.target.type === 'checkbox') return;
            
            const checkbox = this.querySelector('.checkbox-row');
            if (checkbox) {
                checkbox.checked = !checkbox.checked;
                updateSelectedDocuments(checkbox, checkbox.checked);
                updateSelectAllCheckbox();
                updateToolbarButtons();
            }
        });
    });
    
    // Rows per page
    const rowsSelects = document.querySelectorAll('#rows-select, .rows-per-page select');
    rowsSelects.forEach(select => {
        select.addEventListener('change', function() {
            console.log('Rows per page changed to:', this.value);
            // Implement pagination logic here
        });
    });
}

// Update selected documents set
function updateSelectedDocuments(checkbox, isChecked) {
    // Use data attributes instead of parsing text content for reliability
    const docName = checkbox.dataset.docName;

    if (isChecked) {
        AppState.selectedDocuments.add(docName);
        checkbox.closest('tr').classList.add('selected');
    } else {
        AppState.selectedDocuments.delete(docName);
        checkbox.closest('tr').classList.remove('selected');
    }
}

// Update select all checkbox state
function updateSelectAllCheckbox() {
    const selectAllCheckbox = document.querySelector('.checkbox-all');
    const rowCheckboxes = document.querySelectorAll('.checkbox-row');
    const checkedBoxes = document.querySelectorAll('.checkbox-row:checked');
    
    if (selectAllCheckbox) {
        selectAllCheckbox.checked = checkedBoxes.length === rowCheckboxes.length && rowCheckboxes.length > 0;
        selectAllCheckbox.indeterminate = checkedBoxes.length > 0 && checkedBoxes.length < rowCheckboxes.length;
    }
}

// Update toolbar buttons based on selection
function updateToolbarButtons() {
    const hasSelection = AppState.selectedDocuments.size > 0;
    const buttons = document.querySelectorAll('.toolbar button:not(.btn-primary):not(#search-filter-toggle):not(#files-dropdown):not(#workflows-dropdown)');

    buttons.forEach(button => {
        if (hasSelection) {
            button.removeAttribute('disabled');
        } else {
            button.setAttribute('disabled', 'disabled');
        }
    });

    // Update dropdown states
    if (window.updateWorkflowDropdownState) {
        window.updateWorkflowDropdownState();
    }
    if (window.updateFilesDropdownState) {
        window.updateFilesDropdownState();
    }
}

// Initialize dropdowns
function initializeDropdowns() {
    // Files dropdown - DISABLED: Now handled by file-operations.js
    // The Files dropdown (Rename/Delete) is managed by file-operations.js
    // to avoid conflicts and ensure proper integration with document selection

    // NOTE: If you need to add other dropdowns in the future, add them here
}

// Create dropdown menu helper
function createDropdownMenu(items) {
    const menu = document.createElement('div');
    menu.className = 'dropdown-menu';
    
    items.forEach(item => {
        if (item.divider) {
            const divider = document.createElement('hr');
            divider.className = 'dropdown-divider';
            menu.appendChild(divider);
        } else {
            const menuItem = document.createElement('a');
            menuItem.className = 'dropdown-item';
            menuItem.href = '#';
            menuItem.innerHTML = `
                ${item.icon ? `<span class="material-icons">${item.icon}</span>` : ''}
                <span>${item.text}</span>
            `;
            menuItem.addEventListener('click', function(e) {
                e.preventDefault();
                console.log('Dropdown action:', item.text);
            });
            menu.appendChild(menuItem);
        }
    });
    
    return menu;
}

// Page switching functionality
function switchPage(path, updateHistory = true) {
    try {
        // Normalize path - remove leading slash and hash
        const normalizedPath = path.replace(/^[/#]+/, '');
        console.log('📄 switchPage called with path:', path, '-> normalized:', normalizedPath);
        
        // Hide all pages
        const pages = document.querySelectorAll('.page-content');
        console.log('🔍 Found', pages.length, 'page elements');
        
        if (pages.length === 0) {
            console.error('❌ No page elements found! DOM might not be ready.');
            return;
        }
        
        pages.forEach(page => {
            page.style.display = 'none';
        });
        
        // Show the selected page based on path
        if (normalizedPath === 'workflows') {
            const workflowsPage = document.getElementById('workflows-page');
            console.log('✅ Showing workflows page, element found:', !!workflowsPage);
            if (workflowsPage) {
                workflowsPage.style.display = 'block';
            } else {
                console.error('❌ workflows-page element not found!');
            }
            if (updateHistory) history.pushState(null, '', '/workflows');
        } else if (normalizedPath === 'documents' || normalizedPath === '') {
            const documentsPage = document.getElementById('documents-page');
            console.log('✅ Showing documents page, element found:', !!documentsPage);
            if (documentsPage) {
                documentsPage.style.display = 'block';
            } else {
                console.error('❌ documents-page element not found!');
            }
            if (updateHistory) history.pushState(null, '', normalizedPath === '' ? '/' : '/documents');
        } else if (normalizedPath === 'create-workflow') {
            const createWorkflowPage = document.getElementById('create-workflow-page');
            console.log('✅ Showing create-workflow page, element found:', !!createWorkflowPage);
            if (createWorkflowPage) {
                createWorkflowPage.style.display = 'block';
            } else {
                console.error('❌ create-workflow-page element not found!');
            }
            if (updateHistory) history.pushState(null, '', '/create-workflow');
        } else if (normalizedPath === 'create-workflow-step2') {
            const step2Page = document.getElementById('create-workflow-step2-page');
            console.log('✅ Showing create-workflow-step2 page, element found:', !!step2Page);
            if (step2Page) {
                step2Page.style.display = 'block';

                // ✅ FIX: Explicitly hide documents page to prevent overlay (same as Step 5)
                const documentsPage = document.getElementById('documents-page');
                if (documentsPage) {
                    documentsPage.style.display = 'none';
                    console.log('✅ Explicitly hid documents-page on Step 2');
                }

                // ✅ FIX: Always render UI components, even if no fields loaded yet
                console.log(`📋 Step 2 page shown - ${FieldDiscoveryState.allFields.length} fields available`);

                // Initialize Basic Information group and render selected fields
                initializeBasicInformationGroup();
                renderSelectedFields();
                updateFieldCount();

                if (FieldDiscoveryState.allFields.length > 0) {
                    console.log('✅ Rendering field list on Step 2 page');
                    renderFieldList();
                    updatePagination();
                } else {
                    console.warn('⚠️ No fields loaded yet, showing loading message');
                    // Show loading message
                    const fieldListContainer = document.getElementById('field-list');
                    if (fieldListContainer) {
                        fieldListContainer.innerHTML = '<div class="loading-message" style="padding: 40px; text-align: center; color: #6b7280;">Loading fields from database...</div>';
                    }

                    // Try to load fields if they haven't been loaded yet
                    if (!window.fieldsLoadingStarted) {
                        window.fieldsLoadingStarted = true;
                        console.log('🔄 Triggering field load from database...');
                        loadFieldsFromDatabase().then(() => {
                            console.log('✅ Fields loaded, re-rendering Step 2');
                            renderFieldList();
                            updatePagination();
                        }).catch(err => {
                            console.error('❌ Failed to load fields:', err);
                            const fieldListContainer = document.getElementById('field-list');
                            if (fieldListContainer) {
                                fieldListContainer.innerHTML = '<div class="error-message" style="padding: 40px; text-align: center; color: #ef4444;">Failed to load fields. Please refresh the page.</div>';
                            }
                        });
                    }
                }
            } else {
                console.error('❌ create-workflow-step2-page element not found!');
            }
            if (updateHistory) history.pushState(null, '', '/create-workflow-step2');
        } else if (normalizedPath === 'create-workflow-step3') {
            const step3Page = document.getElementById('create-workflow-step3-page');
            console.log('✅ Showing create-workflow-step3 page, element found:', !!step3Page);
            if (step3Page) {
                step3Page.style.display = 'block';
                // Initialize form with AppState data (for template loading and edit flows)
                initializeStep3Form();
            } else {
                console.error('❌ create-workflow-step3-page element not found!');
            }
            if (updateHistory) history.pushState(null, '', '/create-workflow-step3');
        } else if (normalizedPath === 'create-workflow-step4') {
            const step4Page = document.getElementById('create-workflow-step4-page');
            console.log('✅ Showing create-workflow-step4 page, element found:', !!step4Page);
            if (step4Page) {
                step4Page.style.display = 'block';

                // Step 4: Feature Coming Soon - no initialization needed
                console.log('✅ Showing Step 4 - Feature Coming Soon');
            } else {
                console.error('❌ create-workflow-step4-page element not found!');
            }
            if (updateHistory) history.pushState(null, '', '/create-workflow-step4');
        } else if (normalizedPath === 'create-workflow-step5') {
            const step5Page = document.getElementById('create-workflow-step5-page');
            console.log('✅ Showing create-workflow-step5 page, element found:', !!step5Page);
            if (step5Page) {
                step5Page.style.display = 'block';

                // ✅ FIX: Explicitly hide documents page to prevent overlay
                const documentsPage = document.getElementById('documents-page');
                if (documentsPage) {
                    documentsPage.style.display = 'none';
                    console.log('✅ Explicitly hid documents-page to prevent overlay');
                }

                // Check for URL parameters (edit mode)
                const urlParams = new URLSearchParams(window.location.search);
                const sessionId = urlParams.get('sessionId');
                const mode = urlParams.get('mode');

                if (sessionId && mode === 'edit') {
                    // Load workflow session data for editing
                    console.log('📝 Edit mode detected, loading session:', sessionId);
                    loadWorkflowForEdit(sessionId);
                } else {
                    // ✅ FIX: Render review with slight delay to ensure DOM ready
                    setTimeout(() => {
                        console.log('🎨 Rendering Step 5 review data');
                        renderWorkflowReview();

                        // Log current AppState for debugging
                        console.log('📊 AppState.workflow data for Step 5:', {
                            name: AppState.workflow.name,
                            description: AppState.workflow.description?.substring(0, 50) || '(none)',
                            fields: AppState.workflow.selectedFields.size,
                            fieldGroups: Object.keys(AppState.workflow.fieldGroups).length,
                            docTypes: AppState.workflow.documentTypes.size,
                            docTypesList: Array.from(AppState.workflow.documentTypes),
                            scoring: AppState.workflow.scoringProfiles?.length || 0
                        });
                    }, 50);
                }
            } else {
                console.error('❌ create-workflow-step5-page element not found!');
            }
            if (updateHistory) history.pushState(null, '', '/create-workflow-step5');
        } else if (normalizedPath === 'field-discovery') {
            const fieldDiscoveryPage = document.getElementById('field-discovery-page');
            console.log('✅ Showing field-discovery page, element found:', !!fieldDiscoveryPage);
            if (fieldDiscoveryPage) {
                fieldDiscoveryPage.style.display = 'block';

                // Always initialize and render fields when showing the page
                console.log(`📋 Field Discovery page shown - ${FieldDiscoveryState.allFields.length} fields available`);
                if (FieldDiscoveryState.allFields.length > 0) {
                    console.log('✅ Rendering fields on Field Discovery page');
                    // Reset and initialize the filtered results
                    FieldDiscoveryState.filteredResults = [...FieldDiscoveryState.allFields];
                    FieldDiscoveryState.currentPage = 1;
                    renderFieldResults();
                    updateFieldPagination();
                } else {
                    console.warn('⚠️ No fields loaded yet on Field Discovery page');
                    // Show loading message
                    const resultsContainer = document.getElementById('field-results-list');
                    if (resultsContainer) {
                        resultsContainer.innerHTML = '<div class="loading-message">Loading fields...</div>';
                    }
                }
            } else {
                console.error('❌ field-discovery-page element not found!');
            }
            if (updateHistory) history.pushState(null, '', '/field-discovery');
        } else {
            // Default to documents page for unknown routes
            const documentsPage = document.getElementById('documents-page');
            console.log('⚠️ Unknown route, showing documents page, element found:', !!documentsPage);
            if (documentsPage) {
                documentsPage.style.display = 'block';
            } else {
                console.error('❌ documents-page element not found!');
            }
            if (updateHistory) history.pushState(null, '', '/');
        }
    } catch (error) {
        console.error('❌ Error in switchPage:', error);
        // Fallback: try to show documents page
        const documentsPage = document.getElementById('documents-page');
        if (documentsPage) {
            console.log('🔧 Fallback: showing documents page due to error');
            documentsPage.style.display = 'block';
        } else {
            console.error('❌ CRITICAL: documents-page element not found even in fallback!');
        }
    }
    
    // Safety check: ensure at least one page is visible
    setTimeout(() => {
        const visiblePages = document.querySelectorAll('.page-content[style*="block"]');
        if (visiblePages.length === 0) {
            console.warn('⚠️ No pages visible after routing, showing default page');
            // ✅ FIX: Check if we're in workflow creation flow - don't force documents page
            if (normalizedPath.startsWith('create-workflow') ||
                normalizedPath.includes('workflow') ||
                normalizedPath === 'workflows') {
                console.log('In workflow flow, not forcing documents page');
                return;
            }
            const documentsPage = document.getElementById('documents-page');
            if (documentsPage) {
                documentsPage.style.display = 'block';
            }
        }
    }, 100);
}

// Initialize Workflows page functionality
function initializeWorkflowsPage() {
    // Tab switching
    const tabs = document.querySelectorAll('.tab');
    const tabContents = document.querySelectorAll('.tab-content');
    
    tabs.forEach(tab => {
        tab.addEventListener('click', function() {
            // Remove active class from all tabs
            tabs.forEach(t => t.classList.remove('active'));
            // Add active class to clicked tab
            this.classList.add('active');
            
            // Hide all tab contents
            tabContents.forEach(content => {
                content.style.display = 'none';
            });
            
            // Show selected tab content
            const tabName = this.dataset.tab;
            const selectedContent = document.getElementById(tabName);
            if (selectedContent) {
                selectedContent.style.display = 'block';
            }
        });
    });
    
    // Expand/collapse workflow cards
    const expandToggles = document.querySelectorAll('.expand-toggle');
    expandToggles.forEach(toggle => {
        toggle.addEventListener('click', function() {
            const icon = this.querySelector('.material-icons');
            const card = this.closest('.workflow-card');
            
            if (icon.textContent === 'keyboard_arrow_down') {
                icon.textContent = 'keyboard_arrow_right';
                card.classList.add('collapsed');
            } else {
                icon.textContent = 'keyboard_arrow_down';
                card.classList.remove('collapsed');
            }
        });
    });
    
    // Workflow action buttons
    const deleteButtons = document.querySelectorAll('.workflow-card .btn-outline:first-child');
    const editButtons = document.querySelectorAll('.workflow-card .btn-outline:last-child');
    
    deleteButtons.forEach(btn => {
        btn.addEventListener('click', function() {
            alert('Delete workflow functionality would be implemented here');
        });
    });
    
    editButtons.forEach(btn => {
        btn.addEventListener('click', async function() {
            const workflowId = this.getAttribute('data-workflow-id');
            if (workflowId) {
                await editWorkflow(workflowId);
            } else {
                alert('Workflow ID not found');
            }
        });
    });
    
    // Create Workflow button
    const createWorkflowBtn = document.querySelector('.create-workflow-btn');
    if (createWorkflowBtn) {
        createWorkflowBtn.addEventListener('click', function() {
            switchPage('create-workflow');
        });
    }
    
    // Helper function to convert template fields structure to fieldGroups format
    function initializeFieldGroupsFromTemplate(templateFields) {
        console.log('🔄 Converting template fields to fieldGroups format', templateFields);

        if (!templateFields || typeof templateFields !== 'object') {
            console.warn('⚠️ Template fields invalid or missing');
            return {};
        }

        const fieldGroups = {};

        // Template fields come as { "Category Name": [field objects], ... }
        for (const [category, fields] of Object.entries(templateFields)) {
            if (!Array.isArray(fields) || fields.length === 0) continue;

            // Use category name directly as the group key
            fieldGroups[category] = fields.map(field => ({
                id: field.fieldId || field.id,
                name: field.name,
                fieldId: field.fieldId || field.id
            }));

            console.log(`  ✓ Added group "${category}" with ${fields.length} fields`);
        }

        console.log(`✅ Created ${Object.keys(fieldGroups).length} field groups from template`);
        return fieldGroups;
    }

    // Copy Template buttons in Workflow Library
    const copyTemplateButtons = document.querySelectorAll('.btn-copy-template');
    copyTemplateButtons.forEach(btn => {
        btn.addEventListener('click', async function(e) {
            e.stopPropagation();
            const card = this.closest('.workflow-card-item');
            const cardTitle = card.querySelector('.workflow-card-title').textContent.trim();
            
            // Determine template ID based on title
            const templateId = cardTitle.toLowerCase().replace(/\s+/g, '-');
            
            try {
                // Create workflow from template via API with template name
                const result = await workflowAPI.createFromTemplate(templateId, cardTitle);
                
                // Update AppState with template data
                if (result && result.workflow) {
                    console.log('📋 Processing template data:', result.workflow);

                    // Handle fields - could be object with categories or array
                    let fields = result.workflow.fields;
                    let flatFields = [];

                    if (typeof fields === 'object' && !Array.isArray(fields)) {
                        // Fields are categorized - flatten them for selectedFields Set
                        for (const category in fields) {
                            flatFields = flatFields.concat(fields[category].map(f => f.name || f));
                        }
                    } else if (Array.isArray(fields)) {
                        flatFields = fields.map(f => f.name || f);
                    }

                    // ✅ FIX: Initialize fieldGroups from template for Step 2 editing
                    const fieldGroups = initializeFieldGroupsFromTemplate(result.workflow.fields);
                    console.log('✅ Initialized fieldGroups from template:', fieldGroups);

                    // Convert scoring profiles if they're in template format
                    let scoringProfiles = result.workflow.scoringProfiles;
                    if (scoringProfiles && typeof scoringProfiles === 'object' && !Array.isArray(scoringProfiles)) {
                        // Store original for Step 5 review
                        AppState.workflow.templateScoringProfiles = scoringProfiles;
                        // Convert for Step 4 editing
                        scoringProfiles = convertTemplateScoringToStep4Format(scoringProfiles);
                    } else if (!scoringProfiles) {
                        scoringProfiles = [];
                    }

                    AppState.workflow = {
                        name: result.workflow.name,
                        description: result.workflow.description,
                        selectedFields: new Set(flatFields),
                        fields: result.workflow.fields, // Store fields with categories for review page
                        fieldGroups: fieldGroups, // ← FIX: Now populated for Step 2 editing!
                        documentTypes: new Set(result.workflow.documentTypes),
                        scoringProfiles: result.workflow.scoringProfiles, // Keep original template format for review
                        templateScoringProfiles: result.workflow.scoringProfiles, // Keep original for review
                        activeProfile: scoringProfiles.length > 0 ? scoringProfiles[0].id : 'profileA',
                        isFromTemplate: true,
                        workflowId: workflowAPI.workflowId // Store the workflow ID
                    };

                    console.log('✅ AppState.workflow updated with fieldGroups:', AppState.workflow);
                }
                
                // Navigate to Step 5 for review
                switchPage('create-workflow-step5');
            } catch (error) {
                alert('Error creating workflow from template. Please try again.');
                console.error('Error:', error);
            }
        });
    });
    
}

// Helper function to reset workflow state and return to workflows page
function resetWorkflowAndReturn() {
    // Reset workflow state
    AppState.workflow = {
        name: '',
        description: '',
        selectedFields: new Set(),
        documentTypes: new Set(),
        scoringProfiles: [],
        activeProfile: 'profileA'
    };
    
    // Reset form fields if they exist
    const workflowNameInput = document.getElementById('workflow-name');
    const charCountElement = document.getElementById('char-count');
    const nextButton = document.querySelector('.workflow-next');
    
    if (workflowNameInput) {
        workflowNameInput.value = '';
    }
    if (charCountElement) {
        charCountElement.textContent = '0';
    }
    if (nextButton) {
        nextButton.disabled = true;
    }
    
    // Navigate to workflows page
    switchPage('workflows');
}

// Initialize all return to workflows links
function initializeReturnLinks() {
    // Select all return links across all workflow creation steps
    const returnLinks = document.querySelectorAll('.return-link');
    
    returnLinks.forEach(link => {
        // Remove any existing listeners to avoid duplicates
        const newLink = link.cloneNode(true);
        link.parentNode.replaceChild(newLink, link);
        
        // Add fresh event listener
        newLink.addEventListener('click', function(e) {
            e.preventDefault();
            resetWorkflowAndReturn();
        });
    });
}

// Initialize Create Workflow page functionality
function initializeCreateWorkflowPage() {
    const workflowNameInput = document.getElementById('workflow-name');
    const charCountElement = document.getElementById('char-count');
    const nextButton = document.querySelector('.workflow-next');
    const backButton = document.querySelector('.workflow-back');
    const returnLink = document.querySelector('.return-link');

    // Observe when Create Workflow page becomes visible to initialize a fresh workflow session
    const observer = new MutationObserver(function(mutations) {
        mutations.forEach(function(mutation) {
            const createWorkflowPage = document.getElementById('create-workflow-page');
            if (createWorkflowPage && createWorkflowPage.style.display === 'block') {
                // Reset workflow ID to force fresh initialization
                console.log('🔄 Create Workflow page opened - resetting workflow session');
                workflowAPI.workflowId = null;
            }
        });
    });

    const createWorkflowPage = document.getElementById('create-workflow-page');
    if (createWorkflowPage) {
        observer.observe(createWorkflowPage, { attributes: true, attributeFilter: ['style'] });
    }

    if (workflowNameInput && charCountElement && nextButton) {
        // Character counter functionality
        workflowNameInput.addEventListener('input', function() {
            const currentLength = this.value.length;
            charCountElement.textContent = currentLength;

            // Next button is always enabled (name is optional)
            // Just validate max length
            if (currentLength > 75) {
                nextButton.disabled = true;
            } else {
                nextButton.disabled = false;
            }
        });

        // Next button functionality
        nextButton.addEventListener('click', async function() {
            const workflowName = workflowNameInput.value.trim();

            // Store workflow name in application state (even if empty)
            AppState.workflow.name = workflowName;

            // Only send to backend API if name is provided
            if (workflowName) {
                try {
                    await workflowAPI.setWorkflowName(workflowName);
                } catch (error) {
                    alert('Error saving workflow name. Please try again.');
                    console.error('Error:', error);
                    return; // Don't navigate if there was an error
                }
            } else {
                // If no name provided, initialize workflow session without setting name
                try {
                    await workflowAPI.initWorkflow();
                } catch (error) {
                    alert('Error initializing workflow. Please try again.');
                    console.error('Error:', error);
                    return;
                }
            }

            // Navigate to Step 2
            switchPage('create-workflow-step2');
        });
    }
    
    // Back button functionality
    if (backButton) {
        backButton.addEventListener('click', function() {
            resetWorkflowAndReturn();
        });
    }
    
    // Return to Workflows link functionality
    if (returnLink) {
        returnLink.addEventListener('click', function(e) {
            e.preventDefault();
            resetWorkflowAndReturn();
        });
    }
}

// Initialize Create Workflow Step 2 page functionality
function initializeCreateWorkflowStep2Page() {
    // Initialize Basic Information group with Title, Parties, Date if starting fresh
    // This will be populated when fields are loaded from database

    let step2Initialized = false; // Track if Step 2 has been initialized

    // Render selected fields and field list when page is shown
    const observer = new MutationObserver(function(mutations) {
        mutations.forEach(function(mutation) {
            const step2Page = document.getElementById('create-workflow-step2-page');
            if (step2Page && step2Page.style.display === 'block' && !step2Initialized) {
                console.log('🔄 Step 2 page is now visible, initializing...');
                console.log(`📊 Fields loaded: ${FieldDiscoveryState.allFields ? FieldDiscoveryState.allFields.length : 0}`);

                // Initialize Basic Information group if it doesn't exist and we have fields loaded
                initializeBasicInformationGroup();
                renderSelectedFields();
                renderFieldList();
                updatePagination();

                // Mark as initialized and disconnect observer to prevent multiple renders
                step2Initialized = true;
                console.log('✅ Step 2 initialized, disconnecting observer');
                observer.disconnect();
            }
        });
    });

    const step2Page = document.getElementById('create-workflow-step2-page');
    if (step2Page) {
        observer.observe(step2Page, { attributes: true, attributeFilter: ['style'] });
    }
    
    // Search functionality
    const searchInput = document.getElementById('field-search-input');
    const searchButton = document.getElementById('field-search-button');
    
    if (searchInput) {
        searchInput.addEventListener('input', function() {
            AppState.workflow.searchQuery = this.value;
            AppState.workflow.currentPage = 1;
            renderFieldList();
            updatePagination();
        });
    }
    
    if (searchButton) {
        searchButton.addEventListener('click', function() {
            renderFieldList();
            updatePagination();
        });
    }

    // ✅ FIX: Add Step 2 navigation button handlers
    const backButton = document.querySelector('.step2-back');
    const nextButton = document.querySelector('.step2-next');

    if (backButton) {
        backButton.addEventListener('click', function() {
            console.log('⬅️ Step 2 Back button clicked');
            switchPage('create-workflow-step1');
        });
    }

    if (nextButton) {
        nextButton.addEventListener('click', function() {
            console.log('➡️ Step 2 Next button clicked');

            // Validate at least one field is selected
            const totalFields = getTotalSelectedFields();
            if (totalFields === 0) {
                alert('Please select at least one field before proceeding.');
                return;
            }

            console.log(`✅ Step 2 validation passed: ${totalFields} fields selected`);
            // Navigate to Step 3
            switchPage('create-workflow-step3');
        });
    }
}

// Render selected fields in left panel
function renderSelectedFields() {
    const container = document.getElementById('selected-fields-list');
    if (!container) return;

    // ✅ FIX: If fieldGroups is empty but we have template fields, initialize from template
    if ((!AppState.workflow.fieldGroups || Object.keys(AppState.workflow.fieldGroups).length === 0)
        && AppState.workflow.fields && typeof AppState.workflow.fields === 'object') {
        console.log('🔄 fieldGroups empty but template fields exist - initializing from template');
        AppState.workflow.fieldGroups = initializeFieldGroupsFromTemplate(AppState.workflow.fields);
    }

    const totalFields = getTotalSelectedFields();
    if (totalFields === 0) {
        container.innerHTML = '<div class="empty-state">No fields selected yet</div>';
        return;
    }

    let html = '';

    // Render each field group
    Object.entries(AppState.workflow.fieldGroups).forEach(([groupName, fields]) => {
        html += `
            <div class="field-group" data-group-name="${groupName}">
                <div class="field-group-header">
                    <span class="field-group-title">${groupName}</span>
                    <div class="field-group-actions">
                        <button class="btn-icon btn-rename-group" data-group="${groupName}" title="Rename group">
                            <span class="material-icons small-icon">edit</span>
                        </button>
                        <button class="btn-icon btn-delete-group" data-group="${groupName}" title="Delete group">
                            <span class="material-icons small-icon">delete</span>
                        </button>
                    </div>
                </div>
                <div class="field-buttons">
        `;

        fields.forEach(field => {
            // Support both old string format and new object format
            const fieldName = typeof field === 'object' ? field.name : field;
            const fieldId = typeof field === 'object' ? field.fieldId : field;

            html += `
                <button class="field-button" data-field="${fieldName}" data-field-id="${fieldId}" data-group="${groupName}" title="${fieldName}">
                    <span class="field-button-text">${fieldName}</span>
                    <span class="field-button-remove material-icons">close</span>
                </button>
            `;
        });

        html += `
                </div>
            </div>
        `;
    });

    container.innerHTML = html;

    // Add remove field event listeners
    container.querySelectorAll('.field-button-remove').forEach(btn => {
        btn.addEventListener('click', function(e) {
            e.stopPropagation();
            const fieldButton = this.closest('.field-button');
            const fieldId = fieldButton.dataset.fieldId;
            const groupName = fieldButton.dataset.group;
            removeFieldFromGroup(fieldId, groupName);
        });
    });

    // Add rename group event listeners
    container.querySelectorAll('.btn-rename-group').forEach(btn => {
        btn.addEventListener('click', function() {
            const groupName = this.dataset.group;
            const newName = prompt('Enter new group name:', groupName);
            if (newName && newName.trim() && newName !== groupName) {
                renameFieldGroup(groupName, newName.trim());
            }
        });
    });

    // Add delete group event listeners
    container.querySelectorAll('.btn-delete-group').forEach(btn => {
        btn.addEventListener('click', function() {
            const groupName = this.dataset.group;
            if (confirm(`Delete group "${groupName}" and all its fields?`)) {
                deleteFieldGroup(groupName);
            }
        });
    });

    // Update field count display
    updateFieldCount();
}

// State flag to prevent concurrent renders
let isRenderingFields = false;
let renderRetryCount = 0;
const MAX_RETRIES = 3;

// Render field list in right panel
function renderFieldList() {
    console.log('🎨 renderFieldList() called');

    // Prevent concurrent renders
    if (isRenderingFields) {
        console.log('⏭️ Skipping render - already in progress');
        return;
    }

    const container = document.getElementById('field-list');
    if (!container) {
        console.log('⚠️ field-list container not found');
        return;
    }

    // Check if fields are loaded
    if (!FieldDiscoveryState.allFields || FieldDiscoveryState.allFields.length === 0) {
        console.log(`⏳ Fields not loaded yet, retry ${renderRetryCount + 1}/${MAX_RETRIES}...`);

        if (renderRetryCount >= MAX_RETRIES) {
            console.error('❌ Max retries reached, fields failed to load');
            container.innerHTML = `
                <div class="error-message" style="padding: 20px; text-align: center;">
                    <p style="color: #dc2626; font-weight: bold;">⚠️ Failed to load fields</p>
                    <p style="color: #6b7280; margin: 10px 0;">Fields could not be loaded from the server.</p>
                    <button onclick="window.location.reload()" style="
                        background: #2563eb;
                        color: white;
                        border: none;
                        padding: 8px 16px;
                        border-radius: 4px;
                        cursor: pointer;
                        margin-top: 10px;
                    ">Reload Page</button>
                </div>
            `;
            renderRetryCount = 0; // Reset for next time
            return;
        }

        container.innerHTML = `<div class="loading-message">Loading fields... (attempt ${renderRetryCount + 1}/${MAX_RETRIES})</div>`;

        // Exponential backoff: 500ms, 1000ms, 2000ms
        const delay = 500 * Math.pow(2, renderRetryCount);
        renderRetryCount++;

        setTimeout(() => {
            if (FieldDiscoveryState.allFields && FieldDiscoveryState.allFields.length > 0) {
                console.log('✅ Fields loaded, re-rendering...');
                renderRetryCount = 0; // Reset on success
                renderFieldList();
            } else {
                console.log(`⚠️ Retry ${renderRetryCount}/${MAX_RETRIES} failed, trying again...`);
                renderFieldList();
            }
        }, delay);
        return;
    }

    // Set rendering flag
    isRenderingFields = true;
    renderRetryCount = 0; // Reset retry count on successful render

    const allFields = getAllFields();
    console.log(`📋 Rendering ${allFields.length} total fields (after exclusions)`);
    const filteredFields = filterFields(allFields);
    console.log(`🔍 Filtered to ${filteredFields.length} fields based on search`);
    const paginatedFields = paginateFields(filteredFields);
    console.log(`📄 Showing ${paginatedFields.length} fields on current page`);

    let html = '';
    paginatedFields.forEach(({ name, category, description, fieldId, type, region }) => {
        const isSelected = isFieldSelected(fieldId || name);

        // Truncate description for display
        const truncatedDescription = description && description.length > 100
            ? description.substring(0, 100) + '...'
            : description || '';

        // ✅ FIX: Generate dropdown menu with existing groups (excluding Basic Information) + "Create new group"
        const existingGroups = Object.keys(AppState.workflow.fieldGroups)
            .filter(g => g !== 'Basic Information');

        const dropdownItemsHtml = `
            ${existingGroups.map(groupName => `
                <div class="dropdown-item" data-action="add-to-existing" data-group="${groupName}" data-field="${name}" data-field-id="${fieldId || ''}">
                    ${groupName}
                </div>
            `).join('')}
            <div class="dropdown-item" data-action="add-to-new-group" data-field="${name}" data-field-id="${fieldId || ''}">
                Create new group
            </div>
        `;

        html += `
            <div class="field-item">
                <div class="field-info">
                    <div class="field-name" title="${name}">${name}</div>
                    <div class="field-category">${category}</div>
                    ${truncatedDescription ? `<div class="field-description" title="${description}">${truncatedDescription}</div>` : ''}
                </div>
                <div class="btn-add-container">
                    <button class="btn-add" data-field="${name}" data-category="${category}" data-field-id="${fieldId || ''}" ${isSelected ? 'disabled' : ''}>
                        ${isSelected ? 'Added' : 'Add'}
                    </button>
                    <button class="btn-add-dropdown" data-field="${name}" data-field-id="${fieldId || ''}" data-category="${category}" ${isSelected ? 'disabled' : ''}>
                        <span class="material-icons">arrow_drop_down</span>
                    </button>
                    <div class="add-dropdown-menu" data-field="${name}" style="display: none;">
                        ${dropdownItemsHtml}
                    </div>
                </div>
            </div>
        `;
    });

    container.innerHTML = html;

    // Add field to last used group event listeners
    container.querySelectorAll('.btn-add:not([disabled])').forEach(btn => {
        btn.addEventListener('click', function() {
            const fieldName = this.dataset.field;
            const fieldId = this.dataset.fieldId;
            // ✅ FIX: Skip Basic Information, create new default group instead
            const targetGroup = AppState.workflow.lastUsedGroup === 'Basic Information'
                ? 'Custom Fields'  // Create new default group
                : AppState.workflow.lastUsedGroup;
            addFieldToGroup(fieldName, fieldId, targetGroup);
        });
    });

    // Add dropdown toggle event listeners
    container.querySelectorAll('.btn-add-dropdown:not([disabled])').forEach(btn => {
        btn.addEventListener('click', function(e) {
            e.stopPropagation();
            const fieldName = this.dataset.field;
            const dropdown = this.nextElementSibling;

            // Close all other dropdowns
            document.querySelectorAll('.add-dropdown-menu').forEach(menu => {
                if (menu !== dropdown) {
                    menu.style.display = 'none';
                }
            });

            // Toggle this dropdown
            dropdown.style.display = dropdown.style.display === 'none' ? 'block' : 'none';
        });
    });

    // ✅ FIX: Add dropdown item event listeners for adding to existing groups
    container.querySelectorAll('.dropdown-item[data-action="add-to-existing"]').forEach(item => {
        item.addEventListener('click', function() {
            const fieldName = this.dataset.field;
            const fieldId = this.dataset.fieldId;
            const groupName = this.dataset.group;
            addFieldToGroup(fieldName, fieldId, groupName);
            // Close dropdown
            this.closest('.add-dropdown-menu').style.display = 'none';
        });
    });

    // Add dropdown item event listeners for creating new group
    container.querySelectorAll('.dropdown-item[data-action="add-to-new-group"]').forEach(item => {
        item.addEventListener('click', function() {
            const fieldName = this.dataset.field;
            const fieldId = this.dataset.fieldId;
            showCreateGroupDialog(fieldName, fieldId);
            // Close dropdown
            this.closest('.add-dropdown-menu').style.display = 'none';
        });
    });

    // Close dropdowns when clicking outside
    document.addEventListener('click', function(e) {
        if (!e.target.closest('.btn-add-container')) {
            document.querySelectorAll('.add-dropdown-menu').forEach(menu => {
                menu.style.display = 'none';
            });
        }
    });

    // Clear rendering flag
    isRenderingFields = false;
    console.log('✅ Field list rendered successfully');
}

// Get all fields from database (using FieldDiscoveryState which loads from API)
function getAllFields() {
    const fields = [];

    // Fields to exclude - Basic Information default group fields plus other excluded fields
    const excludedFields = ['"Affiliates" Definition — ISDA', 'Title', 'Parties', 'Date'];

    // Use the fields loaded from the database
    if (FieldDiscoveryState.allFields && FieldDiscoveryState.allFields.length > 0) {
        FieldDiscoveryState.allFields.forEach(field => {
            // Skip excluded fields
            if (excludedFields.includes(field.name)) {
                return;
            }

            // Create categories from tags, defaulting to 'Other' if no tags
            const categories = field.tags && field.tags.length > 0 ? field.tags : ['Other'];

            // Add the field to each of its categories (some fields may appear in multiple categories)
            categories.forEach(category => {
                fields.push({
                    name: field.name,
                    category: category,
                    description: field.description,
                    fieldId: field.field_id,
                    type: field.type,
                    region: field.region
                });
            });
        });
    } else {
        // Fallback to hardcoded data if database fields aren't loaded yet
        console.log('⚠️ Database fields not loaded, using fallback data');
        Object.keys(FIELD_DATA).forEach(category => {
            FIELD_DATA[category].forEach(fieldName => {
                // Skip excluded fields
                if (!excludedFields.includes(fieldName)) {
                    fields.push({ name: fieldName, category });
                }
            });
        });
    }

    // Sort fields alphabetically with numbers first
    fields.sort((a, b) => {
        const aStartsWithNumber = /^\d/.test(a.name);
        const bStartsWithNumber = /^\d/.test(b.name);

        // If one starts with number and other doesn't, number comes first
        if (aStartsWithNumber && !bStartsWithNumber) return -1;
        if (!aStartsWithNumber && bStartsWithNumber) return 1;

        // Otherwise, standard alphabetical comparison
        return a.name.localeCompare(b.name, undefined, { numeric: true, sensitivity: 'base' });
    });

    return fields;
}

// Filter fields based on search query
function filterFields(fields) {
    if (!AppState.workflow.searchQuery) {
        return fields;
    }
    
    const query = AppState.workflow.searchQuery.toLowerCase();
    return fields.filter(field => 
        field.name.toLowerCase().includes(query) || 
        field.category.toLowerCase().includes(query) ||
        (field.description && field.description.toLowerCase().includes(query))
    );
}

// Paginate fields
function paginateFields(fields) {
    const start = (AppState.workflow.currentPage - 1) * AppState.workflow.fieldsPerPage;
    const end = start + AppState.workflow.fieldsPerPage;
    return fields.slice(start, end);
}

// ===============================================
// Group Management Functions
// ===============================================

// Get total number of selected fields across all groups
function getTotalSelectedFields() {
    let total = 0;
    Object.values(AppState.workflow.fieldGroups).forEach(fields => {
        total += fields.length;
    });
    return total;
}

// Check if a field is selected in any group
function isFieldSelected(fieldId) {
    for (const fields of Object.values(AppState.workflow.fieldGroups)) {
        // Support both old string format and new object format
        const found = fields.some(field =>
            typeof field === 'object' ? field.fieldId === fieldId : field === fieldId
        );
        if (found) {
            return true;
        }
    }
    return false;
}

// ✅ NEW HELPER: Get all field names from fieldGroups (for Step 5 review)
function getAllFieldNamesFromGroups() {
    const fieldNames = [];
    Object.values(AppState.workflow.fieldGroups).forEach(fields => {
        fields.forEach(field => {
            const fieldName = typeof field === 'object' ? field.name : field;
            if (fieldName && !fieldNames.includes(fieldName)) {
                fieldNames.push(fieldName);
            }
        });
    });
    return fieldNames;
}

// Add field to a specific group
function addFieldToGroup(fieldName, fieldId, groupName) {
    // ✅ FIX: Prevent adding fields to Basic Information group
    if (groupName === 'Basic Information') {
        console.warn('Cannot add fields to Basic Information group - it is protected');
        return;
    }

    // Create group if it doesn't exist
    if (!AppState.workflow.fieldGroups[groupName]) {
        AppState.workflow.fieldGroups[groupName] = [];
    }

    // Check if field already exists in group (by fieldId)
    const existingField = AppState.workflow.fieldGroups[groupName].find(
        field => typeof field === 'object' ? field.fieldId === fieldId : field === fieldName
    );

    // Add field if not already in group
    if (!existingField) {
        AppState.workflow.fieldGroups[groupName].push({
            name: fieldName,
            fieldId: fieldId
        });

        // ✅ FIX: Sync with selectedFields to ensure Step 5 displays correctly
        AppState.workflow.selectedFields.add(fieldName);

        // ✅ FIX: Only update lastUsedGroup if not Basic Information
        if (groupName !== 'Basic Information') {
            AppState.workflow.lastUsedGroup = groupName;
        }

        renderSelectedFields();
        renderFieldList();
        updateFieldCount();
    }
}

// Remove field from a specific group
function removeFieldFromGroup(fieldId, groupName) {
    if (AppState.workflow.fieldGroups[groupName]) {
        // Find field index by fieldId (supports both old string format and new object format)
        const index = AppState.workflow.fieldGroups[groupName].findIndex(
            field => typeof field === 'object' ? field.fieldId === fieldId : field === fieldId
        );

        if (index > -1) {
            // Get the field before removing it (for selectedFields sync)
            const field = AppState.workflow.fieldGroups[groupName][index];
            const fieldName = typeof field === 'object' ? field.name : field;

            AppState.workflow.fieldGroups[groupName].splice(index, 1);

            // ✅ FIX: Sync with selectedFields to keep data structures in sync
            AppState.workflow.selectedFields.delete(fieldName);

            // Remove group if empty
            if (AppState.workflow.fieldGroups[groupName].length === 0) {
                delete AppState.workflow.fieldGroups[groupName];
            }

            renderSelectedFields();
            renderFieldList();
            updateFieldCount();
        }
    }
}

// Delete entire field group
function deleteFieldGroup(groupName) {
    if (AppState.workflow.fieldGroups[groupName]) {
        // ✅ FIX: Remove all fields from this group from selectedFields
        const fields = AppState.workflow.fieldGroups[groupName];
        fields.forEach(field => {
            const fieldName = typeof field === 'object' ? field.name : field;
            AppState.workflow.selectedFields.delete(fieldName);
        });

        delete AppState.workflow.fieldGroups[groupName];
        renderSelectedFields();
        renderFieldList();
        updateFieldCount();
    }
}

// Rename field group
function renameFieldGroup(oldName, newName) {
    if (AppState.workflow.fieldGroups[oldName] && !AppState.workflow.fieldGroups[newName]) {
        AppState.workflow.fieldGroups[newName] = AppState.workflow.fieldGroups[oldName];
        delete AppState.workflow.fieldGroups[oldName];
        renderSelectedFields();
        updateFieldCount();
    }
}

// Show create group dialog
function showCreateGroupDialog(fieldName, fieldId) {
    const dialog = document.getElementById('create-group-dialog');
    const overlay = document.getElementById('dialog-overlay');
    const input = document.getElementById('group-name-input');

    if (!dialog || !overlay || !input) {
        console.error('Dialog elements not found');
        return;
    }

    // Store field name and fieldId in dialog for later use
    dialog.dataset.fieldName = fieldName;
    dialog.dataset.fieldId = fieldId;

    // Show dialog and overlay
    overlay.style.display = 'block';
    dialog.style.display = 'block';
    input.value = '';
    input.focus();

    // Setup event listeners if not already set up
    if (!dialog.dataset.listenersAttached) {
        const createBtn = document.getElementById('create-group-btn');
        const cancelBtn = document.getElementById('cancel-group-btn');

        createBtn.addEventListener('click', handleCreateGroup);
        cancelBtn.addEventListener('click', hideCreateGroupDialog);
        overlay.addEventListener('click', hideCreateGroupDialog);

        // Allow Enter key to create group
        input.addEventListener('keypress', function(e) {
            if (e.key === 'Enter') {
                handleCreateGroup();
            }
        });

        dialog.dataset.listenersAttached = 'true';
    }
}

// Hide create group dialog
function hideCreateGroupDialog() {
    const dialog = document.getElementById('create-group-dialog');
    const overlay = document.getElementById('dialog-overlay');

    if (dialog && overlay) {
        overlay.style.display = 'none';
        dialog.style.display = 'none';
    }
}

// Handle create group button click
function handleCreateGroup() {
    const dialog = document.getElementById('create-group-dialog');
    const input = document.getElementById('group-name-input');
    const fieldName = dialog.dataset.fieldName;
    const fieldId = dialog.dataset.fieldId;
    const groupName = input.value.trim();

    if (!groupName) {
        alert('Please enter a group name');
        return;
    }

    if (AppState.workflow.fieldGroups[groupName]) {
        alert('A group with this name already exists');
        return;
    }

    // Create new group and add field
    addFieldToGroup(fieldName, fieldId, groupName);
    hideCreateGroupDialog();
}

// Update field count display
function updateFieldCount() {
    const totalFields = getTotalSelectedFields();
    const subtitle = document.getElementById('selected-fields-count');
    if (subtitle) {
        subtitle.textContent = `${totalFields} field${totalFields !== 1 ? 's' : ''} selected`;
    }
}

// Initialize Basic Information group with Title, Parties, Date
function initializeBasicInformationGroup() {
    // Skip if fields aren't loaded yet
    if (!FieldDiscoveryState.allFields || FieldDiscoveryState.allFields.length === 0) {
        console.log('⏳ Fields not loaded yet, skipping Basic Information initialization');
        return;
    }

    // Skip if Basic Information group already has fields
    if (AppState.workflow.fieldGroups['Basic Information'] &&
        AppState.workflow.fieldGroups['Basic Information'].length > 0) {
        console.log('✓ Basic Information group already initialized');
        return;
    }

    // Find Title, Parties, Date fields from the database
    const basicFieldNames = ['Title', 'Parties', 'Date'];
    const basicFields = [];

    basicFieldNames.forEach(fieldName => {
        const field = FieldDiscoveryState.allFields.find(f => f.name === fieldName);
        if (field) {
            basicFields.push({
                name: field.name,
                fieldId: field.field_id
            });
        }
    });

    // Add Basic Information group with these fields if we found them
    if (basicFields.length > 0) {
        AppState.workflow.fieldGroups['Basic Information'] = basicFields;
        console.log(`✓ Initialized Basic Information group with ${basicFields.length} fields:`, basicFieldNames);
    } else {
        console.warn('⚠️ Could not find Basic Information fields in database');
    }
}

// Get field category by field name
function getFieldCategory(fieldName) {
    for (const [category, fields] of Object.entries(FIELD_DATA)) {
        if (fields.includes(fieldName)) {
            return category;
        }
    }
    return 'Other';
}

// Update pagination info and controls
function updatePagination() {
    const allFields = getAllFields();
    const filteredFields = filterFields(allFields);
    const totalFields = filteredFields.length;
    const totalPages = Math.ceil(totalFields / AppState.workflow.fieldsPerPage);

    const paginationInfo = document.getElementById('pagination-info');
    if (paginationInfo) {
        const start = totalFields > 0 ? (AppState.workflow.currentPage - 1) * AppState.workflow.fieldsPerPage + 1 : 0;
        const end = Math.min(start + AppState.workflow.fieldsPerPage - 1, totalFields);
        paginationInfo.textContent = `${start}–${end} of ${totalFields}`;
    }

    // Update pagination controls
    const prevButton = document.getElementById('prev-page');
    const nextButton = document.getElementById('next-page');
    const currentPageSpan = document.getElementById('current-page');

    if (prevButton) {
        prevButton.disabled = AppState.workflow.currentPage <= 1;
        prevButton.onclick = () => {
            if (AppState.workflow.currentPage > 1) {
                AppState.workflow.currentPage--;
                renderFieldList();
                updatePagination();
            }
        };
    }

    if (nextButton) {
        nextButton.disabled = AppState.workflow.currentPage >= totalPages;
        nextButton.onclick = () => {
            if (AppState.workflow.currentPage < totalPages) {
                AppState.workflow.currentPage++;
                renderFieldList();
                updatePagination();
            }
        };
    }

    if (currentPageSpan) {
        currentPageSpan.textContent = AppState.workflow.currentPage;
    }

    // Add event listener for fields per page dropdown
    const fieldsPerPageSelect = document.getElementById('fields-per-page-select');
    if (fieldsPerPageSelect && !fieldsPerPageSelect.dataset.listenerAttached) {
        fieldsPerPageSelect.value = AppState.workflow.fieldsPerPage;
        fieldsPerPageSelect.addEventListener('change', function() {
            AppState.workflow.fieldsPerPage = parseInt(this.value);
            AppState.workflow.currentPage = 1; // Reset to first page
            renderFieldList();
            updatePagination();
        });
        fieldsPerPageSelect.dataset.listenerAttached = 'true';
    }
}

// Initialize Field Discovery page functionality
function initializeFieldDiscoveryPage() {
    // Tab switching
    const fieldTabs = document.querySelectorAll('.field-tab');
    fieldTabs.forEach(tab => {
        tab.addEventListener('click', function() {
            // Remove active class from all tabs
            fieldTabs.forEach(t => t.classList.remove('active'));
            // Add active class to clicked tab
            this.classList.add('active');
            
            // Update state
            FieldDiscoveryState.activeTab = this.dataset.tab;
            
            // Hide all tab contents
            document.querySelectorAll('.field-discovery-content .tab-content').forEach(content => {
                content.classList.remove('active');
                content.style.display = 'none';
            });
            
            // Show selected tab content
            const selectedContent = document.getElementById(this.dataset.tab + '-content');
            if (selectedContent) {
                selectedContent.classList.add('active');
                selectedContent.style.display = 'block';
            }
        });
    });
    
    // Search functionality
    const searchInput = document.getElementById('field-discovery-search');
    const searchBtn = document.querySelector('.search-btn');
    
    if (searchInput) {
        searchInput.addEventListener('input', function() {
            FieldDiscoveryState.searchQuery = this.value;
            FieldDiscoveryState.currentPage = 1;
            performSearch();
        });
    }
    
    if (searchBtn) {
        searchBtn.addEventListener('click', function() {
            performSearch();
        });
    }
    
    // Sort functionality
    const sortSelect = document.getElementById('sort-select');
    if (sortSelect) {
        sortSelect.addEventListener('change', function() {
            FieldDiscoveryState.sortBy = this.value;
            performSearch();
        });
    }
    
    // Pagination
    const rowsSelect = document.getElementById('rows-per-page');
    if (rowsSelect) {
        rowsSelect.addEventListener('change', function() {
            FieldDiscoveryState.itemsPerPage = parseInt(this.value);
            FieldDiscoveryState.currentPage = 1;
            renderFieldResults();
            updateFieldPagination();
        });
    }
    
    // Reset functionality
    const resetBtn = document.querySelector('.reset-btn');
    if (resetBtn) {
        resetBtn.addEventListener('click', function() {
            // Reset search
            if (searchInput) searchInput.value = '';
            if (sortSelect) sortSelect.value = 'alphabetical';
            
            // Reset state
            FieldDiscoveryState.searchQuery = '';
            FieldDiscoveryState.sortBy = 'alphabetical';
            FieldDiscoveryState.currentPage = 1;
            FieldDiscoveryState.filteredResults = [...FieldDiscoveryState.allFields];
            
            renderFieldResults();
            updateFieldPagination();
        });
    }
    
    // Download functionality
    const downloadBtn = document.querySelector('.download-file-btn');
    if (downloadBtn) {
        downloadBtn.addEventListener('click', function() {
            alert('Download functionality would be implemented here');
        });
    }
    
    // Initialize with default data
    performSearch();
}

// Perform search and filtering
function performSearch() {
    let results = [...FieldDiscoveryState.allFields];
    
    // Apply search filter
    if (FieldDiscoveryState.searchQuery) {
        const query = FieldDiscoveryState.searchQuery.toLowerCase();
        results = results.filter(field => {
            const name = field.name?.toLowerCase() || '';
            const description = field.description?.toLowerCase() || '';
            const fieldId = field.field_id?.toLowerCase() || '';
            const type = field.type?.toLowerCase() || '';
            const region = field.region?.toLowerCase() || '';
            
            // Handle jurisdictions array properly
            const jurisdictions = field.jurisdictions || [];
            const jurisdictionMatches = jurisdictions.some(j => {
                if (typeof j === 'string') return j.toLowerCase().includes(query);
                if (j.country) return j.country.name?.toLowerCase().includes(query);
                return false;
            });
            
            // Handle document_types array properly
            const documentTypes = field.document_types || [];
            const docTypeMatches = documentTypes.some(d => {
                if (typeof d === 'string') return d.toLowerCase().includes(query);
                if (d.classifications) return d.classifications.some(c => c.toLowerCase().includes(query));
                return false;
            });
            
            // Handle tags array
            const tags = field.tags || [];
            const tagMatches = tags.some(t => t.toLowerCase().includes(query));
            
            return name.includes(query) ||
                   description.includes(query) ||
                   fieldId.includes(query) ||
                   type.includes(query) ||
                   region.includes(query) ||
                   jurisdictionMatches ||
                   docTypeMatches ||
                   tagMatches;
        });
    }
    
    // Apply sorting
    switch (FieldDiscoveryState.sortBy) {
        case 'alphabetical':
            results.sort((a, b) => a.name.localeCompare(b.name));
            break;
        case 'relevance':
            // Keep original order for relevance
            break;
        case 'type':
            results.sort((a, b) => a.type.localeCompare(b.type));
            break;
    }
    
    FieldDiscoveryState.filteredResults = results;
    FieldDiscoveryState.currentPage = 1;
    
    renderFieldResults();
    updateFieldPagination();
}

// Render field results
function renderFieldResults() {
    console.log('🎯 renderFieldResults called');
    const container = document.getElementById('field-results-list');
    if (!container) {
        console.error('❌ field-results-list container not found!');
        return;
    }
    console.log('✅ Found field-results-list container');
    
    const startIndex = (FieldDiscoveryState.currentPage - 1) * FieldDiscoveryState.itemsPerPage;
    const endIndex = startIndex + FieldDiscoveryState.itemsPerPage;
    const pageResults = FieldDiscoveryState.filteredResults.slice(startIndex, endIndex);
    
    if (pageResults.length === 0) {
        container.innerHTML = '<div class="empty-state">No fields found matching your search criteria.</div>';
        return;
    }
    
    let html = '';
    pageResults.forEach(field => {
        // Extract jurisdiction names for display
        const jurisdictions = field.jurisdictions || [];
        const jurisdictionNames = jurisdictions.map(j => {
            if (typeof j === 'string') return j;
            if (j.country) return j.country.name;
            return 'Unknown';
        });

        // Extract document types for display
        const documentTypes = field.document_types || [];
        const docTypeNames = documentTypes.flatMap(d => {
            if (typeof d === 'string') return [d];
            if (d.classifications) return d.classifications;
            return [];
        });

        // Extract languages for display
        const languages = field.languages || [];
        const languageNames = languages.map(l => 
            typeof l === 'string' ? l : (l.language || 'Unknown')
        );

        html += `
            <div class="field-result-item">
                <a href="#" class="field-name-link">${field.name || 'Unnamed Field'}</a>
                <div class="field-description">${field.description || 'No description available'}</div>
                <div class="field-metadata">
                    <div class="metadata-row">
                        <span class="metadata-label">Type</span>
                        <div class="metadata-tags">
                            <span class="metadata-tag tag-type">${field.type || 'Unknown'}</span>
                        </div>
                    </div>
                    ${jurisdictionNames.length > 0 ? `
                    <div class="metadata-row">
                        <span class="metadata-label">Jurisdictions</span>
                        <div class="metadata-tags">
                            ${jurisdictionNames.map(j => `<span class="metadata-tag tag-jurisdiction">${j}</span>`).join('')}
                        </div>
                    </div>
                    ` : ''}
                    ${docTypeNames.length > 0 ? `
                    <div class="metadata-row">
                        <span class="metadata-label">Document Types</span>
                        <div class="metadata-tags">
                            ${docTypeNames.slice(0, 5).map(d => `<span class="metadata-tag tag-document-type">${d}</span>`).join('')}
                            ${docTypeNames.length > 5 ? `<span class="metadata-tag tag-document-type">+${docTypeNames.length - 5} more</span>` : ''}
                        </div>
                    </div>
                    ` : ''}
                    <div class="metadata-row">
                        ${languageNames.length > 0 ? `
                        <span class="metadata-label">Language</span>
                        <div class="metadata-tags">
                            ${languageNames.map(l => `<span class="metadata-tag tag-language">${l}</span>`).join('')}
                        </div>
                        ` : ''}
                        ${field.tags && field.tags.length > 0 ? `
                        <span class="metadata-label">Tags</span>
                        <div class="metadata-tags">
                            ${field.tags.slice(0, 3).map(t => `<span class="metadata-tag tag-document-type">${t}</span>`).join('')}
                            ${field.tags.length > 3 ? `<span class="metadata-tag tag-document-type">+${field.tags.length - 3} more</span>` : ''}
                        </div>
                        ` : ''}
                    </div>
                </div>
            </div>
        `;
    });
    
    container.innerHTML = html;
    console.log(`🎯 Rendered ${pageResults.length} field results to container`);
}

// Update pagination controls
function updateFieldPagination() {
    const totalResults = FieldDiscoveryState.filteredResults.length;
    const totalPages = Math.ceil(totalResults / FieldDiscoveryState.itemsPerPage);
    
    // Update results count
    const resultsCount = document.getElementById('results-count');
    if (resultsCount) {
        resultsCount.textContent = `${totalResults} Results`;
    }
    
    // Update page info
    const pageInfo = document.getElementById('page-info');
    if (pageInfo) {
        const start = totalResults === 0 ? 0 : (FieldDiscoveryState.currentPage - 1) * FieldDiscoveryState.itemsPerPage + 1;
        const end = Math.min(FieldDiscoveryState.currentPage * FieldDiscoveryState.itemsPerPage, totalResults);
        pageInfo.textContent = `${start}-${end} of ${totalResults}`;
    }
    
    // Update navigation buttons
    const prevBtn = document.getElementById('prev-page-btn');
    const nextBtn = document.getElementById('next-page-btn');
    
    if (prevBtn) {
        prevBtn.disabled = FieldDiscoveryState.currentPage <= 1;
        prevBtn.onclick = () => {
            if (FieldDiscoveryState.currentPage > 1) {
                FieldDiscoveryState.currentPage--;
                renderFieldResults();
                updateFieldPagination();
            }
        };
    }
    
    if (nextBtn) {
        nextBtn.disabled = FieldDiscoveryState.currentPage >= totalPages;
        nextBtn.onclick = () => {
            if (FieldDiscoveryState.currentPage < totalPages) {
                FieldDiscoveryState.currentPage++;
                renderFieldResults();
                updateFieldPagination();
            }
        };
    }
}

// Initialize Create Workflow Step 3 page functionality
function initializeCreateWorkflowStep3Page() {
    // Initialize custom dropdown for document types
    initializeCustomDropdown();
    
    // Description textarea
    const descriptionTextarea = document.getElementById('workflow-description');
    if (descriptionTextarea) {
        descriptionTextarea.addEventListener('input', function() {
            AppState.workflow.description = this.value;
        });
    }
    
    // Navigation buttons
    const backButton = document.querySelector('.workflow-step3-back');
    const nextButton = document.querySelector('.workflow-step3-next');
    
    if (backButton) {
        backButton.addEventListener('click', function() {
            // Save current form data
            if (descriptionTextarea) {
                AppState.workflow.description = descriptionTextarea.value;
            }
            
            // Navigate back to Step 2
            switchPage('create-workflow-step2');
        });
    }
    
    if (nextButton) {
        nextButton.addEventListener('click', function() {
            // ✅ FIX: Save current form data to AppState before navigation
            if (descriptionTextarea) {
                AppState.workflow.description = descriptionTextarea.value.trim();
            }

            // Document types are already synced via toggleDocumentType(),
            // but let's log for verification
            console.log('📋 Step 3 data synced before navigation:', {
                description: AppState.workflow.description?.substring(0, 50) || '(none)',
                documentTypes: Array.from(AppState.workflow.documentTypes),
                documentTypesCount: AppState.workflow.documentTypes.size
            });

            // Validate form
            if (validateStep3Form()) {
                // Navigate to Step 4
                switchPage('create-workflow-step4');
            }
        });
    }
    
    // Initialize form with existing data if returning to this step
    initializeStep3Form();
}

// Initialize custom dropdown functionality
function initializeCustomDropdown() {
    const dropdownButton = document.getElementById('document-types-button');
    const dropdownMenu = document.getElementById('document-types-menu');
    const dropdownText = dropdownButton.querySelector('.dropdown-text');
    
    // Populate dropdown options
    populateDropdownOptions();
    
    // Toggle dropdown on button click
    dropdownButton.addEventListener('click', function(e) {
        e.stopPropagation();
        toggleDropdown();
    });
    
    // Close dropdown when clicking outside
    document.addEventListener('click', function() {
        closeDropdown();
    });
    
    // Prevent dropdown from closing when clicking inside the menu
    dropdownMenu.addEventListener('click', function(e) {
        e.stopPropagation();
    });
    
    // Update dropdown text based on selections
    updateDropdownText();
}

// Populate dropdown options with hierarchical structure
function populateDropdownOptions() {
    const dropdownMenu = document.getElementById('document-types-menu');
    if (!dropdownMenu) return;

    dropdownMenu.innerHTML = '';

    // If document types not loaded yet, show loading message
    if (DOCUMENT_TYPES_HIERARCHICAL.length === 0) {
        const loading = document.createElement('div');
        loading.className = 'dropdown-loading';
        loading.textContent = 'Loading document types...';
        dropdownMenu.appendChild(loading);
        return;
    }

    // Render hierarchical structure
    DOCUMENT_TYPES_HIERARCHICAL.forEach(category => {
        // Add category header (non-selectable)
        const categoryHeader = document.createElement('div');
        categoryHeader.className = 'dropdown-category-header';
        categoryHeader.textContent = category.name;
        dropdownMenu.appendChild(categoryHeader);

        // Add document types under this category
        if (category.types && category.types.length > 0) {
            category.types.forEach(type => {
                const option = document.createElement('div');
                option.className = 'dropdown-option dropdown-subtype';
                option.textContent = type.name;
                option.dataset.value = type.name;
                option.dataset.categoryId = category.id;
                option.dataset.typeId = type.id;

                // Check if already selected
                if (AppState.workflow.documentTypes.has(type.name)) {
                    option.classList.add('selected');
                }

                // Handle option click
                option.addEventListener('click', function() {
                    toggleDocumentType(type.name);
                });

                dropdownMenu.appendChild(option);
            });
        }
    });
}

// Toggle dropdown open/close
function toggleDropdown() {
    const dropdownButton = document.getElementById('document-types-button');
    const dropdownMenu = document.getElementById('document-types-menu');
    
    if (dropdownMenu.classList.contains('show')) {
        closeDropdown();
    } else {
        openDropdown();
    }
}

// Open dropdown
function openDropdown() {
    const dropdownButton = document.getElementById('document-types-button');
    const dropdownMenu = document.getElementById('document-types-menu');
    
    dropdownButton.classList.add('active');
    dropdownMenu.classList.add('show');
    
    // Refresh options to show current selections
    populateDropdownOptions();
}

// Close dropdown
function closeDropdown() {
    const dropdownButton = document.getElementById('document-types-button');
    const dropdownMenu = document.getElementById('document-types-menu');
    
    dropdownButton.classList.remove('active');
    dropdownMenu.classList.remove('show');
}

// Toggle document type selection
function toggleDocumentType(type) {
    if (AppState.workflow.documentTypes.has(type)) {
        // Remove if already selected
        AppState.workflow.documentTypes.delete(type);
    } else {
        // Add if not selected
        AppState.workflow.documentTypes.add(type);
    }
    
    // Update UI
    updateDropdownText();
    renderSelectedDocumentTypes();
    validateStep3Form();
    
    // Refresh the dropdown options to show updated selections
    populateDropdownOptions();
}

// Update dropdown button text
function updateDropdownText() {
    const dropdownText = document.querySelector('#document-types-button .dropdown-text');
    if (!dropdownText) return;
    
    const selectedCount = AppState.workflow.documentTypes.size;
    
    if (selectedCount === 0) {
        dropdownText.textContent = 'Select document types';
        dropdownText.classList.add('placeholder');
    } else if (selectedCount === 1) {
        const selectedType = Array.from(AppState.workflow.documentTypes)[0];
        dropdownText.textContent = selectedType;
        dropdownText.classList.remove('placeholder');
    } else {
        dropdownText.textContent = `${selectedCount} document types selected`;
        dropdownText.classList.remove('placeholder');
    }
}

// Render selected document types as chips
function renderSelectedDocumentTypes() {
    const container = document.getElementById('selected-doc-types');
    if (!container) return;
    
    if (AppState.workflow.documentTypes.size === 0) {
        container.innerHTML = '';
        return;
    }
    
    let html = '';
    AppState.workflow.documentTypes.forEach(type => {
        html += `
            <div class="doc-type-chip">
                <span>${type}</span>
                <button class="remove-chip" data-type="${type}">
                    <span class="material-icons">close</span>
                </button>
            </div>
        `;
    });
    
    container.innerHTML = html;
    
    // Add event listeners for remove buttons
    container.querySelectorAll('.remove-chip').forEach(btn => {
        btn.addEventListener('click', function() {
            const typeToRemove = this.dataset.type;
            AppState.workflow.documentTypes.delete(typeToRemove);
            
            // Update dropdown display
            updateDropdownText();
            renderSelectedDocumentTypes();
            validateStep3Form();
        });
    });
}

// Validate Step 3 form
function validateStep3Form() {
    const nextButton = document.querySelector('.workflow-step3-next');
    
    // At least one document type must be selected
    const hasDocumentTypes = AppState.workflow.documentTypes.size > 0;
    
    if (nextButton) {
        nextButton.disabled = !hasDocumentTypes;
    }
    
    return hasDocumentTypes;
}

// Initialize Step 3 form with existing data
function initializeStep3Form() {
    const descriptionTextarea = document.getElementById('workflow-description');
    
    // Pre-populate description
    if (descriptionTextarea && AppState.workflow.description) {
        descriptionTextarea.value = AppState.workflow.description;
    }
    
    // Update dropdown and chips for existing document types
    updateDropdownText();
    renderSelectedDocumentTypes();
    validateStep3Form();
}

// Show workflow summary (placeholder for Step 4)
function showWorkflowSummary() {
    const summary = {
        name: AppState.workflow.name,
        description: AppState.workflow.description || 'No description provided',
        fieldsCount: AppState.workflow.selectedFields.size,
        documentTypes: Array.from(AppState.workflow.documentTypes)
    };
    
    alert(`Workflow Created Successfully!\n\nName: ${summary.name}\nDescription: ${summary.description}\nFields: ${summary.fieldsCount} selected\nDocument Types: ${summary.documentTypes.join(', ')}\n\nThis would proceed to Step 4 of 5.`);
}

// Update Step 2 Next button to navigate to Step 3
function updateStep2Navigation() {
    const step2NextButton = document.querySelector('.step2-next');
    if (step2NextButton) {
        // Remove existing event listeners by cloning the node
        const newButton = step2NextButton.cloneNode(true);
        step2NextButton.parentNode.replaceChild(newButton, step2NextButton);
        
        // Add new event listener
        newButton.addEventListener('click', function() {
            if (getTotalSelectedFields() > 0) {
                switchPage('create-workflow-step3');
            } else {
                alert('Please select at least one field before proceeding.');
            }
        });
    }
}

// Initialize Create Workflow Step 4 page functionality
function initializeCreateWorkflowStep4Page() {
    console.log('🎯 Initializing Step 4 with new scoring system');

    // ✅ FIX: No longer need old event listeners - new system handles its own events
    // The new scoring system (scoring-ui.js, scoring-events.js, scoring-data.js)
    // manages all profile and criterion interactions

    // Navigation buttons - only need to handle Back and Next
    const backButton = document.querySelector('.workflow-step4-back');
    const nextButton = document.querySelector('.workflow-step4-next');

    if (backButton) {
        // Remove existing listeners
        const newBackButton = backButton.cloneNode(true);
        backButton.parentNode.replaceChild(newBackButton, backButton);

        newBackButton.addEventListener('click', function() {
            console.log('⬅️ Step 4 Back button clicked');
            switchPage('create-workflow-step3');
        });
    }

    if (nextButton) {
        // Remove existing listeners
        const newNextButton = nextButton.cloneNode(true);
        nextButton.parentNode.replaceChild(newNextButton, nextButton);

        newNextButton.addEventListener('click', function() {
            console.log('➡️ Step 4 Next button clicked');

            // ✅ FIX: Sync scoring data from new system to AppState before proceeding
            syncScoringDataToAppState();

            // ✅ FIX: Scoring is now optional - always allow proceeding
            switchPage('create-workflow-step5');
        });
    }

    console.log('✅ Step 4 navigation initialized');
}

// ✅ Sync scoring data - Feature Coming Soon
function syncScoringDataToAppState() {
    // Step 4 scoring feature coming soon - set empty array
    AppState.workflow.scoringProfiles = [];
    console.log('✅ Step 4 skipped - scoring feature coming soon');
}

// Initialize default scoring profiles
function initializeDefaultScoringProfiles() {
    AppState.workflow.scoringProfiles = [
        {
            id: 'profileA',
            name: 'Scoring Profile A',
            criteria: [
                {
                    id: 'criterionA',
                    name: 'Scoring Criterion A',
                    points: 1,
                    conditions: [
                        { type: 'document_text_contains', value: 'covenant' }
                    ]
                },
                {
                    id: 'criterionB', 
                    name: 'Scoring Criterion B',
                    points: 1,
                    conditions: [
                        { type: 'document_type_is', value: 'Credit & Loan Agt' }
                    ]
                }
            ]
        },
        {
            id: 'profileB',
            name: 'Scoring Profile B',
            criteria: []
        }
    ];
}

// Convert template scoring profiles to Step 4 format
function convertTemplateScoringToStep4Format(templateScoring) {
    if (!templateScoring || typeof templateScoring !== 'object') {
        return [];
    }
    
    const profiles = [];
    let profileIndex = 0;
    
    // Convert each scoring profile from the template
    Object.entries(templateScoring).forEach(([profileName, profileData]) => {
        const profile = {
            id: `profile${profileIndex}`,
            name: profileName,
            criteria: []
        };
        
        if (typeof profileData === 'object') {
            Object.entries(profileData).forEach(([fieldName, criteria]) => {
                if (Array.isArray(criteria)) {
                    // Handle multiple choice answers (Assignment Restrictions, etc.)
                    criteria.forEach((criterion, idx) => {
                        profile.criteria.push({
                            id: `criterion${profileIndex}_${idx}`,
                            name: fieldName,
                            points: criterion.points || 1,
                            conditions: [
                                {
                                    type: 'field_has_answer',
                                    field: fieldName,
                                    value: criterion.answer
                                }
                            ]
                        });
                    });
                } else if (criteria && typeof criteria === 'object') {
                    // Handle simple conditions (Due Diligence Scoring)
                    profile.criteria.push({
                        id: `criterion${profileIndex}_${profile.criteria.length}`,
                        name: fieldName,
                        points: criteria.points || 1,
                        conditions: [
                            {
                                type: criteria.condition === 'is found' ? 'field_is_found' : 'field_has_value',
                                field: fieldName,
                                value: criteria.condition || ''
                            }
                        ]
                    });
                }
            });
        }
        
        profiles.push(profile);
        profileIndex++;
    });
    
    return profiles;
}

// Switch between scoring profiles
function switchScoringProfile(profileId) {
    // Update active tab
    document.querySelectorAll('.profile-tab').forEach(tab => {
        tab.classList.remove('active');
        if (tab.dataset.profile === profileId) {
            tab.classList.add('active');
        }
    });
    
    // Update active content
    document.querySelectorAll('.profile-content').forEach(content => {
        content.classList.remove('active');
        content.style.display = 'none';
    });
    
    const activeContent = document.getElementById(profileId + '-content');
    if (activeContent) {
        activeContent.classList.add('active');
        activeContent.style.display = 'block';
    }
    
    AppState.workflow.activeProfile = profileId;
    renderScoringProfiles();
}

// Render scoring profiles
// ❌ OLD SYSTEM - Commented out - now using new scoring system (scoring-ui.js)
/* function renderScoringProfiles() {
    // ✅ FIX: Add debug logging
    console.log('🎨 renderScoringProfiles called');
    console.log('   Profiles count:', AppState.workflow.scoringProfiles?.length);
    console.log('   Profiles:', AppState.workflow.scoringProfiles);

    AppState.workflow.scoringProfiles.forEach(profile => {
        renderProfileCriteria(profile);
    });

    // Set up profile actions
    setupProfileActions();
} */

// Render criteria for a specific profile
function renderProfileCriteria(profile) {
    const criteriaContainer = document.getElementById(profile.id + '-criteria');
    if (!criteriaContainer) return;
    
    if (profile.criteria.length === 0) {
        criteriaContainer.innerHTML = '<div class="empty-criteria">No scoring criteria defined yet. Click "Add Criterion" to get started.</div>';
        return;
    }
    
    let html = '';
    profile.criteria.forEach(criterion => {
        html += createCriterionHTML(criterion, profile.id);
    });
    
    criteriaContainer.innerHTML = html;
    
    // Set up criterion actions
    setupCriterionActions(profile.id);
}

// Create HTML for a criterion
function createCriterionHTML(criterion, profileId) {
    const conditionsHTML = criterion.conditions.map(condition => {
        return createConditionHTML(condition);
    }).join('');
    
    // Check if this criterion is part of a group with same name (for "some conditions" logic)
    const profile = AppState.workflow.scoringProfiles.find(p => p.id === profileId);
    const sameName = profile ? profile.criteria.filter(c => c.name === criterion.name).length > 1 : false;
    
    const conditionText = sameName ? 'some conditions are' : 'all conditions are';
    
    return `
        <div class="criterion-card" data-criterion="${criterion.id}">
            <div class="criterion-header">
                <div class="criterion-info">
                    <h3 class="criterion-title">${criterion.name}</h3>
                    <p class="criterion-points">${criterion.points} point will be added if ${conditionText} satisfied</p>
                </div>
                <div class="criterion-actions">
                    <button class="btn-text criterion-edit" data-criterion="${criterion.id}" data-profile="${profileId}">Edit</button>
                    <button class="btn-text criterion-delete" data-criterion="${criterion.id}" data-profile="${profileId}">Delete</button>
                </div>
            </div>
            <div class="criterion-conditions">
                ${conditionsHTML}
            </div>
        </div>
    `;
}

// Create HTML for a condition
function createConditionHTML(condition) {
    const conditionText = formatConditionText(condition);
    return `
        <span class="condition-item">${conditionText.field}</span>
        <span class="condition-operator">${conditionText.operator}</span>
        <span class="condition-item condition-value">${conditionText.value}</span>
    `;
}

// Format condition text for display
function formatConditionText(condition) {
    switch (condition.type) {
        case 'document_text_contains':
            return {
                field: 'Document Text',
                operator: 'contains',
                value: condition.value
            };
        case 'document_type_is':
            return {
                field: 'Document Type',
                operator: 'is',
                value: condition.value
            };
        case 'field_is_found':
            return {
                field: condition.field || 'Field',
                operator: 'is found',
                value: ''
            };
        case 'field_has_answer':
            return {
                field: condition.field || 'Field',
                operator: 'has answer',
                value: condition.value
            };
        case 'field_has_value':
            return {
                field: condition.field || 'Field',
                operator: 'has value',
                value: condition.value
            };
        default:
            return {
                field: condition.field || 'Unknown',
                operator: condition.type || 'unknown',
                value: condition.value || ''
            };
    }
}

// Set up profile actions (rename, delete)
function setupProfileActions() {
    document.querySelectorAll('.profile-rename').forEach(btn => {
        btn.addEventListener('click', function() {
            const profileId = this.dataset.profile;
            renameProfile(profileId);
        });
    });
    
    document.querySelectorAll('.profile-delete').forEach(btn => {
        btn.addEventListener('click', function() {
            const profileId = this.dataset.profile;
            deleteProfile(profileId);
        });
    });
}

// Set up criterion actions (edit, delete, add)
function setupCriterionActions(profileId) {
    // Add criterion button
    const addCriterionBtn = document.querySelector(`[data-profile="${profileId}"].btn-add-criterion`);
    if (addCriterionBtn) {
        addCriterionBtn.addEventListener('click', function() {
            addNewCriterion(profileId);
        });
    }
    
    // Edit criterion buttons
    document.querySelectorAll(`[data-profile="${profileId}"].criterion-edit`).forEach(btn => {
        btn.addEventListener('click', function() {
            const criterionId = this.dataset.criterion;
            editCriterion(profileId, criterionId);
        });
    });
    
    // Delete criterion buttons
    document.querySelectorAll(`[data-profile="${profileId}"].criterion-delete`).forEach(btn => {
        btn.addEventListener('click', function() {
            const criterionId = this.dataset.criterion;
            deleteCriterion(profileId, criterionId);
        });
    });
}

// Add new scoring profile
function addNewScoringProfile() {
    const profileCount = AppState.workflow.scoringProfiles.length;
    const newProfileId = 'profile' + String.fromCharCode(65 + profileCount); // A, B, C, etc.
    
    const newProfile = {
        id: newProfileId,
        name: `Scoring Profile ${String.fromCharCode(65 + profileCount)}`,
        criteria: []
    };
    
    AppState.workflow.scoringProfiles.push(newProfile);
    
    // Add new tab
    const profileTabs = document.getElementById('profile-tabs');
    const newTab = document.createElement('button');
    newTab.className = 'profile-tab';
    newTab.dataset.profile = newProfileId;
    newTab.textContent = newProfile.name;
    newTab.addEventListener('click', function() {
        switchScoringProfile(newProfileId);
    });
    profileTabs.appendChild(newTab);
    
    alert('New scoring profile added successfully!');
}

// Add new criterion
function addNewCriterion(profileId) {
    const profile = AppState.workflow.scoringProfiles.find(p => p.id === profileId);
    if (!profile) return;
    
    const criterionCount = profile.criteria.length;
    const newCriterion = {
        id: 'criterion' + String.fromCharCode(65 + criterionCount),
        name: `Scoring Criterion ${String.fromCharCode(65 + criterionCount)}`,
        points: 1,
        conditions: [
            { type: 'document_text_contains', value: 'new condition' }
        ]
    };
    
    profile.criteria.push(newCriterion);
    renderProfileCriteria(profile);
}

// Rename profile
function renameProfile(profileId) {
    const profile = AppState.workflow.scoringProfiles.find(p => p.id === profileId);
    if (!profile) return;
    
    const newName = prompt('Enter new profile name:', profile.name);
    if (newName && newName.trim()) {
        profile.name = newName.trim();
        
        // Update tab text
        const tab = document.querySelector(`[data-profile="${profileId}"]`);
        if (tab) {
            tab.textContent = profile.name;
        }
        
        // Update profile title
        const title = document.querySelector(`#${profileId}-content .profile-title`);
        if (title) {
            title.textContent = profile.name;
        }
    }
}

// Delete profile
function deleteProfile(profileId) {
    if (AppState.workflow.scoringProfiles.length <= 1) {
        alert('Cannot delete the last scoring profile. At least one profile is required.');
        return;
    }
    
    if (confirm('Are you sure you want to delete this scoring profile?')) {
        AppState.workflow.scoringProfiles = AppState.workflow.scoringProfiles.filter(p => p.id !== profileId);
        
        // Remove tab and content
        const tab = document.querySelector(`[data-profile="${profileId}"]`);
        const content = document.getElementById(profileId + '-content');
        
        if (tab) tab.remove();
        if (content) content.remove();
        
        // Switch to first available profile
        if (AppState.workflow.scoringProfiles.length > 0) {
            switchScoringProfile(AppState.workflow.scoringProfiles[0].id);
        }
    }
}

// Edit criterion
function editCriterion(profileId, criterionId) {
    alert('Criterion editing would open a modal or inline editor here.');
}

// Delete criterion
function deleteCriterion(profileId, criterionId) {
    if (confirm('Are you sure you want to delete this criterion?')) {
        const profile = AppState.workflow.scoringProfiles.find(p => p.id === profileId);
        if (profile) {
            profile.criteria = profile.criteria.filter(c => c.id !== criterionId);
            renderProfileCriteria(profile);
        }
    }
}

// Validate Step 4 form
function validateStep4Form() {
    // ✅ FIX: Scoring is now optional - always allow proceeding to Step 5
    // Users can skip scoring criteria if they don't need them
    console.log('✅ Step 4 validation: Scoring is optional, allowing proceed');
    return true;
}

// Initialize Create Workflow Step 5 page functionality
function initializeCreateWorkflowStep5Page() {
    // Navigation buttons
    const backButton = document.querySelector('.workflow-step5-back');
    const saveButton = document.querySelector('.workflow-step5-save');
    
    if (backButton) {
        backButton.addEventListener('click', function() {
            switchPage('create-workflow-step4');
        });
    }
    
    if (saveButton) {
        saveButton.addEventListener('click', function() {
            saveWorkflow();
        });
    }
    
    // Workflow name editing
    const nameInput = document.getElementById('review-workflow-name');
    const nameCountSpan = document.getElementById('review-name-count');
    
    if (nameInput) {
        nameInput.addEventListener('input', function() {
            AppState.workflow.name = this.value;
            if (nameCountSpan) {
                nameCountSpan.textContent = this.value.length;
            }
        });
    }
    
    // Edit buttons
    const editFieldsBtn = document.getElementById('edit-fields-btn');
    const editScoringBtn = document.getElementById('edit-scoring-btn');
    const editDescriptionBtn = document.getElementById('edit-description-btn');
    const editDocumentTypesBtn = document.getElementById('edit-document-types-btn');
    
    if (editFieldsBtn) {
        editFieldsBtn.addEventListener('click', function() {
            switchPage('create-workflow-step2');
        });
    }
    
    if (editScoringBtn) {
        editScoringBtn.addEventListener('click', function() {
            switchPage('create-workflow-step4');
        });
    }
    
    if (editDescriptionBtn) {
        editDescriptionBtn.addEventListener('click', function() {
            switchPage('create-workflow-step3');
        });
    }
    
    if (editDocumentTypesBtn) {
        editDocumentTypesBtn.addEventListener('click', function() {
            switchPage('create-workflow-step3');
        });
    }
}

// Render workflow review data
function renderWorkflowReview() {
    console.log('🎯 Rendering workflow review, AppState:', AppState.workflow);

    // ✅ FIX: Sync scoring data from new system to AppState before rendering
    syncScoringDataToAppState();

    renderWorkflowNameReview();
    renderFieldsReview();
    renderScoringReview();
    renderDescriptionReview();
    renderDocumentTypesReview();
}

// Render workflow name in review
function renderWorkflowNameReview() {
    const nameInput = document.getElementById('review-workflow-name');
    const nameCountSpan = document.getElementById('review-name-count');
    
    console.log('📝 Rendering workflow name:', AppState.workflow.name);
    
    if (nameInput) {
        nameInput.value = AppState.workflow.name || '';
        if (nameCountSpan) {
            nameCountSpan.textContent = nameInput.value.length;
        }
        console.log('✅ Name input populated with:', nameInput.value);
    } else {
        console.error('❌ Name input element not found!');
    }
}

// Field categorization mapping
const fieldCategories = {
    'Basic Information': [
        'Title',
        'Parties', 
        'Date',
        'Employee Name',
        'Employer',
        'Start Date',
        'Guarantor'
    ],
    'Term and Termination': [
        'Term and Renewal',
        'Does the agreement auto renew?',
        'Can the agreement be terminated for convenience?',
        'Initial Term',
        'Commencement Date (Short Form)',
        'Commencement Date (Long Form)',
        'Expiration Date — Lease',
        'Renewal — Lease'
    ],
    'Boilerplate Provisions': [
        'Can the agreement be assigned?',
        'What are the obligations and requirements resulting from a Change of Control?',
        'Exclusivity',
        'Non-Compete',
        'Non-Solicit',
        'Most Favored Nation',
        'Can notice be given electronically?',
        'Governing Law',
        'Notice'
    ],
    'Compensation': [
        'Base Salary',
        'Bonus',
        'Equity/Stock Options',
        'Benefits',
        'Severance'
    ],
    'Restrictive Covenants': [
        'Non-Competition',
        'Non-Solicitation',
        'Confidentiality',
        'Intellectual Property Assignment'
    ],
    'Confidentiality': [
        'Definition of Confidential Information',
        'Permitted Use',
        'Non-Disclosure Obligations',
        'Return of Confidential Information',
        'Duration of Confidentiality',
        'Exceptions to Confidentiality',
        'Residual Knowledge',
        'No License Grant'
    ],
    'Property Basics/Information': [
        'Premises Type',
        'Address of Premises',
        'Square Footage of Premises'
    ],
    'Use of Property': [
        'Use of Premises',
        'Parking',
        'Description of Premises',
        'Utilities'
    ],
    'Rent and Expenses': [
        'Base Rent',
        'Additional Rent',
        'Rent Payment Date',
        'Late Payment and Grace Period',
        'Security Deposit/Letters of Credit',
        '"Operating Expenses"/"Common Area Maintenance" Definition'
    ]
};

// Render fields review
function renderFieldsReview() {
    const fieldsContainer = document.getElementById('fields-review');
    console.log('📋 renderFieldsReview called, container found:', !!fieldsContainer);
    if (!fieldsContainer) return;
    
    // Check if we have fields from template (object format)
    if (AppState.workflow.fields && typeof AppState.workflow.fields === 'object' && !Array.isArray(AppState.workflow.fields)) {
        console.log('✅ Found template fields:', Object.keys(AppState.workflow.fields));
        // Template-based fields with categories
        let html = '';

        Object.entries(AppState.workflow.fields).forEach(([category, fields]) => {
            if (fields && fields.length > 0) {
                console.log(`  - ${category}: ${fields.length} fields`);
                html += `
                    <div class="field-category-section">
                        <h4 class="field-category-title">${category}</h4>
                        <ul class="field-list-simple">
                            ${fields.map(field => `<li>${typeof field === 'object' ? field.name : field}</li>`).join('')}
                        </ul>
                    </div>
                `;
            }
        });
        
        if (html === '') {
            html = '<p style="color: #6b7280; font-style: italic;">No fields selected yet.</p>';
        }
        
        fieldsContainer.innerHTML = html;
        console.log('✅ Fields HTML set, length:', html.length);
    } else if (AppState.workflow.fields && Array.isArray(AppState.workflow.fields)) {
        // Array-based fields from template
        const fields = AppState.workflow.fields;
        if (fields.length === 0) {
            fieldsContainer.innerHTML = '<p style="color: #6b7280; font-style: italic;">No fields selected yet.</p>';
            return;
        }

        let html = `
            <div class="field-category-section">
                <h4 class="field-category-title">Selected Fields</h4>
                <ul class="field-list-simple">
                    ${fields.map(field => `<li>${typeof field === 'object' ? field.name : field}</li>`).join('')}
                </ul>
            </div>
        `;

        fieldsContainer.innerHTML = html;
    } else {
        // ✅ FIX: Check fieldGroups first, then fall back to selectedFields
        const hasFieldGroups = Object.keys(AppState.workflow.fieldGroups).length > 0;
        const selectedFields = hasFieldGroups
            ? getAllFieldNamesFromGroups()
            : Array.from(AppState.workflow.selectedFields);

        if (selectedFields.length === 0) {
            fieldsContainer.innerHTML = '<p style="color: #6b7280; font-style: italic;">No fields selected yet.</p>';
            return;
        }
        
        // Categorize selected fields
        const categorizedFields = {};
        
        // Initialize categories
        Object.keys(fieldCategories).forEach(category => {
            categorizedFields[category] = [];
        });
        
        // Add uncategorized fields category
        categorizedFields['Other'] = [];
        
        // Categorize each selected field
        selectedFields.forEach(field => {
            let categorized = false;
            
            for (const [category, categoryFields] of Object.entries(fieldCategories)) {
                if (categoryFields.includes(field)) {
                    categorizedFields[category].push(field);
                    categorized = true;
                    break;
                }
            }
            
            if (!categorized) {
                categorizedFields['Other'].push(field);
            }
        });
        
        // Generate HTML
        let html = '';
        Object.entries(categorizedFields).forEach(([category, fields]) => {
            if (fields.length > 0) {
                html += `
                    <div class="field-category-section">
                        <h4 class="field-category-title">${category}</h4>
                        <ul class="field-list-simple">
                            ${fields.map(field => `<li>${typeof field === 'object' ? field.name : field}</li>`).join('')}
                        </ul>
                    </div>
                `;
            }
        });

        fieldsContainer.innerHTML = html;
    }
}

// Render scoring review
function renderScoringReview() {
    const scoringContainer = document.getElementById('scoring-review');
    if (!scoringContainer) return;

    // ✅ FIX: Add logging to debug scoring data
    console.log('🎯 renderScoringReview called');
    console.log('   scoringProfiles:', AppState.workflow.scoringProfiles);
    console.log('   isArray:', Array.isArray(AppState.workflow.scoringProfiles));
    console.log('   type:', typeof AppState.workflow.scoringProfiles);
    if (Array.isArray(AppState.workflow.scoringProfiles)) {
        console.log('   array length:', AppState.workflow.scoringProfiles.length);
        console.log('   first profile:', AppState.workflow.scoringProfiles[0]);
    }

    // Check if we have scoring profiles from template (object format)
    if (AppState.workflow.scoringProfiles && typeof AppState.workflow.scoringProfiles === 'object' && !Array.isArray(AppState.workflow.scoringProfiles)) {
        let html = '';
        
        Object.entries(AppState.workflow.scoringProfiles).forEach(([profileName, profileData]) => {
            html += `<div class="scoring-profile-section">`;
            html += `<h4 class="scoring-profile-title">${profileName}</h4>`;
            html += `<div class="scoring-criteria-list">`;
            
            // Handle different data structures within profiles
            if (typeof profileData === 'object') {
                Object.entries(profileData).forEach(([fieldName, criteria]) => {
                    if (Array.isArray(criteria)) {
                        // Handle array of criteria (Assignment Restrictions, etc.)
                        criteria.forEach(criterion => {
                            html += `
                                <div class="scoring-criterion-item">
                                    <span class="criterion-field-name">${fieldName}</span>
                                    <span class="criterion-condition">
                                        <span class="condition-text">has answer</span>
                                        <span class="condition-answer">${criterion.answer}</span>
                                    </span>
                                    <span class="criterion-points-badge">${criterion.points} point</span>
                                </div>
                            `;
                        });
                    } else if (criteria.points !== undefined) {
                        // Handle simple criteria (Due Diligence Scoring)
                        html += `
                            <div class="scoring-criterion-item">
                                <span class="criterion-field-name">${fieldName}</span>
                                <span class="criterion-condition">
                                    <span class="condition-text">${criteria.condition || 'is found'}</span>
                                </span>
                                <span class="criterion-points-badge">${criteria.points} point</span>
                            </div>
                        `;
                    }
                });
            }
            
            html += `</div>`;
            html += `</div>`;
        });
        
        if (html === '') {
            html = '<p style="color: #6b7280; font-style: italic;">No scoring criteria defined yet.</p>';
        }
        
        scoringContainer.innerHTML = html;
    } else if (Array.isArray(AppState.workflow.scoringProfiles)) {
        // Handle array-based scoring profiles (original format)
        if (AppState.workflow.scoringProfiles.length === 0) {
            scoringContainer.innerHTML = '<p style="color: #6b7280; font-style: italic;">No scoring profiles defined yet.</p>';
            return;
        }
        
        let html = '';
        AppState.workflow.scoringProfiles.forEach(profile => {
            if (profile.criteria && profile.criteria.length > 0) {
                html += `
                    <div class="scoring-profile-review">
                        <div class="profile-name-review">${profile.name}</div>
                        ${profile.criteria.map(criterion => {
                            const conditionsHTML = criterion.conditions.map(condition => {
                                const conditionText = formatConditionText(condition);
                                return `
                                    <span class="condition-chip">${conditionText.field}</span>
                                    <span class="condition-operator">${conditionText.operator}</span>
                                    <span class="condition-chip condition-value">${conditionText.value}</span>
                                `;
                            }).join('');
                            
                            return `
                                <div class="scoring-criterion-review">
                                    <div class="criterion-name-review">${criterion.name}</div>
                                    <div class="criterion-points-review">${criterion.points} point${criterion.points !== 1 ? 's' : ''} will be added if all conditions are satisfied</div>
                                    <div class="criterion-conditions-review">
                                        ${conditionsHTML}
                                    </div>
                                </div>
                            `;
                        }).join('')}
                    </div>
                `;
            }
        });
        
        if (html === '') {
            html = '<p style="color: #6b7280; font-style: italic;">No scoring criteria defined yet.</p>';
        }
        
        scoringContainer.innerHTML = html;
    } else {
        scoringContainer.innerHTML = '<p style="color: #6b7280; font-style: italic;">No scoring criteria defined yet.</p>';
    }
}

// Render description review
function renderDescriptionReview() {
    const descriptionElement = document.getElementById('review-description-text');
    if (descriptionElement) {
        // ✅ FIX: Use actual data instead of hardcoded fallback
        const description = AppState.workflow.description || 'No description provided.';
        descriptionElement.textContent = description;
    }
}

// Render document types review
function renderDocumentTypesReview() {
    const documentTypesContainer = document.getElementById('document-types-review');
    if (!documentTypesContainer) {
        console.warn('⚠️ document-types-review element not found in DOM');
        return;
    }

    console.log('📄 Rendering document types:', {
        count: AppState.workflow.documentTypes.size,
        types: Array.from(AppState.workflow.documentTypes)
    });

    if (AppState.workflow.documentTypes.size === 0) {
        documentTypesContainer.innerHTML = '<p style="color: #6b7280; font-style: italic;">No document types selected.</p>';
        return;
    }

    const types = Array.from(AppState.workflow.documentTypes);
    const html = types.map(type => `<span class="doc-type-chip-review">${type}</span>`).join('');
    documentTypesContainer.innerHTML = html;
    console.log('✅ Document types rendered successfully');
}

// Save workflow functionality
async function saveWorkflow() {
    // Validate all required fields
    if (!AppState.workflow.name || AppState.workflow.name.trim() === '') {
        alert('Please enter a workflow name.');
        return;
    }

    // ✅ FIX: Check both selectedFields AND fieldGroups for field validation
    const hasFields = AppState.workflow.selectedFields.size > 0 || getTotalSelectedFields() > 0;
    if (!hasFields) {
        alert('Please select at least one field for your workflow.');
        return;
    }
    
    if (AppState.workflow.documentTypes.size === 0) {
        alert('Please select at least one document type for your workflow.');
        return;
    }
    
    try {
        const isEditMode = AppState.workflow.isEditMode;
        console.log('Saving workflow...', {
            name: AppState.workflow.name,
            isFromTemplate: AppState.workflow.isFromTemplate,
            isEditMode: isEditMode,
            workflowId: workflowAPI.workflowId
        });

        // For template-based workflows, the backend already has the data
        // We just need to send the name (which might have been edited) and save
        if (AppState.workflow.isFromTemplate || isEditMode) {
            // Check if workflowAPI has a workflowId
            if (!workflowAPI.workflowId) {
                console.error('No workflow ID available for template/edit workflow');
                alert('Error: Workflow session lost. Please try again.');
                return;
            }
            // Send the workflow name (in case it was edited)
            await workflowAPI.setWorkflowName(AppState.workflow.name);

            // For edit mode, also update other fields if they were modified
            if (isEditMode) {
                await workflowAPI.setWorkflowFields(AppState.workflow.selectedFields);
                await workflowAPI.setWorkflowDetails(
                    AppState.workflow.description,
                    AppState.workflow.documentTypes
                );
                await workflowAPI.setWorkflowScoring(AppState.workflow.scoringProfiles);
            }
        } else {
            // For manually created workflows, send all workflow data to backend in sequence
            // Step 1: Name
            await workflowAPI.setWorkflowName(AppState.workflow.name);

            // Step 2: Fields
            await workflowAPI.setWorkflowFields(AppState.workflow.selectedFields);

            // Step 3: Details
            await workflowAPI.setWorkflowDetails(
                AppState.workflow.description,
                AppState.workflow.documentTypes
            );

            // Step 4: Scoring
            await workflowAPI.setWorkflowScoring(AppState.workflow.scoringProfiles);
        }

        // Step 5: Review and save
        const result = await workflowAPI.saveWorkflow();

        const workflowSummary = {
            name: AppState.workflow.name,
            description: AppState.workflow.description || '',
            fieldsCount: AppState.workflow.selectedFields.size,
            documentTypesCount: AppState.workflow.documentTypes.size,
            scoringProfilesCount: Array.isArray(AppState.workflow.scoringProfiles)
                ? AppState.workflow.scoringProfiles.filter(p => p.criteria && p.criteria.length > 0).length
                : 0
        };

        // Success message based on mode
        const successMessage = isEditMode ? 'Workflow updated successfully' : 'Workflow saved successfully';
        console.log(successMessage, workflowSummary);
        
        // Reset workflow state
        AppState.workflow = {
            name: '',
            description: '',
            selectedFields: new Set(),
            documentTypes: new Set(),
            scoringProfiles: [],
            activeProfile: 'profileA',
            isEditMode: false,
            editWorkflowId: null
        };

        // Return to workflows page
        switchPage('workflows');
        
    } catch (error) {
        alert('Error saving workflow. Please try again.');
        console.error('Error:', error);
    }
}

// Function to edit a saved workflow
async function editWorkflow(workflowId) {
    try {
        console.log('Starting edit workflow:', workflowId);

        // Create edit session via API
        const result = await workflowAPI.createEditSession(workflowId);

        if (result.success && result.sessionId) {
            // Set edit mode flag
            AppState.workflow.isEditMode = true;
            AppState.workflow.editWorkflowId = workflowId;

            // Navigate to step 5 with session ID and edit mode
            window.location.href = `/create-workflow-step5?sessionId=${result.sessionId}&mode=edit`;
        } else {
            throw new Error('Failed to create edit session');
        }
    } catch (error) {
        console.error('Error starting edit:', error);
        alert('Failed to load workflow for editing. Please try again.');
    }
}

// Function to load workflow data for editing
async function loadWorkflowForEdit(sessionId) {
    try {
        console.log('Loading workflow session for editing:', sessionId);

        // Load workflow session data via API
        const workflow = await workflowAPI.loadWorkflowSession(sessionId);

        if (!workflow) {
            throw new Error('Failed to load workflow data');
        }

        console.log('Loaded workflow data:', workflow);

        // Set edit mode flags
        AppState.workflow.isEditMode = true;
        AppState.workflow.editWorkflowId = workflow.id || workflow.workflowId;

        // Pre-populate AppState with workflow data
        AppState.workflow.name = workflow.name || '';
        AppState.workflow.description = workflow.description || '';

        // Handle fields - preserve grouped structure for Step 2 rendering
        if (workflow.fields) {
            if (Array.isArray(workflow.fields)) {
                // Simple array of fields
                AppState.workflow.selectedFields = new Set(workflow.fields);
                AppState.workflow.fieldGroups = {}; // No groups
            } else if (typeof workflow.fields === 'object') {
                // ✅ FIX: Preserve the grouped structure for Step 2 rendering
                AppState.workflow.fieldGroups = workflow.fields;

                // Also flatten for selectedFields (for validation compatibility)
                const allFields = [];
                for (const category in workflow.fields) {
                    if (Array.isArray(workflow.fields[category])) {
                        allFields.push(...workflow.fields[category]);
                    }
                }
                AppState.workflow.selectedFields = new Set(allFields);
            }
        } else {
            AppState.workflow.selectedFields = new Set();
            AppState.workflow.fieldGroups = {};
        }

        // Handle document types - convert array to Set
        if (workflow.documentTypes) {
            AppState.workflow.documentTypes = new Set(Array.isArray(workflow.documentTypes) ? workflow.documentTypes : []);
        } else {
            AppState.workflow.documentTypes = new Set();
        }

        // Handle scoring profiles
        if (workflow.scoringProfiles) {
            AppState.workflow.scoringProfiles = Array.isArray(workflow.scoringProfiles) ? workflow.scoringProfiles : [];
        } else {
            AppState.workflow.scoringProfiles = [];
        }

        console.log('AppState populated for editing:', {
            name: AppState.workflow.name,
            fieldsCount: AppState.workflow.selectedFields.size,
            documentTypesCount: AppState.workflow.documentTypes.size,
            scoringProfilesCount: AppState.workflow.scoringProfiles.length
        });

        // Render the workflow review page with loaded data
        renderWorkflowReview();

        // Update UI to show edit mode
        updateUIForEditMode();

    } catch (error) {
        console.error('Error loading workflow for edit:', error);
        alert('Failed to load workflow data. Please try again.');
    }
}

// Update UI elements to show we're in edit mode
function updateUIForEditMode() {
    // Update the save button text
    const saveButton = document.getElementById('save-workflow-btn');
    if (saveButton) {
        saveButton.textContent = 'Update Workflow';
    }

    // Optionally add an indicator that we're editing
    const step5Page = document.getElementById('create-workflow-step5-page');
    if (step5Page) {
        const titleElement = step5Page.querySelector('h1, h2');
        if (titleElement && !titleElement.textContent.includes('Edit')) {
            titleElement.textContent = 'Edit Workflow - Review & Save';
        }
    }
}

// Function to delete a saved workflow
async function deleteWorkflow(workflowId) {
    try {
        const response = await fetch(`/api/workflows/saved/${workflowId}`, {
            method: 'DELETE',
            headers: getAuthHeaders()
        });

        if (!response.ok) {
            if (response.status === 401) {
                alert('Authentication required. Please log in and try again.');
                // Optionally redirect to login
                // window.location.href = '/login.html';
                return false;
            }
            throw new Error('Failed to delete workflow');
        }

        const result = await response.json();
        console.log('Workflow deleted:', result);
        return true;
    } catch (error) {
        console.error('Error deleting workflow:', error);
        alert('Failed to delete workflow. Please try again.');
        return false;
    }
}

// Function to delete all workflows
async function deleteAllWorkflows() {
    if (!confirm('Are you sure you want to delete ALL workflows? This action cannot be undone.')) {
        return;
    }

    try {
        const response = await fetch('/api/workflows/saved/all', {
            method: 'DELETE',
            headers: getAuthHeaders()
        });

        if (!response.ok) {
            if (response.status === 401) {
                alert('Authentication required. Please log in and try again.');
                return false;
            }
            throw new Error('Failed to delete all workflows');
        }

        const result = await response.json();
        console.log('All workflows deleted:', result);

        // Reload the workflow list
        loadYourWorkflows();

        // Show success message
        if (result.count > 0) {
            showMessage(`Successfully deleted ${result.count} workflow${result.count === 1 ? '' : 's'}`, 'success');
        }

        return true;
    } catch (error) {
        console.error('Error deleting all workflows:', error);
        alert('Failed to delete all workflows. Please try again.');
        return false;
    }
}

// Function to load and display saved workflows
async function loadYourWorkflows() {
    const container = document.getElementById('your-workflows-container');
    if (!container) return;

    try {
        const response = await fetch('/api/workflows/saved', {
            headers: getAuthHeaders()
        });
        if (!response.ok) {
            throw new Error('Failed to load workflows');
        }
        
        const workflows = await response.json();

        // Show/hide delete-all button based on workflow count
        const deleteAllBtn = document.getElementById('delete-all-workflows-btn');
        if (deleteAllBtn) {
            deleteAllBtn.style.display = workflows.length > 0 ? 'flex' : 'none';
        }

        if (workflows.length === 0) {
            container.innerHTML = `
                <div class="empty-workflows-state" style="text-align: center; padding: 60px 20px; color: #6b7280;">
                    <span class="material-icons" style="font-size: 64px; color: #d1d5db;">folder_open</span>
                    <h3 style="margin: 16px 0 8px 0; color: #374151;">No workflows yet</h3>
                    <p style="margin: 0 0 24px 0;">Create your first workflow using "Create Workflow" or copy from the Workflow Library</p>
                </div>
            `;
        } else {
            container.innerHTML = workflows.map(workflow => {
                // Calculate field count from fields object
                let fieldCount = 0;
                let fieldsHtml = '';
                if (workflow.fields) {
                    if (typeof workflow.fields === 'object' && !Array.isArray(workflow.fields)) {
                        // Fields are categorized
                        Object.entries(workflow.fields).forEach(([category, fields]) => {
                            fieldCount += fields.length;
                            fieldsHtml += `
                                <div class="field-category">
                                    <div class="category-header">${category} (${fields.length})</div>
                                    <div class="field-chips">
                                        ${fields.map(field => `<span class="field-chip">${typeof field === 'object' ? field.name : field}</span>`).join('')}
                                    </div>
                                </div>
                            `;
                        });
                    } else if (Array.isArray(workflow.fields)) {
                        fieldCount = workflow.fields.length;
                        fieldsHtml = `
                            <div class="field-chips">
                                ${workflow.fields.map(field => `<span class="field-chip">${typeof field === 'object' ? field.name : field}</span>`).join('')}
                            </div>
                        `;
                    }
                } else if (workflow.fieldCount) {
                    fieldCount = workflow.fieldCount;
                }
                
                // Generate document types HTML
                const docTypesHtml = workflow.documentTypes && workflow.documentTypes.length > 0 
                    ? workflow.documentTypes.map(type => `<span class="tag-chip">${type}</span>`).join('')
                    : '<span style="color: #6b7280;">No document types specified</span>';
                
                return `
                    <div class="workflow-card workflow-card-item">
                        <div class="workflow-header">
                            <button class="expand-toggle-saved">
                                <span class="material-icons">keyboard_arrow_down</span>
                            </button>
                            <h3 class="workflow-title">${workflow.name}</h3>
                            <div class="workflow-actions">
                                <button class="btn-outline btn-delete-workflow" data-workflow-id="${workflow.id}">Delete</button>
                                <button class="btn-outline btn-edit-workflow" data-workflow-id="${workflow.id}">Edit</button>
                            </div>
                        </div>
                        <div class="workflow-description">
                            ${workflow.description || 'No description provided'}
                        </div>
                        ${workflow.documentTypes && workflow.documentTypes.length > 0 ? `
                        <div class="workflow-recommended">
                            <span class="recommended-label">Recommended for use on:</span>
                            <div class="recommended-tags">
                                ${docTypesHtml}
                            </div>
                        </div>` : ''}
                        <div class="workflow-fields">
                            <div class="fields-details" style="display: none;">
                                ${fieldsHtml || '<p style="color: #6b7280; padding: 10px;">No fields defined</p>'}
                            </div>
                        </div>
                    </div>
                `;
            }).join('');
            
            // Add event handlers for delete buttons
            document.querySelectorAll('.btn-delete-workflow').forEach(btn => {
                btn.addEventListener('click', async function() {
                    const workflowId = this.dataset.workflowId;
                    if (confirm('Are you sure you want to delete this workflow?')) {
                        await deleteWorkflow(workflowId);
                        loadYourWorkflows(); // Reload the list
                    }
                });
            });
            
            // Add event handlers for edit buttons
            document.querySelectorAll('.btn-edit-workflow').forEach(btn => {
                btn.addEventListener('click', async function() {
                    const workflowId = this.dataset.workflowId;
                    await editWorkflow(workflowId);
                });
            });
            
            // Add event handlers for expand toggle at the top of the card
            document.querySelectorAll('.expand-toggle-saved').forEach(btn => {
                btn.addEventListener('click', function(e) {
                    e.stopPropagation();
                    const card = this.closest('.workflow-card');
                    const fieldsDetails = card.querySelector('.fields-details');
                    const expandIcon = this.querySelector('.material-icons');
                    const workflowCard = this.closest('.workflow-card-item');
                    
                    if (fieldsDetails && (fieldsDetails.style.display === 'none' || !fieldsDetails.style.display)) {
                        // Show the fields
                        fieldsDetails.style.display = 'block';
                        fieldsDetails.style.maxHeight = 'none';  // Override CSS max-height
                        fieldsDetails.style.overflow = 'visible';  // Override CSS overflow
                        expandIcon.textContent = 'keyboard_arrow_up';
                        if (workflowCard) {
                            workflowCard.classList.add('expanded');
                        }
                    } else if (fieldsDetails) {
                        // Hide the fields
                        fieldsDetails.style.display = 'none';
                        expandIcon.textContent = 'keyboard_arrow_down';
                        if (workflowCard) {
                            workflowCard.classList.remove('expanded');
                        }
                    }
                });
            });
        }
    } catch (error) {
        console.error('Error loading workflows:', error);
        container.innerHTML = `
            <div style="text-align: center; padding: 40px; color: #dc2626;">
                <p>Error loading workflows. Please refresh the page.</p>
            </div>
        `;
    }
}

// Update page switching to handle Step 5 review rendering
const originalSwitchPage = switchPage;
switchPage = function(pageId) {
    originalSwitchPage(pageId);
    
    // If switching to workflows page, load saved workflows
    if (pageId === 'workflows' || pageId === '/workflows') {
        loadYourWorkflows();
        
        // Also switch to "Your Workflows" tab
        const yourWorkflowsTab = document.querySelector('.tab[data-tab="your-workflows"]');
        const workflowLibraryTab = document.querySelector('.tab[data-tab="workflow-library"]');
        const yourWorkflowsContent = document.getElementById('your-workflows');
        const workflowLibraryContent = document.getElementById('workflow-library');
        
        if (yourWorkflowsTab && workflowLibraryTab && yourWorkflowsContent && workflowLibraryContent) {
            // Switch active tab
            workflowLibraryTab.classList.remove('active');
            yourWorkflowsTab.classList.add('active');
            
            // Switch content visibility
            workflowLibraryContent.style.display = 'none';
            yourWorkflowsContent.style.display = 'block';
        }
    }
    
    // ✅ FIX: If switching to Step 4, initialize new scoring system (check multiple path formats)
    if (pageId === '#create-workflow-step4' ||
        pageId === 'create-workflow-step4' ||
        pageId === '/create-workflow-step4') {
        console.log('🎨 Wrapper detected Step 4 navigation, initializing new scoring system');
        setTimeout(() => {
            // Use new scoring system instead of old rendering
            if (window.ScoringUI) {
                window.ScoringUI.refresh();
                console.log('✅ Wrapper: New scoring system refreshed');
            } else {
                console.warn('⚠️ Wrapper: New scoring system not available');
            }
        }, 100);
    }
    
    // ✅ FIX: If switching to Step 5, render the review data (check multiple path formats)
    if (pageId === '#create-workflow-step5' ||
        pageId === 'create-workflow-step5' ||
        pageId === '/create-workflow-step5') {
        console.log('🎨 Wrapper detected Step 5 navigation, will render review data');
        setTimeout(() => {
            console.log('⏰ Wrapper timeout reached, calling renderWorkflowReview');
            renderWorkflowReview();
        }, 100);
    }
};

// Render scoring profiles for Step 4 when coming from template
// ❌ OLD SYSTEM - Commented out - now using new scoring system (scoring-ui.js)
/* function renderStep4ScoringProfiles() {
    // ✅ FIX: Initialize empty array if undefined
    if (!AppState.workflow.scoringProfiles) {
        AppState.workflow.scoringProfiles = [];
    }

    // ✅ FIX: If no profiles exist, create one empty profile for user to start with
    if (AppState.workflow.scoringProfiles.length === 0) {
        AppState.workflow.scoringProfiles = [{
            id: 'profile' + Date.now(),
            name: 'Scoring Profile 1',
            criteria: []
        }];
        console.log('🎯 Created initial empty scoring profile');
    }

    // Clear existing tabs and content
    const tabsContainer = document.querySelector('.profile-tabs');
    // ✅ FIX: Correct DOM selector to match HTML class name
    const contentContainer = document.querySelector('.profile-content-area');

    if (!tabsContainer || !contentContainer) {
        console.warn('⚠️ Could not find scoring containers:', {
            tabsContainer: !!tabsContainer,
            contentContainer: !!contentContainer
        });
        return;
    }

    // Generate tabs and content for each profile
    let tabsHtml = '';
    let contentHtml = '';

    AppState.workflow.scoringProfiles.forEach((profile, index) => {
        const isActive = index === 0;

        // Create tab
        tabsHtml += `
            <button class="profile-tab ${isActive ? 'active' : ''}" data-profile="${profile.id}">
                ${profile.name}
            </button>
        `;

        // Create content area
        contentHtml += `
            <div class="profile-content ${isActive ? 'active' : ''}" id="${profile.id}-content" style="display: ${isActive ? 'block' : 'none'};">
                <div class="profile-header">
                    <input type="text" class="profile-name-input" value="${profile.name}" data-profile-id="${profile.id}">
                    <button class="btn-text delete-profile-btn" data-profile-id="${profile.id}">Delete Profile</button>
                </div>
                <div class="criteria-container" id="${profile.id}-criteria"></div>
                <button class="btn-outline add-criterion-btn" data-profile-id="${profile.id}">
                    <span class="material-icons">add</span>
                    Add Criterion
                </button>
            </div>
        `;
    });

    // Add the "Add Profile" button to tabs
    tabsHtml += `<button class="profile-tab add-tab" id="add-profile-btn">+</button>`;

    // Update DOM
    tabsContainer.innerHTML = tabsHtml;
    contentContainer.innerHTML = contentHtml;

    // Re-attach event listeners
    document.querySelectorAll('.profile-tab').forEach(tab => {
        tab.addEventListener('click', function() {
            const profileId = this.dataset.profile;
            if (profileId) {
                switchScoringProfile(profileId);
            }
        });
    });

    document.getElementById('add-profile-btn')?.addEventListener('click', addNewScoringProfile);

    // Render criteria for each profile
    AppState.workflow.scoringProfiles.forEach(profile => {
        renderProfileCriteria(profile);
    });

    // Set active profile
    if (AppState.workflow.scoringProfiles.length > 0) {
        AppState.workflow.activeProfile = AppState.workflow.scoringProfiles[0].id;
    }
} */

// Update Step 2 navigation when page loads
document.addEventListener('DOMContentLoaded', function() {
    setTimeout(() => {
        updateStep2Navigation();
    }, 100);
});

// Populate workflow state from template
function populateWorkflowFromTemplate(templateData) {
    // Clear existing workflow state
    AppState.workflow = {
        name: templateData.workflowName,
        description: templateData.description,
        selectedFields: new Set(templateData.fields),
        documentTypes: new Set(templateData.documentTypes),
        scoringProfiles: JSON.parse(JSON.stringify(templateData.scoringProfiles)), // Deep copy
        activeProfile: 'profileA'
    };
    
    console.log('Template populated:', templateData.name);
    console.log('Workflow state:', AppState.workflow);
}

// Update Step 2 navigation when page loads
document.addEventListener('DOMContentLoaded', function() {
    setTimeout(() => {
        updateStep2Navigation();
    }, 100);
});

// Add event listener for delete-all workflows button
document.addEventListener('DOMContentLoaded', function() {
    const deleteAllBtn = document.getElementById('delete-all-workflows-btn');
    if (deleteAllBtn) {
        deleteAllBtn.addEventListener('click', deleteAllWorkflows);
    }
});

// Prevent all actual navigation (safety measure)
document.addEventListener('click', function(e) {
    const link = e.target.closest('a[href]');
    if (link && link.getAttribute('href').startsWith('http')) {
        e.preventDefault();
        console.log('External navigation blocked');
    }
});