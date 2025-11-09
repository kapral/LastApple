import { writable, type Writable } from 'svelte/store';
import * as StationApi from '$lib/services/StationApi';
import type { StationConnection } from './stationConnection';

export interface IStation {
    id: string;
    name: string;
    description: string;
    tracks: ITrack[];
    isComplete: boolean;
}

export interface ITrack {
    id: string;
    title: string;
    artistName: string;
    albumName: string;
    artworkUrl?: string;
    previewUrl?: string;
    playbackDuration: number;
}

export async function loadStationData(stationId: string): Promise<Writable<IStation | null>> {
    const store = writable<IStation | null>(null);
    
    try {
        const station = await StationApi.getStation(stationId);
        store.set(station);
    } catch (error) {
        console.error('Failed to load station data:', error);
        store.set(null);
    }
    
    return store;
}

export function getStationUpdates(
    stationConnection: StationConnection,
    stationStore: Writable<IStation | null>
): void {
    // Listen for new tracks
    stationConnection.onTrackAdded((track: ITrack) => {
        stationStore.update(station => {
            if (!station) return station;
            
            return {
                ...station,
                tracks: [...station.tracks, track]
            };
        });
    });
    
    // Listen for station completion
    stationConnection.onStationComplete(() => {
        stationStore.update(station => {
            if (!station) return station;
            
            return {
                ...station,
                isComplete: true
            };
        });
    });
}
