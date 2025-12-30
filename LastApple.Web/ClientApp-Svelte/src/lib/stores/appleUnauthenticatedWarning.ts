import { derived, type Readable } from 'svelte/store';
import { appleAuthState } from './appleAuth';
import { AuthenticationState } from '$lib/services/authentication';

/**
 * Derived store that indicates whether the Apple unauthenticated warning should be shown.
 * Shows when Apple Music authentication state is Unauthenticated.
 */
export const appleUnauthenticatedWarning: Readable<boolean> = derived(
    appleAuthState,
    ($appleAuthState) => $appleAuthState.state === AuthenticationState.Unauthenticated
);
