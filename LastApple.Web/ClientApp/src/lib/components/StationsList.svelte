<script lang="ts">
  import { goto } from '$app/navigation';
  import StationDescriptor from './StationDescriptor.svelte';
  import MyLibrary from './Stations/MyLibrary.svelte';
  import SingleArtist from './Stations/SingleArtist.svelte';
  import SimilarArtists from './Stations/SimilarArtists.svelte';
  import Tag from './Stations/Tag.svelte';

  let createdStationId: string | null = null;

  function handleStationCreated(stationId: string) {
    createdStationId = stationId;
    goto(`/station/${stationId}`);
  }
</script>

<div class="station-list">
  <StationDescriptor 
    definition={MyLibrary.Definition} 
    StationComponent={MyLibrary}
    on:stationCreated={(e) => handleStationCreated(e.detail)} />
  <StationDescriptor 
    definition={SingleArtist.Definition} 
    StationComponent={SingleArtist}
    on:stationCreated={(e) => handleStationCreated(e.detail)} />
  <StationDescriptor 
    definition={SimilarArtists.Definition} 
    StationComponent={SimilarArtists}
    on:stationCreated={(e) => handleStationCreated(e.detail)} />
  <StationDescriptor 
    definition={Tag.Definition} 
    StationComponent={Tag}
    on:stationCreated={(e) => handleStationCreated(e.detail)} />
</div>

<style>
  .station-list {
    padding: 5px;
    display: grid;
  }
</style>
