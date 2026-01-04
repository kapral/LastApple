<script lang="ts" module>
    import type { IStationDefinition } from '$lib/models/stationDefinition';

    export const Definition: IStationDefinition = {
        title: 'Similar Artists',
        description: 'A station containing an artist and similar performers.',
        type: null as any
    };
</script>

<script lang="ts">
    import type { IStationParams } from '$lib/models/stationParams';
    import Search from '../Search.svelte';
    import lastfmApi from '$lib/api/lastfmApi';
    import stationApi from '$lib/api/stationApi';

    interface Props extends IStationParams {}

    let { triggerCreate, onStationCreated, onOptionsChanged }: Props = $props();

    let artist = $state<string | null>(null);

    // Call onOptionsChanged based on artist selection
    $effect(() => {
        onOptionsChanged(artist !== null);
    });

    // Handle station creation when triggerCreate becomes true
    $effect(() => {
        if (triggerCreate && artist) {
            createStation();
        }
    });

    async function createStation() {
        const station = await stationApi.postStation('similarartists', artist);
        onStationCreated(station.id);
    }

    async function search(term: string): Promise<string[]> {
        const results = await lastfmApi.searchArtist(term);
        return results.map((x: { name: string }) => x.name);
    }

    function handleChanged(artists: string[]) {
        const selectedArtist = artists[0];
        artist = selectedArtist || null;
    }
</script>

<div class="station-parameters">
    <Search
        {search}
        onChanged={handleChanged}
        placeholder="Placebo..."
    />
</div>
