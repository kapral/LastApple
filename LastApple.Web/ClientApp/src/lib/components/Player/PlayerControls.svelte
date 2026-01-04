<script lang="ts">
    import { getImageUrl } from '$lib/utils/imageUtils';
    import PlayerHeader from './PlayerHeader.svelte';
    import ProgressControl from './ProgressControl.svelte';
    import Icon from '$lib/components/Icons/Icon.svelte';

    interface Props {
        currentTrack: MusicKit.MediaItem | undefined;
        isPlaying: boolean;
        switchPrev: () => void;
        switchNext: () => void;
        onPlayPause: () => void;
        isScrobblingEnabled: boolean;
        onScrobblingSwitch: (enabled: boolean) => void;
        lastfmAuthenticated: boolean;
    }

    let {
        currentTrack,
        isPlaying,
        switchPrev,
        switchNext,
        onPlayPause,
        isScrobblingEnabled,
        onScrobblingSwitch,
        lastfmAuthenticated
    }: Props = $props();

    let artworkUrl = $derived(
        currentTrack?.attributes?.artwork?.url
            ? getImageUrl(currentTrack.attributes.artwork.url)
            : 'default-album-cover.png'
    );
</script>

<div class="player-controls">
    <div class="art-container">
        {#if currentTrack}
            <PlayerHeader
                {currentTrack}
                {isScrobblingEnabled}
                {onScrobblingSwitch}
                {lastfmAuthenticated}
            />
        {/if}
        <div class="album-art" style:background-image="url({artworkUrl})">
            <div class="controls-container">
                <div class="progress-row">
                    <ProgressControl />
                </div>
                <button
                    class="control-button"
                    onclick={() => switchPrev()}
                    aria-label="previous"
                >
                    <Icon name="step-backward" size={24} />
                </button>
                <button
                    class="control-button"
                    onclick={() => onPlayPause()}
                    aria-label={isPlaying ? 'pause' : 'play'}
                >
                    <Icon name={isPlaying ? 'pause' : 'play'} size={24} />
                </button>
                <button
                    class="control-button"
                    onclick={() => switchNext()}
                    aria-label="next"
                >
                    <Icon name="step-forward" size={24} />
                </button>
            </div>
        </div>
    </div>
</div>
