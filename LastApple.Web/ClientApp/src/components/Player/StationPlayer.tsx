import React, { useState, useCallback, useEffect, useRef, useContext } from 'react';
import musicKit from '../../musicKit';
import { Playlist } from './Playlist';
import lastfmApi from '../../restClients/LastfmApi';
import stationApi, { IStation } from '../../restClients/StationApi';
import { PlayerControls } from './PlayerControls';
import { Spinner } from 'react-bootstrap';
import { instance as mediaSessionManager } from '../../MediaSessionManager';
import { PlaybackStates } from '../../musicKitEnums';
import { LastfmContext } from '../../lastfm/LastfmContext';
import { AuthenticationState } from '../../authentication';
import { getImageUrl as utilGetImageUrl } from '../../utils/imageUtils';
import { useLastfmIntegration } from '../../hooks/useLastfmIntegration';
import { useStationConnection } from '../../hooks/useStationConnection';
import { useMusicKitPlayer } from '../../hooks/useMusicKitPlayer';
import { useStationData } from '../../hooks/useStationData';

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
    
    // Use Last.fm integration hook
    const { isScrobblingEnabled, scrobble, setNowPlaying, handleScrobblingSwitch, lastfmAuthenticated } = useLastfmIntegration();
    
    // Use station connection hook
    const stationConnection = useStationConnection({
        stationId,
        onTrackAdded: async (event) => {
            if (!stationRef.current) {
                stationConnection.addPendingEvent(event);
                return;
            }
            await addTracks([event]);
        }
    });
    
    // Use MusicKit player hook
    const musicKitPlayer = useMusicKitPlayer();
    
    const getCurrentQueuePosition = useCallback(() => {
        if (!musicKitRef.current) return 0;
        const queuePosition = musicKitRef.current.queue.position;
        return queuePosition !== -1 ? queuePosition : 0;
    }, []);

    const appendTracksToQueue = useCallback(async (trackList: MusicKit.Songs[]) => {
        if (!musicKitRef.current) return;
        
        await musicKitRef.current.playLater({ songs: trackList.map(t => t.id) });
        
        // @ts-ignore - Songs can be used as MediaItem in this context
        setTracks(prevTracks => [...prevTracks, ...trackList]);
    }, []); // Use state updater function to avoid dependency on tracks

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
    // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []); // Remove dependencies to prevent loops

    const topUp = useCallback(async () => {
        if (!stationRef.current || !musicKitRef.current) return;

        const itemsLeft = musicKitRef.current.queue.items.length - getCurrentQueuePosition() + requestedItemsRef.current;
        const itemsToAdd = stationRef.current.size - itemsLeft;

        if (itemsToAdd > 0) {
            requestedItemsRef.current += itemsToAdd;
            await stationApi.topUp(stationId, stationRef.current.definition.stationType, itemsToAdd);
        }
    }, [stationId, getCurrentQueuePosition]);
    
    const musicKitRef = useRef<MusicKit.MusicKitInstance | null>(null);
    const stationRef = useRef<IStation | null>(null);
    const requestedItemsRef = useRef(0);
    const currentTrackScrobbledRef = useRef(false);
    const playbackStateSubscriptionRef = useRef<((x: MusicKit.Events['playbackStateDidChange']) => Promise<void>) | null>(null);





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

        setSuppressEvents(true);
        setCurrentTrack(undefined);
        setTracks([]);

        if (musicKitRef.current) {
            musicKitRef.current.stop();
            await musicKitRef.current.clearQueue();
        } else {
            musicKitRef.current = await musicKit.getInstance();

            await stationConnection.subscribeToStationEvents();

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

                if (currentTrack && isScrobblingEnabled) {
                    await scrobble(currentTrack);
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

        await addTracks(stationConnection.getPendingEvents());
    // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [stationId]); // Only depend on stationId to prevent infinite loops

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
        
        // Get current tracks and track from refs/state
        setTracks(currentTracks => {
            const track = currentTracks[offset];
            
            setCurrentTrack(currentTrack => {
                if (currentTrack === track) {
                    handlePlayPause();
                    return currentTrack;
                }
                
                // Perform the track switch asynchronously
                (async () => {
                    if (musicKitRef.current!.isPlaying) {
                        musicKitRef.current!.pause();
                    }

                    await musicKitRef.current!.changeToMediaAtIndex(offset);
                    setCurrentTrack(track);

                    if (stationRef.current?.isContinuous) {
                        await topUp();
                    }
                })();
                
                return currentTrack;
            });
            
            return currentTracks;
        });
    // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []); // No dependencies to prevent loops

    const handleTracksRemoved = useCallback(async (position: number, count: number) => {
        if (!stationRef.current) return;

        const offset = getPlaylistPagingOffset() + position;

        setTracks(currentTracks => {
            const newTracks = [...currentTracks];
            newTracks.splice(offset, count);
            
            // Perform async operations without depending on state
            (async () => {
                await stationApi.deleteSongs(stationRef.current!.id, offset, count);

                if (stationRef.current!.isContinuous) {
                    await topUp();
                }
            })();
            
            return newTracks;
        });
    // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []); // No dependencies to prevent loops



    useEffect(() => {
        if (stationId) {
            // Use setTimeout to defer the init call, preventing infinite loops in tests
            const timeoutId = setTimeout(() => {
                init();
            }, 0);
            
            return () => clearTimeout(timeoutId);
        }
    // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [stationId]); // Only depend on stationId

    useEffect(() => {
        return () => {
            stationConnection.cleanup();
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
                lastfmAuthenticated={lastfmAuthenticated}
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