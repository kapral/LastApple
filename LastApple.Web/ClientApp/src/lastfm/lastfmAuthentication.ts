import { ILastfmUser } from '../restClients/LastfmApi';
import { AuthenticationState } from '../authentication';
import lastfmAuthService from './LastfmAuthService';

export interface ILastfmAuthenticationState {
    readonly user: ILastfmUser | undefined;
    readonly setUser: (value: ILastfmUser | undefined) => void;
    readonly state: AuthenticationState;
    readonly setState: (value: AuthenticationState) => void;
}

export async function logoutLastfm(authenticationState: ILastfmAuthenticationState): Promise<void> {
    authenticationState.setState(AuthenticationState.Loading);

    const user = await lastfmAuthService.getAuthenticatedUser();

    if (!user) {
        authenticationState.setUser(undefined);
        authenticationState.setState(AuthenticationState.Unauthenticated);
        return;
    }

    await lastfmAuthService.logout();
    authenticationState.setUser(undefined);
    authenticationState.setState(AuthenticationState.Unauthenticated);
}

export async function loginLastfm(authenticationState: ILastfmAuthenticationState): Promise<void> {
    authenticationState.setState(AuthenticationState.Loading);

    const userBefore = await lastfmAuthService.getAuthenticatedUser();

    if (!!userBefore) {
        authenticationState.setState(AuthenticationState.Authenticated);
        return;
    }

    await lastfmAuthService.authenticate();
    const userAfter = await lastfmAuthService.getAuthenticatedUser();

    const newAuthenticationState = !!userAfter
        ? AuthenticationState.Authenticated
        : AuthenticationState.Unauthenticated;

    if (!!userAfter) {
        authenticationState.setUser(userAfter);
    } else {
        authenticationState.setUser(undefined);
    }

    authenticationState.setState(newAuthenticationState);
}

export async function checkLastfmLogin(authenticationState: ILastfmAuthenticationState): Promise<void> {
    authenticationState.setState(AuthenticationState.Loading);

    const user = await lastfmAuthService.getAuthenticatedUser();

    const newAuthenticationState = !!user
        ? AuthenticationState.Authenticated
        : AuthenticationState.Unauthenticated;

    if (!!user) {
        authenticationState.setUser(user);
    } else {
        authenticationState.setUser(undefined);
    }

    authenticationState.setState(newAuthenticationState);
}