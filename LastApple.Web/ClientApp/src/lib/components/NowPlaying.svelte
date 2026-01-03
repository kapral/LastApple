<script lang="ts">
    import StationPlayer from './Player/StationPlayer.svelte';
    import AppleUnauthenticatedWarning from './AppleUnauthenticatedWarning.svelte';
    import { appleUnauthenticatedWarning } from '$lib/stores/appleUnauthenticatedWarning';
    import { latestStationId } from '$lib/stores/app';

    interface Props {
        showPlayer: boolean;
        stationId: string;
    }

    let { showPlayer, stationId }: Props = $props();

    // Update latest station ID when stationId changes
    $effect(() => {
        if (stationId && stationId !== $latestStationId) {
            latestStationId.set(stationId);
        }
    });
</script>

<div class="now-playing" style:display={showPlayer ? 'block' : 'none'}>
    {#if $appleUnauthenticatedWarning}
        <AppleUnauthenticatedWarning />
    {/if}
    <StationPlayer {stationId} />
</div>
