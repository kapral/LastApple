<script lang="ts">
  import PlaylistTrack from './PlaylistTrack.svelte';
  
  export let playlist: any[];
  export let musicKit: MusicKit.MusicKitInstance | null;
  
  let currentTrackId: string | null = null;
  
  $: if (musicKit) {
    updateCurrentTrack();
  }
  
  function updateCurrentTrack() {
    if (!musicKit || !musicKit.nowPlayingItem) {
      currentTrackId = null;
      return;
    }
    currentTrackId = musicKit.nowPlayingItem.id;
  }
  
  async function playTrack(track: any) {
    if (!musicKit) return;
    
    try {
      await musicKit.setQueue({ songs: [track.id] });
      await musicKit.play();
      updateCurrentTrack();
    } catch (error) {
      console.error('Failed to play track:', error);
    }
  }
</script>

<div class="playlist">
  <h3>Playlist ({playlist.length} tracks)</h3>
  
  {#if playlist.length === 0}
    <div class="empty-state">
      <p>No tracks in playlist</p>
    </div>
  {:else}
    <div class="track-list">
      {#each playlist as track (track.id)}
        <PlaylistTrack 
          {track} 
          isPlaying={track.id === currentTrackId}
          on:click={() => playTrack(track)}
        />
      {/each}
    </div>
  {/if}
</div>

<style>
  .playlist {
    margin-top: 20px;
  }
  
  .playlist h3 {
    margin-bottom: 15px;
    color: #fff;
  }
  
  .track-list {
    max-height: 500px;
    overflow-y: auto;
    background-color: #222;
    border-radius: 8px;
    padding: 10px;
  }
  
  .empty-state {
    text-align: center;
    padding: 40px;
    color: #999;
  }
  
  .track-list::-webkit-scrollbar {
    width: 8px;
  }
  
  .track-list::-webkit-scrollbar-track {
    background: #333;
  }
  
  .track-list::-webkit-scrollbar-thumb {
    background: #555;
    border-radius: 4px;
  }
</style>
