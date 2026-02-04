# UI Component Library - API Reference

Quick reference guide for all components in the workflow wizard UI library.

## Table of Contents
1. [Select](#select)
2. [Textarea](#textarea)
3. [Checkbox](#checkbox)
4. [Radio / RadioGroup](#radio--radiogroup)
5. [SearchInput](#searchinput)
6. [Stepper](#stepper)

---

## Select

Accessible dropdown select component using Headless UI.

### Import
```typescript
import { Select } from '@/components/ui';
```

### Basic Usage
```typescript
<Select
  label="Choose an option"
  options={[
    { value: 'opt1', label: 'Option 1' },
    { value: 'opt2', label: 'Option 2' },
  ]}
  value={value}
  onChange={setValue}
/>
```

### Props
| Prop | Type | Default | Description |
|------|------|---------|-------------|
| `label` | `string` | - | Label text above select |
| `options` | `SelectOption[]` | Required | Array of {value, label, disabled?} |
| `value` | `string` | Required | Currently selected value |
| `onChange` | `(value: string) => void` | Required | Change handler |
| `placeholder` | `string` | 'Select an option' | Placeholder text |
| `error` | `string` | - | Error message (shows red state) |
| `helperText` | `string` | - | Helper text below select |
| `disabled` | `boolean` | `false` | Disable the select |
| `fullWidth` | `boolean` | `true` | Take full container width |
| `className` | `string` | - | Additional CSS classes |

### States
- **Default**: Gray border
- **Focused**: Primary blue border with ring
- **Error**: Red border with error message
- **Disabled**: Gray background, reduced opacity

---

## Textarea

Multi-line text input with character counting.

### Import
```typescript
import { Textarea } from '@/components/ui';
```

### Basic Usage
```typescript
<Textarea
  label="Description"
  value={description}
  onChange={(e) => setDescription(e.target.value)}
  rows={4}
  showCharCount
  maxLength={500}
/>
```

### Props
| Prop | Type | Default | Description |
|------|------|---------|-------------|
| `label` | `string` | - | Label text above textarea |
| `value` | `string` | - | Current value |
| `onChange` | `ChangeEvent<HTMLTextAreaElement>` | - | Change handler |
| `rows` | `number` | `4` | Number of visible rows |
| `error` | `string` | - | Error message |
| `helperText` | `string` | - | Helper text |
| `resize` | `'none' \| 'vertical' \| 'both'` | `'vertical'` | Resize behavior |
| `showCharCount` | `boolean` | `false` | Show character counter |
| `maxLength` | `number` | - | Maximum characters |
| `disabled` | `boolean` | `false` | Disable textarea |
| `fullWidth` | `boolean` | `true` | Take full width |
| `className` | `string` | - | Additional CSS classes |

### Features
- Automatic character counting when `showCharCount` is true
- Shows "X/Y" format when maxLength is set
- Configurable resize behavior
- All standard textarea HTML attributes supported

---

## Checkbox

Custom checkbox with indeterminate state support.

### Import
```typescript
import { Checkbox } from '@/components/ui';
```

### Basic Usage
```typescript
<Checkbox
  label="Accept terms and conditions"
  description="By checking this, you agree to our terms"
  checked={accepted}
  onChange={(e) => setAccepted(e.target.checked)}
/>
```

### Props
| Prop | Type | Default | Description |
|------|------|---------|-------------|
| `label` | `string` | - | Label text next to checkbox |
| `description` | `string` | - | Description text below label |
| `checked` | `boolean` | - | Checked state |
| `onChange` | `ChangeEvent<HTMLInputElement>` | - | Change handler |
| `indeterminate` | `boolean` | `false` | Show minus icon (partial selection) |
| `error` | `string` | - | Error message |
| `disabled` | `boolean` | `false` | Disable checkbox |
| `className` | `string` | - | Additional CSS classes |

### States
- **Unchecked**: Empty white box
- **Checked**: Primary blue with checkmark
- **Indeterminate**: Primary blue with minus icon
- **Disabled**: Reduced opacity

---

## Radio / RadioGroup

Radio button components with group support.

### Import
```typescript
import { RadioGroup, Radio } from '@/components/ui';
```

### RadioGroup Usage (Recommended)
```typescript
<RadioGroup
  label="Choose a plan"
  options={[
    { value: 'basic', label: 'Basic', description: '$10/month' },
    { value: 'pro', label: 'Pro', description: '$30/month' },
  ]}
  value={plan}
  onChange={setPlan}
  orientation="vertical"
/>
```

### RadioGroup Props
| Prop | Type | Default | Description |
|------|------|---------|-------------|
| `label` | `string` | - | Label text above group |
| `options` | `RadioOption[]` | Required | Array of {value, label, description?, disabled?} |
| `value` | `string` | Required | Currently selected value |
| `onChange` | `(value: string) => void` | Required | Change handler |
| `error` | `string` | - | Error message |
| `helperText` | `string` | - | Helper text |
| `disabled` | `boolean` | `false` | Disable all radios |
| `orientation` | `'vertical' \| 'horizontal'` | `'vertical'` | Layout direction |
| `className` | `string` | - | Additional CSS classes |

### Individual Radio Usage
```typescript
<Radio
  label="Option 1"
  value="opt1"
  checked={value === 'opt1'}
  onChange={(val) => setValue(val)}
  name="options"
/>
```

### Features
- Uses Headless UI RadioGroup for accessibility
- Keyboard navigation support
- Active state highlighting
- Card-style option containers

---

## SearchInput

Search input with debouncing and clear button.

### Import
```typescript
import { SearchInput } from '@/components/ui';
```

### Basic Usage
```typescript
<SearchInput
  value={searchQuery}
  onChange={setSearchQuery}
  onSearch={handleSearch}
  debounceMs={300}
  placeholder="Search workflows..."
/>
```

### Props
| Prop | Type | Default | Description |
|------|------|---------|-------------|
| `value` | `string` | Required | Current search value |
| `onChange` | `(value: string) => void` | Required | Immediate change handler |
| `onSearch` | `(value: string) => void` | - | Debounced search callback |
| `debounceMs` | `number` | `300` | Debounce delay in milliseconds |
| `isLoading` | `boolean` | `false` | Show loading spinner |
| `label` | `string` | - | Label text above input |
| `error` | `string` | - | Error message |
| `helperText` | `string` | - | Helper text |
| `showClearButton` | `boolean` | `true` | Show clear (X) button |
| `disabled` | `boolean` | `false` | Disable input |
| `fullWidth` | `boolean` | `true` | Take full width |
| `placeholder` | `string` | 'Search...' | Placeholder text |
| `className` | `string` | - | Additional CSS classes |

### Features
- Automatic debouncing of `onSearch` callback
- Search icon on the left
- Clear button (X) on the right when value exists
- Loading spinner replaces clear button when `isLoading` is true
- All standard input HTML attributes supported

### Usage Pattern
```typescript
const [query, setQuery] = useState('');
const [loading, setLoading] = useState(false);

const handleSearch = async (value: string) => {
  setLoading(true);
  try {
    const results = await api.search(value);
    setResults(results);
  } finally {
    setLoading(false);
  }
};

<SearchInput
  value={query}
  onChange={setQuery}
  onSearch={handleSearch}
  isLoading={loading}
/>
```

---

## Stepper

Progress indicator for multi-step workflows.

### Import
```typescript
import { Stepper, VerticalStepper } from '@/components/ui';
```

### Horizontal Stepper (Default)
```typescript
<Stepper
  steps={[
    { label: 'Basic Info', description: 'Workflow details' },
    { label: 'Configure', description: 'Settings' },
    { label: 'Review', description: 'Final check' },
  ]}
  currentStep={2}
  onStepClick={(step) => setCurrentStep(step)}
/>
```

### Vertical Stepper
```typescript
<VerticalStepper
  steps={steps}
  currentStep={currentStep}
  onStepClick={setCurrentStep}
/>
```

### Props
| Prop | Type | Default | Description |
|------|------|---------|-------------|
| `steps` | `Step[]` | Required | Array of {label, description?} |
| `currentStep` | `number` | Required | Current step (1-based index) |
| `onStepClick` | `(step: number) => void` | - | Click handler (makes steps clickable) |
| `className` | `string` | - | Additional CSS classes |

### Step States
- **Completed**: Step number < currentStep - Shows checkmark, primary blue
- **Current**: Step number === currentStep - Shows number, highlighted border
- **Upcoming**: Step number > currentStep - Shows number, gray

### Features
- Connector lines between steps automatically colored
- Steps only clickable if `onStepClick` provided and step ≤ currentStep
- Responsive design
- Smooth transitions between states
- Accessible with ARIA labels

### Usage Pattern
```typescript
const [currentStep, setCurrentStep] = useState(1);
const totalSteps = 5;

const nextStep = () => setCurrentStep(Math.min(totalSteps, currentStep + 1));
const prevStep = () => setCurrentStep(Math.max(1, currentStep - 1));

<Stepper
  steps={steps}
  currentStep={currentStep}
  onStepClick={setCurrentStep} // Allow jumping to previous steps
/>

<Button onClick={prevStep} disabled={currentStep === 1}>
  Previous
</Button>
<Button onClick={nextStep} disabled={currentStep === totalSteps}>
  Next
</Button>
```

---

## Common Patterns

### Form Validation
```typescript
const [errors, setErrors] = useState<Record<string, string>>({});

<Select
  label="Trigger Type"
  options={options}
  value={triggerType}
  onChange={setTriggerType}
  error={errors.triggerType}
/>
```

### Conditional Rendering
```typescript
{triggerType === 'scheduled' && (
  <Select
    label="Frequency"
    options={frequencyOptions}
    value={frequency}
    onChange={setFrequency}
  />
)}
```

### Loading States
```typescript
<SearchInput
  value={query}
  onChange={setQuery}
  isLoading={isSearching}
/>

<Button isLoading={isSaving}>
  Save Workflow
</Button>
```

---

## Styling Notes

All components use:
- **Tailwind CSS v4** for styling
- **Primary color**: Blue (primary-500, primary-600, etc.)
- **Error color**: Red (red-500, red-600)
- **Success color**: Green (green-500, green-600)
- **Consistent spacing**: Using Tailwind spacing scale
- **Focus rings**: 2px primary-500 with offset
- **Transitions**: 200ms duration for smooth state changes

### Custom Styling
All components accept a `className` prop for custom styling:
```typescript
<Select
  className="custom-class"
  {...props}
/>
```

The `cn()` utility function merges classes intelligently, with your custom classes taking precedence for conflicting properties.

---

## Accessibility

All components follow accessibility best practices:
- ✅ Proper ARIA labels and roles
- ✅ Keyboard navigation support
- ✅ Focus management
- ✅ Screen reader friendly
- ✅ Semantic HTML
- ✅ Error announcements with `role="alert"`
- ✅ Disabled state handling

---

## TypeScript Support

All components are fully typed with TypeScript:
- Exported type definitions for all props interfaces
- Generic types where applicable
- Extends standard HTML attributes
- Proper event typing

Import types as needed:
```typescript
import type { SelectOption, Step, RadioOption } from '@/components/ui';
```

---

## Browser Support

Components work in all modern browsers:
- Chrome/Edge (latest)
- Firefox (latest)
- Safari (latest)
- Mobile browsers

Requires:
- CSS Grid and Flexbox support
- ES6+ JavaScript
- CSS custom properties (CSS variables)

---

## Next Steps

Use these components to build the workflow creation wizard in Phase 2:
1. Create wizard layout component
2. Implement 5 step forms
3. Add form validation
4. Connect to backend API
5. Add success/error handling

See `PHASE1_UI_COMPONENTS_SUMMARY.md` for implementation details.
