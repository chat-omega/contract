# CircularTreemap Component

## Overview

The `CircularTreemap` component is an interactive circular/donut chart visualization that displays hierarchical market data in a sunburst chart format. It uses Recharts' PieChart to create concentric rings representing different levels of data hierarchy.

## Location

`/home/ubuntu/contract1/app.ardour.work/frontend/src/components/CircularTreemap.tsx`

## Features

### Visual Design
- **Dark Background**: Slate-900 background (#0F172A) for high contrast
- **Circular Layout**: Sunburst/donut chart with concentric rings
- **Color Coding**: Segments colored by growth rate using `getGrowthColor()` function
- **Hierarchical Display**:
  - Inner ring: Main categories (35%-60% radius)
  - Outer ring: Subcategories (62%-85% radius)

### Interactive Features
1. **Drill-down Navigation**
   - Click any segment with children to drill down
   - Center display updates to show current level
   - Breadcrumbs show navigation path

2. **Center Information**
   - Current node name
   - Description
   - Growth rate percentage
   - Clickable to navigate up one level

3. **Hover Effects**
   - Active segment highlights with expanded radius (+8px)
   - Opacity and stroke changes on hover

4. **Breadcrumb Navigation**
   - Full path from root to current node
   - Click any breadcrumb to jump to that level
   - Current level highlighted in indigo

### Legend
- **Growth Rate Indicator**: Gradient bar showing color mapping
- **Range Labels**: 4%, 15%, 25%, 35%, 50%+
- **Helper Text**: Instructions for interaction

## Data Structure

The component uses data from `@/data/marketData`:

```typescript
interface MarketNode {
  name: string;
  value?: number;
  growthRate: number;
  description?: string;
  children?: MarketNode[];
}
```

## Props

None - The component uses the exported `marketData` from `@/data/marketData`.

## Usage

### Basic Usage

```tsx
import { CircularTreemap } from '@/components/CircularTreemap';

function MyPage() {
  return (
    <div style={{ height: '800px' }}>
      <CircularTreemap />
    </div>
  );
}
```

### Full Page Example

```tsx
import { CircularTreemap } from '@/components/CircularTreemap';

export default function MarketMapPage() {
  return (
    <div className="min-h-screen p-8" style={{ backgroundColor: 'rgb(15, 23, 42)' }}>
      <div className="max-w-7xl mx-auto">
        <div className="rounded-lg overflow-hidden shadow-2xl" style={{ height: '800px' }}>
          <CircularTreemap />
        </div>
      </div>
    </div>
  );
}
```

## Component Architecture

### State Management

```typescript
const [currentPath, setCurrentPath] = useState<number[]>([]);
const [activeIndex, setActiveIndex] = useState<number | null>(null);
```

- `currentPath`: Array of indices representing drill-down path
- `activeIndex`: Currently hovered segment index

### Key Functions

1. **handleSegmentClick(data)**: Drills down into segments with children
2. **handleBreadcrumbClick(path)**: Navigates to specific level via breadcrumbs
3. **handleCenterClick()**: Navigates up one level
4. **renderCustomLabel()**: Renders segment labels with growth rates
5. **renderActiveShape()**: Renders highlighted hover state

### Data Transformation

The component transforms hierarchical data into flat arrays for each ring:

```typescript
const nestedRings = useMemo(() => {
  const rings: SunburstSegment[][] = [sunburstData];
  // Creates multiple levels for nested display
  return rings;
}, [currentNode, sunburstData]);
```

## Styling

### Color Scheme
- Background: `rgb(15, 23, 42)` - Slate 900
- Text: White and slate variations
- Accent: Indigo 400 (`rgb(99, 102, 241)`)
- Segments: Dynamic colors based on growth rate

### Growth Rate Colors
- **Negative**: Red shades
- **Low (<10%)**: Yellow/orange
- **High (10%+)**: Green gradient (darker to brighter)

### Layout
- Header: Padding 6 (24px)
- Visualization: Flex-1 (fills available space)
- Footer Legend: Padding 6, top padding 4

## Testing

Test file: `/home/ubuntu/contract1/app.ardour.work/frontend/src/components/CircularTreemap.test.tsx`

### Test Coverage
- Component rendering
- Title and market value display
- Center node information
- Breadcrumb navigation
- Growth rate legend
- Responsive container
- Click interactions
- Dark background styling

### Running Tests

```bash
npm run test:run -- src/components/CircularTreemap.test.tsx
```

## Dependencies

- **react**: useState, useMemo hooks
- **recharts**: PieChart, Pie, Cell, ResponsiveContainer, Sector
- **lucide-react**: ChevronRight, Circle icons
- **@/data/marketData**: Data source and utilities

## Browser Compatibility

Works in all modern browsers. Uses:
- CSS Flexbox
- CSS transforms
- SVG rendering (via Recharts)
- ResizeObserver (polyfilled in tests)

## Performance Considerations

1. **Memoization**: Uses `useMemo` for expensive calculations
2. **Conditional Rendering**: Only renders labels when segments are large enough
3. **Optimized Re-renders**: State updates trigger minimal re-renders

## Accessibility

- Semantic HTML structure
- Text contrast meets WCAG AA standards
- Clickable elements have cursor: pointer
- Keyboard navigation (via button elements)

## Future Enhancements

Potential improvements:
1. Export functionality
2. Custom color schemes
3. Configurable radius sizes
4. Animation on transitions
5. Tooltip on hover
6. Zoom/pan controls
7. Search/filter functionality

## Troubleshooting

### Chart not displaying
- Ensure parent container has explicit height
- Check that marketData is properly imported
- Verify Recharts is installed

### ResizeObserver errors in tests
- Ensure test setup includes ResizeObserver polyfill
- Check `/home/ubuntu/contract1/app.ardour.work/frontend/src/test/setup.ts`

### Colors not showing correctly
- Verify `getGrowthColor()` function is working
- Check growth rate values are numbers
- Ensure segments have valid fill colors

## Demo Page

A demo page is available at:
`/home/ubuntu/contract1/app.ardour.work/frontend/src/pages/CircularTreemapDemo.tsx`

Run the development server and navigate to see the component in action:

```bash
npm run dev
```
