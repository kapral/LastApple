<script lang="ts">
	// Home page - ready for station list components
	const appName = 'LastApple';
	const framework = 'Svelte + SvelteKit';
</script>

<svelte:head>
	<title>Lastream - Music Station Generator</title>
</svelte:head>

<div class="home-container">
	<h1>Welcome to Lastream</h1>
	<p>Create personalized music stations powered by Last.fm and Apple Music.</p>
	
	<div class="migration-section">
		<h2>Migration Progress</h2>
		<p>✅ Phase 2: Project Setup - COMPLETE</p>
		<p>🔄 Phase 3: Core Infrastructure - IN PROGRESS</p>
		
		<h3>Phase 3 Status:</h3>
		<ul>
			<li>✅ Svelte stores created (app, apple, lastfm)</li>
			<li>✅ Utility functions migrated</li>
			<li>✅ Type definitions migrated</li>
			<li>✅ Header component created</li>
			<li>✅ Footer component created</li>
			<li>⏳ Station components pending</li>
		</ul>
	</div>
</div>

<style>
	.home-container {
		padding: 20px;
	}

	.migration-section {
		margin-top: 40px;
	}

	.migration-section h3 {
		margin-top: 30px;
	}
</style>
