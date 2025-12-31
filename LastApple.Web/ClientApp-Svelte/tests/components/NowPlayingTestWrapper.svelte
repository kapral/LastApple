<script lang="ts">
    // This wrapper is used for testing NowPlaying
    // It renders a simplified version without needing to mock complex child components

    let { showPlayer, stationId }: { showPlayer: boolean; stationId: string } = $props();
</script>

<div class="now-playing" style:display={showPlayer ? 'block' : 'none'}>
    <div data-testid="mock-station-player">{stationId}</div>
</div>
