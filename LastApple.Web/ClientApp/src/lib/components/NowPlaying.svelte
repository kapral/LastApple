<script lang="ts">
  import { appStore } from '$lib/stores/app';
  import { getMusicKitInstance } from '$lib/composables/musicKitPlayer';
  import { goto } from '$app/navigation';
  
  let currentTrack: any = null;
  let musicKit: MusicKit.MusicKitInstance | null = null;
  
  $: hasStation = $appStore.latestStationId !== undefined;
  
  async function init() {
    musicKit = await getMusicKitInstance();
    if (musicKit) {
      musicKit.addEventListener('mediaItemDidChange', updateTrack);
      updateTrack();
    }
  }
  
  function updateTrack() {
    if (musicKit) {
      currentTrack = musicKit.nowPlayingItem;
    }
  }
  
  function navigateToPlayer() {
    if ($appStore.latestStationId) {
      goto(`/station/${$appStore.latestStationId}`);
    }
  }
  
  init();
</script>

{#if hasStation && currentTrack}
  <div class="now-playing" on:click={navigateToPlayer} role="button" tabindex="0">
    {#if currentTrack.artwork}
      <img 
        src={currentTrack.artwork.url.replace('{w}', '50').replace('{h}', '50')} 
        alt="Album art"
        class="artwork"
      />
    {/if}
    <div class="track-info">
      <div class="track-title">{currentTrack.title || currentTrack.name}</div>
      <div class="track-artist">{currentTrack.artistName}</div>
    </div>
  </div>
{/if}

<style>
  .now-playing {
    display: flex;
    align-items: center;
    gap: 10px;
    padding: 10px;
    background: #2A2A2A;
    border-radius: 4px;
    cursor: pointer;
    transition: background 0.2s;
  }
  
  .now-playing:hover {
    background: #333;
  }
  
  .artwork {
    width: 50px;
    height: 50px;
    border-radius: 4px;
  }
  
  .track-info {
    flex: 1;
    min-width: 0;
  }
  
  .track-title {
    font-weight: bold;
    color: #FFF;
    white-space: nowrap;
    overflow: hidden;
    text-overflow: ellipsis;
  }
  
  .track-artist {
    font-size: 14px;
    color: #AAA;
    white-space: nowrap;
    overflow: hidden;
    text-overflow: ellipsis;
  }
</style>
