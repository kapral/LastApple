<script lang="ts">
  export let station: any;
  
  $: currentArtwork = station?.currentTrack?.artwork?.url || station?.artwork?.url;
  $: artworkUrl = currentArtwork ? currentArtwork.replace('{w}', '300').replace('{h}', '300') : null;
</script>

<div class="player-header">
  <div class="artwork-large">
    {#if artworkUrl}
      <img src={artworkUrl} alt={station?.name || 'Station'} />
    {:else}
      <div class="artwork-placeholder">
        <i class="fas fa-music"></i>
      </div>
    {/if}
  </div>
  
  <div class="station-info">
    <h1 class="station-name">{station?.name || 'Loading...'}</h1>
    {#if station?.description}
      <p class="station-description">{station.description}</p>
    {/if}
    
    {#if station?.currentTrack}
      <div class="current-track">
        <div class="track-title">{station.currentTrack.name}</div>
        <div class="track-details">
          {station.currentTrack.artistName}
          {#if station.currentTrack.albumName}
            · {station.currentTrack.albumName}
          {/if}
        </div>
      </div>
    {/if}
  </div>
</div>

<style>
  .player-header {
    display: flex;
    gap: 30px;
    margin-bottom: 30px;
    padding: 20px;
    background: linear-gradient(180deg, #2a2a2a 0%, #1a1a1a 100%);
    border-radius: 8px;
  }
  
  .artwork-large {
    width: 300px;
    height: 300px;
    flex-shrink: 0;
  }
  
  .artwork-large img {
    width: 100%;
    height: 100%;
    border-radius: 8px;
    box-shadow: 0 8px 24px rgba(0, 0, 0, 0.5);
  }
  
  .artwork-placeholder {
    width: 100%;
    height: 100%;
    background-color: #333;
    border-radius: 8px;
    display: flex;
    align-items: center;
    justify-content: center;
    color: #666;
    font-size: 80px;
  }
  
  .station-info {
    flex: 1;
    display: flex;
    flex-direction: column;
    justify-content: center;
  }
  
  .station-name {
    font-size: 48px;
    font-weight: bold;
    color: #fff;
    margin: 0 0 10px 0;
  }
  
  .station-description {
    font-size: 18px;
    color: #999;
    margin: 0 0 20px 0;
  }
  
  .current-track {
    margin-top: 20px;
    padding-top: 20px;
    border-top: 1px solid #333;
  }
  
  .track-title {
    font-size: 24px;
    font-weight: 600;
    color: #fff;
    margin-bottom: 5px;
  }
  
  .track-details {
    font-size: 16px;
    color: #999;
  }
</style>
