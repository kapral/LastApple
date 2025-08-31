import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import { PlayerControls } from '../../../components/Player/PlayerControls';

// Mock dependencies
jest.mock('../../../components/Player/PlayerHeader', () => ({
    PlayerHeader: ({ currentTrack, isScrobblingEnabled, onScrobblingSwitch, lastfmAuthenticated }: any) => (
        <div data-testid="player-header">
            <div data-testid="track-name">{currentTrack?.attributes?.name}</div>
            <div data-testid="scrobbling-enabled">{isScrobblingEnabled ? 'enabled' : 'disabled'}</div>
            <div data-testid="lastfm-authenticated">{lastfmAuthenticated ? 'auth' : 'no-auth'}</div>
            <button onClick={() => onScrobblingSwitch(!isScrobblingEnabled)}>Toggle Scrobble</button>
        </div>
    )
}));

jest.mock('../../../components/Player/ProgressControl', () => ({
    ProgressControl: () => <div data-testid="progress-control">Progress Control</div>
}));

jest.mock('../../../components/Player/StationPlayer', () => ({
    StationPlayer: {
        getImageUrl: jest.fn((url) => url ? url.replace('{w}x{h}', '400x400') : '')
    }
}));

jest.mock('@fortawesome/react-fontawesome', () => ({
    FontAwesomeIcon: ({ icon }: any) => <div data-testid="fontawesome-icon" data-icon={icon.iconName} />
}));

const createMockTrack = (overrides: Partial<MusicKit.MediaItem> = {}): MusicKit.MediaItem => ({
    id: 'test-track-id',
    type: 'songs',
    href: '/test-href',
    attributes: {
        name: 'Test Song',
        artistName: 'Test Artist',
        albumName: 'Test Album',
        artwork: {
            url: 'https://example.com/artwork/{w}x{h}.jpg',
            width: 400,
            height: 400
        },
        ...overrides.attributes
    },
    ...overrides
} as MusicKit.MediaItem);

