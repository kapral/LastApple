import { useCallback, useContext } from 'react';
import lastfmApi from '../restClients/LastfmApi';
import { LastfmContext } from '../lastfm/LastfmContext';
import { AuthenticationState } from '../authentication';

export const useLastfmIntegration = () => {
    const context = useContext(LastfmContext);

    const isScrobblingEnabled = context.authentication.state === AuthenticationState.Authenticated && context.isScrobblingEnabled;

    const scrobble = useCallback(async (track: MusicKit.MediaItem) => {
        if (!isScrobblingEnabled) return;
        
        await lastfmApi.postScrobble(
            track.attributes.artistName,
            track.attributes.name,
            track.attributes.albumName,
            track.attributes.duration
        );
    }, [isScrobblingEnabled]);

    const setNowPlaying = useCallback(async (item: MusicKit.MediaItem) => {
        if (!isScrobblingEnabled) return;
        
        await lastfmApi.postNowPlaying(
            item.attributes.artistName,
            item.attributes.name,
            item.attributes.albumName,
            item.playbackDuration
        );
    }, [isScrobblingEnabled]);

    const handleScrobblingSwitch = useCallback((value: boolean) => {
        context.setIsScrobblingEnabled(value);
    }, [context]);

    return {
        isScrobblingEnabled,
        scrobble,
        setNowPlaying,
        handleScrobblingSwitch,
        lastfmAuthenticated: context.authentication.state === AuthenticationState.Authenticated
    };
};