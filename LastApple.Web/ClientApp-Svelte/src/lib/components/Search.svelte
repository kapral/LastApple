<script lang="ts">
	// Placeholder - will be implemented in Phase 4
	interface Props<T> {
		search: (query: string) => Promise<T[]>;
		placeholder: string;
		onChanged: (selected: T[]) => void;
		elementIndex?: number;
		labelAccessor?: string;
	}
	
	let { search, placeholder, onChanged, elementIndex = 0, labelAccessor }: Props<any> = $props();
	
	let inputValue = $state('');
	let isLoading = $state(false);
	let options: any[] = $state([]);
	
	async function handleInput(event: Event) {
		const target = event.target as HTMLInputElement;
		inputValue = target.value;
		
		if (inputValue.length > 0) {
			isLoading = true;
			// Add delay like the React version
			setTimeout(async () => {
				options = await search(inputValue);
				isLoading = false;
			}, 500);
		}
	}
</script>

<div class="search-control-{elementIndex}">
	<input
		type="text"
		{placeholder}
		value={inputValue}
		oninput={handleInput}
		class="rbt-input-main form-control"
	/>
	{#if isLoading}
		<div class="spinner-border spinner-border-sm" role="status">
			<span class="visually-hidden">Loading...</span>
		</div>
	{/if}
</div>
