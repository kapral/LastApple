<script lang="ts">
	// Minimal stub - implementation pending Phase 4
	interface Props {
		currentTrack: MusicKit.MediaItem | undefined;
		isScrobblingEnabled: boolean;
		onScrobblingSwitch: (enabled: boolean) => void;
		lastfmAuthenticated: boolean;
	}
	
	let { currentTrack, isScrobblingEnabled, onScrobblingSwitch, lastfmAuthenticated }: Props = $props();
</script>

<!-- Minimal placeholder - no behavior implemented -->
<div class="player-header">
	<!-- TODO: Implement track info display, scrobble toggle -->
</div>
