<script lang="ts">
	// Placeholder - will be implemented in Phase 4
	interface Props {
		tracks: MusicKit.MediaItem[];
		currentTrack: MusicKit.MediaItem | undefined;
		isPlaying: boolean;
		offset: number;
		limit: number;
		showAlbumInfo: boolean;
		onRemove: (position: number, count: number) => void;
		onTrackSwitch: (index: number) => void;
	}
	
	let { 
		tracks, 
		currentTrack, 
		isPlaying,
		offset,
		limit,
		showAlbumInfo,
		onRemove,
		onTrackSwitch
	}: Props = $props();
	
	function addToLibrary(track: MusicKit.MediaItem) {
		// Will be implemented in Phase 4
	}
	
	function addAlbumToLibrary(track: MusicKit.MediaItem) {
		// Will be implemented in Phase 4
	}
</script>

{#if tracks.length > 0}
	<div class="playlist">
		{#if showAlbumInfo}
			<!-- Group tracks by album -->
			<div data-testid="playlist-track-group">
				<div data-testid="group-index">0</div>
				<div data-testid="group-track-count">{tracks.length}</div>
				<div data-testid="group-is-playing">{isPlaying ? 'playing' : 'not-playing'}</div>
			</div>
		{:else}
			{#each tracks.slice(offset, offset + limit) as track, index}
				<div data-testid="playlist-track">
					<div data-testid="track-name">{track.attributes?.name}</div>
					<div data-testid="is-current">{currentTrack?.id === track.id ? 'current' : 'not-current'}</div>
					<div data-testid="is-playing">{isPlaying && currentTrack?.id === track.id ? 'playing' : 'not-playing'}</div>
					<div data-testid="index">{offset + index}</div>
					<div data-testid="group-offset">0</div>
					<button onclick={() => onTrackSwitch(offset + index)}>Switch Track</button>
					<button onclick={() => addToLibrary(track)}>Add to Library</button>
					<button onclick={() => addAlbumToLibrary(track)}>Add Album</button>
					<button onclick={() => onRemove(offset + index, 1)}>Remove</button>
				</div>
			{/each}
		{/if}
	</div>
{/if}
