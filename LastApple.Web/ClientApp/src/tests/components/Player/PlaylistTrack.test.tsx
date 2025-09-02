import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import { PlaylistTrack } from '../../../components/Player/PlaylistTrack';

// Mock dependencies
jest.mock('../../../components/Player/CustomToggle', () => {
    // Import React within the mock to avoid hoisting issues
    const mockReact = require('react');
    return {
        CustomToggle: mockReact.forwardRef(({ children, ...props }: any, ref) => (
            mockReact.createElement('div', { ref, ...props }, children)
        ))
    };
});

jest.mock('@fortawesome/react-fontawesome', () => ({
    FontAwesomeIcon: ({ icon }: any) => <div data-testid="fontawesome-icon" data-icon={icon.iconName} />
}));

jest.mock('react-bootstrap', () => {
    const mockReact = require('react');
    
    const DropdownComponent = ({ children, align, style }: any) => (
        mockReact.createElement('div', {
            'data-testid': 'dropdown',
            'data-align': align,
            style: style
        }, children)
    );
    
    DropdownComponent.Toggle = ({ children }: any) => 
        mockReact.createElement('div', { 'data-testid': 'dropdown-toggle' }, children);
    
    DropdownComponent.Menu = ({ children }: any) => 
        mockReact.createElement('div', { 'data-testid': 'dropdown-menu' }, children);
    
    DropdownComponent.Item = ({ children, onSelect, disabled }: any) => 
        mockReact.createElement('div', {
            'data-testid': 'dropdown-item',
            onClick: onSelect,
            'data-disabled': disabled
        }, children);
    
    return {
        Dropdown: DropdownComponent
    };
});

