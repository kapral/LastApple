<script lang="ts" module>
    import type { IStationDefinition } from '$lib/models/stationDefinition';

    export const Definition: IStationDefinition = {
        title: 'Artist',
        description: 'Play all tracks of one artist.',
        type: null as any
    };
</script>

<script lang="ts">
    import type { IStationParams } from '$lib/models/stationParams';
    import Search from '../Search.svelte';
    import musicKit from '$lib/services/musicKit';
    import stationApi from '$lib/api/stationApi';

    interface Props extends IStationParams {}

    let { triggerCreate, onStationCreated, onOptionsChanged }: Props = $props();

    let currentArtistIds = $state<string[]>([]);

    // Call onOptionsChanged(false) initially
    $effect(() => {
        onOptionsChanged(currentArtistIds.length > 0);
    });

    $effect(() => {
        if (triggerCreate && currentArtistIds.length > 0) {
            createStation();
        }
    });

    async function createStation() {
        const station = await stationApi.postStation('artist', currentArtistIds.join(','));
        onStationCreated(station.id);
    }

    async function search(term: string): Promise<MusicKit.MediaItem[]> {
        const kit = await musicKit.getInstance();
        const parameters = { term: term, types: ['artists'], l: 'en-us' };

        const response = await kit.api.music(`/v1/catalog/${kit.storefrontId}/search`, parameters);

        if (!response.data.results.artists) {
            return [];
        }

        return response.data.results.artists.data.map((x: MusicKit.MediaItem) => x);
    }

    function handleChanged(artists: MusicKit.MediaItem[]) {
        currentArtistIds = artists.map(x => x.id);
    }

    function labelAccessor(item: MusicKit.MediaItem): string {
        return (item as any).attributes?.name || '';
    }
</script>

<div class="station-parameters">
    <Search
        {search}
        onChanged={handleChanged}
        placeholder="Radiohead..."
        {labelAccessor}
    />
</div>
