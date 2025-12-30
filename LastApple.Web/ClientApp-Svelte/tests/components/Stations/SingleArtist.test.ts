import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent, waitFor } from '@testing-library/svelte';
import SingleArtist from '$lib/components/Stations/SingleArtist.svelte';

// Mock the musicKit module
const mockGetInstance = vi.fn();
const mockApiMusic = vi.fn();

vi.mock('$lib/services/musicKit', () => ({
    default: {
        getInstance: mockGetInstance
    }
}));

// Mock station API
const mockPostStation = vi.fn();
vi.mock('$lib/api/stationApi', () => ({
    default: {
        postStation: mockPostStation
    }
}));

describe('SingleArtist', () => {
    const defaultProps = {
        triggerCreate: false,
        onStationCreated: vi.fn(),
        onOptionsChanged: vi.fn()
    };

    beforeEach(() => {
        vi.clearAllMocks();
        mockGetInstance.mockResolvedValue({
            api: { music: mockApiMusic },
            storefrontId: 'us'
        });
        mockApiMusic.mockResolvedValue({
            data: { results: { artists: { data: [] } } }
        });
    });

    it('applies station-parameters class', () => {
        const { container } = render(SingleArtist, { props: defaultProps });

        expect(container.querySelector('.station-parameters')).toBeInTheDocument();
    });

    it('renders Search component with placeholder "Radiohead..."', () => {
        render(SingleArtist, { props: defaultProps });

        expect(screen.getByPlaceholderText('Radiohead...')).toBeInTheDocument();
    });

    it('calls onOptionsChanged(false) initially (no artist selected)', () => {
        render(SingleArtist, { props: defaultProps });

        expect(defaultProps.onOptionsChanged).toHaveBeenCalledWith(false);
    });

    it('searches Apple Music catalog when user types', async () => {
        render(SingleArtist, { props: defaultProps });

        const input = screen.getByPlaceholderText('Radiohead...');
        await fireEvent.input(input, { target: { value: 'Radiohead' } });

        await waitFor(() => {
            expect(mockApiMusic).toHaveBeenCalledWith(
                expect.stringContaining('/v1/catalog/us/search'),
                expect.objectContaining({ term: 'Radiohead', types: ['artists'] })
            );
        }, { timeout: 1000 });
    });

    it('calls onOptionsChanged(true) when artist is selected', async () => {
        mockApiMusic.mockResolvedValue({
            data: {
                results: {
                    artists: {
                        data: [{ id: 'artist-123', attributes: { name: 'Radiohead' } }]
                    }
                }
            }
        });

        render(SingleArtist, { props: defaultProps });

        const input = screen.getByPlaceholderText('Radiohead...');
        await fireEvent.input(input, { target: { value: 'Radiohead' } });

        // Wait for results and select
        await waitFor(() => {
            expect(screen.getByText('Radiohead')).toBeInTheDocument();
        }, { timeout: 1000 });

        await fireEvent.click(screen.getByText('Radiohead'));

        expect(defaultProps.onOptionsChanged).toHaveBeenCalledWith(true);
    });

    it('creates station via API when triggerCreate becomes true', async () => {
        mockPostStation.mockResolvedValue({ id: 'new-station-id' });

        const { rerender } = render(SingleArtist, { 
            props: { ...defaultProps, triggerCreate: false } 
        });

        // Simulate artist selection happened
        // Then trigger create
        await rerender({ ...defaultProps, triggerCreate: true });

        await waitFor(() => {
            expect(mockPostStation).toHaveBeenCalledWith('artist', expect.any(String));
        });
    });

    it('calls onStationCreated with new station ID after creation', async () => {
        mockPostStation.mockResolvedValue({ id: 'created-station-123' });

        const { rerender } = render(SingleArtist, { 
            props: { ...defaultProps, triggerCreate: false } 
        });

        await rerender({ ...defaultProps, triggerCreate: true });

        await waitFor(() => {
            expect(defaultProps.onStationCreated).toHaveBeenCalledWith('created-station-123');
        });
    });

    it('uses labelAccessor to display artist name from attributes', async () => {
        mockApiMusic.mockResolvedValue({
            data: {
                results: {
                    artists: {
                        data: [{ id: '1', attributes: { name: 'Test Artist' } }]
                    }
                }
            }
        });

        render(SingleArtist, { props: defaultProps });

        const input = screen.getByPlaceholderText('Radiohead...');
        await fireEvent.input(input, { target: { value: 'Test' } });

        await waitFor(() => {
            // Should display 'Test Artist' (from attributes.name), not the raw object
            expect(screen.getByText('Test Artist')).toBeInTheDocument();
        }, { timeout: 1000 });
    });
});
