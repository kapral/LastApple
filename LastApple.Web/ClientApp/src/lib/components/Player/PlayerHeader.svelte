<script lang="ts">
	interface Props {
		currentTrack: MusicKit.MediaItem | undefined;
		isScrobblingEnabled: boolean;
		onScrobblingSwitch: (enabled: boolean) => void;
		lastfmAuthenticated: boolean;
	}

	let { currentTrack, isScrobblingEnabled, onScrobblingSwitch, lastfmAuthenticated }: Props = $props();

	function handleToggle(e: Event) {
		const target = e.target as HTMLInputElement;
		onScrobblingSwitch(target.checked);
	}
</script>

<div class="player-header">
	<div class="scrobble-container">
		<div class="scrobble-label">Scrobble</div>
		<label class="switch">
			<input
				type="checkbox"
				role="switch"
				aria-label="scrobbling"
				checked={isScrobblingEnabled}
				disabled={!lastfmAuthenticated}
				onchange={handleToggle}
			/>
			<span class="slider" class:checked={isScrobblingEnabled}></span>
		</label>
	</div>
	{#if currentTrack?.attributes}
		<h5 class="track-name">{currentTrack.attributes.name}</h5>
		<h6 class="track-info">{currentTrack.attributes.artistName} - {currentTrack.attributes.albumName}</h6>
	{/if}
</div>
