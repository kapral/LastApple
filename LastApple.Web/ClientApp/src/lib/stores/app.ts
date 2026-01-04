import { writable } from 'svelte/store';

export const latestStationId = writable<string | null>(null);
