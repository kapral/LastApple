import { useState, useCallback, useRef } from 'react';
import stationApi, { IStation } from '../restClients/StationApi';

interface IAddTrackEvent {
    trackId: string;
    position: number;
}

export const useStationData = (stationId: string) => {
    const [tracks, setTracks] = useState<MusicKit.MediaItem[]>([]);
    const stationRef = useRef<IStation | null>(null);
    const requestedItemsRef = useRef(0);

    const loadStation = useCallback(async () => {
        if (!stationId) return null;
        
        stationRef.current = await stationApi.getStation(stationId);
        return stationRef.current;
    }, [stationId]);

    const topUp = useCallback(async (getCurrentQueuePosition: () => number, queueLength: number) => {
        if (!stationRef.current) return;

        const itemsLeft = queueLength - getCurrentQueuePosition() + requestedItemsRef.current;
        const itemsToAdd = stationRef.current.size - itemsLeft;

        if (itemsToAdd > 0) {
            requestedItemsRef.current += itemsToAdd;
            await stationApi.topUp(stationId, stationRef.current.definition.stationType, itemsToAdd);
        }
    }, [stationId]);

    const addTracks = useCallback(async (
        addTrackEvents: IAddTrackEvent[],
        getInstance: () => Promise<MusicKit.MusicKitInstance>,
        appendTracksToQueue: (trackList: MusicKit.Songs[], setTracks: React.Dispatch<React.SetStateAction<MusicKit.MediaItem[]>>) => Promise<void>,
        play: () => Promise<void>
    ) => {
        for (let event of addTrackEvents) {
            const instance = await getInstance();
            let existingItem = instance.queue.item(event.position);

            if (!existingItem) {
                let songs = await instance.api.music(`/v1/catalog/${instance.storefrontId}/songs`, { ids: [event.trackId] });

                if (songs.data.data.length === 0) {
                    console.warn(`Could not find song with id ${event.trackId}`);
                    return;
                }

                await appendTracksToQueue([songs.data.data[0]], setTracks);

                if (instance.queue.items.length === 1) {
                    await play();
                }

                return;
            }

            if (requestedItemsRef.current > 0) {
                requestedItemsRef.current--;
            }

            if (existingItem.id === event.trackId) {
                return;
            }

            console.warn(`Position ${event.position} already occupied by a different item.`);
        }
    }, []);

    const getPlaylistPagingOffset = useCallback((getCurrentQueuePosition: () => number): number => {
        if (stationRef.current?.isContinuous) {
            return getCurrentQueuePosition();
        }
        return 0;
    }, []);

    const removeTracks = useCallback(async (position: number, count: number, getPlaylistPagingOffset: () => number) => {
        if (!stationRef.current) return;

        const offset = getPlaylistPagingOffset() + position;

        setTracks(currentTracks => {
            const newTracks = [...currentTracks];
            newTracks.splice(offset, count);
            return newTracks;
        });
        
        // Perform async operations after state update
        await stationApi.deleteSongs(stationRef.current.id, offset, count);
    }, []);

    return {
        tracks,
        setTracks,
        station: stationRef.current,
        loadStation,
        topUp,
        addTracks,
        getPlaylistPagingOffset,
        removeTracks
    };
};