<script lang="ts">
	import { onMount, onDestroy } from 'svelte';
	import { browser } from '$app/environment';
	import { getMusicKitInstance, formatMediaTime } from '$lib/services/musicKit';

	let rewindPosition = $state(0);
	let currentPlaybackPercent = $state(0);
	let currentPlaybackTime = $state(0);
	let duration = $state(0);

	function handlePlaybackTimeChanged(event: any) {
		const eventCurrentPlaybackTime = event.currentPlaybackTime;
		const currentPlaybackDuration = event.currentPlaybackDuration;

		// Update duration from event
		if (currentPlaybackDuration && Number.isFinite(currentPlaybackDuration) && currentPlaybackDuration > 0) {
			duration = currentPlaybackDuration;
		}

		if (currentPlaybackDuration === 0 || !Number.isFinite(currentPlaybackDuration)) {
			currentPlaybackTime = eventCurrentPlaybackTime;
			currentPlaybackPercent = 0;
			return;
		}

		if (eventCurrentPlaybackTime === currentPlaybackTime) {
			const diff = (1 / currentPlaybackDuration / 4) * 100;
			currentPlaybackPercent = currentPlaybackPercent + diff;
			return;
		}

		currentPlaybackPercent = (eventCurrentPlaybackTime / currentPlaybackDuration) * 100;
		currentPlaybackTime = eventCurrentPlaybackTime;
	}

	function handleMove(e: MouseEvent) {
		const target = e.currentTarget as HTMLElement;
		const rect = target.getBoundingClientRect();
		const instance = getMusicKitInstance();
		const newRewindPosition = (e.clientX - rect.left) * instance.currentPlaybackDuration / rect.width;

		if (Math.abs(rewindPosition - newRewindPosition) < 1) {
			return;
		}

		rewindPosition = newRewindPosition;
	}

	async function handleSeek(time: number) {
		const instance = getMusicKitInstance();
		currentPlaybackPercent = (time / instance.currentPlaybackDuration) * 100;
		await instance.seekToTime(time);
	}

	async function handleClick() {
		await handleSeek(rewindPosition);
	}

	function handleMouseLeave() {
		rewindPosition = 0;
	}

	let rewindPercent = $derived(duration > 0 ? (rewindPosition / duration) * 100 : 0);

	onMount(() => {
		if (!browser) return;
		const instance = getMusicKitInstance();
		instance.addEventListener('playbackTimeDidChange', handlePlaybackTimeChanged);
	});

	onDestroy(() => {
		if (!browser) return;
		try {
			const instance = getMusicKitInstance();
			instance.removeEventListener('playbackTimeDidChange', handlePlaybackTimeChanged);
		} catch {
			// Instance may not be available during cleanup
		}
	});
</script>

<div class="progress-control">
	<span class="time-display">{formatMediaTime(currentPlaybackTime)}</span>
	<div class="progress-container">
		<!-- svelte-ignore a11y_click_events_have_key_events -->
		<!-- svelte-ignore a11y_no_static_element_interactions -->
		<div
			class="progress-wrapper"
			onmousemove={handleMove}
			onmouseup={handleClick}
			onmouseleave={handleMouseLeave}
		>
			<div class="audio-progress">
				<div
					class="playing-progress"
					style:width="{currentPlaybackPercent}%"
					style:display={rewindPercent !== 0 ? 'none' : 'block'}
				></div>
				<div
					class="playing-progress rewind"
					style:width="{rewindPercent}%"
				></div>
			</div>
		</div>
	</div>
	<span class="time-display">{formatMediaTime(duration)}</span>
</div>
