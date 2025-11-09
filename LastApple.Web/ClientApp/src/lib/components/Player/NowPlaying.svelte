<script lang="ts">
  import { onMount, onDestroy } from 'svelte';
  import { getMusicKitInstance } from '$lib/composables/musicKitPlayer';
  
  let musicKit: MusicKit.MusicKitInstance | null = null;
  let currentTrack: any = null;
  let updateInterval: ReturnType<typeof setInterval> | null = null;
  
  function updateNowPlaying() {
    if (musicKit && musicKit.nowPlayingItem) {
      currentTrack = musicKit.nowPlayingItem;
    } else {
      currentTrack = null;
    }
  }
  
  onMount(async () => {
    musicKit = await getMusicKitInstance();
    
    if (musicKit) {
      musicKit.addEventListener('mediaItemDidChange', updateNowPlaying);
      updateNowPlaying();
    }
    
    updateInterval = setInterval(updateNowPlaying, 1000);
  });
  
  onDestroy(() => {
    if (updateInterval) {
      clearInterval(updateInterval);
    }
    
    if (musicKit) {
      musicKit.removeEventListener('mediaItemDidChange', updateNowPlaying);
    }
  });
</script>

{#if currentTrack}
  <div class="now-playing">
    <div class="now-playing-artwork">
      {#if currentTrack.artwork?.url}
        <img 
          src={currentTrack.artwork.url.replace('{w}', '50').replace('{h}', '50')} 
          alt={currentTrack.title} 
        />
      {:else}
        <div class="artwork-placeholder">
          <i class="fas fa-music"></i>
        </div>
      {/if}
    </div>
    
    <div class="now-playing-info">
      <div class="track-title">{currentTrack.title || 'Unknown Track'}</div>
      <div class="track-artist">{currentTrack.artistName || 'Unknown Artist'}</div>
    </div>
  </div>
{/if}

<style>
  .now-playing {
    display: flex;
    align-items: center;
    gap: 10px;
    padding: 10px;
    background-color: #2a2a2a;
    border-radius: 4px;
  }
  
  .now-playing-artwork {
    width: 50px;
    height: 50px;
    flex-shrink: 0;
  }
  
  .now-playing-artwork img {
    width: 100%;
    height: 100%;
    border-radius: 4px;
    object-fit: cover;
  }
  
  .artwork-placeholder {
    width: 100%;
    height: 100%;
    background-color: #3a3a3a;
    border-radius: 4px;
    display: flex;
    align-items: center;
    justify-content: center;
    color: #888;
  }
  
  .now-playing-info {
    flex: 1;
    min-width: 0;
  }
  
  .track-title {
    font-weight: 500;
    white-space: nowrap;
    overflow: hidden;
    text-overflow: ellipsis;
    margin-bottom: 4px;
  }
  
  .track-artist {
    color: #888;
    font-size: 14px;
    white-space: nowrap;
    overflow: hidden;
    text-overflow: ellipsis;
  }
</style>
