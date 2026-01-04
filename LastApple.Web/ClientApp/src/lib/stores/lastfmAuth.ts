import { writable } from 'svelte/store';
import type { ILastfmUser } from "$lib/models/lastfmUser";
import { AuthenticationState } from "$lib/models/authenticationState";

interface LastfmAuthStore {
    state: AuthenticationState;
    user: ILastfmUser | undefined;
    isScrobblingEnabled: boolean;
}

function createLastfmAuthStore() {
    const { subscribe, set, update } = writable<LastfmAuthStore>({
        state: AuthenticationState.Loading,
        user: undefined,
        isScrobblingEnabled: true
    });

    return {
        subscribe,
        set,
        setState: (state: AuthenticationState) => update(s => ({ ...s, state })),
        setUser: (user: ILastfmUser | undefined) => update(s => ({ ...s, user })),
        setIsScrobblingEnabled: (enabled: boolean) => update(s => ({ ...s, isScrobblingEnabled: enabled }))
    };
}

export const lastfmAuthStore = createLastfmAuthStore();
export const lastfmAuthState = lastfmAuthStore;
