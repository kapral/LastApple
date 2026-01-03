<script lang="ts" module>
	import type { IStationDefinition } from '$lib/models/stationDefinition';

	export const Definition: IStationDefinition = {
		title: 'My last.fm Library',
		description: 'A continuous station based on your last.fm library.',
		type: null as any
	};
</script>

<script lang="ts">
	import type { IStationParams } from '$lib/models/stationParams';
	import { lastfmAuthStore } from '$lib/stores/lastfmAuth';
	import { AuthenticationState } from '$lib/models/authenticationState';
	import stationApi from '$lib/api/stationApi';

	interface Props extends IStationParams {}

	let { triggerCreate, onStationCreated, onOptionsChanged }: Props = $props();

	$effect(() => {
		onOptionsChanged($lastfmAuthStore.state === AuthenticationState.Authenticated);
	});

	$effect(() => {
		if (triggerCreate) {
			createStation();
		}
	});

	async function createStation() {
		const station = await stationApi.postStation('lastfmlibrary', 'my');
		onStationCreated(station.id);
	}

	let showWarning = $derived($lastfmAuthStore.state === AuthenticationState.Unauthenticated);
</script>

<div class="station-parameters" style="display: flex; flex: 1;">
	{#if showWarning}
		<div style="margin: 10px 10px 10px 0; color: #ffc123;">
			Log in to last.fm to listen to your library.
		</div>
	{/if}
	<div style="flex: 1; height: 54px;"></div>
</div>
