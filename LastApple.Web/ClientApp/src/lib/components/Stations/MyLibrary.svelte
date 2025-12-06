<script context="module" lang="ts">
  export const Definition = {
    title: 'My last.fm Library',
    description: 'A continuous station based on your last.fm library.'
  };
</script>

<script lang="ts">
  import { createStation } from '$lib/services/StationApi';
  import { goto } from '$app/navigation';

  export let onStationCreated: (stationId: string) => void = () => {};

  let isCreating = false;
  let error: string = '';

  async function handleCreate() {
    isCreating = true;
    error = '';

    try {
      const stationId = await createStation({
        stationType: 'my-library'
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

<div class="my-library-container">
  <p class="mb-3">Create a station from your Apple Music library.</p>

  {#if error}
    <div class="alert alert-danger">{error}</div>
  {/if}

  <button 
    class="btn btn-primary" 
    on:click={handleCreate} 
    disabled={isCreating}
  >
    {isCreating ? 'Creating Station...' : 'Play from My Library'}
  </button>
</div>

<style>
  .my-library-container {
    padding: 1rem;
  }
</style>
