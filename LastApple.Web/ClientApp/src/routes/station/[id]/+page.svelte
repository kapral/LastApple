<script lang="ts">
  import { page } from '$app/stores';
  import { appleStore } from '$lib/stores/apple';
  import { appStore } from '$lib/stores/app';
  import { AuthenticationState } from '$lib/types/authentication';
  import AppleUnauthenticatedWarning from '$lib/components/AppleUnauthenticatedWarning.svelte';
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

<div class="station-player-container">
  <h3>Now Playing: Station {stationId}</h3>
  <p>Station player component will be implemented in Phase 4 (Player Components migration)</p>
  <!-- StationPlayer component will be added here -->
</div>

<style>
  .station-player-container {
    padding: 20px;
  }
</style>
