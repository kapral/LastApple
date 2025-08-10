import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { SingleArtist } from '../../../components/Stations/SingleArtist';

// Mock dependencies
jest.mock('../../../components/Search', () => ({
  Search: ({ search, onChanged, placeholder, labelAccessor }: any) => (
    <div data-testid="search-component">
      <input
        data-testid="search-input"
        placeholder={placeholder}
        onChange={async (e) => {
          if (e.target.value) {
            const results = await search(e.target.value);
            onChanged(results.slice(0, 2)); // Simulate selecting first 2 results
          } else {
            onChanged([]);
          }
        }}
      />
      <div data-testid="label-accessor">{labelAccessor ? 'Has label accessor' : 'No label accessor'}</div>
    </div>
  )
}));

jest.mock('../../../restClients/StationApi', () => ({
  default: {
    postStation: jest.fn().mockResolvedValue({ id: 'test-station-id' })
  }
}));

jest.mock('../../../musicKit', () => ({
  default: {
    getInstance: jest.fn().mockResolvedValue({
      storefrontId: 'us',
      api: {
        music: jest.fn().mockResolvedValue({
          data: {
            results: {
              artists: {
                data: [
                  { id: 'artist-1', attributes: { name: 'Radiohead' } },
                  { id: 'artist-2', attributes: { name: 'Thom Yorke' } }
                ]
              }
            }
          }
        })
      }
    })
  }
}));

