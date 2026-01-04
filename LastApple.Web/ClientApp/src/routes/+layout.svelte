<script lang="ts">
    import 'bootstrap/dist/css/bootstrap.css';
    import '@fortawesome/fontawesome-free/js/all.js';
    import '../app.css';
    import Header from '$lib/components/Header.svelte';
    import Footer from '$lib/components/Footer.svelte';
    import NowPlaying from '$lib/components/NowPlaying.svelte';
    import { page } from '$app/stores';
    import { onMount } from 'svelte';
    import { checkAuthentication, handleCallback } from '$lib/services/lastfmAuthentication';
    import { checkAuthorization } from '$lib/services/appleAuthentication';

    let { children } = $props();

    // Check if we're on a station route and extract stationId
    let isStationRoute = $derived($page.route.id === '/station/[stationId]');
    let stationId = $derived($page.params.stationId || '');

    onMount(async () => {
        // Handle Last.fm OAuth callback if token is in URL
        await handleCallback();

        // Check auth status on startup
        await Promise.all([
            checkAuthentication(),
            checkAuthorization()
        ]);
    });
</script>

<div class="app-layout" style="background-color: #222; color: #CCC; max-width: 900px; margin: 0 auto;">
    <Header />
    <!-- Render route-specific content only when NOT on station route -->
    {#if !isStationRoute}
        {@render children()}
    {/if}
    <!-- NowPlaying is always mounted to preserve state, just hidden when not on station route -->
    <NowPlaying {stationId} showPlayer={isStationRoute} />
    <Footer />
</div>
