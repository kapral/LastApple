import React from 'react';
import { render, screen } from '@testing-library/react';
import { BrowserRouter } from 'react-router-dom';
import { AppleUnauthenticatedWarning } from '../../components/AppleUnauthenticatedWarning';

describe('AppleUnauthenticatedWarning', () => {
  const renderWithRouter = (component: React.ReactElement) => {
    return render(
      <BrowserRouter>
        {component}
      </BrowserRouter>
    );
  };

  it('should render warning message about Apple Music connection', () => {
    renderWithRouter(<AppleUnauthenticatedWarning />);

    expect(screen.getByText(/You have no Apple Music account connected/)).toBeInTheDocument();
    expect(screen.getByText(/listen only to 30 second previews/)).toBeInTheDocument();
    expect(screen.getByText(/Log in to Apple Music/)).toBeInTheDocument();
    expect(screen.getByText(/enjoy full songs/)).toBeInTheDocument();
  });

  it('should have warning alert styling', () => {
    renderWithRouter(<AppleUnauthenticatedWarning />);

    const alertDiv = screen.getByText(/You have no Apple Music account connected/).closest('div');
    expect(alertDiv).toHaveClass('alert', 'alert-warning');
  });

  it('should contain a link to Settings page', () => {
    renderWithRouter(<AppleUnauthenticatedWarning />);

    const settingsLink = screen.getByRole('link', { name: 'Settings' });
    expect(settingsLink).toBeInTheDocument();
    expect(settingsLink).toHaveAttribute('href', '/settings');
  });

  it('should render complete warning text with link', () => {
    renderWithRouter(<AppleUnauthenticatedWarning />);

    const warningDiv = screen.getByText(/You have no Apple Music account connected/).closest('div');
    expect(warningDiv).toHaveTextContent(
      'You have no Apple Music account connected and can listen only to 30 second previews. Log in to Apple Music on the Settings tab to enjoy full songs!'
    );
  });
});