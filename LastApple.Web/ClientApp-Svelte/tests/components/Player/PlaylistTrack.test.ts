import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/svelte';
import PlaylistTrack from '$lib/components/Player/PlaylistTrack.svelte';

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
        onRemove: vi.fn(),
        onTrackSwitch: vi.fn(),
        addAlbumToLibrary: vi.fn(),
        addToLibrary: vi.fn()
    };

    beforeEach(() => {
        vi.clearAllMocks();
    });

    it('renders without crashing', () => {
        render(PlaylistTrack, { props: defaultProps });
    });

    it('displays track name', () => {
        render(PlaylistTrack, { props: defaultProps });

        expect(screen.getByTestId('track-name')).toHaveTextContent('Test Song');
    });

    it('displays artist name', () => {
        render(PlaylistTrack, { props: defaultProps });

        expect(screen.getByTestId('artist-name')).toHaveTextContent('Test Artist');
    });

    it('applies current class when isCurrent is true', () => {
        const { container } = render(PlaylistTrack, { 
            props: { ...defaultProps, isCurrent: true } 
        });

        expect(container.querySelector('.current')).toBeInTheDocument();
    });

    it('does not apply current class when isCurrent is false', () => {
        const { container } = render(PlaylistTrack, { 
            props: { ...defaultProps, isCurrent: false } 
        });

        expect(container.querySelector('.current')).not.toBeInTheDocument();
    });

    it('renders dropdown menu', () => {
        render(PlaylistTrack, { props: defaultProps });

        expect(screen.getByTestId('dropdown')).toBeInTheDocument();
        expect(screen.getByTestId('dropdown-menu')).toBeInTheDocument();
    });

    it('calls onTrackSwitch on double click', async () => {
        const { container } = render(PlaylistTrack, { props: defaultProps });

        const trackElement = container.querySelector('.playlist-item');
        await fireEvent.dblClick(trackElement!);

        expect(defaultProps.onTrackSwitch).toHaveBeenCalledWith(0);
    });
});
