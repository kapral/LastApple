<script lang="ts">
	// Placeholder - will be implemented in Phase 4
	import type { Snippet } from 'svelte';
	
	interface Props {
		children: Snippet;
	}
	
	let { children }: Props = $props();
</script>

<div style="background-color: #222; color: #CCC; max-width: 900px; margin: 0 auto;">
	<!-- Header placeholder -->
	<div data-testid="header">Header</div>
	{@render children()}
	<!-- Footer placeholder -->
	<div data-testid="footer">Footer</div>
</div>
