<script lang="ts">
	import { goto } from '$app/navigation';
	import { lastfmAuthStore } from '$lib/stores/lastfmAuth';
	import { AuthenticationState } from '$lib/models/authenticationState';
	import lastfmLogo from '$lib/images/lastfm-logo.png';

	function handleClick(event: MouseEvent) {
		if ($lastfmAuthStore.user) {
			return;
		}
		event.preventDefault();
		goto('/settings');
	}

	let avatarUrl = $derived($lastfmAuthStore.user?.avatar?.[0] ?? lastfmLogo);
	let profileUrl = $derived($lastfmAuthStore.user ? `https://www.last.fm/user/${$lastfmAuthStore.user.name}` : null);
	let displayName = $derived($lastfmAuthStore.user?.name ?? 'Log in');
</script>

<div class="lastfm-avatar" data-testid="lastfm-avatar">
	{#if $lastfmAuthStore.state === AuthenticationState.Loading}
		<div style="margin-right: 15px;">
			<div class="spinner-border" style="width: 20px; height: 20px;" role="status">
				<span class="visually-hidden">Loading...</span>
			</div>
		</div>
	{:else}
		<a
			style="color: #DDD; text-decoration: none; display: flex; flex-direction: column; align-items: center;"
			class="lastfm-profile"
			href={profileUrl}
			title="Open lastfm profile"
			target="_blank"
			rel="noopener noreferrer"
			onclick={handleClick}
		>
			<img alt="" style="border-radius: 20px;" src={avatarUrl} />
			<span>{displayName}</span>
		</a>
	{/if}
</div>
