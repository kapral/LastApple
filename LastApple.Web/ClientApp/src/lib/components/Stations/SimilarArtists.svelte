<script context="module" lang="ts">
  export const Definition = {
    title: 'Similar Artists',
    description: 'A station containing an artist and similar performers.'
  };
</script>

<script lang="ts">
  import Search from '$lib/components/Search.svelte';
  import appleMusicApi, { type IArtist } from '$lib/services/AppleMusicApi';
  import { createStation } from '$lib/services/StationApi';
  import { goto } from '$app/navigation';

  export let onStationCreated: (stationId: string) => void = () => {};

  let selectedArtist: IArtist | null = null;
  let isCreating = false;
  let error: string = '';

  async function searchArtists(term: string): Promise<IArtist[]> {
    return await appleMusicApi.searchArtists(term);
  }

  function handleArtistSelect(artist: IArtist) {
    selectedArtist = artist;
    error = '';
  }

  async function handleCreate() {
    if (!selectedArtist) {
      error = 'Please select an artist first';
      return;
    }

    isCreating = true;
    error = '';

    try {
      const stationId = await createStation({
        stationType: 'similar-artists',
        artistId: selectedArtist.id,
        artistName: selectedArtist.name
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

<div class="similar-artists-container">
  <div class="mb-3">
    <label for="artist-search" class="form-label">Search for an artist:</label>
    <Search
      searchFunction={searchArtists}
      onSelect={handleArtistSelect}
      placeholder="Search artists..."
    />
  </div>

  {#if selectedArtist}
    <div class="selected-artist mb-3">
      <strong>Selected:</strong> {selectedArtist.name}
    </div>
  {/if}

  {#if error}
    <div class="alert alert-danger">{error}</div>
  {/if}

  <button 
    class="btn btn-primary" 
    on:click={handleCreate} 
    disabled={!selectedArtist || isCreating}
  >
    {isCreating ? 'Creating Station...' : 'Create Similar Artists Station'}
  </button>
</div>

<style>
  .similar-artists-container {
    padding: 1rem;
  }

  .selected-artist {
    padding: 0.5rem;
    background-color: #f8f9fa;
    border-radius: 0.25rem;
  }
</style>
