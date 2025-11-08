<script lang="ts">
	import { lastfmStore } from '$lib/stores/lastfm';
	import { AuthenticationState } from '$lib/types/authentication';
	import { goto } from '$app/navigation';
	
	// Subscribe to lastfm store
	$: authState = $lastfmStore.authenticationState;
	$: user = $lastfmStore.user;
	
	function handleClick(event: MouseEvent) {
		if (user !== undefined) {
			return; // Allow default link behavior
		}
		
		event.preventDefault();
		goto('/settings');
	}
</script>

{#if authState === AuthenticationState.Loading}
	<div class="spinner-container">
		<div class="spinner-border" role="status" style="width: 20px; height: 20px;">
			<span class="visually-hidden">Loading...</span>
		</div>
	</div>
{:else}
	<div>
		<a 
			class="lastfm-profile"
			href={user ? `https://www.last.fm/user/${user.name}` : '#'}
			title="Open lastfm profile"
			target="_blank"
			rel="noopener noreferrer"
			on:click={handleClick}
		>
			<img 
				alt={user?.name ?? 'Last.fm'} 
				src={user?.avatar[0] ?? '/lastfm-logo.png'} 
			/>
			<span>{user?.name ?? 'Log in'}</span>
		</a>
	</div>
{/if}

<style>
	.spinner-container {
		margin-right: 15px;
	}

	.lastfm-profile {
		color: #DDD;
		text-decoration: none;
		display: flex;
		flex-direction: column;
		align-items: center;
	}

	.lastfm-profile img {
		border-radius: 20px;
	}
</style>
