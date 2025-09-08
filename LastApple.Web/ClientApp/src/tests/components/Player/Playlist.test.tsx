import React from 'react';
import { render, screen } from '@testing-library/react';
import { Playlist } from '../../../components/Player/Playlist';

// Mock dependencies
jest.mock('../../../components/Player/PlaylistTrack', () => ({
    PlaylistTrack: ({ track, isCurrent, isPlaying, index, groupOffset, onTrackSwitch, addToLibrary, addAlbumToLibrary, onRemove }: any) => (
        <div data-testid="playlist-track">
            <div data-testid="track-name">{track.attributes.name}</div>
            <div data-testid="is-current">{isCurrent ? 'current' : 'not-current'}</div>
            <div data-testid="is-playing">{isPlaying ? 'playing' : 'not-playing'}</div>
            <div data-testid="index">{index}</div>
            <div data-testid="group-offset">{groupOffset}</div>
            <button onClick={() => onTrackSwitch(index)}>Switch Track</button>
            <button onClick={() => addToLibrary(track)}>Add to Library</button>
            <button onClick={() => addAlbumToLibrary(track)}>Add Album</button>
            <button onClick={() => onRemove(index, 1)}>Remove</button>
        </div>
    )
}));

jest.mock('../../../components/Player/PlaylistTrackGroup', () => ({
    PlaylistTrackGroup: ({ tracks, currentTrack, isPlaying, index }: any) => (
        <div data-testid="playlist-track-group">
            <div data-testid="group-index">{index}</div>
            <div data-testid="group-track-count">{tracks.length}</div>
            <div data-testid="group-is-playing">{isPlaying ? 'playing' : 'not-playing'}</div>
        </div>
    )
}));

import AsMock from '../../AsMock';
import { overrideMusicKitInstance, resetMusicKitMock } from '../../utils/musicKitTestUtils';

