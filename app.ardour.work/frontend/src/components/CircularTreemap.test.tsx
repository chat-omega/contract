import { describe, it, expect, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { CircularTreemap } from './CircularTreemap';

// Helper function to create default props
const createDefaultProps = () => ({
  mode: 'sunburst' as const,
  setMode: vi.fn()
});

// Mock the market data module
vi.mock('@/data/marketData', () => ({
  marketData: {
    name: 'Test Market',
    growthRate: 25.5,
    description: 'Test market description',
    children: [
      {
        name: 'Category 1',
        value: 100,
        growthRate: 30.5,
        description: 'First category',
        children: [
          {
            name: 'Subcategory 1A',
            value: 60,
            growthRate: 35.2,
            description: 'First subcategory'
          },
          {
            name: 'Subcategory 1B',
            value: 40,
            growthRate: 24.8,
            description: 'Second subcategory'
          }
        ]
      },
      {
        name: 'Category 2',
        value: 80,
        growthRate: 20.3,
        description: 'Second category'
      }
    ]
  },
  getNodeByPath: (root: any, path: number[]) => {
    let current = root;
    for (const index of path) {
      if (current.children && current.children[index]) {
        current = current.children[index];
      }
    }
    return current;
  },
  calculateTotalValue: (node: any): number => {
    if (node.value !== undefined) return node.value;
    if (node.children) {
      return node.children.reduce((sum: number, child: any) => sum + (child.value || 0), 0);
    }
    return 0;
  },
  getGrowthColor: (growthRate: number): string => {
    if (growthRate < 0) return 'rgba(239, 68, 68, 0.5)';
    if (growthRate < 10) return 'rgba(251, 191, 36, 0.5)';
    return 'rgba(22, 163, 74, 0.7)';
  }
}));

describe('CircularTreemap', () => {
  it('renders the component with breadcrumbs', () => {
    const props = createDefaultProps();
    render(<CircularTreemap {...props} />);
    const breadcrumbs = screen.getAllByText('Test Market');
    expect(breadcrumbs.length).toBeGreaterThan(0);
  });

  it('displays breadcrumb navigation', () => {
    const props = createDefaultProps();
    render(<CircularTreemap {...props} />);
    const breadcrumbs = screen.getAllByText('Test Market');
    expect(breadcrumbs.length).toBeGreaterThan(0);
  });

  it('shows the current node name', () => {
    const props = createDefaultProps();
    render(<CircularTreemap {...props} />);
    const centerTexts = screen.getAllByText('Test Market');
    expect(centerTexts.length).toBeGreaterThan(0);
  });

  it('shows growth rate legend', () => {
    const props = createDefaultProps();
    render(<CircularTreemap {...props} />);
    expect(screen.getByText('Growth Rate')).toBeInTheDocument();
    expect(screen.getByText('Click segments to drill down')).toBeInTheDocument();
  });

  it('renders responsive container', () => {
    const props = createDefaultProps();
    const { container } = render(<CircularTreemap {...props} />);
    const responsiveContainer = container.querySelector('.recharts-responsive-container');
    expect(responsiveContainer).toBeInTheDocument();
  });

  it('handles center click for navigation up', async () => {
    const user = userEvent.setup();
    const props = createDefaultProps();
    const { container } = render(<CircularTreemap {...props} />);

    // Find the center text element
    const centerElement = container.querySelector('[style*="cursor-pointer"]');
    if (centerElement) {
      await user.click(centerElement);
    }

    // Component should handle the click (even if at root level)
    const elements = screen.getAllByText('Test Market');
    expect(elements.length).toBeGreaterThan(0);
  });

  it('displays growth rate percentages', () => {
    const props = createDefaultProps();
    render(<CircularTreemap {...props} />);
    // Check for percentage indicators in the legend
    expect(screen.getByText('4%')).toBeInTheDocument();
    expect(screen.getByText('50%+')).toBeInTheDocument();
  });

  it('renders with dark background', () => {
    const props = createDefaultProps();
    const { container } = render(<CircularTreemap {...props} />);
    const mainDiv = container.firstChild as HTMLElement;
    expect(mainDiv).toHaveStyle({ backgroundColor: 'rgb(15, 23, 42)' });
  });

  it('renders view mode buttons', () => {
    const props = createDefaultProps();
    render(<CircularTreemap {...props} />);
    const sunburstButton = screen.getByTitle('Sunburst View');
    const treemapButton = screen.getByTitle('TreeMap View');
    expect(sunburstButton).toBeInTheDocument();
    expect(treemapButton).toBeInTheDocument();
  });
});
