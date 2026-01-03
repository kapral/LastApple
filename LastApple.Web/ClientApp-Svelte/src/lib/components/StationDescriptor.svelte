<script lang="ts">
	import type { IStationDefinition } from '$lib/models/stationDefinition';
	import type { Component } from 'svelte';
	import { goto } from '$app/navigation';
	import Icon from "$lib/components/Icons/Icon.svelte";

	interface Props {
		definition: IStationDefinition;
		StationComponent: Component;
	}

	let { definition, StationComponent }: Props = $props();

	let triggerCreate = $state(false);
	let optionsValid = $state(false);

	function handleStationCreated(stationId: string) {
		goto(`/station/${stationId}`);
	}

	function handleOptionsChanged(valid: boolean) {
		optionsValid = valid;
	}

	function handleCreateClick() {
		if (!optionsValid) return;
		triggerCreate = true;
	}

	let color = {
		valid: '#8e0000',
		default: '#333'
	}
</script>

<div class="station-descriptor" style="margin: 5px; padding: 15px; background: #00000099; cursor: pointer; flex: 1;">
	<h4 style="margin-top: 10px; font-size: 15px; text-align: center; color: #EEE;">{definition.title}</h4>
	<div style="color: #AAA;">{definition.description}</div>
	<div style="display: flex; align-items: center;">
		<StationComponent
			{triggerCreate}
			onStationCreated={handleStationCreated}
			onOptionsChanged={handleOptionsChanged}
		/>
		<button onclick={handleCreateClick}
			aria-label="Create station"
			style="color: {optionsValid ? color.valid : color.default}; cursor: pointer; background: none; border: none; padding: 0;">
			<Icon name="arrow-right-in-circle" size={32} />
		</button>
	</div>
</div>
