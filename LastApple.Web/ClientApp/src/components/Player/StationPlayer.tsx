import React, { useState, useCallback, useEffect, useRef, useContext } from 'react';
import { Playlist } from './Playlist';
import { PlayerControls } from './PlayerControls';
import { Spinner } from 'react-bootstrap';
import { instance as mediaSessionManager } from '../../MediaSessionManager';
import { PlaybackStates } from '../../musicKitEnums';
import { LastfmContext } from '../../lastfm/LastfmContext';
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
    const [suppressEvents, setSuppressEvents] = useState(false);
    const [isPlaying, setIsPlaying] = useState(false);

    const context = useContext(LastfmContext);
    
    // Use Last.fm integration hook
    const { isScrobblingEnabled, scrobble, setNowPlaying, handleScrobblingSwitch, lastfmAuthenticated } = useLastfmIntegration();
    
    // Use MusicKit player hook
    const musicKitPlayer = useMusicKitPlayer();
    
    // Use station data hook
    const stationData = useStationData(stationId);
    // Use station connection hook
    const stationConnection = useStationConnection({
        stationId,
        onTrackAdded: async (event) => {
            if (!stationData.station) {
                stationConnection.addPendingEvent(event);
                return;
            }
            await stationData.addTracks([event], musicKitPlayer.getInstance, musicKitPlayer.appendTracksToQueue, musicKitPlayer.play);
        }
    });
    
    const currentTrackScrobbledRef = useRef(false);





    const handleStateChange = useCallback(async (event: MusicKit.Events['playbackStateDidChange']) => {
        if (!event || suppressEvents) {
            return;
        }

        const playing = event.state as unknown as PlaybackStates === PlaybackStates.playing;
        if (isPlaying !== playing) {
            setIsPlaying(playing);
        }
    }, [suppressEvents, isPlaying]);

    const init = useCallback(async () => {
        if (!stationId) return;

        if (stationData.station && stationData.station.id === stationId) {
            return;
        }

        setSuppressEvents(true);
        setCurrentTrack(undefined);
        stationData.setTracks([]);

        const instance = await musicKitPlayer.getInstance();
        if (instance) {
            await musicKitPlayer.stop();
            await musicKitPlayer.clearQueue();
        }

        await stationConnection.subscribeToStationEvents();
        await musicKitPlayer.setupEventListeners(
            handleStateChange,
            async (event: MusicKit.Events['nowPlayingItemDidChange']) => {
                if (!event.item) return;

                document.title = `${event.item.title} - ${event.item.artistName}`;
                currentTrackScrobbledRef.current = false;
                setCurrentTrack(event.item);

                if (isScrobblingEnabled) {
                    await setNowPlaying(event.item);
                }

                if (stationData.station?.isContinuous) {
                    const queueLength = (await musicKitPlayer.getInstance()).queue.items.length;
                    await stationData.topUp(musicKitPlayer.getCurrentQueuePosition, queueLength);
                }

                mediaSessionManager.updateSessionMetadata(event.item.artworkURL);
            },
            async (event: MusicKit.Events['playbackProgressDidChange']) => {
                if (currentTrackScrobbledRef.current || event.progress < 0.9) return;

                if (currentTrack && isScrobblingEnabled) {
                    await scrobble(currentTrack);
                    currentTrackScrobbledRef.current = true;
                }
            },
            musicKitPlayer.skipToNextItem,
            musicKitPlayer.skipToPreviousItem
        );

        const station = await stationData.loadStation();
        if (!station) return;

        const batchItems = (arr: string[], size: number): string[][] =>
            arr.length > size
                ? [arr.slice(0, size), ...batchItems(arr.slice(size), size)]
                : [arr];

        for (let batch of batchItems(station.songIds, 300)) {
            if (batch.length) {
                const songs = await musicKitPlayer.fetchSongs(batch);
                await musicKitPlayer.appendTracksToQueue(songs, stationData.setTracks);
            }
        }

        setSuppressEvents(false);
        const queueItems = (await musicKitPlayer.getInstance()).queue.items;
        if (queueItems.length) {
            let context = new AudioContext();
            if (context.state === 'running') {
                await musicKitPlayer.play();
            }
        }

        const pendingEvents = stationConnection.getPendingEvents();
        if (pendingEvents.length > 0) {
            await stationData.addTracks(pendingEvents, musicKitPlayer.getInstance, musicKitPlayer.appendTracksToQueue, musicKitPlayer.play);
        }
    // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [stationId]); // Only depend on stationId to prevent infinite loops

    const handlePlayPause = useCallback(async () => {
        const instance = await musicKitPlayer.getInstance();
        
        if (instance.isPlaying) {
            instance.pause();
            return;
        }

        await musicKitPlayer.play();
    }, [musicKitPlayer]);

    const handleTrackSwitched = useCallback(async (index: number) => {
        if (!stationData.station) return;

        const offset = stationData.getPlaylistPagingOffset(musicKitPlayer.getCurrentQueuePosition) + index;
        const track = stationData.tracks[offset];
        
        if (currentTrack && track && currentTrack.id === track.id) {
            await handlePlayPause();
            return;
        }
        
        await musicKitPlayer.changeToMediaAtIndex(offset);
        setCurrentTrack(track);

        if (stationData.station.isContinuous) {
            const queueLength = (await musicKitPlayer.getInstance()).queue.items.length;
            await stationData.topUp(musicKitPlayer.getCurrentQueuePosition, queueLength);
        }
    }, [stationData, musicKitPlayer, currentTrack, handlePlayPause]);

    const handleTracksRemoved = useCallback(async (position: number, count: number) => {
        if (!stationData.station) return;

        const offset = stationData.getPlaylistPagingOffset(musicKitPlayer.getCurrentQueuePosition) + position;
        await stationData.removeTracks(position, count, () => offset);

        if (stationData.station.isContinuous) {
            const queueLength = (await musicKitPlayer.getInstance()).queue.items.length;
            await stationData.topUp(musicKitPlayer.getCurrentQueuePosition, queueLength);
        }
    }, [stationData, musicKitPlayer]);



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
            musicKitPlayer.cleanup();
        };
    }, [musicKitPlayer, stationConnection]);

    if (!stationData.station || !stationData.tracks.length) {
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
                switchPrev={musicKitPlayer.skipToPreviousItem}
                switchNext={musicKitPlayer.skipToNextItem}
                onPlayPause={handlePlayPause}
                isScrobblingEnabled={isScrobblingEnabled}
                onScrobblingSwitch={handleScrobblingSwitch}
                lastfmAuthenticated={lastfmAuthenticated}
            />
            <Playlist
                tracks={stationData.tracks}
                isPlaying={isPlaying}
                offset={stationData.getPlaylistPagingOffset(musicKitPlayer.getCurrentQueuePosition)}
                limit={stationData.station.isContinuous ? 10 : 1000}
                currentTrack={currentTrack}
                showAlbumInfo={stationData.station.isGroupedByAlbum}
                onTrackSwitch={handleTrackSwitched}
                onRemove={handleTracksRemoved}
            />
        </div>
    );
};