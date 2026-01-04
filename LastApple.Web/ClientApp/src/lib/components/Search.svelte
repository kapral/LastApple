<script lang="ts" generics="T">
    interface Props {
        search: (query: string) => Promise<T[]>;
        placeholder: string;
        onChanged: (selected: T[]) => void;
        elementIndex?: number;
        labelAccessor?: (item: T) => string;
    }
    
    let { search, placeholder, onChanged, elementIndex = 0, labelAccessor }: Props = $props();
    
    let isLoading = $state(false);
    let matches = $state<T[]>([]);
    let selectedItems = $state<T[]>([]);
    let inputValue = $state('');
    let showDropdown = $state(false);
    let debounceTimer: ReturnType<typeof setTimeout> | null = null;
    
    function getLabel(item: T): string {
        if (labelAccessor) {
            return labelAccessor(item);
        }
        return String(item);
    }
    
    async function handleSearch(term: string) {
        if (!term.trim()) {
            matches = [];
            showDropdown = false;
            return;
        }
        
        isLoading = true;
        
        try {
            const results = await search(term);
            matches = results;
            showDropdown = results.length > 0;
        } finally {
            isLoading = false;
        }
    }
    
    function handleInput(event: Event) {
        const target = event.target as HTMLInputElement;
        inputValue = target.value;
        
        // Debounce search
        if (debounceTimer) {
            clearTimeout(debounceTimer);
        }
        
        debounceTimer = setTimeout(() => {
            handleSearch(inputValue);
        }, 500);
    }
    
    function selectItem(item: T) {
        if (!selectedItems.includes(item)) {
            selectedItems = [...selectedItems, item];
            onChanged(selectedItems);
        }
        inputValue = '';
        matches = [];
        showDropdown = false;
    }
    
    function removeItem(item: T) {
        selectedItems = selectedItems.filter(i => i !== item);
        onChanged(selectedItems);
    }
</script>

<div class="search-control-{elementIndex}">
    <div class="rbt" style="position: relative;">
        <div style="display: flex; flex-wrap: wrap; gap: 5px; margin-bottom: 5px;">
            {#each selectedItems as item}
                <span class="badge bg-secondary" style="display: flex; align-items: center; gap: 5px;">
                    {getLabel(item)}
                    <button type="button" class="btn-close btn-close-white" style="font-size: 0.6rem;" onclick={() => removeItem(item)}></button>
                </span>
            {/each}
        </div>
        <input
            type="text"
            class="rbt-input-main form-control"
            {placeholder}
            value={inputValue}
            oninput={handleInput}
            onfocus={() => { if (matches.length > 0) showDropdown = true; }}
            onblur={() => setTimeout(() => showDropdown = false, 200)}
        />
        {#if isLoading}
            <div class="spinner-border spinner-border-sm" role="status" style="position: absolute; right: 10px; top: 10px;">
                <span class="visually-hidden">Loading...</span>
            </div>
        {/if}
        {#if showDropdown && matches.length > 0}
            <div class="dropdown-menu show" style="position: absolute; width: 100%; max-height: 200px; overflow-y: auto;">
                {#each matches as match}
                    <button type="button" class="dropdown-item" onclick={() => selectItem(match)}>
                        {getLabel(match)}
                    </button>
                {/each}
            </div>
        {/if}
    </div>
</div>
