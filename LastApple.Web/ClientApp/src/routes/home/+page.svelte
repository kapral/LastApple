<script lang="ts">
  import AppleUnauthenticatedWarning from '$lib/components/AppleUnauthenticatedWarning.svelte';
  import StationsList from '$lib/components/StationsList.svelte';
  import { appleStore } from '$lib/stores/apple';
  import { AuthenticationState } from '$lib/types/authentication';

  $: showWarning = $appleStore.authenticationState === AuthenticationState.Unauthenticated;
</script>

{#if showWarning}
  <AppleUnauthenticatedWarning />
{/if}

<div>
  <StationsList />
</div>
