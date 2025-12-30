<script lang="ts">
	// Minimal stub - implementation pending Phase 4
	import type { IStationParams } from '../IStationParams';
	
	interface Props extends IStationParams {}
	
	let { triggerCreate, onStationCreated, onOptionsChanged }: Props = $props();
	
	export const Definition = {
		title: 'Tag',
		description: 'A station consisting of tracks related to a last.fm tag.',
		type: null as any
	};
</script>

<!-- Minimal placeholder - no behavior implemented -->
<div class="station-parameters">
	<!-- TODO: Implement Search with Last.fm tag API -->
</div>
