<script lang="ts">
	// Minimal stub - implementation pending Phase 4
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
	
	let { track, isCurrent, isPlaying, groupOffset, index, onRemove, onTrackSwitch, addAlbumToLibrary, addToLibrary }: Props = $props();
</script>

<!-- Minimal placeholder - no behavior implemented -->
<div class="playlist-item">
	<!-- TODO: Implement track info, dropdown menu -->
</div>
