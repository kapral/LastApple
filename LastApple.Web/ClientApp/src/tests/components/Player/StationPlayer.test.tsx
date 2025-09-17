// Don't mock LastfmContext globally in this test - we need to use the real context
jest.unmock('../../../lastfm/LastfmContext');

import React from 'react';
import { render, screen, waitFor } from '@testing-library/react';
import { StationPlayer } from '../../../components/Player/StationPlayer';
import { LastfmContext } from '../../../lastfm/LastfmContext';
import { AuthenticationState } from '../../../authentication';
import mockMusicKit from '../../../musicKit';
import mockStationApi from '../../../restClients/StationApi';
import AsMock from '../../AsMock';
import { overrideMusicKitInstance, resetMusicKitMock } from '../../utils/musicKitTestUtils';

jest.mock('../../../restClients/LastfmApi', () => ({
    default: {
        scrobble: jest.fn().mockResolvedValue(undefined),
        updateNowPlaying: jest.fn().mockResolvedValue(undefined)
    }
}));

jest.mock('../../../restClients/AppleMusicApi', () => ({
    default: {
        getDeveloperToken: jest.fn().mockResolvedValue('mock-token')
    }
}));

jest.mock('../../../restClients/StationApi', () => ({
    __esModule: true,
    default: {
        getStation: jest.fn().mockResolvedValue({
            id: 'test-station',
            name: 'Test Station',
            songIds: ['123', '456', '789'],
            isContinuous: false,
            isGroupedByAlbum: false,
            size: 10,
            definition: {
                stationType: 'test-type'
            }
        }),
        deleteSongs: jest.fn().mockResolvedValue(undefined),
        topUp: jest.fn().mockResolvedValue(undefined)
    }
}));

jest.mock('../../../Environment', () => ({
    default: {
        apiUrl: 'http://localhost:5000/',
        hubUrl: 'http://localhost:5000/hubs/station'
    }
}));

jest.mock('../../../components/Player/Playlist', () => ({
    Playlist: ({ tracks, currentTrack, isPlaying }: any) => (
        <div data-testid="playlist">
            <div data-testid="track-count">{tracks.length}</div>
            <div data-testid="current-track">{currentTrack?.attributes?.name || 'none'}</div>
            <div data-testid="is-playing">{isPlaying ? 'playing' : 'not-playing'}</div>
        </div>
    )
}));

jest.mock('../../../components/Player/PlayerControls', () => ({
    PlayerControls: ({ currentTrack, isPlaying, switchPrev, switchNext, onPlayPause }: any) => (
        <div data-testid="player-controls">
            <div data-testid="controls-track">{currentTrack?.attributes?.name || 'none'}</div>
            <div data-testid="controls-playing">{isPlaying ? 'playing' : 'not-playing'}</div>
            <button data-testid="prev-button" onClick={switchPrev}>Previous</button>
            <button data-testid="play-pause-button" onClick={onPlayPause}>Play/Pause</button>
            <button data-testid="next-button" onClick={switchNext}>Next</button>
        </div>
    )
}));

jest.mock('react-bootstrap', () => ({
    Spinner: () => <div data-testid="spinner">Loading...</div>
}));

jest.mock('../../../MediaSessionManager', () => ({
    instance: {
        setMediaSession: jest.fn(),
        setNextHandler: jest.fn(),
        setPrevHandler: jest.fn()
    }
}));

// Mock AudioContext
global.AudioContext = jest.fn().mockImplementation(() => ({
    state: 'running'
}));

// Mock window.MusicKit
(global as any).window = global.window || {};
(global.window as any).MusicKit = {
    configure: jest.fn().mockResolvedValue({
        addEventListener: jest.fn(),
        removeEventListener: jest.fn(),
        nowPlayingItem: null,
        isPlaying: false
    }),
    formatMediaTime: jest.fn((seconds) => {
        const minutes = Math.floor(seconds / 60);
        const remainingSeconds = Math.floor(seconds % 60);
        return `${minutes}:${remainingSeconds.toString().padStart(2, '0')}`;
    })
};

const createMockAuthService = (state: AuthenticationState) => ({
    state,
    user: state === AuthenticationState.Authenticated ? { id: 'test-user', name: 'Test User', url: '', avatar: [] } : null,
    setState: jest.fn(),
    setUser: jest.fn()
});

const TestWrapper: React.FC<{
    children: React.ReactNode;
    authState?: AuthenticationState;
}> = ({ children, authState = AuthenticationState.Authenticated }) => (
    <LastfmContext.Provider value={{
        authentication: createMockAuthService(authState),
        isScrobblingEnabled: true,
        setIsScrobblingEnabled: jest.fn()
    }}>
        {children}
    </LastfmContext.Provider>
);

