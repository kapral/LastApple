<script lang="ts">
    import { page } from '$app/stores';
    import { latestStationId } from '$lib/stores/app';
    import LastfmAvatar from './LastfmAvatar.svelte';
    import logo from '$lib/images/logo.png';
    
    const navLinkStyle = 'color: #DDD; padding: 10px; text-decoration: none; display: inline-block;';
    const activeStyle = 'background: #222;';
    const nowPlayingActiveStyle = 'background: #0E0E0E;';
    
    let isHome = $derived($page.url.pathname === '/');
    let isStation = $derived($page.url.pathname.startsWith('/station/'));
    let isSettings = $derived($page.url.pathname === '/settings');
</script>

<div class="header" style="background: #000; padding: 10px 10px 0; padding-top: max(env(safe-area-inset-top), 10px);">
    <div style="display: flex; align-items: center;">
        <div style="flex: 1;"></div>
        <div class="title-container" style="flex: 5; display: flex; justify-content: center; align-items: center;">
            <img class="logo" src={logo} alt="logo" style="margin: 0 10px 3px 0;" />
            <h2 style="margin: 0; color: #DDD; text-align: center;">lastream</h2>
        </div>
        <div style="flex: 1; display: flex; justify-content: flex-end;">
            <LastfmAvatar />
        </div>
    </div>

    <div style="display: flex; align-items: center;">
        <a href="/" style="{navLinkStyle} {isHome ? activeStyle : ''}">New station</a>
        {#if $latestStationId}
            <a href="/station/{$latestStationId}" style="{navLinkStyle} {isStation ? nowPlayingActiveStyle : ''}">Now playing</a>
        {/if}
        <a href="/settings" style="{navLinkStyle} {isSettings ? nowPlayingActiveStyle : ''}">Settings</a>
    </div>
</div>
