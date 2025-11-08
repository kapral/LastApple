import { lastfmStore } from '$lib/stores/lastfm';
import { AuthenticationState } from '$lib/types/authentication';
import lastfmAuthService from '$lib/services/LastfmAuthService';

export async function loginLastfm(): Promise<void> {
  lastfmStore.setAuthenticationState(AuthenticationState.Loading);

  const userBefore = await lastfmAuthService.getAuthenticatedUser();

  if (userBefore) {
    lastfmStore.setAuthenticationState(AuthenticationState.Authenticated);
    return;
  }

  await lastfmAuthService.authenticate();
  const userAfter = await lastfmAuthService.getAuthenticatedUser();

  const newState = userAfter
    ? AuthenticationState.Authenticated
    : AuthenticationState.Unauthenticated;

  if (userAfter) {
    lastfmStore.setUser(userAfter);
  } else {
    lastfmStore.setUser(undefined);
  }

  lastfmStore.setAuthenticationState(newState);
}

export async function logoutLastfm(): Promise<void> {
  lastfmStore.setAuthenticationState(AuthenticationState.Loading);

  const user = await lastfmAuthService.getAuthenticatedUser();

  if (!user) {
    lastfmStore.setUser(undefined);
    lastfmStore.setAuthenticationState(AuthenticationState.Unauthenticated);
    return;
  }

  await lastfmAuthService.logout();
  lastfmStore.setUser(undefined);
  lastfmStore.setAuthenticationState(AuthenticationState.Unauthenticated);
}

export async function checkLastfmLogin(): Promise<void> {
  lastfmStore.setAuthenticationState(AuthenticationState.Loading);

  const user = await lastfmAuthService.getAuthenticatedUser();

  const newState = user
    ? AuthenticationState.Authenticated
    : AuthenticationState.Unauthenticated;

  if (user) {
    lastfmStore.setUser(user);
  } else {
    lastfmStore.setUser(undefined);
  }

  lastfmStore.setAuthenticationState(newState);
}
