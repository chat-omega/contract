# Workflow Wizard - User Guide

## Table of Contents
1. [Introduction](#introduction)
2. [Getting Started](#getting-started)
3. [Creating a Workflow](#creating-a-workflow)
4. [Managing Workflows](#managing-workflows)
5. [Advanced Features](#advanced-features)
6. [FAQ](#faq)
7. [Troubleshooting](#troubleshooting)

---

## Introduction

### What is the Workflow Wizard?

The Workflow Wizard is a comprehensive 5-step interface that guides you through creating custom document processing workflows. It simplifies the complex task of configuring workflows by breaking it down into manageable steps.

### Key Features

- **Intuitive 5-Step Process**: Easy-to-follow wizard interface
- **Template-Based Creation**: Start from pre-configured templates
- **Advanced Field Selection**: Choose from 1000+ extraction fields
- **Flexible Scoring**: Configure quality scoring profiles
- **Session Persistence**: Your progress is automatically saved
- **Review Before Submit**: Preview your entire workflow before finalizing

### Who Should Use This?

- Business analysts configuring document processing
- Operations teams setting up contract analysis
- Legal professionals creating review workflows
- Finance teams building credit analysis processes

---

## Getting Started

### Accessing the Workflow Wizard

1. **Navigate to Workflows**:
   - Click "Workflows" in the left sidebar
   - Or visit: `http://localhost:8081/workflows`

2. **Start Creating**:
   - Click the "Create New Workflow" button
   - You'll be taken to the wizard interface

### Understanding the Interface

The wizard consists of:
- **Progress Stepper**: Shows current step and overall progress
- **Step Content**: The current step's form and options
- **Navigation Buttons**: Previous, Next, and Save
- **Auto-Save Indicator**: Shows when your work is being saved

---

## Creating a Workflow

### Step 1: Name & Template

**What You'll Do**: Give your workflow a name and optionally select a template

#### Instructions:

1. **Enter Workflow Name** (Required):
   - Enter a descriptive name (e.g., "Credit Agreement Analysis")
   - Must be at least 3 characters
   - Should be unique and meaningful

2. **Select a Template** (Optional):
   - Choose from pre-configured templates:
     - **Blank Workflow**: Start from scratch
     - **Credit Agreement**: Pre-configured for credit analysis
     - **Purchase Agreement**: For purchase order processing
     - **Service Agreement**: For service contract analysis
     - **NDA Analysis**: For non-disclosure agreement review
   - Templates pre-populate fields and settings in later steps

3. **Click Next**: Proceed to field selection

**Tips**:
- Use templates when available to save time
- Template fields can be modified in Step 2
- Clear, descriptive names help with organization

---

### Step 2: Field Selection

**What You'll Do**: Choose which fields to extract from documents

This is the most important step where you define what information will be extracted.

#### Understanding Fields

Each field represents a piece of information that can be extracted from documents:
- **Name**: The field identifier (e.g., "Borrower Name", "Contract Date")
- **Type**: Data type (text, date, number, currency, etc.)
- **Category**: Logical grouping (parties, dates, financial, etc.)
- **Template**: Which templates include this field

#### Search and Filter

1. **Search for Fields**:
   - Type keywords in the search box (e.g., "date", "amount", "party")
   - Search looks in field names and descriptions
   - Results update as you type

2. **Filter by Category**:
   - Click "All Categories" dropdown
   - Select categories like:
     - Parties (borrowers, lenders, guarantors)
     - Dates (effective date, maturity date)
     - Financial (amounts, interest rates, fees)
     - Terms (covenants, conditions, representations)
     - Identification (agreement numbers, references)

3. **Filter by Data Type**:
   - Click "All Types" dropdown
   - Select specific types:
     - Text: Names, descriptions, addresses
     - Date: Effective dates, deadlines
     - Number: Counts, quantities
     - Currency: Dollar amounts, fees
     - Percentage: Interest rates, ratios
     - Boolean: Yes/no fields

#### Selecting Fields

**Method 1: Individual Selection**
- Click the checkbox on any field card
- Selected fields move to the "Selected Fields" panel
- Click again to deselect

**Method 2: Bulk Selection**
- Filter to show desired fields
- Click "Select All Visible" button
- All currently visible fields are selected

#### Managing Selected Fields

The right panel shows your selected fields:
- **Count**: Shows total selected (e.g., "15 fields selected")
- **Search Selected**: Filter your selected fields
- **Remove Individual**: Click X on any field
- **Clear All**: Click "Clear All" to deselect everything
- **Reorder**: Drag fields to change extraction order

#### Tips:

- Start with a template to get common fields
- Use search to find specific fields quickly
- Review selected fields before proceeding
- You can always go back to modify selections
- More fields = longer processing time

#### Example Workflow:

For a **Credit Agreement**:
1. Search for "borrower" - select borrower name and details
2. Search for "lender" - select lender information
3. Filter by "Financial" category - select loan amount, interest rate
4. Filter by "Dates" category - select effective date, maturity date
5. Review selected fields (should have ~15-30 fields)
6. Click Next

---

### Step 3: Workflow Details

**What You'll Do**: Add description and configure basic settings

#### Instructions:

1. **Workflow Description** (Optional):
   - Provide a detailed description of the workflow's purpose
   - Include what types of documents it processes
   - Explain any special considerations
   - This helps team members understand the workflow

2. **Additional Settings** (Future):
   - Processing priority
   - Notification preferences
   - Output format options

3. **Click Next**: Proceed to scoring configuration

**Tips**:
- Good descriptions help with workflow management
- Include document types this workflow handles
- Note any special requirements or limitations

**Example Description**:
```
Credit Agreement Analysis Workflow

Processes credit agreements to extract key terms including parties,
financial terms, dates, and covenants. Used for commercial lending
documentation review. Outputs structured data for risk analysis.

Document Types: Credit Agreements, Loan Agreements, Term Loan Facilities
Expected Fields: 30-40 fields per document
```

---

### Step 4: Scoring Configuration

**What You'll Do**: Configure quality scoring for extracted data

Quality scoring helps assess the accuracy and completeness of extracted information.

#### Understanding Scoring

Scoring analyzes:
- **Field Completeness**: How many fields were extracted
- **Confidence Levels**: How confident the system is in each extraction
- **Data Quality**: Validation and consistency checks
- **Overall Score**: Composite quality score

#### Scoring Options

**Option 1: Disable Scoring**
- Toggle "Enable Quality Scoring" to OFF
- No scoring will be performed
- Faster processing
- Use when quality assessment isn't needed

**Option 2: Select a Scoring Profile**
- Toggle "Enable Quality Scoring" to ON
- Choose from 4 profiles:

1. **Standard Scoring** (Default):
   - Balanced approach
   - Good for most workflows
   - Threshold: 70% (recommended)
   - Flags documents below threshold

2. **Strict Quality Control**:
   - High standards required
   - Best for critical documents
   - Threshold: 85% (recommended)
   - Only accepts high-quality extractions
   - Use for: Legal contracts, financial agreements

3. **Lenient Processing**:
   - More permissive
   - Good for rough drafts or exploratory analysis
   - Threshold: 50% (recommended)
   - Accepts lower quality data
   - Use for: Initial screening, high-volume processing

4. **Custom Configuration**:
   - Set your own thresholds
   - Configure specific criteria
   - Advanced users only
   - Requires understanding of scoring metrics

#### Setting Thresholds

Each profile has a recommended threshold, but you can adjust:
- Move the slider to set minimum acceptable score
- Documents below threshold are flagged for review
- Higher threshold = stricter quality requirements
- Lower threshold = more lenient acceptance

#### Recommendations:

| Document Type | Profile | Threshold |
|---------------|---------|-----------|
| Legal Contracts | Strict | 85% |
| Financial Agreements | Strict | 85% |
| Purchase Orders | Standard | 70% |
| Service Agreements | Standard | 70% |
| Internal Memos | Lenient | 50% |
| Draft Documents | Lenient | 50% |

#### Example Configuration:

For **Credit Agreements**:
- Enable: ON
- Profile: Strict Quality Control
- Threshold: 85%
- Reason: Critical financial data requires high accuracy

---

### Step 5: Review & Submit

**What You'll Do**: Review all settings and create the workflow

This is your final check before creating the workflow.

#### Review Sections

**1. Workflow Information**:
- Name
- Template (if selected)
- Description
- Created date

**2. Selected Fields**:
- Complete list of all fields
- Total count
- Categories represented
- Data types included

**3. Scoring Configuration**:
- Enabled/Disabled status
- Selected profile
- Threshold setting
- Quality requirements

#### Making Changes

If you need to modify anything:
1. Click "Previous" to go back to that step
2. Make your changes
3. Click "Next" to return to review
4. Your changes will be reflected automatically

#### Submitting the Workflow

1. **Review Everything**: Carefully check all settings
2. **Click "Create Workflow"**: Submit the workflow
3. **Confirmation**: You'll see a success message
4. **Redirect**: Automatically redirected to workflows list

#### What Happens Next:

After submission:
- Workflow is saved to the database
- Workflow becomes available for document processing
- You can assign documents to this workflow
- Extraction will use your configured fields
- Scoring will be applied (if enabled)

---

## Managing Workflows

### Viewing Workflows

1. **Navigate to Workflows Page**:
   - Click "Workflows" in sidebar
   - See all your workflows in a list

2. **Workflow List Shows**:
   - Workflow name
   - Template used
   - Number of fields
   - Creation date
   - Last modified date
   - Status (active/inactive)

### Editing a Workflow

1. **Click on a Workflow**: Select from the list
2. **Click "Edit" Button**: Opens the wizard in edit mode
3. **Make Changes**: Modify any step
4. **Save Changes**: Click "Update Workflow" in Step 5

**Note**: Editing a workflow doesn't affect documents already processed.

### Deleting a Workflow

1. **Select Workflow**: Click on the workflow
2. **Click "Delete" Button**: Opens confirmation dialog
3. **Confirm Deletion**: Click "Yes, Delete"
4. **Workflow Removed**: No longer available for processing

**Warning**: Deletion is permanent. Documents processed with this workflow will retain their data, but new documents cannot use this workflow.

### Duplicating a Workflow

To create a similar workflow:
1. **Create New Workflow**: Click "Create New Workflow"
2. **Use Same Template**: Select the same template
3. **Modify as Needed**: Adjust fields and settings
4. **Save with New Name**: Give it a distinct name

---

## Advanced Features

### Session Persistence

Your work is automatically saved as you progress:
- **Auto-Save**: Every change is saved automatically
- **Session Recovery**: Return later to continue where you left off
- **Browser Closure**: Safe to close browser, work is saved
- **Session Timeout**: Sessions expire after 24 hours of inactivity

**Indicators**:
- "Saving..." appears during saves
- "Saved" confirms successful save
- No action needed from you

### Template Customization

After selecting a template:
- All template fields are pre-selected
- You can add additional fields
- You can remove template fields
- Templates are just starting points

### Field Organization

Best practices for organizing fields:
1. **Group by Category**: Keep related fields together
2. **Logical Order**: Order fields as they appear in documents
3. **Priority First**: Put most important fields at the top
4. **Remove Unused**: Don't include fields you won't use

### Bulk Operations

Working with many fields:
- **Select All Visible**: Select all in current view
- **Clear All**: Deselect everything
- **Search Selected**: Find specific selected fields
- **Category Filter**: Work with category groups

---

## FAQ

### General Questions

**Q: How long does it take to create a workflow?**
A: Most workflows take 5-10 minutes. Simple workflows can be created in 2-3 minutes. Complex workflows with many fields might take 15-20 minutes.

**Q: Can I create workflows without a template?**
A: Yes, select "Blank Workflow" as your template and build from scratch.

**Q: How many fields should I select?**
A: It depends on your needs. Most workflows have 15-50 fields. More fields = more comprehensive data but longer processing time.

**Q: Can I edit a workflow after creating it?**
A: Yes, you can edit any workflow at any time from the workflows list.

**Q: Will editing affect existing documents?**
A: No, editing a workflow only affects future document processing.

### Technical Questions

**Q: What happens if I close the browser mid-creation?**
A: Your progress is auto-saved. Return to the create page to resume.

**Q: Can I create multiple workflows with the same name?**
A: It's not recommended, but the system allows it. Use unique names for clarity.

**Q: What's the maximum number of fields?**
A: No hard limit, but we recommend 100 or fewer for performance.

**Q: How do I know which fields to select?**
A: Use templates as a guide, or review sample documents to identify needed fields.

**Q: Can I export/import workflows?**
A: Not currently, but this feature is planned for a future release.

### Scoring Questions

**Q: Should I always enable scoring?**
A: Recommended for important documents, optional for casual processing.

**Q: What does the threshold percentage mean?**
A: Minimum quality score required. Documents below this are flagged for review.

**Q: Can I change the threshold later?**
A: Yes, edit the workflow and modify the scoring configuration.

**Q: What happens to documents that fail scoring?**
A: They're flagged for manual review but data is still extracted.

---

## Troubleshooting

### Common Issues

#### Issue: "Create Workflow" Button Disabled

**Possible Causes**:
- Workflow name too short (needs 3+ characters)
- No fields selected
- Required validation failed

**Solution**:
1. Check workflow name is at least 3 characters
2. Ensure at least 1 field is selected
3. Review validation messages on the page

---

#### Issue: Can't Find a Specific Field

**Possible Causes**:
- Field doesn't exist
- Using wrong search terms
- Field filtered out

**Solution**:
1. Try different search terms
2. Clear all filters and search again
3. Browse by category
4. Check if field is template-specific

---

#### Issue: Too Many Fields to Choose From

**Possible Causes**:
- No filters applied
- Generic search term
- Viewing all 1000+ fields

**Solution**:
1. Use category filters to narrow down
2. Use more specific search terms
3. Start with a template
4. Focus on essential fields first

---

#### Issue: Session Lost / Progress Not Saved

**Possible Causes**:
- Browser cache cleared
- Session expired (24h timeout)
- Network issue during save

**Solution**:
1. Check your internet connection
2. Look for "Saved" confirmation after changes
3. Don't clear browser cache mid-session
4. Create workflow within 24 hours of starting

---

#### Issue: Workflow Not Appearing in List

**Possible Causes**:
- Workflow creation failed
- Page not refreshed
- Filter applied to list

**Solution**:
1. Refresh the workflows page
2. Check for error messages during creation
3. Clear any list filters
4. Verify creation was successful (look for confirmation)

---

### Getting Help

If you encounter issues not covered here:

1. **Check Error Messages**: Read any displayed errors carefully
2. **Refresh the Page**: Sometimes resolves temporary glitches
3. **Clear Browser Cache**: Can fix asset loading issues
4. **Try Different Browser**: Rule out browser-specific issues
5. **Contact Support**: Reach out to your system administrator

### Best Practices

To avoid issues:
- ✅ Use clear, descriptive workflow names
- ✅ Save regularly (although auto-save is active)
- ✅ Review all settings before submitting
- ✅ Start with templates when available
- ✅ Test workflows with sample documents
- ✅ Keep field counts reasonable (under 100)
- ✅ Use appropriate scoring profiles
- ✅ Document your workflow's purpose

---

## Quick Reference

### Workflow Creation Checklist

- [ ] Navigate to Workflows page
- [ ] Click "Create New Workflow"
- [ ] Enter workflow name (3+ characters)
- [ ] Select template (or choose Blank)
- [ ] Click Next
- [ ] Search/filter for needed fields
- [ ] Select all required fields
- [ ] Review selected fields
- [ ] Click Next
- [ ] Add workflow description
- [ ] Click Next
- [ ] Configure scoring (or disable)
- [ ] Set quality threshold
- [ ] Click Next
- [ ] Review all settings
- [ ] Click "Create Workflow"
- [ ] Verify confirmation message

### Keyboard Shortcuts

- **Tab**: Navigate between form fields
- **Enter**: Submit current form / click default button
- **Escape**: Close modals/dialogs
- **Arrow Keys**: Navigate stepper (when focused)

### Time Estimates

- **Step 1** (Name & Template): 1-2 minutes
- **Step 2** (Field Selection): 3-10 minutes
- **Step 3** (Details): 1-2 minutes
- **Step 4** (Scoring): 1-2 minutes
- **Step 5** (Review): 1-2 minutes
- **Total**: 5-20 minutes depending on complexity

---

## Appendix

### Templates Reference

| Template | Fields | Use Case | Recommended For |
|----------|--------|----------|-----------------|
| Blank | 0 | Custom workflows | Unique requirements |
| Credit Agreement | ~40 | Credit analysis | Loan documents |
| Purchase Agreement | ~30 | Order processing | Purchase orders |
| Service Agreement | ~25 | Service contracts | MSAs, SOWs |
| NDA Analysis | ~20 | Confidentiality | Non-disclosure agreements |

### Scoring Profiles Reference

| Profile | Threshold | Use When |
|---------|-----------|----------|
| Standard | 70% | General purpose workflows |
| Strict | 85% | Critical legal/financial docs |
| Lenient | 50% | High-volume processing |
| Custom | Variable | Special requirements |

### Field Categories Reference

- **Parties**: Borrowers, lenders, guarantors, agents
- **Dates**: Effective dates, maturity dates, deadlines
- **Financial**: Amounts, rates, fees, pricing
- **Terms**: Covenants, conditions, obligations
- **Identification**: Numbers, references, IDs
- **Locations**: Addresses, jurisdictions, venues
- **Contact**: Phone, email, representatives

---

**User Guide Version**: 1.0
**Last Updated**: 2025-11-13
**For Questions**: Contact your system administrator
