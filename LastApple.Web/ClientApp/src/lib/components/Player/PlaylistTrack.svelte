<script lang="ts">
  import { createEventDispatcher } from 'svelte';
  
  export let track: any;
  export let isPlaying = false;
  
  const dispatch = createEventDispatcher();
  
  function formatDuration(ms: number): string {
    const seconds = Math.floor(ms / 1000);
    const minutes = Math.floor(seconds / 60);
    const remainingSeconds = seconds % 60;
    return `${minutes}:${remainingSeconds.toString().padStart(2, '0')}`;
  }
  
  function handleClick() {
    dispatch('click');
  }
</script>

<div class="playlist-track" class:playing={isPlaying} on:click={handleClick} on:keypress={handleClick} role="button" tabindex="0">
  <div class="artwork">
    {#if track.artwork}
      <img src={track.artwork.url.replace('{w}', '50').replace('{h}', '50')} alt={track.name} />
    {:else}
      <div class="artwork-placeholder">
        <i class="fas fa-music"></i>
      </div>
    {/if}
    {#if isPlaying}
      <div class="playing-indicator">
        <i class="fas fa-volume-up"></i>
      </div>
    {/if}
  </div>
  
  <div class="track-info">
    <div class="track-name">{track.name}</div>
    <div class="track-artist">{track.artistName}</div>
  </div>
  
  <div class="track-album">{track.albumName || ''}</div>
  
  <div class="track-duration">{formatDuration(track.durationInMillis)}</div>
</div>

<style>
  .playlist-track {
    display: flex;
    align-items: center;
    padding: 10px;
    border-radius: 4px;
    cursor: pointer;
    transition: background-color 0.2s;
    gap: 15px;
  }
  
  .playlist-track:hover {
    background-color: #333;
  }
  
  .playlist-track.playing {
    background-color: #2a4a2a;
  }
  
  .artwork {
    position: relative;
    width: 50px;
    height: 50px;
    flex-shrink: 0;
  }
  
  .artwork img {
    width: 100%;
    height: 100%;
    border-radius: 4px;
  }
  
  .artwork-placeholder {
    width: 100%;
    height: 100%;
    background-color: #444;
    border-radius: 4px;
    display: flex;
    align-items: center;
    justify-content: center;
    color: #999;
  }
  
  .playing-indicator {
    position: absolute;
    bottom: 5px;
    right: 5px;
    background-color: rgba(0, 0, 0, 0.7);
    border-radius: 50%;
    width: 20px;
    height: 20px;
    display: flex;
    align-items: center;
    justify-content: center;
    color: #1db954;
    font-size: 10px;
  }
  
  .track-info {
    flex: 1;
    min-width: 0;
  }
  
  .track-name {
    color: #fff;
    font-weight: 500;
    overflow: hidden;
    text-overflow: ellipsis;
    white-space: nowrap;
  }
  
  .track-artist {
    color: #999;
    font-size: 14px;
    overflow: hidden;
    text-overflow: ellipsis;
    white-space: nowrap;
  }
  
  .track-album {
    flex: 1;
    color: #999;
    font-size: 14px;
    overflow: hidden;
    text-overflow: ellipsis;
    white-space: nowrap;
  }
  
  .track-duration {
    color: #999;
    font-size: 14px;
    margin-left: 10px;
  }
</style>
