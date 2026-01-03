import { AuthenticationState } from '$lib/models/authenticationState';
import { appleAuthStore } from '$lib/stores/appleAuth';
import musicKitService from './musicKit.ts';
import appleMusicApi from '$lib/api/appleMusicApi';

export async function authorize(): Promise<void> {
    appleAuthStore.setState(AuthenticationState.Loading);

    const isAuthenticatedBefore = await isKitAuthorized();

    if (isAuthenticatedBefore) {
        appleAuthStore.setState(AuthenticationState.Authenticated);
        return;
    }

    await authorizeKit();
    const isAuthenticatedAfter = await isKitAuthorized();

    const newAuthenticationState = isAuthenticatedAfter
        ? AuthenticationState.Authenticated
        : AuthenticationState.Unauthenticated;

    appleAuthStore.setState(newAuthenticationState);
}

export async function unauthorize(): Promise<void> {
    appleAuthStore.setState(AuthenticationState.Loading);
    const isAuthenticated = await isKitAuthorized();

    if (!isAuthenticated) {
        appleAuthStore.setState(AuthenticationState.Unauthenticated);
        return;
    }

    await unauthorizeKit();
    appleAuthStore.setState(AuthenticationState.Unauthenticated);
}

export async function checkAuthorization(): Promise<void> {
    appleAuthStore.setState(AuthenticationState.Loading);

    const isAuthenticated = await isKitAuthorized();

    const newAuthenticationState = isAuthenticated
        ? AuthenticationState.Authenticated
        : AuthenticationState.Unauthenticated;

    appleAuthStore.setState(newAuthenticationState);
}

async function isKitAuthorized(): Promise<boolean> {
    const kit = await musicKitService.getInstance();

    return kit.isAuthorized;
}

async function authorizeKit(): Promise<void> {
    const kit = await musicKitService.getInstance();
    if (!kit) return;

    await kit.authorize();

    const sessionData = await appleMusicApi.postSessionData({
        musicUserToken: kit.musicUserToken,
        musicStorefrontId: kit.storefrontId
    });

    localStorage.setItem('SessionId', sessionData.id);
}

async function unauthorizeKit(): Promise<void> {
    const kit = await musicKitService.getInstance();
    if (!kit) return;

    await kit.unauthorize();

    await appleMusicApi.logout();
}