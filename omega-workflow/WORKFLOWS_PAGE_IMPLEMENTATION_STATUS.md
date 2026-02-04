# Workflows Page Implementation - Status & Roadmap

## 🎯 Goal
Update React app workflows page to have TWO sections:
1. **Workflow Library** - Pre-built templates (matching vanilla app)
2. **Your Workflows** - User-created workflows

---

## ✅ Completed Tasks

### 1. Backend Template Fix
**Status:** ✅ COMPLETE

**What was fixed:**
- M&A/Due Diligence template now shows **14 fields** (was showing 0)
- Added `fieldCategories` structure:
  - Basic Information (3 fields)
  - Term and Termination (3 fields)
  - Boilerplate Provisions (8 fields)
- Changed from field IDs to field names

**File:** `backend-fastapi/main.py` (lines 770-782)

**Verification:**
```bash
curl http://localhost:5001/api/analyze/workflows/templates | jq '.[] | select(.id=="ma-due-diligence") | {name, fields: .fields | length, categories: .fieldCategories | keys}'
```

**Output:**
```json
{
  "name": "M&A/Due Diligence",
  "fields": 14,
  "categories": ["Basic Information", "Term and Termination", "Boilerplate Provisions"]
}
```

---

## 🚧 Remaining Tasks

### Phase 1: Complete Backend Templates
**Priority:** HIGH
**Estimated Time:** 30-45 minutes

**Tasks:**
1. Add all missing templates from vanilla app:
   - ✅ MSA Review (done)
   - ✅ Mutual NDA (done)
   - ✅ M&A/Due Diligence (just fixed)
   - ❌ Miscellaneous Agreements
   - ❌ General Business Agreements
   - ❌ Corporate - Direct Form
   - ❌ Customer Agreements - Mining Terms
   - ❌ Customer Agreements - Review terms
   - ❌ Lease or Lease (Long Form)
   - ❌ Commercial Lease Agreement Review
   - ❌ NDAs generic template
   - ❌ Third Party NDA
   - ❌ Procurement Agreements generic
   - ❌ Purchase Orders
   - ❌ All Litigation templates (5+ templates)
   - ❌ All Employment templates (6+ templates)
   - And ~20+ more templates

2. Organize templates by categories matching vanilla app:
   - MSA/Org Playbook
   - Lease Playbook
   - NDA
   - Procurement Agreements
   - Litigations - Work From SAP
   - Litigations - Long Form SAP
   - Litigations - Long Form (v2)
   - Employment Agreements
   - Credit/Financing
   - Real Estate
   - And more...

**Files to modify:**
- `backend-fastapi/main.py` (expand `/api/analyze/workflows/templates` endpoint)

---

### Phase 2: Frontend Components
**Priority:** HIGH
**Estimated Time:** 1-2 hours

#### 2.1 Create WorkflowLibrary Component
**File:** `react-app/src/features/workflows/components/WorkflowLibrary.tsx` (NEW)

**Features:**
- Fetch templates from `/api/analyze/workflows/templates`
- Group templates by category
- Display in collapsible category sections
- Show template card with:
  - Template name
  - Description
  - Field count
  - "Use Template" button

**Sample structure:**
```tsx
export const WorkflowLibrary: React.FC = () => {
  const [templates, setTemplates] = useState<WorkflowTemplate[]>([]);
  const [expandedCategories, setExpandedCategories] = useState<Set<string>>(new Set());

  useEffect(() => {
    // Fetch templates from API
    workflowService.getTemplates().then(setTemplates);
  }, []);

  // Group templates by category
  const categorizedTemplates = templates.reduce((acc, template) => {
    const category = template.category || 'Other';
    if (!acc[category]) acc[category] = [];
    acc[category].push(template);
    return acc;
  }, {} as Record<string, WorkflowTemplate[]>);

  return (
    <div className="workflow-library">
      {Object.entries(categorizedTemplates).map(([category, temps]) => (
        <CategorySection
          key={category}
          category={category}
          templates={temps}
          isExpanded={expandedCategories.has(category)}
          onToggle={() => toggleCategory(category)}
        />
      ))}
    </div>
  );
};
```

