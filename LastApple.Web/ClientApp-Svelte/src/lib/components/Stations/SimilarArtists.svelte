<script lang="ts">
	// Minimal stub - implementation pending Phase 4
	import type { IStationParams } from '../IStationParams';
	
	interface Props extends IStationParams {}
	
	let { triggerCreate, onStationCreated, onOptionsChanged }: Props = $props();
	
	export const Definition = {
		title: 'Similar Artists',
		description: 'A station containing an artist and similar performers.',
		type: null as any
	};
</script>

<!-- Minimal placeholder - no behavior implemented -->
<div class="station-parameters">
	<!-- TODO: Implement Search with Last.fm API -->
</div>
