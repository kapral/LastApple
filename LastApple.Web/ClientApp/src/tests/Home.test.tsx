import React from 'react';
import { render, screen } from '@testing-library/react';
import { Home } from '../components/Home';

// Mock the custom hook and components at the module level
jest.mock('../hooks/useAppleUnauthenticatedWarning', () => ({
  useAppleUnauthenticatedWarning: jest.fn(),
}));

jest.mock('../components/StationsList', () => ({
  StationsList: () => <div data-testid="stations-list">StationsList</div>,
}));

describe('Home Component', () => {
  const mockUseAppleUnauthenticatedWarning = require('../hooks/useAppleUnauthenticatedWarning').useAppleUnauthenticatedWarning;

  beforeEach(() => {
    jest.clearAllMocks();
    // Set default mock implementation
    mockUseAppleUnauthenticatedWarning.mockReturnValue({
      isShown: false,
      Element: null,
    });
  });

  it('renders StationsList component', () => {
    render(<Home />);
    
    expect(screen.getByTestId('stations-list')).toBeInTheDocument();
  });

  it('does not show warning when not needed', () => {
    mockUseAppleUnauthenticatedWarning.mockReturnValue({
      isShown: false,
      Element: null,
    });

    render(<Home />);
    
    expect(screen.getByTestId('stations-list')).toBeInTheDocument();
    expect(screen.queryByTestId('apple-warning')).not.toBeInTheDocument();
  });

  it('shows warning when needed', () => {
    mockUseAppleUnauthenticatedWarning.mockReturnValue({
      isShown: true,
      Element: <div data-testid="apple-warning">Warning</div>,
    });

    render(<Home />);
    
    expect(screen.getByTestId('stations-list')).toBeInTheDocument();
    expect(screen.getByTestId('apple-warning')).toBeInTheDocument();
  });
});