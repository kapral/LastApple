<script lang="ts">
    import { getImageUrl } from '$lib/utils/imageUtils';
    import PlayerHeader from './PlayerHeader.svelte';
    import ProgressControl from './ProgressControl.svelte';
    import VolumeControl from './VolumeControl.svelte';
    import Icon from '$lib/components/Icons/Icon.svelte';
    import musicKit from '$lib/services/musicKit';

    interface Props {
        currentTrack: MusicKit.MediaItem | undefined;
        isPlaying: boolean;
        switchPrev: () => void;
        switchNext: () => void;
        onPlayPause: () => void;
        isScrobblingEnabled: boolean;
        onScrobblingSwitch: (enabled: boolean) => void;
        lastfmAuthenticated: boolean;
        isContinuous: boolean;
    }

    let {
        currentTrack,
        isPlaying,
        switchPrev,
        switchNext,
        onPlayPause,
        isScrobblingEnabled,
        onScrobblingSwitch,
        lastfmAuthenticated,
        isContinuous
    }: Props = $props();

    let shuffleMode = $state(false);

    async function toggleShuffle() {
        const instance = musicKit.getExistingInstance();
        if (!instance) return;

        shuffleMode = !shuffleMode;
        instance.shuffleMode = shuffleMode ? 1 : 0;
    }

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
                <div class="main-controls">
                    <div class="controls-left">
                    </div>
                    <div class="controls-center">
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
                    <div class="controls-right">
                        {#if !isContinuous}
                            <button
                                    class="control-button secondary"
                                    class:active={shuffleMode}
                                    onclick={toggleShuffle}
                                    aria-label="shuffle"
                                    aria-pressed={shuffleMode}
                            >
                                <Icon name="shuffle" size={16} />
                            </button>
                        {/if}
                        <VolumeControl />
                    </div>
                </div>
            </div>
        </div>
    </div>
</div>
