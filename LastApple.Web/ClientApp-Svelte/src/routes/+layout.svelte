<script lang="ts">
	import 'bootstrap/dist/css/bootstrap.css';
	import '@fortawesome/fontawesome-free/js/all.js';
	import '../app.css';
	import Header from '$lib/components/Header.svelte';
	import Footer from '$lib/components/Footer.svelte';
	import { browser } from '$app/environment';
	import { onMount } from 'svelte';
	import { checkLastfmLogin, handleLastfmCallback } from '$lib/services/lastfmAuthentication';
	import { checkAppleLogin } from '$lib/services/appleAuthentication';

	let { children } = $props();

	onMount(async () => {
		if (!browser) return;
		
		// Handle Last.fm OAuth callback if token is in URL
		await handleLastfmCallback();
		
		// Check auth status on startup
		await Promise.all([
			checkLastfmLogin(),
			checkAppleLogin()
		]);
	});
</script>

<div class="app-layout" style="background-color: #222; color: #CCC; max-width: 900px; margin: 0 auto;">
	<Header />
	{@render children()}
	<Footer />
</div>
