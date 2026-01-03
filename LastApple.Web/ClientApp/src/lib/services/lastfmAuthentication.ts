// Last.fm Authentication functions
import { AuthenticationState } from '$lib/models/authenticationState';
import { lastfmAuthStore } from '$lib/stores/lastfmAuth';
import lastfmApi from "$lib/api/lastfmApi";

export async function logout(): Promise<void> {
    lastfmAuthStore.setState(AuthenticationState.Loading);

    const user = await lastfmApi.getUser();

    if (!user) {
        lastfmAuthStore.setUser(undefined);
        lastfmAuthStore.setState(AuthenticationState.Unauthenticated);
        return;
    }

    await logoutFromApi();
    lastfmAuthStore.setUser(undefined);
    lastfmAuthStore.setState(AuthenticationState.Unauthenticated);
}

export async function login(): Promise<void> {
    lastfmAuthStore.setState(AuthenticationState.Loading);

    const userBefore = await lastfmApi.getUser();

    if (userBefore) {
        lastfmAuthStore.setState(AuthenticationState.Authenticated);
        return;
    }

    await redirectToAuthPage();
    const userAfter = await lastfmApi.getUser();

    const newAuthenticationState = userAfter
        ? AuthenticationState.Authenticated
        : AuthenticationState.Unauthenticated;

    lastfmAuthStore.setUser(userAfter);

    lastfmAuthStore.setState(newAuthenticationState);
}

export async function checkAuthentication(): Promise<void> {
    lastfmAuthStore.setState(AuthenticationState.Loading);

    const user = await lastfmApi.getUser();

    const newAuthenticationState = user
        ? AuthenticationState.Authenticated
        : AuthenticationState.Unauthenticated;

    lastfmAuthStore.setUser(user);

    lastfmAuthStore.setState(newAuthenticationState);
}

export async function handleCallback(): Promise<boolean> {
    const token = tryGetAuthFromParams();

    if (token) {
        await postToken(token);
        await checkAuthentication();
        return true;
    }

    return false;
}

async function redirectToAuthPage(): Promise<void> {
    window.location.href = await lastfmApi.getAuthUrl(window.location.href);
}

function tryGetAuthFromParams(): string | null {
    const url = new URL(window.location.href);
    return url.searchParams.get('token');
}

async function postToken(token: string): Promise<void> {
    const sessionId = await lastfmApi.postToken(token);

    localStorage.setItem('SessionId', sessionId);

    window.history.replaceState({}, document.title, `/${window.location.hash}`);
}

async function logoutFromApi(): Promise<void> {
    await lastfmApi.logout();
}