describe('PlayerControls', () => {
    const defaultProps = {
        currentTrack: createMockTrack(),
        isPlaying: false,
        switchPrev: jest.fn(),
        switchNext: jest.fn(),
        onPlayPause: jest.fn(),
        isScrobblingEnabled: false,
        onScrobblingSwitch: jest.fn(),
        lastfmAuthenticated: true
    };

    beforeEach(() => {
        jest.clearAllMocks();
    });

    it('renders without crashing', () => {
        render(<PlayerControls {...defaultProps} />);
    });

    it('applies player-controls class', () => {
        const { container } = render(<PlayerControls {...defaultProps} />);

        expect(container.querySelector('.player-controls')).toBeInTheDocument();
    });

    it('renders PlayerHeader when currentTrack is provided', () => {
        render(<PlayerControls {...defaultProps} />);

        expect(screen.getByTestId('player-header')).toBeInTheDocument();
        expect(screen.getByTestId('track-name')).toHaveTextContent('Test Song');
    });

    it('does not render PlayerHeader when currentTrack is null', () => {
        render(<PlayerControls {...defaultProps} currentTrack={null as any} />);

        expect(screen.queryByTestId('player-header')).not.toBeInTheDocument();
    });

    it('passes correct props to PlayerHeader', () => {
        render(
            <PlayerControls 
                {...defaultProps} 
                isScrobblingEnabled={true}
                lastfmAuthenticated={false}
            />
        );

        expect(screen.getByTestId('scrobbling-enabled')).toHaveTextContent('enabled');
        expect(screen.getByTestId('lastfm-authenticated')).toHaveTextContent('no-auth');
    });

    it('renders ProgressControl', () => {
        render(<PlayerControls {...defaultProps} />);

        expect(screen.getByTestId('progress-control')).toBeInTheDocument();
    });

    it('displays album artwork with correct background image', () => {
        const trackWithArtwork = createMockTrack({
            attributes: {
                artwork: {
                    url: 'https://example.com/album/{w}x{h}.jpg',
                    width: 400,
                    height: 400
                }
            }
        });

        const { container } = render(<PlayerControls {...defaultProps} currentTrack={trackWithArtwork} />);

        const albumArt = container.querySelector('.album-art');
        expect(albumArt).toHaveStyle('background-image: url(https://example.com/album/400x400.jpg)');
    });

    it('renders previous track button', () => {
        render(<PlayerControls {...defaultProps} />);

        const icons = screen.getAllByTestId('fontawesome-icon');
        const prevIcon = icons.find(icon => icon.getAttribute('data-icon') === 'step-backward');
        expect(prevIcon).toBeInTheDocument();
    });

    it('renders next track button', () => {
        render(<PlayerControls {...defaultProps} />);

        const icons = screen.getAllByTestId('fontawesome-icon');
        const nextIcon = icons.find(icon => icon.getAttribute('data-icon') === 'step-forward');
        expect(nextIcon).toBeInTheDocument();
    });

    it('renders play button when not playing', () => {
        render(<PlayerControls {...defaultProps} isPlaying={false} />);

        const icons = screen.getAllByTestId('fontawesome-icon');
        const playIcon = icons.find(icon => icon.getAttribute('data-icon') === 'play');
        expect(playIcon).toBeInTheDocument();
    });

    it('renders pause button when playing', () => {
        render(<PlayerControls {...defaultProps} isPlaying={true} />);

        const icons = screen.getAllByTestId('fontawesome-icon');
        const pauseIcon = icons.find(icon => icon.getAttribute('data-icon') === 'pause');
        expect(pauseIcon).toBeInTheDocument();
    });

    it('calls switchPrev when previous button is clicked', () => {
        const mockSwitchPrev = jest.fn();

        render(<PlayerControls {...defaultProps} switchPrev={mockSwitchPrev} />);

        const icons = screen.getAllByTestId('fontawesome-icon');
        const prevIcon = icons.find(icon => icon.getAttribute('data-icon') === 'step-backward');
        
        fireEvent.click(prevIcon!.parentElement!);
        expect(mockSwitchPrev).toHaveBeenCalledTimes(1);
    });

    it('calls switchNext when next button is clicked', () => {
        const mockSwitchNext = jest.fn();

        render(<PlayerControls {...defaultProps} switchNext={mockSwitchNext} />);

        const icons = screen.getAllByTestId('fontawesome-icon');
        const nextIcon = icons.find(icon => icon.getAttribute('data-icon') === 'step-forward');
        
        fireEvent.click(nextIcon!.parentElement!);
        expect(mockSwitchNext).toHaveBeenCalledTimes(1);
    });

    it('calls onPlayPause when play/pause button is clicked', () => {
        const mockOnPlayPause = jest.fn();

        render(<PlayerControls {...defaultProps} onPlayPause={mockOnPlayPause} />);

        const icons = screen.getAllByTestId('fontawesome-icon');
        const playIcon = icons.find(icon => icon.getAttribute('data-icon') === 'play');
        
        fireEvent.click(playIcon!.parentElement!);
        expect(mockOnPlayPause).toHaveBeenCalledTimes(1);
    });

    it('calls onScrobblingSwitch from PlayerHeader', () => {
        const mockOnScrobblingSwitch = jest.fn();

        render(<PlayerControls {...defaultProps} onScrobblingSwitch={mockOnScrobblingSwitch} />);

        const toggleButton = screen.getByText('Toggle Scrobble');
        fireEvent.click(toggleButton);
        
        expect(mockOnScrobblingSwitch).toHaveBeenCalledWith(true);
    });

    it('has correct styling for container', () => {
        const { container } = render(<PlayerControls {...defaultProps} />);

        const playerControls = container.querySelector('.player-controls');
        expect(playerControls).toHaveStyle({
            whiteSpace: 'nowrap',
            overflow: 'hidden',
            textOverflow: 'ellipsis'
        });
    });

    it('has correct styling for controls container', () => {
        const { container } = render(<PlayerControls {...defaultProps} />);

        const controlsContainer = container.querySelector('[style*="position: absolute"]');
        expect(controlsContainer).toHaveStyle({
            position: 'absolute',
            left: '0',
            right: '0',
            bottom: '0',
            background: '#00000099',
            padding: '10px',
            lineHeight: '1'
        });
    });

    it('has correct styling for album art', () => {
        const { container } = render(<PlayerControls {...defaultProps} />);

        const albumArt = container.querySelector('.album-art');
        expect(albumArt).toHaveStyle({
            textAlign: 'center',
            backgroundPosition: 'center',
            backgroundSize: 'cover',
            display: 'inline-block',
            width: '100%',
            maxWidth: '400px',
            height: '400px'
        });
    });

    it('has correct styling for art container', () => {
        const { container } = render(<PlayerControls {...defaultProps} />);

        const artContainer = container.querySelector('[style*="textAlign: center"]');
        expect(artContainer).toHaveStyle({
            textAlign: 'center',
            position: 'relative',
            padding: '10px',
            borderBottom: '1px solid #222'
        });
    });

    it('handles missing artwork gracefully', () => {
        const trackWithoutArtwork = createMockTrack({
            attributes: {
                artwork: null as any
            }
        });

        const { container } = render(<PlayerControls {...defaultProps} currentTrack={trackWithoutArtwork} />);

        const albumArt = container.querySelector('.album-art');
        expect(albumArt).toBeInTheDocument();
    });
});