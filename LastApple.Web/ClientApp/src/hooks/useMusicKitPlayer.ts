import { useCallback, useRef, useEffect } from 'react';
import musicKit from '../musicKit';
import { instance as mediaSessionManager } from '../MediaSessionManager';
import { PlaybackStates } from '../musicKitEnums';

interface UseMusicKitPlayerProps {
    onPlaybackStateChange: (event: MusicKit.Events['playbackStateDidChange']) => Promise<void>;
    onNowPlayingItemChange: (event: MusicKit.Events['nowPlayingItemDidChange']) => Promise<void>;
    onPlaybackProgressChange: (event: MusicKit.Events['playbackProgressDidChange']) => Promise<void>;
    onNext: () => Promise<void>;
    onPrev: () => Promise<void>;
}

export const useMusicKitPlayer = ({
    onPlaybackStateChange,
    onNowPlayingItemChange,
    onPlaybackProgressChange,
    onNext,
    onPrev
}: UseMusicKitPlayerProps) => {
    const musicKitInstanceRef = useRef<MusicKit.MusicKitInstance | null>(null);
    const playbackStateSubscriptionRef = useRef<((x: MusicKit.Events['playbackStateDidChange']) => Promise<void>) | null>(null);

    const getInstance = useCallback(async () => {
        if (musicKitInstanceRef.current) {
            return musicKitInstanceRef.current;
        }

        const instance = await musicKit.getInstance();
        musicKitInstanceRef.current = instance;

        // Set up event listeners
        playbackStateSubscriptionRef.current = onPlaybackStateChange;
        instance.addEventListener('playbackStateDidChange', playbackStateSubscriptionRef.current);
        instance.addEventListener('nowPlayingItemDidChange', onNowPlayingItemChange);
        instance.addEventListener('playbackProgressDidChange', onPlaybackProgressChange);

        // Set up media session handlers
        mediaSessionManager.setNextHandler(onNext);
        mediaSessionManager.setPrevHandler(onPrev);

        return instance;
    }, [onPlaybackStateChange, onNowPlayingItemChange, onPlaybackProgressChange, onNext, onPrev]);

    const play = useCallback(async () => {
        const instance = await getInstance();
        await instance.play();
    }, [getInstance]);

    const pause = useCallback(async () => {
        const instance = await getInstance();
        instance.pause();
    }, [getInstance]);

    const stop = useCallback(async () => {
        const instance = await getInstance();
        instance.stop();
    }, [getInstance]);

    const clearQueue = useCallback(async () => {
        const instance = await getInstance();
        await instance.clearQueue();
    }, [getInstance]);

    const appendTracksToQueue = useCallback(async (tracks: MusicKit.Songs[]) => {
        const instance = await getInstance();
        await instance.playLater({ songs: tracks.map(t => t.id) });
    }, [getInstance]);

    const skipToNextItem = useCallback(async () => {
        const instance = await getInstance();
        await instance.skipToNextItem();
    }, [getInstance]);

    const skipToPreviousItem = useCallback(async () => {
        const instance = await getInstance();
        await instance.skipToPreviousItem();
    }, [getInstance]);

    const changeToMediaAtIndex = useCallback(async (index: number) => {
        const instance = await getInstance();
        await instance.changeToMediaAtIndex(index);
    }, [getInstance]);

    const getQueue = useCallback(async () => {
        const instance = await getInstance();
        return instance.queue;
    }, [getInstance]);

    const getIsPlaying = useCallback(async () => {
        const instance = await getInstance();
        return instance.isPlaying;
    }, [getInstance]);

    const getCurrentQueuePosition = useCallback(async () => {
        const queue = await getQueue();
        const queuePosition = queue.position;
        return queuePosition !== -1 ? queuePosition : 0;
    }, [getQueue]);

    const fetchSongs = useCallback(async (songIds: string[]) => {
        const instance = await getInstance();
        const response = await instance.api.music(`/v1/catalog/${instance.storefrontId}/songs`, { ids: songIds });
        return response.data.data;
    }, [getInstance]);

    const cleanup = useCallback(() => {
        if (musicKitInstanceRef.current && playbackStateSubscriptionRef.current) {
            musicKitInstanceRef.current.removeEventListener('playbackStateDidChange', playbackStateSubscriptionRef.current);
            musicKitInstanceRef.current.removeEventListener('playbackProgressDidChange');
            musicKitInstanceRef.current.removeEventListener('nowPlayingItemDidChange');
        }
    }, []);

    return {
        getInstance,
        play,
        pause,
        stop,
        clearQueue,
        appendTracksToQueue,
        skipToNextItem,
        skipToPreviousItem,
        changeToMediaAtIndex,
        getQueue,
        getIsPlaying,
        getCurrentQueuePosition,
        fetchSongs,
        cleanup
    };
};