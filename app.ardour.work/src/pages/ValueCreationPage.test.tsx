import { describe, it, expect, beforeEach, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import { MemoryRouter, Route, Routes } from 'react-router-dom';
import { ValueCreationPage } from './ValueCreationPage';

const mockNavigate = vi.fn();

vi.mock('react-router-dom', async () => {
  const actual = await vi.importActual('react-router-dom');
  return {
    ...actual,
    useNavigate: () => mockNavigate,
  };
});

const renderValueCreationPage = (type: 'scout' | 'lift' | 'mesh' = 'scout', state = {}) => {
  return render(
    <MemoryRouter initialEntries={[{ pathname: `/value-creation/${type}`, state }]}>
      <Routes>
        <Route path="/value-creation/:type" element={<ValueCreationPage />} />
      </Routes>
    </MemoryRouter>
  );
};

describe('ValueCreationPage - Component Rendering Tests', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('should render without crashing for scout type', () => {
    const { container } = renderValueCreationPage('scout', {
      selectedCompanies: [{ id: '1', name: 'Test Company' }]
    });
    expect(container).toBeTruthy();
  });

  it('should render without crashing for lift type', () => {
    const { container } = renderValueCreationPage('lift', {
      selectedCompanies: [{ id: '1', name: 'Test Company' }]
    });
    expect(container).toBeTruthy();
  });

  it('should render without crashing for mesh type', () => {
    const { container } = renderValueCreationPage('mesh', {
      selectedCompanies: [{ id: '1', name: 'Test Company' }]
    });
    expect(container).toBeTruthy();
  });

  it('should show empty state when no companies selected', () => {
    renderValueCreationPage('scout', { selectedCompanies: [] });
    expect(screen.getByText('No Companies Selected')).toBeInTheDocument();
    expect(screen.getByText(/Please select portfolio companies/i)).toBeInTheDocument();
  });

  it('should render page title when companies are selected', () => {
    renderValueCreationPage('scout', {
      selectedCompanies: [{ id: '1', name: 'Test Company' }]
    });
    expect(screen.getByText(/Scout - Value Creation Opportunities/i)).toBeInTheDocument();
  });
});

describe('ValueCreationPage - Styling Verification Tests', () => {
  it('should use bg-slate-50 background', () => {
    const { container } = renderValueCreationPage('scout', {
      selectedCompanies: [{ id: '1', name: 'Test Company' }]
    });
    const mainDiv = container.querySelector('.min-h-screen.bg-slate-50');
    expect(mainDiv).toBeInTheDocument();
  });

  it('should have white header with border-b border-slate-200', () => {
    const { container } = renderValueCreationPage('scout', {
      selectedCompanies: [{ id: '1', name: 'Test Company' }]
    });
    const header = container.querySelector('.bg-white.border-b.border-slate-200');
    expect(header).toBeInTheDocument();
  });

  it('should render title with slate-900 color', () => {
    renderValueCreationPage('scout', {
      selectedCompanies: [{ id: '1', name: 'Test Company' }]
    });
    const title = screen.getByText(/Scout - Value Creation Opportunities/i);
    expect(title).toHaveClass('text-slate-900');
  });

  it('should render gradient icon with correct colors', () => {
    const { container } = renderValueCreationPage('scout', {
      selectedCompanies: [{ id: '1', name: 'Test Company' }]
    });
    const iconContainer = container.querySelector('.bg-gradient-to-br');
    expect(iconContainer).toBeInTheDocument();
  });

  it('should use consistent text color for descriptions', () => {
    renderValueCreationPage('scout', {
      selectedCompanies: [{ id: '1', name: 'Test Company' }]
    });
    const descriptions = screen.getAllByText(/portfolio companies selected/i);
    expect(descriptions[0]).toHaveClass('text-slate-600');
  });
});

describe('ValueCreationPage - Value Creation Theses Rendering', () => {
  it('should render portfolio analysis section', () => {
    renderValueCreationPage('scout', {
      selectedCompanies: [{ id: '1', name: 'Test Company' }]
    });
    expect(screen.getByText('Portfolio Analysis')).toBeInTheDocument();
  });

  it('should render value creation thesis section', () => {
    renderValueCreationPage('scout', {
      selectedCompanies: [{ id: '1', name: 'Test Company' }]
    });
    expect(screen.getByText('Value Creation Thesis')).toBeInTheDocument();
  });

  it('should render thesis cards with hover effects', () => {
    const { container } = renderValueCreationPage('scout', {
      selectedCompanies: [{ id: '1', name: 'Test Company' }]
    });
    const cards = container.querySelectorAll('.cursor-pointer.hover\\:shadow-xl');
    expect(cards.length).toBeGreaterThan(0);
  });

  it('should display thesis with risk level badges', () => {
    renderValueCreationPage('scout', {
      selectedCompanies: [{ id: '1', name: 'Test Company' }]
    });
    // Risk badges should be present
    const riskBadges = screen.getAllByText(/risk$/i);
    expect(riskBadges.length).toBeGreaterThan(0);
  });
});

describe('ValueCreationPage - Interactive Elements Tests', () => {
  it('should render back button', () => {
    const { container } = renderValueCreationPage('scout', {
      selectedCompanies: [{ id: '1', name: 'Test Company' }]
    });
    const backButton = container.querySelector('button');
    expect(backButton).toBeInTheDocument();
  });

  it('should render clickable thesis cards', () => {
    const { container } = renderValueCreationPage('scout', {
      selectedCompanies: [{ id: '1', name: 'Test Company' }]
    });
    const clickableCards = container.querySelectorAll('.cursor-pointer');
    expect(clickableCards.length).toBeGreaterThan(0);
  });
});

describe('ValueCreationPage - Console Error Tests', () => {
  it('should not generate console errors during render', () => {
    const consoleSpy = vi.spyOn(console, 'error');
    renderValueCreationPage('scout', {
      selectedCompanies: [{ id: '1', name: 'Test Company' }]
    });
    expect(consoleSpy).not.toHaveBeenCalled();
    consoleSpy.mockRestore();
  });

  it('should not generate console warnings during render', () => {
    const consoleSpy = vi.spyOn(console, 'warn');
    renderValueCreationPage('scout', {
      selectedCompanies: [{ id: '1', name: 'Test Company' }]
    });
    expect(consoleSpy).not.toHaveBeenCalled();
    consoleSpy.mockRestore();
  });
});

describe('ValueCreationPage - Type-Specific Styling', () => {
  it('should render scout type with green gradient', () => {
    const { container } = renderValueCreationPage('scout', {
      selectedCompanies: [{ id: '1', name: 'Test Company' }]
    });
    const iconContainer = container.querySelector('.from-green-600.to-green-700');
    expect(iconContainer).toBeInTheDocument();
  });

  it('should render lift type with purple gradient', () => {
    const { container } = renderValueCreationPage('lift', {
      selectedCompanies: [{ id: '1', name: 'Test Company' }]
    });
    const iconContainer = container.querySelector('.from-purple-600.to-purple-700');
    expect(iconContainer).toBeInTheDocument();
  });

  it('should render mesh type with indigo gradient', () => {
    const { container } = renderValueCreationPage('mesh', {
      selectedCompanies: [{ id: '1', name: 'Test Company' }]
    });
    const iconContainer = container.querySelector('.from-indigo-600.to-indigo-700');
    expect(iconContainer).toBeInTheDocument();
  });
});
