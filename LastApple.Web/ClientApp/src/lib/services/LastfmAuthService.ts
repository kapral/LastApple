import { lastfmStore } from '$lib/stores/lastfm';
import { AuthenticationState } from '$lib/types/authentication';
import * as LastfmApi from '$lib/services/LastfmApi';

export async function authorizeLastfm(): Promise<void> {
    try {
        lastfmStore.setAuthenticationState(AuthenticationState.Loading);
        
        const authUrl = await LastfmApi.getAuthUrl();
        window.location.href = authUrl;
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
            await LastfmApi.postToken(token);
            
            // Clear token from URL
            window.history.replaceState({}, document.title, window.location.pathname);
        }
        
        // Get user info
        const user = await LastfmApi.getUser();
        
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
        await LastfmApi.logout();
        
        lastfmStore.setUser(undefined);
        lastfmStore.setAuthenticationState(AuthenticationState.Unauthenticated);
    } catch (error) {
        console.error('Last.fm unauthorization failed:', error);
        throw error;
    }
}
