<script lang="ts">
	import { latestStationId } from '$lib/stores/app';
	import LastfmAvatar from './LastfmAvatar.svelte';
	import logo from '$lib/images/logo.png';
</script>

<div class="header" style="background: #000; padding: 10px 10px 0; padding-top: max(env(safe-area-inset-top), 10px);">
	<div style="display: flex; align-items: center;">
		<div style="flex: 1;"></div>
		<div class="title-container" style="flex: 5; display: flex; justify-content: center; align-items: center;">
			<img class="logo" src={logo} alt="logo" style="margin: 0 10px 3px 0;" />
			<h2 style="margin: 0; color: #DDD; text-align: center;">lastream</h2>
		</div>
		<div style="flex: 1; display: flex; justify-content: flex-end;">
			<LastfmAvatar />
		</div>
	</div>

	<div style="display: flex; align-items: center;">
		<a href="/" style="color: #DDD; padding: 10px; text-decoration: none; display: inline-block;">New station</a>
		{#if $latestStationId}
			<a href="/station/{$latestStationId}" style="color: #DDD; padding: 10px; text-decoration: none; display: inline-block;">Now playing</a>
		{/if}
		<a href="/settings" style="color: #DDD; padding: 10px; text-decoration: none; display: inline-block;">Settings</a>
	</div>
</div>
