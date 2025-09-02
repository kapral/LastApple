// Don't mock LastfmContext globally in this test - we need to use the real context
jest.unmock('../../../lastfm/LastfmContext');

// Unmock the global musicKit mock so we can provide our own
jest.unmock('../../../musicKit');

// Mock SignalR specifically for this test 
jest.mock('@aspnet/signalr', () => {
    const mockConnection = {
        start: jest.fn().mockResolvedValue(undefined),
        stop: jest.fn().mockResolvedValue(undefined),
        on: jest.fn(),
        off: jest.fn(),
        invoke: jest.fn().mockResolvedValue(undefined),
    };
    
    const hubConnectionBuilder = {
        withUrl: jest.fn().mockReturnThis(),
        build: jest.fn().mockReturnValue(mockConnection),
    };
    
    const MockHubConnectionBuilder = jest.fn().mockImplementation(() => {
        return hubConnectionBuilder;
    });
    
    return {
        HubConnectionBuilder: MockHubConnectionBuilder,
    };
});

import React from 'react';
import { render, screen, waitFor } from '@testing-library/react';
import { StationPlayer } from '../../../components/Player/StationPlayer';
import { LastfmContext } from '../../../lastfm/LastfmContext';
import { AuthenticationState, IAuthenticationService } from '../../../authentication';

jest.mock('../../../musicKit', () => {
    // Define mock instance inside the factory function
    const mockInstance = {
        addEventListener: jest.fn(),
        removeEventListener: jest.fn(),
        nowPlayingItem: null,
        isPlaying: false,
        play: jest.fn().mockResolvedValue(undefined),
        pause: jest.fn().mockResolvedValue(undefined),
        stop: jest.fn().mockResolvedValue(undefined),
        skipToNextItem: jest.fn().mockResolvedValue(undefined),
        skipToPreviousItem: jest.fn().mockResolvedValue(undefined),
        setQueue: jest.fn().mockResolvedValue(undefined),
        playLater: jest.fn().mockResolvedValue(undefined),
        clearQueue: jest.fn().mockResolvedValue(undefined),
        changeToMediaAtIndex: jest.fn().mockResolvedValue(undefined),
        storefrontId: 'us',
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
            items: [
                {
                    id: '123',
                    attributes: {
                        name: 'Test Song 1',
                        artistName: 'Test Artist 1'
                    }
                }
            ],
            item: jest.fn((position) => {
                return null;
            }),
            position: -1
        }
    };

    return {
        __esModule: true,
        default: {
            getInstance: jest.fn().mockResolvedValue(mockInstance),
            formatMediaTime: jest.fn((seconds) => {
                const minutes = Math.floor(seconds / 60);
                const remainingSeconds = Math.floor(seconds % 60);
                return `${minutes}:${remainingSeconds.toString().padStart(2, '0')}`;
            }),
            instance: mockInstance
        }
    };
});

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

const createMockAuthService = (state: AuthenticationState): IAuthenticationService => ({
    state,
    user: state === AuthenticationState.Authenticated ? { id: 'test-user', name: 'Test User' } : null,
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
        // Reset and configure mocks to work with our tests
        const musicKit = require('../../../musicKit').default;
        const stationApi = require('../../../restClients/StationApi').default;
        
        // Configure StationApi mock
        stationApi.getStation.mockResolvedValue({
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
        
        // Ensure getInstance returns a properly configured instance
        musicKit.getInstance.mockResolvedValue({
            addEventListener: jest.fn(),
            removeEventListener: jest.fn(),
            nowPlayingItem: null,
            isPlaying: false,
            play: jest.fn().mockResolvedValue(undefined),
            pause: jest.fn().mockResolvedValue(undefined),
            stop: jest.fn().mockResolvedValue(undefined),
            skipToNextItem: jest.fn().mockResolvedValue(undefined),
            skipToPreviousItem: jest.fn().mockResolvedValue(undefined),
            setQueue: jest.fn().mockResolvedValue(undefined),
            playLater: jest.fn().mockResolvedValue(undefined),
            clearQueue: jest.fn().mockResolvedValue(undefined),
            changeToMediaAtIndex: jest.fn().mockResolvedValue(undefined),
            storefrontId: 'us',
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
                position: -1
            }
        });
    });

    it('renders without crashing', async () => {
        // Import the mocked musicKit to test it directly
        const musicKit = (await import('../../../musicKit')).default;
        
        // Test that getInstance returns a truthy value
        const instance = await musicKit.getInstance();
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

    it('provides static getImageUrl method', () => {
        const testUrl = 'https://example.com/image/{w}x{h}.jpg';
        const result = StationPlayer.getImageUrl(testUrl);
        expect(result).toBe('https://example.com/image/400x400.jpg');
    });

    it('handles null image url in getImageUrl', () => {
        const result = StationPlayer.getImageUrl(null);
        expect(result).toBe('default-album-cover.png');
    });

    it('handles undefined image url in getImageUrl', () => {
        const result = StationPlayer.getImageUrl(undefined);
        expect(result).toBe('default-album-cover.png');
    });

    it('replaces image dimensions correctly in getImageUrl', () => {
        const testUrl = 'https://music.apple.com/artwork/{w}x{h}bb.jpg';
        const result = StationPlayer.getImageUrl(testUrl);
        expect(result).toBe('https://music.apple.com/artwork/400x400bb.jpg');
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

    it('handles component unmounting gracefully', () => {
        const { unmount } = render(
            <TestWrapper>
                <StationPlayer {...defaultProps} />
            </TestWrapper>
        );

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