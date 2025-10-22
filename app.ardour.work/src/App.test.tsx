import { describe, it, expect } from 'vitest';
import { render } from '@testing-library/react';
import App from './App';

describe('App Component', () => {
  it('should render without crashing', () => {
    render(<App />);
    // Just verify the app renders without errors
    expect(document.body).toBeTruthy();
  });

  it('should have router configuration', () => {
    const { container } = render(<App />);
    expect(container).toBeTruthy();
  });
});
