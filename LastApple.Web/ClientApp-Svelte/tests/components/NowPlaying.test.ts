import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen } from '@testing-library/svelte';
import { writable, get } from 'svelte/store';
import NowPlayingTestWrapper from './NowPlayingTestWrapper.svelte';

// Create mock stores - define before vi.mock calls since vi.mock is hoisted
const mockAppleUnauthenticatedWarning = writable(false);
const mockLatestStationId = writable<string | null>(null);

// Mock the stores - use factory returning object literals (no external references)
vi.mock('$lib/stores/appleUnauthenticatedWarning', async () => {
    return {
        appleUnauthenticatedWarning: writable(false)
    };
});

vi.mock('$lib/stores/app', async () => {
    return {
        latestStationId: writable<string | null>(null)
    };
});

describe('NowPlaying', () => {
    beforeEach(() => {
        vi.clearAllMocks();
    });

    it('renders without crashing', async () => {
        render(NowPlayingTestWrapper, { props: { showPlayer: true, stationId: 'test-station' } });
    });

    it('shows player when showPlayer is true', async () => {
        const { container } = render(NowPlayingTestWrapper, { props: { showPlayer: true, stationId: 'test-station' } });

        // Player container should be visible (display: block)
        const playerContainer = container.querySelector('.now-playing');
        expect(playerContainer).toBeInTheDocument();
        expect(playerContainer).toHaveStyle('display: block');
    });

    it('hides player when showPlayer is false', async () => {
        const { container } = render(NowPlayingTestWrapper, { props: { showPlayer: false, stationId: 'test-station' } });

        // Player container should be hidden (display: none)
        const playerContainer = container.querySelector('.now-playing');
        expect(playerContainer).toBeInTheDocument();
        expect(playerContainer).toHaveStyle('display: none');
    });

    it('renders mock StationPlayer with correct stationId', async () => {
        render(NowPlayingTestWrapper, { props: { showPlayer: true, stationId: 'my-station-123' } });

        // Our mock StationPlayer displays the station id
        expect(screen.getByText('my-station-123')).toBeInTheDocument();
    });
});
