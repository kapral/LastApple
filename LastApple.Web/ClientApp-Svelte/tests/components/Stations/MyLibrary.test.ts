import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, waitFor } from '@testing-library/svelte';

// Mock station API - use async factory to avoid hoisting issues
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
        // Reset mock implementation
        defaultProps.onStationCreated = vi.fn();
        defaultProps.onOptionsChanged = vi.fn();
    });

    it('applies station-parameters class', async () => {
        const { default: MyLibrary } = await import('$lib/components/Stations/MyLibrary.svelte');
        const { container } = render(MyLibrary, { props: defaultProps });

        expect(container.querySelector('.station-parameters')).toBeInTheDocument();
    });

    it('calls onOptionsChanged with true immediately (always valid - no input needed)', async () => {
        const { default: MyLibrary } = await import('$lib/components/Stations/MyLibrary.svelte');
        render(MyLibrary, { props: defaultProps });

        // MyLibrary doesn't require any user input, it's always ready to create
        expect(defaultProps.onOptionsChanged).toHaveBeenCalledWith(true);
    });

    it('does NOT render a Search component (no input required)', async () => {
        const { default: MyLibrary } = await import('$lib/components/Stations/MyLibrary.svelte');
        render(MyLibrary, { props: defaultProps });

        // MyLibrary doesn't have any search input
        const searchInputs = screen.queryAllByRole('textbox');
        expect(searchInputs).toHaveLength(0);
    });

    it('creates station with "library" type when triggered', async () => {
        const stationApi = await import('$lib/api/stationApi');
        const mockPostStation = vi.mocked(stationApi.default.postStation);
        mockPostStation.mockResolvedValue({ id: 'library-station-id' });

        const { default: MyLibrary } = await import('$lib/components/Stations/MyLibrary.svelte');
        const { rerender } = render(MyLibrary, { 
            props: { ...defaultProps, triggerCreate: false } 
        });

        await rerender({ ...defaultProps, triggerCreate: true });

        await waitFor(() => {
            expect(mockPostStation).toHaveBeenCalledWith('library', expect.anything());
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
