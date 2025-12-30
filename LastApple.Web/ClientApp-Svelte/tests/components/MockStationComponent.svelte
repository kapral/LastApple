<script lang="ts">
	// Mock station component for testing
	interface Props {
		triggerCreate?: boolean;
		onStationCreated?: (stationId: string) => void;
		onOptionsChanged?: (valid: boolean) => void;
	}
	
	let { triggerCreate = false, onStationCreated, onOptionsChanged }: Props = $props();
	
	$effect(() => {
		if (onOptionsChanged) {
			onOptionsChanged(true);
		}
	});
	
	$effect(() => {
		if (triggerCreate && onStationCreated) {
			onStationCreated('test-station-id');
		}
	});
</script>

<div>Mock Station Component</div>
