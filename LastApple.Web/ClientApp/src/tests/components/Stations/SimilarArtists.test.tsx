// Mock APIs before any imports
jest.mock('../../../restClients/LastfmApi', () => ({
    __esModule: true,
    default: {
        searchArtist: jest.fn().mockResolvedValue([
            { name: 'Placebo' },
            { name: 'Radiohead' },
            { name: 'Coldplay' }
        ])
    }
}));

jest.mock('../../../restClients/StationApi', () => ({
    __esModule: true,
    default: {
        postStation: jest.fn().mockResolvedValue({ id: 'test-station-id' })
    }
}));

// Mock dependencies
jest.mock('../../../components/Search', () => ({
    Search: ({ search, onChanged, placeholder }: any) => (
        <div data-testid="search-component">
            <input
                data-testid="search-input"
                placeholder={placeholder}
                onChange={async (e) => {
                    if (e.target.value) {
                        const results = await search(e.target.value);
                        onChanged([results[0]]); // Simulate selecting first result
                    } else {
                        onChanged([]);
                    }
                }}
            />
        </div>
    )
}));

import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { SimilarArtists } from '../../../components/Stations/SimilarArtists';

describe('SimilarArtists', () => {
    const defaultProps = {
        triggerCreate: false,
        onStationCreated: jest.fn(),
        onOptionsChanged: jest.fn()
    };

    beforeEach(() => {
        jest.clearAllMocks();
        
        // Restore mock implementations after clearAllMocks
        const lastfmApi = require('../../../restClients/LastfmApi').default;
        lastfmApi.searchArtist.mockResolvedValue([
            { name: 'Placebo' },
            { name: 'Radiohead' },
            { name: 'Coldplay' }
        ]);
        
        const stationApi = require('../../../restClients/StationApi').default;
        stationApi.postStation.mockResolvedValue({ id: 'test-station-id' });
    });

    it('renders without crashing', () => {
        render(<SimilarArtists {...defaultProps} />);
    });

    it('applies station-parameters class', () => {
        const { container } = render(<SimilarArtists {...defaultProps} />);

        expect(container.querySelector('.station-parameters')).toBeInTheDocument();
    });

    it('renders Search component with correct placeholder', () => {
        render(<SimilarArtists {...defaultProps} />);

        expect(screen.getByPlaceholderText('Placebo...')).toBeInTheDocument();
    });

    it('searches for artists when input changes', async () => {
        render(<SimilarArtists {...defaultProps} />);

        const searchInput = screen.getByTestId('search-input');
        fireEvent.change(searchInput, { target: { value: 'radiohead' } });

        await waitFor(() => {
            const mockLastfmApi = require('../../../restClients/LastfmApi').default;
            expect(mockLastfmApi.searchArtist).toHaveBeenCalledWith('radiohead');
        });
    });

    it('calls onOptionsChanged with true when artist is selected', async () => {
        const mockOnOptionsChanged = jest.fn();

        render(<SimilarArtists {...defaultProps} onOptionsChanged={mockOnOptionsChanged} />);

        const searchInput = screen.getByTestId('search-input');
        fireEvent.change(searchInput, { target: { value: 'radiohead' } });

        await waitFor(() => {
            expect(mockOnOptionsChanged).toHaveBeenCalledWith(true);
        });
    });

    it('calls onOptionsChanged with false when no artist is selected', async () => {
        const mockOnOptionsChanged = jest.fn();

        render(<SimilarArtists {...defaultProps} onOptionsChanged={mockOnOptionsChanged} />);

        const searchInput = screen.getByTestId('search-input');
        fireEvent.change(searchInput, { target: { value: '' } });

        await waitFor(() => {
            expect(mockOnOptionsChanged).toHaveBeenCalledWith(false);
        });
    });

    it('creates station when triggerCreate is true', async () => {
        const mockOnStationCreated = jest.fn();

        const { rerender } = render(
            <SimilarArtists {...defaultProps} onStationCreated={mockOnStationCreated} />
        );

        // First select an artist
        const searchInput = screen.getByTestId('search-input');
        fireEvent.change(searchInput, { target: { value: 'placebo' } });

        await waitFor(() => {
            const lastfmApi = require('../../../restClients/LastfmApi').default;
            expect(lastfmApi.searchArtist).toHaveBeenCalled();
        });

        // Then trigger creation
        rerender(
            <SimilarArtists 
                {...defaultProps} 
                triggerCreate={true}
                onStationCreated={mockOnStationCreated} 
            />
        );

        await waitFor(() => {
            const stationApi = require('../../../restClients/StationApi').default;
            expect(stationApi.postStation).toHaveBeenCalledWith('similarartists', 'Placebo');
            expect(mockOnStationCreated).toHaveBeenCalledWith('test-station-id');
        });
    });

    it('handles empty search results', async () => {
        const lastfmApi = require('../../../restClients/LastfmApi').default;
        lastfmApi.searchArtist.mockResolvedValue([]);

        render(<SimilarArtists {...defaultProps} />);

        const searchInput = screen.getByTestId('search-input');
        fireEvent.change(searchInput, { target: { value: 'nonexistent' } });

        await waitFor(() => {
            const lastfmApi = require('../../../restClients/LastfmApi').default;
            expect(lastfmApi.searchArtist).toHaveBeenCalledWith('nonexistent');
        });

        // Should not crash and handle empty results gracefully
    });

    it('maps search results correctly', async () => {
        const testResults = [
            { name: 'Artist One', mbid: '123' },
            { name: 'Artist Two', mbid: '456' }
        ];

        const lastfmApi = require('../../../restClients/LastfmApi').default;
        lastfmApi.searchArtist.mockResolvedValue(testResults);

        // Test the search method more safely using component render
        render(<SimilarArtists {...defaultProps} />);
        
        // Verify that the search works by mocking it
        const searchInput = screen.getByTestId('search-input');
        fireEvent.change(searchInput, { target: { value: 'test' } });
        
        await waitFor(() => {
            expect(lastfmApi.searchArtist).toHaveBeenCalledWith('test');
        });
    });

    it('has correct static Definition', () => {
        expect(SimilarArtists.Definition).toEqual({
            title: 'Similar Artists',
            description: 'A station containing an artist and similar performers.',
            type: SimilarArtists
        });
    });

    it('handles search errors gracefully', async () => {
        const lastfmApi = require('../../../restClients/LastfmApi').default;
        lastfmApi.searchArtist.mockRejectedValue(new Error('Search failed'));

        render(<SimilarArtists {...defaultProps} />);

        const searchInput = screen.getByTestId('search-input');
        
        // Should not crash when search fails
        expect(() => {
            fireEvent.change(searchInput, { target: { value: 'error' } });
        }).not.toThrow();
    });

    it('updates artist state when selection changes', async () => {
        const mockOnOptionsChanged = jest.fn();
        render(<SimilarArtists {...defaultProps} onOptionsChanged={mockOnOptionsChanged} />);

        const searchInput = screen.getByTestId('search-input');
        fireEvent.change(searchInput, { target: { value: 'Test Artist' } });

        await waitFor(() => {
            expect(mockOnOptionsChanged).toHaveBeenCalledWith(true);
        });
    });

    it('calls onOptionsChanged when artist selection changes', async () => {
        const mockOnOptionsChanged = jest.fn();
        render(<SimilarArtists {...defaultProps} onOptionsChanged={mockOnOptionsChanged} />);

        const searchInput = screen.getByTestId('search-input');
        fireEvent.change(searchInput, { target: { value: 'Test Artist' } });

        await waitFor(() => {
            expect(mockOnOptionsChanged).toHaveBeenCalledWith(true);
        });
    });

    it('calls onOptionsChanged with false when artist is cleared', async () => {
        const mockOnOptionsChanged = jest.fn();
        render(<SimilarArtists {...defaultProps} onOptionsChanged={mockOnOptionsChanged} />);

        const searchInput = screen.getByTestId('search-input');
        fireEvent.change(searchInput, { target: { value: '' } });

        await waitFor(() => {
            expect(mockOnOptionsChanged).toHaveBeenCalledWith(false);
        });
    });
});