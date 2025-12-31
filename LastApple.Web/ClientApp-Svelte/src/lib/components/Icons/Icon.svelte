<script lang="ts">
	interface Props {
		name: 'play' | 'pause' | 'step-backward' | 'step-forward' | 'ellipsis-h' | 'plus-square' | 'folder-plus' | 'trash-alt';
		size?: number;
	}

	let { name, size = 16 }: Props = $props();

	// todo: check for possibility to use fontawesome icons directly
	const icons: Record<string, string> = {
		'play': 'M8 5v14l11-7z',
		'pause': 'M6 19h4V5H6v14zm8-14v14h4V5h-4z',
		'step-backward': 'M6 6h2v12H6zm3.5 6l8.5 6V6z',
		'step-forward': 'M6 18l8.5-6L6 6v12zM16 6v12h2V6h-2z',
		'ellipsis-h': 'M6 10c-1.1 0-2 .9-2 2s.9 2 2 2 2-.9 2-2-.9-2-2-2zm12 0c-1.1 0-2 .9-2 2s.9 2 2 2 2-.9 2-2-.9-2-2-2zm-6 0c-1.1 0-2 .9-2 2s.9 2 2 2 2-.9 2-2-.9-2-2-2z',
		'plus-square': 'M19 3H5c-1.11 0-2 .9-2 2v14c0 1.1.89 2 2 2h14c1.1 0 2-.9 2-2V5c0-1.1-.9-2-2-2zm-2 10h-4v4h-2v-4H7v-2h4V7h2v4h4v2z',
		'folder-plus': 'M20 6h-8l-2-2H4c-1.1 0-1.99.9-1.99 2L2 18c0 1.1.9 2 2 2h16c1.1 0 2-.9 2-2V8c0-1.1-.9-2-2-2zm-1 8h-3v3h-2v-3h-3v-2h3V9h2v3h3v2z',
		'trash-alt': 'M6 19c0 1.1.9 2 2 2h8c1.1 0 2-.9 2-2V7H6v12zM19 4h-3.5l-1-1h-5l-1 1H5v2h14V4z'
	};
</script>

<svg viewBox="0 0 24 24" fill="currentColor" width={size} height={size} class="icon icon-{name}">
	<path d={icons[name]} />
</svg>
