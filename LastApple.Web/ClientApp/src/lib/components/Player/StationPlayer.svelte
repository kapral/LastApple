<script lang="ts">
  import { onMount, onDestroy } from 'svelte';
  import { getMusicKitInstance } from '$lib/composables/musicKitPlayer';
  import { connectToStation, type StationConnection } from '$lib/composables/stationConnection';
  import { setupLastfmIntegration } from '$lib/composables/lastfmIntegration';
  import { loadStationData } from '$lib/composables/stationData';
  import { lastfmStore } from '$lib/stores/lastfm';
  import PlayerControls from './PlayerControls.svelte';
  import Playlist from './Playlist.svelte';
  import { mediaSessionManager } from '$lib/MediaSessionManager';
  
  export let stationId: string;
  
  let currentTrack: MusicKit.MediaItem | undefined = undefined;
  let suppressEvents = false;
  let isPlaying = false;
  let station: any = null;
  let tracks: MusicKit.MediaItem[] = [];
  let musicKit: MusicKit.MusicKitInstance | null = null;
  let connection: StationConnection | null = null;
  let cleanupLastfm: (() => void) | null = null;
  let currentTrackScrobbled = false;
  let isFirstTime = true;

  let pendingEvents: Array<{ trackId: string; position: number }> = [];
  
  $: isScrobblingEnabled = $lastfmStore.isScrobblingEnabled;
  $: lastfmAuthenticated = $lastfmStore.isAuthenticated;
  
  function getCurrentQueuePosition(): number {
    if (!musicKit) return 0;
    const position = musicKit.queue.position;
    return position !== -1 ? position : 0;
  }
  
  function getPlaylistPagingOffset(): number {
    if (!station || !station.isContinuous) {
      return 0;
    }
    const position = getCurrentQueuePosition();
    return Math.max(0, position - 5);
  }
  
  async function fetchSongs(songIds: string[]): Promise<MusicKit.Songs> {
    if (!musicKit) return [];
    try {
      const response = await musicKit.api.songs(songIds);
      return response as MusicKit.Songs;
    } catch (error) {
      console.error('Error fetching songs:', error);
      return [];
    }
  }
  
  async function appendTracksToQueue(songs: MusicKit.Songs): Promise<void> {
    if (!musicKit || !songs.length) return;
    
    try {
      await musicKit.playLater({ songs: songs.map(s => s.id) });
      // @ts-ignore - Songs can be used as MediaItem in this context
      tracks = [...tracks, ...songs];
    } catch (error) {
      console.error('Error appending tracks:', error);
    }
  }
  
  async function topUp(): Promise<void> {
    if (!station || !musicKit) return;
    
    const queueLength = musicKit.queue.items.length;
    const queuePosition = musicKit.queue.position;
    
    if (queueLength - queuePosition > 10) {
      return; // Enough tracks in queue
    }
    
    try {
      const response = await fetch(`/api/station/${stationId}/top-up`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' }
      });
      
      if (response.ok) {
        const newTracks = await response.json();
        if (newTracks && newTracks.length > 0) {
          const songs = await fetchSongs(newTracks);
          await appendTracksToQueue(songs);
        }
      }
    } catch (error) {
      console.error('Error topping up station:', error);
    }
  }
  
  async function addTracks(events: Array<{ trackId: string; position: number }>): Promise<void> {
    if (!station || !musicKit) {
      pendingEvents.push(...events);
      return;
    }
    
    const trackIds = events.map(e => e.trackId);
    const songs = await fetchSongs(trackIds);
    await appendTracksToQueue(songs);
    
    if (!musicKit.isPlaying) {
      await musicKit.play();
    }
  }
  
  async function removeTracks(position: number, count: number): Promise<void> {
    if (!station || !musicKit) return;
    
    try {
      const offset = getPlaylistPagingOffset() + position;
      
      // Remove from API
      await fetch(`/api/station/${stationId}/songs`, {
        method: 'DELETE',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ position: offset, count })
      });
      
      // Update local tracks
      tracks = tracks.filter((_, index) => index < offset || index >= offset + count);
      
      if (station.isContinuous) {
        await topUp();
      }
    } catch (error) {
      console.error('Error removing tracks:', error);
    }
  }
  
  async function handleTrackSwitched(index: number): Promise<void> {
    if (!station || !musicKit) return;
    
    const offset = getPlaylistPagingOffset() + index;
    const track = tracks[offset];
    
    if (currentTrack && track && currentTrack.id === track.id) {
      // Same track, toggle play/pause
      if (musicKit.isPlaying) {
        musicKit.pause();
      } else {
        await musicKit.play();
      }
      return;
    }
    
    if (musicKit.isPlaying) {
      musicKit.pause();
    }
    await musicKit.changeToMediaAtIndex(offset);
    currentTrack = track;
    
    if (station.isContinuous) {
      await topUp();
    }
  }
  
  async function handleStateChange(event: MusicKit.Events['playbackStateDidChange']): Promise<void> {
    if (!event || suppressEvents) return;
    
    const playing = event.state === 2; // PlaybackStates.playing = 2
    if (isPlaying !== playing) {
      isPlaying = playing;
    }
  }
  
  async function handleNowPlayingItemDidChange(event: MusicKit.Events['nowPlayingItemDidChange']): Promise<void> {
    if (!event.item) return;
    
    document.title = `${event.item.title} - ${event.item.artistName}`;
    currentTrackScrobbled = false;
    currentTrack = event.item;
    
    // Queue position is tracked via getCurrentQueuePosition() helper
    
    // Set now playing on Last.fm
    if (isScrobblingEnabled && $lastfmStore.user) {
      try {
        await fetch('/api/lastfm/now-playing', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            artist: event.item.artistName,
            track: event.item.title,
            album: event.item.albumName
          })
        });
      } catch (error) {
        console.error('Error setting now playing:', error);
      }
    }
    
    // Top up if continuous station
    if (station?.isContinuous && musicKit) {
      await topUp();
    }
    
    // Update media session
    if (event.item.artworkURL) {
      mediaSessionManager.updateSessionMetadata(event.item.artworkURL);
    }
  }
  
  async function handlePlaybackProgressDidChange(event: MusicKit.Events['playbackProgressDidChange']): Promise<void> {
    if (currentTrackScrobbled || event.progress < 0.9) return;
    
    if (currentTrack && isScrobblingEnabled && $lastfmStore.user) {
      try {
        await fetch('/api/lastfm/scrobble', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            artist: currentTrack.artistName,
            track: currentTrack.title,
            album: currentTrack.albumName,
            timestamp: Math.floor(Date.now() / 1000)
          })
        });
        currentTrackScrobbled = true;
      } catch (error) {
        console.error('Error scrobbling:', error);
      }
    }
  }
  
  async function init(): Promise<void> {
    if (!stationId) return;
    
    if (station && station.id === stationId) {
      return;
    }
    
    suppressEvents = true;
    currentTrack = undefined;
    tracks = [];
    
    if (!musicKit) {
      musicKit = await getMusicKitInstance();
    }
    
    if (isFirstTime && musicKit) {
      // Setup event listeners (only first time)
      musicKit.addEventListener('playbackStateDidChange', handleStateChange);
      musicKit.addEventListener('nowPlayingItemDidChange', handleNowPlayingItemDidChange);
      musicKit.addEventListener('playbackProgressDidChange', handlePlaybackProgressDidChange);
      
      // Setup Last.fm integration
      cleanupLastfm = setupLastfmIntegration(musicKit);
      
      // Connect to SignalR
      connection = await connectToStation(stationId);
      connection.onTrackAdded = async (trackStationId: string, trackId: string, position: number) => {
        if (trackStationId === stationId) {
          await addTracks([{ trackId, position }]);
        }
      };
      await connection.start();
      
      isFirstTime = false;
    } else if (musicKit) {
      // Not first time, clear queue
      musicKit.stop();
      await musicKit.clearQueue();
    }
    
    // Load station
    station = await loadStationData(stationId);
    if (!station) return;
    
    // Batch load songs (300 at a time)
    const batchSize = 300;
    const songIds = station.songIds || [];
    
    for (let i = 0; i < songIds.length; i += batchSize) {
      const batch = songIds.slice(i, i + batchSize);
      if (batch.length > 0) {
        const songs = await fetchSongs(batch);
        await appendTracksToQueue(songs);
      }
    }
    
    suppressEvents = false;
    
    // Start playback if audio context is running
    if (musicKit && musicKit.queue.items.length > 0) {
      const context = new AudioContext();
      if (context.state === 'running') {
        await musicKit.play();
      }
    }
    
    // Process pending events
    if (pendingEvents.length > 0) {
      await addTracks([...pendingEvents]);
      pendingEvents = [];
    }
  }
  
  async function handlePlayPause(): Promise<void> {
    if (!musicKit) return;
    
    if (musicKit.isPlaying) {
      musicKit.pause();
    } else {
      await musicKit.play();
    }
  }
  
  async function skipToPreviousItem(): Promise<void> {
    if (!musicKit) return;
    if (musicKit.isPlaying) {
      musicKit.pause();
    }
    await musicKit.skipToPreviousItem();
  }
  
  async function skipToNextItem(): Promise<void> {
    if (!musicKit) return;
    if (musicKit.isPlaying) {
      musicKit.pause();
    }
    await musicKit.skipToNextItem();
  }
  
  function handleScrobblingSwitch(): void {
    lastfmStore.setScrobblingEnabled(!isScrobblingEnabled);
  }
  
  onMount(async () => {
    await init();
  });
  
  $: if (stationId) {
    init();
  }
  
  onDestroy(() => {
    if (connection) {
      connection.stop();
    }
    if (cleanupLastfm) {
      cleanupLastfm();
    }
    if (musicKit) {
      musicKit.removeEventListener('playbackStateDidChange', handleStateChange);
      musicKit.removeEventListener('nowPlayingItemDidChange', handleNowPlayingItemDidChange);
      musicKit.removeEventListener('playbackProgressDidChange', handlePlaybackProgressDidChange);
    }
  });
</script>

{#if !station || !tracks.length}
  <div class="loading-container">
    <div class="spinner-border" role="status">
      <span class="visually-hidden">Loading...</span>
    </div>
  </div>
{:else}
  <div>
    <PlayerControls
      {currentTrack}
      {isPlaying}
      switchPrev={skipToPreviousItem}
      switchNext={skipToNextItem}
      onPlayPause={handlePlayPause}
      {isScrobblingEnabled}
      onScrobblingSwitch={handleScrobblingSwitch}
      {lastfmAuthenticated}
    />
    <Playlist
      {tracks}
      {isPlaying}
      offset={getPlaylistPagingOffset()}
      limit={station.isContinuous ? 10 : 1000}
      {currentTrack}
      showAlbumInfo={station.isGroupedByAlbum}
      onTrackSwitch={handleTrackSwitched}
      onRemove={removeTracks}
    />
  </div>
{/if}

<style>
  .loading-container {
    display: flex;
    align-items: center;
    justify-content: center;
    height: 200px;
  }
</style>
