/**
 * Scoring Event Handlers
 * Handles all user interactions for the scoring system
 */

window.ScoringEvents = {
    /**
     * Initialize all event listeners
     */
    initialize() {
        document.addEventListener('click', this.handleClick.bind(this));
        document.addEventListener('change', this.handleChange.bind(this));
        document.addEventListener('input', this.handleInput.bind(this));
    },

    /**
     * Handle all click events
     */
    handleClick(e) {
        const target = e.target.closest('button');
        if (!target) return;

        // Profile tab click
        if (target.classList.contains('profile-tab')) {
            e.preventDefault();
            this.handleProfileTabClick(target);
        }

        // Add profile
        if (target.id === 'add-profile-btn' || target.classList.contains('btn-add-profile')) {
            e.preventDefault();
            this.handleAddProfile();
        }

        // Profile rename
        if (target.classList.contains('profile-rename')) {
            e.preventDefault();
            this.handleProfileRename(target);
        }

        // Profile delete
        if (target.classList.contains('profile-delete')) {
            e.preventDefault();
            this.handleProfileDelete(target);
        }

        // Add criterion
        if (target.classList.contains('btn-add-criterion')) {
            e.preventDefault();
            this.handleAddCriterion(target);
        }

        // Criterion expand/collapse
        if (target.classList.contains('criterion-expand-btn')) {
            e.preventDefault();
            this.handleCriterionToggle(target);
        }

        // Criterion edit
        if (target.classList.contains('btn-criterion-edit')) {
            e.preventDefault();
            this.handleCriterionEdit(target);
        }

        // Criterion save
        if (target.classList.contains('btn-criterion-save')) {
            e.preventDefault();
            this.handleCriterionSave(target);
        }

        // Criterion cancel
        if (target.classList.contains('btn-criterion-cancel')) {
            e.preventDefault();
            this.handleCriterionCancel(target);
        }

        // Criterion delete
        if (target.classList.contains('btn-criterion-delete')) {
            e.preventDefault();
            this.handleCriterionDelete(target);
        }

        // Add filter button
        if (target.classList.contains('btn-add-filter')) {
            e.preventDefault();
            this.handleShowFilterBuilder(target);
        }

        // Filter builder cancel
        if (target.classList.contains('btn-filter-cancel')) {
            e.preventDefault();
            this.handleFilterBuilderCancel(target);
        }

        // Filter builder add
        if (target.classList.contains('btn-filter-add')) {
            e.preventDefault();
            this.handleFilterAdd(target);
        }

        // Filter chip remove
        if (target.classList.contains('filter-chip-remove')) {
            e.preventDefault();
            this.handleFilterRemove(target);
        }
    },

    /**
     * Handle all change events
     */
    handleChange(e) {
        const target = e.target;

        // Filter type selection
        if (target.classList.contains('filter-type-select')) {
            this.handleFilterTypeChange(target);
        }

        // Extraction condition change (for field type)
        if (target.classList.contains('filter-extraction-condition')) {
            this.handleExtractionConditionChange(target);
        }

        // Any input that affects filter validation
        if (target.closest('.filter-builder')) {
            this.validateFilterBuilder(target.closest('.filter-builder'));
        }
    },

    /**
     * Handle all input events
     */
    handleInput(e) {
        const target = e.target;

        // Filter builder inputs
        if (target.closest('.filter-builder')) {
            this.validateFilterBuilder(target.closest('.filter-builder'));
        }
    },

    /**
     * Profile tab click
     */
    handleProfileTabClick(button) {
        const profileId = button.dataset.profileId;
        window.ScoringData.setActiveProfile(profileId);
        window.ScoringUI.refresh();
    },

    /**
     * Add new profile
     */
    handleAddProfile() {
        const name = prompt('Enter profile name:');
        if (name && name.trim()) {
            window.ScoringData.addProfile(name.trim());
            window.ScoringUI.refresh();
        }
    },

    /**
     * Rename profile
     */
    handleProfileRename(button) {
        const profileId = button.dataset.profileId;
        const profile = window.ScoringData.getAllProfiles().find(p => p.id === profileId);
        if (!profile) return;

        const newName = prompt('Enter new profile name:', profile.name);
        if (newName && newName.trim()) {
            window.ScoringData.updateProfile(profileId, { name: newName.trim() });
            window.ScoringUI.refresh();
        }
    },

    /**
     * Delete profile
     */
    handleProfileDelete(button) {
        const profileId = button.dataset.profileId;
        const profile = window.ScoringData.getAllProfiles().find(p => p.id === profileId);
        if (!profile) return;

        if (confirm(`Are you sure you want to delete "${profile.name}"?`)) {
            if (!window.ScoringData.deleteProfile(profileId)) {
                alert('You must have at least one profile');
            } else {
                window.ScoringUI.refresh();
            }
        }
    },

    /**
     * Add new criterion
     */
    handleAddCriterion(button) {
        const profileId = button.dataset.profileId;
        window.ScoringData.addCriterion(profileId, {
            name: 'New Criterion',
            points: 1,
            matchCondition: 'all',
            isEditing: true
        });
        window.ScoringUI.renderProfileContent(profileId);
    },

    /**
     * Toggle criterion expand/collapse
     */
    handleCriterionToggle(button) {
        const profileId = button.dataset.profileId;
        const criterionId = button.dataset.criterionId;
        const criterion = window.ScoringData.getCriterion(profileId, criterionId);
        if (!criterion) return;

        window.ScoringData.updateCriterion(profileId, criterionId, {
            isExpanded: !criterion.isExpanded
        });
        window.ScoringUI.renderProfileContent(profileId);
    },

    /**
     * Edit criterion
     */
    handleCriterionEdit(button) {
        const profileId = button.dataset.profileId;
        const criterionId = button.dataset.criterionId;

        window.ScoringData.updateCriterion(profileId, criterionId, { isEditing: true });
        window.ScoringUI.renderProfileContent(profileId);
    },

    /**
     * Save criterion
     */
    handleCriterionSave(button) {
        const profileId = button.dataset.profileId;
        const criterionId = button.dataset.criterionId;

        const card = button.closest('.criterion-card');
        const nameInput = card.querySelector('.criterion-name-input');
        const pointsSelect = card.querySelector('.criterion-points-select');
        const matchSelect = card.querySelector('.criterion-match-select');
        const descriptionTextarea = card.querySelector('.criterion-description-textarea');

        const name = nameInput.value.trim();
        if (!name) {
            alert('Criterion name is required');
            return;
        }

        window.ScoringData.updateCriterion(profileId, criterionId, {
            name,
            points: parseInt(pointsSelect.value),
            matchCondition: matchSelect.value,
            description: descriptionTextarea ? descriptionTextarea.value.trim() : '',
            isEditing: false
        });

        window.ScoringUI.renderProfileContent(profileId);
    },

    /**
     * Cancel criterion editing
     */
    handleCriterionCancel(button) {
        const profileId = button.dataset.profileId;
        const criterionId = button.dataset.criterionId;

        const criterion = window.ScoringData.getCriterion(profileId, criterionId);
        if (!criterion) return;

        // If this was a new criterion (no name set yet), delete it
        if (criterion.name === 'New Criterion' && criterion.filters.length === 0) {
            window.ScoringData.deleteCriterion(profileId, criterionId);
        } else {
            window.ScoringData.updateCriterion(profileId, criterionId, { isEditing: false });
        }

        window.ScoringUI.renderProfileContent(profileId);
    },

    /**
     * Delete criterion
     */
    handleCriterionDelete(button) {
        const profileId = button.dataset.profileId;
        const criterionId = button.dataset.criterionId;
        const criterion = window.ScoringData.getCriterion(profileId, criterionId);

        if (!criterion) return;

        if (confirm(`Are you sure you want to delete "${criterion.name}"?`)) {
            window.ScoringData.deleteCriterion(profileId, criterionId);
            window.ScoringUI.renderProfileContent(profileId);
        }
    },

    /**
     * Show filter builder
     */
    handleShowFilterBuilder(button) {
        const profileId = button.dataset.profileId;
        const criterionId = button.dataset.criterionId;

        window.ScoringData.updateCriterion(profileId, criterionId, { showFilterBuilder: true });
        window.ScoringUI.renderProfileContent(profileId);
    },

    /**
     * Cancel filter builder
     */
    handleFilterBuilderCancel(button) {
        const profileId = button.dataset.profileId;
        const criterionId = button.dataset.criterionId;

        window.ScoringData.updateCriterion(profileId, criterionId, { showFilterBuilder: false });
        window.ScoringUI.renderProfileContent(profileId);
    },

    /**
     * Handle filter type change
     */
    handleFilterTypeChange(select) {
        const filterType = select.value;
        const builder = select.closest('.filter-builder');

        const column2 = builder.querySelector('.filter-column-2');
        const column3 = builder.querySelector('.filter-column-3');
        const column4 = builder.querySelector('.filter-column-4');

        window.ScoringUI.updateFilterBuilderColumns(filterType, column2, column3, column4);

        // Add event listener for extraction condition if it's a field type
        if (filterType === 'field') {
            const extractionSelect = column3.querySelector('.filter-extraction-condition');
            if (extractionSelect) {
                extractionSelect.addEventListener('change', (e) => {
                    window.ScoringUI.updateExtractionCondition(e.target.value, column4);
                    this.validateFilterBuilder(builder);
                });
            }
        }

        this.validateFilterBuilder(builder);
    },

    /**
     * Handle extraction condition change
     */
    handleExtractionConditionChange(select) {
        const builder = select.closest('.filter-builder');
        const column4 = builder.querySelector('.filter-column-4');
        window.ScoringUI.updateExtractionCondition(select.value, column4);
        this.validateFilterBuilder(builder);
    },

    /**
     * Add filter
     */
    handleFilterAdd(button) {
        const profileId = button.dataset.profileId;
        const criterionId = button.dataset.criterionId;

        const builder = button.closest('.filter-builder');
        const filterData = this.collectFilterData(builder);

        if (!filterData) {
            alert('Please fill in all required fields');
            return;
        }

        window.ScoringData.addFilter(profileId, criterionId, filterData);
        window.ScoringData.updateCriterion(profileId, criterionId, { showFilterBuilder: false });
        window.ScoringUI.renderProfileContent(profileId);
    },

    /**
     * Remove filter
     */
    handleFilterRemove(button) {
        const profileId = button.dataset.profileId;
        const criterionId = button.dataset.criterionId;
        const filterId = button.dataset.filterId;

        window.ScoringData.removeFilter(profileId, criterionId, filterId);
        window.ScoringUI.renderProfileContent(profileId);
    },

    /**
     * Collect filter data from builder
     */
    collectFilterData(builder) {
        const typeSelect = builder.querySelector('.filter-type-select');
        const filterType = typeSelect.value;

        if (!filterType) return null;

        const data = { type: filterType };

        switch (filterType) {
            case 'documentText':
            case 'filePath':
            case 'fileName':
            case 'language':
                const textCondition = builder.querySelector('.filter-text-condition');
                const textValue = builder.querySelector('.filter-text-value');
                data.textCondition = textCondition.value;
                data.textValue = textValue.value;
                break;

            case 'field':
                const fieldName = builder.querySelector('.filter-field-name');
                const extractionCondition = builder.querySelector('.filter-extraction-condition');
                const fieldValue = builder.querySelector('.filter-field-value');
                data.fieldName = fieldName.value;
                data.extractionCondition = extractionCondition.value;
                data.fieldValue = fieldValue ? fieldValue.value : '';
                break;

            case 'uploadedDate':
                const dateCondition = builder.querySelector('.filter-date-condition');
                const dateValue = builder.querySelector('.filter-date-value');
                data.dateCondition = dateCondition.value;
                data.dateValue = dateValue.value;
                break;

            case 'documentType':
                const documentCondition = builder.querySelector('.filter-document-condition');
                const documentType = builder.querySelector('.filter-document-type');
                data.documentCondition = documentCondition.value;
                data.documentType = documentType.value;
                break;
        }

        return window.ScoringData.validateFilterData(filterType, data) ? data : null;
    },

    /**
     * Validate filter builder and enable/disable add button
     */
    validateFilterBuilder(builder) {
        const addButton = builder.querySelector('.btn-filter-add');
        if (!addButton) return;

        const data = this.collectFilterData(builder);
        addButton.disabled = !data;
    }
};

// Initialize when DOM is ready
document.addEventListener('DOMContentLoaded', () => {
    window.ScoringData.initialize();
    window.ScoringEvents.initialize();
    // DON'T call refresh on page load - wait for Step 4 to show
    // window.ScoringUI.refresh();
    console.log('✅ Scoring system loaded (will initialize when Step 4 shown)');
});
