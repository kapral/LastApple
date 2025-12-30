import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen } from '@testing-library/svelte';

// Mock the StationPlayer component
vi.mock('$lib/components/Player/StationPlayer.svelte', () => ({
    default: {
        render: () => ({ component: null }),
        $$render: () => '<div data-testid="station-player">Station Player</div>'
    }
}));

// Mock the stores
vi.mock('$lib/stores/appleAuthState', () => ({
    appleAuthState: { subscribe: vi.fn() }
}));

describe('NowPlaying', () => {
    beforeEach(() => {
        vi.clearAllMocks();
    });

    it('renders without crashing', async () => {
        const { default: NowPlaying } = await import('$lib/components/NowPlaying.svelte');
        render(NowPlaying, { props: { showPlayer: true, stationId: 'test-station' } });
    });

    it('shows player when showPlayer is true', async () => {
        const { default: NowPlaying } = await import('$lib/components/NowPlaying.svelte');
        const { container } = render(NowPlaying, { props: { showPlayer: true, stationId: 'test-station' } });

        // Player container should be visible (display: block)
        const playerContainer = container.querySelector('.now-playing');
        expect(playerContainer).toBeInTheDocument();
        expect(playerContainer).toHaveStyle('display: block');
    });

    it('hides player when showPlayer is false', async () => {
        const { default: NowPlaying } = await import('$lib/components/NowPlaying.svelte');
        const { container } = render(NowPlaying, { props: { showPlayer: false, stationId: 'test-station' } });

        // Player container should be hidden (display: none)
        const playerContainer = container.querySelector('.now-playing');
        expect(playerContainer).toBeInTheDocument();
        expect(playerContainer).toHaveStyle('display: none');
    });

    it('renders StationPlayer with correct stationId', async () => {
        const { default: NowPlaying } = await import('$lib/components/NowPlaying.svelte');
        render(NowPlaying, { props: { showPlayer: true, stationId: 'my-station-123' } });

        // StationPlayer should receive the stationId prop
        expect(screen.getByTestId('station-player')).toBeInTheDocument();
    });

    it('renders AppleUnauthenticatedWarning when user is not authenticated', async () => {
        const { default: NowPlaying } = await import('$lib/components/NowPlaying.svelte');
        render(NowPlaying, { props: { showPlayer: true, stationId: 'test-station' } });

        // Should show warning when apple auth is not authenticated
        const warning = screen.queryByText(/Apple Music account/i);
        // This will fail until implemented - warning appears based on auth state
        expect(warning).toBeInTheDocument();
    });
});
