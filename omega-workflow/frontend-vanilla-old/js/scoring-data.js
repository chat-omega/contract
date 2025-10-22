/**
 * Scoring Data Management
 * Handles in-memory state for scoring profiles, criteria, and filters
 */

// Constants
const DOCUMENT_TYPES = [
    'NDA',
    'Purchase Agreement',
    'Employment Agreement',
    'Service Agreement',
    'License Agreement',
    'Lease Agreement',
    'Partnership Agreement',
    'Consulting Agreement',
    'Sales Agreement',
    'Settlement Agreement'
];

// Dynamic function to get available field names from AppState
function getAvailableFieldNames() {
    // Try to get from AppState first (fields selected in Step 2)
    if (window.AppState && window.AppState.workflow && window.AppState.workflow.selectedFields) {
        const fields = Array.from(window.AppState.workflow.selectedFields);
        if (fields.length > 0) {
            return fields.sort(); // Sort alphabetically for better UX
        }
    }

    // Fallback to default fields if no AppState available
    return [
        '40 Act Assignment',
        'Absence of Certain Change',
        'Absence of Litigation',
        'Date',
        'Parties',
        'Representation',
        'Title'
    ].sort();
}

const POINTS_OPTIONS = [1, 2, 3, 4, 5, 10, 15, 20, 25, 50, 100];

const FILTER_TYPES = [
    { value: 'documentText', label: 'Document Text' },
    { value: 'field', label: 'Field' },
    { value: 'uploadedDate', label: 'Uploaded Date' },
    { value: 'documentType', label: 'Document Type' },
    { value: 'filePath', label: 'File Path' },
    { value: 'language', label: 'Language' },
    { value: 'fileName', label: 'File Name' }
];

// State
const scoringState = {
    profiles: [
        {
            id: 'profile-1',
            name: 'Scoring Profile A',
            criteria: []
        }
    ],
    activeProfileId: 'profile-1'
};

// Initialize from localStorage
function initializeScoringData() {
    const stored = localStorage.getItem('omegaScoringData');
    if (stored) {
        try {
            const data = JSON.parse(stored);
            scoringState.profiles = data.profiles || scoringState.profiles;
            scoringState.activeProfileId = data.activeProfileId || scoringState.activeProfileId;
        } catch (e) {
            console.error('Error loading scoring data:', e);
        }
    }
}

// Save to localStorage
function saveScoringData() {
    try {
        localStorage.setItem('omegaScoringData', JSON.stringify({
            profiles: scoringState.profiles,
            activeProfileId: scoringState.activeProfileId
        }));
    } catch (e) {
        console.error('Error saving scoring data:', e);
    }
}

// Profile CRUD operations
function addProfile(name) {
    const newProfile = {
        id: `profile-${Date.now()}`,
        name: name || `Scoring Profile ${scoringState.profiles.length + 1}`,
        criteria: []
    };
    scoringState.profiles.push(newProfile);
    scoringState.activeProfileId = newProfile.id;
    saveScoringData();
    return newProfile;
}

function updateProfile(profileId, updates) {
    const profile = scoringState.profiles.find(p => p.id === profileId);
    if (profile) {
        Object.assign(profile, updates);
        saveScoringData();
    }
    return profile;
}

function deleteProfile(profileId) {
    if (scoringState.profiles.length === 1) {
        console.warn('Cannot delete the last profile');
        return false;
    }

    const index = scoringState.profiles.findIndex(p => p.id === profileId);
    if (index !== -1) {
        scoringState.profiles.splice(index, 1);

        // Update active profile if deleted
        if (scoringState.activeProfileId === profileId) {
            scoringState.activeProfileId = scoringState.profiles[0].id;
        }

        saveScoringData();
        return true;
    }
    return false;
}

function setActiveProfile(profileId) {
    if (scoringState.profiles.find(p => p.id === profileId)) {
        scoringState.activeProfileId = profileId;
        saveScoringData();
        return true;
    }
    return false;
}

