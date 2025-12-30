<script lang="ts">
	// Placeholder - will be implemented in Phase 4
	import type { IStationParams } from '../IStationParams';
	
	interface Props extends IStationParams {}
	
	let { triggerCreate, onStationCreated, onOptionsChanged }: Props = $props();
	let selectedTag: { name: string } | null = $state(null);
	
	$effect(() => {
		onOptionsChanged(selectedTag !== null);
	});
	
	$effect(() => {
		if (triggerCreate && selectedTag) {
			// Create station
			onStationCreated('test-station-id');
		}
	});
	
	async function searchTags(query: string) {
		// Will use Last.fm API in Phase 4
		return [];
	}
	
	function handleChanged(results: any[]) {
		selectedTag = results.length > 0 ? results[0] : null;
	}
	
	export const Definition = {
		title: 'Tag',
		description: 'A station consisting of tracks related to a last.fm tag.',
		type: null as any
	};
</script>

<div class="station-parameters">
	<div data-testid="search-component">
		<input 
			data-testid="search-input"
			placeholder="indie..."
			class="form-control"
		/>
	</div>
</div>
