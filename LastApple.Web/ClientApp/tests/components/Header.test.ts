import { describe, it, expect, beforeEach } from 'vitest';
import { render, screen } from '@testing-library/svelte';
import Header from '$lib/components/Header.svelte';
import { latestStationId } from '$lib/stores/app';

describe('Header', () => {
    beforeEach(() => {
        latestStationId.set(null);
    });

    it('renders the logo image with alt text', () => {
        render(Header);

        const logo = screen.getByAltText('logo');
        expect(logo).toBeInTheDocument();
        expect(logo.tagName).toBe('IMG');
    });

    it('renders the application title "lastream"', () => {
        render(Header);

        const title = screen.getByRole('heading', { name: /lastream/i });
        expect(title).toBeInTheDocument();
    });

    it('renders "New station" navigation link pointing to home', () => {
        render(Header);

        const newStationLink = screen.getByRole('link', { name: /new station/i });
        expect(newStationLink).toBeInTheDocument();
        expect(newStationLink).toHaveAttribute('href', '/');
    });

    it('renders "Settings" navigation link pointing to /settings', () => {
        render(Header);

        const settingsLink = screen.getByRole('link', { name: /settings/i });
        expect(settingsLink).toBeInTheDocument();
        expect(settingsLink).toHaveAttribute('href', '/settings');
    });

    it('does NOT render "Now playing" link when no station is active', () => {
        latestStationId.set(null);
        render(Header);

        const nowPlayingLink = screen.queryByRole('link', { name: /now playing/i });
        expect(nowPlayingLink).not.toBeInTheDocument();
    });

    it('renders "Now playing" link with correct href when a station is active', () => {
        latestStationId.set('test-station-123');
        render(Header);

        const nowPlayingLink = screen.getByRole('link', { name: /now playing/i });
        expect(nowPlayingLink).toBeInTheDocument();
        expect(nowPlayingLink).toHaveAttribute('href', '/station/test-station-123');
    });

    it('renders LastfmAvatar component in the header', () => {
        render(Header);

        // The LastfmAvatar should be present
        const avatar = screen.getByTestId('lastfm-avatar');
        expect(avatar).toBeInTheDocument();
    });
});
