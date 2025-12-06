<script lang="ts">
  import { type Component, createEventDispatcher } from 'svelte';

  export let definition: { name: string; description: string; icon: string };
  export let StationComponent: Component;

  const dispatch = createEventDispatcher();

  function handleStationCreated(stationId: string) {
    dispatch('stationCreated', stationId);
  }
</script>

<div class="station-descriptor">
  <div class="station-header">
    <i class="{definition.icon}"></i>
    <h3>{definition.name}</h3>
  </div>
  <p>{definition.description}</p>
  <div class="station-content">
    <svelte:component this={StationComponent} onStationCreated={handleStationCreated} />
  </div>
</div>

<style>
  .station-descriptor {
    padding: 15px;
    margin-bottom: 15px;
    border: 1px solid #333;
    border-radius: 4px;
  }

  .station-header {
    display: flex;
    align-items: center;
    margin-bottom: 10px;
  }

  .station-header i {
    margin-right: 10px;
    font-size: 20px;
  }

  .station-header h3 {
    margin: 0;
  }

  .station-content {
    margin-top: 15px;
  }
</style>
