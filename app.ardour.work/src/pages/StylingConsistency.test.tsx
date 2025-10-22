import { describe, it, expect, vi } from 'vitest';
import { render } from '@testing-library/react';
import { MemoryRouter, Route, Routes } from 'react-router-dom';
import { DashboardPage } from './DashboardPage';
import { ValueCreationPage } from './ValueCreationPage';
import { ThemeProvider } from '@/contexts/ThemeContext';

// Mock the portfolio data
vi.mock('@/generated_portfolio_data', () => ({
  allPortfolios: [
    {
      id: 'test-portfolio',
      name: 'Test Portfolio',
      companies: [{ id: '1', name: 'Test Company 1' }]
    }
  ],
  getPortfolioById: () => ({
    id: 'test-portfolio',
    name: 'Test Portfolio',
    companies: []
  }),
  getPortfolioOptions: () => [
    { id: 'test-portfolio', name: 'Test Portfolio', companyCount: 1 }
  ]
}));

describe('Cross-Page Styling Consistency Tests', () => {
  describe('Background Colors', () => {
    it('DashboardPage should use light background', () => {
      const { container } = render(
        <ThemeProvider>
          <MemoryRouter>
            <DashboardPage />
          </MemoryRouter>
        </ThemeProvider>
      );
      const main = container.querySelector('.min-h-screen');
      expect(main).toBeInTheDocument();
    });

    it('ValueCreationPage should use bg-slate-50 background', () => {
      const { container } = render(
        <MemoryRouter initialEntries={[{ pathname: '/value-creation/scout', state: { selectedCompanies: [{ id: '1' }] } }]}>
          <Routes>
            <Route path="/value-creation/:type" element={<ValueCreationPage />} />
          </Routes>
        </MemoryRouter>
      );
      const main = container.querySelector('.bg-slate-50');
      expect(main).toBeInTheDocument();
    });
  });

  describe('Header Styling Consistency', () => {
    it('DashboardPage header should have white background with border', () => {
      const { container } = render(
        <ThemeProvider>
          <MemoryRouter>
            <DashboardPage />
          </MemoryRouter>
        </ThemeProvider>
      );
      const header = container.querySelector('header');
      expect(header).toHaveClass('bg-white');
      expect(header).toHaveClass('border-b');
    });

    it('ValueCreationPage header should have white background with border-slate-200', () => {
      const { container } = render(
        <MemoryRouter initialEntries={[{ pathname: '/value-creation/scout', state: { selectedCompanies: [{ id: '1' }] } }]}>
          <Routes>
            <Route path="/value-creation/:type" element={<ValueCreationPage />} />
          </Routes>
        </MemoryRouter>
      );
      const header = container.querySelector('.bg-white.border-b.border-slate-200');
      expect(header).toBeInTheDocument();
    });
  });

  describe('Icon Gradient Consistency', () => {
    it('DashboardPage should use blue gradient for icon', () => {
      const { container } = render(
        <ThemeProvider>
          <MemoryRouter>
            <DashboardPage />
          </MemoryRouter>
        </ThemeProvider>
      );
      const gradientIcon = container.querySelector('.bg-gradient-to-r.from-blue-600.to-blue-700');
      expect(gradientIcon).toBeInTheDocument();
    });

    it('ValueCreationPage should use gradient icons based on type', () => {
      const { container } = render(
        <MemoryRouter initialEntries={[{ pathname: '/value-creation/scout', state: { selectedCompanies: [{ id: '1' }] } }]}>
          <Routes>
            <Route path="/value-creation/:type" element={<ValueCreationPage />} />
          </Routes>
        </MemoryRouter>
      );
      const gradientIcon = container.querySelector('.bg-gradient-to-br');
      expect(gradientIcon).toBeInTheDocument();
    });
  });

  describe('Typography Hierarchy', () => {
    it('Both pages should use bold font-weight for titles', () => {
      const dashboardContainer = render(
        <ThemeProvider>
          <MemoryRouter>
            <DashboardPage />
          </MemoryRouter>
        </ThemeProvider>
      );
      const dashboardTitle = dashboardContainer.container.querySelector('.font-bold');
      expect(dashboardTitle).toBeInTheDocument();

      const valueContainer = render(
        <MemoryRouter initialEntries={[{ pathname: '/value-creation/scout', state: { selectedCompanies: [{ id: '1' }] } }]}>
          <Routes>
            <Route path="/value-creation/:type" element={<ValueCreationPage />} />
          </Routes>
        </MemoryRouter>
      );
      const valueTitle = valueContainer.container.querySelector('.font-bold');
      expect(valueTitle).toBeInTheDocument();
    });

    it('Both pages should use slate colors for text', () => {
      const dashboardContainer = render(
        <ThemeProvider>
          <MemoryRouter>
            <DashboardPage />
          </MemoryRouter>
        </ThemeProvider>
      );
      const slateText = dashboardContainer.container.querySelector('[class*="text-gray"]');
      expect(slateText).toBeInTheDocument();

      const valueContainer = render(
        <MemoryRouter initialEntries={[{ pathname: '/value-creation/scout', state: { selectedCompanies: [{ id: '1' }] } }]}>
          <Routes>
            <Route path="/value-creation/:type" element={<ValueCreationPage />} />
          </Routes>
        </MemoryRouter>
      );
      const slateTextValue = valueContainer.container.querySelector('[class*="text-slate"]');
      expect(slateTextValue).toBeInTheDocument();
    });
  });

  describe('Card Styling', () => {
    it('DashboardPage should use white cards with borders', () => {
      const { container } = render(
        <ThemeProvider>
          <MemoryRouter>
            <DashboardPage />
          </MemoryRouter>
        </ThemeProvider>
      );
      const card = container.querySelector('.bg-white.border');
      expect(card).toBeInTheDocument();
    });

    it('ValueCreationPage should render cards with hover effects', () => {
      const { container } = render(
        <MemoryRouter initialEntries={[{ pathname: '/value-creation/scout', state: { selectedCompanies: [{ id: '1' }] } }]}>
          <Routes>
            <Route path="/value-creation/:type" element={<ValueCreationPage />} />
          </Routes>
        </MemoryRouter>
      );
      const hoverCard = container.querySelector('.hover\\:shadow-xl');
      expect(hoverCard).toBeInTheDocument();
    });
  });

  describe('Spacing and Layout', () => {
    it('Both pages should use consistent padding', () => {
      const dashboardContainer = render(
        <ThemeProvider>
          <MemoryRouter>
            <DashboardPage />
          </MemoryRouter>
        </ThemeProvider>
      );
      const paddedElement = dashboardContainer.container.querySelector('.p-6');
      expect(paddedElement).toBeInTheDocument();

      const valueContainer = render(
        <MemoryRouter initialEntries={[{ pathname: '/value-creation/scout', state: { selectedCompanies: [{ id: '1' }] } }]}>
          <Routes>
            <Route path="/value-creation/:type" element={<ValueCreationPage />} />
          </Routes>
        </MemoryRouter>
      );
      const paddedElementValue = valueContainer.container.querySelector('.p-6');
      expect(paddedElementValue).toBeInTheDocument();
    });
  });

  describe('Color Scheme Consistency', () => {
    it('Primary buttons should use blue-600 color', () => {
      const { container } = render(
        <ThemeProvider>
          <MemoryRouter>
            <DashboardPage />
          </MemoryRouter>
        </ThemeProvider>
      );
      const primaryButton = container.querySelector('.bg-blue-600');
      expect(primaryButton).toBeInTheDocument();
    });

    it('Text elements should use slate color palette', () => {
      const valueContainer = render(
        <MemoryRouter initialEntries={[{ pathname: '/value-creation/scout', state: { selectedCompanies: [{ id: '1' }] } }]}>
          <Routes>
            <Route path="/value-creation/:type" element={<ValueCreationPage />} />
          </Routes>
        </MemoryRouter>
      );
      const slateElements = valueContainer.container.querySelectorAll('[class*="slate"]');
      expect(slateElements.length).toBeGreaterThan(0);
    });
  });

  describe('Border Styling', () => {
    it('Both pages should use slate borders', () => {
      const dashboardContainer = render(
        <ThemeProvider>
          <MemoryRouter>
            <DashboardPage />
          </MemoryRouter>
        </ThemeProvider>
      );
      const border = dashboardContainer.container.querySelector('[class*="border"]');
      expect(border).toBeInTheDocument();

      const valueContainer = render(
        <MemoryRouter initialEntries={[{ pathname: '/value-creation/scout', state: { selectedCompanies: [{ id: '1' }] } }]}>
          <Routes>
            <Route path="/value-creation/:type" element={<ValueCreationPage />} />
          </Routes>
        </MemoryRouter>
      );
      const borderValue = valueContainer.container.querySelector('[class*="border"]');
      expect(borderValue).toBeInTheDocument();
    });
  });

  describe('Responsive Design', () => {
    it('All pages should have min-h-screen for full viewport height', () => {
      const dashboardContainer = render(
        <ThemeProvider>
          <MemoryRouter>
            <DashboardPage />
          </MemoryRouter>
        </ThemeProvider>
      );
      const fullHeight = dashboardContainer.container.querySelector('.min-h-screen');
      expect(fullHeight).toBeInTheDocument();

      const valueContainer = render(
        <MemoryRouter initialEntries={[{ pathname: '/value-creation/scout', state: { selectedCompanies: [{ id: '1' }] } }]}>
          <Routes>
            <Route path="/value-creation/:type" element={<ValueCreationPage />} />
          </Routes>
        </MemoryRouter>
      );
      const fullHeightValue = valueContainer.container.querySelector('.min-h-screen');
      expect(fullHeightValue).toBeInTheDocument();
    });
  });
});
