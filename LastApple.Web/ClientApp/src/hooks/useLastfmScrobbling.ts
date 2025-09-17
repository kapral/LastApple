import { useCallback, useContext } from 'react';
import lastfmApi from '../restClients/LastfmApi';
import { LastfmContext } from '../lastfm/LastfmContext';
import { AuthenticationState } from '../authentication';

export const useLastfmScrobbling = () => {
    const context = useContext(LastfmContext);

    const isScrobblingEnabled = useCallback(() => {
        return context.authentication.state === AuthenticationState.Authenticated && context.isScrobblingEnabled;
    }, [context.authentication.state, context.isScrobblingEnabled]);

    const scrobble = useCallback(async (track: MusicKit.MediaItem) => {
        if (!isScrobblingEnabled()) {
            return;
        }

        await lastfmApi.postScrobble(
            track.attributes.artistName,
            track.attributes.name,
            track.attributes.albumName,
            track.attributes.duration
        );
    }, [isScrobblingEnabled]);

    const setNowPlaying = useCallback(async (track: MusicKit.MediaItem) => {
        if (!isScrobblingEnabled()) {
            return;
        }

        await lastfmApi.postNowPlaying(
            track.attributes.artistName,
            track.attributes.name,
            track.attributes.albumName,
            track.playbackDuration
        );
    }, [isScrobblingEnabled]);

    const handleScrobblingSwitch = useCallback((value: boolean) => {
        context.setIsScrobblingEnabled(value);
    }, [context]);

    return {
        isScrobblingEnabled: isScrobblingEnabled(),
        scrobble,
        setNowPlaying,
        handleScrobblingSwitch,
        lastfmAuthenticated: context.authentication.state === AuthenticationState.Authenticated
    };
};