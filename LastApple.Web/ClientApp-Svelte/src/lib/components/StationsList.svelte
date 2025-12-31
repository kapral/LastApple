<script lang="ts">
	import StationDescriptor from './StationDescriptor.svelte';
	import MyLibrary, { Definition as MyLibraryDef } from './Stations/MyLibrary.svelte';
	import SingleArtist, { Definition as SingleArtistDef } from './Stations/SingleArtist.svelte';
	import SimilarArtists, { Definition as SimilarArtistsDef } from './Stations/SimilarArtists.svelte';
	import Tag, { Definition as TagDef } from './Stations/Tag.svelte';
</script>

<div class="station-list" style="padding: 5px; display: grid;">
	<StationDescriptor definition={MyLibraryDef} StationComponent={MyLibrary} />
	<StationDescriptor definition={SingleArtistDef} StationComponent={SingleArtist} />
	<StationDescriptor definition={SimilarArtistsDef} StationComponent={SimilarArtists} />
	<StationDescriptor definition={TagDef} StationComponent={Tag} />
</div>
