import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/svelte';
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

    it('renders without crashing', () => {
        render(PlayerControls, { props: defaultProps });
    });

    it('applies player-controls class', () => {
        const { container } = render(PlayerControls, { props: defaultProps });

        expect(container.querySelector('.player-controls')).toBeInTheDocument();
    });

    it('renders PlayerHeader when currentTrack is provided', () => {
        render(PlayerControls, { props: defaultProps });

        expect(screen.getByTestId('player-header')).toBeInTheDocument();
        expect(screen.getByTestId('track-name')).toHaveTextContent('Test Song');
    });

    it('does not render PlayerHeader when currentTrack is undefined', () => {
        render(PlayerControls, { 
            props: { ...defaultProps, currentTrack: undefined } 
        });

        expect(screen.queryByTestId('player-header')).not.toBeInTheDocument();
    });

    it('renders control buttons', () => {
        render(PlayerControls, { props: defaultProps });

        expect(screen.getByTestId('prev-button')).toBeInTheDocument();
        expect(screen.getByTestId('play-pause-button')).toBeInTheDocument();
        expect(screen.getByTestId('next-button')).toBeInTheDocument();
    });

    it('calls switchPrev when prev button is clicked', async () => {
        render(PlayerControls, { props: defaultProps });

        await fireEvent.click(screen.getByTestId('prev-button'));
        expect(defaultProps.switchPrev).toHaveBeenCalled();
    });

    it('calls switchNext when next button is clicked', async () => {
        render(PlayerControls, { props: defaultProps });

        await fireEvent.click(screen.getByTestId('next-button'));
        expect(defaultProps.switchNext).toHaveBeenCalled();
    });

    it('calls onPlayPause when play/pause button is clicked', async () => {
        render(PlayerControls, { props: defaultProps });

        await fireEvent.click(screen.getByTestId('play-pause-button'));
        expect(defaultProps.onPlayPause).toHaveBeenCalled();
    });

    it('renders progress control', () => {
        render(PlayerControls, { props: defaultProps });

        expect(screen.getByTestId('progress-control')).toBeInTheDocument();
    });
});
