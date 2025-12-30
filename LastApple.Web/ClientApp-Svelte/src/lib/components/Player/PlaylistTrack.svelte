<script lang="ts">
	// Placeholder - will be implemented in Phase 4
	interface Props {
		track: MusicKit.MediaItem;
		isCurrent: boolean;
		isPlaying: boolean;
		groupOffset: number;
		index: number;
		onRemove: (position: number, count: number) => void;
		onTrackSwitch: (index: number) => void;
		addAlbumToLibrary: (track: MusicKit.MediaItem) => void;
		addToLibrary: (track: MusicKit.MediaItem) => void;
	}
	
	let { 
		track, 
		isCurrent, 
		isPlaying,
		groupOffset,
		index,
		onRemove,
		onTrackSwitch,
		addAlbumToLibrary,
		addToLibrary
	}: Props = $props();
</script>

<div 
	class="playlist-item" 
	class:current={isCurrent}
	ondblclick={() => onTrackSwitch(groupOffset + index)}
>
	<div class="track-info">
		<span class="track-name" data-testid="track-name">{track.attributes?.name}</span>
		<span class="artist-name" data-testid="artist-name">{track.attributes?.artistName}</span>
	</div>
	
	<div data-testid="dropdown">
		<div data-testid="dropdown-toggle">
			<i class="fa-solid fa-ellipsis-v" data-testid="fontawesome-icon" data-icon="ellipsis-v"></i>
		</div>
		<div data-testid="dropdown-menu">
			<div data-testid="dropdown-item" onclick={() => addToLibrary(track)}>Add to Library</div>
			<div data-testid="dropdown-item" onclick={() => addAlbumToLibrary(track)}>Add Album to Library</div>
			<div data-testid="dropdown-item" onclick={() => onRemove(groupOffset + index, 1)}>Remove</div>
		</div>
	</div>
</div>
