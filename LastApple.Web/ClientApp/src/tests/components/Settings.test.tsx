import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { Settings } from '../../components/Settings';
import { AppleContextProvider, AppleContext } from '../../apple/AppleContext';
import { LastfmContextProvider, LastfmContext } from '../../lastfm/LastfmContext';
import { AuthenticationState, IAuthenticationService } from '../../authentication';

// Mock the authentication services
jest.mock('../../apple/appleAuthentication', () => ({
  loginApple: jest.fn(),
  logoutApple: jest.fn()
}));

jest.mock('../../lastfm/lastfmAuthentication', () => ({
  loginLastfm: jest.fn(),
  logoutLastfm: jest.fn()
}));

// Mock the images
jest.mock('../../images/apple-music-logo.png', () => 'apple-music-logo.png');
jest.mock('../../images/lastfm-logo.png', () => 'lastfm-logo.png');

const createMockAuthService = (state: AuthenticationState): IAuthenticationService => ({
  state,
  user: state === AuthenticationState.Authenticated ? { id: 'test-user', name: 'Test User' } : null,
  setState: jest.fn(),
  setUser: jest.fn()
});

const TestWrapper: React.FC<{ 
  children: React.ReactNode;
  appleState?: AuthenticationState;
  lastfmState?: AuthenticationState;
}> = ({ 
  children, 
  appleState = AuthenticationState.Unauthenticated,
  lastfmState = AuthenticationState.Unauthenticated 
}) => (
  <AppleContext.Provider value={{
    authentication: createMockAuthService(appleState)
  }}>
    <LastfmContext.Provider value={{
      authentication: createMockAuthService(lastfmState),
      scrobblePreference: { enabled: true },
      setScrobblePreference: jest.fn()
    }}>
      {children}
    </LastfmContext.Provider>
  </AppleContext.Provider>
);

describe('Settings', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('renders without crashing', () => {
    render(
      <TestWrapper>
        <Settings />
      </TestWrapper>
    );
  });

  it('shows loading spinner when Apple authentication is loading', () => {
    render(
      <TestWrapper appleState={AuthenticationState.Loading}>
        <Settings />
      </TestWrapper>
    );

    expect(screen.getByRole('status')).toBeInTheDocument(); // Spinner has role="status"
  });

  it('shows loading spinner when Last.fm authentication is loading', () => {
    render(
      <TestWrapper lastfmState={AuthenticationState.Loading}>
        <Settings />
      </TestWrapper>
    );

    expect(screen.getByRole('status')).toBeInTheDocument();
  });

  it('displays Connected accounts header', () => {
    render(
      <TestWrapper>
        <Settings />
      </TestWrapper>
    );

    expect(screen.getByText('Connected accounts')).toBeInTheDocument();
  });

  it('displays Apple Music and Last.fm sections', () => {
    render(
      <TestWrapper>
        <Settings />
      </TestWrapper>
    );

    expect(screen.getByText('Apple Music')).toBeInTheDocument();
    expect(screen.getByText('Last.fm')).toBeInTheDocument();
  });

  it('displays Apple Music logo', () => {
    render(
      <TestWrapper>
        <Settings />
      </TestWrapper>
    );

    const appleLogoImg = screen.getByAltText('Apple Music Logo');
    expect(appleLogoImg).toBeInTheDocument();
    expect(appleLogoImg).toHaveAttribute('src', 'apple-music-logo.png');
  });

  it('displays Last.fm logo', () => {
    render(
      <TestWrapper>
        <Settings />
      </TestWrapper>
    );

    const lastfmLogoImg = screen.getByAltText('Last.fm logo');
    expect(lastfmLogoImg).toBeInTheDocument();
    expect(lastfmLogoImg).toHaveAttribute('src', 'lastfm-logo.png');
  });

  it('shows Apple Music switch as off when unauthenticated', () => {
    render(
      <TestWrapper appleState={AuthenticationState.Unauthenticated}>
        <Settings />
      </TestWrapper>
    );

    const switches = screen.getAllByRole('switch');
    const appleSwitch = switches[0]; // First switch is Apple Music
    expect(appleSwitch).not.toBeChecked();
  });

  it('shows Apple Music switch as on when authenticated', () => {
    render(
      <TestWrapper appleState={AuthenticationState.Authenticated}>
        <Settings />
      </TestWrapper>
    );

    const switches = screen.getAllByRole('switch');
    const appleSwitch = switches[0];
    expect(appleSwitch).toBeChecked();
  });

  it('shows Last.fm switch as off when unauthenticated', () => {
    render(
      <TestWrapper lastfmState={AuthenticationState.Unauthenticated}>
        <Settings />
      </TestWrapper>
    );

    const switches = screen.getAllByRole('switch');
    const lastfmSwitch = switches[1]; // Second switch is Last.fm
    expect(lastfmSwitch).not.toBeChecked();
  });

  it('shows Last.fm switch as on when authenticated', () => {
    render(
      <TestWrapper lastfmState={AuthenticationState.Authenticated}>
        <Settings />
      </TestWrapper>
    );

    const switches = screen.getAllByRole('switch');
    const lastfmSwitch = switches[1];
    expect(lastfmSwitch).toBeChecked();
  });

  it('calls Apple login when Apple switch is toggled on', async () => {
    const { loginApple } = require('../../apple/appleAuthentication');

    render(
      <TestWrapper appleState={AuthenticationState.Unauthenticated}>
        <Settings />
      </TestWrapper>
    );

    const switches = screen.getAllByRole('switch');
    const appleSwitch = switches[0];
    
    fireEvent.click(appleSwitch);

    await waitFor(() => {
      expect(loginApple).toHaveBeenCalled();
    });
  });

  it('calls Apple logout when Apple switch is toggled off', async () => {
    const { logoutApple } = require('../../apple/appleAuthentication');

    render(
      <TestWrapper appleState={AuthenticationState.Authenticated}>
        <Settings />
      </TestWrapper>
    );

    const switches = screen.getAllByRole('switch');
    const appleSwitch = switches[0];
    
    fireEvent.click(appleSwitch);

    await waitFor(() => {
      expect(logoutApple).toHaveBeenCalled();
    });
  });

  it('calls Last.fm login when Last.fm switch is toggled on', async () => {
    const { loginLastfm } = require('../../lastfm/lastfmAuthentication');

    render(
      <TestWrapper lastfmState={AuthenticationState.Unauthenticated}>
        <Settings />
      </TestWrapper>
    );

    const switches = screen.getAllByRole('switch');
    const lastfmSwitch = switches[1];
    
    fireEvent.click(lastfmSwitch);

    await waitFor(() => {
      expect(loginLastfm).toHaveBeenCalled();
    });
  });

  it('calls Last.fm logout when Last.fm switch is toggled off', async () => {
    const { logoutLastfm } = require('../../lastfm/lastfmAuthentication');

    render(
      <TestWrapper lastfmState={AuthenticationState.Authenticated}>
        <Settings />
      </TestWrapper>
    );

    const switches = screen.getAllByRole('switch');
    const lastfmSwitch = switches[1];
    
    fireEvent.click(lastfmSwitch);

    await waitFor(() => {
      expect(logoutLastfm).toHaveBeenCalled();
    });
  });
});