import { describe, it, expect, beforeEach } from 'vitest';
import { get } from 'svelte/store';
import { appleAuthStore, appleAuthState } from '$lib/stores/appleAuth';
import { AuthenticationState } from '$lib/models/authenticationState';

describe('appleAuth store', () => {
    beforeEach(() => {
        // Reset to initial loading state
        appleAuthStore.set({ state: AuthenticationState.Loading });
    });

    describe('initial state', () => {
        it('has Loading as initial state', () => {
            appleAuthStore.set({ state: AuthenticationState.Loading });
            const state = get(appleAuthStore);

            expect(state.state).toBe(AuthenticationState.Loading);
        });
    });

    describe('setState', () => {
        it('can set state to Authenticated', () => {
            appleAuthStore.setState(AuthenticationState.Authenticated);

            expect(get(appleAuthStore).state).toBe(AuthenticationState.Authenticated);
        });

        it('can set state to Unauthenticated', () => {
            appleAuthStore.setState(AuthenticationState.Unauthenticated);

            expect(get(appleAuthStore).state).toBe(AuthenticationState.Unauthenticated);
        });

        it('can set state to Loading', () => {
            appleAuthStore.setState(AuthenticationState.Authenticated);
            appleAuthStore.setState(AuthenticationState.Loading);

            expect(get(appleAuthStore).state).toBe(AuthenticationState.Loading);
        });
    });

    describe('set', () => {
        it('can set the entire store state', () => {
            appleAuthStore.set({ state: AuthenticationState.Authenticated });

            expect(get(appleAuthStore).state).toBe(AuthenticationState.Authenticated);
        });
    });

    describe('subscription', () => {
        it('notifies subscribers when state changes', () => {
            const states: AuthenticationState[] = [];

            const unsubscribe = appleAuthStore.subscribe(value => {
                states.push(value.state);
            });

            appleAuthStore.setState(AuthenticationState.Authenticated);
            appleAuthStore.setState(AuthenticationState.Unauthenticated);

            unsubscribe();

            expect(states).toEqual([
                AuthenticationState.Loading,
                AuthenticationState.Authenticated,
                AuthenticationState.Unauthenticated
            ]);
        });
    });

    describe('appleAuthState alias', () => {
        it('is the same store as appleAuthStore', () => {
            expect(appleAuthState).toBe(appleAuthStore);
        });

        it('can be subscribed to like appleAuthStore', () => {
            appleAuthStore.setState(AuthenticationState.Authenticated);

            expect(get(appleAuthState).state).toBe(AuthenticationState.Authenticated);
        });
    });
});