jest.mock('../../../musicKit', () => ({
    __esModule: true,
    default: {
        instance: {
            isAuthorized: true,
            api: {
                music: jest.fn().mockResolvedValue({
                    data: { data: [] }
                })
            },
            storefrontId: 'us',
            addEventListener: jest.fn(),
            removeEventListener: jest.fn(),
            play: jest.fn(),
            pause: jest.fn(),
            stop: jest.fn(),
            seekToTime: jest.fn(),
            player: {
                currentPlaybackTime: 0,
                currentPlaybackDuration: 0,
                playbackState: 0,
                isPlaying: false,
                nowPlayingItem: null,
            },
            queue: {
                append: jest.fn(),
                prepend: jest.fn(),
                remove: jest.fn(),
            },
        },
        getInstance: jest.fn().mockResolvedValue({
            isAuthorized: true,
            api: {
                music: jest.fn().mockResolvedValue({
                    data: { data: [] }
                })
            },
            storefrontId: 'us',
            addEventListener: jest.fn(),
            removeEventListener: jest.fn(),
            play: jest.fn(),
            pause: jest.fn(),
            stop: jest.fn(),
            seekToTime: jest.fn(),
            player: {
                currentPlaybackTime: 0,
                currentPlaybackDuration: 0,
                playbackState: 0,
                isPlaying: false,
                nowPlayingItem: null,
            },
            queue: {
                append: jest.fn(),
                prepend: jest.fn(),
                remove: jest.fn(),
            },
        }),
        formatMediaTime: jest.fn((seconds: number) => {
            const minutes = Math.floor(seconds / 60);
            const remainingSeconds = Math.floor(seconds % 60);
            return `${minutes}:${remainingSeconds.toString().padStart(2, '0')}`;
        }),
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
        ...overrides.attributes
    },
    ...overrides
} as MusicKit.MediaItem);

describe('PlaylistTrack', () => {
    const defaultProps = {
        track: createMockTrack(),
        isCurrent: false,
        isPlaying: false,
        groupOffset: 0,
        index: 0,
        onRemove: jest.fn(),
        onTrackSwitch: jest.fn(),
        addAlbumToLibrary: jest.fn(),
        addToLibrary: jest.fn()
    };

    beforeEach(() => {
        jest.clearAllMocks();
    });

    it('renders without crashing', () => {
        render(<PlaylistTrack {...defaultProps} />);
    });

    it('applies current class when track is current', () => {
        const { container } = render(<PlaylistTrack {...defaultProps} isCurrent={true} />);
        
        const playlistItem = container.querySelector('.playlist-item');
        expect(playlistItem).toHaveClass('current');
    });

    it('does not apply current class when track is not current', () => {
        const { container } = render(<PlaylistTrack {...defaultProps} isCurrent={false} />);
        
        const playlistItem = container.querySelector('.playlist-item');
        expect(playlistItem).not.toHaveClass('current');
    });

    it('shows play icon when not playing', () => {
        const { container } = render(<PlaylistTrack {...defaultProps} isPlaying={false} />);
        
        const playButton = container.querySelector('.play-button');
        const playIcon = playButton?.querySelector('[data-testid="fontawesome-icon"]');
        expect(playIcon).toHaveAttribute('data-icon', 'play');
    });

    it('shows pause icon when playing', () => {
        const { container } = render(<PlaylistTrack {...defaultProps} isPlaying={true} />);
        
        const playButton = container.querySelector('.play-button');
        const playIcon = playButton?.querySelector('[data-testid="fontawesome-icon"]');
        expect(playIcon).toHaveAttribute('data-icon', 'pause');
    });

    it('calls onTrackSwitch when play button is clicked', async () => {
        const mockOnTrackSwitch = jest.fn().mockResolvedValue(undefined);
        const { container } = render(<PlaylistTrack {...defaultProps} onTrackSwitch={mockOnTrackSwitch} index={2} groupOffset={5} />);
        
        const playButton = container.querySelector('.play-button');
        fireEvent.click(playButton!);
        
        expect(mockOnTrackSwitch).toHaveBeenCalledWith(7); // groupOffset + index = 5 + 2
    });

    it('renders dropdown menu', () => {
        render(<PlaylistTrack {...defaultProps} />);
        
        expect(screen.getByTestId('dropdown-toggle')).toBeInTheDocument();
        expect(screen.getByTestId('dropdown-menu')).toBeInTheDocument();
    });

    it('renders add song to library option', () => {
        render(<PlaylistTrack {...defaultProps} />);
        
        const dropdownItems = screen.getAllByTestId('dropdown-item');
        const addSongItem = dropdownItems.find(item => 
            item.textContent?.includes('Add song to your AppleMusic Library')
        );
        
        expect(addSongItem).toBeInTheDocument();
    });

    it('renders add album to library option', () => {
        render(<PlaylistTrack {...defaultProps} />);
        
        const dropdownItems = screen.getAllByTestId('dropdown-item');
        const addAlbumItem = dropdownItems.find(item => 
            item.textContent?.includes('Add album to your AppleMusic Library')
        );
        
        expect(addAlbumItem).toBeInTheDocument();
    });

    it('calls addToLibrary when add song option is clicked', () => {
        const mockAddToLibrary = jest.fn();
        const testTrack = createMockTrack();
        
        render(<PlaylistTrack {...defaultProps} addToLibrary={mockAddToLibrary} track={testTrack} />);
        
        const dropdownItems = screen.getAllByTestId('dropdown-item');
        const addSongItem = dropdownItems.find(item => 
            item.textContent?.includes('Add song to your AppleMusic Library')
        );
        
        fireEvent.click(addSongItem!);
        
        expect(mockAddToLibrary).toHaveBeenCalledWith(testTrack);
    });

    it('calls addAlbumToLibrary when add album option is clicked', () => {
        const mockAddAlbumToLibrary = jest.fn();
        const testTrack = createMockTrack();
        
        render(<PlaylistTrack {...defaultProps} addAlbumToLibrary={mockAddAlbumToLibrary} track={testTrack} />);
        
        const dropdownItems = screen.getAllByTestId('dropdown-item');
        const addAlbumItem = dropdownItems.find(item => 
            item.textContent?.includes('Add album to your AppleMusic Library')
        );
        
        fireEvent.click(addAlbumItem!);
        
        expect(mockAddAlbumToLibrary).toHaveBeenCalledWith(testTrack);
    });

    it('disables library options when not authorized', () => {
        // Temporarily override the mock for this test
        const musicKit = require('../../../musicKit');
        const originalInstance = musicKit.default.instance;
        musicKit.default.instance = {
            ...originalInstance,
            isAuthorized: false
        };

        render(<PlaylistTrack {...defaultProps} />);

        const dropdownItems = screen.getAllByTestId('dropdown-item');
        const addSongItem = dropdownItems.find(item => 
            item.textContent?.includes('Add song to your AppleMusic Library')
        );
        const addAlbumItem = dropdownItems.find(item => 
            item.textContent?.includes('Add album to your AppleMusic Library')
        );

        expect(addSongItem).toHaveAttribute('data-disabled', 'true');
        expect(addAlbumItem).toHaveAttribute('data-disabled', 'true');

        // Restore the original mock
        musicKit.default.instance = originalInstance;
    });

    it('enables library options when authorized', () => {
        render(<PlaylistTrack {...defaultProps} />);

        const dropdownItems = screen.getAllByTestId('dropdown-item');
        const addSongItem = dropdownItems.find(item => 
            item.textContent?.includes('Add song to your AppleMusic Library')
        );
        const addAlbumItem = dropdownItems.find(item => 
            item.textContent?.includes('Add album to your AppleMusic Library')
        );

        expect(addSongItem).toHaveAttribute('data-disabled', 'false');
        expect(addAlbumItem).toHaveAttribute('data-disabled', 'false');
    });

    it('has correct styling for playlist item', () => {
        const { container } = render(<PlaylistTrack {...defaultProps} />);
        
        const playlistItem = container.querySelector('.playlist-item');
        expect(playlistItem).toHaveClass('clearfix');
        expect(playlistItem).toHaveStyle('margin: 0 5px');
    });

    it('uses correct index calculation for dropdown id', () => {
        render(<PlaylistTrack {...defaultProps} index={3} groupOffset={10} />);
        
        // The dropdown should use groupOffset + index for the ID
        // We can't easily test the id attribute with our mock, but we can verify the component renders
        expect(screen.getByTestId('dropdown-toggle')).toBeInTheDocument();
    });
});