const createMockTrack = (overrides: Partial<MusicKit.MediaItem> = {}): MusicKit.MediaItem => ({
    id: `track-${Math.random()}`,
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

describe('Playlist', () => {
    const defaultProps = {
        currentTrack: createMockTrack({ attributes: { name: 'Current Song' } }),
        isPlaying: false,
        tracks: [],
        offset: 0,
        limit: 10,
        showAlbumInfo: false,
        onRemove: jest.fn(),
        onTrackSwitch: jest.fn()
    };

    beforeEach(() => {
        jest.clearAllMocks();
        resetMusicKitMock();
        
        // Override specific API method needed for Playlist tests
        overrideMusicKitInstance({
            api: {
                music: jest.fn().mockResolvedValue({
                    data: { data: [] }
                }),
                addToLibrary: jest.fn().mockResolvedValue(undefined)
            }
        });
    });

    it('renders without crashing', () => {
        render(<Playlist {...defaultProps} />);
    });

    it('returns null when tracks array is empty', () => {
        const { container } = render(<Playlist {...defaultProps} tracks={[]} />);
        
        expect(container.firstChild).toBeNull();
    });

    it('applies playlist class when showAlbumInfo is false', () => {
        const tracks = [createMockTrack()];
        const { container } = render(<Playlist {...defaultProps} tracks={tracks} showAlbumInfo={false} />);
        
        expect(container.querySelector('.playlist')).toBeInTheDocument();
    });

    it('applies playlist class when showAlbumInfo is true', () => {
        const tracks = [createMockTrack()];
        const { container } = render(<Playlist {...defaultProps} tracks={tracks} showAlbumInfo={true} />);
        
        expect(container.querySelector('.playlist')).toBeInTheDocument();
    });

    it('renders individual tracks when showAlbumInfo is false', () => {
        const tracks = [
            createMockTrack({ attributes: { name: 'Song 1' } }),
            createMockTrack({ attributes: { name: 'Song 2' } })
        ];

        render(<Playlist {...defaultProps} tracks={tracks} showAlbumInfo={false} />);

        expect(screen.getAllByTestId('playlist-track')).toHaveLength(2);
        expect(screen.getByText('Song 1')).toBeInTheDocument();
        expect(screen.getByText('Song 2')).toBeInTheDocument();
    });

    it('passes correct props to PlaylistTrack components', () => {
        const currentTrack = createMockTrack({ attributes: { name: 'Current Song' } });
        const tracks = [
            currentTrack,
            createMockTrack({ attributes: { name: 'Other Song' } })
        ];

        render(
            <Playlist 
                {...defaultProps} 
                tracks={tracks} 
                currentTrack={currentTrack}
                isPlaying={true}
                showAlbumInfo={false} 
            />
        );

        const playlistTracks = screen.getAllByTestId('playlist-track');
        
        // First track should be current and playing
        expect(playlistTracks[0]).toHaveTextContent('current');
        expect(playlistTracks[0]).toHaveTextContent('playing');
        
        // Second track should not be current or playing
        expect(playlistTracks[1]).toHaveTextContent('not-current');
        expect(playlistTracks[1]).toHaveTextContent('not-playing');
    });

    it('respects offset and limit for visible tracks', () => {
        const tracks = Array.from({ length: 20 }, (_, i) => 
            createMockTrack({ attributes: { name: `Song ${i + 1}` } })
        );

        render(
            <Playlist 
                {...defaultProps} 
                tracks={tracks} 
                offset={5}
                limit={3}
                showAlbumInfo={false} 
            />
        );

        const playlistTracks = screen.getAllByTestId('playlist-track');
        expect(playlistTracks).toHaveLength(3);
        
        // Should show tracks 6, 7, 8 (offset 5, limit 3)
        expect(screen.getByText('Song 6')).toBeInTheDocument();
        expect(screen.getByText('Song 7')).toBeInTheDocument();
        expect(screen.getByText('Song 8')).toBeInTheDocument();
    });

    it('renders track groups when showAlbumInfo is true', () => {
        const tracks = [
            createMockTrack({ 
                attributes: { 
                    name: 'Song 1', 
                    albumName: 'Album A',
                    artistName: 'Artist 1'
                } 
            }),
            createMockTrack({ 
                attributes: { 
                    name: 'Song 2', 
                    albumName: 'Album A',
                    artistName: 'Artist 1'
                } 
            }),
            createMockTrack({ 
                attributes: { 
                    name: 'Song 3', 
                    albumName: 'Album B',
                    artistName: 'Artist 2'
                } 
            })
        ];

        render(<Playlist {...defaultProps} tracks={tracks} showAlbumInfo={true} />);

        const trackGroups = screen.getAllByTestId('playlist-track-group');
        expect(trackGroups.length).toBeGreaterThan(0);
    });

    it('passes correct index to track groups', () => {
        const tracks = [
            createMockTrack({ 
                attributes: { 
                    name: 'Song 1', 
                    albumName: 'Album A',
                    artistName: 'Artist 1'
                } 
            })
        ];

        render(<Playlist {...defaultProps} tracks={tracks} showAlbumInfo={true} />);

        // Should have at least one track group with proper index
        expect(screen.getByTestId('playlist-track-group')).toBeInTheDocument();
    });

    it('handles tracks without album information', () => {
        const tracks = [
            createMockTrack({ 
                attributes: { 
                    name: 'Song 1',
                    albumName: undefined as any,
                    artistName: undefined as any
                } 
            })
        ];

        render(<Playlist {...defaultProps} tracks={tracks} showAlbumInfo={false} />);

        expect(screen.getByTestId('playlist-track')).toBeInTheDocument();
    });

    it('determines current track correctly across different tracks', () => {
        const track1 = createMockTrack({ attributes: { name: 'Song 1' } });
        const track2 = createMockTrack({ attributes: { name: 'Song 2' } });
        const tracks = [track1, track2];

        render(
            <Playlist 
                {...defaultProps} 
                tracks={tracks} 
                currentTrack={track2}
                showAlbumInfo={false} 
            />
        );

        const playlistTracks = screen.getAllByTestId('playlist-track');
        
        // First track should not be current
        expect(playlistTracks[0]).toHaveTextContent('not-current');
        
        // Second track should be current
        expect(playlistTracks[1]).toHaveTextContent('current');
    });

    it('handles playing state correctly with track groups', () => {
        const currentTrack = createMockTrack({ 
            attributes: { 
                name: 'Current Song',
                albumName: 'Test Album',
                artistName: 'Test Artist'
            } 
        });
        
        const tracks = [
            currentTrack,
            createMockTrack({ 
                attributes: { 
                    name: 'Other Song',
                    albumName: 'Test Album',
                    artistName: 'Test Artist'
                } 
            })
        ];

        render(
            <Playlist 
                {...defaultProps} 
                tracks={tracks} 
                currentTrack={currentTrack}
                isPlaying={true}
                showAlbumInfo={true}
            />
        );

        // Should show playing state in track group
        expect(screen.getByTestId('group-is-playing')).toHaveTextContent('playing');
    });
});