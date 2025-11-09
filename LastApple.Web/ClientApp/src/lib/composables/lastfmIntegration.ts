import { get } from 'svelte/store';
import { lastfmStore } from '$lib/stores/lastfm';
import { AuthenticationState } from '$lib/types/authentication';
import * as LastfmApi from '$lib/services/LastfmApi';
import { getMusicKitInstance } from './musicKitPlayer';

let isInitialized = false;

export async function setupLastfmIntegration(): Promise<void> {
    if (isInitialized) {
        return;
    }
    
    const lastfmState = get(lastfmStore);
    
    // Only setup if user is authenticated and scrobbling is enabled
    if (
        lastfmState.authenticationState !== AuthenticationState.Authenticated ||
        !lastfmState.isScrobblingEnabled
    ) {
        return;
    }
    
    try {
        const musicKit = await getMusicKitInstance();
        
        // Listen to playback events
        musicKit.addEventListener('nowPlayingItemDidChange', handleNowPlayingChange);
        musicKit.addEventListener('playbackStateDidChange', handlePlaybackStateChange);
        
        isInitialized = true;
    } catch (error) {
        console.error('Failed to setup Last.fm integration:', error);
    }
}

async function handleNowPlayingChange(event: any): Promise<void> {
    const item = event.item;
    
    if (!item) {
        return;
    }
    
    try {
        await LastfmApi.postNowPlaying({
            artist: item.artistName,
            track: item.title,
            album: item.albumName,
            duration: Math.floor(item.playbackDuration)
        });
    } catch (error) {
        console.error('Failed to update now playing:', error);
    }
}

let scrobbleTimer: ReturnType<typeof setTimeout> | null = null;

async function handlePlaybackStateChange(event: any): Promise<void> {
    const musicKit = await getMusicKitInstance();
    const item = musicKit.nowPlayingItem;
    
    if (!item) {
        return;
    }
    
    // Scrobble after 50% of track has played or 4 minutes (whichever comes first)
    const scrobbleTime = Math.min(item.playbackDuration * 0.5, 240) * 1000;
    
    if (event.state === MusicKit.PlaybackStates.playing) {
        // Clear any existing timer
        if (scrobbleTimer) {
            clearTimeout(scrobbleTimer);
        }
        
        // Set timer to scrobble
        scrobbleTimer = setTimeout(async () => {
            try {
                await LastfmApi.postScrobble({
                    artist: item.artistName,
                    track: item.title,
                    album: item.albumName,
                    timestamp: Math.floor(Date.now() / 1000),
                    duration: Math.floor(item.playbackDuration)
                });
            } catch (error) {
                console.error('Failed to scrobble track:', error);
            }
        }, scrobbleTime);
    } else {
        // Clear timer if playback stopped/paused
        if (scrobbleTimer) {
            clearTimeout(scrobbleTimer);
            scrobbleTimer = null;
        }
    }
}
