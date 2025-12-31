// Last.fm Authentication functions
import { AuthenticationState } from './authentication';
import { lastfmAuthService } from './lastfmAuthService';
import { lastfmAuthStore } from '$lib/stores/lastfmAuth';

export async function logoutLastfm(): Promise<void> {
    lastfmAuthStore.setState(AuthenticationState.Loading);

    const user = await lastfmAuthService.getAuthenticatedUser();

    if (!user) {
        lastfmAuthStore.setUser(undefined);
        lastfmAuthStore.setState(AuthenticationState.Unauthenticated);
        return;
    }

    await lastfmAuthService.logout();
    lastfmAuthStore.setUser(undefined);
    lastfmAuthStore.setState(AuthenticationState.Unauthenticated);
}

export async function loginLastfm(): Promise<void> {
    lastfmAuthStore.setState(AuthenticationState.Loading);

    const userBefore = await lastfmAuthService.getAuthenticatedUser();

    if (userBefore) {
        lastfmAuthStore.setState(AuthenticationState.Authenticated);
        return;
    }

    await lastfmAuthService.authenticate();
    const userAfter = await lastfmAuthService.getAuthenticatedUser();

    const newAuthenticationState = userAfter
        ? AuthenticationState.Authenticated
        : AuthenticationState.Unauthenticated;

    if (userAfter) {
        lastfmAuthStore.setUser(userAfter);
    } else {
        lastfmAuthStore.setUser(undefined);
    }

    lastfmAuthStore.setState(newAuthenticationState);
}

export async function checkLastfmLogin(): Promise<void> {
    lastfmAuthStore.setState(AuthenticationState.Loading);

    const user = await lastfmAuthService.getAuthenticatedUser();

    const newAuthenticationState = user
        ? AuthenticationState.Authenticated
        : AuthenticationState.Unauthenticated;

    if (user) {
        lastfmAuthStore.setUser(user);
    } else {
        lastfmAuthStore.setUser(undefined);
    }

    lastfmAuthStore.setState(newAuthenticationState);
}

export async function handleLastfmCallback(): Promise<boolean> {
    const token = lastfmAuthService.tryGetAuthFromParams();
    
    if (token) {
        await lastfmAuthService.postToken(token);
        await checkLastfmLogin();
        return true;
    }
    
    return false;
}
