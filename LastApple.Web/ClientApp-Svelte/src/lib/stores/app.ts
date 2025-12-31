import { writable } from 'svelte/store';

// Simple store for latest station ID - used by Header for "Now playing" link
export const latestStationId = writable<string | null>(null);
