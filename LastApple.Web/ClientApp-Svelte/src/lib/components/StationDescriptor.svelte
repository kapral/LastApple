<script lang="ts">
	// Placeholder - will be implemented in Phase 4
	import type { IStationDefinition } from './IStationDefinition';
	import type { Component } from 'svelte';
	
	interface Props {
		definition: IStationDefinition;
		StationComponent: Component;
	}
	
	let { definition, StationComponent }: Props = $props();
	
	let triggerCreate = $state(false);
	let optionsValid = $state(false);
	
	function handleStationCreated(stationId: string) {
		// Navigate to station
		window.location.href = `/station/${stationId}`;
	}
	
	function handleOptionsChanged(valid: boolean) {
		optionsValid = valid;
	}
	
	function handleCreateClick() {
		triggerCreate = true;
	}
</script>

<div class="station-descriptor" style="padding: 10px; background: #333; margin: 5px;">
	<h4>{definition.title}</h4>
	<p>{definition.description}</p>
	<div data-testid="mock-station-component">
		<StationComponent 
			{triggerCreate}
			onStationCreated={handleStationCreated}
			onOptionsChanged={handleOptionsChanged}
		/>
	</div>
	<button 
		class="btn btn-black" 
		onclick={handleCreateClick}
		disabled={!optionsValid}
		style="opacity: {optionsValid ? 1 : 0.3};"
	>
		<i class="fa-solid fa-arrow-circle-right" data-testid="fontawesome-icon"></i>
	</button>
</div>
