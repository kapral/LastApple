<script lang="ts">
	// Minimal stub - implementation pending Phase 4
	import type { IStationParams } from '../IStationParams';
	
	interface Props extends IStationParams {}
	
	let { triggerCreate, onStationCreated, onOptionsChanged }: Props = $props();
	
	export const Definition = {
		title: 'Artist',
		description: 'Play all tracks of one artist.',
		type: null as any
	};
</script>

<!-- Minimal placeholder - no behavior implemented -->
<div class="station-parameters">
	<!-- TODO: Implement Search with Apple Music API -->
</div>
