<script lang="ts">
  import { goto } from '$app/navigation';
  import { onMount } from 'svelte';

  // Redirect to /home on mount
  onMount(() => {
    goto('/home', { replaceState: true });
  });
</script>

<div class="loading-container">
  <p>Loading...</p>
</div>

<style>
  .loading-container {
    display: flex;
    align-items: center;
    justify-content: center;
    height: 200px;
  }
</style>
