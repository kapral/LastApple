import { appleStore } from '$lib/stores/apple';
import { AuthenticationState } from '$lib/types/authentication';
import appleAuthService from '$lib/services/AppleAuthService';

export async function loginApple(): Promise<void> {
  appleStore.setAuthenticationState(AuthenticationState.Loading);

  const isAuthenticatedBefore = await appleAuthService.isAuthenticated();

  if (isAuthenticatedBefore) {
    appleStore.setAuthenticationState(AuthenticationState.Authenticated);
    return;
  }

  await appleAuthService.authenticate();
  const isAuthenticatedAfter = await appleAuthService.isAuthenticated();

  const newState = isAuthenticatedAfter
    ? AuthenticationState.Authenticated
    : AuthenticationState.Unauthenticated;

  appleStore.setAuthenticationState(newState);
}

export async function logoutApple(): Promise<void> {
  appleStore.setAuthenticationState(AuthenticationState.Loading);
  
  const isAuthenticated = await appleAuthService.isAuthenticated();

  if (!isAuthenticated) {
    appleStore.setAuthenticationState(AuthenticationState.Unauthenticated);
    return;
  }

  await appleAuthService.logout();
  appleStore.setAuthenticationState(AuthenticationState.Unauthenticated);
}

export async function checkAppleLogin(): Promise<void> {
  appleStore.setAuthenticationState(AuthenticationState.Loading);

  const isAuthenticated = await appleAuthService.isAuthenticated();

  const newState = isAuthenticated
    ? AuthenticationState.Authenticated
    : AuthenticationState.Unauthenticated;

  appleStore.setAuthenticationState(newState);
}
