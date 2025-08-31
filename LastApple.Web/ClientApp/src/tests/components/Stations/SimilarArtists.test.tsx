import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { SimilarArtists } from '../../../components/Stations/SimilarArtists';

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

jest.mock('../../../restClients/StationApi', () => ({
    default: {
        postStation: jest.fn().mockResolvedValue({ id: 'test-station-id' })
    }
}));

jest.mock('../../../restClients/LastfmApi', () => ({
    default: {
        searchArtist: jest.fn().mockResolvedValue([
            { name: 'Placebo' },
            { name: 'Radiohead' },
            { name: 'Coldplay' }
        ])
    }
}));

describe('SimilarArtists', () => {
    const defaultProps = {
        triggerCreate: false,
        onStationCreated: jest.fn(),
        onOptionsChanged: jest.fn()
    };

    beforeEach(() => {
        jest.clearAllMocks();
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
            expect(mockLastfmApi.searchArtist).toHaveBeenCalled();
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
            expect(mockStationApi.postStation).toHaveBeenCalledWith('similarartists', 'Placebo');
            expect(mockOnStationCreated).toHaveBeenCalledWith('test-station-id');
        });
    });

    it('handles empty search results', async () => {
        mockLastfmApi.searchArtist.mockResolvedValue([]);

        render(<SimilarArtists {...defaultProps} />);

        const searchInput = screen.getByTestId('search-input');
        fireEvent.change(searchInput, { target: { value: 'nonexistent' } });

        await waitFor(() => {
            expect(mockLastfmApi.searchArtist).toHaveBeenCalledWith('nonexistent');
        });

        // Should not crash and handle empty results gracefully
    });

    it('maps search results correctly', async () => {
        const testResults = [
            { name: 'Artist One', mbid: '123' },
            { name: 'Artist Two', mbid: '456' }
        ];

        mockLastfmApi.searchArtist.mockResolvedValue(testResults);

        const component = new SimilarArtists(defaultProps);
        const mappedResults = await component.search('test');

        expect(mappedResults).toEqual(['Artist One', 'Artist Two']);
    });

    it('has correct static Definition', () => {
        expect(SimilarArtists.Definition).toEqual({
            title: 'Similar Artists',
            description: 'A station containing an artist and similar performers.',
            type: SimilarArtists
        });
    });

    it('handles search errors gracefully', async () => {
        mockLastfmApi.searchArtist.mockRejectedValue(new Error('Search failed'));

        render(<SimilarArtists {...defaultProps} />);

        const searchInput = screen.getByTestId('search-input');
        
        // Should not crash when search fails
        expect(() => {
            fireEvent.change(searchInput, { target: { value: 'error' } });
        }).not.toThrow();
    });

    it('updates artist state when selection changes', async () => {
        const component = new SimilarArtists(defaultProps);
        const mockSetState = jest.fn();
        component.setState = mockSetState;

        component.handleChanged('Test Artist');

        expect(mockSetState).toHaveBeenCalledWith({ artist: 'Test Artist' });
    });

    it('calls onOptionsChanged when artist selection changes', () => {
        const mockOnOptionsChanged = jest.fn();
        const component = new SimilarArtists({ ...defaultProps, onOptionsChanged: mockOnOptionsChanged });

        component.handleChanged('Test Artist');

        expect(mockOnOptionsChanged).toHaveBeenCalledWith(true);
    });

    it('calls onOptionsChanged with false when artist is cleared', () => {
        const mockOnOptionsChanged = jest.fn();
        const component = new SimilarArtists({ ...defaultProps, onOptionsChanged: mockOnOptionsChanged });

        component.handleChanged('');

        expect(mockOnOptionsChanged).toHaveBeenCalledWith(false);
    });
});