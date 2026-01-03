<script lang="ts">
	import { appleAuthStore } from '$lib/stores/appleAuth';
	import { lastfmAuthStore } from '$lib/stores/lastfmAuth';
	import { AuthenticationState } from '$lib/models/authenticationState';
	import { authorize, unauthorize } from '$lib/services/appleAuthentication';
	import { login, logout } from '$lib/services/lastfmAuthentication';
	import appleMusicLogo from '$lib/images/apple-music-logo.png';
	import lastfmLogo from '$lib/images/lastfm-logo.png';

	const rowStyles = 'flex: 1; display: flex; padding: 20px; align-items: center; border-bottom: 1px solid #333;';
	const logoStyles = 'height: 30px; margin-right: 15px;';

	let isAppleAuthenticated = $derived($appleAuthStore.state === AuthenticationState.Authenticated);
	let isLastfmAuthenticated = $derived($lastfmAuthStore.state === AuthenticationState.Authenticated);
	let isLoading = $derived(
		$appleAuthStore.state === AuthenticationState.Loading ||
		$lastfmAuthStore.state === AuthenticationState.Loading
	);

	async function toggleAppleAuthentication() {
		if (isAppleAuthenticated) {
			await unauthorize();
		} else {
			await authorize();
		}
	}

	async function toggleLastfmAuthentication() {
		if (isLastfmAuthenticated) {
			await logout();
		} else {
			await login();
		}
	}
</script>

<div data-testid="settings">
	{#if isLoading}
		<div style="display: flex; align-items: center; justify-content: center; height: 200px;">
			<div class="spinner-border" role="status">
				<span class="visually-hidden">Loading...</span>
			</div>
		</div>
	{:else}
		<div style="display: flex; flex-direction: column;">
			<div style="background: #0E0E0E; padding: 10px 25px;">Connected accounts</div>
			<div style={rowStyles}>
				<img style={logoStyles} src={appleMusicLogo} alt="Apple Music Logo" />
				<div style="flex: 1;">Apple Music</div>
				<label class="switch" aria-label="Toggle Apple Music connection">
					<input
						type="checkbox"
						checked={isAppleAuthenticated}
						onchange={toggleAppleAuthentication}
						role="switch"
						aria-checked={isAppleAuthenticated}
						aria-label="Apple Music"
					/>
					<span class="slider" class:checked={isAppleAuthenticated}></span>
				</label>
			</div>
			<div style={rowStyles}>
				<img style={logoStyles} src={lastfmLogo} alt="Last.fm Logo" />
				<div style="flex: 1;">Last.fm</div>
				<label class="switch" aria-label="Toggle Last.fm connection">
					<input
						type="checkbox"
						checked={isLastfmAuthenticated}
						onchange={toggleLastfmAuthentication}
						role="switch"
						aria-checked={isLastfmAuthenticated}
						aria-label="Last.fm"
					/>
					<span class="slider" class:checked={isLastfmAuthenticated}></span>
				</label>
			</div>
		</div>
	{/if}
</div>
