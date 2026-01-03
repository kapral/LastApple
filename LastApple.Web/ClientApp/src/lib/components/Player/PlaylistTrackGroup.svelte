<script lang="ts">
	import type { Snippet } from 'svelte';
	import CustomToggle from './CustomToggle.svelte';
	import { getImageUrl } from '$lib/utils/imageUtils';
	import Icon from '$lib/components/Icons/Icon.svelte';

	interface Props {
		currentTrack: MusicKit.MediaItem | undefined;
		tracks: MusicKit.MediaItem[];
		isPlaying: boolean;
		index: number;
		onRemove: (position: number, count: number) => void;
		addAlbumToLibrary: (track: MusicKit.MediaItem) => void;
		children?: Snippet;
	}

	let { currentTrack, tracks, isPlaying, index, onRemove, addAlbumToLibrary, children }: Props = $props();

	let dropdownOpen = $state(false);

	let albumArtUrl = $derived(
		tracks?.[0]?.attributes?.artwork?.url
			? tracks[0].attributes.artwork.url.replace('{w}x{h}', '60x60')
			: ''
	);

	let albumName = $derived(tracks?.[0]?.attributes?.albumName ?? '');
	let artistName = $derived(tracks?.[0]?.attributes?.artistName ?? '');
	let trackCount = $derived(tracks?.length ?? 0);

	function toggleDropdown() {
		dropdownOpen = !dropdownOpen;
	}

	function closeDropdown() {
		dropdownOpen = false;
	}

	function handleAddAlbum() {
		if (tracks?.[0]) {
			addAlbumToLibrary(tracks[0]);
		}
		closeDropdown();
	}

	function handleRemove() {
		onRemove(index, tracks.length);
		closeDropdown();
	}
</script>

<div class="playlist-track-group" data-testid="playlist-track-group">
	<div class="album-header-container">
		<img
			style="height: 60px; width: 60px; vertical-align: top;"
			alt="album logo"
			src={albumArtUrl}
		/>
		<div class="album-header">
			<div class="dropdown" data-testid="dropdown-toggle">
				<CustomToggle onclick={toggleDropdown}>
					<span class="dropdown-icon"><Icon name="ellipsis-h" size={22} /></span>
				</CustomToggle>
				{#if dropdownOpen}
					<!-- svelte-ignore a11y_no_static_element_interactions -->
					<!-- svelte-ignore a11y_click_events_have_key_events -->
					<div class="dropdown-backdrop" onclick={closeDropdown}></div>
					<div class="dropdown-menu" data-testid="dropdown-menu">
						<button class="dropdown-item" onclick={handleAddAlbum}>
							<span class="menu-icon">
								<Icon name="folder-plus" size={16} />
							</span>
							<span>Add to your AppleMusic Library</span>
						</button>
						<button class="dropdown-item" onclick={handleRemove}>
							<span class="menu-icon">
								<Icon name="trash-alt" size={16} />
							</span>
							<span>Remove</span>
						</button>
					</div>
				{/if}
			</div>
			<h5 class="album-name">{albumName}</h5>
			<h6 class="artist-name">{artistName} ({trackCount})</h6>
		</div>
	</div>
	{#if children}
		{@render children()}
	{/if}
</div>
