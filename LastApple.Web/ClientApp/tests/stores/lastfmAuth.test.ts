import { describe, it, expect, beforeEach } from 'vitest';
import { get } from 'svelte/store';
import { lastfmAuthStore, lastfmAuthState } from '$lib/stores/lastfmAuth';
import { AuthenticationState } from '$lib/models/authenticationState';

describe('lastfmAuth store', () => {
    beforeEach(() => {
        // Reset to initial state
        lastfmAuthStore.set({
            state: AuthenticationState.Loading,
            user: undefined,
            isScrobblingEnabled: true
        });
    });

    describe('initial state', () => {
        it('has Loading as initial authentication state', () => {
            const state = get(lastfmAuthStore);
            expect(state.state).toBe(AuthenticationState.Loading);
        });

        it('has undefined user initially', () => {
            const state = get(lastfmAuthStore);
            expect(state.user).toBeUndefined();
        });

        it('has scrobbling enabled by default', () => {
            const state = get(lastfmAuthStore);
            expect(state.isScrobblingEnabled).toBe(true);
        });
    });

    describe('setState', () => {
        it('can set state to Authenticated', () => {
            lastfmAuthStore.setState(AuthenticationState.Authenticated);

            expect(get(lastfmAuthStore).state).toBe(AuthenticationState.Authenticated);
        });

        it('can set state to Unauthenticated', () => {
            lastfmAuthStore.setState(AuthenticationState.Unauthenticated);

            expect(get(lastfmAuthStore).state).toBe(AuthenticationState.Unauthenticated);
        });

        it('preserves other properties when setting state', () => {
            const user = { name: 'testuser', image: 'http://example.com/img.jpg' };
            lastfmAuthStore.setUser(user);
            lastfmAuthStore.setIsScrobblingEnabled(false);

            lastfmAuthStore.setState(AuthenticationState.Authenticated);

            const state = get(lastfmAuthStore);
            expect(state.user).toEqual(user);
            expect(state.isScrobblingEnabled).toBe(false);
        });
    });

    describe('setUser', () => {
        it('can set user data', () => {
            const user = { name: 'testuser', image: 'http://example.com/avatar.jpg' };

            lastfmAuthStore.setUser(user);

            expect(get(lastfmAuthStore).user).toEqual(user);
        });

        it('can set user to undefined', () => {
            lastfmAuthStore.setUser({ name: 'testuser' });
            lastfmAuthStore.setUser(undefined);

            expect(get(lastfmAuthStore).user).toBeUndefined();
        });

        it('preserves other properties when setting user', () => {
            lastfmAuthStore.setState(AuthenticationState.Authenticated);
            lastfmAuthStore.setIsScrobblingEnabled(false);

            lastfmAuthStore.setUser({ name: 'newuser' });

            const state = get(lastfmAuthStore);
            expect(state.state).toBe(AuthenticationState.Authenticated);
            expect(state.isScrobblingEnabled).toBe(false);
        });
    });

    describe('setIsScrobblingEnabled', () => {
        it('can disable scrobbling', () => {
            lastfmAuthStore.setIsScrobblingEnabled(false);

            expect(get(lastfmAuthStore).isScrobblingEnabled).toBe(false);
        });

        it('can enable scrobbling', () => {
            lastfmAuthStore.setIsScrobblingEnabled(false);
            lastfmAuthStore.setIsScrobblingEnabled(true);

            expect(get(lastfmAuthStore).isScrobblingEnabled).toBe(true);
        });

        it('preserves other properties when toggling scrobbling', () => {
            const user = { name: 'testuser' };
            lastfmAuthStore.setState(AuthenticationState.Authenticated);
            lastfmAuthStore.setUser(user);

            lastfmAuthStore.setIsScrobblingEnabled(false);

            const state = get(lastfmAuthStore);
            expect(state.state).toBe(AuthenticationState.Authenticated);
            expect(state.user).toEqual(user);
        });
    });

    describe('set', () => {
        it('can set the entire store state at once', () => {
            const newState = {
                state: AuthenticationState.Authenticated,
                user: { name: 'testuser', image: 'http://example.com/img.jpg' },
                isScrobblingEnabled: false
            };

            lastfmAuthStore.set(newState);

            expect(get(lastfmAuthStore)).toEqual(newState);
        });
    });

    describe('subscription', () => {
        it('notifies subscribers when state changes', () => {
            const values: AuthenticationState[] = [];

            const unsubscribe = lastfmAuthStore.subscribe(value => {
                values.push(value.state);
            });

            lastfmAuthStore.setState(AuthenticationState.Authenticated);
            lastfmAuthStore.setState(AuthenticationState.Unauthenticated);

            unsubscribe();

            expect(values).toEqual([
                AuthenticationState.Loading,
                AuthenticationState.Authenticated,
                AuthenticationState.Unauthenticated
            ]);
        });
    });

    describe('lastfmAuthState alias', () => {
        it('is the same store as lastfmAuthStore', () => {
            expect(lastfmAuthState).toBe(lastfmAuthStore);
        });

        it('reflects changes made to lastfmAuthStore', () => {
            lastfmAuthStore.setState(AuthenticationState.Authenticated);

            expect(get(lastfmAuthState).state).toBe(AuthenticationState.Authenticated);
        });
    });
});
