<script lang="ts">
    import StationsList from '$lib/components/StationsList.svelte';
    import AppleUnauthenticatedWarning from '$lib/components/AppleUnauthenticatedWarning.svelte';
    import { appleAuthStore } from '$lib/stores/appleAuth';
    import { AuthenticationState } from '$lib/models/authenticationState';

    let showWarning = $derived($appleAuthStore.state === AuthenticationState.Unauthenticated);
</script>

<div data-testid="home">
    {#if showWarning}
        <AppleUnauthenticatedWarning />
    {/if}
    <div>
        <StationsList />
    </div>
</div>
