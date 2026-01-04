<script lang="ts">
    import CustomToggle from './CustomToggle.svelte';
    import Icon from '$lib/components/Icons/Icon.svelte';

    interface Props {
        track: MusicKit.MediaItem;
        isCurrent: boolean;
        isPlaying: boolean;
        groupOffset: number;
        index: number;
        onRemove: (position: number, count: number) => void;
        onTrackSwitch: (index: number) => void;
        addAlbumToLibrary: (track: MusicKit.MediaItem) => void;
        addToLibrary: (track: MusicKit.MediaItem) => void;
    }

    let { track, isCurrent, isPlaying, groupOffset, index, onRemove, onTrackSwitch, addAlbumToLibrary, addToLibrary }: Props = $props();

    let dropdownOpen = $state(false);

    function handlePlayClick() {
        onTrackSwitch(groupOffset + index);
    }

    function handleDoubleClick() {
        onTrackSwitch(groupOffset + index);
    }

    function toggleDropdown() {
        dropdownOpen = !dropdownOpen;
    }

    function closeDropdown() {
        dropdownOpen = false;
    }
</script>

<!-- svelte-ignore a11y_no_static_element_interactions -->
<div
    class="playlist-item clearfix"
    class:current={isCurrent}
    data-testid="playlist-track"
    ondblclick={handleDoubleClick}
>
    <div class="play-button" onclick={handlePlayClick}>
        <Icon name={isPlaying ? 'pause' : 'play'} size={16} />
    </div>
    <div class="dropdown" data-testid="dropdown">
        <CustomToggle onclick={toggleDropdown}>
            <span class="dropdown-icon"><Icon name="ellipsis-h" size={18} /></span>
        </CustomToggle>
        {#if dropdownOpen}
            <!-- svelte-ignore a11y_no_static_element_interactions -->
            <!-- svelte-ignore a11y_click_events_have_key_events -->
            <div class="dropdown-backdrop" onclick={closeDropdown}></div>
            <div class="dropdown-menu" data-testid="dropdown-menu">
                <button class="dropdown-item" onclick={() => { addToLibrary(track); closeDropdown(); }}>
                    <span class="menu-icon">
                        <Icon name="plus-square" size={16} />
                    </span>
                    <span>Add song to your AppleMusic Library</span>
                </button>
                <button class="dropdown-item" onclick={() => { addAlbumToLibrary(track); closeDropdown(); }}>
                    <span class="menu-icon">
                        <Icon name="folder-plus" size={16} />
                    </span>
                    <span>Add album to your AppleMusic Library</span>
                </button>
                <button class="dropdown-item" onclick={() => { onRemove(groupOffset + index, 1); closeDropdown(); }}>
                    <span class="menu-icon">
                        <Icon name="trash-alt" size={16} />
                    </span>
                    <span>Delete from this station</span>
                </button>
            </div>
        {/if}
    </div>
    <div class="track-info">
        <span data-testid="artist-name">{track.attributes.artistName}</span> - <span data-testid="track-name">{track.attributes.name}</span>
    </div>
</div>
