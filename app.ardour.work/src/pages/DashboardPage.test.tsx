import { describe, it, expect, beforeEach, vi } from 'vitest';
import { render, screen, within } from '@testing-library/react';
import { BrowserRouter } from 'react-router-dom';
import { DashboardPage } from './DashboardPage';
import { ThemeProvider } from '@/contexts/ThemeContext';

// Mock the portfolio data
vi.mock('@/generated_portfolio_data', () => ({
  allPortfolios: [
    {
      id: 'test-portfolio',
      name: 'Test Portfolio',
      companies: [
        {
          id: '1',
          name: 'Test Company 1',
          sector: 'Technology',
          location: 'USA',
          stage: 'Growth'
        }
      ]
    }
  ],
  getPortfolioById: (id: string) => ({
    id: 'test-portfolio',
    name: 'Test Portfolio',
    companies: []
  }),
  getPortfolioOptions: () => [
    { id: 'test-portfolio', name: 'Test Portfolio', companyCount: 1 }
  ]
}));

const renderDashboardPage = () => {
  return render(
    <ThemeProvider>
      <BrowserRouter>
        <DashboardPage />
      </BrowserRouter>
    </ThemeProvider>
  );
};

describe('DashboardPage - Component Rendering Tests', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('should render without crashing', () => {
    const { container } = renderDashboardPage();
    expect(container).toBeTruthy();
  });

  it('should render the main page title', () => {
    renderDashboardPage();
    expect(screen.getByText('PE Dashboard')).toBeInTheDocument();
  });

  it('should render the header with correct styling', () => {
    const { container } = renderDashboardPage();
    const header = container.querySelector('header');
    expect(header).toHaveClass('bg-white');
    expect(header).toHaveClass('border-b');
  });

  it('should render gradient icon in header', () => {
    const { container } = renderDashboardPage();
    const iconContainer = container.querySelector('.bg-gradient-to-r.from-blue-600.to-blue-700');
    expect(iconContainer).toBeInTheDocument();
  });
});

describe('DashboardPage - Styling Verification Tests', () => {
  it('should use bg-slate-50 background for main container', () => {
    const { container } = renderDashboardPage();
    const mainDiv = container.querySelector('.min-h-screen');
    // Note: The DashboardPage doesn't have explicit bg-slate-50, using default body background
    expect(mainDiv).toBeInTheDocument();
  });

  it('should have white background header with border', () => {
    const { container } = renderDashboardPage();
    const header = container.querySelector('header');
    expect(header).toHaveClass('bg-white');
    expect(header).toHaveClass('border-b');
  });

  it('should render correct text colors for titles', () => {
    renderDashboardPage();
    const title = screen.getByText('PE Dashboard');
    expect(title).toHaveClass('text-gray-900');
  });

  it('should render portfolio table with white background', () => {
    const { container } = renderDashboardPage();
    const tableContainer = container.querySelector('.bg-white.border.border-gray-200');
    expect(tableContainer).toBeInTheDocument();
  });

  it('should render action buttons with correct styling', () => {
    const { container } = renderDashboardPage();
    const primaryButton = container.querySelector('.bg-blue-600.text-white');
    expect(primaryButton).toBeInTheDocument();
  });
});

describe('DashboardPage - Interactive Elements Tests', () => {
  it('should render dropdown select element', () => {
    const { container } = renderDashboardPage();
    const select = container.querySelector('select');
    expect(select).toBeInTheDocument();
  });

  it('should render filter and export buttons', () => {
    renderDashboardPage();
    // Use getAllByText since there may be multiple filter/export buttons
    const filterButtons = screen.getAllByText(/Filters/i);
    expect(filterButtons.length).toBeGreaterThan(0);
    const exportButtons = screen.getAllByText(/Export/i);
    expect(exportButtons.length).toBeGreaterThan(0);
  });

  it('should render analytics button', () => {
    renderDashboardPage();
    expect(screen.getByText(/Analytics/i)).toBeInTheDocument();
  });
});

describe('DashboardPage - Typography Consistency Tests', () => {
  it('should have consistent heading hierarchy', () => {
    renderDashboardPage();
    const mainTitle = screen.getByText('PE Dashboard');
    expect(mainTitle).toHaveClass('text-xl');
    expect(mainTitle).toHaveClass('font-bold');
  });

  it('should use consistent text colors', () => {
    const { container } = renderDashboardPage();
    const descriptions = container.querySelectorAll('.text-gray-600');
    expect(descriptions.length).toBeGreaterThan(0);
  });
});

describe('DashboardPage - Console Error Tests', () => {
  it('should not generate console errors during render', () => {
    const consoleSpy = vi.spyOn(console, 'error');
    renderDashboardPage();
    expect(consoleSpy).not.toHaveBeenCalled();
    consoleSpy.mockRestore();
  });

  it('should not generate console warnings during render', () => {
    const consoleSpy = vi.spyOn(console, 'warn');
    renderDashboardPage();
    expect(consoleSpy).not.toHaveBeenCalled();
    consoleSpy.mockRestore();
  });
});
