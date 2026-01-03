<script lang="ts" module>
	import type { IStationDefinition } from '$lib/models/stationDefinition';

	export const Definition: IStationDefinition = {
		title: 'Tag',
		description: 'A station consisting of tracks related to a last.fm tag.',
		type: null as any
	};
</script>

<script lang="ts">
	import type { IStationParams } from '$lib/models/stationParams';
	import stationApi from '$lib/api/stationApi';

	interface Props extends IStationParams {}

	let { triggerCreate, onStationCreated, onOptionsChanged }: Props = $props();

	let tagName = $state<string | null>(null);

	// Call onOptionsChanged based on tag input
	$effect(() => {
		onOptionsChanged(!!tagName);
	});

	// Handle station creation when triggerCreate becomes true
	$effect(() => {
		if (triggerCreate && tagName) {
			createStation();
		}
	});

	async function createStation() {
		const station = await stationApi.postStation('tags', tagName);
		onStationCreated(station.id);
	}

	function handleChanged(event: Event) {
		const target = event.target as HTMLInputElement;
		const value = target.value.trim();
		tagName = value || null;
	}
</script>

<div class="station-parameters">
	<input
		style="width: 100%; padding: 6px 12px; border-width: 1px;"
		placeholder="Rock..."
		type="text"
		oninput={handleChanged}
	/>
</div>
