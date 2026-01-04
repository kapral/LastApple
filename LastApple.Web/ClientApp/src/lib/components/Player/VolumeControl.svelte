<script lang="ts">
    import { onMount, onDestroy } from 'svelte';
    import musicKit from '$lib/services/musicKit';
    import Icon from '$lib/components/Icons/Icon.svelte';

    let volume = $state(1);
    let isMuted = $state(false);
    let previousVolume = $state(1);

    function handleVolumeChange(event: Event) {
        const input = event.target as HTMLInputElement;
        const newVolume = parseFloat(input.value);
        volume = newVolume;
        isMuted = newVolume === 0;
        
        const instance = musicKit.getExistingInstance();
        if (instance) {
            instance.volume = newVolume;
        }
    }

    function toggleMute() {
        const instance = musicKit.getExistingInstance();
        if (!instance) return;

        if (isMuted) {
            volume = previousVolume > 0 ? previousVolume : 1;
            isMuted = false;
        } else {
            previousVolume = volume;
            volume = 0;
            isMuted = true;
        }
        
        instance.volume = volume;
    }

    onMount(() => {
        const instance = musicKit.getExistingInstance();
        if (instance) {
            volume = instance.volume ?? 1;
            isMuted = volume === 0;
        }
    });
</script>

<div 
    class="volume-control"
    role="group"
    aria-label="Volume control"
>
    <button
        class="volume-button"
        onclick={toggleMute}
        aria-label={isMuted ? 'unmute' : 'mute'}
    >
        <Icon name={isMuted ? 'volume-mute' : 'volume-up'} size={20} />
    </button>
    <input
        type="range"
        min="0"
        max="1"
        step="0.01"
        value={volume}
        oninput={handleVolumeChange}
        class="volume-slider"
        aria-label="Volume"
    />
</div>
