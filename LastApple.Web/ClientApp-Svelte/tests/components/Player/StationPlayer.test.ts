import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, waitFor } from '@testing-library/svelte';
import { writable } from 'svelte/store';

// Mock dependencies
vi.mock('$lib/api/stationApi', () => ({
    getStation: vi.fn().mockResolvedValue({
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
    deleteSongs: vi.fn().mockResolvedValue(undefined),
    topUp: vi.fn().mockResolvedValue(undefined)
}));

vi.mock('$lib/services/musicKit', () => ({
    getMusicKitInstance: vi.fn(() => ({
        api: {
            music: vi.fn().mockResolvedValue({
                data: {
                    data: [
                        { id: '123', attributes: { name: 'Test Song 1', artistName: 'Artist 1' } },
                        { id: '456', attributes: { name: 'Test Song 2', artistName: 'Artist 2' } },
                        { id: '789', attributes: { name: 'Test Song 3', artistName: 'Artist 3' } }
                    ]
                }
            })
        },
        queue: {
            items: [],
            item: vi.fn(() => null),
            position: -1,
            append: vi.fn(),
            prepend: vi.fn(),
            remove: vi.fn()
        },
        play: vi.fn(),
        stop: vi.fn(),
        skipToNextItem: vi.fn(),
        skipToPreviousItem: vi.fn(),
        nowPlayingItem: null,
        isPlaying: false,
        addEventListener: vi.fn(),
        removeEventListener: vi.fn()
    })),
    formatMediaTime: vi.fn((s) => `${Math.floor(s / 60)}:${(s % 60).toString().padStart(2, '0')}`)
}));

// Mock lastfm auth state
const mockLastfmAuthState = writable({
    state: 'authenticated',
    user: { name: 'testuser' }
});

vi.mock('$lib/stores/lastfmAuthState', () => ({
    lastfmAuthState: mockLastfmAuthState
}));

describe('StationPlayer', () => {
    const defaultProps = {
        stationId: 'test-station-123'
    };

    beforeEach(() => {
        vi.clearAllMocks();
    });

    it('renders without crashing', async () => {
        const { default: StationPlayer } = await import('$lib/components/Player/StationPlayer.svelte');
        render(StationPlayer, { props: defaultProps });
    });

    it('shows loading spinner initially', async () => {
        const { default: StationPlayer } = await import('$lib/components/Player/StationPlayer.svelte');
        render(StationPlayer, { props: defaultProps });

        expect(screen.getByRole('status')).toBeInTheDocument();
    });

    it('fetches station data on mount', async () => {
        const stationApi = await import('$lib/api/stationApi');

        const { default: StationPlayer } = await import('$lib/components/Player/StationPlayer.svelte');
        render(StationPlayer, { props: { stationId: 'my-station-id' } });

        await waitFor(() => {
            expect(stationApi.getStation).toHaveBeenCalledWith('my-station-id');
        });
    });

    it('renders PlayerControls after loading', async () => {
        const { default: StationPlayer } = await import('$lib/components/Player/StationPlayer.svelte');
        render(StationPlayer, { props: defaultProps });

        await waitFor(() => {
            expect(screen.getByTestId('player-controls')).toBeInTheDocument();
        });
    });

    it('renders Playlist after loading', async () => {
        const { default: StationPlayer } = await import('$lib/components/Player/StationPlayer.svelte');
        render(StationPlayer, { props: defaultProps });

        await waitFor(() => {
            expect(screen.getByTestId('playlist')).toBeInTheDocument();
        });
    });

    it('loads songs from MusicKit API', async () => {
        const musicKit = await import('$lib/services/musicKit');
        const instance = musicKit.getMusicKitInstance();

        const { default: StationPlayer } = await import('$lib/components/Player/StationPlayer.svelte');
        render(StationPlayer, { props: defaultProps });

        await waitFor(() => {
            expect(instance.api.music).toHaveBeenCalled();
        });
    });

    it('handles playback control buttons', async () => {
        const { default: StationPlayer } = await import('$lib/components/Player/StationPlayer.svelte');
        render(StationPlayer, { props: defaultProps });

        await waitFor(() => {
            expect(screen.getByTestId('prev-button')).toBeInTheDocument();
            expect(screen.getByTestId('play-pause-button')).toBeInTheDocument();
            expect(screen.getByTestId('next-button')).toBeInTheDocument();
        });
    });

    it('displays track count in playlist', async () => {
        const { default: StationPlayer } = await import('$lib/components/Player/StationPlayer.svelte');
        render(StationPlayer, { props: defaultProps });

        await waitFor(() => {
            expect(screen.getByTestId('track-count')).toHaveTextContent('3');
        });
    });
});
