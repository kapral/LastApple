import { useState, useCallback, useEffect, useRef } from 'react';
import stationApi, { IStation } from '../restClients/StationApi';
import { useLastfmScrobbling } from './useLastfmScrobbling';
import { instance as mediaSessionManager } from '../MediaSessionManager';
import { PlaybackStates } from '../musicKitEnums';
import musicKit from '../musicKit';
import * as signalR from '@aspnet/signalr';
import { HubConnection } from '@aspnet/signalr';
import environment from '../Environment';

interface IAddTrackEvent {
    trackId: string;
    position: number;
}

interface UseStationPlayerProps {
    stationId: string;
}

export const useStationPlayer = ({ stationId }: UseStationPlayerProps) => {
    const [currentTrack, setCurrentTrack] = useState<MusicKit.MediaItem | undefined>();
    const [tracks, setTracks] = useState<MusicKit.MediaItem[]>([]);
    const [suppressEvents, setSuppressEvents] = useState(false);
    const [isPlaying, setIsPlaying] = useState(false);
    const [isLoading, setIsLoading] = useState(true);
    const [playlistOffset, setPlaylistOffset] = useState(0);

    const musicKitInstanceRef = useRef<MusicKit.MusicKitInstance | null>(null);
    const stationRef = useRef<IStation | null>(null);
    const requestedItemsRef = useRef(0);
    const currentTrackScrobbledRef = useRef(false);
    const hubConnectionRef = useRef<HubConnection | null>(null);
    const pendingEventsRef = useRef<IAddTrackEvent[]>([]);
    const playbackStateSubscriptionRef = useRef<((x: MusicKit.Events['playbackStateDidChange']) => Promise<void>) | null>(null);

    const { scrobble, setNowPlaying, isScrobblingEnabled, handleScrobblingSwitch, lastfmAuthenticated } = useLastfmScrobbling();

    const getCurrentQueuePosition = useCallback((): number => {
        if (!musicKitInstanceRef.current) return 0;
        const queuePosition = musicKitInstanceRef.current.queue.position;
        return queuePosition !== -1 ? queuePosition : 0;
    }, []);

    const updatePlaylistOffset = useCallback(() => {
        if (stationRef.current?.isContinuous) {
            setPlaylistOffset(getCurrentQueuePosition());
        } else {
            setPlaylistOffset(0);
        }
    }, [getCurrentQueuePosition]);

    const handleStateChange = useCallback(async (event: MusicKit.Events['playbackStateDidChange']) => {
        if (!event || suppressEvents) {
            return;
        }

        const playing = event.state as unknown as PlaybackStates === PlaybackStates.playing;
        if (isPlaying !== playing) {
            setIsPlaying(playing);
        }
    }, [suppressEvents, isPlaying]);

    const topUp = useCallback(async () => {
        if (!stationRef.current || !musicKitInstanceRef.current) return;

        const itemsLeft = musicKitInstanceRef.current.queue.items.length - getCurrentQueuePosition() + requestedItemsRef.current;
        const itemsToAdd = stationRef.current.size - itemsLeft;

        if (itemsToAdd > 0) {
            requestedItemsRef.current += itemsToAdd;
            await stationApi.topUp(stationId, stationRef.current.definition.stationType, itemsToAdd);
        }
    }, [stationId, getCurrentQueuePosition]);

    const handleNowPlayingItemChange = useCallback(async (event: MusicKit.Events['nowPlayingItemDidChange']) => {
        if (!event.item) {
            return;
        }

        document.title = `${event.item.title} - ${event.item.artistName}`;
        currentTrackScrobbledRef.current = false;

        setCurrentTrack(event.item);

        if (isScrobblingEnabled) {
            await setNowPlaying(event.item);
        }

        if (stationRef.current?.isContinuous) {
            await topUp();
        }

        mediaSessionManager.updateSessionMetadata(event.item.artworkURL);
        updatePlaylistOffset();
    }, [isScrobblingEnabled, setNowPlaying, topUp, updatePlaylistOffset]);

    const handlePlaybackProgressChange = useCallback(async (event: MusicKit.Events['playbackProgressDidChange']) => {
        if (currentTrackScrobbledRef.current || event.progress < 0.9) {
            return;
        }

        if (currentTrack && isScrobblingEnabled) {
            await scrobble(currentTrack);
            currentTrackScrobbledRef.current = true;
        }
    }, [currentTrack, isScrobblingEnabled, scrobble]);

    const switchNext = useCallback(async () => {
        if (!musicKitInstanceRef.current) return;
        
        if (musicKitInstanceRef.current.isPlaying) {
            musicKitInstanceRef.current.pause();
        }
        await musicKitInstanceRef.current.skipToNextItem();
    }, []);

    const switchPrev = useCallback(async () => {
        if (!musicKitInstanceRef.current) return;
        
        if (musicKitInstanceRef.current.isPlaying) {
            musicKitInstanceRef.current.pause();
        }
        await musicKitInstanceRef.current.skipToPreviousItem();
    }, []);

    const appendTracksToQueue = useCallback(async (tracks: MusicKit.Songs[]) => {
        if (!musicKitInstanceRef.current) return;

        // @ts-ignore - Songs can be used as MediaItem in this context
        const currentTracks = tracks;
        await musicKitInstanceRef.current.playLater({ songs: tracks.map(t => t.id) });
        // @ts-ignore - Songs can be used as MediaItem in this context
        setTracks(prevTracks => [...prevTracks, ...currentTracks]);
    }, []);

    const addTracks = useCallback(async (addTrackEvents: IAddTrackEvent[]) => {
        if (!musicKitInstanceRef.current) return;

        for (let event of addTrackEvents) {
            let existingItem = musicKitInstanceRef.current.queue.item(event.position);

            if (!existingItem) {
                const songs = await musicKitInstanceRef.current.api.music(`/v1/catalog/${musicKitInstanceRef.current.storefrontId}/songs`, { ids: [event.trackId] });

                if (songs.data.data.length === 0) {
                    console.warn(`Could not find song with id ${event.trackId}`);
                    return;
                }

                await appendTracksToQueue([songs.data.data[0]]);

                if (musicKitInstanceRef.current.queue.items.length === 1) {
                    await musicKitInstanceRef.current.play();
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
    }, [appendTracksToQueue]);

    const subscribeToStationEvents = useCallback(async () => {
        if (hubConnectionRef.current) {
            return hubConnectionRef.current;
        }

        const hubConnection = new signalR.HubConnectionBuilder()
            .withUrl(`${environment.apiUrl}hubs`)
            .build();

        await hubConnection.start();

        hubConnection.on('trackAdded', async (trackStationId: string, trackId: string, position: number) => {
            if (trackStationId !== stationId) {
                return;
            }

            const event = { trackId, position };

            if (!stationRef.current) {
                pendingEventsRef.current.push(event);
                return;
            }

            await addTracks([event]);
        });

        hubConnectionRef.current = hubConnection;
        return hubConnection;
    }, [stationId, addTracks]);

    const batchItems = useCallback((arr: string[], size: number): string[][] => {
        return arr.length > size
            ? [arr.slice(0, size), ...batchItems(arr.slice(size), size)]
            : [arr];
    }, []);

    const init = useCallback(async () => {
        if (!stationId) {
            return;
        }

        if (stationRef.current && stationRef.current.id === stationId) {
            return;
        }

        stationRef.current = null;
        pendingEventsRef.current = [];
        
        setSuppressEvents(true);
        setCurrentTrack(undefined);
        setTracks([]);

        if (musicKitInstanceRef.current) {
            musicKitInstanceRef.current.stop();
            await musicKitInstanceRef.current.clearQueue();
        } else {
            musicKitInstanceRef.current = await musicKit.getInstance();

            await subscribeToStationEvents();

            playbackStateSubscriptionRef.current = handleStateChangeCallback;
            musicKitInstanceRef.current.addEventListener('playbackStateDidChange', playbackStateSubscriptionRef.current);
            musicKitInstanceRef.current.addEventListener('nowPlayingItemDidChange', handleNowPlayingItemChangeCallback);
            musicKitInstanceRef.current.addEventListener('playbackProgressDidChange', handlePlaybackProgressChangeCallback);

            mediaSessionManager.setNextHandler(switchNext);
            mediaSessionManager.setPrevHandler(switchPrev);
        }

        stationRef.current = await stationApi.getStation(stationId);

        for (let batch of batchItems(stationRef.current.songIds, 300)) {
            if (batch.length) {
                const songs = await musicKitInstanceRef.current.api.music(`/v1/catalog/${musicKitInstanceRef.current.storefrontId}/songs`, { ids: batch });
                await appendTracksToQueue(songs.data.data);
            }
        }

        setSuppressEvents(false);
        if (musicKitInstanceRef.current.queue.items.length) {
            let context = new AudioContext();
            if (context.state === 'running') {
                await musicKitInstanceRef.current.play();
            }
        }

        await addTracks(pendingEventsRef.current);
        pendingEventsRef.current = [];
        updatePlaylistOffset();
        setIsLoading(false);
    }, [stationId]);

    // Define these callbacks without dependencies to prevent infinite loops in tests
    const handleStateChangeCallback = useCallback(async (event: MusicKit.Events['playbackStateDidChange']) => {
        if (!event || suppressEvents) {
            return;
        }

        const playing = event.state as unknown as PlaybackStates === PlaybackStates.playing;
        setIsPlaying(playing);
    }, []); // Remove suppressEvents and isPlaying dependencies to prevent loops

    const handleNowPlayingItemChangeCallback = useCallback(async (event: MusicKit.Events['nowPlayingItemDidChange']) => {
        if (!event.item) {
            return;
        }

        document.title = `${event.item.title} - ${event.item.artistName}`;
        currentTrackScrobbledRef.current = false;

        setCurrentTrack(event.item);

        if (isScrobblingEnabled) {
            await setNowPlaying(event.item);
        }

        if (stationRef.current?.isContinuous) {
            await topUp();
        }

        mediaSessionManager.updateSessionMetadata(event.item.artworkURL);
        updatePlaylistOffset();
    }, []); // Remove dependencies to prevent loops

    const handlePlaybackProgressChangeCallback = useCallback(async (event: MusicKit.Events['playbackProgressDidChange']) => {
        if (currentTrackScrobbledRef.current || event.progress < 0.9) {
            return;
        }

        if (currentTrack && isScrobblingEnabled) {
            await scrobble(currentTrack);
            currentTrackScrobbledRef.current = true;
        }
    }, []); // Remove dependencies to prevent loops

    // Assign to refs for stable references
    const handleStateChange = handleStateChangeCallback;
    const handleNowPlayingItemChange = handleNowPlayingItemChangeCallback;
    const handlePlaybackProgressChange = handlePlaybackProgressChangeCallback;

    const handlePlayPause = useCallback(async () => {
        if (!musicKitInstanceRef.current) return;

        if (musicKitInstanceRef.current.isPlaying) {
            musicKitInstanceRef.current.pause();
        } else {
            await musicKitInstanceRef.current.play();
        }
    }, []);

    const handleTrackSwitched = useCallback(async (index: number) => {
        if (!musicKitInstanceRef.current || !stationRef.current) return;

        const offset = playlistOffset + index;
        const track = tracks[offset];

        if (currentTrack === track) {
            await handlePlayPause();
            return;
        }

        if (musicKitInstanceRef.current.isPlaying) {
            musicKitInstanceRef.current.pause();
        }

        await musicKitInstanceRef.current.changeToMediaAtIndex(offset);
        setCurrentTrack(track);

        if (stationRef.current.isContinuous) {
            await topUp();
        }
    }, [currentTrack, tracks, playlistOffset, handlePlayPause, topUp]);

    const handleTracksRemoved = useCallback(async (position: number, count: number) => {
        if (!stationRef.current) return;

        const offset = playlistOffset + position;

        const newTracks = [...tracks];
        newTracks.splice(offset, count);
        setTracks(newTracks);

        await stationApi.deleteSongs(stationRef.current.id, offset, count);

        if (stationRef.current.isContinuous) {
            await topUp();
        }
    }, [tracks, playlistOffset, topUp]);

    useEffect(() => {
        if (stationId) {
            init();
        }
    }, [stationId]); // Only re-run when stationId changes

    useEffect(() => {
        return () => {
            if (hubConnectionRef.current) {
                hubConnectionRef.current.off('trackAdded');
            }
            if (musicKitInstanceRef.current && playbackStateSubscriptionRef.current) {
                musicKitInstanceRef.current.removeEventListener('playbackStateDidChange', playbackStateSubscriptionRef.current);
                musicKitInstanceRef.current.removeEventListener('playbackProgressDidChange');
                musicKitInstanceRef.current.removeEventListener('nowPlayingItemDidChange');
            }
        };
    }, []);

    return {
        // State
        currentTrack,
        tracks,
        isPlaying,
        isLoading,
        station: stationRef.current,
        playlistOffset,
        
        // LastFM
        isScrobblingEnabled,
        handleScrobblingSwitch,
        lastfmAuthenticated,
        
        // Handlers
        handlePlayPause,
        handleTrackSwitched,
        handleTracksRemoved,
        switchNext,
        switchPrev
    };
};