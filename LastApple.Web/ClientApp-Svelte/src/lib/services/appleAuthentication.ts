// Apple Authentication functions
import { AuthenticationState } from './authentication';
import { appleAuthService } from './appleAuthService';
import { appleAuthStore } from '$lib/stores/appleAuth';

export async function logoutApple(): Promise<void> {
    appleAuthStore.setState(AuthenticationState.Loading);
    const isAuthenticated = await appleAuthService.isAuthenticated();

    if (!isAuthenticated) {
        appleAuthStore.setState(AuthenticationState.Unauthenticated);
        return;
    }

    await appleAuthService.logout();
    appleAuthStore.setState(AuthenticationState.Unauthenticated);
}

export async function loginApple(): Promise<void> {
    appleAuthStore.setState(AuthenticationState.Loading);

    const isAuthenticatedBefore = await appleAuthService.isAuthenticated();

    if (isAuthenticatedBefore) {
        appleAuthStore.setState(AuthenticationState.Authenticated);
        return;
    }

    await appleAuthService.authenticate();
    const isAuthenticatedAfter = await appleAuthService.isAuthenticated();

    const newAuthenticationState = isAuthenticatedAfter
        ? AuthenticationState.Authenticated
        : AuthenticationState.Unauthenticated;

    appleAuthStore.setState(newAuthenticationState);
}

export async function checkAppleLogin(): Promise<void> {
    appleAuthStore.setState(AuthenticationState.Loading);

    const isAuthenticated = await appleAuthService.isAuthenticated();

    const newAuthenticationState = isAuthenticated
        ? AuthenticationState.Authenticated
        : AuthenticationState.Unauthenticated;

    appleAuthStore.setState(newAuthenticationState);
}
