<script lang="ts">
	import { appStore } from '$lib/stores/app';
	
	// Subscribe to app store for latest station ID
	$: latestStationId = $appStore.latestStationId;
	
	const navLinkStyle = "color: #DDD; padding: 10px; text-decoration: none; display: inline-block;";
	const titleStyles = "margin: 0; color: #DDD; text-align: center;";
	const headerStyles = "background: #000; padding: 10px 10px 0; padding-top: max(env(safe-area-inset-top), 10px);";
</script>

<div class="header" style={headerStyles}>
	<div style="display: flex; align-items: center;">
		<div style="flex: 1;"></div>
		<div class="title-container" style="flex: 5; display: flex; justify-content: center; align-items: center;">
			<img class="logo" src="/logo.png" alt="logo" style="margin: 0 10px 3px 0;" />
			<h2 style={titleStyles}>lastream</h2>
		</div>
		<div style="flex: 1; display: flex; justify-content: flex-end;">
			<!-- LastfmAvatar placeholder -->
		</div>
	</div>

	<div style="display: flex; align-items: center;">
		<a href="/" class="nav-link" style={navLinkStyle}>New station</a>
		{#if latestStationId}
			<a href="/station/{latestStationId}" class="nav-link" style={navLinkStyle}>Now playing</a>
		{/if}
		<a href="/settings" class="nav-link" style={navLinkStyle}>Settings</a>
	</div>
</div>

<style>
	.nav-link:hover {
		background: #222;
	}
</style>
