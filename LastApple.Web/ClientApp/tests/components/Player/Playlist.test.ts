import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen } from '@testing-library/svelte';
import Playlist from '$lib/components/Player/Playlist.svelte';

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
        tracks: [] as MusicKit.MediaItem[],
        offset: 0,
        limit: 10,
        showAlbumInfo: false,
        onRemove: vi.fn(),
        onTrackSwitch: vi.fn()
    };

    beforeEach(() => {
        vi.clearAllMocks();
    });

    it('renders without crashing', () => {
        render(Playlist, { props: defaultProps });
    });

    it('returns null when tracks array is empty', () => {
        const { container } = render(Playlist, { props: { ...defaultProps, tracks: [] } });
        
        expect(container.querySelector('.playlist')).not.toBeInTheDocument();
    });

    it('applies playlist class when showAlbumInfo is false', () => {
        const tracks = [createMockTrack()];
        const { container } = render(Playlist, { 
            props: { ...defaultProps, tracks, showAlbumInfo: false } 
        });
        
        expect(container.querySelector('.playlist')).toBeInTheDocument();
    });

    it('applies playlist class when showAlbumInfo is true', () => {
        const tracks = [createMockTrack()];
        const { container } = render(Playlist, { 
            props: { ...defaultProps, tracks, showAlbumInfo: true } 
        });
        
        expect(container.querySelector('.playlist')).toBeInTheDocument();
    });

    it('renders individual tracks when showAlbumInfo is false', () => {
        const tracks = [
            createMockTrack({ attributes: { name: 'Song 1' } }),
            createMockTrack({ attributes: { name: 'Song 2' } })
        ];
        
        render(Playlist, { 
            props: { ...defaultProps, tracks, showAlbumInfo: false } 
        });
        
        expect(screen.getAllByTestId('playlist-track')).toHaveLength(2);
    });

    it('renders track groups when showAlbumInfo is true', () => {
        const tracks = [createMockTrack()];
        
        render(Playlist, { 
            props: { ...defaultProps, tracks, showAlbumInfo: true } 
        });
        
        expect(screen.getByTestId('playlist-track-group')).toBeInTheDocument();
    });

    it('respects offset and limit', () => {
        const tracks = [
            createMockTrack({ attributes: { name: 'Song 1' } }),
            createMockTrack({ attributes: { name: 'Song 2' } }),
            createMockTrack({ attributes: { name: 'Song 3' } }),
            createMockTrack({ attributes: { name: 'Song 4' } }),
            createMockTrack({ attributes: { name: 'Song 5' } })
        ];
        
        render(Playlist, { 
            props: { ...defaultProps, tracks, offset: 1, limit: 2, showAlbumInfo: false } 
        });
        
        expect(screen.getAllByTestId('playlist-track')).toHaveLength(2);
    });
});
