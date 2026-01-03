import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/svelte';

// Create a shared mock instance for MusicKit
const mockMusicKitInstance = {
    currentPlaybackDuration: 180,
    currentPlaybackTime: 0,
    seekToTime: vi.fn().mockResolvedValue(undefined),
    addEventListener: vi.fn(),
    removeEventListener: vi.fn()
};

// Mock MusicKit - must be before importing PlayerControls since it uses ProgressControl
vi.mock('$lib/services/musicKit', () => ({
    default: {
        getExistingInstance: vi.fn(() => mockMusicKitInstance),
        formatMediaTime: vi.fn((seconds: number) => {
            const minutes = Math.floor(seconds / 60);
            const remainingSeconds = Math.floor(seconds % 60);
            return `${minutes}:${remainingSeconds.toString().padStart(2, '0')}`;
        })
    }
}));

import PlayerControls from '$lib/components/Player/PlayerControls.svelte';

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
        switchPrev: vi.fn(),
        switchNext: vi.fn(),
        onPlayPause: vi.fn(),
        isScrobblingEnabled: false,
        onScrobblingSwitch: vi.fn(),
        lastfmAuthenticated: true
    };

    beforeEach(() => {
        vi.clearAllMocks();
    });

    it('applies player-controls class', () => {
        const { container } = render(PlayerControls, { props: defaultProps });

        expect(container.querySelector('.player-controls')).toBeInTheDocument();
    });

    it('renders album art with background image from track artwork', () => {
        const { container } = render(PlayerControls, { props: defaultProps });

        const albumArt = container.querySelector('.album-art');
        expect(albumArt).toBeInTheDocument();
        // Should have background-image inline style with the artwork URL
        expect(albumArt).toHaveAttribute('style', expect.stringContaining('background-image'));
    });

    it('renders PlayerHeader component with track info', () => {
        render(PlayerControls, { props: defaultProps });

        // PlayerHeader should show track name and artist info
        expect(screen.getByText('Test Song')).toBeInTheDocument();
        expect(screen.getByText('Test Artist - Test Album')).toBeInTheDocument();
    });

    it('does not render PlayerHeader when currentTrack is undefined', () => {
        render(PlayerControls, { 
            props: { ...defaultProps, currentTrack: undefined } 
        });

        expect(screen.queryByText('Test Song')).not.toBeInTheDocument();
    });

    it('renders ProgressControl component', () => {
        const { container } = render(PlayerControls, { props: defaultProps });

        // ProgressControl should be present
        expect(container.querySelector('.progress-control')).toBeInTheDocument();
    });

    it('renders previous, play/pause, and next buttons', () => {
        render(PlayerControls, { props: defaultProps });

        // Should render FontAwesome icons for controls
        expect(screen.getByRole('button', { name: /previous/i })).toBeInTheDocument();
        expect(screen.getByRole('button', { name: /play|pause/i })).toBeInTheDocument();
        expect(screen.getByRole('button', { name: /next/i })).toBeInTheDocument();
    });

    it('shows play icon when not playing', () => {
        render(PlayerControls, { props: { ...defaultProps, isPlaying: false } });

        const playButton = screen.getByRole('button', { name: /play/i });
        expect(playButton).toBeInTheDocument();
    });

    it('shows pause icon when playing', () => {
        render(PlayerControls, { props: { ...defaultProps, isPlaying: true } });

        const pauseButton = screen.getByRole('button', { name: /pause/i });
        expect(pauseButton).toBeInTheDocument();
    });

    it('calls switchPrev when previous button is clicked', async () => {
        render(PlayerControls, { props: defaultProps });

        const prevButton = screen.getByRole('button', { name: /previous/i });
        await fireEvent.click(prevButton);
        
        expect(defaultProps.switchPrev).toHaveBeenCalledTimes(1);
    });

    it('calls switchNext when next button is clicked', async () => {
        render(PlayerControls, { props: defaultProps });

        const nextButton = screen.getByRole('button', { name: /next/i });
        await fireEvent.click(nextButton);
        
        expect(defaultProps.switchNext).toHaveBeenCalledTimes(1);
    });

    it('calls onPlayPause when play/pause button is clicked', async () => {
        render(PlayerControls, { props: defaultProps });

        const playButton = screen.getByRole('button', { name: /play/i });
        await fireEvent.click(playButton);
        
        expect(defaultProps.onPlayPause).toHaveBeenCalledTimes(1);
    });

    it('passes scrobbling props to PlayerHeader', () => {
        render(PlayerControls, { 
            props: { 
                ...defaultProps, 
                isScrobblingEnabled: true,
                lastfmAuthenticated: true 
            } 
        });

        // When lastfm is authenticated and scrobbling enabled, should show scrobbling UI
        expect(screen.getByRole('switch', { name: /scrobbling/i })).toBeInTheDocument();
    });
});
