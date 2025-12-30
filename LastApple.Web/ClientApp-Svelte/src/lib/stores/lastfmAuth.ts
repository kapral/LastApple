import { writable } from 'svelte/store';
import { AuthenticationState } from '$lib/services/authentication';

export interface ILastfmUser {
    id: string;
    name: string;
    url: string;
    avatar: { size: string; url: string }[];
}

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
        setState: (state: AuthenticationState) => update(s => ({ ...s, state })),
        setUser: (user: ILastfmUser | undefined) => update(s => ({ ...s, user })),
        setIsScrobblingEnabled: (enabled: boolean) => update(s => ({ ...s, isScrobblingEnabled: enabled }))
    };
}

export const lastfmAuthStore = createLastfmAuthStore();
