<script lang="ts">
  import { type Component, createEventDispatcher } from 'svelte';

  export let definition: { title: string; description: string };
  export let StationComponent: Component;

  const dispatch = createEventDispatcher();

  function handleStationCreated(stationId: string) {
    dispatch('stationCreated', stationId);
  }
</script>

<div class="station-descriptor">
  <h4 class="descriptor-title">{definition.title}</h4>
  <div class="descriptor-description">{definition.description}</div>
  <div class="descriptor-content">
    <svelte:component this={StationComponent} onStationCreated={handleStationCreated} />
  </div>
</div>

<style>
  .station-descriptor {
    margin: 5px;
    padding: 15px;
    background: #00000099;
    flex: 1;
  }

  .descriptor-title {
    margin-top: 10px;
    font-size: 15px;
    text-align: center;
    color: #EEE;
  }

  .descriptor-description {
    color: #AAA;
  }

  .descriptor-content {
    display: flex;
    align-items: center;
  }
</style>
