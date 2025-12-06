import { get } from 'svelte/store';
import { lastfmStore } from '$lib/stores/lastfm';
import { AuthenticationState } from '$lib/types/authentication';
import * as LastfmApi from '$lib/services/LastfmApi';
import { getMusicKitInstance } from './musicKitPlayer';

let isInitialized = false;
let currentTrackScrobbled = false;

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
        musicKit.addEventListener('playbackProgressDidChange', handlePlaybackProgressChange);
        
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
    
    // Reset scrobble flag for new track
    currentTrackScrobbled = false;
    
    const lastfmState = get(lastfmStore);
    if (lastfmState.authenticationState !== AuthenticationState.Authenticated || !lastfmState.isScrobblingEnabled) {
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

async function handlePlaybackProgressChange(event: any): Promise<void> {
    // Scrobble when track reaches 90% completion
    if (currentTrackScrobbled || !event.progress || event.progress < 0.9) {
        return;
    }
    
    const lastfmState = get(lastfmStore);
    if (lastfmState.authenticationState !== AuthenticationState.Authenticated || !lastfmState.isScrobblingEnabled) {
        return;
    }
    
    const musicKit = await getMusicKitInstance();
    const currentTrack = musicKit.nowPlayingItem;
    
    if (!currentTrack) {
        return;
    }
    
    try {
        await LastfmApi.postScrobble({
            artist: currentTrack.artistName,
            track: currentTrack.title,
            album: currentTrack.albumName,
            timestamp: Math.floor(Date.now() / 1000),
            duration: Math.floor(currentTrack.playbackDuration)
        });
        currentTrackScrobbled = true;
    } catch (error) {
        console.error('Failed to scrobble track:', error);
    }
}
