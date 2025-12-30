<script lang="ts">
	// Placeholder - will be implemented in Phase 4
	interface Props {
		currentTrack: MusicKit.MediaItem | undefined;
		isPlaying: boolean;
		switchPrev: () => void;
		switchNext: () => void;
		onPlayPause: () => void;
		isScrobblingEnabled: boolean;
		onScrobblingSwitch: (enabled: boolean) => void;
		lastfmAuthenticated: boolean;
	}
	
	let { 
		currentTrack, 
		isPlaying, 
		switchPrev, 
		switchNext, 
		onPlayPause,
		isScrobblingEnabled,
		onScrobblingSwitch,
		lastfmAuthenticated 
	}: Props = $props();
</script>

<div class="player-controls">
	{#if currentTrack}
		<div data-testid="player-header">
			<div data-testid="track-name">{currentTrack.attributes?.name}</div>
			<div data-testid="scrobbling-enabled">{isScrobblingEnabled ? 'enabled' : 'disabled'}</div>
			<div data-testid="lastfm-authenticated">{lastfmAuthenticated ? 'auth' : 'no-auth'}</div>
		</div>
	{/if}
	
	<div class="control-buttons" style="display: flex; justify-content: center; gap: 20px;">
		<button data-testid="prev-button" onclick={switchPrev} aria-label="Previous">
			<i class="fa-solid fa-step-backward" data-testid="fontawesome-icon" data-icon="step-backward"></i>
		</button>
		<button data-testid="play-pause-button" onclick={onPlayPause} aria-label={isPlaying ? 'Pause' : 'Play'}>
			<i class="fa-solid {isPlaying ? 'fa-pause' : 'fa-play'}" data-testid="fontawesome-icon" data-icon={isPlaying ? 'pause' : 'play'}></i>
		</button>
		<button data-testid="next-button" onclick={switchNext} aria-label="Next">
			<i class="fa-solid fa-step-forward" data-testid="fontawesome-icon" data-icon="step-forward"></i>
		</button>
	</div>
	
	<div data-testid="progress-control">Progress Control</div>
</div>
