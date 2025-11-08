import { useCallback, useRef } from 'react';
import musicKit from '../musicKit';
import { instance as mediaSessionManager } from '../MediaSessionManager';

export const useMusicKitPlayer = () => {
    const musicKitRef = useRef<MusicKit.MusicKitInstance | null>(null);
    const playbackStateSubscriptionRef = useRef<((x: MusicKit.Events['playbackStateDidChange']) => Promise<void>) | null>(null);
    const isInitializedRef = useRef(false);

    const getCurrentQueuePosition = useCallback(() => {
        if (!musicKitRef.current) return 0;
        const queuePosition = musicKitRef.current.queue.position;
        return queuePosition !== -1 ? queuePosition : 0;
    }, []);

    const getInstance = useCallback(async () => {
        if (!musicKitRef.current) {
            musicKitRef.current = await musicKit.getInstance();
            isInitializedRef.current = false; // Mark as newly created
        }
        return musicKitRef.current;
    }, []);

    const isFirstTime = useCallback(() => {
        if (!isInitializedRef.current) {
            isInitializedRef.current = true;
            return true;
        }
        return false;
    }, []);

    const appendTracksToQueue = useCallback(async (trackList: MusicKit.Songs[], setTracks: React.Dispatch<React.SetStateAction<MusicKit.MediaItem[]>>) => {
        const instance = await getInstance();
        
        await instance.playLater({ songs: trackList.map(t => t.id) });
        
        // @ts-ignore - Songs can be used as MediaItem in this context
        setTracks(prevTracks => [...prevTracks, ...trackList]);
    }, [getInstance]);

    const play = useCallback(async () => {
        const instance = await getInstance();
        await instance.play();
    }, [getInstance]);

    const stop = useCallback(async () => {
        const instance = await getInstance();
        instance.stop();
    }, [getInstance]);

    const clearQueue = useCallback(async () => {
        const instance = await getInstance();
        await instance.clearQueue();
    }, [getInstance]);

    const skipToPreviousItem = useCallback(async () => {
        const instance = await getInstance();
        if (instance.isPlaying) {
            instance.pause();
        }
        await instance.skipToPreviousItem();
    }, [getInstance]);

    const skipToNextItem = useCallback(async () => {
        const instance = await getInstance();
        if (instance.isPlaying) {
            instance.pause();
        }
        await instance.skipToNextItem();
    }, [getInstance]);

    const changeToMediaAtIndex = useCallback(async (index: number) => {
        const instance = await getInstance();
        if (instance.isPlaying) {
            instance.pause();
        }
        await instance.changeToMediaAtIndex(index);
    }, [getInstance]);

    const setupEventListeners = useCallback(async (
        handleStateChange: (event: MusicKit.Events['playbackStateDidChange']) => Promise<void>,
        handleNowPlayingItemChange: (event: MusicKit.Events['nowPlayingItemDidChange']) => Promise<void>,
        handlePlaybackProgressChange: (event: MusicKit.Events['playbackProgressDidChange']) => Promise<void>,
        switchNext: () => Promise<void>,
        switchPrev: () => Promise<void>
    ) => {
        const instance = await getInstance();

        playbackStateSubscriptionRef.current = handleStateChange;
        instance.addEventListener('playbackStateDidChange', playbackStateSubscriptionRef.current);
        instance.addEventListener('nowPlayingItemDidChange', handleNowPlayingItemChange);
        instance.addEventListener('playbackProgressDidChange', handlePlaybackProgressChange);

        mediaSessionManager.setNextHandler(() => switchNext());
        mediaSessionManager.setPrevHandler(() => switchPrev());
    }, [getInstance]);

    const cleanup = useCallback(() => {
        if (musicKitRef.current && playbackStateSubscriptionRef.current) {
            musicKitRef.current.removeEventListener('playbackStateDidChange', playbackStateSubscriptionRef.current);
            musicKitRef.current.removeEventListener('playbackProgressDidChange');
            musicKitRef.current.removeEventListener('nowPlayingItemDidChange');
        }
    }, []);

    const fetchSongs = useCallback(async (songIds: string[]) => {
        const instance = await getInstance();
        
        const response = await instance.api.music(`/v1/catalog/${instance.storefrontId}/songs`, { ids: songIds });
        return response.data.data;
    }, [getInstance]);

    return {
        musicKitRef,
        getCurrentQueuePosition,
        getInstance,
        isFirstTime,
        appendTracksToQueue,
        play,
        stop,
        clearQueue,
        skipToPreviousItem,
        skipToNextItem,
        changeToMediaAtIndex,
        setupEventListeners,
        cleanup,
        fetchSongs
    };
};