#### 2.2 Create TemplateCard Component
**File:** `react-app/src/features/workflows/components/TemplateCard.tsx` (NEW)

**Features:**
- Display template name, description
- Show field count
- Show document types
- "Use Template" button → navigate to `/workflows/create?template={templateId}`

**Sample structure:**
```tsx
interface TemplateCardProps {
  template: WorkflowTemplate;
  onUseTemplate: (templateId: string) => void;
}

export const TemplateCard: React.FC<TemplateCardProps> = ({ template, onUseTemplate }) => {
  return (
    <Card className="template-card">
      <h3>{template.name}</h3>
      <p className="description">{template.description}</p>

      {template.fieldCategories && (
        <div className="field-categories">
          {Object.entries(template.fieldCategories).map(([category, fields]) => (
            <div key={category} className="category">
              <span className="category-name">{category}</span>
              <span className="field-count">({fields.length})</span>
            </div>
          ))}
        </div>
      )}

      <div className="field-count">
        {template.fields.length} fields
      </div>

      <Button onClick={() => onUseTemplate(template.id)}>
        Use Template
      </Button>
    </Card>
  );
};
```

#### 2.3 Create UserWorkflows Component
**File:** `react-app/src/features/workflows/components/UserWorkflows.tsx` (NEW)

**Features:**
- Move existing workflow list logic from WorkflowsPage
- Display user-created workflows
- Edit/Delete buttons
- Show workflow details

**Sample structure:**
```tsx
export const UserWorkflows: React.FC = () => {
  const { workflows, isLoading, deleteWorkflow } = useWorkflowStore();
  const navigate = useNavigate();

  // ... existing workflow display logic from WorkflowsPage.tsx

  return (
    <div className="user-workflows">
      {workflows.length > 0 ? (
        <div className="workflow-grid">
          {workflows.map(workflow => (
            <WorkflowCard
              key={workflow.id}
              workflow={workflow}
              onEdit={() => navigate(`/workflows/${workflow.id}/edit`)}
              onDelete={() => handleDelete(workflow.id, workflow.name)}
            />
          ))}
        </div>
      ) : (
        <EmptyState message="No workflows yet. Create one from a template!" />
      )}
    </div>
  );
};
```

#### 2.4 Update WorkflowsPage
**File:** `react-app/src/features/workflows/WorkflowsPage.tsx`

**Changes:**
- Add tab navigation or two-section layout
- Tab 1: "Workflow Library" → `<WorkflowLibrary />`
- Tab 2: "Your Workflows" → `<UserWorkflows />`

**Sample structure:**
```tsx
export const WorkflowsPage: React.FC = () => {
  const [activeTab, setActiveTab] = useState<'library' | 'yours'>('library');

  return (
    <div className="workflows-page">
      <div className="page-header">
        <h1>Workflows</h1>
        <p>Create and manage document analysis workflows</p>
      </div>

      {/* Tab Navigation */}
      <div className="tabs">
        <button
          className={activeTab === 'library' ? 'active' : ''}
          onClick={() => setActiveTab('library')}
        >
          Workflow Library
        </button>
        <button
          className={activeTab === 'yours' ? 'active' : ''}
          onClick={() => setActiveTab('yours')}
        >
          Your Workflows
        </button>
      </div>

      {/* Tab Content */}
      <div className="tab-content">
        {activeTab === 'library' ? (
          <WorkflowLibrary />
        ) : (
          <UserWorkflows />
        )}
      </div>
    </div>
  );
};
```

---

### Phase 3: Services & Types
**Priority:** MEDIUM
**Estimated Time:** 15-30 minutes

#### 3.1 Update workflowService
**File:** `react-app/src/services/workflowService.ts`

**Add method:**
```typescript
export const workflowService = {
  // ... existing methods

  async getTemplates(): Promise<WorkflowTemplate[]> {
    const response = await apiClient.get('/analyze/workflows/templates');
    return response.data;
  },
};
```

#### 3.2 Add Types
**File:** `react-app/src/types/workflow.ts`

**Add type:**
```typescript
export interface WorkflowTemplate {
  id: string;
  name: string;
  category: string;
  description: string;
  fields: string[];
  fieldCategories?: Record<string, string[]>;
  documentTypes: string[];
}
```

