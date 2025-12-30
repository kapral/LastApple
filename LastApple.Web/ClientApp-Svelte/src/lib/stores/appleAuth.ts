import { writable } from 'svelte/store';
import { AuthenticationState } from '$lib/services/authentication';

interface AppleAuthStore {
    state: AuthenticationState;
}

function createAppleAuthStore() {
    const { subscribe, set, update } = writable<AppleAuthStore>({
        state: AuthenticationState.Loading
    });

    return {
        subscribe,
        setState: (state: AuthenticationState) => update(s => ({ ...s, state }))
    };
}

export const appleAuthStore = createAppleAuthStore();
