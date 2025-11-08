<script lang="ts">
	import { appStore } from '$lib/stores/app';
	
	// Subscribe to app store for latest station ID
	$: latestStationId = $appStore.latestStationId;
</script>

<div class="header">
	<div class="header-top">
		<div class="spacer"></div>
		<div class="title-container">
			<img class="logo" src="/logo.png" alt="logo" />
			<h2>lastream</h2>
		</div>
		<div class="avatar-container">
			<!-- LastfmAvatar placeholder -->
		</div>
	</div>

	<div class="nav-container">
		<a href="/" class="nav-link">New station</a>
		{#if latestStationId}
			<a href="/station/{latestStationId}" class="nav-link">Now playing</a>
		{/if}
		<a href="/settings" class="nav-link">Settings</a>
	</div>
</div>

<style>
	.header {
		background: #000;
		padding: 10px 10px 0;
		padding-top: max(env(safe-area-inset-top), 10px);
	}

	.header-top {
		display: flex;
		align-items: center;
	}

	.spacer {
		flex: 1;
	}

	.title-container {
		flex: 5;
		display: flex;
		justify-content: center;
		align-items: center;
	}

	.logo {
		margin: 0 10px 3px 0;
	}

	h2 {
		margin: 0;
		color: #DDD;
		text-align: center;
	}

	.avatar-container {
		flex: 1;
		display: flex;
		justify-content: flex-end;
	}

	.nav-container {
		display: flex;
		align-items: center;
	}

	.nav-link {
		color: #DDD;
		padding: 10px;
		text-decoration: none;
		display: inline-block;
	}

	.nav-link:hover {
		background: #222;
	}
</style>
