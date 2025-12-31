<script lang="ts">
	import musicKit from '$lib/services/musicKit';
	import PlaylistTrack from './PlaylistTrack.svelte';
	import PlaylistTrackGroup from './PlaylistTrackGroup.svelte';

	interface Props {
		tracks: MusicKit.MediaItem[];
		currentTrack: MusicKit.MediaItem | undefined;
		isPlaying: boolean;
		offset: number;
		limit: number;
		showAlbumInfo: boolean;
		onRemove: (position: number, count: number) => void;
		onTrackSwitch: (index: number) => void;
	}

	let { tracks, currentTrack, isPlaying, offset, limit, showAlbumInfo, onRemove, onTrackSwitch }: Props = $props();

	interface TrackGroup {
		tracks: MusicKit.MediaItem[];
		index: number;
	}

	let visibleTracks = $derived(tracks.slice(offset, offset + limit));

	let groupedTracks = $derived.by(() => {
		const groups: { all: TrackGroup[]; current: string } = { all: [], current: '' };
		
		visibleTracks.forEach((track, index) => {
			if (groups.current === track.attributes.albumName) {
				groups.all[groups.all.length - 1].tracks.push(track);
			} else {
				groups.current = track.attributes.albumName;
				groups.all.push({ tracks: [track], index });
			}
		});
		
		return groups.all;
	});

	function removeItems(position: number, count: number) {
		// todo: implement remove from queue by entire queue reset
		// onRemove(position, count);
	}

	async function addAlbumToLibrary(item: MusicKit.MediaItem) {
		const instance = await musicKit.getInstance();
		const albumId = item.relationships?.albums?.data?.[0]?.id;
		if (albumId) {
			await instance.api.music('/v1/me/library', { ids: { albums: [albumId] } }, { fetchOptions: { method: 'POST' } });
		}
	}

	async function addToLibrary(item: MusicKit.MediaItem) {
		const instance = await musicKit.getInstance();
		await instance.api.music('/v1/me/library', { ids: { songs: [item.id] } }, { fetchOptions: { method: 'POST' } });
	}
</script>

{#if tracks.length > 0}
	<div class="playlist">
		{#if !showAlbumInfo}
			{#each visibleTracks as track, index (track.id)}
				<PlaylistTrack
					{track}
					isCurrent={currentTrack?.id === track.id}
					isPlaying={isPlaying && currentTrack?.id === track.id}
					{index}
					groupOffset={0}
					{onTrackSwitch}
					{addToLibrary}
					{addAlbumToLibrary}
					onRemove={removeItems}
				/>
			{/each}
		{:else}
			{#each groupedTracks as group (group.index)}
				<PlaylistTrackGroup
					tracks={group.tracks}
					{currentTrack}
					isPlaying={isPlaying && group.tracks.some(t => t.id === currentTrack?.id)}
					index={group.index}
					{addAlbumToLibrary}
					onRemove={removeItems}
				>
					{#each group.tracks as item, trackIndex (item.id)}
						<PlaylistTrack
							track={item}
							isPlaying={isPlaying && item.id === currentTrack?.id}
							isCurrent={currentTrack?.id === item.id}
							index={trackIndex}
							groupOffset={group.index}
							{onTrackSwitch}
							{addToLibrary}
							{addAlbumToLibrary}
							onRemove={onRemove}
						/>
					{/each}
				</PlaylistTrackGroup>
			{/each}
		{/if}
	</div>
{/if}
