<script lang="ts">
	import { onMount } from 'svelte';
	import 'bootstrap/dist/css/bootstrap.css';
	import '@fortawesome/fontawesome-free/css/all.css';
	import '../app.css';
	import Header from '$lib/components/Header.svelte';
	import Footer from '$lib/components/Footer.svelte';

	// Initialize on mount
	onMount(() => {
		console.log('LastApple SvelteKit initialized');
	});
</script>

<div style="background-color: #222; color: #CCC; max-width: 900px; margin: 0 auto;">
	<Header />
	<slot />
	<Footer />
</div>
