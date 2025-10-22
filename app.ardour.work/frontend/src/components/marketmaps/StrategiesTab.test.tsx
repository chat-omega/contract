import { describe, it, expect } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import { StrategiesTab } from './StrategiesTab';

describe('StrategiesTab', () => {
  it('renders without crashing', () => {
    render(<StrategiesTab />);
    expect(screen.getByText('Your Current State')).toBeInTheDocument();
  });

  it('renders all main sections', () => {
    render(<StrategiesTab />);
    expect(screen.getByText('Your Current State')).toBeInTheDocument();
    expect(screen.getByText("What's Available to Acquire")).toBeInTheDocument();
    expect(screen.getByText('Transformation Stories')).toBeInTheDocument();
    expect(screen.getByText('Not Recommended')).toBeInTheDocument();
  });

  it('shows current state section expanded by default', () => {
    render(<StrategiesTab />);
    expect(screen.getByText('Current Offerings:')).toBeInTheDocument();
    expect(screen.getByText('Core Capabilities:')).toBeInTheDocument();
    expect(screen.getByText('Key Assets:')).toBeInTheDocument();
    expect(screen.getByText('Financial Profile:')).toBeInTheDocument();
    expect(screen.getByText('Current Trajectory:')).toBeInTheDocument();
  });

  it('toggles current state section when clicked', () => {
    render(<StrategiesTab />);
    const currentStateButton = screen.getByRole('button', { name: /your current state/i });

    // Should be visible initially
    expect(screen.getByText('Current Offerings:')).toBeInTheDocument();

    // Click to collapse
    fireEvent.click(currentStateButton);
    expect(screen.queryByText('Current Offerings:')).not.toBeInTheDocument();

    // Click to expand
    fireEvent.click(currentStateButton);
    expect(screen.getByText('Current Offerings:')).toBeInTheDocument();
  });

  it('renders all three acquisition cards', () => {
    render(<StrategiesTab />);
    expect(screen.getByText('Wearable Device Manufacturers for Fitness')).toBeInTheDocument();
    expect(screen.getByText('Mobile Fitness Tracking App Developers')).toBeInTheDocument();
    expect(screen.getByText('AI-driven Health Analytics Startups')).toBeInTheDocument();
  });

  it('shows correct fit badges for acquisition cards', () => {
    render(<StrategiesTab />);
    const fitBadges = screen.getAllByText(/% Fit/);
    expect(fitBadges).toHaveLength(6); // 3 cards + 3 transformation stories
    expect(screen.getAllByText('60% Fit')).toHaveLength(1);
    expect(screen.getAllByText('70% Fit')).toHaveLength(1);
    expect(screen.getAllByText('90% Fit')).toHaveLength(2); // One card + one transformation story
  });

  it('renders all transformation stories', () => {
    render(<StrategiesTab />);
    expect(screen.getByText('AI Analytics Leapfrog')).toBeInTheDocument();
    expect(screen.getByText('Enterprise Wellness Scale-Up')).toBeInTheDocument();
    expect(screen.getByText('Proprietary Biosensor Platform')).toBeInTheDocument();
  });

  it('shows transformation story details', () => {
    render(<StrategiesTab />);
    expect(screen.getAllByText('CURRENT STATE')).toHaveLength(3);
    expect(screen.getAllByText('ACQUIRE')).toHaveLength(3);
    expect(screen.getAllByText('FUTURE STATE')).toHaveLength(3);
    expect(screen.getAllByText('New Offerings')).toHaveLength(3);
    expect(screen.getAllByText('Financial Impact')).toHaveLength(3);
    expect(screen.getAllByText('Integration Time')).toHaveLength(3);
    expect(screen.getAllByText('Key Considerations')).toHaveLength(3);
  });

  it('shows pricing for transformation stories', () => {
    render(<StrategiesTab />);
    expect(screen.getByText('$30M-$60M')).toBeInTheDocument();
    expect(screen.getByText('$40M-$80M')).toBeInTheDocument();
    expect(screen.getByText('$25M-$50M')).toBeInTheDocument();
  });

  it('keeps not recommended section collapsed by default', () => {
    render(<StrategiesTab />);
    expect(screen.queryByText('Acquire large-scale hardware-only fitness tracker OEMs')).not.toBeInTheDocument();
    expect(screen.queryByText('Buy pure-play consumer fitness/wellness apps with no clinical/data/IP differentiation')).not.toBeInTheDocument();
  });

  it('toggles not recommended section when clicked', () => {
    render(<StrategiesTab />);
    const notRecommendedButton = screen.getByRole('button', { name: /not recommended/i });

    // Should be collapsed initially
    expect(screen.queryByText('Acquire large-scale hardware-only fitness tracker OEMs')).not.toBeInTheDocument();

    // Click to expand
    fireEvent.click(notRecommendedButton);
    expect(screen.getByText('Acquire large-scale hardware-only fitness tracker OEMs')).toBeInTheDocument();
    expect(screen.getByText('Buy pure-play consumer fitness/wellness apps with no clinical/data/IP differentiation')).toBeInTheDocument();

    // Click to collapse
    fireEvent.click(notRecommendedButton);
    expect(screen.queryByText('Acquire large-scale hardware-only fitness tracker OEMs')).not.toBeInTheDocument();
  });

  it('renders action buttons on acquisition cards', () => {
    render(<StrategiesTab />);
    const exploreButtons = screen.getAllByText('Explore');
    const findCompaniesButtons = screen.getAllByText('Find Companies');

    expect(exploreButtons).toHaveLength(3);
    expect(findCompaniesButtons).toHaveLength(3);
  });

  it('displays revenue ranges for acquisition cards', () => {
    render(<StrategiesTab />);
    expect(screen.getByText('$2M-$100M')).toBeInTheDocument();
    expect(screen.getByText('$1M-$30M')).toBeInTheDocument();
    expect(screen.getByText('$3M-$40M')).toBeInTheDocument();
  });

  it('displays integration timelines', () => {
    render(<StrategiesTab />);
    expect(screen.getByText('12-18 months')).toBeInTheDocument();
    expect(screen.getByText('9-15 months')).toBeInTheDocument();
    expect(screen.getByText('18-24 months')).toBeInTheDocument();
  });

  it('displays all fit scores correctly', () => {
    render(<StrategiesTab />);
    expect(screen.getByText('88% Fit')).toBeInTheDocument();
    expect(screen.getByText('80% Fit')).toBeInTheDocument();
  });

  it('contains Goqii company-specific content', () => {
    render(<StrategiesTab />);
    expect(screen.getAllByText(/Goqii/i).length).toBeGreaterThan(0);
    expect(screen.getByText(/GOQii Cash/i)).toBeInTheDocument();
  });

  it('includes health metaverse references', () => {
    render(<StrategiesTab />);
    const metaverseReferences = screen.getAllByText(/health metaverse/i);
    expect(metaverseReferences.length).toBeGreaterThan(0);
  });

  it('mentions India market focus', () => {
    render(<StrategiesTab />);
    const indiaReferences = screen.getAllByText(/India/i);
    expect(indiaReferences.length).toBeGreaterThan(3);
  });
});
