import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import { MarketMapsListModal } from './MarketMapsListModal';

describe('MarketMapsListModal', () => {
  it('should not render when isOpen is false', () => {
    const onClose = vi.fn();
    const { container } = render(
      <MarketMapsListModal isOpen={false} onClose={onClose} />
    );
    expect(container.firstChild).toBeNull();
  });

  it('should render when isOpen is true', () => {
    const onClose = vi.fn();
    render(<MarketMapsListModal isOpen={true} onClose={onClose} />);

    expect(screen.getByText('Market Maps')).toBeInTheDocument();
  });

  it('should display all three main sections', () => {
    const onClose = vi.fn();
    render(<MarketMapsListModal isOpen={true} onClose={onClose} />);

    expect(screen.getByText('Main Market Maps')).toBeInTheDocument();
    expect(screen.getByText('Strategy Analyses')).toBeInTheDocument();
    expect(screen.getByText('Viewed Companies')).toBeInTheDocument();
  });

  it('should display all main market map items', () => {
    const onClose = vi.fn();
    render(<MarketMapsListModal isOpen={true} onClose={onClose} />);

    // M&A Targets appears twice (main list and My Market Maps), so use getAllByText
    expect(screen.getAllByText('M&A Targets for Goqii').length).toBeGreaterThanOrEqual(1);
    expect(screen.getByText('Investment Targets for Goqii')).toBeInTheDocument();
    expect(screen.getByText('Competitors of Goqii')).toBeInTheDocument();
    expect(screen.getByText('Potential Customers for Goqii')).toBeInTheDocument();
    expect(screen.getByText('Potential M&A Acquirers for Goqii')).toBeInTheDocument();
  });

  it('should display AI Recommended Markets button', () => {
    const onClose = vi.fn();
    render(<MarketMapsListModal isOpen={true} onClose={onClose} />);

    expect(screen.getByText('AI Recommended Markets')).toBeInTheDocument();
  });

  it('should display My Market Maps section', () => {
    const onClose = vi.fn();
    render(<MarketMapsListModal isOpen={true} onClose={onClose} />);

    expect(screen.getByText('My Market Maps')).toBeInTheDocument();
    expect(screen.getByText('Wearables Tech Companies in Asia')).toBeInTheDocument();
  });

  it('should display viewed companies', () => {
    const onClose = vi.fn();
    render(<MarketMapsListModal isOpen={true} onClose={onClose} />);

    expect(screen.getByText('Fitbit')).toBeInTheDocument();
    expect(screen.getByText('Withings')).toBeInTheDocument();
    expect(screen.getByText('Garmin')).toBeInTheDocument();
    expect(screen.getByText('Oura')).toBeInTheDocument();
  });

  it('should display strategy analyses', () => {
    const onClose = vi.fn();
    render(<MarketMapsListModal isOpen={true} onClose={onClose} />);

    expect(screen.getByText('Geographic Expansion Analysis')).toBeInTheDocument();
    expect(screen.getByText('Product Line Extension')).toBeInTheDocument();
    expect(screen.getByText('Market Share Growth')).toBeInTheDocument();
  });

  it('should call onClose when close button is clicked', () => {
    const onClose = vi.fn();
    const { container } = render(<MarketMapsListModal isOpen={true} onClose={onClose} />);

    // Find the close button by its parent container class
    const closeButton = container.querySelector('.p-2.text-slate-400');
    if (closeButton) {
      fireEvent.click(closeButton);
    }

    expect(onClose).toHaveBeenCalledTimes(1);
  });

  it('should call onClose when backdrop is clicked', () => {
    const onClose = vi.fn();
    const { container } = render(
      <MarketMapsListModal isOpen={true} onClose={onClose} />
    );

    const backdrop = container.querySelector('.bg-slate-900\\/90');
    if (backdrop) {
      fireEvent.click(backdrop);
    }

    expect(onClose).toHaveBeenCalledTimes(1);
  });

  it('should display quick stats', () => {
    const onClose = vi.fn();
    render(<MarketMapsListModal isOpen={true} onClose={onClose} />);

    expect(screen.getByText('127')).toBeInTheDocument();
    expect(screen.getByText('Total Companies')).toBeInTheDocument();
    expect(screen.getByText('12')).toBeInTheDocument();
    expect(screen.getByText('Active Maps')).toBeInTheDocument();
  });

  it('should display recent activity section', () => {
    const onClose = vi.fn();
    render(<MarketMapsListModal isOpen={true} onClose={onClose} />);

    expect(screen.getByText('Recent Activity')).toBeInTheDocument();
    expect(screen.getByText('New companies added to M&A Targets')).toBeInTheDocument();
  });
});
