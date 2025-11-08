import { writable } from 'svelte/store';

interface AppState {
    latestStationId: string | undefined;
}

function createAppStore() {
    const { subscribe, set, update } = writable<AppState>({
        latestStationId: undefined
    });

    return {
        subscribe,
        setLatestStationId: (id: string | undefined) => {
            update(state => ({ ...state, latestStationId: id }));
        },
        reset: () => {
            set({ latestStationId: undefined });
        }
    };
}

export const appStore = createAppStore();