function getActiveProfile() {
    return scoringState.profiles.find(p => p.id === scoringState.activeProfileId);
}

function getAllProfiles() {
    return scoringState.profiles;
}

// Criterion CRUD operations
function addCriterion(profileId, criterionData) {
    const profile = scoringState.profiles.find(p => p.id === profileId);
    if (!profile) return null;

    const newCriterion = {
        id: `criterion-${Date.now()}`,
        name: criterionData.name || 'New Criterion',
        points: criterionData.points || 1,
        matchCondition: criterionData.matchCondition || 'all',
        description: criterionData.description || '',
        filters: [],
        isEditing: criterionData.isEditing !== undefined ? criterionData.isEditing : true,
        isExpanded: true
    };

    profile.criteria.push(newCriterion);
    saveScoringData();
    return newCriterion;
}

function updateCriterion(profileId, criterionId, updates) {
    const profile = scoringState.profiles.find(p => p.id === profileId);
    if (!profile) return null;

    const criterion = profile.criteria.find(c => c.id === criterionId);
    if (criterion) {
        Object.assign(criterion, updates);
        saveScoringData();
    }
    return criterion;
}

function deleteCriterion(profileId, criterionId) {
    const profile = scoringState.profiles.find(p => p.id === profileId);
    if (!profile) return false;

    const index = profile.criteria.findIndex(c => c.id === criterionId);
    if (index !== -1) {
        profile.criteria.splice(index, 1);
        saveScoringData();
        return true;
    }
    return false;
}

function getCriterion(profileId, criterionId) {
    const profile = scoringState.profiles.find(p => p.id === profileId);
    if (!profile) return null;
    return profile.criteria.find(c => c.id === criterionId);
}

// Filter CRUD operations
function addFilter(profileId, criterionId, filterData) {
    const criterion = getCriterion(profileId, criterionId);
    if (!criterion) return null;

    const newFilter = {
        id: `filter-${Date.now()}`,
        ...filterData
    };

    criterion.filters.push(newFilter);
    saveScoringData();
    return newFilter;
}

function removeFilter(profileId, criterionId, filterId) {
    const criterion = getCriterion(profileId, criterionId);
    if (!criterion) return false;

    const index = criterion.filters.findIndex(f => f.id === filterId);
    if (index !== -1) {
        criterion.filters.splice(index, 1);
        saveScoringData();
        return true;
    }
    return false;
}

// Filter display text generation
function getFilterDisplayText(filter) {
    switch (filter.type) {
        case 'documentText':
            return `Document Text ${filter.textCondition} "${filter.textValue}"`;

        case 'field':
            if (filter.extractionCondition === 'is found' || filter.extractionCondition === 'is not found') {
                return `${filter.fieldName} ${filter.extractionCondition}`;
            }
            return `${filter.fieldName} ${filter.extractionCondition} "${filter.fieldValue}"`;

        case 'uploadedDate':
            return `Uploaded Date ${filter.dateCondition} ${filter.dateValue}`;

        case 'documentType':
            return `Document Type ${filter.documentCondition} ${filter.documentType}`;

        case 'filePath':
            return `File Path ${filter.textCondition} "${filter.textValue}"`;

        case 'fileName':
            return `File Name ${filter.textCondition} "${filter.textValue}"`;

        case 'language':
            return `Language ${filter.textCondition} "${filter.textValue}"`;

        default:
            return 'Unknown filter';
    }
}

// Validation functions
function validateFilterData(filterType, data) {
    switch (filterType) {
        case 'documentText':
        case 'filePath':
        case 'fileName':
        case 'language':
            return !!(data.textCondition && data.textValue && data.textValue.trim());

        case 'field':
            if (data.extractionCondition === 'extraction contains' ||
                data.extractionCondition === 'extraction does not contain') {
                return !!(data.fieldName && data.extractionCondition && data.fieldValue && data.fieldValue.trim());
            }
            return !!(data.fieldName && data.extractionCondition);

        case 'uploadedDate':
            return !!(data.dateCondition && data.dateValue);

        case 'documentType':
            return !!(data.documentCondition && data.documentType);

        default:
            return false;
    }
}

