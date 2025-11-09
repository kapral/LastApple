<script lang="ts">
  import PlaylistTrack from './PlaylistTrack.svelte';
  
  export let groupName: string;
  export let tracks: any[];
  export let isPlaying: (trackId: string) => boolean;
  
  let isExpanded = true;
  
  function toggleExpanded() {
    isExpanded = !isExpanded;
  }
</script>

<div class="playlist-track-group">
  <div class="group-header" on:click={toggleExpanded} on:keypress={toggleExpanded} role="button" tabindex="0">
    <i class="fas {isExpanded ? 'fa-chevron-down' : 'fa-chevron-right'}"></i>
    <span class="group-name">{groupName}</span>
    <span class="track-count">{tracks.length} tracks</span>
  </div>
  
  {#if isExpanded}
    <div class="group-tracks">
      {#each tracks as track (track.id)}
        <PlaylistTrack 
          {track} 
          isPlaying={isPlaying(track.id)}
          on:click
        />
      {/each}
    </div>
  {/if}
</div>

<style>
  .playlist-track-group {
    margin-bottom: 10px;
  }
  
  .group-header {
    display: flex;
    align-items: center;
    gap: 10px;
    padding: 10px;
    background-color: #2a2a2a;
    border-radius: 4px;
    cursor: pointer;
    transition: background-color 0.2s;
  }
  
  .group-header:hover {
    background-color: #333;
  }
  
  .group-header i {
    color: #999;
    font-size: 12px;
  }
  
  .group-name {
    flex: 1;
    color: #fff;
    font-weight: 600;
  }
  
  .track-count {
    color: #999;
    font-size: 14px;
  }
  
  .group-tracks {
    padding-left: 20px;
    margin-top: 5px;
  }
</style>
