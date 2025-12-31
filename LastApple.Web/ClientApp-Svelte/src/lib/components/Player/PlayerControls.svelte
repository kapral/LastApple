<script lang="ts">
	import { getImageUrl } from '$lib/utils/imageUtils';
	import PlayerHeader from './PlayerHeader.svelte';
	import ProgressControl from './ProgressControl.svelte';

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

	let artworkUrl = $derived(
		currentTrack?.attributes?.artwork?.url
			? getImageUrl(currentTrack.attributes.artwork.url)
			: 'default-album-cover.png'
	);
</script>

<div class="player-controls">
	<div class="art-container">
		{#if currentTrack}
			<PlayerHeader
				{currentTrack}
				{isScrobblingEnabled}
				{onScrobblingSwitch}
				{lastfmAuthenticated}
			/>
		{/if}
		<div class="album-art" style:background-image="url({artworkUrl})">
			<div class="controls-container">
				<div class="progress-row">
					<ProgressControl />
				</div>
				<button
					class="control-button"
					onclick={() => switchPrev()}
					aria-label="previous"
				>
					<svg viewBox="0 0 24 24" fill="currentColor" width="24" height="24">
						<path d="M6 6h2v12H6zm3.5 6l8.5 6V6z"/>
					</svg>
				</button>
				<button
					class="control-button"
					onclick={() => onPlayPause()}
					aria-label={isPlaying ? 'pause' : 'play'}
				>
					{#if isPlaying}
						<svg viewBox="0 0 24 24" fill="currentColor" width="24" height="24">
							<path d="M6 19h4V5H6v14zm8-14v14h4V5h-4z"/>
						</svg>
					{:else}
						<svg viewBox="0 0 24 24" fill="currentColor" width="24" height="24">
							<path d="M8 5v14l11-7z"/>
						</svg>
					{/if}
				</button>
				<button
					class="control-button"
					onclick={() => switchNext()}
					aria-label="next"
				>
					<svg viewBox="0 0 24 24" fill="currentColor" width="24" height="24">
						<path d="M6 18l8.5-6L6 6v12zM16 6v12h2V6h-2z"/>
					</svg>
				</button>
			</div>
		</div>
	</div>
</div>
