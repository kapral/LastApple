import { AuthenticationState } from '../authentication';
import appleAuthService from './AppleAuthService';

export interface IAppleAuthenticationState {
    readonly state: AuthenticationState;
    readonly setState: (value: AuthenticationState) => void;
}

export async function logoutApple(authenticationState: IAppleAuthenticationState): Promise<void> {
    authenticationState.setState(AuthenticationState.Loading);
    const isAuthenticated = await appleAuthService.isAuthenticated();

    if (!isAuthenticated) {
        authenticationState.setState(AuthenticationState.Unauthenticated);
        return;
    }

    await appleAuthService.logout();
    authenticationState.setState(AuthenticationState.Unauthenticated);
}

export async function loginApple(authenticationState: IAppleAuthenticationState) {
    authenticationState.setState(AuthenticationState.Loading);

    const isAuthenticatedBefore = await appleAuthService.isAuthenticated();

    if (isAuthenticatedBefore) {
        authenticationState.setState(AuthenticationState.Authenticated);
        return;
    }

    await appleAuthService.authenticate();
    const isAuthenticatedAfter = await appleAuthService.isAuthenticated();

    const newAuthenticationState = isAuthenticatedAfter
        ? AuthenticationState.Authenticated
        : AuthenticationState.Unauthenticated;

    authenticationState.setState(newAuthenticationState);
}

export async function checkAppleLogin(authenticationState: IAppleAuthenticationState) {
    authenticationState.setState(AuthenticationState.Loading);

    const isAuthenticated = await appleAuthService.isAuthenticated();

    const newAuthenticationState = isAuthenticated
        ? AuthenticationState.Authenticated
        : AuthenticationState.Unauthenticated;

    authenticationState.setState(newAuthenticationState);
}