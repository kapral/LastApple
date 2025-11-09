import { appleStore } from '$lib/stores/apple';
import { AuthenticationState } from '$lib/types/authentication';
import { getMusicKitInstance } from '$lib/composables/musicKitPlayer';

export async function authorizeAppleMusic(): Promise<void> {
    try {
        appleStore.setAuthenticationState(AuthenticationState.Loading);
        
        const musicKit = await getMusicKitInstance();
        await musicKit.authorize();
        
        appleStore.setAuthenticationState(AuthenticationState.Authenticated);
    } catch (error) {
        console.error('Apple Music authorization failed:', error);
        appleStore.setAuthenticationState(AuthenticationState.Unauthenticated);
        throw error;
    }
}

export async function checkAppleAuthentication(): Promise<void> {
    try {
        appleStore.setAuthenticationState(AuthenticationState.Loading);
        
        const musicKit = await getMusicKitInstance();
        
        if (musicKit.isAuthorized) {
            appleStore.setAuthenticationState(AuthenticationState.Authenticated);
        } else {
            appleStore.setAuthenticationState(AuthenticationState.Unauthenticated);
        }
    } catch (error) {
        console.error('Check Apple authentication failed:', error);
        appleStore.setAuthenticationState(AuthenticationState.Unauthenticated);
    }
}

export async function unauthorizeAppleMusic(): Promise<void> {
    try {
        const musicKit = await getMusicKitInstance();
        await musicKit.unauthorize();
        
        appleStore.setAuthenticationState(AuthenticationState.Unauthenticated);
    } catch (error) {
        console.error('Apple Music unauthorization failed:', error);
        throw error;
    }
}
