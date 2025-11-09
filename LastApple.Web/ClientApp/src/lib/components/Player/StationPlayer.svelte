<script lang="ts">
  import { onMount, onDestroy } from 'svelte';
  import { page } from '$app/stores';
  import { getMusicKitInstance } from '$lib/composables/musicKitPlayer';
  import { connectToStation } from '$lib/composables/stationConnection';
  import { setupLastfmIntegration } from '$lib/composables/lastfmIntegration';
  import { loadStationData } from '$lib/composables/stationData';
  import PlayerHeader from './PlayerHeader.svelte';
  import PlayerControls from './PlayerControls.svelte';
  import Playlist from './Playlist.svelte';
  import ProgressControl from './ProgressControl.svelte';
  
  let musicKit: MusicKit.MusicKitInstance | null = null;
  let connection: any = null;
  let station: any = null;
  let playlist: any[] = [];
  let cleanupLastfm: (() => void) | null = null;
  
  $: stationId = $page.params.id;
  
  onMount(async () => {
    try {
      // Initialize MusicKit
      musicKit = await getMusicKitInstance();
      
      // Load station data
      const data = await loadStationData(stationId);
      station = data.station;
      playlist = data.playlist;
      
      // Connect to SignalR for real-time updates
      connection = await connectToStation(stationId);
      
      connection.on('SongAdded', (song: any) => {
        playlist = [...playlist, song];
      });
      
      connection.on('PlaylistChanged', (newPlaylist: any[]) => {
        playlist = newPlaylist;
      });
      
      // Setup Last.fm integration if MusicKit is available
      if (musicKit) {
        cleanupLastfm = setupLastfmIntegration(musicKit);
      }
    } catch (error) {
      console.error('Failed to initialize station player:', error);
    }
  });
  
  onDestroy(() => {
    if (connection) {
      connection.stop();
    }
    if (cleanupLastfm) {
      cleanupLastfm();
    }
  });
</script>

<div class="station-player">
  {#if station && musicKit}
    <PlayerHeader {station} />
    <ProgressControl {musicKit} />
    <PlayerControls {musicKit} />
    <Playlist {playlist} {musicKit} />
  {:else}
    <div class="loading">Loading station...</div>
  {/if}
</div>

<style>
  .station-player {
    padding: 20px;
    max-width: 1200px;
    margin: 0 auto;
  }
  
  .loading {
    text-align: center;
    padding: 40px;
    font-size: 18px;
  }
</style>
