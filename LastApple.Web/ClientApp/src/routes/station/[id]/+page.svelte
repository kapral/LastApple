<script lang="ts">
  import { page } from '$app/stores';
  import { appleStore } from '$lib/stores/apple';
  import { appStore } from '$lib/stores/app';
  import { AuthenticationState } from '$lib/types/authentication';
  import AppleUnauthenticatedWarning from '$lib/components/AppleUnauthenticatedWarning.svelte';
  import StationPlayer from '$lib/components/Player/StationPlayer.svelte';
  import { onMount } from 'svelte';

  $: stationId = $page.params.id;
  $: showWarning = $appleStore.authenticationState === AuthenticationState.Unauthenticated;

  onMount(() => {
    if (stationId && stationId !== $appStore.latestStationId) {
      appStore.setLatestStationId(stationId);
    }
  });
</script>

{#if showWarning}
  <AppleUnauthenticatedWarning />
{/if}

<StationPlayer {stationId} />
