import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, waitFor } from '@testing-library/svelte';
import { writable } from 'svelte/store';
import { AuthenticationState } from '$lib/models/authenticationState';

// Mock lastfm auth store
const mockLastfmAuthStore = writable({
    state: AuthenticationState.Authenticated,
    user: { name: 'testuser' }
});

vi.mock('$lib/stores/lastfmAuth', () => ({
    lastfmAuthStore: mockLastfmAuthStore
}));

// Mock station API
vi.mock('$lib/api/stationApi', () => ({
    default: {
        postStation: vi.fn().mockResolvedValue({ id: 'mock-station-id' })
    }
}));

describe('MyLibrary', () => {
    const defaultProps = {
        triggerCreate: false,
        onStationCreated: vi.fn(),
        onOptionsChanged: vi.fn()
    };

    beforeEach(() => {
        vi.clearAllMocks();
        defaultProps.onStationCreated = vi.fn();
        defaultProps.onOptionsChanged = vi.fn();
        // Reset to authenticated state by default
        mockLastfmAuthStore.set({
            state: AuthenticationState.Authenticated,
            user: { name: 'testuser' }
        });
    });

    it('applies station-parameters class', async () => {
        const { default: MyLibrary } = await import('$lib/components/Stations/MyLibrary.svelte');
        const { container } = render(MyLibrary, { props: defaultProps });

        expect(container.querySelector('.station-parameters')).toBeInTheDocument();
    });

    it('calls onOptionsChanged(true) when user is authenticated', async () => {
        const { default: MyLibrary } = await import('$lib/components/Stations/MyLibrary.svelte');
        render(MyLibrary, { props: defaultProps });

        expect(defaultProps.onOptionsChanged).toHaveBeenCalledWith(true);
    });

    it('calls onOptionsChanged(false) when user is not authenticated', async () => {
        mockLastfmAuthStore.set({
            state: AuthenticationState.Unauthenticated,
            user: null
        });

        const { default: MyLibrary } = await import('$lib/components/Stations/MyLibrary.svelte');
        render(MyLibrary, { props: defaultProps });

        expect(defaultProps.onOptionsChanged).toHaveBeenCalledWith(false);
    });

    it('shows warning message when user is not authenticated', async () => {
        mockLastfmAuthStore.set({
            state: AuthenticationState.Unauthenticated,
            user: null
        });

        const { default: MyLibrary } = await import('$lib/components/Stations/MyLibrary.svelte');
        render(MyLibrary, { props: defaultProps });

        expect(screen.getByText(/Log in to last.fm to listen to your library/)).toBeInTheDocument();
    });

    it('does NOT render a Search component (no input required)', async () => {
        const { default: MyLibrary } = await import('$lib/components/Stations/MyLibrary.svelte');
        render(MyLibrary, { props: defaultProps });

        const searchInputs = screen.queryAllByRole('textbox');
        expect(searchInputs).toHaveLength(0);
    });

    it('creates station with "lastfmlibrary" type when triggered', async () => {
        const stationApi = await import('$lib/api/stationApi');
        const mockPostStation = vi.mocked(stationApi.default.postStation);
        mockPostStation.mockResolvedValue({ id: 'library-station-id' });

        const { default: MyLibrary } = await import('$lib/components/Stations/MyLibrary.svelte');
        const { rerender } = render(MyLibrary, { 
            props: { ...defaultProps, triggerCreate: false } 
        });

        await rerender({ ...defaultProps, triggerCreate: true });

        await waitFor(() => {
            expect(mockPostStation).toHaveBeenCalledWith('lastfmlibrary', 'my');
        });
    });

    it('calls onStationCreated with station ID after creation', async () => {
        const stationApi = await import('$lib/api/stationApi');
        const mockPostStation = vi.mocked(stationApi.default.postStation);
        mockPostStation.mockResolvedValue({ id: 'my-library-123' });

        const { default: MyLibrary } = await import('$lib/components/Stations/MyLibrary.svelte');
        const { rerender } = render(MyLibrary, { 
            props: { ...defaultProps, triggerCreate: false } 
        });

        await rerender({ ...defaultProps, triggerCreate: true });

        await waitFor(() => {
            expect(defaultProps.onStationCreated).toHaveBeenCalledWith('my-library-123');
        });
    });

    it('exposes Definition with correct title', async () => {
        const { Definition } = await import('$lib/components/Stations/MyLibrary.svelte');
        expect(Definition.title).toBe('My last.fm Library');
    });

    it('exposes Definition with correct description', async () => {
        const { Definition } = await import('$lib/components/Stations/MyLibrary.svelte');
        expect(Definition.description).toBe('A continuous station based on your last.fm library.');
    });
});
