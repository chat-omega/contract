/**
 * Scoring UI Rendering
 * Handles all DOM manipulation for the scoring system
 */

window.ScoringUI = {
    /**
     * Render all profile tabs
     */
    renderProfileTabs() {
        const tabsContainer = document.getElementById('profile-tabs');
        if (!tabsContainer) {
            console.error('❌ profile-tabs element not found!');
            return;
        }

        const profiles = window.ScoringData.getAllProfiles();
        const activeProfileId = window.ScoringData.getState().activeProfileId;
        console.log(`📋 Rendering ${profiles.length} profile tabs`);

        tabsContainer.innerHTML = profiles.map(profile => `
            <button class="profile-tab ${profile.id === activeProfileId ? 'active' : ''}"
                    data-profile-id="${profile.id}">
                ${this.escapeHtml(profile.name)}
            </button>
        `).join('');
    },

    /**
     * Render all profile content areas
     */
    renderAllProfiles() {
        const container = document.querySelector('.profile-content-area');
        if (!container) {
            console.error('❌ profile-content-area not found!');
            return;
        }

        const profiles = window.ScoringData.getAllProfiles();
        const activeProfileId = window.ScoringData.getState().activeProfileId;
        console.log(`📋 Rendering ${profiles.length} profiles content`);

        profiles.forEach(profile => {
            const contentDiv = document.getElementById(`${profile.id}-content`);
            if (contentDiv) {
                contentDiv.classList.toggle('active', profile.id === activeProfileId);
                this.renderProfileContent(profile.id);
            } else {
                // Create content div if it doesn't exist
                this.createProfileContentDiv(profile);
            }
        });
    },

    /**
     * Create a new profile content div
     */
    createProfileContentDiv(profile) {
        const contentArea = document.querySelector('.profile-content-area');
        if (!contentArea) return;

        const activeProfileId = window.ScoringData.getState().activeProfileId;
        const div = document.createElement('div');
        div.className = `profile-content ${profile.id === activeProfileId ? 'active' : ''}`;
        div.id = `${profile.id}-content`;

        div.innerHTML = `
            <div class="profile-title-section">
                <h2 class="profile-title">${this.escapeHtml(profile.name)}</h2>
                <div class="profile-actions">
                    <button class="btn-text profile-rename" data-profile-id="${profile.id}">Rename</button>
                    <button class="btn-text profile-delete" data-profile-id="${profile.id}">Delete</button>
                </div>
            </div>

            <div class="criteria-list" id="${profile.id}-criteria">
                <!-- Criteria will be rendered here -->
            </div>

            <button class="btn-add-criterion" data-profile-id="${profile.id}">
                <span class="material-icons">add</span>
                Add Criterion
            </button>
        `;

        contentArea.appendChild(div);
        this.renderProfileContent(profile.id);
    },

    /**
     * Render criteria for a specific profile
     */
    renderProfileContent(profileId) {
        const profile = window.ScoringData.getAllProfiles().find(p => p.id === profileId);
        if (!profile) return;

        const criteriaContainer = document.getElementById(`${profileId}-criteria`);
        if (!criteriaContainer) return;

        if (profile.criteria.length === 0) {
            criteriaContainer.innerHTML = `
                <div class="empty-criteria-state">
                    <p>No scoring criteria added yet.</p>
                    <p>Click "Add Criterion" to create your first criterion.</p>
                </div>
            `;
            return;
        }

        criteriaContainer.innerHTML = profile.criteria.map(criterion =>
            this.renderCriterionCard(profileId, criterion)
        ).join('');
    },

    /**
     * Render a single criterion card
     */
    renderCriterionCard(profileId, criterion) {
        const isEditing = criterion.isEditing;
        const isExpanded = criterion.isExpanded !== false; // Default to expanded
        const filterCount = criterion.filters.length;
        const summary = `${criterion.points} ${criterion.points === 1 ? 'point' : 'points'} • ${criterion.matchCondition.toUpperCase()} • ${filterCount} ${filterCount === 1 ? 'filter' : 'filters'}`;

        return `
            <div class="criterion-card ${isExpanded ? 'expanded' : 'collapsed'}"
                 data-criterion-id="${criterion.id}">
                <div class="criterion-header">
                    <button class="criterion-expand-btn"
                            data-profile-id="${profileId}"
                            data-criterion-id="${criterion.id}">
                        <span class="material-icons">
                            ${isExpanded ? 'expand_more' : 'chevron_right'}
                        </span>
                    </button>

                    ${isExpanded && isEditing ? `
                        <div class="criterion-info">
                            <input type="text"
                                   class="criterion-name-input"
                                   data-profile-id="${profileId}"
                                   data-criterion-id="${criterion.id}"
                                   value="${this.escapeHtml(criterion.name)}"
                                   placeholder="Criterion name...">

                            <select class="criterion-select criterion-points-select"
                                    data-profile-id="${profileId}"
                                    data-criterion-id="${criterion.id}">
                                ${window.ScoringData.POINTS_OPTIONS.map(points => `
                                    <option value="${points}" ${criterion.points === points ? 'selected' : ''}>
                                        ${points} ${points === 1 ? 'point' : 'points'}
                                    </option>
                                `).join('')}
                            </select>

                            <select class="criterion-select criterion-match-select"
                                    data-profile-id="${profileId}"
                                    data-criterion-id="${criterion.id}">
                                <option value="all" ${criterion.matchCondition === 'all' ? 'selected' : ''}>ALL</option>
                                <option value="some" ${criterion.matchCondition === 'some' ? 'selected' : ''}>SOME</option>
                            </select>
                        </div>

                        <div class="criterion-actions">
                            <button class="criterion-action-btn btn-criterion-save"
                                    data-profile-id="${profileId}"
                                    data-criterion-id="${criterion.id}">
                                <span class="material-icons">check</span>
                                Save
                            </button>
                            <button class="criterion-action-btn btn-criterion-cancel"
                                    data-profile-id="${profileId}"
                                    data-criterion-id="${criterion.id}">
                                <span class="material-icons">close</span>
                                Cancel
                            </button>
                        </div>
                    ` : `
                        <div class="criterion-info">
                            <div class="criterion-name-display">
                                ${this.escapeHtml(criterion.name)}
                                ${!isExpanded ? `<div class="criterion-summary">${summary}</div>` : ''}
                            </div>
                        </div>

                        ${isExpanded ? `
                            <div class="criterion-actions">
                                <button class="criterion-action-btn btn-criterion-edit"
                                        data-profile-id="${profileId}"
                                        data-criterion-id="${criterion.id}">
                                    <span class="material-icons">edit</span>
                                </button>
                                <button class="criterion-action-btn btn-criterion-delete"
                                        data-profile-id="${profileId}"
                                        data-criterion-id="${criterion.id}">
                                    <span class="material-icons">delete</span>
                                </button>
                            </div>
                        ` : ''}
                    `}
                </div>

                ${isExpanded ? `
                    <div class="criterion-body">
                        ${isEditing ? `
                            <div class="criterion-description">
                                <label>Description (optional)</label>
                                <textarea class="criterion-description-textarea"
                                          data-profile-id="${profileId}"
                                          data-criterion-id="${criterion.id}"
                                          placeholder="Add a description for this criterion..."
                                          rows="2">${this.escapeHtml(criterion.description || '')}</textarea>
                            </div>
                        ` : criterion.description ? `
                            <div class="criterion-description-display">
                                ${this.escapeHtml(criterion.description)}
                            </div>
                        ` : ''}

                        <div class="filters-section">
                            <div class="filters-section-header">
                                <h4>Filters (${criterion.filters.length})</h4>
                                ${!criterion.showFilterBuilder ? `
                                    <button class="btn-add-filter"
                                            data-profile-id="${profileId}"
                                            data-criterion-id="${criterion.id}">
                                        <span class="material-icons">add</span>
                                        Add Filter
                                    </button>
                                ` : ''}
                            </div>

                            ${criterion.showFilterBuilder ? this.renderFilterBuilder(profileId, criterion.id) : ''}

                            ${criterion.filters.length > 0 ? `
                                <div class="filter-chips-container">
                                    ${criterion.filters.map(filter => this.renderFilterChip(profileId, criterion.id, filter)).join('')}
                                </div>
                            ` : !criterion.showFilterBuilder ? `
                                <div class="no-filters-message">
                                    No filters added yet. Click "Add Filter" to create one.
                                </div>
                            ` : ''}
                        </div>

                        ${!isEditing ? `
                            <div class="criterion-summary-info">
                                <div class="summary-info-item">
                                    <span class="summary-info-label">Points:</span>
                                    <span class="summary-info-value">${criterion.points}</span>
                                </div>
                                <div class="summary-info-item">
                                    <span class="summary-info-label">Match Condition:</span>
                                    <span class="summary-info-value">${criterion.matchCondition.toUpperCase()}</span>
                                </div>
                            </div>
                        ` : ''}
                    </div>
                ` : ''}
            </div>
        `;
    },

    /**
     * Render filter builder
     */
    renderFilterBuilder(profileId, criterionId) {
        return `
            <div class="filter-builder" data-criterion-id="${criterionId}">
                <div class="filter-builder-grid">
                    <div class="filter-input-group">
                        <select class="filter-select filter-type-select"
                                data-profile-id="${profileId}"
                                data-criterion-id="${criterionId}">
                            <option value="">Select filter type...</option>
                            ${window.ScoringData.FILTER_TYPES.map(type => `
                                <option value="${type.value}">${type.label}</option>
                            `).join('')}
                        </select>
                    </div>
                    <div class="filter-input-group filter-column-2"></div>
                    <div class="filter-input-group filter-column-3"></div>
                    <div class="filter-input-group filter-column-4"></div>
                </div>

                <div class="filter-builder-actions">
                    <button class="btn-filter-cancel"
                            data-profile-id="${profileId}"
                            data-criterion-id="${criterionId}">
                        Cancel
                    </button>
                    <button class="btn-filter-add"
                            data-profile-id="${profileId}"
                            data-criterion-id="${criterionId}"
                            disabled>
                        Add
                    </button>
                </div>
            </div>
        `;
    },

    /**
     * Render filter chip
     */
    renderFilterChip(profileId, criterionId, filter) {
        const displayText = window.ScoringData.getFilterDisplayText(filter);
        return `
            <div class="filter-chip" data-filter-id="${filter.id}">
                <span class="filter-chip-text">${this.escapeHtml(displayText)}</span>
                <button class="filter-chip-remove"
                        data-profile-id="${profileId}"
                        data-criterion-id="${criterionId}"
                        data-filter-id="${filter.id}">
                    <span class="material-icons">close</span>
                </button>
            </div>
        `;
    },

    /**
     * Update filter builder columns based on selected filter type
     */
    updateFilterBuilderColumns(filterType, column2, column3, column4) {
        const state = {
            textCondition: 'contains',
            fieldName: window.ScoringData.getAvailableFieldNames()[0],
            extractionCondition: 'is found',
            dateCondition: 'is',
            documentCondition: 'is',
            documentType: window.ScoringData.DOCUMENT_TYPES[0]
        };

        switch (filterType) {
            case 'documentText':
            case 'filePath':
            case 'fileName':
            case 'language':
                column2.innerHTML = `
                    <select class="filter-select filter-text-condition">
                        <option value="contains">contains</option>
                        <option value="does not contain">does not contain</option>
                    </select>
                `;
                column3.innerHTML = `
                    <input type="text" class="filter-input filter-text-value" placeholder="Enter text...">
                `;
                column4.innerHTML = '';
                break;

            case 'field':
                column2.innerHTML = `
                    <select class="filter-select filter-field-name">
                        ${window.ScoringData.getAvailableFieldNames().map(name => `
                            <option value="${this.escapeHtml(name)}">${this.escapeHtml(name)}</option>
                        `).join('')}
                    </select>
                `;
                column3.innerHTML = `
                    <select class="filter-select filter-extraction-condition">
                        <option value="extraction contains">extraction contains</option>
                        <option value="extraction does not contain">extraction does not contain</option>
                        <option value="is found" selected>is found</option>
                        <option value="is not found">is not found</option>
                    </select>
                `;
                column4.innerHTML = ''; // Will be populated if needed
                break;

            case 'uploadedDate':
                column2.innerHTML = `
                    <select class="filter-select filter-date-condition">
                        <option value="is">is</option>
                        <option value="is before">is before</option>
                        <option value="is after">is after</option>
                        <option value="is on or before">is on or before</option>
                        <option value="is on or after">is on or after</option>
                    </select>
                `;
                column3.innerHTML = `
                    <input type="date" class="filter-date-input filter-date-value">
                `;
                column4.innerHTML = '';
                break;

            case 'documentType':
                column2.innerHTML = `
                    <select class="filter-select filter-document-condition">
                        <option value="is">is</option>
                        <option value="is not">is not</option>
                    </select>
                `;
                column3.innerHTML = `
                    <select class="filter-select filter-document-type">
                        ${window.ScoringData.DOCUMENT_TYPES.map(type => `
                            <option value="${this.escapeHtml(type)}">${this.escapeHtml(type)}</option>
                        `).join('')}
                    </select>
                `;
                column4.innerHTML = '';
                break;

            default:
                column2.innerHTML = '';
                column3.innerHTML = '';
                column4.innerHTML = '';
        }
    },

    /**
     * Update extraction condition (for field type)
     */
    updateExtractionCondition(extractionCondition, column4) {
        if (extractionCondition === 'extraction contains' || extractionCondition === 'extraction does not contain') {
            column4.innerHTML = `
                <input type="text" class="filter-input filter-field-value" placeholder="Enter text...">
            `;
        } else {
            column4.innerHTML = '';
        }
    },

    /**
     * HTML escape utility
     */
    escapeHtml(text) {
        const div = document.createElement('div');
        div.textContent = text;
        return div.innerHTML;
    },

    /**
     * Complete UI refresh
     */
    refresh() {
        this.renderProfileTabs();
        this.renderAllProfiles();
    }
};
