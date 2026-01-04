import { writable } from 'svelte/store';
import { AuthenticationState } from '$lib/models/authenticationState';

interface AppleAuthStore {
    state: AuthenticationState;
}

function createAppleAuthStore() {
    const { subscribe, set, update } = writable<AppleAuthStore>({
        state: AuthenticationState.Loading
    });

    return {
        subscribe,
        set,
        setState: (state: AuthenticationState) => update(s => ({ ...s, state }))
    };
}

export const appleAuthStore = createAppleAuthStore();
export const appleAuthState = appleAuthStore;
