# Workflow Wizard - Quick Start Guide

## For Developers

### Running the Application

```bash
# Development
cd /home/ubuntu/contract1/omega-workflow/react-app
npm install
npm run dev

# Production build
npm run build
npm run preview
```

### Accessing the Wizard

**Create New Workflow:**
```
http://localhost:5173/workflows/create
```

**Edit Existing Workflow:**
```
http://localhost:5173/workflows/123/edit
```

**View Workflows List:**
```
http://localhost:5173/workflows
```

---

## File Structure

```
react-app/src/features/workflows/
├── WorkflowsPage.tsx              # Workflows list page
├── WorkflowCreatePage.tsx         # Create/edit page (wrapper)
├── components/
│   ├── WorkflowWizard.tsx         # Main wizard orchestrator
│   ├── WorkflowErrorBoundary.tsx  # Error boundary
│   └── steps/
│       ├── Step1NameTemplate.tsx  # Name & template selection
│       ├── Step2FieldSelection.tsx # Field selection
│       ├── Step3Details.tsx       # Workflow details
│       ├── Step4Scoring.tsx       # Scoring configuration
│       └── Step5Review.tsx        # Review & save
├── hooks/
│   └── useWorkflowWizard.ts       # Wizard state management
└── types/
    └── index.ts                   # TypeScript types
```

---

## Key Components

### WorkflowWizard

Main wizard component that orchestrates the 5-step process.

```tsx
import { WorkflowWizard } from './components/WorkflowWizard';

<WorkflowWizard
  mode="create"              // 'create' | 'edit'
  workflowId={123}          // Optional, for edit mode
  onComplete={(workflow) => {
    console.log('Saved:', workflow);
  }}
  onCancel={() => {
    navigate('/workflows');
  }}
/>
```

### useWorkflowWizard Hook

State management hook for the wizard.

```tsx
import { useWorkflowWizard } from './hooks/useWorkflowWizard';

const wizard = useWorkflowWizard({
  mode: 'create',
  workflowId: 123,
  onComplete: (workflow) => { ... },
  onError: (error) => { ... },
});

// Available state
wizard.currentStep      // 1-5
wizard.sessionId       // Backend session ID
wizard.formData        // All form data
wizard.validation      // Step validation
wizard.isSaving        // Save in progress
wizard.error           // Error message

// Available actions
wizard.goToNextStep()
wizard.goToPreviousStep()
wizard.goToStep(3)
wizard.updateFormData({ name: 'New Name' })
wizard.finalSave()
wizard.resetWizard()
```

---

## Integration Points

### API Endpoints

**Session Management:**
- `POST /analyze/workflows/create/init` - Initialize session
- `POST /analyze/workflows/create/:id/name` - Update name
- `POST /analyze/workflows/create/:id/template` - Update template
- `POST /analyze/workflows/create/:id/fields` - Update fields
- `POST /analyze/workflows/create/:id/details` - Update details
- `POST /analyze/workflows/create/:id/scoring` - Update scoring
- `POST /analyze/workflows/create/:id/save` - Final save

**Workflow CRUD:**
- `GET /workflows/saved` - List workflows
- `GET /workflows/saved/:id` - Get workflow
- `DELETE /workflows/saved/:id` - Delete workflow

**Supporting APIs:**
- `GET /fields?search=&limit=&offset=` - Get fields (paginated)
- `GET /analyze/workflows/templates` - Get templates

### State Management

**Zustand Store (workflowStore):**
```tsx
import { useWorkflowStore } from '@/stores/workflowStore';

const { workflows, loadWorkflows, deleteWorkflow } = useWorkflowStore();
```

**localStorage:**
```
Key: 'workflow_wizard_draft'
Data: { formData, currentStep, sessionId, timestamp }
```

---

## Common Tasks

### Adding a New Field to the Wizard

1. Update `WizardFormData` type in `types/index.ts`:
```tsx
export interface WizardFormData {
  // ... existing fields
  myNewField: string;
}
```

2. Update initial data in `useWorkflowWizard.ts`:
```tsx
const getInitialFormData = (): WizardFormData => ({
  // ... existing
  myNewField: '',
});
```

3. Add field to appropriate step component:
```tsx
// In Step3Details.tsx
<input
  value={formData.myNewField}
  onChange={(e) => onUpdate({ myNewField: e.target.value })}
/>
```

4. Update backend save in `saveProgress()` if needed.

### Adding Validation

Update `validateStep()` in `useWorkflowWizard.ts`:
```tsx
case 3: // Details
  return (
    formData.description.trim().length > 0 &&
    formData.myNewField.trim().length > 0  // New validation
  );
```

