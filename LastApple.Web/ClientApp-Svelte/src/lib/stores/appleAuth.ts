import { writable } from 'svelte/store';
import { AuthenticationState } from '$lib/services/authentication';

interface AppleAuthStore {
    state: AuthenticationState;
}

function createAppleAuthStore() {
    // Initialize as Loading - will be updated when authentication check runs
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