describe('SingleArtist', () => {
  const defaultProps = {
    triggerCreate: false,
    onStationCreated: jest.fn(),
    onOptionsChanged: jest.fn()
  };

  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('renders without crashing', () => {
    render(<SingleArtist {...defaultProps} />);
  });

  it('applies station-parameters class', () => {
    const { container } = render(<SingleArtist {...defaultProps} />);

    expect(container.querySelector('.station-parameters')).toBeInTheDocument();
  });

  it('renders Search component with correct placeholder', () => {
    render(<SingleArtist {...defaultProps} />);

    expect(screen.getByPlaceholderText('Radiohead...')).toBeInTheDocument();
  });

  it('renders Search component with label accessor', () => {
    render(<SingleArtist {...defaultProps} />);

    expect(screen.getByText('Has label accessor')).toBeInTheDocument();
  });

  it('searches for artists using Apple Music API', async () => {
    render(<SingleArtist {...defaultProps} />);

    const searchInput = screen.getByTestId('search-input');
    fireEvent.change(searchInput, { target: { value: 'radiohead' } });

    await waitFor(() => {
      const mockMusicKit = require('../../../musicKit').default;
      expect(mockMusicKit.getInstance).toHaveBeenCalled();
    });
  });

  it('calls onOptionsChanged with true when artists are selected', async () => {
    const mockOnOptionsChanged = jest.fn();

    render(<SingleArtist {...defaultProps} onOptionsChanged={mockOnOptionsChanged} />);

    const searchInput = screen.getByTestId('search-input');
    fireEvent.change(searchInput, { target: { value: 'radiohead' } });

    await waitFor(() => {
      expect(mockOnOptionsChanged).toHaveBeenCalledWith(true);
    });
  });

  it('calls onOptionsChanged with false when no artists are selected', async () => {
    const mockOnOptionsChanged = jest.fn();

    render(<SingleArtist {...defaultProps} onOptionsChanged={mockOnOptionsChanged} />);

    const searchInput = screen.getByTestId('search-input');
    fireEvent.change(searchInput, { target: { value: '' } });

    await waitFor(() => {
      expect(mockOnOptionsChanged).toHaveBeenCalledWith(false);
    });
  });

  it('creates station with selected artist IDs when triggerCreate is true', async () => {
    const mockOnStationCreated = jest.fn();

    const { rerender } = render(
      <SingleArtist {...defaultProps} onStationCreated={mockOnStationCreated} />
    );

    // First select artists
    const searchInput = screen.getByTestId('search-input');
    fireEvent.change(searchInput, { target: { value: 'radiohead' } });

    await waitFor(() => {
      expect(mockMusicKit.getInstance).toHaveBeenCalled();
    });

    // Then trigger creation
    rerender(
      <SingleArtist 
        {...defaultProps} 
        triggerCreate={true}
        onStationCreated={mockOnStationCreated} 
      />
    );

    await waitFor(() => {
      const mockStationApi = require('../../../restClients/StationApi').default;
      expect(mockStationApi.postStation).toHaveBeenCalledWith('artist', 'artist-1,artist-2');
      expect(mockOnStationCreated).toHaveBeenCalledWith('test-station-id');
    });
  });

  it('handles empty search results gracefully', async () => {
    const mockMusicKitGetInstance = jest.fn().mockResolvedValue({
      storefrontId: 'us',
      api: {
        music: jest.fn().mockResolvedValue({
          data: {
            results: {} // No artists in results
          }
        })
      }
    });

    jest.doMock('../../../musicKit', () => ({
      default: {
        getInstance: mockMusicKitGetInstance
      }
    }));

    const { SingleArtist } = require('../../../components/Stations/SingleArtist');
    const component = new SingleArtist(defaultProps);
    const results = await component.search('nonexistent');

    expect(results).toEqual([]);
  });

  it('returns artist data from search results', async () => {
    const testArtists = [
      { id: 'test-1', attributes: { name: 'Test Artist 1' } },
      { id: 'test-2', attributes: { name: 'Test Artist 2' } }
    ];

    const mockMusicKitInstance = {
      storefrontId: 'us',
      api: {
        music: jest.fn().mockResolvedValue({
          data: {
            results: {
              artists: {
                data: testArtists
              }
            }
          }
        })
      }
    };

    mockMusicKit.getInstance.mockResolvedValue(mockMusicKitInstance);

    const component = new SingleArtist(defaultProps);
    const results = await component.search('test');

    expect(results).toEqual(testArtists);
  });

  it('updates state with artist IDs when selection changes', () => {
    const component = new SingleArtist(defaultProps);
    const mockSetState = jest.fn();
    component.setState = mockSetState;

    const testArtists = [
      { id: 'artist-1', attributes: { name: 'Artist 1' } },
      { id: 'artist-2', attributes: { name: 'Artist 2' } }
    ] as MusicKit.MediaItem[];

    component.handleChanged(testArtists);

    expect(mockSetState).toHaveBeenCalledWith({ currentArtistIds: ['artist-1', 'artist-2'] });
  });

  it('calls onOptionsChanged based on artist selection', () => {
    const mockOnOptionsChanged = jest.fn();
    const component = new SingleArtist({ ...defaultProps, onOptionsChanged: mockOnOptionsChanged });

    // With artists
    const testArtists = [{ id: 'artist-1' }] as MusicKit.MediaItem[];
    component.handleChanged(testArtists);
    expect(mockOnOptionsChanged).toHaveBeenCalledWith(true);

    // Without artists
    component.handleChanged([]);
    expect(mockOnOptionsChanged).toHaveBeenCalledWith(false);
  });

  it('has correct static Definition', () => {
    expect(SingleArtist.Definition).toEqual({
      title: 'Artist',
      description: 'Play all tracks of one artist.',
      type: SingleArtist
    });
  });

  it('handles API errors gracefully', async () => {
    const mockMusicKitInstance = {
      storefrontId: 'us',
      api: {
        music: jest.fn().mockRejectedValue(new Error('API Error'))
      }
    };

    mockMusicKit.getInstance.mockResolvedValue(mockMusicKitInstance);

    const component = new SingleArtist(defaultProps);
    
    // Should not throw when API fails
    await expect(component.search('error')).rejects.toThrow('API Error');
  });

  it('uses correct search parameters', async () => {
    render(<SingleArtist {...defaultProps} />);

    const searchInput = screen.getByTestId('search-input');
    fireEvent.change(searchInput, { target: { value: 'test search' } });

    await waitFor(() => {
      const kitInstance = mockMusicKit.getInstance.mock.results[0].value;
      expect(kitInstance.api.music).toHaveBeenCalledWith(
        '/v1/catalog/us/search',
        {
          term: 'test search',
          types: ['artists'],
          l: 'en-us'
        }
      );
    });
  });
});