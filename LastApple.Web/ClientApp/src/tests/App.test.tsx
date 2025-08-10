import React from 'react';
import { render, screen } from '@testing-library/react';
import { App } from '../App';

// Mock all the dependencies that App component uses
jest.mock('../hooks/useStartupAppleAuthenticationCheck', () => ({
  useStartupAppleAuthenticationCheck: jest.fn(),
}));

jest.mock('../hooks/useStartupLastfmAuthenticationCheck', () => ({
  useStartupLastfmAuthenticationCheck: jest.fn(),
}));

jest.mock('../AppContext', () => ({
  useAppContext: jest.fn(() => ({
    latestStationId: null,
  })),
  AppContextProvider: ({ children }: any) => children,
}));

jest.mock('../components/Layout', () => ({
  Layout: ({ children }: any) => <div data-testid="layout">{children}</div>,
}));

jest.mock('../components/Home', () => ({
  Home: () => <div data-testid="home">Home</div>,
}));

jest.mock('../components/Settings', () => ({
  Settings: () => <div data-testid="settings">Settings</div>,
}));

jest.mock('../components/NowPlaying', () => ({
  NowPlaying: ({ stationId, showPlayer }: any) => (
    <div data-testid="now-playing">
      Now Playing - Station: {stationId}, Show Player: {showPlayer ? 'true' : 'false'}
    </div>
  ),
}));

describe('App Component', () => {
  it('renders without crashing', () => {
    render(<App />);
    expect(screen.getByTestId('layout')).toBeInTheDocument();
  });

  it('renders the layout with router', () => {
    render(<App />);
    expect(screen.getByTestId('layout')).toBeInTheDocument();
    expect(screen.getByTestId('now-playing')).toBeInTheDocument();
  });
});
