import { writable } from 'svelte/store';
import { AuthenticationState } from '$lib/services/authentication';

export interface ILastfmUser {
    readonly name: string;
    readonly url: string;
    readonly avatar: Array<string>;
}

interface LastfmAuthStore {
    state: AuthenticationState;
    user: ILastfmUser | undefined;
    isScrobblingEnabled: boolean;
}

function createLastfmAuthStore() {
    // Initialize as Loading - will be updated when authentication check runs
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
