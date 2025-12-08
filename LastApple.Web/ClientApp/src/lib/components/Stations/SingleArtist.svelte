<script context="module" lang="ts">
  export const Definition = {
    title: 'Artist',
    description: 'Play all tracks of one artist.'
  };
</script>

<script lang="ts">
  import Search from '$lib/components/Search.svelte';
  import appleMusicApi, { type IArtist } from '$lib/services/AppleMusicApi';
  import { createStation } from '$lib/services/StationApi';
  import { goto } from '$app/navigation';

  export let onStationCreated: (stationId: string) => void = () => {};

  let selectedArtists: IArtist[] = [];
  let isCreating = false;
  let error: string = '';

  async function searchArtists(term: string): Promise<IArtist[]> {
    return await appleMusicApi.searchArtists(term);
  }

  function handleArtistSelect(artist: IArtist) {
    // Add artist if not already selected
    if (!selectedArtists.some(a => a.id === artist.id)) {
      selectedArtists = [...selectedArtists, artist];
    }
    error = '';
  }

  function removeArtist(artistId: string) {
    selectedArtists = selectedArtists.filter(a => a.id !== artistId);
  }

  async function handleCreate() {
    if (selectedArtists.length === 0) {
      error = 'Please select at least one artist';
      return;
    }

    isCreating = true;
    error = '';

    try {
      const artistIds = selectedArtists.map(a => a.id).join(',');
      const stationId = await createStation({
        stationType: 'artist',
        stationName: artistIds
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

<div class="single-artist-container">
  <div class="mb-3">
    <Search
      searchFunction={searchArtists}
      onSelect={handleArtistSelect}
      placeholder="Radiohead..."
    />
  </div>

  {#if selectedArtists.length > 0}
    <div class="selected-artists mb-3">
      <strong>Selected Artists:</strong>
      <div class="artist-list mt-2">
        {#each selectedArtists as artist}
          <div class="artist-item">
            <span>{artist.name}</span>
            <button
              type="button"
              class="btn btn-sm btn-outline-danger"
              on:click={() => removeArtist(artist.id)}
              aria-label="Remove {artist.name}"
            >
              ×
            </button>
          </div>
        {/each}
      </div>
    </div>
  {/if}

  {#if error}
    <div class="alert alert-danger">{error}</div>
  {/if}

  <button
    class="btn btn-primary"
    on:click={handleCreate}
    disabled={selectedArtists.length === 0 || isCreating}
  >
    {isCreating ? 'Creating Station...' : 'Create Single Artist Station'}
  </button>
</div>

<style>
  .single-artist-container {
    padding: 1rem;
  }

  .selected-artists {
    padding: 0.5rem;
    background-color: #f8f9fa;
    border-radius: 0.25rem;
  }

  .artist-list {
    display: flex;
    flex-direction: column;
    gap: 0.5rem;
  }

  .artist-item {
    display: flex;
    justify-content: space-between;
    align-items: center;
    padding: 0.5rem;
    background-color: white;
    border: 1px solid #dee2e6;
    border-radius: 0.25rem;
  }

  .artist-item button {
    margin-left: 0.5rem;
  }
</style>
