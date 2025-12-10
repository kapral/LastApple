<script lang="ts">
	export const ssr = false;
	import { onMount } from 'svelte';
	import 'bootstrap/dist/css/bootstrap.css';
	import '@fortawesome/fontawesome-free/css/all.css';
	import '../app.css';
	import Header from '$lib/components/Header.svelte';
	import Footer from '$lib/components/Footer.svelte';
	import { checkAppleAuthentication } from '$lib/services/AppleAuthService';
	import { checkLastfmAuthentication } from '$lib/services/LastfmAuthService';

	// Initialize on mount - check authentication on startup
	onMount(async () => {
		console.log('LastApple SvelteKit initialized');
		// Check Apple Music authentication status on startup
		await checkAppleAuthentication();
		// Check Last.fm authentication status on startup
		await checkLastfmAuthentication();
	});
</script>

<div class="layout-container">
	<Header />
	<slot />
	<Footer />
</div>

<style>
	.layout-container {
		background-color: #222;
		color: #CCC;
		max-width: 900px;
		margin: 0 auto;
	}
</style>
