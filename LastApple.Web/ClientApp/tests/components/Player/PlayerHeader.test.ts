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
        ...overrides.attributes
    },
    ...overrides
} as MusicKit.MediaItem);

describe('PlayerHeader', () => {
    const defaultProps = {
        currentTrack: createMockTrack(),
        isScrobblingEnabled: false,
        onScrobblingSwitch: vi.fn(),
        lastfmAuthenticated: true
    };

    beforeEach(() => {
        vi.clearAllMocks();
    });

    it('renders without crashing', async () => {
        const { default: PlayerHeader } = await import('$lib/components/Player/PlayerHeader.svelte');
        render(PlayerHeader, { props: defaultProps });
    });

    it('displays the current track name', async () => {
        const track = createMockTrack({
            attributes: { name: 'My Favorite Song', artistName: 'Artist', albumName: 'Album' }
        });

        const { default: PlayerHeader } = await import('$lib/components/Player/PlayerHeader.svelte');
        render(PlayerHeader, { props: { ...defaultProps, currentTrack: track } });

        expect(screen.getByText('My Favorite Song')).toBeInTheDocument();
    });

    it('displays artist and album information', async () => {
        const track = createMockTrack({
            attributes: {
                name: 'Song Name',
                artistName: 'The Beatles',
                albumName: 'Abbey Road'
            }
        });

        const { default: PlayerHeader } = await import('$lib/components/Player/PlayerHeader.svelte');
        render(PlayerHeader, { props: { ...defaultProps, currentTrack: track } });

        expect(screen.getByText('The Beatles - Abbey Road')).toBeInTheDocument();
    });

    it('shows Scrobble label', async () => {
        const { default: PlayerHeader } = await import('$lib/components/Player/PlayerHeader.svelte');
        render(PlayerHeader, { props: defaultProps });

        expect(screen.getByText('Scrobble')).toBeInTheDocument();
    });

    it('shows scrobble switch as unchecked when scrobbling is disabled', async () => {
        const { default: PlayerHeader } = await import('$lib/components/Player/PlayerHeader.svelte');
        render(PlayerHeader, { props: { ...defaultProps, isScrobblingEnabled: false } });

        const scrobbleSwitch = screen.getByRole('switch');
        expect(scrobbleSwitch).not.toBeChecked();
    });

    it('shows scrobble switch as checked when scrobbling is enabled', async () => {
        const { default: PlayerHeader } = await import('$lib/components/Player/PlayerHeader.svelte');
        render(PlayerHeader, { props: { ...defaultProps, isScrobblingEnabled: true } });

        const scrobbleSwitch = screen.getByRole('switch');
        expect(scrobbleSwitch).toBeChecked();
    });

    it('enables scrobble switch when lastfm is authenticated', async () => {
        const { default: PlayerHeader } = await import('$lib/components/Player/PlayerHeader.svelte');
        render(PlayerHeader, { props: { ...defaultProps, lastfmAuthenticated: true } });

        const scrobbleSwitch = screen.getByRole('switch');
        expect(scrobbleSwitch).not.toBeDisabled();
    });

    it('disables scrobble switch when lastfm is not authenticated', async () => {
        const { default: PlayerHeader } = await import('$lib/components/Player/PlayerHeader.svelte');
        render(PlayerHeader, { props: { ...defaultProps, lastfmAuthenticated: false } });

        const scrobbleSwitch = screen.getByRole('switch');
        expect(scrobbleSwitch).toBeDisabled();
    });

    it('calls onScrobblingSwitch when switch is toggled', async () => {
        const onScrobblingSwitch = vi.fn();
        const { default: PlayerHeader } = await import('$lib/components/Player/PlayerHeader.svelte');
        render(PlayerHeader, { props: { ...defaultProps, onScrobblingSwitch } });

        const scrobbleSwitch = screen.getByRole('switch');
        await fireEvent.click(scrobbleSwitch);

        expect(onScrobblingSwitch).toHaveBeenCalled();
    });
});
