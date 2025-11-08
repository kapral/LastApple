<script lang="ts" generic="T extends { id: string; name: string }">
  import { onMount } from 'svelte';

  export let onSelect: (item: T) => void;
  export let searchFunction: (term: string) => Promise<T[]>;
  export let placeholder: string = "Search...";
  export let getLabel: (item: T) => string = (item) => item.name;

  let searchTerm = '';
  let results: T[] = [];
  let isLoading = false;
  let showDropdown = false;
  let selectedIndex = -1;
  let debounceTimer: ReturnType<typeof setTimeout> | undefined;
  let containerEl: HTMLDivElement;

  async function handleInput() {
    clearTimeout(debounceTimer);
    
    if (!searchTerm.trim()) {
      results = [];
      showDropdown = false;
      return;
    }

    debounceTimer = setTimeout(async () => {
      isLoading = true;
      showDropdown = true;
      selectedIndex = -1;
      
      try {
        results = await searchFunction(searchTerm);
      } catch (error) {
        console.error('Search error:', error);
        results = [];
      } finally {
        isLoading = false;
      }
    }, 300);
  }

  function handleSelect(item: T) {
    onSelect(item);
    searchTerm = '';
    results = [];
    showDropdown = false;
    selectedIndex = -1;
  }

  function handleKeydown(event: KeyboardEvent) {
    if (!showDropdown || results.length === 0) return;

    switch (event.key) {
      case 'ArrowDown':
        event.preventDefault();
        selectedIndex = (selectedIndex + 1) % results.length;
        break;
      case 'ArrowUp':
        event.preventDefault();
        selectedIndex = selectedIndex <= 0 ? results.length - 1 : selectedIndex - 1;
        break;
      case 'Enter':
        event.preventDefault();
        if (selectedIndex >= 0) {
          handleSelect(results[selectedIndex]);
        }
        break;
      case 'Escape':
        showDropdown = false;
        selectedIndex = -1;
        break;
    }
  }

  function handleClickOutside(event: MouseEvent) {
    if (containerEl && !containerEl.contains(event.target as Node)) {
      showDropdown = false;
      selectedIndex = -1;
    }
  }

  onMount(() => {
    document.addEventListener('click', handleClickOutside);
    return () => {
      document.removeEventListener('click', handleClickOutside);
    };
  });
</script>

<div class="search-container" bind:this={containerEl}>
  <input
    type="text"
    class="form-control"
    bind:value={searchTerm}
    on:input={handleInput}
    on:keydown={handleKeydown}
    {placeholder}
  />
  
  {#if showDropdown}
    <div class="dropdown-menu show">
      {#if isLoading}
        <div class="dropdown-item disabled">
          <span class="spinner-border spinner-border-sm me-2"></span>
          Searching...
        </div>
      {:else if results.length === 0}
        <div class="dropdown-item disabled">No results found</div>
      {:else}
        {#each results as result, index}
          <button
            type="button"
            class="dropdown-item {index === selectedIndex ? 'active' : ''}"
            on:click={() => handleSelect(result)}
          >
            {getLabel(result)}
          </button>
        {/each}
      {/if}
    </div>
  {/if}
</div>

<style>
  .search-container {
    position: relative;
  }

  .dropdown-menu {
    position: absolute;
    top: 100%;
    left: 0;
    right: 0;
    z-index: 1000;
    max-height: 300px;
    overflow-y: auto;
    margin-top: 0.125rem;
  }

  .dropdown-item {
    cursor: pointer;
  }

  .dropdown-item.disabled {
    cursor: default;
  }
</style>
