import { writable } from 'svelte/store';
import { AuthenticationState } from '$lib/services/authentication';

interface AppleAuthStore {
    state: AuthenticationState;
}

function createAppleAuthStore() {
    // Initialize as Unauthenticated - will be updated when authentication check runs
    const { subscribe, set, update } = writable<AppleAuthStore>({
        state: AuthenticationState.Unauthenticated
    });

    return {
        subscribe,
        setState: (state: AuthenticationState) => update(s => ({ ...s, state }))
    };
}

export const appleAuthStore = createAppleAuthStore();
