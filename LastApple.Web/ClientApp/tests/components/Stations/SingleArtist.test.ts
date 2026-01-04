import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent, waitFor } from '@testing-library/svelte';

// Mock the musicKit module - use inline factory to avoid hoisting issues
vi.mock('$lib/services/musicKit', () => ({
    default: {
        getInstance: vi.fn().mockResolvedValue({
            api: { music: vi.fn().mockResolvedValue({ data: { results: { artists: { data: [] } } } }) },
            storefrontId: 'us'
        })
    }
}));

// Mock station API
vi.mock('$lib/api/stationApi', () => ({
    default: {
        postStation: vi.fn().mockResolvedValue({ id: 'mock-station-id' })
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
        defaultProps.onStationCreated = vi.fn();
        defaultProps.onOptionsChanged = vi.fn();
    });

    it('applies station-parameters class', async () => {
        const { default: SingleArtist } = await import('$lib/components/Stations/SingleArtist.svelte');
        const { container } = render(SingleArtist, { props: defaultProps });

        expect(container.querySelector('.station-parameters')).toBeInTheDocument();
    });

    it('renders Search component with placeholder "Radiohead..."', async () => {
        const { default: SingleArtist } = await import('$lib/components/Stations/SingleArtist.svelte');
        render(SingleArtist, { props: defaultProps });

        expect(screen.getByPlaceholderText('Radiohead...')).toBeInTheDocument();
    });

    it('calls onOptionsChanged(false) initially (no artist selected)', async () => {
        const { default: SingleArtist } = await import('$lib/components/Stations/SingleArtist.svelte');
        render(SingleArtist, { props: defaultProps });

        expect(defaultProps.onOptionsChanged).toHaveBeenCalledWith(false);
    });

    it('searches Apple Music catalog when user types', async () => {
        const musicKit = await import('$lib/services/musicKit');
        const mockInstance = await vi.mocked(musicKit.default.getInstance)();
        const mockApiMusic = vi.mocked(mockInstance.api.music);

        const { default: SingleArtist } = await import('$lib/components/Stations/SingleArtist.svelte');
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
        const musicKit = await import('$lib/services/musicKit');
        const mockInstance = await vi.mocked(musicKit.default.getInstance)();
        const mockApiMusic = vi.mocked(mockInstance.api.music);
        mockApiMusic.mockResolvedValue({
            data: {
                results: {
                    artists: {
                        data: [{ id: 'artist-123', attributes: { name: 'Radiohead' } }]
                    }
                }
            }
        });

        const { default: SingleArtist } = await import('$lib/components/Stations/SingleArtist.svelte');
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

    it('creates station via API when triggerCreate becomes true after selecting artist', async () => {
        const musicKit = await import('$lib/services/musicKit');
        const mockInstance = await vi.mocked(musicKit.default.getInstance)();
        const mockApiMusic = vi.mocked(mockInstance.api.music);
        mockApiMusic.mockResolvedValue({
            data: {
                results: {
                    artists: {
                        data: [{ id: 'artist-456', attributes: { name: 'TestBand' } }]
                    }
                }
            }
        });

        const stationApi = await import('$lib/api/stationApi');
        const mockPostStation = vi.mocked(stationApi.default.postStation);
        mockPostStation.mockResolvedValue({ id: 'new-station-id' });

        const { default: SingleArtist } = await import('$lib/components/Stations/SingleArtist.svelte');
        const { rerender } = render(SingleArtist, {
            props: { ...defaultProps, triggerCreate: false }
        });

        // First select an artist
        const input = screen.getByPlaceholderText('Radiohead...');
        await fireEvent.input(input, { target: { value: 'TestBand' } });

        await waitFor(() => {
            expect(screen.getByText('TestBand')).toBeInTheDocument();
        }, { timeout: 1000 });

        await fireEvent.click(screen.getByText('TestBand'));

        // Then trigger create
        await rerender({ ...defaultProps, triggerCreate: true });

        await waitFor(() => {
            expect(mockPostStation).toHaveBeenCalledWith('artist', 'artist-456');
        });
    });

    it('calls onStationCreated with new station ID after creation', async () => {
        const musicKit = await import('$lib/services/musicKit');
        const mockInstance = await vi.mocked(musicKit.default.getInstance)();
        const mockApiMusic = vi.mocked(mockInstance.api.music);
        mockApiMusic.mockResolvedValue({
            data: {
                results: {
                    artists: {
                        data: [{ id: 'artist-789', attributes: { name: 'AnotherBand' } }]
                    }
                }
            }
        });

        const stationApi = await import('$lib/api/stationApi');
        const mockPostStation = vi.mocked(stationApi.default.postStation);
        mockPostStation.mockResolvedValue({ id: 'created-station-123' });

        const { default: SingleArtist } = await import('$lib/components/Stations/SingleArtist.svelte');
        const { rerender } = render(SingleArtist, {
            props: { ...defaultProps, triggerCreate: false }
        });

        // First select an artist
        const input = screen.getByPlaceholderText('Radiohead...');
        await fireEvent.input(input, { target: { value: 'AnotherBand' } });

        await waitFor(() => {
            expect(screen.getByText('AnotherBand')).toBeInTheDocument();
        }, { timeout: 1000 });

        await fireEvent.click(screen.getByText('AnotherBand'));

        // Then trigger create
        await rerender({ ...defaultProps, triggerCreate: true });

        await waitFor(() => {
            expect(defaultProps.onStationCreated).toHaveBeenCalledWith('created-station-123');
        });
    });

    it('does not create station when triggered without artist selection', async () => {
        const stationApi = await import('$lib/api/stationApi');
        const mockPostStation = vi.mocked(stationApi.default.postStation);

        const { default: SingleArtist } = await import('$lib/components/Stations/SingleArtist.svelte');
        const { rerender } = render(SingleArtist, {
            props: { ...defaultProps, triggerCreate: false }
        });

        // Trigger create without selecting an artist
        await rerender({ ...defaultProps, triggerCreate: true });

        // Wait a bit and verify postStation was not called
        await new Promise(resolve => setTimeout(resolve, 100));
        expect(mockPostStation).not.toHaveBeenCalled();
    });

    it('uses labelAccessor to display artist name from attributes', async () => {
        const musicKit = await import('$lib/services/musicKit');
        const mockInstance = await vi.mocked(musicKit.default.getInstance)();
        const mockApiMusic = vi.mocked(mockInstance.api.music);
        mockApiMusic.mockResolvedValue({
            data: {
                results: {
                    artists: {
                        data: [{ id: '1', attributes: { name: 'Test Artist' } }]
                    }
                }
            }
        });

        const { default: SingleArtist } = await import('$lib/components/Stations/SingleArtist.svelte');
        render(SingleArtist, { props: defaultProps });

        const input = screen.getByPlaceholderText('Radiohead...');
        await fireEvent.input(input, { target: { value: 'Test' } });

        await waitFor(() => {
            // Should display 'Test Artist' (from attributes.name), not the raw object
            expect(screen.getByText('Test Artist')).toBeInTheDocument();
        }, { timeout: 1000 });
    });
});
