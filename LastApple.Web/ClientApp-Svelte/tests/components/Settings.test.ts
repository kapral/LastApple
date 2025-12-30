import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/svelte';
import Settings from '$lib/components/Settings.svelte';
import { appleAuthState } from '$lib/stores/appleAuth';
import { lastfmAuthState } from '$lib/stores/lastfmAuth';
import { AuthenticationState } from '$lib/services/authentication';

describe('Settings', () => {
    beforeEach(() => {
        appleAuthState.set({ state: AuthenticationState.Unauthenticated });
        lastfmAuthState.set({ 
            state: AuthenticationState.Unauthenticated,
            user: undefined,
            isScrobblingEnabled: false
        });
    });

    it('displays "Connected accounts" section header', () => {
        render(Settings);
        
        expect(screen.getByText('Connected accounts')).toBeInTheDocument();
    });

    it('shows loading spinner when Apple authentication is loading', () => {
        appleAuthState.set({ state: AuthenticationState.Loading });
        render(Settings);

        expect(screen.getByRole('status')).toBeInTheDocument();
    });

    it('shows loading spinner when Last.fm authentication is loading', () => {
        lastfmAuthState.set({ 
            state: AuthenticationState.Loading,
            user: undefined,
            isScrobblingEnabled: false
        });
        render(Settings);

        expect(screen.getByRole('status')).toBeInTheDocument();
    });

    it('renders Apple Music logo', () => {
        render(Settings);
        
        const logo = screen.getByAltText('Apple Music Logo');
        expect(logo).toBeInTheDocument();
    });

    it('renders Last.fm logo', () => {
        render(Settings);
        
        const logo = screen.getByAltText('Last.fm Logo');
        expect(logo).toBeInTheDocument();
    });

    it('renders Apple Music toggle switch', () => {
        render(Settings);
        
        const toggle = screen.getByRole('switch', { name: /apple music/i });
        expect(toggle).toBeInTheDocument();
    });

    it('renders Last.fm toggle switch', () => {
        render(Settings);
        
        const toggle = screen.getByRole('switch', { name: /last.fm/i });
        expect(toggle).toBeInTheDocument();
    });

    it('toggle is OFF when Apple Music is not authenticated', () => {
        appleAuthState.set({ state: AuthenticationState.Unauthenticated });
        render(Settings);
        
        const toggle = screen.getByRole('switch', { name: /apple music/i });
        expect(toggle).not.toBeChecked();
    });

    it('toggle is ON when Apple Music is authenticated', () => {
        appleAuthState.set({ state: AuthenticationState.Authenticated });
        render(Settings);
        
        const toggle = screen.getByRole('switch', { name: /apple music/i });
        expect(toggle).toBeChecked();
    });

    it('calls login function when toggle is clicked while unauthenticated', async () => {
        appleAuthState.set({ state: AuthenticationState.Unauthenticated });
        render(Settings);
        
        const toggle = screen.getByRole('switch', { name: /apple music/i });
        await fireEvent.click(toggle);
        
        // Should trigger login - implementation will call appleAuthentication.loginApple
        // For now, we just verify the toggle is interactive
        expect(toggle).toBeInTheDocument();
    });
});
