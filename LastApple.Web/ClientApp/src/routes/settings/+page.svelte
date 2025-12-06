<script lang="ts">
  import { appleStore } from '$lib/stores/apple';
  import { lastfmStore } from '$lib/stores/lastfm';
  import { AuthenticationState } from '$lib/types/authentication';
  import { authorizeAppleMusic, unauthorizeAppleMusic } from '$lib/services/AppleAuthService';
  import { authorizeLastfm, unauthorizeLastfm } from '$lib/services/LastfmAuthService';

  $: isAppleAuthenticated = $appleStore.authenticationState === AuthenticationState.Authenticated;
  $: isLastfmAuthenticated = $lastfmStore.authenticationState === AuthenticationState.Authenticated;
  $: isLoading = $appleStore.authenticationState === AuthenticationState.Loading || 
                 $lastfmStore.authenticationState === AuthenticationState.Loading;

  async function toggleAppleAuthentication() {
    if (isAppleAuthenticated) {
      await unauthorizeAppleMusic();
    } else {
      await authorizeAppleMusic();
    }
  }

  async function toggleLastfmAuthentication() {
    if (isLastfmAuthenticated) {
      await unauthorizeLastfm();
    } else {
      await authorizeLastfm();
    }
  }
</script>

{#if isLoading}
  <div class="loading-container">
    <div class="spinner-border" role="status">
      <span class="visually-hidden">Loading...</span>
    </div>
  </div>
{:else}
  <div class="settings-container">
    <div class="settings-header">Connected accounts</div>
    
    <div class="settings-row">
      <img class="service-logo" src="/apple-music-logo.png" alt="Apple Music Logo" />
      <div class="service-name">Apple Music</div>
      <label class="toggle-switch">
        <input 
          type="checkbox" 
          checked={isAppleAuthenticated}
          on:change={toggleAppleAuthentication}
          role="switch"
        />
        <span class="slider"></span>
      </label>
    </div>

    <div class="settings-row">
      <img class="service-logo" src="/lastfm-logo.png" alt="Last.fm logo" />
      <div class="service-name">Last.fm</div>
      <label class="toggle-switch">
        <input 
          type="checkbox" 
          checked={isLastfmAuthenticated}
          on:change={toggleLastfmAuthentication}
          role="switch"
        />
        <span class="slider"></span>
      </label>
    </div>
  </div>
{/if}

<style>
  .loading-container {
    display: flex;
    align-items: center;
    justify-content: center;
    height: 200px;
  }

  .settings-container {
    display: flex;
    flex-direction: column;
  }

  .settings-header {
    background: #0E0E0E;
    padding: 10px 25px;
  }

  .settings-row {
    flex: 1;
    display: flex;
    padding: 20px;
    align-items: center;
    border-bottom: 1px solid #333;
  }

  .service-logo {
    height: 30px;
    margin-right: 15px;
  }

  .service-name {
    flex: 1;
  }

  /* Custom toggle switch styles (replacing react-switch) */
  .toggle-switch {
    position: relative;
    display: inline-block;
    width: 44px;
    height: 22px;
  }

  .toggle-switch input {
    opacity: 0;
    width: 0;
    height: 0;
  }

  .slider {
    position: absolute;
    cursor: pointer;
    top: 0;
    left: 0;
    right: 0;
    bottom: 0;
    background-color: #888;
    transition: .4s;
    border-radius: 22px;
  }

  .slider:before {
    position: absolute;
    content: "";
    height: 16px;
    width: 16px;
    left: 3px;
    bottom: 3px;
    background-color: white;
    transition: .4s;
    border-radius: 50%;
  }

  input:checked + .slider {
    background-color: #8e0000;
  }

  input:checked + .slider:before {
    transform: translateX(22px);
  }
</style>
