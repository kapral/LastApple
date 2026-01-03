<script lang="ts">
    import type { Snippet } from 'svelte';

    interface Props {
        onclick?: (event: MouseEvent) => void;
        children?: Snippet;
    }

    let { onclick, children }: Props = $props();

    function handleClick(e: MouseEvent) {
        e.preventDefault();
        onclick?.(e);
    }
</script>

<!-- svelte-ignore a11y_click_events_have_key_events -->
<!-- svelte-ignore a11y_no_static_element_interactions -->
<div class="custom-toggle" style="cursor: pointer;" onclick={handleClick}>
    {#if children}
        {@render children()}
    {/if}
</div>
