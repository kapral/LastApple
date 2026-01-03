<script lang="ts">
	// Placeholder - will be implemented in Phase 4
	import { appleAuthStore } from '$lib/stores/appleAuth';
	import { AuthenticationState } from '$lib/models/authenticationState';

	// Reactive variable for showing warning
	let showWarning = $derived($appleAuthStore.state === AuthenticationState.Unauthenticated);
</script>

<div>
	{#if showWarning}
		<div data-testid="apple-warning" class="alert alert-warning">
			Please authenticate with Apple Music
		</div>
	{/if}
	<div data-testid="stations-list">StationsList</div>
</div>
