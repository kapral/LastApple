<script lang="ts">
	import { onDestroy } from 'svelte';
	import Playlist from './Playlist.svelte';
	import PlayerControls from './PlayerControls.svelte';
	import Spinner from '$lib/components/Spinner.svelte';
	import stationApi, { type IStation } from '$lib/api/stationApi';
	import lastfmApi from '$lib/api/lastfmApi';
	import musicKit from '$lib/services/musicKit';
	import { lastfmAuthState } from '$lib/stores/lastfmAuth';
	import { AuthenticationState } from '$lib/services/authentication';
	import { PlaybackStates } from '$lib/services/musicKitEnums';
	import { HubConnectionBuilder, type HubConnection } from '@microsoft/signalr';
	import environment from '$lib/services/environment';

	interface Props {
		stationId: string;
	}

	interface IAddTrackEvent {
		trackId: string;
		position: number;
	}

	let { stationId }: Props = $props();

	// State
	let station: IStation | null = $state(null);
	let tracks: MusicKit.MediaItem[] = $state([]);
	let currentTrack: MusicKit.MediaItem | undefined = $state(undefined);
	let isPlaying = $state(false);
	let suppressEvents = $state(false);
	let isLoading = $state(true);

	// Refs (non-reactive)
	let musicKitInstance: MusicKit.MusicKitInstance | null = null;
	let hubConnection: HubConnection | null = null;
	let pendingEvents: IAddTrackEvent[] = [];
	let currentTrackScrobbled = false;
	let requestedItems = 0;
	let isFirstTime = true;

	// Derived values
	let isScrobblingEnabled = $derived(
		$lastfmAuthState.state === AuthenticationState.Authenticated && $lastfmAuthState.isScrobblingEnabled
	);
	let lastfmAuthenticated = $derived($lastfmAuthState.state === AuthenticationState.Authenticated);

	// Helper functions
	function getCurrentQueuePosition(): number {
		if (!musicKitInstance) return 0;
		const pos = musicKitInstance.queue.position;
		return pos !== -1 ? pos : 0;
	}

	function getPlaylistPagingOffset(): number {
		if (station?.isContinuous) {
			return getCurrentQueuePosition();
		}
		return 0;
	}

	// Batch helper
	function batchItems<T>(arr: T[], size: number): T[][] {
		return arr.length > size ? [arr.slice(0, size), ...batchItems(arr.slice(size), size)] : [arr];
	}

	// SignalR connection
	async function subscribeToStationEvents() {
		if (hubConnection) return;

		const apiUrl = environment.apiUrl;
		hubConnection = new HubConnectionBuilder().withUrl(`${apiUrl}hubs`).build();

		await hubConnection.start();

		hubConnection.on('trackAdded', async (trackStationId: string, trackId: string, position: number) => {
			if (trackStationId !== stationId) return;

			const event: IAddTrackEvent = { trackId, position };
			await handleTrackAdded(event);
		});
	}

	async function handleTrackAdded(event: IAddTrackEvent) {
		if (!station) {
			pendingEvents.push(event);
			return;
		}

		if (!musicKitInstance) return;

		const existingItem = musicKitInstance.queue.item(event.position);

		if (!existingItem) {
			const songs = await musicKitInstance.api.music(
				`/v1/catalog/${musicKitInstance.storefrontId}/songs`,
				{ ids: [event.trackId] }
			);

			if (songs.data.data.length === 0) {
				console.warn(`Could not find song with id ${event.trackId}`);
				return;
			}

			const song = songs.data.data[0];
			await musicKitInstance.playLater({ songs: [song.id] });
			tracks = [...tracks, song as unknown as MusicKit.MediaItem];

			if (musicKitInstance.queue.items.length === 1) {
				await musicKitInstance.play();
			}
			return;
		}

		if (requestedItems > 0) {
			requestedItems--;
		}

		if (existingItem.id === event.trackId) {
			return;
		}

		console.warn(`Position ${event.position} already occupied by a different item.`);
	}

	// Lastfm integration
	async function scrobble(track: MusicKit.MediaItem) {
		if (!isScrobblingEnabled) return;

		await lastfmApi.scrobble(
			track.attributes.name,
			track.attributes.artistName,
			track.attributes.albumName,
			Math.floor(Date.now() / 1000)
		);
	}

	async function setNowPlaying(item: MusicKit.MediaItem) {
		if (!isScrobblingEnabled) return;

		await lastfmApi.updateNowPlaying(
			item.attributes.name,
			item.attributes.artistName,
			item.attributes.albumName
		);
	}

	function handleScrobblingSwitch(enabled: boolean) {
		lastfmAuthState.setIsScrobblingEnabled(enabled);
	}

	// Top up station
	async function topUp() {
		if (!station || !musicKitInstance) return;

		const queueLength = musicKitInstance.queue.items.length;
		const itemsLeft = queueLength - getCurrentQueuePosition() + requestedItems;
		const itemsToAdd = station.size - itemsLeft;

		if (itemsToAdd > 0) {
			requestedItems += itemsToAdd;
			await stationApi.topUp(stationId, station.definition.stationType, itemsToAdd);
		}
	}

	// MusicKit event handlers
	async function handleStateChange(event: MusicKit.Events['playbackStateDidChange']) {
		if (!event || suppressEvents) return;

		const playing = (event.state as unknown as PlaybackStates) === PlaybackStates.playing;
		if (isPlaying !== playing) {
			isPlaying = playing;
		}
	}

	async function handleNowPlayingItemChange(event: MusicKit.Events['nowPlayingItemDidChange']) {
		if (!event.item) return;

		document.title = `${event.item.title} - ${event.item.artistName}`;
		currentTrackScrobbled = false;
		currentTrack = event.item;

		if (isScrobblingEnabled) {
			await setNowPlaying(event.item);
		}

		if (station?.isContinuous) {
			await topUp();
		}
	}

	async function handlePlaybackProgressChange(event: MusicKit.Events['playbackProgressDidChange']) {
		if (currentTrackScrobbled || event.progress < 0.9) return;

		if (currentTrack && isScrobblingEnabled) {
			await scrobble(currentTrack);
			currentTrackScrobbled = true;
		}
	}

	// Player controls
	async function handlePlayPause() {
		if (!musicKitInstance) return;

		if (musicKitInstance.isPlaying) {
			musicKitInstance.pause();
			return;
		}

		await musicKitInstance.play();
	}

	async function skipToPreviousItem() {
		if (!musicKitInstance) return;
		if (musicKitInstance.isPlaying) {
			musicKitInstance.pause();
		}
		await musicKitInstance.skipToPreviousItem();
	}

	async function skipToNextItem() {
		if (!musicKitInstance) return;
		if (musicKitInstance.isPlaying) {
			musicKitInstance.pause();
		}
		await musicKitInstance.skipToNextItem();
	}

	async function handleTrackSwitched(index: number) {
		if (!station || !musicKitInstance) return;

		const offset = getPlaylistPagingOffset() + index;
		const track = tracks[offset];

		if (currentTrack && track && currentTrack.id === track.id) {
			await handlePlayPause();
			return;
		}

		if (musicKitInstance.isPlaying) {
			musicKitInstance.pause();
		}
		await musicKitInstance.changeToMediaAtIndex(offset);
		currentTrack = track;

		if (station.isContinuous) {
			await topUp();
		}
	}

	async function handleTracksRemoved(position: number, count: number) {
		if (!station) return;

		const offset = getPlaylistPagingOffset() + position;

		// Update tracks
		const newTracks = [...tracks];
		newTracks.splice(offset, count);
		tracks = newTracks;

		// Delete from server
		await stationApi.deleteSongs(station.id, offset, count);

		if (station.isContinuous) {
			await topUp();
		}
	}

	// Initialize station
	async function init() {
		if (!stationId) return;

		// Return early if this station is already loaded (preserves player state when switching tabs)
		if (station && station.id === stationId) {
			return;
		}

		isLoading = true;
		suppressEvents = true;
		currentTrack = undefined;
		tracks = [];

		musicKitInstance = await musicKit.getInstance();

		if (isFirstTime) {
			isFirstTime = false;
			await subscribeToStationEvents();

			musicKitInstance.addEventListener('playbackStateDidChange', handleStateChange);
			musicKitInstance.addEventListener('nowPlayingItemDidChange', handleNowPlayingItemChange);
			musicKitInstance.addEventListener('playbackProgressDidChange', handlePlaybackProgressChange);
		} else {
			musicKitInstance.stop();
			await musicKitInstance.clearQueue();
			// Wait for queue to be fully cleared
			while (musicKitInstance.queue.items.length > 0) {
				await new Promise(resolve => setTimeout(resolve, 50));
			}
		}

		station = await stationApi.getStation(stationId);
		if (!station) {
			isLoading = false;
			return;
		}

		// Load songs in batches
		let isFirstBatch = true;
		for (const batch of batchItems(station.songIds, 300)) {
			if (batch.length) {
				const response = await musicKitInstance.api.music(
					`/v1/catalog/${musicKitInstance.storefrontId}/songs`,
					{ ids: batch }
				);
				const songs = response.data.data as unknown as MusicKit.MediaItem[];
				
				if (isFirstBatch) {
					// Use setQueue for first batch to replace any existing queue
					await musicKitInstance.setQueue({ songs: songs.map((s) => s.id) });
					isFirstBatch = false;
				} else {
					// Use playLater for subsequent batches to append
					await musicKitInstance.playLater({ songs: songs.map((s) => s.id) });
				}
				tracks = [...tracks, ...songs];
			}
		}

		suppressEvents = false;
		isLoading = false;

		const queueItems = musicKitInstance.queue.items;
		if (queueItems.length) {
			try {
				const context = new AudioContext();
				if (context.state === 'running') {
					await musicKitInstance.play();
				}
			} catch {
				// AudioContext may not be available in tests
			}
		}

		// Process pending events
		if (pendingEvents.length > 0) {
			for (const event of pendingEvents) {
				await handleTrackAdded(event);
			}
			pendingEvents = [];
		}
	}

	// Lifecycle
	onDestroy(() => {
		if (hubConnection) {
			hubConnection.off('trackAdded');
		}
		if (musicKitInstance) {
			musicKitInstance.removeEventListener('playbackStateDidChange', handleStateChange);
			musicKitInstance.removeEventListener('playbackProgressDidChange', handlePlaybackProgressChange);
			musicKitInstance.removeEventListener('nowPlayingItemDidChange', handleNowPlayingItemChange);
		}
	});

	// React to stationId changes (also runs on mount)
	$effect(() => {
		if (stationId) {
			init();
		}
	});
</script>

<div class="station-player" data-testid="station-player">
	{#if isLoading || !station || !tracks.length}
		<div style="display: flex; align-items: center; justify-content: center; height: 200px;">
			<Spinner />
		</div>
	{:else}
		<div data-testid="player-controls">
			<PlayerControls
				{currentTrack}
				{isPlaying}
				switchPrev={skipToPreviousItem}
				switchNext={skipToNextItem}
				onPlayPause={handlePlayPause}
				{isScrobblingEnabled}
				onScrobblingSwitch={handleScrobblingSwitch}
				{lastfmAuthenticated}
			/>
		</div>
		<div data-testid="playlist">
			<Playlist
				{tracks}
				{isPlaying}
				offset={getPlaylistPagingOffset()}
				limit={station.isContinuous ? 10 : 1000}
				{currentTrack}
				showAlbumInfo={station.isGroupedByAlbum}
				onTrackSwitch={handleTrackSwitched}
				onRemove={handleTracksRemoved}
			/>
		</div>
		<div data-testid="track-count" style="display: none;">{tracks.length}</div>
	{/if}
</div>
