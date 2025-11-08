<script lang="ts">
	import { onMount } from 'svelte';
	import 'bootstrap/dist/css/bootstrap.css';
	import '@fortawesome/fontawesome-free/css/all.css';
	import '../app.css';

	// Initialize on mount
	onMount(() => {
		console.log('LastApple SvelteKit initialized');
	});
</script>

<slot />
