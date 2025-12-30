import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, waitFor } from '@testing-library/svelte';
import MyLibrary from '$lib/components/Stations/MyLibrary.svelte';

// Mock station API
const mockPostStation = vi.fn();
vi.mock('$lib/api/stationApi', () => ({
    default: {
        postStation: mockPostStation
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
    });

    it('applies station-parameters class', () => {
        const { container } = render(MyLibrary, { props: defaultProps });

        expect(container.querySelector('.station-parameters')).toBeInTheDocument();
    });

    it('calls onOptionsChanged with true immediately (always valid - no input needed)', () => {
        render(MyLibrary, { props: defaultProps });

        // MyLibrary doesn't require any user input, it's always ready to create
        expect(defaultProps.onOptionsChanged).toHaveBeenCalledWith(true);
    });

    it('does NOT render a Search component (no input required)', () => {
        render(MyLibrary, { props: defaultProps });

        // MyLibrary doesn't have any search input
        const searchInputs = screen.queryAllByRole('textbox');
        expect(searchInputs).toHaveLength(0);
    });

    it('creates station with "library" type when triggered', async () => {
        mockPostStation.mockResolvedValue({ id: 'library-station-id' });

        const { rerender } = render(MyLibrary, { 
            props: { ...defaultProps, triggerCreate: false } 
        });

        await rerender({ ...defaultProps, triggerCreate: true });

        await waitFor(() => {
            expect(mockPostStation).toHaveBeenCalledWith('library', expect.anything());
        });
    });

    it('calls onStationCreated with station ID after creation', async () => {
        mockPostStation.mockResolvedValue({ id: 'my-library-123' });

        const { rerender } = render(MyLibrary, { 
            props: { ...defaultProps, triggerCreate: false } 
        });

        await rerender({ ...defaultProps, triggerCreate: true });

        await waitFor(() => {
            expect(defaultProps.onStationCreated).toHaveBeenCalledWith('my-library-123');
        });
    });

    it('exposes Definition with correct title', () => {
        // The component should export a Definition object for StationsList
        expect(MyLibrary).toHaveProperty('Definition');
        expect(MyLibrary.Definition.title).toBe('My last.fm Library');
    });

    it('exposes Definition with correct description', () => {
        expect(MyLibrary.Definition.description).toBe('A continuous station based on your last.fm library.');
    });
});
