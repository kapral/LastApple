import React, { useState, useCallback, useEffect, useRef, useContext } from 'react';
import musicKit from '../../musicKit';
import * as signalR from '@aspnet/signalr';
import { HubConnection } from '@aspnet/signalr';
import { Playlist } from './Playlist';
import lastfmApi from '../../restClients/LastfmApi';
import stationApi, { IStation } from '../../restClients/StationApi';
import environment from '../../Environment';
import { PlayerControls } from './PlayerControls';
import { Spinner } from 'react-bootstrap';
import { instance as mediaSessionManager } from '../../MediaSessionManager';
import { PlaybackStates } from '../../musicKitEnums';
import { LastfmContext } from '../../lastfm/LastfmContext';
import { AuthenticationState } from '../../authentication';

interface IPlayerProps {
    stationId: string;
}

interface IAddTrackEvent {
    trackId: string;
    position: number;
}

export const StationPlayer: React.FC<IPlayerProps> = ({ stationId }) => {
    const [currentTrack, setCurrentTrack] = useState<MusicKit.MediaItem | undefined>();
    const [tracks, setTracks] = useState<MusicKit.MediaItem[]>([]);
    const [suppressEvents, setSuppressEvents] = useState(false);
    const [isPlaying, setIsPlaying] = useState(false);

    const context = useContext(LastfmContext);
    
    const musicKitRef = useRef<MusicKit.MusicKitInstance | null>(null);
    const pendingEventsRef = useRef<IAddTrackEvent[]>([]);
    const stationRef = useRef<IStation | null>(null);
    const requestedItemsRef = useRef(0);
    const hubConnectionRef = useRef<HubConnection | null>(null);
    const currentTrackScrobbledRef = useRef(false);
    const playbackStateSubscriptionRef = useRef<((x: MusicKit.Events['playbackStateDidChange']) => Promise<void>) | null>(null);

    const isScrobblingEnabled = context.authentication.state === AuthenticationState.Authenticated && context.isScrobblingEnabled;

    const getCurrentQueuePosition = useCallback(() => {
        if (!musicKitRef.current) return 0;
        const queuePosition = musicKitRef.current.queue.position;
        return queuePosition !== -1 ? queuePosition : 0;
    }, []);

    const appendTracksToQueue = useCallback(async (trackList: MusicKit.Songs[]) => {
        if (!musicKitRef.current) return;
        
        // @ts-ignore - Songs can be used as MediaItem in this context
        const currentTracks = tracks.concat(trackList);
        
        await musicKitRef.current.playLater({ songs: trackList.map(t => t.id) });
        setTracks(currentTracks);
    }, [tracks]);

    const play = useCallback(async () => {
        if (musicKitRef.current) {
            await musicKitRef.current.play();
        }
    }, []);

    const addTracks = useCallback(async (addTrackEvents: IAddTrackEvent[]) => {
        if (!musicKitRef.current) return;

        for (let event of addTrackEvents) {
            let existingItem = musicKitRef.current.queue.item(event.position);

            if (!existingItem) {
                let songs = await musicKitRef.current.api.music(`/v1/catalog/${musicKitRef.current.storefrontId}/songs`, { ids: [event.trackId] });

                if (songs.data.data.length === 0) {
                    console.warn(`Could not find song with id ${event.trackId}`);
                    return;
                }

                await appendTracksToQueue([songs.data.data[0]]);

                if (musicKitRef.current.queue.items.length === 1) {
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
    }, [appendTracksToQueue, play]);

    const topUp = useCallback(async () => {
        if (!stationRef.current || !musicKitRef.current) return;

        const itemsLeft = musicKitRef.current.queue.items.length - getCurrentQueuePosition() + requestedItemsRef.current;
        const itemsToAdd = stationRef.current.size - itemsLeft;

        if (itemsToAdd > 0) {
            requestedItemsRef.current += itemsToAdd;
            await stationApi.topUp(stationId, stationRef.current.definition.stationType, itemsToAdd);
        }
    }, [stationId, getCurrentQueuePosition]);

    const scrobble = useCallback(async () => {
        if (!currentTrack) return;
        await lastfmApi.postScrobble(
            currentTrack.attributes.artistName,
            currentTrack.attributes.name,
            currentTrack.attributes.albumName,
            currentTrack.attributes.duration
        );
    }, [currentTrack]);

    const setNowPlaying = useCallback(async (item: MusicKit.MediaItem) => {
        await lastfmApi.postNowPlaying(
            item.attributes.artistName,
            item.attributes.name,
            item.attributes.albumName,
            item.playbackDuration
        );
    }, []);

    const subscribeToStationEvents = useCallback(async () => {
        if (hubConnectionRef.current) return;

        hubConnectionRef.current = new signalR.HubConnectionBuilder()
            .withUrl(`${environment.apiUrl}hubs`)
            .build();

        await hubConnectionRef.current.start();

        hubConnectionRef.current.on('trackAdded', async (trackStationId: string, trackId: string, position: number) => {
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
    }, [stationId, addTracks]);

    const handleStateChange = useCallback(async (event: MusicKit.Events['playbackStateDidChange']) => {
        if (!event || suppressEvents) {
            return;
        }

        const playing = event.state as unknown as PlaybackStates === PlaybackStates.playing;
        if (isPlaying !== playing) {
            setIsPlaying(playing);
        }
    }, [suppressEvents, isPlaying]);

    const switchPrev = useCallback(async () => {
        if (!musicKitRef.current) return;
        
        if (musicKitRef.current.isPlaying) {
            musicKitRef.current.pause();
        }
        await musicKitRef.current.skipToPreviousItem();
    }, []);

    const switchNext = useCallback(async () => {
        if (!musicKitRef.current) return;
        
        if (musicKitRef.current.isPlaying) {
            musicKitRef.current.pause();
        }
        await musicKitRef.current.skipToNextItem();
    }, []);

    const init = useCallback(async () => {
        if (!stationId) return;

        if (stationRef.current && stationRef.current.id === stationId) {
            return;
        }

        stationRef.current = null;
        pendingEventsRef.current = [];

        if (!suppressEvents) {
            setSuppressEvents(true);
        }

        if (tracks.length) {
            setCurrentTrack(undefined);
            setTracks([]);
        }

        if (musicKitRef.current) {
            musicKitRef.current.stop();
            await musicKitRef.current.clearQueue();
        } else {
            musicKitRef.current = await musicKit.getInstance();

            await subscribeToStationEvents();

            playbackStateSubscriptionRef.current = handleStateChange;
            musicKitRef.current.addEventListener('playbackStateDidChange', playbackStateSubscriptionRef.current);
            
            musicKitRef.current.addEventListener('nowPlayingItemDidChange', async (event: MusicKit.Events['nowPlayingItemDidChange']) => {
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
            });
            
            musicKitRef.current.addEventListener('playbackProgressDidChange', async (event: MusicKit.Events['playbackProgressDidChange']) => {
                if (currentTrackScrobbledRef.current) {
                    return;
                }

                if (event.progress < 0.9) {
                    return;
                }

                if (isScrobblingEnabled) {
                    await scrobble();
                    currentTrackScrobbledRef.current = true;
                }
            });

            mediaSessionManager.setNextHandler(() => switchNext());
            mediaSessionManager.setPrevHandler(() => switchPrev());
        }

        stationRef.current = await stationApi.getStation(stationId);

        const batchItems = (arr: string[], size: number) =>
            arr.length > size
                ? [arr.slice(0, size), ...batchItems(arr.slice(size), size)]
                : [arr];

        for (let batch of batchItems(stationRef.current.songIds, 300)) {
            if (batch.length) {
                const songs = await musicKitRef.current.api.music(`/v1/catalog/${musicKitRef.current.storefrontId}/songs`, { ids: batch });
                await appendTracksToQueue(songs.data.data);
            }
        }

        setSuppressEvents(false);
        if (musicKitRef.current.queue.items.length) {
            let context = new AudioContext();
            if (context.state === 'running') {
                await play();
            }
        }

        await addTracks(pendingEventsRef.current);
        pendingEventsRef.current = [];
    }, [stationId, suppressEvents, tracks.length, subscribeToStationEvents, handleStateChange, isScrobblingEnabled, setNowPlaying, topUp, scrobble, switchNext, switchPrev, appendTracksToQueue, play, addTracks]);

    const handlePlayPause = useCallback(async () => {
        if (!musicKitRef.current) return;

        if (musicKitRef.current.isPlaying) {
            musicKitRef.current.pause();
            return;
        }

        await play();
    }, [play]);

    const getPlaylistPagingOffset = useCallback((): number => {
        if (stationRef.current?.isContinuous) {
            return getCurrentQueuePosition();
        }
        return 0;
    }, [getCurrentQueuePosition]);

    const handleTrackSwitched = useCallback(async (index: number) => {
        if (!musicKitRef.current || !stationRef.current) return;

        const offset = getPlaylistPagingOffset() + index;
        const track = tracks[offset];

        if (currentTrack === track) {
            await handlePlayPause();
            return;
        }

        if (musicKitRef.current.isPlaying) {
            musicKitRef.current.pause();
        }

        await musicKitRef.current.changeToMediaAtIndex(offset);
        setCurrentTrack(track);

        if (stationRef.current.isContinuous) {
            await topUp();
        }
    }, [tracks, currentTrack, getPlaylistPagingOffset, handlePlayPause, topUp]);

    const handleTracksRemoved = useCallback(async (position: number, count: number) => {
        if (!stationRef.current) return;

        const offset = getPlaylistPagingOffset() + position;

        const newTracks = [...tracks];
        newTracks.splice(offset, count);
        setTracks(newTracks);

        await stationApi.deleteSongs(stationRef.current.id, offset, count);

        if (stationRef.current.isContinuous) {
            await topUp();
        }
    }, [tracks, getPlaylistPagingOffset, topUp]);

    const handleScrobblingSwitch = useCallback((value: boolean) => {
        context.setIsScrobblingEnabled(value);
    }, [context]);

    useEffect(() => {
        if (stationId) {
            init();
        }
    }, [stationId, init]);

    useEffect(() => {
        return () => {
            if (hubConnectionRef.current) {
                hubConnectionRef.current.off('trackAdded');
            }
            if (musicKitRef.current && playbackStateSubscriptionRef.current) {
                musicKitRef.current.removeEventListener('playbackStateDidChange', playbackStateSubscriptionRef.current);
                musicKitRef.current.removeEventListener('playbackProgressDidChange');
                musicKitRef.current.removeEventListener('nowPlayingItemDidChange');
            }
        };
    }, []);

    if (!stationRef.current || !tracks.length) {
        return (
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: '200px' }}>
                <Spinner animation="border" data-testid="spinner" />
            </div>
        );
    }

    return (
        <div>
            <PlayerControls
                currentTrack={currentTrack}
                isPlaying={isPlaying}
                switchPrev={switchPrev}
                switchNext={switchNext}
                onPlayPause={handlePlayPause}
                isScrobblingEnabled={isScrobblingEnabled}
                onScrobblingSwitch={handleScrobblingSwitch}
                lastfmAuthenticated={context.authentication.state === AuthenticationState.Authenticated}
            />
            <Playlist
                tracks={tracks}
                isPlaying={isPlaying}
                offset={getPlaylistPagingOffset()}
                limit={stationRef.current.isContinuous ? 10 : 1000}
                currentTrack={currentTrack}
                showAlbumInfo={stationRef.current.isGroupedByAlbum}
                onTrackSwitch={handleTrackSwitched}
                onRemove={handleTracksRemoved}
            />
        </div>
    );
};

// Attach the static method to the new functional component for backward compatibility
(StationPlayer as any).getImageUrl = (sourceUrl: string, size: number = 400) => {
    return sourceUrl
        ? sourceUrl.replace('{w}x{h}', `${size}x${size}`).replace('2000x2000', `${size}x${size}`)
        : 'default-album-cover.png';
};