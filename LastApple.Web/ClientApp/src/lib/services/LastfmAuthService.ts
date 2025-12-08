import { lastfmStore } from '$lib/stores/lastfm';
import { AuthenticationState } from '$lib/types/authentication';
import { lastfmApi } from '$lib/services/LastfmApi';

export async function authorizeLastfm(): Promise<void> {
    try {
        lastfmStore.setAuthenticationState(AuthenticationState.Loading);

        window.location.href = await lastfmApi.getAuthUrl(window.location.href);
    } catch (error) {
        console.error('Last.fm authorization failed:', error);
        lastfmStore.setAuthenticationState(AuthenticationState.Unauthenticated);
        throw error;
    }
}

export async function checkLastfmAuthentication(): Promise<void> {
    try {
        lastfmStore.setAuthenticationState(AuthenticationState.Loading);

        // Check URL for callback token
        const urlParams = new URLSearchParams(window.location.search);
        const token = urlParams.get('token');

        if (token) {
            // Exchange token for session
            const sessionIdResponse = await lastfmApi.postToken(token);
            const sessionId = await sessionIdResponse.json();

            localStorage.setItem('SessionId', sessionId);

            // Clear token from URL
            window.history.replaceState({}, document.title, window.location.pathname);
        }

        // Get user info
        const user = await lastfmApi.getUser();

        if (user) {
            lastfmStore.setUser(user);
            lastfmStore.setAuthenticationState(AuthenticationState.Authenticated);
        } else {
            lastfmStore.setAuthenticationState(AuthenticationState.Unauthenticated);
        }
    } catch (error) {
        console.error('Check Last.fm authentication failed:', error);
        lastfmStore.setAuthenticationState(AuthenticationState.Unauthenticated);
    }
}

export async function unauthorizeLastfm(): Promise<void> {
    try {
        await lastfmApi.logout();

        lastfmStore.setUser(undefined);
        lastfmStore.setAuthenticationState(AuthenticationState.Unauthenticated);
    } catch (error) {
        console.error('Last.fm unauthorization failed:', error);
        throw error;
    }
}