---

### Phase 4: Workflow Creation Integration
**Priority:** MEDIUM
**Estimated Time:** 30-45 minutes

**Task:**
- Update `WorkflowCreatePage.tsx` to accept template parameter
- When user clicks "Use Template", navigate to `/workflows/create?template=ma-due-diligence`
- Pre-populate wizard with template data

**Changes needed:**
```typescript
// In WorkflowCreatePage.tsx
const location = useLocation();
const searchParams = new URLSearchParams(location.search);
const templateId = searchParams.get('template');

useEffect(() => {
  if (templateId) {
    // Load template and pre-populate wizard
    workflowService.getTemplates().then(templates => {
      const template = templates.find(t => t.id === templateId);
      if (template) {
        // Pre-fill Step 1: Name
        setWorkflowName(template.name);

        // Pre-select Step 2: Fields
        setSelectedFields(template.fields);

        // ... etc
      }
    });
  }
}, [templateId]);
```

---

### Phase 5: Styling & UX
**Priority:** LOW
**Estimated Time:** 30-60 minutes

**Tasks:**
- Match vanilla app's visual design
- Add category header styling
- Template card hover states
- Loading states
- Empty states
- Responsive design

---

## 📊 Progress Tracker

**Backend:**
- ✅ Fix M&A template (COMPLETE)
- ⏸️ Add remaining ~30 templates (PENDING)
- ⏸️ Organize by categories (PENDING)

**Frontend:**
- ⏸️ WorkflowLibrary component (PENDING)
- ⏸️ TemplateCard component (PENDING)
- ⏸️ UserWorkflows component (PENDING)
- ⏸️ WorkflowsPage update (PENDING)

**Integration:**
- ⏸️ Services & types (PENDING)
- ⏸️ Template → creation flow (PENDING)

**Polish:**
- ⏸️ Styling & UX (PENDING)

**Overall Progress:** ~10% complete

---

## 🚀 Next Steps

### Immediate (do first):
1. ✅ Verify M&A template fix (DONE - shows 14 fields)
2. Add remaining templates to backend endpoint
3. Create WorkflowLibrary component
4. Create TemplateCard component

### After that:
5. Update WorkflowsPage with tab navigation
6. Create UserWorkflows component
7. Wire up template → workflow creation
8. Add styling

---

## 🧪 Testing Checklist

### Backend Testing:
- [ ] M&A template shows 14 fields with categories
- [ ] All templates have field names (not IDs)
- [ ] Templates organized by correct categories
- [ ] All categories from vanilla app represented

### Frontend Testing:
- [ ] "Workflow Library" tab displays templates
- [ ] Templates grouped by category
- [ ] Categories collapsible/expandable
- [ ] Template cards show correct data
- [ ] "Use Template" button navigates correctly
- [ ] "Your Workflows" tab shows user workflows
- [ ] Can create workflow from template
- [ ] Can edit/delete user workflows

---

## 📁 Files Modified/Created

**Backend:**
- ✅ `backend-fastapi/main.py` (M&A template fix)

**Frontend (to be created):**
- `react-app/src/features/workflows/components/WorkflowLibrary.tsx`
- `react-app/src/features/workflows/components/TemplateCard.tsx`
- `react-app/src/features/workflows/components/UserWorkflows.tsx`
- `react-app/src/services/workflowService.ts` (update)
- `react-app/src/types/workflow.ts` (update)
- `react-app/src/features/workflows/WorkflowsPage.tsx` (update)
- `react-app/src/features/workflows/create/WorkflowCreatePage.tsx` (update)

---

## Date
Started: 2025-01-21
Status: In Progress (~10% complete)

---

## Summary

**What's Working:**
- ✅ M&A template now shows 14 fields with categories
- ✅ Backend endpoint functional
- ✅ Template structure defined

**What's Next:**
- Add remaining ~30 templates to backend
- Build frontend components (Library, TemplateCard, UserWorkflows)
- Wire up template selection to workflow creation
- Add styling to match vanilla app

**Estimated Total Time Remaining:** 3-4 hours
