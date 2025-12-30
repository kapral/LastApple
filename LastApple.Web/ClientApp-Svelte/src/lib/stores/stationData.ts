import { writable, get } from 'svelte/store';
import type { IStation } from '$lib/api/stationApi';

interface IAddTrackEvent {
    trackId: string;
    position: number;
}

export interface MusicKitMediaItem {
    id: string;
    title?: string;
    artistName?: string;
    albumName?: string;
    artworkURL?: string;
}

export interface MusicKitInstance {
    queue: {
        item: (position: number) => MusicKitMediaItem | null;
        items: { length: number };
    };
    api: {
        music: (path: string, params: { ids: string[] }) => Promise<{ data: { data: MusicKitMediaItem[] } }>;
    };
    storefrontId: string;
}

/**
 * Create a station data store for managing playlist tracks and station interactions.
 * This is the Svelte equivalent of the useStationData hook.
 */
export function createStationDataStore(stationId: string) {
    const tracks = writable<MusicKitMediaItem[]>([]);
    let station: IStation | null = null;
    let requestedItems = 0;

    async function loadStation(): Promise<IStation | null> {
        if (!stationId) return null;
        
        // Placeholder - will call stationApi.getStation in Phase 4
        const { default: stationApi } = await import('$lib/api/stationApi');
        station = await stationApi.getStation(stationId);
        return station;
    }

    async function topUp(
        getCurrentQueuePosition: () => number, 
        queueLength: number
    ): Promise<void> {
        if (!station) return;

        const itemsLeft = queueLength - getCurrentQueuePosition() + requestedItems;
        const itemsToAdd = station.size - itemsLeft;

        if (itemsToAdd > 0) {
            requestedItems += itemsToAdd;
            const { default: stationApi } = await import('$lib/api/stationApi');
            await stationApi.topUp(stationId, station.definition.stationType, itemsToAdd);
        }
    }

    async function addTracks(
        addTrackEvents: IAddTrackEvent[],
        getInstance: () => Promise<MusicKitInstance>,
        appendTracksToQueue: (trackList: MusicKitMediaItem[], setTracks: (updater: (tracks: MusicKitMediaItem[]) => MusicKitMediaItem[]) => void) => Promise<void>,
        play: () => Promise<void>
    ): Promise<void> {
        for (const event of addTrackEvents) {
            const instance = await getInstance();
            const existingItem = instance.queue.item(event.position);

            if (!existingItem) {
                const songs = await instance.api.music(
                    `/v1/catalog/${instance.storefrontId}/songs`, 
                    { ids: [event.trackId] }
                );

                if (songs.data.data.length === 0) {
                    console.warn(`Could not find song with id ${event.trackId}`);
                    return;
                }

                await appendTracksToQueue([songs.data.data[0]], (updater) => {
                    tracks.update(updater);
                });

                if (instance.queue.items.length === 1) {
                    await play();
                }

                return;
            }

            if (requestedItems > 0) {
                requestedItems--;
            }

            if (existingItem.id === event.trackId) {
                return;
            }

            console.warn(`Position ${event.position} already occupied by a different item.`);
        }
    }

    function getPlaylistPagingOffset(getCurrentQueuePosition: () => number): number {
        if (station?.isContinuous) {
            return getCurrentQueuePosition();
        }
        return 0;
    }

    async function removeTracks(
        position: number, 
        count: number, 
        getPlaylistPagingOffset: () => number
    ): Promise<void> {
        if (!station) return;

        const offset = getPlaylistPagingOffset() + position;

        tracks.update(currentTracks => {
            const newTracks = [...currentTracks];
            newTracks.splice(offset, count);
            return newTracks;
        });
        
        const { default: stationApi } = await import('$lib/api/stationApi');
        await stationApi.deleteSongs(station.id, offset, count);
    }

    return {
        tracks,
        setTracks: (newTracks: MusicKitMediaItem[]) => tracks.set(newTracks),
        get station() { return station; },
        loadStation,
        topUp,
        addTracks,
        getPlaylistPagingOffset,
        removeTracks
    };
}
