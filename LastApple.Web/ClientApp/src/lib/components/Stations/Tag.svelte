<script context="module" lang="ts">
  export const Definition = {
    title: 'Tag',
    description: 'A station consisting of tracks related to a last.fm tag.'
  };
</script>

<script lang="ts">
  import Search from '$lib/components/Search.svelte';
  import appleMusicApi, { type ITag } from '$lib/services/AppleMusicApi';
  import { createStation } from '$lib/services/StationApi';
  import { goto } from '$app/navigation';

  export let onStationCreated: (stationId: string) => void = () => {};

  let selectedTag: ITag | null = null;
  let isCreating = false;
  let error: string = '';

  async function searchTags(term: string): Promise<ITag[]> {
    return await appleMusicApi.searchTags(term);
  }

  function handleTagSelect(tag: ITag) {
    selectedTag = tag;
    error = '';
  }

  async function handleCreate() {
    if (!selectedTag) {
      error = 'Please select a tag first';
      return;
    }

    isCreating = true;
    error = '';

    try {
      const stationId = await createStation({
        stationType: 'tag',
        stationName: selectedTag.name
      });

      onStationCreated(stationId);
      goto(`/station/${stationId}`);
    } catch (err) {
      error = 'Failed to create station. Please try again.';
      console.error('Station creation error:', err);
    } finally {
      isCreating = false;
    }
  }
</script>

<div class="tag-container">
  <div class="mb-3">
    <Search
      searchFunction={searchTags}
      onSelect={handleTagSelect}
      placeholder="Search tags..."
    />
  </div>

  {#if selectedTag}
    <div class="selected-tag mb-3">
      <strong>Selected:</strong> {selectedTag.name}
    </div>
  {/if}

  {#if error}
    <div class="alert alert-danger">{error}</div>
  {/if}

  <button
    class="btn btn-primary"
    on:click={handleCreate}
    disabled={!selectedTag || isCreating}
  >
    {isCreating ? 'Creating Station...' : 'Create Tag Station'}
  </button>
</div>

<style>
  .tag-container {
    padding: 1rem;
  }

  .selected-tag {
    padding: 0.5rem;
    background-color: #f8f9fa;
    border-radius: 0.25rem;
  }
</style>
