import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent, waitFor } from '@testing-library/svelte';
import SimilarArtists from '$lib/components/Stations/SimilarArtists.svelte';

// Mock lastfm API
const mockSearchArtist = vi.fn();
vi.mock('$lib/api/lastfmApi', () => ({
    default: {
        searchArtist: mockSearchArtist
    }
}));

// Mock station API
const mockPostStation = vi.fn();
vi.mock('$lib/api/stationApi', () => ({
    default: {
        postStation: mockPostStation
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
        mockSearchArtist.mockResolvedValue([]);
    });

    it('applies station-parameters class', () => {
        const { container } = render(SimilarArtists, { props: defaultProps });

        expect(container.querySelector('.station-parameters')).toBeInTheDocument();
    });

    it('renders Search component with placeholder "Placebo..."', () => {
        render(SimilarArtists, { props: defaultProps });

        expect(screen.getByPlaceholderText('Placebo...')).toBeInTheDocument();
    });

    it('calls onOptionsChanged(false) initially (no artist selected)', () => {
        render(SimilarArtists, { props: defaultProps });

        expect(defaultProps.onOptionsChanged).toHaveBeenCalledWith(false);
    });

    it('searches Last.fm API when user types', async () => {
        render(SimilarArtists, { props: defaultProps });

        const input = screen.getByPlaceholderText('Placebo...');
        await fireEvent.input(input, { target: { value: 'Placebo' } });

        await waitFor(() => {
            expect(mockSearchArtist).toHaveBeenCalledWith('Placebo');
        }, { timeout: 1000 });
    });

    it('displays artist names from Last.fm search results', async () => {
        mockSearchArtist.mockResolvedValue([
            { name: 'Placebo' },
            { name: 'Placebo Effect' }
        ]);

        render(SimilarArtists, { props: defaultProps });

        const input = screen.getByPlaceholderText('Placebo...');
        await fireEvent.input(input, { target: { value: 'Placebo' } });

        await waitFor(() => {
            expect(screen.getByText('Placebo')).toBeInTheDocument();
        }, { timeout: 1000 });
    });

    it('calls onOptionsChanged(true) when artist is selected', async () => {
        mockSearchArtist.mockResolvedValue([{ name: 'Placebo' }]);

        render(SimilarArtists, { props: defaultProps });

        const input = screen.getByPlaceholderText('Placebo...');
        await fireEvent.input(input, { target: { value: 'Placebo' } });

        await waitFor(() => {
            expect(screen.getByText('Placebo')).toBeInTheDocument();
        }, { timeout: 1000 });

        await fireEvent.click(screen.getByText('Placebo'));

        expect(defaultProps.onOptionsChanged).toHaveBeenCalledWith(true);
    });

    it('creates station with "similarartists" type when triggered', async () => {
        mockPostStation.mockResolvedValue({ id: 'new-station-id' });

        const { rerender } = render(SimilarArtists, { 
            props: { ...defaultProps, triggerCreate: false } 
        });

        await rerender({ ...defaultProps, triggerCreate: true });

        await waitFor(() => {
            expect(mockPostStation).toHaveBeenCalledWith('similarartists', expect.any(String));
        });
    });

    it('calls onStationCreated with station ID after creation', async () => {
        mockPostStation.mockResolvedValue({ id: 'similar-station-123' });

        const { rerender } = render(SimilarArtists, { 
            props: { ...defaultProps, triggerCreate: false } 
        });

        await rerender({ ...defaultProps, triggerCreate: true });

        await waitFor(() => {
            expect(defaultProps.onStationCreated).toHaveBeenCalledWith('similar-station-123');
        });
    });
});
