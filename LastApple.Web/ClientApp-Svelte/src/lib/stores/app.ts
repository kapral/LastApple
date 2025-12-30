import { writable } from 'svelte/store';

interface AppStore {
    latestStationId: string | undefined;
}

function createAppStore() {
    const { subscribe, set, update } = writable<AppStore>({
        latestStationId: undefined
    });

    return {
        subscribe,
        setLatestStationId: (id: string | undefined) => update(s => ({ ...s, latestStationId: id }))
    };
}

export const appStore = createAppStore();
