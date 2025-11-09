<script lang="ts">
  export let musicKit: MusicKit.MusicKitInstance | null;
  
  let currentTime = 0;
  let duration = 0;
  let isDragging = false;
  
  $: if (musicKit) {
    updateProgress();
    setupProgressListener();
  }
  
  function updateProgress() {
    if (!musicKit || !musicKit.nowPlayingItem) return;
    
    currentTime = musicKit.currentPlaybackTime || 0;
    duration = musicKit.currentPlaybackDuration || 0;
  }
  
  function setupProgressListener() {
    if (!musicKit) return;
    
    const interval = setInterval(() => {
      if (!isDragging) {
        updateProgress();
      }
    }, 1000);
    
    return () => clearInterval(interval);
  }
  
  function formatTime(seconds: number): string {
    if (!isFinite(seconds) || seconds < 0) return '0:00';
    
    const mins = Math.floor(seconds / 60);
    const secs = Math.floor(seconds % 60);
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  }
  
  function handleSeek(event: Event) {
    if (!musicKit) return;
    
    const target = event.target as HTMLInputElement;
    const newTime = parseFloat(target.value);
    musicKit.seekToTime(newTime);
    currentTime = newTime;
  }
  
  function handleMouseDown() {
    isDragging = true;
  }
  
  function handleMouseUp(event: Event) {
    isDragging = false;
    handleSeek(event);
  }
</script>

<div class="progress-control">
  <span class="time-current">{formatTime(currentTime)}</span>
  
  <input 
    type="range" 
    class="progress-bar"
    min="0" 
    max={duration} 
    step="0.1"
    value={currentTime}
    on:input={handleSeek}
    on:mousedown={handleMouseDown}
    on:mouseup={handleMouseUp}
    disabled={!musicKit || !duration}
  />
  
  <span class="time-duration">{formatTime(duration)}</span>
</div>

<style>
  .progress-control {
    display: flex;
    align-items: center;
    gap: 15px;
    padding: 10px 20px;
    background-color: #2a2a2a;
    border-radius: 8px;
    margin: 10px 0;
  }
  
  .time-current,
  .time-duration {
    color: #999;
    font-size: 14px;
    min-width: 45px;
    text-align: center;
  }
  
  .progress-bar {
    flex: 1;
    -webkit-appearance: none;
    appearance: none;
    height: 6px;
    background: #444;
    border-radius: 3px;
    outline: none;
  }
  
  .progress-bar::-webkit-slider-thumb {
    -webkit-appearance: none;
    appearance: none;
    width: 16px;
    height: 16px;
    background: #fff;
    border-radius: 50%;
    cursor: pointer;
    transition: background-color 0.2s;
  }
  
  .progress-bar::-webkit-slider-thumb:hover {
    background: #1db954;
  }
  
  .progress-bar::-moz-range-thumb {
    width: 16px;
    height: 16px;
    background: #fff;
    border-radius: 50%;
    cursor: pointer;
    border: none;
    transition: background-color 0.2s;
  }
  
  .progress-bar::-moz-range-thumb:hover {
    background: #1db954;
  }
  
  .progress-bar:disabled {
    opacity: 0.5;
    cursor: not-allowed;
  }
</style>
