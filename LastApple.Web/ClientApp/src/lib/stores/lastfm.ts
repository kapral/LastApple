import { writable } from 'svelte/store';
import { AuthenticationState } from '../types/authentication';
import type { ILastfmUser } from '../types/lastfm';

interface LastfmState {
    authenticationState: AuthenticationState;
    user: ILastfmUser | undefined;
    isScrobblingEnabled: boolean;
}

function createLastfmStore() {
    const { subscribe, set, update } = writable<LastfmState>({
        authenticationState: AuthenticationState.Loading,
        user: undefined,
        isScrobblingEnabled: true
    });

    return {
        subscribe,
        setAuthenticationState: (state: AuthenticationState) => {
            update(current => ({ ...current, authenticationState: state }));
        },
        setUser: (user: ILastfmUser | undefined) => {
            update(current => ({ ...current, user }));
        },
        setIsScrobblingEnabled: (enabled: boolean) => {
            update(current => ({ ...current, isScrobblingEnabled: enabled }));
        },
        reset: () => {
            set({
                authenticationState: AuthenticationState.Loading,
                user: undefined,
                isScrobblingEnabled: true
            });
        }
    };
}

export const lastfmStore = createLastfmStore();
