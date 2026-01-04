import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, waitFor } from '@testing-library/svelte';
import { writable } from 'svelte/store';
import { AuthenticationState } from '$lib/models/authenticationState';

const mockMusicKitInstance = {
    api: {
        music: vi.fn().mockResolvedValue({
            data: {
                data: [
                    { id: 'song-1', attributes: { name: 'Test Song 1', artistName: 'Artist 1', albumName: 'Album 1' } },
                    { id: 'song-2', attributes: { name: 'Test Song 2', artistName: 'Artist 2', albumName: 'Album 1' } },
                    { id: 'song-3', attributes: { name: 'Test Song 3', artistName: 'Artist 3', albumName: 'Album 2' } }
                ]
            }
        })
    },
    storefrontId: 'us',
    queue: {
        items: [{ id: 'song-1' }, { id: 'song-2' }, { id: 'song-3' }],
        item: vi.fn(() => null),
        position: 0
    },
    play: vi.fn().mockResolvedValue(undefined),
    playLater: vi.fn().mockResolvedValue(undefined),
    setQueue: vi.fn().mockResolvedValue(undefined),
    stop: vi.fn(),
    clearQueue: vi.fn().mockResolvedValue(undefined),
    skipToNextItem: vi.fn().mockResolvedValue(undefined),
    skipToPreviousItem: vi.fn().mockResolvedValue(undefined),
    changeToMediaAtIndex: vi.fn().mockResolvedValue(undefined),
    nowPlayingItem: null,
    isPlaying: false,
    pause: vi.fn(),
    addEventListener: vi.fn(),
    removeEventListener: vi.fn()
};

// Mock station API
vi.mock('$lib/api/stationApi', () => ({
    default: {
        getStation: vi.fn().mockResolvedValue({
            id: 'test-station-123',
            name: 'Test Station',
            songIds: ['song-1', 'song-2', 'song-3'],
            isContinuous: false,
            isGroupedByAlbum: false,
            size: 10,
            definition: {
                stationType: 'test-type'
            }
        }),
        deleteSongs: vi.fn().mockResolvedValue(undefined),
        topUp: vi.fn().mockResolvedValue(undefined)
    }
}));

// Mock musicKit service
vi.mock('$lib/services/musicKit', () => ({
    default: {
        getInstance: vi.fn().mockResolvedValue(mockMusicKitInstance),
        getExistingInstance: vi.fn(() => mockMusicKitInstance),
        formatMediaTime: vi.fn((s) => `${Math.floor(s / 60)}:${(s % 60).toString().padStart(2, '0')}`)
    }
}));

// Mock lastfm API
vi.mock('$lib/api/lastfmApi', () => ({
    default: {
        scrobble: vi.fn().mockResolvedValue(undefined),
        updateNowPlaying: vi.fn().mockResolvedValue(undefined)
    }
}));

// Mock lastfm auth store
const mockLastfmAuthStore = {
    ...writable({
        state: AuthenticationState.Authenticated,
        user: { name: 'testuser' },
        isScrobblingEnabled: true
    }),
    setIsScrobblingEnabled: vi.fn()
};

vi.mock('$lib/stores/lastfmAuth', () => ({
    lastfmAuthState: mockLastfmAuthStore
}));

// Mock signalR - use a class for Vitest 4.x compatibility
class MockHubConnection {
    start = vi.fn().mockResolvedValue(undefined);
    on = vi.fn();
    off = vi.fn();
}

class MockHubConnectionBuilder {
    withUrl() { return this; }
    build() { return new MockHubConnection(); }
}

vi.mock('@microsoft/signalr', () => ({
    HubConnectionBuilder: MockHubConnectionBuilder
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
        const { default: stationApi } = await import('$lib/api/stationApi');

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
        const instance = await musicKit.default.getInstance();

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
            expect(screen.getByLabelText('previous')).toBeInTheDocument();
            expect(screen.getByLabelText(/play|pause/)).toBeInTheDocument();
            expect(screen.getByLabelText('next')).toBeInTheDocument();
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
