<script lang="ts">
	import type { IStationDefinition } from './IStationDefinition';
	import type { Component } from 'svelte';
	import { goto } from '$app/navigation';
	
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
		<button 
			onclick={handleCreateClick} 
			aria-label="Create station"
			style="cursor: pointer; background: none; border: none; padding: 0;"
		>
			<svg 
				viewBox="0 0 512 512" 
				fill={optionsValid ? '#8e0000' : '#333'} 
				style="width: 32px; height: 32px;"
				data-testid="create-icon"
			>
				<path d="M256 8c137 0 248 111 248 248S393 504 256 504 8 393 8 256 119 8 256 8zm-28.9 143.6l75.5 72.4H120c-13.3 0-24 10.7-24 24v16c0 13.3 10.7 24 24 24h182.6l-75.5 72.4c-9.7 9.3-9.9 24.8-.4 34.3l11 10.9c9.4 9.4 24.6 9.4 33.9 0L404.3 273c9.4-9.4 9.4-24.6 0-33.9L271.6 106.3c-9.4-9.4-24.6-9.4-33.9 0l-11 10.9c-9.5 9.6-9.3 25.1.4 34.4z"/>
			</svg>
		</button>
	</div>
</div>
