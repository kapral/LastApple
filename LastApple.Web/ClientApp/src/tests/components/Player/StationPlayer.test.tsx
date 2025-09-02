// Don't mock LastfmContext globally in this test - we need to use the real context
jest.unmock('../../../lastfm/LastfmContext');

import React from 'react';
import { render, screen } from '@testing-library/react';
import { StationPlayer } from '../../../components/Player/StationPlayer';
import { LastfmContext } from '../../../lastfm/LastfmContext';
import { AuthenticationState, IAuthenticationService } from '../../../authentication';

// Mock all external dependencies
jest.mock('../../../musicKit', () => ({
    default: {
        instance: {
            addEventListener: jest.fn(),
            removeEventListener: jest.fn(),
            nowPlayingItem: null,
            isPlaying: false,
            play: jest.fn().mockResolvedValue(undefined),
            pause: jest.fn().mockResolvedValue(undefined),
            skipToNextItem: jest.fn().mockResolvedValue(undefined),
            skipToPreviousItem: jest.fn().mockResolvedValue(undefined),
            setQueue: jest.fn().mockResolvedValue(undefined),
            changeToMediaAtIndex: jest.fn().mockResolvedValue(undefined)
        },
        getInstance: jest.fn().mockResolvedValue({
            addEventListener: jest.fn(),
            removeEventListener: jest.fn(),
            nowPlayingItem: null,
            isPlaying: false
        })
    }
}));

jest.mock('@aspnet/signalr', () => ({
    HubConnectionBuilder: jest.fn().mockImplementation(() => ({
        withUrl: jest.fn().mockReturnThis(),
        build: jest.fn().mockReturnValue({
            start: jest.fn().mockResolvedValue(undefined),
            stop: jest.fn().mockResolvedValue(undefined),
            on: jest.fn(),
            off: jest.fn()
        })
    }))
}));

jest.mock('../../../restClients/LastfmApi', () => ({
    default: {
        scrobble: jest.fn().mockResolvedValue(undefined),
        updateNowPlaying: jest.fn().mockResolvedValue(undefined)
    }
}));

jest.mock('../../../restClients/StationApi', () => ({
    default: {
        getStation: jest.fn().mockResolvedValue({
            id: 'test-station',
            name: 'Test Station'
        })
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
        setMediaSession: jest.fn()
    }
}));

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
        jest.clearAllMocks();
    });

    it('renders without crashing', () => {
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

    it('renders playlist component', () => {
        render(
            <TestWrapper>
                <StationPlayer {...defaultProps} />
            </TestWrapper>
        );

        // The playlist should be rendered (though initially empty)
        expect(screen.getByTestId('playlist')).toBeInTheDocument();
    });

    it('renders player controls component', () => {
        render(
            <TestWrapper>
                <StationPlayer {...defaultProps} />
            </TestWrapper>
        );

        expect(screen.getByTestId('player-controls')).toBeInTheDocument();
    });

    it('has correct initial state', () => {
        render(
            <TestWrapper>
                <StationPlayer {...defaultProps} />
            </TestWrapper>
        );

        // Should show no current track initially
        expect(screen.getByTestId('current-track')).toHaveTextContent('none');
        expect(screen.getByTestId('controls-track')).toHaveTextContent('none');
        
        // Should not be playing initially
        expect(screen.getByTestId('is-playing')).toHaveTextContent('not-playing');
        expect(screen.getByTestId('controls-playing')).toHaveTextContent('not-playing');
        
        // Should have 0 tracks initially
        expect(screen.getByTestId('track-count')).toHaveTextContent('0');
    });

    it('provides static getImageUrl method', () => {
        const testUrl = 'https://example.com/image/{w}x{h}.jpg';
        const result = StationPlayer.getImageUrl(testUrl);
        expect(result).toBe('https://example.com/image/400x400.jpg');
    });

    it('handles null image url in getImageUrl', () => {
        const result = StationPlayer.getImageUrl(null);
        expect(result).toBe('');
    });

    it('handles undefined image url in getImageUrl', () => {
        const result = StationPlayer.getImageUrl(undefined);
        expect(result).toBe('');
    });

    it('replaces image dimensions correctly in getImageUrl', () => {
        const testUrl = 'https://music.apple.com/artwork/{w}x{h}bb.jpg';
        const result = StationPlayer.getImageUrl(testUrl);
        expect(result).toBe('https://music.apple.com/artwork/400x400bb.jpg');
    });

    it('works with different LastFM authentication states', () => {
        render(
            <TestWrapper authState={AuthenticationState.Unauthenticated}>
                <StationPlayer {...defaultProps} />
            </TestWrapper>
        );

        // Should still render the player components
        expect(screen.getByTestId('playlist')).toBeInTheDocument();
        expect(screen.getByTestId('player-controls')).toBeInTheDocument();
    });

    it('renders with different station IDs', () => {
        render(
            <TestWrapper>
                <StationPlayer stationId="different-station-456" />
            </TestWrapper>
        );

        expect(screen.getByTestId('playlist')).toBeInTheDocument();
        expect(screen.getByTestId('player-controls')).toBeInTheDocument();
    });

    it('renders control buttons', () => {
        render(
            <TestWrapper>
                <StationPlayer {...defaultProps} />
            </TestWrapper>
        );

        expect(screen.getByTestId('prev-button')).toBeInTheDocument();
        expect(screen.getByTestId('play-pause-button')).toBeInTheDocument();
        expect(screen.getByTestId('next-button')).toBeInTheDocument();
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

    it('maintains proper component structure', () => {
        const { container } = render(
            <TestWrapper>
                <StationPlayer {...defaultProps} />
            </TestWrapper>
        );

        // Should have a main container
        expect(container.firstChild).toBeInTheDocument();
        
        // Should render both playlist and controls
        expect(screen.getByTestId('playlist')).toBeInTheDocument();
        expect(screen.getByTestId('player-controls')).toBeInTheDocument();
    });
});