describe('StationPlayer', () => {
    const defaultProps = {
        stationId: 'test-station-123'
    };

    beforeEach(() => {
        jest.clearAllMocks();
        
        // Reset musicKit mock to defaults
        resetMusicKitMock();
        
        // Override only the properties we need for StationPlayer tests
        overrideMusicKitInstance({
            api: {
                music: jest.fn().mockResolvedValue({
                    data: {
                        data: [
                            {
                                id: '123',
                                attributes: {
                                    name: 'Test Song 1',
                                    artistName: 'Test Artist 1',
                                    albumName: 'Test Album 1',
                                    artwork: { url: 'https://example.com/artwork1.jpg' }
                                }
                            },
                            {
                                id: '456',
                                attributes: {
                                    name: 'Test Song 2',
                                    artistName: 'Test Artist 2',
                                    albumName: 'Test Album 2',
                                    artwork: { url: 'https://example.com/artwork2.jpg' }
                                }
                            },
                            {
                                id: '789',
                                attributes: {
                                    name: 'Test Song 3',
                                    artistName: 'Test Artist 3',
                                    albumName: 'Test Album 3',
                                    artwork: { url: 'https://example.com/artwork3.jpg' }
                                }
                            }
                        ]
                    }
                })
            },
            queue: {
                items: [],
                item: jest.fn((position) => null),
                position: -1,
                append: jest.fn(),
                prepend: jest.fn(),
                remove: jest.fn(),
            }
        });

        // Setup StationApi mock
        AsMock(mockStationApi.getStation).mockResolvedValue({
            id: 'test-station',
            name: 'Test Station',
            songIds: ['123', '456', '789'],
            isContinuous: false,
            isGroupedByAlbum: false,
            size: 10,
            definition: {
                stationType: 'test-type'
            }
        });
    });

    it('renders without crashing', async () => {
        // Import the mocked musicKit to test it directly
        const musicKit = (await import('../../../musicKit')).default;

        // Test that getInstance returns a truthy value
        const instance = await mockMusicKit.getInstance();
        expect(instance).toBeTruthy();

        render(
            <TestWrapper>
                <StationPlayer {...defaultProps} />
            </TestWrapper>
        );
    });

    it('displays loading spinner initially', () => {
        render(
            <TestWrapper>
                <StationPlayer {...defaultProps} />
            </TestWrapper>
        );

        expect(screen.getByTestId('spinner')).toBeInTheDocument();
    });

    it('renders playlist component', async () => {
        render(
            <TestWrapper>
                <StationPlayer {...defaultProps} />
            </TestWrapper>
        );

        // Wait for the component to load and render the playlist
        await waitFor(() => {
            expect(screen.getByTestId('playlist')).toBeInTheDocument();
        }, { timeout: 5000 });
    });

    it('renders player controls component', async () => {
        render(
            <TestWrapper>
                <StationPlayer {...defaultProps} />
            </TestWrapper>
        );

        await waitFor(() => {
            expect(screen.getByTestId('player-controls')).toBeInTheDocument();
        }, { timeout: 5000 });
    });

    it('has correct initial state', async () => {
        render(
            <TestWrapper>
                <StationPlayer {...defaultProps} />
            </TestWrapper>
        );

        // Wait for loading to complete
        await waitFor(() => {
            expect(screen.getByTestId('playlist')).toBeInTheDocument();
        }, { timeout: 5000 });

        // Should show no current track initially
        expect(screen.getByTestId('current-track')).toHaveTextContent('none');
        expect(screen.getByTestId('controls-track')).toHaveTextContent('none');

        // Should not be playing initially
        expect(screen.getByTestId('is-playing')).toHaveTextContent('not-playing');
        expect(screen.getByTestId('controls-playing')).toHaveTextContent('not-playing');

        // Should have 3 tracks after loading
        expect(screen.getByTestId('track-count')).toHaveTextContent('3');
    });

    it('works with different LastFM authentication states', async () => {
        render(
            <TestWrapper authState={AuthenticationState.Unauthenticated}>
                <StationPlayer {...defaultProps} />
            </TestWrapper>
        );

        // Should still render the player components
        await waitFor(() => {
            expect(screen.getByTestId('playlist')).toBeInTheDocument();
            expect(screen.getByTestId('player-controls')).toBeInTheDocument();
        }, { timeout: 5000 });
    });

    it('renders with different station IDs', async () => {
        render(
            <TestWrapper>
                <StationPlayer stationId="different-station-456" />
            </TestWrapper>
        );

        await waitFor(() => {
            expect(screen.getByTestId('playlist')).toBeInTheDocument();
            expect(screen.getByTestId('player-controls')).toBeInTheDocument();
        }, { timeout: 5000 });
    });

    it('renders control buttons', async () => {
        render(
            <TestWrapper>
                <StationPlayer {...defaultProps} />
            </TestWrapper>
        );

        await waitFor(() => {
            expect(screen.getByTestId('prev-button')).toBeInTheDocument();
            expect(screen.getByTestId('play-pause-button')).toBeInTheDocument();
            expect(screen.getByTestId('next-button')).toBeInTheDocument();
        }, { timeout: 5000 });
    });

    it('handles component unmounting gracefully', async () => {
        const { unmount } = render(
            <TestWrapper>
                <StationPlayer {...defaultProps} />
            </TestWrapper>
        );

        // Wait for component to mount and initialize
        await waitFor(() => {
            // Just wait a bit for mount to complete
        }, { timeout: 100 });

        // Should not throw when unmounting
        expect(() => unmount()).not.toThrow();
    });

    it('maintains proper component structure', async () => {
        const { container } = render(
            <TestWrapper>
                <StationPlayer {...defaultProps} />
            </TestWrapper>
        );

        // Should have a main container
        expect(container.firstChild).toBeInTheDocument();

        // Should render both playlist and controls
        await waitFor(() => {
            expect(screen.getByTestId('playlist')).toBeInTheDocument();
            expect(screen.getByTestId('player-controls')).toBeInTheDocument();
        }, { timeout: 5000 });
    });
});