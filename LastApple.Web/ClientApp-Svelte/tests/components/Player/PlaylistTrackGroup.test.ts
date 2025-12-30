import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/svelte';

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
            createMockTrack({ id: 'track-1', attributes: { name: 'Song 1', artistName: 'Artist 1', albumName: 'Album 1' } }),
            createMockTrack({ id: 'track-2', attributes: { name: 'Song 2', artistName: 'Artist 2', albumName: 'Album 2' } })
        ],
        isPlaying: false,
        index: 0,
        onRemove: vi.fn(),
        addAlbumToLibrary: vi.fn()
    };

    beforeEach(() => {
        vi.clearAllMocks();
    });

    it('renders without crashing', async () => {
        const { default: PlaylistTrackGroup } = await import('$lib/components/Player/PlaylistTrackGroup.svelte');
        render(PlaylistTrackGroup, { props: defaultProps });
    });

    it('displays album artwork from first track', async () => {
        const tracks = [createMockTrack({
            attributes: {
                name: 'Song',
                artistName: 'Artist',
                albumName: 'Album',
                artwork: {
                    url: 'https://example.com/album-art/{w}x{h}.jpg',
                    width: 300,
                    height: 300
                }
            }
        })];

        const { default: PlaylistTrackGroup } = await import('$lib/components/Player/PlaylistTrackGroup.svelte');
        render(PlaylistTrackGroup, { props: { ...defaultProps, tracks } });

        const albumArt = screen.getByAltText('album logo');
        expect(albumArt).toHaveAttribute('src', 'https://example.com/album-art/60x60.jpg');
    });

    it('applies correct styling to album artwork', async () => {
        const { default: PlaylistTrackGroup } = await import('$lib/components/Player/PlaylistTrackGroup.svelte');
        render(PlaylistTrackGroup, { props: defaultProps });

        const albumArt = screen.getByAltText('album logo');
        expect(albumArt).toHaveStyle({
            height: '60px',
            width: '60px'
        });
    });

    it('renders dropdown menu', async () => {
        const { default: PlaylistTrackGroup } = await import('$lib/components/Player/PlaylistTrackGroup.svelte');
        render(PlaylistTrackGroup, { props: defaultProps });

        expect(screen.getByTestId('dropdown-toggle')).toBeInTheDocument();
        expect(screen.getByTestId('dropdown-menu')).toBeInTheDocument();
    });

    it('renders add album to library option', async () => {
        const { default: PlaylistTrackGroup } = await import('$lib/components/Player/PlaylistTrackGroup.svelte');
        render(PlaylistTrackGroup, { props: defaultProps });

        const addAlbumItem = screen.getByText(/Add.*AppleMusic Library/i);
        expect(addAlbumItem).toBeInTheDocument();
    });

    it('calls addAlbumToLibrary when add album option is clicked', async () => {
        const mockAddAlbumToLibrary = vi.fn();
        const testTracks = [createMockTrack({ id: 'album-track-1' })];

        const { default: PlaylistTrackGroup } = await import('$lib/components/Player/PlaylistTrackGroup.svelte');
        render(PlaylistTrackGroup, { props: { ...defaultProps, addAlbumToLibrary: mockAddAlbumToLibrary, tracks: testTracks } });

        const addAlbumItem = screen.getByText(/Add.*AppleMusic Library/i);
        await fireEvent.click(addAlbumItem);

        expect(mockAddAlbumToLibrary).toHaveBeenCalled();
    });

    it('renders remove option', async () => {
        const { default: PlaylistTrackGroup } = await import('$lib/components/Player/PlaylistTrackGroup.svelte');
        render(PlaylistTrackGroup, { props: defaultProps });

        const removeItem = screen.getByText(/Remove/i);
        expect(removeItem).toBeInTheDocument();
    });

    it('calls onRemove when remove option is clicked', async () => {
        const mockOnRemove = vi.fn();

        const { default: PlaylistTrackGroup } = await import('$lib/components/Player/PlaylistTrackGroup.svelte');
        render(PlaylistTrackGroup, { props: { ...defaultProps, onRemove: mockOnRemove } });

        const removeItem = screen.getByText(/Remove/i);
        await fireEvent.click(removeItem);

        expect(mockOnRemove).toHaveBeenCalled();
    });

    it('displays track count', async () => {
        const tracks = [
            createMockTrack({ id: 'track-1' }),
            createMockTrack({ id: 'track-2' }),
            createMockTrack({ id: 'track-3' })
        ];

        const { default: PlaylistTrackGroup } = await import('$lib/components/Player/PlaylistTrackGroup.svelte');
        const { container } = render(PlaylistTrackGroup, { props: { ...defaultProps, tracks } });

        // Should display the number of tracks in the group
        expect(container.textContent).toContain('3');
    });
});
