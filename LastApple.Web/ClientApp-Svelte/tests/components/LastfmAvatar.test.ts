import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen } from '@testing-library/svelte';
import { writable } from 'svelte/store';

// Mock the lastfm auth state
const mockLastfmAuthState = writable({
    state: 'authenticated',
    user: {
        name: 'testuser',
        url: 'http://last.fm/user/testuser',
        avatar: ['http://last.fm/avatar.jpg']
    }
});

vi.mock('$lib/stores/lastfmAuthState', () => ({
    lastfmAuthState: mockLastfmAuthState
}));

describe('LastfmAvatar', () => {
    beforeEach(() => {
        vi.clearAllMocks();
        // Reset to authenticated state
        mockLastfmAuthState.set({
            state: 'authenticated',
            user: {
                name: 'testuser',
                url: 'http://last.fm/user/testuser',
                avatar: ['http://last.fm/avatar.jpg']
            }
        });
    });

    it('renders loading spinner when authentication is loading', async () => {
        mockLastfmAuthState.set({ state: 'loading', user: null });

        const { default: LastfmAvatar } = await import('$lib/components/LastfmAvatar.svelte');
        render(LastfmAvatar);

        // Should show spinner during loading
        const spinner = screen.getByRole('status');
        expect(spinner).toBeInTheDocument();
    });

    it('renders user avatar and name when authenticated', async () => {
        mockLastfmAuthState.set({
            state: 'authenticated',
            user: {
                name: 'testuser',
                url: 'http://last.fm/user/testuser',
                avatar: ['http://last.fm/avatar.jpg']
            }
        });

        const { default: LastfmAvatar } = await import('$lib/components/LastfmAvatar.svelte');
        const { container } = render(LastfmAvatar);

        expect(screen.getByText('testuser')).toBeInTheDocument();

        const avatar = container.querySelector('img');
        expect(avatar).toHaveAttribute('src', 'http://last.fm/avatar.jpg');
        expect(avatar).toHaveStyle('border-radius: 20px');
    });

    it('renders lastfm logo and "Log in" text when not authenticated', async () => {
        mockLastfmAuthState.set({ state: 'unauthenticated', user: null });

        const { default: LastfmAvatar } = await import('$lib/components/LastfmAvatar.svelte');
        const { container } = render(LastfmAvatar);

        expect(screen.getByText('Log in')).toBeInTheDocument();

        const avatar = container.querySelector('img');
        expect(avatar).toHaveAttribute('src', expect.stringContaining('lastfm'));
    });

    it('links to user profile when authenticated', async () => {
        mockLastfmAuthState.set({
            state: 'authenticated',
            user: {
                name: 'testuser',
                url: 'http://last.fm/user/testuser',
                avatar: ['http://last.fm/avatar.jpg']
            }
        });

        const { default: LastfmAvatar } = await import('$lib/components/LastfmAvatar.svelte');
        render(LastfmAvatar);

        const link = screen.getByRole('link');
        expect(link).toHaveAttribute('href', 'http://last.fm/user/testuser');
        expect(link).toHaveAttribute('target', '_blank');
    });

    it('links to settings when not authenticated', async () => {
        mockLastfmAuthState.set({ state: 'unauthenticated', user: null });

        const { default: LastfmAvatar } = await import('$lib/components/LastfmAvatar.svelte');
        render(LastfmAvatar);

        const link = screen.getByRole('link');
        expect(link).toHaveAttribute('href', '/settings');
    });
});
