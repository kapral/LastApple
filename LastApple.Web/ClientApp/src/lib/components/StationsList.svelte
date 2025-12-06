<script lang="ts">
  import { goto } from '$app/navigation';
  import StationDescriptor from './StationDescriptor.svelte';
  import * as MyLibrary from './Stations/MyLibrary.svelte';
  import * as SingleArtist from './Stations/SingleArtist.svelte';
  import * as SimilarArtists from './Stations/SimilarArtists.svelte';
  import * as Tag from './Stations/Tag.svelte';

  let createdStationId: string | null = null;

  function handleStationCreated(stationId: string) {
    createdStationId = stationId;
    goto(`/station/${stationId}`);
  }
</script>

<div class="station-list">
  <StationDescriptor
    definition={MyLibrary.Definition}
    StationComponent={MyLibrary.default}
    on:stationCreated={(e) => handleStationCreated(e.detail)} />
  <StationDescriptor
          definition={SingleArtist.Definition}
          StationComponent={SingleArtist.default}
    on:stationCreated={(e) => handleStationCreated(e.detail)} />
  <StationDescriptor
          definition={SimilarArtists.Definition}
          StationComponent={SimilarArtists.default}
    on:stationCreated={(e) => handleStationCreated(e.detail)} />
  <StationDescriptor
          definition={Tag.Definition}
          StationComponent={Tag.default}
    on:stationCreated={(e) => handleStationCreated(e.detail)} />
</div>

<style>
  .station-list {
    padding: 5px;
    display: grid;
  }
</style>
