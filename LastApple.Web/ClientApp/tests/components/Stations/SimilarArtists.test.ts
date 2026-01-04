import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent, waitFor } from '@testing-library/svelte';

// Mock lastfm API - use inline factory to avoid hoisting issues
vi.mock('$lib/api/lastfmApi', () => ({
    default: {
        searchArtist: vi.fn().mockResolvedValue([])
    }
}));

// Mock station API
vi.mock('$lib/api/stationApi', () => ({
    default: {
        postStation: vi.fn().mockResolvedValue({ id: 'mock-station-id' })
    }
}));

describe('SimilarArtists', () => {
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
        const { default: SimilarArtists } = await import('$lib/components/Stations/SimilarArtists.svelte');
        const { container } = render(SimilarArtists, { props: defaultProps });

        expect(container.querySelector('.station-parameters')).toBeInTheDocument();
    });

    it('renders Search component with placeholder "Placebo..."', async () => {
        const { default: SimilarArtists } = await import('$lib/components/Stations/SimilarArtists.svelte');
        render(SimilarArtists, { props: defaultProps });

        expect(screen.getByPlaceholderText('Placebo...')).toBeInTheDocument();
    });

    it('calls onOptionsChanged(false) initially (no artist selected)', async () => {
        const { default: SimilarArtists } = await import('$lib/components/Stations/SimilarArtists.svelte');
        render(SimilarArtists, { props: defaultProps });

        expect(defaultProps.onOptionsChanged).toHaveBeenCalledWith(false);
    });

    it('searches Last.fm API when user types', async () => {
        const lastfmApi = await import('$lib/api/lastfmApi');
        const mockSearchArtist = vi.mocked(lastfmApi.default.searchArtist);
        
        const { default: SimilarArtists } = await import('$lib/components/Stations/SimilarArtists.svelte');
        render(SimilarArtists, { props: defaultProps });

        const input = screen.getByPlaceholderText('Placebo...');
        await fireEvent.input(input, { target: { value: 'Placebo' } });

        await waitFor(() => {
            expect(mockSearchArtist).toHaveBeenCalledWith('Placebo');
        }, { timeout: 1000 });
    });

    it('displays artist names from Last.fm search results', async () => {
        const lastfmApi = await import('$lib/api/lastfmApi');
        const mockSearchArtist = vi.mocked(lastfmApi.default.searchArtist);
        mockSearchArtist.mockResolvedValue([
            { name: 'Placebo' },
            { name: 'Placebo Effect' }
        ]);

        const { default: SimilarArtists } = await import('$lib/components/Stations/SimilarArtists.svelte');
        render(SimilarArtists, { props: defaultProps });

        const input = screen.getByPlaceholderText('Placebo...');
        await fireEvent.input(input, { target: { value: 'Placebo' } });

        await waitFor(() => {
            expect(screen.getByText('Placebo')).toBeInTheDocument();
        }, { timeout: 1000 });
    });

    it('calls onOptionsChanged(true) when artist is selected', async () => {
        const lastfmApi = await import('$lib/api/lastfmApi');
        const mockSearchArtist = vi.mocked(lastfmApi.default.searchArtist);
        mockSearchArtist.mockResolvedValue([{ name: 'Placebo' }]);

        const { default: SimilarArtists } = await import('$lib/components/Stations/SimilarArtists.svelte');
        render(SimilarArtists, { props: defaultProps });

        const input = screen.getByPlaceholderText('Placebo...');
        await fireEvent.input(input, { target: { value: 'Placebo' } });

        await waitFor(() => {
            expect(screen.getByText('Placebo')).toBeInTheDocument();
        }, { timeout: 1000 });

        await fireEvent.click(screen.getByText('Placebo'));

        expect(defaultProps.onOptionsChanged).toHaveBeenCalledWith(true);
    });

    it('creates station with "similarartists" type when triggered after selecting artist', async () => {
        const lastfmApi = await import('$lib/api/lastfmApi');
        const mockSearchArtist = vi.mocked(lastfmApi.default.searchArtist);
        mockSearchArtist.mockResolvedValue([{ name: 'Placebo' }]);

        const stationApi = await import('$lib/api/stationApi');
        const mockPostStation = vi.mocked(stationApi.default.postStation);
        mockPostStation.mockResolvedValue({ id: 'new-station-id' });

        const { default: SimilarArtists } = await import('$lib/components/Stations/SimilarArtists.svelte');
        const { rerender } = render(SimilarArtists, { 
            props: { ...defaultProps, triggerCreate: false } 
        });

        // First, select an artist
        const input = screen.getByPlaceholderText('Placebo...');
        await fireEvent.input(input, { target: { value: 'Placebo' } });

        await waitFor(() => {
            expect(screen.getByText('Placebo')).toBeInTheDocument();
        }, { timeout: 1000 });

        await fireEvent.click(screen.getByText('Placebo'));

        // Then trigger create
        await rerender({ ...defaultProps, triggerCreate: true });

        await waitFor(() => {
            expect(mockPostStation).toHaveBeenCalledWith('similarartists', 'Placebo');
        });
    });

    it('calls onStationCreated with station ID after creation', async () => {
        const lastfmApi = await import('$lib/api/lastfmApi');
        const mockSearchArtist = vi.mocked(lastfmApi.default.searchArtist);
        mockSearchArtist.mockResolvedValue([{ name: 'TestArtist' }]);

        const stationApi = await import('$lib/api/stationApi');
        const mockPostStation = vi.mocked(stationApi.default.postStation);
        mockPostStation.mockResolvedValue({ id: 'similar-station-123' });

        const { default: SimilarArtists } = await import('$lib/components/Stations/SimilarArtists.svelte');
        const { rerender } = render(SimilarArtists, { 
            props: { ...defaultProps, triggerCreate: false } 
        });

        // First, select an artist
        const input = screen.getByPlaceholderText('Placebo...');
        await fireEvent.input(input, { target: { value: 'TestArtist' } });

        await waitFor(() => {
            expect(screen.getByText('TestArtist')).toBeInTheDocument();
        }, { timeout: 1000 });

        await fireEvent.click(screen.getByText('TestArtist'));

        // Then trigger create
        await rerender({ ...defaultProps, triggerCreate: true });

        await waitFor(() => {
            expect(defaultProps.onStationCreated).toHaveBeenCalledWith('similar-station-123');
        });
    });

    it('does not create station when triggered without artist selection', async () => {
        const stationApi = await import('$lib/api/stationApi');
        const mockPostStation = vi.mocked(stationApi.default.postStation);

        const { default: SimilarArtists } = await import('$lib/components/Stations/SimilarArtists.svelte');
        const { rerender } = render(SimilarArtists, { 
            props: { ...defaultProps, triggerCreate: false } 
        });

        // Trigger create without selecting an artist
        await rerender({ ...defaultProps, triggerCreate: true });

        // Wait a bit and verify postStation was not called
        await new Promise(resolve => setTimeout(resolve, 100));
        expect(mockPostStation).not.toHaveBeenCalled();
    });
});
