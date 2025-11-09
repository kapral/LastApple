<script lang="ts">
  export let musicKit: MusicKit.MusicKitInstance | null;
  
  let isPlaying = false;
  let isShuffleMode = false;
  let volume = 0.5;
  
  $: if (musicKit) {
    updatePlaybackState();
  }
  
  function updatePlaybackState() {
    if (!musicKit) return;
    isPlaying = musicKit.playbackState === MusicKit.PlaybackStates.playing;
    isShuffleMode = musicKit.shuffleMode === 1;
  }
  
  async function togglePlay() {
    if (!musicKit) return;
    
    if (isPlaying) {
      await musicKit.pause();
    } else {
      await musicKit.play();
    }
    updatePlaybackState();
  }
  
  async function skipForward() {
    if (!musicKit) return;
    await musicKit.skipToNextItem();
  }
  
  async function skipBackward() {
    if (!musicKit) return;
    await musicKit.skipToPreviousItem();
  }
  
  function toggleShuffle() {
    if (!musicKit) return;
    musicKit.shuffleMode = isShuffleMode ? 0 : 1;
    isShuffleMode = !isShuffleMode;
  }
  
  function handleVolumeChange(event: Event) {
    if (!musicKit) return;
    const target = event.target as HTMLInputElement;
    volume = parseFloat(target.value);
    musicKit.volume = volume;
  }
</script>

<div class="player-controls">
  <button class="control-btn" on:click={skipBackward} disabled={!musicKit}>
    <i class="fas fa-step-backward"></i>
  </button>
  
  <button class="control-btn play-pause" on:click={togglePlay} disabled={!musicKit}>
    {#if isPlaying}
      <i class="fas fa-pause"></i>
    {:else}
      <i class="fas fa-play"></i>
    {/if}
  </button>
  
  <button class="control-btn" on:click={skipForward} disabled={!musicKit}>
    <i class="fas fa-step-forward"></i>
  </button>
  
  <button class="control-btn" on:click={toggleShuffle} class:active={isShuffleMode} disabled={!musicKit}>
    <i class="fas fa-random"></i>
  </button>
  
  <div class="volume-control">
    <i class="fas fa-volume-up"></i>
    <input 
      type="range" 
      min="0" 
      max="1" 
      step="0.01" 
      value={volume}
      on:input={handleVolumeChange}
      disabled={!musicKit}
    />
  </div>
</div>

<style>
  .player-controls {
    display: flex;
    align-items: center;
    justify-content: center;
    gap: 15px;
    padding: 20px;
    background-color: #333;
    border-radius: 8px;
    margin: 20px 0;
  }
  
  .control-btn {
    background: none;
    border: none;
    color: #fff;
    font-size: 24px;
    cursor: pointer;
    padding: 10px 15px;
    border-radius: 50%;
    transition: background-color 0.2s;
  }
  
  .control-btn:hover:not(:disabled) {
    background-color: #444;
  }
  
  .control-btn:disabled {
    opacity: 0.5;
    cursor: not-allowed;
  }
  
  .control-btn.active {
    color: #1db954;
  }
  
  .play-pause {
    font-size: 32px;
    padding: 15px 20px;
  }
  
  .volume-control {
    display: flex;
    align-items: center;
    gap: 10px;
    margin-left: 20px;
  }
  
  .volume-control i {
    color: #fff;
  }
  
  .volume-control input {
    width: 100px;
  }
</style>
