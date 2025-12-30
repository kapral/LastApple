<script lang="ts">
	// Placeholder - will be implemented in Phase 4
	import { appleAuthStore } from '$lib/stores/appleAuth';
	import { lastfmAuthStore } from '$lib/stores/lastfmAuth';
	import { AuthenticationState } from '$lib/services/authentication';
	
	let appleAuth = $derived($appleAuthStore);
	let lastfmAuth = $derived($lastfmAuthStore);
	
	let isLoading = $derived(
		appleAuth.state === AuthenticationState.Loading || 
		lastfmAuth.state === AuthenticationState.Loading
	);
	
	function handleAppleLogin() {
		// Will be implemented in Phase 4
	}
	
	function handleAppleLogout() {
		// Will be implemented in Phase 4
	}
	
	function handleLastfmLogin() {
		// Will be implemented in Phase 4
	}
	
	function handleLastfmLogout() {
		// Will be implemented in Phase 4
	}
</script>

<div class="settings" style="padding: 20px;">
	<h3>Settings</h3>
	
	{#if isLoading}
		<div class="spinner-border" role="status">
			<span class="visually-hidden">Loading...</span>
		</div>
	{:else}
		<div class="setting-section">
			<h4>Apple Music</h4>
			<img src="/apple-music-logo.png" alt="Apple Music" style="height: 40px;" />
			{#if appleAuth.state === AuthenticationState.Authenticated}
				<button class="btn btn-black" onclick={handleAppleLogout}>Disconnect</button>
			{:else}
				<button class="btn btn-black" onclick={handleAppleLogin}>Connect</button>
			{/if}
		</div>
		
		<div class="setting-section">
			<h4>Last.fm</h4>
			<img src="/lastfm-logo.png" alt="Last.fm" style="height: 40px;" />
			{#if lastfmAuth.state === AuthenticationState.Authenticated}
				<button class="btn btn-black" onclick={handleLastfmLogout}>Disconnect</button>
			{:else}
				<button class="btn btn-black" onclick={handleLastfmLogin}>Connect</button>
			{/if}
		</div>
	{/if}
</div>
