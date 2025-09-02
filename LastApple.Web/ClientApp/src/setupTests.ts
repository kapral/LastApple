// jest-dom adds custom jest matchers for asserting on DOM nodes.
// allows you to do things like:
// expect(element).toHaveTextContent(/react/i)
// learn more: https://github.com/testing-library/jest-dom
import '@testing-library/jest-dom';

// Mock utility functions first
jest.mock('./utils/mics', () => ({
    assertNonNullable: jest.fn((value) => {
        if (value === null || value === undefined) {
            throw new Error(`Expected non-nullable value, but got ${value}`);
        }
        return value;
    }),
}));

// Mock Apple Context with default values
const mockAppleContextValue = {
    authentication: {
        state: 1, // AuthenticationState.Unauthenticated
        setState: jest.fn(),
    },
};

jest.mock('./apple/AppleContext', () => ({
    useAppleContext: jest.fn(() => mockAppleContextValue),
    AppleContextProvider: ({ children }: any) => children,
}));

// Mock Lastfm Context with default values  
const mockLastfmContextValue = {
    authentication: {
        state: 1, // AuthenticationState.Unauthenticated
        setState: jest.fn(),
    },
    user: null,
    setUser: jest.fn(),
};

jest.mock('./lastfm/LastfmContext', () => ({
    useLastfmContext: jest.fn(() => mockLastfmContextValue),
    LastfmContextProvider: ({ children }: any) => children,
}));

// Mock MusicKit global object
const mockMusicKit = {
  configure: jest.fn().mockResolvedValue({
    addEventListener: jest.fn(),
    removeEventListener: jest.fn(),
    play: jest.fn(),
    pause: jest.fn(),
    stop: jest.fn(),
    seekToTime: jest.fn(),
    queue: {
      append: jest.fn(),
      prepend: jest.fn(),
      remove: jest.fn(),
    },
    player: {
      currentPlaybackTime: 0,
      currentPlaybackDuration: 0,
      playbackState: 0,
      isPlaying: false,
      nowPlayingItem: null,
    },
  }),
  formatMediaTime: jest.fn((seconds: number) => {
    const minutes = Math.floor(seconds / 60);
    const remainingSeconds = Math.floor(seconds % 60);
    return `${minutes}:${remainingSeconds.toString().padStart(2, '0')}`;
  }),
  MediaItemOptions: {},
};

// Mock the MusicKit namespace
(global as any).MusicKit = mockMusicKit;

// Mock window.MusicKit
Object.defineProperty(window, 'MusicKit', {
  value: mockMusicKit,
  writable: true,
});

// Mock the musicKit module
jest.mock('./musicKit', () => ({
  __esModule: true,
  default: {
    getInstance: jest.fn().mockResolvedValue({
      api: {
        music: jest.fn().mockResolvedValue({
          data: { data: [] }
        })
      },
      storefrontId: 'us',
      addEventListener: jest.fn(),
      removeEventListener: jest.fn(),
      play: jest.fn(),
      pause: jest.fn(),
      stop: jest.fn(),
      seekToTime: jest.fn(),
      isAuthorized: true,
      player: {
        currentPlaybackTime: 0,
        currentPlaybackDuration: 0,
        playbackState: 0,
        isPlaying: false,
        nowPlayingItem: null,
      },
      queue: {
        append: jest.fn(),
        prepend: jest.fn(),
        remove: jest.fn(),
      },
    }),
    instance: {
      api: {
        music: jest.fn().mockResolvedValue({
          data: { data: [] }
        })
      },
      storefrontId: 'us',
      addEventListener: jest.fn(),
      removeEventListener: jest.fn(),
      play: jest.fn(),
      pause: jest.fn(),
      stop: jest.fn(),
      seekToTime: jest.fn(),
      isAuthorized: true,
      player: {
        currentPlaybackTime: 0,
        currentPlaybackDuration: 0,
        playbackState: 0,
        isPlaying: false,
        nowPlayingItem: null,
      },
      queue: {
        append: jest.fn(),
        prepend: jest.fn(),
        remove: jest.fn(),
      },
    },
    formatMediaTime: jest.fn((seconds: number) => {
      const minutes = Math.floor(seconds / 60);
      const remainingSeconds = Math.floor(seconds % 60);
      return `${minutes}:${remainingSeconds.toString().padStart(2, '0')}`;
    }),
  },
}));

// Mock SignalR
jest.mock('@aspnet/signalr', () => ({
  HubConnectionBuilder: jest.fn().mockImplementation(() => ({
    withUrl: jest.fn().mockReturnThis(),
    build: jest.fn().mockReturnValue({
      start: jest.fn().mockResolvedValue(undefined),
      stop: jest.fn().mockResolvedValue(undefined),
      on: jest.fn(),
      off: jest.fn(),
      invoke: jest.fn().mockResolvedValue(undefined),
    }),
  })),
}));

// Mock environment variables
jest.mock('./Environment', () => {
  class MockEnvironment {
    apiUrl = 'http://localhost:5000/';
    websiteUrl = 'http://localhost:3000';
    appleAuthUrl = 'http://localhost:5000/api/apple-auth';
    lastfmAuthUrl = 'http://localhost:5000/api/lastfm-auth';
  }
  return {
    default: new MockEnvironment(),
  };
});

// Mock console.error to avoid noise in tests
const originalError = console.error;
beforeAll(() => {
  console.error = (...args: any) => {
    if (
      typeof args[0] === 'string' &&
      args[0].includes('Warning: ReactDOM.render is deprecated')
    ) {
      return;
    }
    originalError.call(console, ...args);
  };
});

afterAll(() => {
  console.error = originalError;
});