// Set entire state (for template loading)
function setState(newState) {
    if (newState.profiles) {
        scoringState.profiles = newState.profiles;
    }
    if (newState.activeProfileId) {
        scoringState.activeProfileId = newState.activeProfileId;
    }
    saveScoringData();
}

// Load profiles from template and convert format
function loadProfiles(templateProfiles) {
    if (!Array.isArray(templateProfiles) || templateProfiles.length === 0) {
        console.log('No template profiles to load');
        return;
    }

    console.log('Loading template profiles:', templateProfiles);

    // Convert backend template format to new scoring system format
    scoringState.profiles = templateProfiles.map((profile, profileIdx) => {
        // Backend uses 'rules' array, need to group by field for criteria
        const rules = profile.rules || [];

        // Group rules by field to create criteria
        const fieldGroups = {};
        rules.forEach(rule => {
            const fieldKey = rule.fieldName;
            if (!fieldGroups[fieldKey]) {
                fieldGroups[fieldKey] = [];
            }
            fieldGroups[fieldKey].push(rule);
        });

        // Convert field groups to criteria
        const criteria = Object.entries(fieldGroups).map(([fieldName, fieldRules], idx) => {
            // If multiple rules for same field, use OR logic
            const matchCondition = fieldRules.length > 1 ? 'some' : 'all';

            // For grouping name: if only one rule, use field name; if multiple, add description
            const criterionName = fieldRules.length === 1
                ? fieldName
                : profile.name === 'Due Diligence Scoring' ? fieldName :
                  `${fieldName.split(' ')[0]} ${fieldName.split(' ')[1] || ''}`.trim() || fieldName;

            return {
                id: `criterion-${profileIdx}-${idx}`,
                name: criterionName,
                points: fieldRules[0].points || 1,  // All rules in group have same points
                matchCondition: matchCondition,
                description: '',
                filters: fieldRules.map((rule, ruleIdx) => {
                    // Convert rule to filter format
                    if (rule.condition === 'is_found') {
                        // Field existence check
                        return {
                            id: `filter-${profileIdx}-${idx}-${ruleIdx}`,
                            type: 'field',
                            fieldName: rule.fieldName,
                            extractionCondition: 'is found',
                            fieldValue: ''
                        };
                    } else if (rule.answer) {
                        // Field value check (has specific answer)
                        return {
                            id: `filter-${profileIdx}-${idx}-${ruleIdx}`,
                            type: 'field',
                            fieldName: rule.fieldName,
                            extractionCondition: 'extraction contains',
                            fieldValue: rule.answer
                        };
                    }
                    return null;
                }).filter(f => f !== null),
                isEditing: false,
                isExpanded: true
            };
        });

        return {
            id: profile.id || `profile-${profileIdx}`,
            name: profile.name || 'Scoring Profile',
            criteria: criteria
        };
    }));

    // Set first profile as active
    if (scoringState.profiles.length > 0) {
        scoringState.activeProfileId = scoringState.profiles[0].id;
    }

    console.log('Converted profiles:', scoringState.profiles);
    saveScoringData();
}

// Export constants and functions
window.ScoringData = {
    // Constants
    DOCUMENT_TYPES,
    getAvailableFieldNames,
    POINTS_OPTIONS,
    FILTER_TYPES,

    // Initialization
    initialize: initializeScoringData,
    save: saveScoringData,
    setState,
    loadProfiles,

    // Profile operations
    addProfile,
    updateProfile,
    deleteProfile,
    setActiveProfile,
    getActiveProfile,
    getAllProfiles,

    // Criterion operations
    addCriterion,
    updateCriterion,
    deleteCriterion,
    getCriterion,

    // Filter operations
    addFilter,
    removeFilter,
    getFilterDisplayText,

    // Validation
    validateFilterData,

    // State access (read-only)
    getState: () => ({ ...scoringState })
};