### Adding a New Step

1. Create new step component:
```tsx
// Step6Custom.tsx
export const Step6Custom: React.FC<StepProps> = ({
  formData,
  onUpdate,
  validation,
}) => {
  return <div>Step 6 content</div>;
};
```

2. Update `WizardStep` type:
```tsx
export type WizardStep = 1 | 2 | 3 | 4 | 5 | 6;
```

3. Add to `WorkflowWizard.tsx`:
```tsx
const steps = [
  // ... existing steps
  { label: 'Custom', description: 'Custom step' },
];

// In renderStepContent()
case 6:
  return <Step6Custom {...props} />;
```

4. Update validation logic.

### Customizing the Stepper

Edit the `steps` array in `WorkflowWizard.tsx`:
```tsx
const steps = [
  { label: 'Setup', description: 'Configure workflow' },
  { label: 'Fields', description: 'Select data points' },
  // ... etc
];
```

---

## Testing

### Unit Testing (Example)

```tsx
import { renderHook } from '@testing-library/react-hooks';
import { useWorkflowWizard } from './useWorkflowWizard';

test('initializes with step 1', () => {
  const { result } = renderHook(() => useWorkflowWizard());
  expect(result.current.currentStep).toBe(1);
});
```

### Manual Testing Checklist

- [ ] Create workflow from scratch
- [ ] Create workflow from template
- [ ] Edit existing workflow
- [ ] Delete workflow
- [ ] Cancel workflow creation
- [ ] Page refresh recovery
- [ ] Field search and pagination
- [ ] Error handling
- [ ] Validation messages

---

## Debugging

### Enable Debug Info

Debug panel is automatically shown in development mode (see `WorkflowWizard.tsx`).

### Check localStorage

```javascript
// In browser console
localStorage.getItem('workflow_wizard_draft')
```

### Check Session ID

Look for "Session ID: XXX" under the wizard title.

### Monitor API Calls

Open browser DevTools → Network tab → Filter by `/analyze/workflows/`

### Common Issues

**"No active session" error:**
- Check that `initWorkflowSession()` was called
- Verify backend is running
- Check network tab for failed requests

**Data not persisting:**
- Check localStorage quota
- Verify auto-save is working (2s debounce)
- Check backend session endpoints

**Validation not working:**
- Check `validateStep()` logic in `useWorkflowWizard.ts`
- Verify form data is being updated
- Check validation state in debug panel

---

## Performance Tips

### Optimize Field Loading

Fields are loaded with pagination (default 50 per page). Adjust in `Step2FieldSelection.tsx`:
```tsx
const FIELDS_PER_PAGE = 100; // Increase if needed
```

### Reduce Auto-Save Frequency

Adjust debounce timeout in `useWorkflowWizard.ts`:
```tsx
autoSaveTimeoutRef.current = setTimeout(() => {
  saveProgress(state.currentStep);
}, 3000); // Increase to 3 seconds
```

### Memoize Expensive Computations

```tsx
const filteredFields = useMemo(() => {
  return fields.filter(...);
}, [fields, searchTerm]);
```

---

## Deployment

### Environment Variables

Create `.env.production`:
```
VITE_API_URL=https://api.yourapp.com
```

### Build

```bash
npm run build
```

Output in `dist/` folder.

### Deploy

Copy `dist/` contents to your web server or CDN.

---

## Support

### Documentation
- `WORKFLOW_WIZARD_INTEGRATION_COMPLETE.md` - Full integration guide
- `PHASE_6_INTEGRATION_SUMMARY.md` - Phase 6 summary
- Component JSDoc comments

### Code Examples
- See existing step components for patterns
- Check `useWorkflowWizard.ts` for state management
- Review `WorkflowWizard.tsx` for orchestration

---

## Quick Commands

```bash
# Start dev server
npm run dev

# Build for production
npm run build

# Type check
npm run type-check

# Lint
npm run lint

# Preview production build
npm run preview
```

---

## Architecture Decisions

### Why Session-Based?
- Allows incremental saves
- Enables recovery on crash/refresh
- Better UX for long forms
- Supports auto-save

### Why Zustand?
- Lightweight state management
- No boilerplate
- Good TypeScript support
- Easy to test

### Why Custom Hook?
- Encapsulates wizard logic
- Reusable across pages
- Easier to test
- Clear separation of concerns

### Why Error Boundary?
- Prevents app crash
- Better error recovery
- Improved UX
- Dev-friendly debugging

---

**Last Updated:** 2025-11-13
**Version:** 1.0.0
**Status:** Production Ready (pending testing)
