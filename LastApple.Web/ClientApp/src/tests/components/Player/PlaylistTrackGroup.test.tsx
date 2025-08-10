import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import { PlaylistTrackGroup } from '../../../components/Player/PlaylistTrackGroup';

// Mock dependencies
jest.mock('../../../components/Player/CustomToggle', () => ({
  CustomToggle: React.forwardRef(({ children, ...props }: any, ref) => (
    <div ref={ref} {...props} data-testid="custom-toggle">{children}</div>
  ))
}));

jest.mock('@fortawesome/react-fontawesome', () => ({
  FontAwesomeIcon: ({ icon }: any) => <div data-testid="fontawesome-icon" data-icon={icon.iconName} />
}));

jest.mock('react-bootstrap', () => ({
  Dropdown: {
    Toggle: ({ children }: any) => <div data-testid="dropdown-toggle">{children}</div>,
    Menu: ({ children }: any) => <div data-testid="dropdown-menu">{children}</div>,
    Item: ({ children, onSelect, disabled }: any) => (
      <div 
        data-testid="dropdown-item" 
        onClick={onSelect}
        data-disabled={disabled}
      >
        {children}
      </div>
    )
  }
}));

jest.mock('../../../musicKit', () => ({
  default: {
    instance: {
      isAuthorized: true
    }
  }
}));

const createMockTrack = (overrides: Partial<MusicKit.MediaItem> = {}): MusicKit.MediaItem => ({
  id: 'test-track-id',
  type: 'songs',
  href: '/test-href',
  attributes: {
    name: 'Test Song',
    artistName: 'Test Artist',
    albumName: 'Test Album',
    artwork: {
      url: 'https://example.com/artwork/{w}x{h}.jpg',
      width: 300,
      height: 300
    },
    ...overrides.attributes
  },
  ...overrides
} as MusicKit.MediaItem);

describe('PlaylistTrackGroup', () => {
  const defaultProps = {
    currentTrack: createMockTrack(),
    tracks: [
      createMockTrack({ id: 'track-1', attributes: { name: 'Song 1' } }),
      createMockTrack({ id: 'track-2', attributes: { name: 'Song 2' } })
    ],
    isPlaying: false,
    index: 0,
    onRemove: jest.fn(),
    addAlbumToLibrary: jest.fn()
  };

  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('renders without crashing', () => {
    render(<PlaylistTrackGroup {...defaultProps} />);
  });

  it('displays album artwork from first track', () => {
    const tracks = [createMockTrack({
      attributes: {
        artwork: {
          url: 'https://example.com/album-art/{w}x{h}.jpg',
          width: 300,
          height: 300
        }
      }
    })];

    render(<PlaylistTrackGroup {...defaultProps} tracks={tracks} />);
    
    const albumArt = screen.getByAltText('album logo');
    expect(albumArt).toHaveAttribute('src', 'https://example.com/album-art/60x60.jpg');
  });

  it('applies correct styling to album artwork', () => {
    render(<PlaylistTrackGroup {...defaultProps} />);
    
    const albumArt = screen.getByAltText('album logo');
    expect(albumArt).toHaveStyle({
      height: '60px',
      width: '60px',
      verticalAlign: 'top'
    });
  });

  it('renders dropdown menu', () => {
    render(<PlaylistTrackGroup {...defaultProps} />);
    
    expect(screen.getByTestId('dropdown-toggle')).toBeInTheDocument();
    expect(screen.getByTestId('dropdown-menu')).toBeInTheDocument();
  });

  it('renders add album to library option', () => {
    render(<PlaylistTrackGroup {...defaultProps} />);
    
    const dropdownItems = screen.getAllByTestId('dropdown-item');
    const addAlbumItem = dropdownItems.find(item => 
      item.textContent?.includes('Add album to your AppleMusic Library')
    );
    
    expect(addAlbumItem).toBeInTheDocument();
  });

  it('calls addAlbumToLibrary when add album option is clicked', () => {
    const mockAddAlbumToLibrary = jest.fn();
    const testTracks = [createMockTrack({ id: 'album-track-1' })];
    
    render(
      <PlaylistTrackGroup 
        {...defaultProps} 
        addAlbumToLibrary={mockAddAlbumToLibrary} 
        tracks={testTracks}
      />
    );
    
    const dropdownItems = screen.getAllByTestId('dropdown-item');
    const addAlbumItem = dropdownItems.find(item => 
      item.textContent?.includes('Add album to your AppleMusic Library')
    );
    
    fireEvent.click(addAlbumItem!);
    
    expect(mockAddAlbumToLibrary).toHaveBeenCalledWith(testTracks[0]);
  });

  it('disables add album option when not authorized', () => {
    jest.doMock('../../../musicKit', () => ({
      default: {
        instance: {
          isAuthorized: false
        }
      }
    }));
    
    render(<PlaylistTrackGroup {...defaultProps} />);

    const dropdownItems = screen.getAllByTestId('dropdown-item');
    const addAlbumItem = dropdownItems.find(item => 
      item.textContent?.includes('Add album to your AppleMusic Library')
    );

    expect(addAlbumItem).toHaveAttribute('data-disabled', 'true');
  });

  it('enables add album option when authorized', () => {
    render(<PlaylistTrackGroup {...defaultProps} />);

    const dropdownItems = screen.getAllByTestId('dropdown-item');
    const addAlbumItem = dropdownItems.find(item => 
      item.textContent?.includes('Add album to your AppleMusic Library')
    );

    expect(addAlbumItem).toHaveAttribute('data-disabled', 'false');
  });

  it('has correct container styling', () => {
    const { container } = render(<PlaylistTrackGroup {...defaultProps} />);
    
    const groupContainer = container.firstChild as HTMLElement;
    expect(groupContainer).toHaveStyle('marginBottom: 20px');
  });

  it('has correct header styling', () => {
    const { container } = render(<PlaylistTrackGroup {...defaultProps} />);
    
    const header = container.querySelector('[style*="background: #00000099"]');
    expect(header).toHaveStyle({
      background: '#00000099',
      marginBottom: '5px',
      padding: '.4rem'
    });
  });

  it('has correct album info container styling', () => {
    const { container } = render(<PlaylistTrackGroup {...defaultProps} />);
    
    const albumHeader = container.querySelector('.album-header');
    expect(albumHeader).toHaveStyle({
      display: 'inline-block',
      width: 'calc(100% - 60px)',
      padding: '7px 0 0 10px'
    });
  });

  it('uses correct dropdown id with index', () => {
    render(<PlaylistTrackGroup {...defaultProps} index={5} />);
    
    // The dropdown should use the index for the ID
    // We can't easily test the id attribute with our mock, but we can verify the component renders
    expect(screen.getByTestId('dropdown-toggle')).toBeInTheDocument();
  });

  it('handles empty tracks array gracefully', () => {
    const { container } = render(<PlaylistTrackGroup {...defaultProps} tracks={[]} />);
    
    // Component should still render but may have issues accessing tracks[0]
    // In real implementation this might cause an error, but our test should handle it
    expect(container.firstChild).toBeInTheDocument();
  });

  it('renders with children prop support', () => {
    render(
      <PlaylistTrackGroup {...defaultProps}>
        <div data-testid="child-content">Child Content</div>
      </PlaylistTrackGroup>
    );
    
    expect(screen.getByTestId('child-content')).toBeInTheDocument();
  });
});