<script lang="ts">
	import 'bootstrap/dist/css/bootstrap.css';
	import '@fortawesome/fontawesome-free/js/all.js';
	import '../app.css';
	import Header from '$lib/components/Header.svelte';
	import Footer from '$lib/components/Footer.svelte';

	let { children } = $props();
</script>

<div class="app-layout" style="background-color: #222; color: #CCC; max-width: 900px; margin: 0 auto;">
	<Header />
	{@render children()}
	<Footer />
</div>
