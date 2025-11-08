import { writable } from 'svelte/store';
import { AuthenticationState } from '../types/authentication';

interface AppleState {
    authenticationState: AuthenticationState;
}

function createAppleStore() {
    const { subscribe, set, update } = writable<AppleState>({
        authenticationState: AuthenticationState.Loading
    });

    return {
        subscribe,
        setAuthenticationState: (state: AuthenticationState) => {
            update(current => ({ ...current, authenticationState: state }));
        },
        reset: () => {
            set({ authenticationState: AuthenticationState.Loading });
        }
    };
}

export const appleStore = createAppleStore();
