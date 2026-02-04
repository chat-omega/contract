# Workflow Wizard - Developer Guide

## Table of Contents
1. [Architecture Overview](#architecture-overview)
2. [Technology Stack](#technology-stack)
3. [Project Structure](#project-structure)
4. [Component Hierarchy](#component-hierarchy)
5. [State Management](#state-management)
6. [API Integration](#api-integration)
7. [Key Components](#key-components)
8. [Adding New Features](#adding-new-features)
9. [Common Tasks](#common-tasks)
10. [Debugging Guide](#debugging-guide)
11. [Testing Strategy](#testing-strategy)
12. [Performance Optimization](#performance-optimization)

---

## Architecture Overview

### High-Level Design

The Workflow Wizard follows a **multi-step wizard pattern** with these architectural principles:

```
┌─────────────────────────────────────────────────────────────┐
│                     WorkflowCreatePage                      │
│                    (Route: /workflows/create)               │
└──────────────────────────┬──────────────────────────────────┘
                           │
                           ▼
┌─────────────────────────────────────────────────────────────┐
│                     WorkflowWizard                          │
│                  (Main Wizard Container)                    │
│  ┌────────────┬──────────┬──────────┬──────────┬─────────┐ │
│  │  Step 1    │  Step 2  │  Step 3  │  Step 4  │ Step 5  │ │
│  │ Name &     │  Field   │ Details  │ Scoring  │ Review  │ │
│  │ Template   │ Selection│          │          │         │ │
│  └────────────┴──────────┴──────────┴──────────┴─────────┘ │
└──────────────────────────┬──────────────────────────────────┘
                           │
                           ▼
┌─────────────────────────────────────────────────────────────┐
│                  useWorkflowWizard Hook                     │
│              (State Management & Navigation)                │
└──────────────────────────┬──────────────────────────────────┘
                           │
                           ▼
┌─────────────────────────────────────────────────────────────┐
│                   workflowService                           │
│                (API Calls & Data Fetching)                  │
└──────────────────────────┬──────────────────────────────────┘
                           │
                           ▼
┌─────────────────────────────────────────────────────────────┐
│                   Backend API                               │
│         (Session Management & Data Persistence)             │
└─────────────────────────────────────────────────────────────┘
```

### Design Patterns

1. **Wizard Pattern**: Multi-step form with linear progression
2. **Compound Components**: WorkflowWizard + Step components
3. **Custom Hooks**: Business logic encapsulated in hooks
4. **Service Layer**: API calls abstracted into services
5. **State Management**: Zustand for global state, React state for local
6. **Error Boundaries**: Graceful error handling at component level

### Key Principles

- **Separation of Concerns**: UI, logic, and data are separated
- **Single Responsibility**: Each component has one clear purpose
- **Reusability**: Components are designed for reuse
- **Type Safety**: Full TypeScript coverage
- **Progressive Enhancement**: Works without JavaScript (basic functionality)
- **Accessibility**: WCAG 2.1 AA compliant

---

## Technology Stack

### Core Technologies

| Technology | Version | Purpose |
|------------|---------|---------|
| **React** | 18.3.1 | UI framework |
| **TypeScript** | 5.6.2 | Type safety |
| **Vite** | 7.2.2 | Build tool |
| **React Router** | 7.9.5 | Routing |
| **Zustand** | 5.0.2 | State management |
| **TailwindCSS** | 3.4.17 | Styling |
| **Axios** | 1.7.9 | HTTP client |

### Development Tools

- **ESLint**: Code linting
- **Prettier**: Code formatting (implicit)
- **TypeScript**: Static type checking
- **Vite DevServer**: Hot module replacement

### Build & Deployment

- **Vite**: Production builds
- **Docker**: Containerization
- **Nginx**: Static file serving
- **Docker Compose**: Multi-container orchestration

---

## Project Structure

### Directory Layout

```
react-app/
├── src/
│   ├── features/              # Feature-based modules
│   │   └── workflows/         # Workflow wizard feature
│   │       ├── components/    # Workflow-specific components
│   │       │   ├── steps/     # Step components
│   │       │   │   ├── Step1NameTemplate.tsx
│   │       │   │   ├── Step2FieldSelection.tsx
│   │       │   │   ├── Step3Details.tsx
│   │       │   │   ├── Step4Scoring.tsx
│   │       │   │   └── Step5Review.tsx
│   │       │   ├── FieldSelector/  # Field selection components
│   │       │   │   ├── FieldSelector.tsx
│   │       │   │   ├── FieldSearch.tsx
│   │       │   │   ├── FieldFilters.tsx
│   │       │   │   ├── FieldList.tsx
│   │       │   │   ├── FieldCard.tsx
│   │       │   │   └── SelectedFields.tsx
│   │       │   ├── WorkflowWizard.tsx
│   │       │   ├── WorkflowErrorBoundary.tsx
│   │       │   └── TemplateSelector.tsx
│   │       ├── hooks/         # Workflow-specific hooks
│   │       │   ├── useWorkflowWizard.ts
│   │       │   └── useFieldSelection.ts
│   │       ├── types.ts       # Workflow type definitions
│   │       ├── WorkflowCreatePage.tsx
│   │       ├── WorkflowsPage.tsx
│   │       └── index.ts
│   ├── components/            # Shared components
│   │   ├── ui/                # UI primitives
│   │   │   ├── Select.tsx
│   │   │   ├── Textarea.tsx
│   │   │   ├── Checkbox.tsx
│   │   │   ├── Radio.tsx
│   │   │   ├── SearchInput.tsx
│   │   │   ├── Stepper.tsx
│   │   │   ├── Button.tsx
│   │   │   ├── Input.tsx
│   │   │   ├── Card.tsx
│   │   │   ├── Badge.tsx
│   │   │   ├── Modal.tsx
│   │   │   ├── Toast.tsx
│   │   │   └── Spinner.tsx
│   │   ├── layout/            # Layout components
│   │   │   ├── AppLayout.tsx
│   │   │   ├── Header.tsx
│   │   │   └── Sidebar.tsx
│   │   └── ProtectedRoute.tsx
│   ├── services/              # API services
│   │   ├── api.ts             # Base API client
│   │   ├── workflowService.ts # Workflow API calls
│   │   ├── authService.ts
│   │   ├── documentService.ts
│   │   └── extractionService.ts
│   ├── stores/                # Zustand stores
│   │   ├── workflowStore.ts   # Workflow state
│   │   ├── authStore.ts
│   │   ├── documentStore.ts
│   │   └── uiStore.ts
│   ├── types/                 # Shared types
│   │   ├── index.ts
│   │   ├── pdf.ts
│   │   └── search.ts
│   ├── utils/                 # Utility functions
│   │   ├── cn.ts              # Class name utility
│   │   ├── debounce.ts
│   │   └── index.ts
│   ├── App.tsx                # Root component
│   └── main.tsx               # Entry point
├── public/                    # Static assets
├── dist/                      # Production build
├── Dockerfile                 # Docker configuration
├── nginx.conf                 # Nginx configuration
├── vite.config.ts             # Vite configuration
├── tsconfig.json              # TypeScript configuration
├── tailwind.config.js         # Tailwind configuration
└── package.json               # Dependencies
```

### File Naming Conventions

- **Components**: PascalCase (e.g., `WorkflowWizard.tsx`)
- **Hooks**: camelCase with `use` prefix (e.g., `useWorkflowWizard.ts`)
- **Services**: camelCase with `Service` suffix (e.g., `workflowService.ts`)
- **Stores**: camelCase with `Store` suffix (e.g., `workflowStore.ts`)
- **Types**: PascalCase for interfaces/types (e.g., `WorkflowData`)
- **Utilities**: camelCase (e.g., `debounce.ts`)

---

## Component Hierarchy

### WorkflowWizard Component Tree

```
WorkflowCreatePage
└── WorkflowWizard
    ├── Stepper (shows current step)
    ├── WorkflowErrorBoundary (wraps step content)
    │   └── [Current Step Component]
    │       ├── Step1NameTemplate
    │       │   ├── Input (workflow name)
    │       │   └── TemplateSelector
    │       │       └── Radio (template options)
    │       ├── Step2FieldSelection
    │       │   └── FieldSelector
    │       │       ├── FieldSearch
    │       │       │   └── SearchInput
    │       │       ├── FieldFilters
    │       │       │   ├── Select (category filter)
    │       │       │   └── Select (type filter)
    │       │       ├── FieldList
    │       │       │   └── FieldCard[] (paginated)
    │       │       │       └── Checkbox
    │       │       └── SelectedFields
    │       │           └── Badge[] (selected fields)
    │       ├── Step3Details
    │       │   └── Textarea (description)
    │       ├── Step4Scoring
    │       │   ├── Checkbox (enable scoring)
    │       │   ├── Radio (profile selection)
    │       │   └── Input (threshold slider)
    │       └── Step5Review
    │           ├── Card (workflow info)
    │           ├── Card (selected fields)
    │           └── Card (scoring config)
    └── Navigation Buttons
        ├── Button (Previous)
        ├── Button (Next/Save)
        └── Button (Cancel - optional)
```

### Data Flow

```
User Interaction
       │
       ▼
Step Component (local state)
       │
       ▼
useWorkflowWizard hook
       │
       ├──► Local State (formData, currentStep)
       │
       ├──► workflowService (API calls)
       │    └──► Backend API
       │
       └──► workflowStore (global state)
            └──► Other Components (if needed)
```

---

## State Management

### State Architecture

The wizard uses **three levels of state**:

1. **Local Component State**: UI-specific state (dropdowns, modals)
2. **Wizard Hook State**: Wizard-level state (form data, current step)
3. **Global Store State**: App-level state (workflows list, templates)

### useWorkflowWizard Hook

**Location**: `/src/features/workflows/hooks/useWorkflowWizard.ts`

**Responsibilities**:
- Manage form data across all steps
- Handle step navigation
- Validate step data
- Persist data to backend (session)
- Handle final submission

**State Structure**:
```typescript
interface WorkflowWizardState {
  currentStep: number;           // 0-4 (steps 1-5)
  formData: WorkflowFormData;    // All form data
  isLoading: boolean;            // Loading state
  error: string | null;          // Error messages
  sessionId: string | null;      // Backend session ID
}
```

**Key Methods**:
```typescript
const {
  currentStep,      // Current step number (0-4)
  formData,         // All form data
  isLoading,        // Loading indicator
  error,            // Error message

  // Navigation
  nextStep,         // Move to next step
  previousStep,     // Move to previous step
  goToStep,         // Jump to specific step

  // Data Management
  updateFormData,   // Update form fields
  resetForm,        // Clear all data

  // Submission
  submitWorkflow,   // Final submit

  // Validation
  canProceed,       // Can move to next step
  isStepValid,      // Is current step valid
} = useWorkflowWizard(workflowId?: string);
```

**Usage Example**:
```typescript
function Step1NameTemplate() {
  const { formData, updateFormData, nextStep, canProceed } = useWorkflowWizard();

  const handleNameChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    updateFormData({ name: e.target.value });
  };

  const handleNext = () => {
    if (canProceed(0)) {  // Validate step 1
      nextStep();
    }
  };

  return (
    <div>
      <Input value={formData.name} onChange={handleNameChange} />
      <Button onClick={handleNext} disabled={!canProceed(0)}>
        Next
      </Button>
    </div>
  );
}
```

### useFieldSelection Hook

**Location**: `/src/features/workflows/hooks/useFieldSelection.ts`

**Responsibilities**:
- Manage field search and filtering
- Handle field selection/deselection
- Paginate large field lists
- Track selected fields

**State Structure**:
```typescript
interface FieldSelectionState {
  searchQuery: string;           // Search input
  selectedCategory: string;      // Category filter
  selectedType: string;          // Type filter
  selectedFields: Field[];       // Selected fields
  currentPage: number;           // Pagination
}
```

**Key Methods**:
```typescript
const {
  // Filters
  searchQuery,
  setSearchQuery,
  selectedCategory,
  setSelectedCategory,
  selectedType,
  setSelectedType,

  // Selection
  selectedFields,
  toggleField,
  selectAll,
  clearAll,

  // Pagination
  currentPage,
  setCurrentPage,
  totalPages,

  // Computed
  filteredFields,
  paginatedFields,
} = useFieldSelection(allFields: Field[]);
```

### workflowStore

**Location**: `/src/stores/workflowStore.ts`

**Responsibilities**:
- Store workflows list
- Cache templates
- Cache available fields
- Manage workflow CRUD state

**State Structure**:
```typescript
interface WorkflowStore {
  workflows: Workflow[];
  templates: Template[];
  fields: Field[];
  isLoading: boolean;
  error: string | null;

  // Actions
  fetchWorkflows: () => Promise<void>;
  fetchTemplates: () => Promise<void>;
  fetchFields: () => Promise<void>;
  createWorkflow: (data: WorkflowFormData) => Promise<Workflow>;
  updateWorkflow: (id: string, data: WorkflowFormData) => Promise<Workflow>;
  deleteWorkflow: (id: string) => Promise<void>;
}
```

---

## API Integration

### Service Layer Architecture

All API calls go through service modules in `/src/services/`.

### workflowService

**Location**: `/src/services/workflowService.ts`

**API Endpoints**:

```typescript
// Workflow CRUD
GET    /api/workflows           // List all workflows
GET    /api/workflows/:id       // Get workflow by ID
POST   /api/workflows           // Create workflow
PUT    /api/workflows/:id       // Update workflow
DELETE /api/workflows/:id       // Delete workflow

// Templates
GET    /api/templates           // List all templates
GET    /api/templates/:id       // Get template by ID

// Fields
GET    /api/fields              // List all fields
GET    /api/fields?category=X   // Filter by category
GET    /api/fields?type=Y       // Filter by type

// Sessions (for wizard)
POST   /api/workflow-sessions   // Create session
PUT    /api/workflow-sessions/:id  // Update session (auto-save)
GET    /api/workflow-sessions/:id  // Get session data
DELETE /api/workflow-sessions/:id  // Delete session
```

**Service Methods**:

```typescript
class WorkflowService {
  // Workflows
  async getWorkflows(): Promise<Workflow[]>
  async getWorkflow(id: string): Promise<Workflow>
  async createWorkflow(data: WorkflowFormData): Promise<Workflow>
  async updateWorkflow(id: string, data: WorkflowFormData): Promise<Workflow>
  async deleteWorkflow(id: string): Promise<void>

  // Templates
  async getTemplates(): Promise<Template[]>
  async getTemplate(id: string): Promise<Template>

  // Fields
  async getFields(filters?: FieldFilters): Promise<Field[]>

  // Sessions
  async createSession(): Promise<{ sessionId: string }>
  async updateSession(sessionId: string, data: Partial<WorkflowFormData>): Promise<void>
  async getSession(sessionId: string): Promise<WorkflowFormData>
  async deleteSession(sessionId: string): Promise<void>
}
```

**Usage Example**:

```typescript
import { workflowService } from '@/services/workflowService';

// Create a workflow
const newWorkflow = await workflowService.createWorkflow({
  name: 'Credit Agreement Analysis',
  templateId: 'credit-agreement',
  fields: selectedFieldIds,
  description: 'Processes credit agreements...',
  scoringEnabled: true,
  scoringProfile: 'strict',
  scoringThreshold: 85,
});

// Get all workflows
const workflows = await workflowService.getWorkflows();

// Update session (auto-save)
await workflowService.updateSession(sessionId, {
  name: updatedName,
  fields: updatedFields,
});
```

### API Client Configuration

**Base Client**: `/src/services/api.ts`

```typescript
import axios from 'axios';

const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL || 'http://localhost:8000',
  headers: {
    'Content-Type': 'application/json',
  },
});

// Request interceptor (add auth token)
api.interceptors.request.use((config) => {
  const token = authStore.getState().token;
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// Response interceptor (handle errors)
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      authStore.getState().logout();
    }
    return Promise.reject(error);
  }
);

export default api;
```

### Error Handling

All service methods use try-catch with typed errors:

```typescript
async createWorkflow(data: WorkflowFormData): Promise<Workflow> {
  try {
    const response = await api.post('/api/workflows', data);
    return response.data;
  } catch (error) {
    if (axios.isAxiosError(error)) {
      throw new Error(error.response?.data?.message || 'Failed to create workflow');
    }
    throw error;
  }
}
```

---

## Key Components

### WorkflowWizard

**Location**: `/src/features/workflows/components/WorkflowWizard.tsx`

**Purpose**: Main wizard container that orchestrates all steps

**Props**:
```typescript
interface WorkflowWizardProps {
  workflowId?: string;  // For editing existing workflow
  onComplete?: (workflow: Workflow) => void;
  onCancel?: () => void;
}
```

**Key Features**:
- Manages stepper display
- Renders current step
- Handles navigation buttons
- Shows loading/error states
- Wraps content in error boundary

**Implementation Highlights**:
```typescript
export function WorkflowWizard({ workflowId, onComplete, onCancel }: WorkflowWizardProps) {
  const {
    currentStep,
    formData,
    isLoading,
    error,
    nextStep,
    previousStep,
    submitWorkflow,
    canProceed,
  } = useWorkflowWizard(workflowId);

  const steps = [
    { title: 'Name & Template', component: <Step1NameTemplate /> },
    { title: 'Field Selection', component: <Step2FieldSelection /> },
    { title: 'Details', component: <Step3Details /> },
    { title: 'Scoring', component: <Step4Scoring /> },
    { title: 'Review', component: <Step5Review /> },
  ];

  const handleSubmit = async () => {
    const workflow = await submitWorkflow();
    onComplete?.(workflow);
  };

  return (
    <div className="workflow-wizard">
      <Stepper steps={steps.map(s => s.title)} currentStep={currentStep} />

      <WorkflowErrorBoundary>
        {steps[currentStep].component}
      </WorkflowErrorBoundary>

      <div className="navigation">
        {currentStep > 0 && (
          <Button onClick={previousStep}>Previous</Button>
        )}
        {currentStep < steps.length - 1 ? (
          <Button onClick={nextStep} disabled={!canProceed(currentStep)}>
            Next
          </Button>
        ) : (
          <Button onClick={handleSubmit} disabled={isLoading}>
            Create Workflow
          </Button>
        )}
      </div>

      {error && <div className="error">{error}</div>}
    </div>
  );
}
```

### FieldSelector

**Location**: `/src/features/workflows/components/FieldSelector/FieldSelector.tsx`

**Purpose**: Complex field selection interface with search, filters, and pagination

**Props**:
```typescript
interface FieldSelectorProps {
  allFields: Field[];
  selectedFields: Field[];
  onSelectionChange: (fields: Field[]) => void;
}
```

**Key Features**:
- Real-time search
- Category and type filters
- Pagination (50 per page)
- Selected fields panel
- Bulk select/deselect
- Responsive layout

**Architecture**:
```
FieldSelector (container)
├── FieldSearch (search input)
├── FieldFilters (category/type dropdowns)
├── FieldList (paginated list)
│   └── FieldCard[] (individual fields)
└── SelectedFields (selection panel)
    └── Badge[] (selected field badges)
```

### Stepper Component

**Location**: `/src/components/ui/Stepper.tsx`

**Purpose**: Visual step indicator for wizard progression

**Props**:
```typescript
interface StepperProps {
  steps: string[];        // Step labels
  currentStep: number;    // Current step index (0-based)
  onStepClick?: (step: number) => void;  // Optional: allow jumping
}
```

**Visual States**:
- **Completed**: Green checkmark
- **Current**: Blue circle with number
- **Upcoming**: Gray circle with number
- **Connector**: Line between steps

---

## Adding New Features

### Adding a New Wizard Step

**Example**: Add "Step 6: Notifications"

1. **Create Step Component**:

```typescript
// /src/features/workflows/components/steps/Step6Notifications.tsx
import { useWorkflowWizard } from '../../hooks/useWorkflowWizard';
import { Checkbox } from '@/components/ui/Checkbox';

export function Step6Notifications() {
  const { formData, updateFormData } = useWorkflowWizard();

  return (
    <div className="space-y-6">
      <h2 className="text-2xl font-bold">Notification Settings</h2>

      <Checkbox
        label="Email on completion"
        checked={formData.notifyOnComplete || false}
        onChange={(checked) => updateFormData({ notifyOnComplete: checked })}
      />

      <Checkbox
        label="Email on errors"
        checked={formData.notifyOnError || false}
        onChange={(checked) => updateFormData({ notifyOnError: checked })}
      />
    </div>
  );
}
```

2. **Update Types**:

```typescript
// /src/features/workflows/types.ts
export interface WorkflowFormData {
  // ... existing fields
  notifyOnComplete?: boolean;
  notifyOnError?: boolean;
}
```

3. **Add to Wizard**:

```typescript
// /src/features/workflows/components/WorkflowWizard.tsx
import { Step6Notifications } from './steps/Step6Notifications';

const steps = [
  // ... existing steps
  { title: 'Notifications', component: <Step6Notifications /> },
];
```

4. **Update Validation**:

```typescript
// /src/features/workflows/hooks/useWorkflowWizard.ts
const isStepValid = (step: number): boolean => {
  switch (step) {
    // ... existing cases
    case 5:  // Step 6 (0-indexed)
      return true;  // Always valid, or add validation
    default:
      return false;
  }
};
```

### Adding a New Field Filter

**Example**: Add "Template" filter to field selector

1. **Update useFieldSelection Hook**:

```typescript
// /src/features/workflows/hooks/useFieldSelection.ts
const [selectedTemplate, setSelectedTemplate] = useState<string>('all');

const filteredFields = useMemo(() => {
  return allFields.filter(field => {
    // ... existing filters
    if (selectedTemplate !== 'all' && !field.templates?.includes(selectedTemplate)) {
      return false;
    }
    return true;
  });
}, [allFields, searchQuery, selectedCategory, selectedType, selectedTemplate]);

return {
  // ... existing returns
  selectedTemplate,
  setSelectedTemplate,
};
```

2. **Update FieldFilters Component**:

```typescript
// /src/features/workflows/components/FieldSelector/FieldFilters.tsx
export function FieldFilters() {
  const {
    // ... existing
    selectedTemplate,
    setSelectedTemplate,
  } = useFieldSelection();

  return (
    <div className="filters">
      {/* ... existing filters */}

      <Select
        value={selectedTemplate}
        onChange={setSelectedTemplate}
        options={[
          { value: 'all', label: 'All Templates' },
          { value: 'credit', label: 'Credit Agreement' },
          { value: 'purchase', label: 'Purchase Agreement' },
          // ... more templates
        ]}
      />
    </div>
  );
}
```

### Adding a New API Endpoint

**Example**: Add workflow duplication

1. **Add to workflowService**:

```typescript
// /src/services/workflowService.ts
class WorkflowService {
  // ... existing methods

  async duplicateWorkflow(id: string, newName: string): Promise<Workflow> {
    try {
      const response = await api.post(`/api/workflows/${id}/duplicate`, { newName });
      return response.data;
    } catch (error) {
      throw this.handleError(error, 'Failed to duplicate workflow');
    }
  }
}
```

2. **Update workflowStore**:

```typescript
// /src/stores/workflowStore.ts
interface WorkflowStore {
  // ... existing
  duplicateWorkflow: (id: string, newName: string) => Promise<Workflow>;
}

export const useWorkflowStore = create<WorkflowStore>((set, get) => ({
  // ... existing

  duplicateWorkflow: async (id, newName) => {
    set({ isLoading: true, error: null });
    try {
      const workflow = await workflowService.duplicateWorkflow(id, newName);
      set(state => ({
        workflows: [...state.workflows, workflow],
        isLoading: false,
      }));
      return workflow;
    } catch (error) {
      set({ isLoading: false, error: (error as Error).message });
      throw error;
    }
  },
}));
```

3. **Use in Component**:

```typescript
// /src/features/workflows/WorkflowsPage.tsx
const { duplicateWorkflow } = useWorkflowStore();

const handleDuplicate = async (workflowId: string) => {
  const newName = prompt('Enter new workflow name:');
  if (newName) {
    await duplicateWorkflow(workflowId, newName);
  }
};
```

---

## Common Tasks

### Task: Adding Form Validation

**Location**: `/src/features/workflows/hooks/useWorkflowWizard.ts`

```typescript
const validateStep = (step: number): string[] => {
  const errors: string[] = [];

  switch (step) {
    case 0:  // Step 1
      if (!formData.name || formData.name.length < 3) {
        errors.push('Workflow name must be at least 3 characters');
      }
      if (formData.name && formData.name.length > 100) {
        errors.push('Workflow name must be less than 100 characters');
      }
      break;

    case 1:  // Step 2
      if (formData.fields.length === 0) {
        errors.push('At least one field must be selected');
      }
      if (formData.fields.length > 100) {
        errors.push('Too many fields selected (max 100)');
      }
      break;

    // ... more steps
  }

  return errors;
};

const canProceed = (step: number): boolean => {
  return validateStep(step).length === 0;
};
```

### Task: Adding Loading States

**Pattern**: Use isLoading from hook/store

```typescript
function MyComponent() {
  const { isLoading } = useWorkflowWizard();

  if (isLoading) {
    return (
      <div className="flex justify-center items-center h-64">
        <Spinner size="lg" />
        <span className="ml-2">Loading...</span>
      </div>
    );
  }

  return <div>Content</div>;
}
```

### Task: Adding Error Handling

**Pattern**: Use error boundary + error state

```typescript
// Component-level
function MyComponent() {
  const { error } = useWorkflowWizard();

  if (error) {
    return (
      <div className="bg-red-50 border border-red-200 rounded-lg p-4">
        <p className="text-red-800 font-semibold">Error</p>
        <p className="text-red-600">{error}</p>
      </div>
    );
  }

  return <div>Content</div>;
}

// Wizard-level
<WorkflowErrorBoundary>
  <StepComponent />
</WorkflowErrorBoundary>
```

### Task: Adding Auto-Save

**Location**: `/src/features/workflows/hooks/useWorkflowWizard.ts`

```typescript
useEffect(() => {
  if (!sessionId) return;

  // Debounce auto-save
  const timeoutId = setTimeout(async () => {
    try {
      await workflowService.updateSession(sessionId, formData);
      console.log('Auto-saved');
    } catch (error) {
      console.error('Auto-save failed:', error);
    }
  }, 2000);  // Save 2 seconds after last change

  return () => clearTimeout(timeoutId);
}, [formData, sessionId]);
```

### Task: Adding Keyboard Shortcuts

```typescript
useEffect(() => {
  const handleKeyDown = (e: KeyboardEvent) => {
    if (e.ctrlKey && e.key === 'Enter') {
      // Ctrl+Enter to submit
      if (canProceed(currentStep)) {
        if (currentStep === steps.length - 1) {
          submitWorkflow();
        } else {
          nextStep();
        }
      }
    }

    if (e.key === 'Escape') {
      // Escape to cancel
      onCancel?.();
    }
  };

  window.addEventListener('keydown', handleKeyDown);
  return () => window.removeEventListener('keydown', handleKeyDown);
}, [currentStep, canProceed, submitWorkflow, nextStep, onCancel]);
```

---

## Debugging Guide

### Common Issues

#### Issue: Step validation not working

**Symptom**: Can't proceed to next step even with valid data

**Debug Steps**:
1. Check `canProceed(step)` logic in useWorkflowWizard
2. Verify formData state is updating
3. Check validation rules for the step
4. Console.log formData to see current state

```typescript
const canProceed = (step: number): boolean => {
  console.log('Validating step', step, 'with data:', formData);
  const result = isStepValid(step);
  console.log('Validation result:', result);
  return result;
};
```

#### Issue: Fields not showing in selector

**Symptom**: FieldSelector shows empty list

**Debug Steps**:
1. Check if fields are loaded: `console.log(allFields)`
2. Check filters: `console.log({ searchQuery, selectedCategory, selectedType })`
3. Check filtered results: `console.log(filteredFields)`
4. Verify pagination: `console.log({ currentPage, totalPages })`

```typescript
console.log('Field debugging:', {
  totalFields: allFields.length,
  filteredFields: filteredFields.length,
  currentPage,
  itemsPerPage: ITEMS_PER_PAGE,
  showing: paginatedFields.length,
});
```

#### Issue: Auto-save not working

**Symptom**: Session data not persisting

**Debug Steps**:
1. Verify sessionId exists: `console.log('Session ID:', sessionId)`
2. Check if updateSession is being called
3. Look for network errors in DevTools Network tab
4. Verify backend endpoint is working

```typescript
useEffect(() => {
  console.log('FormData changed:', formData);
  console.log('Session ID:', sessionId);

  if (!sessionId) {
    console.warn('No session ID, cannot auto-save');
    return;
  }

  const timeoutId = setTimeout(async () => {
    console.log('Auto-saving...');
    try {
      await workflowService.updateSession(sessionId, formData);
      console.log('Auto-save successful');
    } catch (error) {
      console.error('Auto-save failed:', error);
    }
  }, 2000);

  return () => clearTimeout(timeoutId);
}, [formData, sessionId]);
```

### Development Tools

#### React DevTools
- Install React DevTools browser extension
- Inspect component tree
- View props and state
- Track state changes

#### Zustand DevTools
```typescript
import { devtools } from 'zustand/middleware';

export const useWorkflowStore = create<WorkflowStore>()(
  devtools(
    (set, get) => ({
      // ... store implementation
    }),
    { name: 'WorkflowStore' }
  )
);
```

#### Network Debugging
```typescript
// Log all API requests
api.interceptors.request.use((config) => {
  console.log('API Request:', config.method?.toUpperCase(), config.url, config.data);
  return config;
});

api.interceptors.response.use(
  (response) => {
    console.log('API Response:', response.config.url, response.status, response.data);
    return response;
  },
  (error) => {
    console.error('API Error:', error.config?.url, error.response?.status, error.response?.data);
    return Promise.reject(error);
  }
);
```

---

## Testing Strategy

### Unit Tests (Recommended)

**Tools**: Jest + React Testing Library

**Example**: Testing useWorkflowWizard hook

```typescript
// __tests__/useWorkflowWizard.test.ts
import { renderHook, act } from '@testing-library/react-hooks';
import { useWorkflowWizard } from '../useWorkflowWizard';

describe('useWorkflowWizard', () => {
  it('should initialize with step 0', () => {
    const { result } = renderHook(() => useWorkflowWizard());
    expect(result.current.currentStep).toBe(0);
  });

  it('should navigate to next step', () => {
    const { result } = renderHook(() => useWorkflowWizard());

    act(() => {
      result.current.updateFormData({ name: 'Test Workflow' });
      result.current.nextStep();
    });

    expect(result.current.currentStep).toBe(1);
  });

  it('should validate step before proceeding', () => {
    const { result } = renderHook(() => useWorkflowWizard());

    // Without name, can't proceed
    expect(result.current.canProceed(0)).toBe(false);

    // With name, can proceed
    act(() => {
      result.current.updateFormData({ name: 'Test' });
    });
    expect(result.current.canProceed(0)).toBe(true);
  });
});
```

**Example**: Testing FieldSelector component

```typescript
// __tests__/FieldSelector.test.tsx
import { render, screen, fireEvent } from '@testing-library/react';
import { FieldSelector } from '../FieldSelector';

const mockFields = [
  { id: '1', name: 'Borrower Name', type: 'text', category: 'parties' },
  { id: '2', name: 'Loan Amount', type: 'currency', category: 'financial' },
];

describe('FieldSelector', () => {
  it('should render all fields', () => {
    render(
      <FieldSelector
        allFields={mockFields}
        selectedFields={[]}
        onSelectionChange={jest.fn()}
      />
    );

    expect(screen.getByText('Borrower Name')).toBeInTheDocument();
    expect(screen.getByText('Loan Amount')).toBeInTheDocument();
  });

  it('should filter fields by search', () => {
    render(
      <FieldSelector
        allFields={mockFields}
        selectedFields={[]}
        onSelectionChange={jest.fn()}
      />
    );

    const searchInput = screen.getByPlaceholderText('Search fields...');
    fireEvent.change(searchInput, { target: { value: 'borrower' } });

    expect(screen.getByText('Borrower Name')).toBeInTheDocument();
    expect(screen.queryByText('Loan Amount')).not.toBeInTheDocument();
  });

  it('should select field when clicked', () => {
    const onSelectionChange = jest.fn();
    render(
      <FieldSelector
        allFields={mockFields}
        selectedFields={[]}
        onSelectionChange={onSelectionChange}
      />
    );

    const checkbox = screen.getAllByRole('checkbox')[0];
    fireEvent.click(checkbox);

    expect(onSelectionChange).toHaveBeenCalledWith([mockFields[0]]);
  });
});
```

### Integration Tests

**Example**: Testing full wizard flow

```typescript
// __tests__/WorkflowWizard.integration.test.tsx
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { WorkflowWizard } from '../WorkflowWizard';
import { workflowService } from '@/services/workflowService';

jest.mock('@/services/workflowService');

describe('WorkflowWizard Integration', () => {
  it('should complete full workflow creation', async () => {
    const onComplete = jest.fn();

    render(<WorkflowWizard onComplete={onComplete} />);

    // Step 1: Enter name
    const nameInput = screen.getByLabelText('Workflow Name');
    fireEvent.change(nameInput, { target: { value: 'Test Workflow' } });
    fireEvent.click(screen.getByText('Next'));

    // Step 2: Select fields
    await waitFor(() => {
      expect(screen.getByText('Field Selection')).toBeInTheDocument();
    });
    fireEvent.click(screen.getAllByRole('checkbox')[0]);
    fireEvent.click(screen.getByText('Next'));

    // Step 3: Add description
    await waitFor(() => {
      expect(screen.getByText('Details')).toBeInTheDocument();
    });
    fireEvent.change(
      screen.getByLabelText('Description'),
      { target: { value: 'Test description' } }
    );
    fireEvent.click(screen.getByText('Next'));

    // Step 4: Configure scoring
    await waitFor(() => {
      expect(screen.getByText('Scoring')).toBeInTheDocument();
    });
    fireEvent.click(screen.getByText('Next'));

    // Step 5: Review and submit
    await waitFor(() => {
      expect(screen.getByText('Review')).toBeInTheDocument();
    });

    (workflowService.createWorkflow as jest.Mock).mockResolvedValue({
      id: '1',
      name: 'Test Workflow',
    });

    fireEvent.click(screen.getByText('Create Workflow'));

    await waitFor(() => {
      expect(onComplete).toHaveBeenCalled();
    });
  });
});
```

### E2E Tests (Recommended)

**Tools**: Playwright or Cypress

**Example**: Playwright E2E test

```typescript
// e2e/workflow-wizard.spec.ts
import { test, expect } from '@playwright/test';

test('create workflow end-to-end', async ({ page }) => {
  await page.goto('http://localhost:8081/workflows/create');

  // Step 1
  await page.fill('input[name="name"]', 'E2E Test Workflow');
  await page.click('button:has-text("Next")');

  // Step 2
  await page.waitForSelector('text=Field Selection');
  await page.click('input[type="checkbox"]');
  await page.click('button:has-text("Next")');

  // Step 3
  await page.waitForSelector('text=Details');
  await page.fill('textarea', 'E2E test description');
  await page.click('button:has-text("Next")');

  // Step 4
  await page.waitForSelector('text=Scoring');
  await page.click('button:has-text("Next")');

  // Step 5
  await page.waitForSelector('text=Review');
  await page.click('button:has-text("Create Workflow")');

  // Verify redirect to workflows list
  await page.waitForURL('**/workflows');
  await expect(page.locator('text=E2E Test Workflow')).toBeVisible();
});
```

---

## Performance Optimization

### Code Splitting

The build automatically splits code into vendor chunks:
- `react-vendor.js`: React core libraries
- `ui-vendor.js`: UI component libraries
- `pdf-vendor.js`: PDF.js (largest)
- `data-vendor.js`: Data handling libraries
- `index.js`: Application code

**Adding Route-Based Splitting**:

```typescript
// App.tsx
import { lazy, Suspense } from 'react';

const WorkflowCreatePage = lazy(() => import('./features/workflows/WorkflowCreatePage'));

function App() {
  return (
    <Suspense fallback={<Spinner />}>
      <Routes>
        <Route path="/workflows/create" element={<WorkflowCreatePage />} />
      </Routes>
    </Suspense>
  );
}
```

### Memoization

Use `useMemo` for expensive computations:

```typescript
const filteredFields = useMemo(() => {
  return allFields.filter(field => {
    // Expensive filtering logic
    return matchesFilters(field);
  });
}, [allFields, searchQuery, selectedCategory, selectedType]);
```

Use `useCallback` for stable function references:

```typescript
const handleFieldToggle = useCallback((field: Field) => {
  setSelectedFields(prev =>
    prev.includes(field)
      ? prev.filter(f => f.id !== field.id)
      : [...prev, field]
  );
}, []);
```

### Virtualization

For very large lists (1000+ items), use virtualization:

```typescript
import { useVirtualizer } from '@tanstack/react-virtual';

function FieldList({ fields }: { fields: Field[] }) {
  const parentRef = useRef<HTMLDivElement>(null);

  const virtualizer = useVirtualizer({
    count: fields.length,
    getScrollElement: () => parentRef.current,
    estimateSize: () => 80,  // Estimated height per item
  });

  return (
    <div ref={parentRef} style={{ height: '600px', overflow: 'auto' }}>
      <div style={{ height: `${virtualizer.getTotalSize()}px`, position: 'relative' }}>
        {virtualizer.getVirtualItems().map(virtualItem => (
          <div
            key={virtualItem.key}
            style={{
              position: 'absolute',
              top: 0,
              left: 0,
              width: '100%',
              height: `${virtualItem.size}px`,
              transform: `translateY(${virtualItem.start}px)`,
            }}
          >
            <FieldCard field={fields[virtualItem.index]} />
          </div>
        ))}
      </div>
    </div>
  );
}
```

### Debouncing

Debounce search inputs:

```typescript
import { useDebouncedValue } from '@/hooks/useDebouncedValue';

function FieldSearch() {
  const [searchQuery, setSearchQuery] = useState('');
  const debouncedQuery = useDebouncedValue(searchQuery, 300);

  useEffect(() => {
    // This only runs 300ms after user stops typing
    performSearch(debouncedQuery);
  }, [debouncedQuery]);

  return (
    <SearchInput
      value={searchQuery}
      onChange={setSearchQuery}
      placeholder="Search fields..."
    />
  );
}
```

---

## Deployment

### Build for Production

```bash
npm run build
```

Output in `dist/` directory.

### Docker Build

```bash
docker build -t workflow-wizard .
```

### Environment Variables

Create `.env` file:

```env
VITE_API_URL=http://localhost:8000
VITE_APP_NAME=Omega Workflow
```

### Nginx Configuration

The `nginx.conf` handles:
- SPA routing (fallback to index.html)
- Asset caching
- Security headers
- Gzip compression

---

## Conclusion

This guide covers the essential aspects of the Workflow Wizard implementation. For specific questions or advanced customization, refer to the inline code documentation or reach out to the development team.

**Key Takeaways**:
- ✅ Feature-based architecture for scalability
- ✅ Custom hooks for reusable logic
- ✅ Type-safe with TypeScript
- ✅ Service layer for API abstraction
- ✅ Comprehensive error handling
- ✅ Production-ready build process

**Next Steps**:
1. Set up your development environment
2. Run the application locally
3. Explore the codebase
4. Make your first change
5. Write tests for new features

---

**Developer Guide Version**: 1.0
**Last Updated**: 2025-11-13
**Maintained By**: Development Team
