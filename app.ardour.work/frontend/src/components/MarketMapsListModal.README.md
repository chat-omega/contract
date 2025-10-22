# MarketMapsListModal Component

A comprehensive modal component for displaying market maps, strategy analyses, and company information in a three-column layout.

## Location

`/home/ubuntu/contract1/app.ardour.work/frontend/src/components/MarketMapsListModal.tsx`

## Features

### Three-Column Layout

1. **Left Column - Main Market Maps**
   - Quick access to common market maps tailored to your company
   - List of market map types with colored icons:
     - M&A Targets (blue)
     - Investment Targets (green)
     - Competitors (red)
     - Potential Customers (purple)
     - Potential M&A Acquirers (orange)
   - AI Recommended Markets button
   - My Market Maps section with:
     - Saved maps
     - Duplicate and delete actions
     - Drill-down path indicators

2. **Middle Column - Strategy Analyses**
   - List of strategic analyses with status badges:
     - Completed (green)
     - In Progress (blue)
     - Draft (gray)
   - Create new analysis button
   - Recent activity feed showing:
     - New companies added
     - Completed analyses
     - New competitors identified

3. **Right Column - Viewed Companies**
   - Recently viewed companies with:
     - Company logo/emoji
     - Company name
     - Sector information
   - Quick stats:
     - Total Companies count
     - Active Maps count
   - View all companies button

## Props

```typescript
interface MarketMapsListModalProps {
  isOpen: boolean;    // Controls modal visibility
  onClose: () => void; // Callback when modal is closed
}
```

## Usage

### Basic Example

```tsx
import { useState } from 'react';
import { MarketMapsListModal } from '@/components/MarketMapsListModal';

function MyComponent() {
  const [isModalOpen, setIsModalOpen] = useState(false);

  return (
    <>
      <button onClick={() => setIsModalOpen(true)}>
        Open Market Maps
      </button>

      <MarketMapsListModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
      />
    </>
  );
}
```

### Integration with Router

```tsx
import { useNavigate } from 'react-router-dom';
import { MarketMapsListModal } from '@/components/MarketMapsListModal';

function Dashboard() {
  const navigate = useNavigate();
  const [showMaps, setShowMaps] = useState(false);

  return (
    <div>
      <button onClick={() => setShowMaps(true)}>
        View Market Maps
      </button>

      <MarketMapsListModal
        isOpen={showMaps}
        onClose={() => setShowMaps(false)}
      />
    </div>
  );
}
```

## Styling

The component uses:
- **Dark Theme**: Slate-900/800 background colors
- **Tailwind CSS**: All styling via utility classes
- **Lucide Icons**: For all iconography
- **Hover Effects**: Smooth transitions on interactive elements
- **Responsive Design**: Three-column grid layout with proper spacing

### Color Scheme

- Background: `bg-slate-900`
- Secondary background: `bg-slate-800/50`
- Border: `border-slate-700/50`
- Text primary: `text-white`
- Text secondary: `text-slate-400`
- Accent: `bg-blue-600` (for primary actions)

## Icons Used

From `lucide-react`:
- `X` - Close button
- `Target` - M&A Targets
- `TrendingUp` - Investment Targets
- `Shield` - Competitors
- `Users` - Potential Customers
- `Building2` - M&A Acquirers
- `Copy` - Duplicate action
- `Trash2` - Delete action
- `ChevronRight` - Navigation indicator

## Accessibility Features

- **Keyboard Support**: ESC key support (handled by backdrop click)
- **Click Outside**: Modal closes when clicking backdrop
- **Focus Management**: Modal overlay prevents interaction with background
- **Semantic HTML**: Proper heading hierarchy (h2, h3, h4)

## Testing

The component includes comprehensive tests covering:
- Rendering states (open/closed)
- All sections visibility
- Content display
- User interactions (close button, backdrop)
- Quick stats and recent activity

Run tests:
```bash
npm test -- MarketMapsListModal.test.tsx
```

## File Structure

```
src/components/
├── MarketMapsListModal.tsx          # Main component
├── MarketMapsListModal.test.tsx     # Unit tests
├── MarketMapsListModal.example.tsx  # Usage examples
└── MarketMapsListModal.README.md    # This documentation
```

## Future Enhancements

Potential improvements for future iterations:

1. **Data Integration**
   - Connect to actual API endpoints
   - Dynamic market map data
   - Real company information

2. **Interactivity**
   - Click handlers for market map items
   - Strategy analysis detail views
   - Company profile navigation

3. **Customization**
   - Configurable columns
   - Custom icon colors
   - Theme support (light/dark)

4. **Advanced Features**
   - Search/filter functionality
   - Sorting options
   - Pagination for long lists
   - Export functionality

## Browser Support

- Chrome/Edge (latest)
- Firefox (latest)
- Safari (latest)
- Mobile browsers (responsive design)

## Dependencies

- React 18.2+
- lucide-react ^0.263.1
- Tailwind CSS 3.3+
- TypeScript 5.0+

## License

Part of the PE Dashboard application.
