// Last.fm authentication check utility
// In Svelte, this is a function that checks Last.fm login status on app startup

import { AuthenticationState } from '../services/authentication';

export interface LastfmAuthState {
    state: AuthenticationState;
    setState: (state: AuthenticationState) => void;
    user?: { name: string; url: string } | undefined;
    setUser?: (user: { name: string; url: string } | undefined) => void;
}

// Last.fm auth service placeholder
export const lastfmAuthService = {
    /**
     * Try to get auth token from URL params (callback from Last.fm auth)
     */
    tryGetAuthFromParams(): string | null {
        // Placeholder - will extract token from URL params in Phase 4
        return null;
    },

    /**
     * Post token to server to establish session
     */
    async postToken(token: string): Promise<void> {
        // Placeholder - will POST to /api/lastfm-auth in Phase 4
    }
};

/**
 * Check Last.fm login status and update authentication state
 */
export async function checkLastfmLogin(authState: LastfmAuthState): Promise<void> {
    // Placeholder - will check Last.fm session status in Phase 4
}

/**
 * Startup Last.fm authentication check - called once on app mount
 * Handles OAuth callback token if present
 */
export async function startupLastfmAuthenticationCheck(authState: LastfmAuthState): Promise<void> {
    authState.setState(AuthenticationState.Loading);
    
    const token = lastfmAuthService.tryGetAuthFromParams();
    
    if (token) {
        await lastfmAuthService.postToken(token);
    }
    
    await checkLastfmLogin(authState);
}
