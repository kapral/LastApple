import { describe, it, expect, vi, beforeEach } from 'vitest';
import { get } from 'svelte/store';

// Use vi.hoisted to create mocks before they're hoisted
const { mockLastfmApi } = vi.hoisted(() => ({
    mockLastfmApi: {
        getUser: vi.fn(),
        getAuthUrl: vi.fn().mockResolvedValue('https://lastfm.com/auth'),
        postToken: vi.fn().mockResolvedValue('session-123'),
        logout: vi.fn().mockResolvedValue(undefined)
    }
}));

vi.mock('$lib/api/lastfmApi', () => ({
    default: mockLastfmApi
}));

// Mock localStorage
const mockLocalStorage = {
    getItem: vi.fn(),
    setItem: vi.fn(),
    removeItem: vi.fn(),
    clear: vi.fn()
};
vi.stubGlobal('localStorage', mockLocalStorage);

// Mock window.location
const mockLocation = {
    href: 'http://localhost:3000/',
    hash: ''
};
vi.stubGlobal('location', mockLocation);

// Mock window.history
const mockHistory = {
    replaceState: vi.fn()
};
vi.stubGlobal('history', mockHistory);

import { logout, login, checkAuthentication, handleCallback } from '$lib/services/lastfmAuthentication';
import { lastfmAuthStore } from '$lib/stores/lastfmAuth';
import { AuthenticationState } from '$lib/models/authenticationState';

describe('lastfmAuthentication', () => {
    beforeEach(() => {
        vi.clearAllMocks();
        mockLastfmApi.getUser.mockResolvedValue(null);
        lastfmAuthStore.set({
            state: AuthenticationState.Loading,
            user: undefined,
            isScrobblingEnabled: true
        });
        mockLocation.href = 'http://localhost:3000/';
        mockLocation.hash = '';
    });

    describe('logout', () => {
        it('sets state to Loading initially', async () => {
            lastfmAuthStore.set({
                state: AuthenticationState.Authenticated,
                user: { name: 'testuser' },
                isScrobblingEnabled: true
            });

            const promise = logout();

            expect(get(lastfmAuthStore).state).toBe(AuthenticationState.Loading);

            await promise;
        });

        it('sets state to Unauthenticated if no user is logged in', async () => {
            mockLastfmApi.getUser.mockResolvedValue(null);

            await logout();

            expect(get(lastfmAuthStore).state).toBe(AuthenticationState.Unauthenticated);
        });

        it('calls lastfmApi.logout if user is logged in', async () => {
            mockLastfmApi.getUser.mockResolvedValue({ name: 'testuser' });

            await logout();

            expect(mockLastfmApi.logout).toHaveBeenCalled();
        });

        it('does not call lastfmApi.logout if no user is logged in', async () => {
            mockLastfmApi.getUser.mockResolvedValue(null);

            await logout();

            expect(mockLastfmApi.logout).not.toHaveBeenCalled();
        });

        it('clears user from store after logout', async () => {
            mockLastfmApi.getUser.mockResolvedValue({ name: 'testuser' });

            await logout();

            expect(get(lastfmAuthStore).user).toBeUndefined();
        });

        it('sets state to Unauthenticated after logout', async () => {
            mockLastfmApi.getUser.mockResolvedValue({ name: 'testuser' });

            await logout();

            expect(get(lastfmAuthStore).state).toBe(AuthenticationState.Unauthenticated);
        });
    });

    describe('login', () => {
        it('sets state to Loading initially', async () => {
            lastfmAuthStore.set({
                state: AuthenticationState.Unauthenticated,
                user: undefined,
                isScrobblingEnabled: true
            });

            const promise = login();

            expect(get(lastfmAuthStore).state).toBe(AuthenticationState.Loading);

            await promise;
        });

        it('sets state to Authenticated if user is already logged in', async () => {
            mockLastfmApi.getUser.mockResolvedValue({ name: 'testuser' });

            await login();

            expect(get(lastfmAuthStore).state).toBe(AuthenticationState.Authenticated);
        });

        it('does not redirect if user is already logged in', async () => {
            mockLastfmApi.getUser.mockResolvedValue({ name: 'testuser' });
            const originalHref = mockLocation.href;

            await login();

            expect(mockLocation.href).toBe(originalHref);
        });

        it('redirects to auth page if user is not logged in', async () => {
            mockLastfmApi.getUser.mockResolvedValue(null);
            mockLastfmApi.getAuthUrl.mockResolvedValue('https://lastfm.com/auth?cb=http://localhost:3000/');

            await login();

            expect(mockLocation.href).toBe('https://lastfm.com/auth?cb=http://localhost:3000/');
        });

        it('requests auth URL with current location', async () => {
            mockLastfmApi.getUser.mockResolvedValue(null);
            mockLocation.href = 'http://myapp.com/page';

            await login();

            expect(mockLastfmApi.getAuthUrl).toHaveBeenCalledWith('http://myapp.com/page');
        });
    });

    describe('checkAuthentication', () => {
        it('sets state to Loading initially', async () => {
            lastfmAuthStore.set({
                state: AuthenticationState.Unauthenticated,
                user: undefined,
                isScrobblingEnabled: true
            });

            const promise = checkAuthentication();

            expect(get(lastfmAuthStore).state).toBe(AuthenticationState.Loading);

            await promise;
        });

        it('sets state to Authenticated if user is found', async () => {
            mockLastfmApi.getUser.mockResolvedValue({ name: 'testuser', image: 'http://img.com/avatar.jpg' });

            await checkAuthentication();

            expect(get(lastfmAuthStore).state).toBe(AuthenticationState.Authenticated);
        });

        it('sets state to Unauthenticated if no user is found', async () => {
            mockLastfmApi.getUser.mockResolvedValue(null);

            await checkAuthentication();

            expect(get(lastfmAuthStore).state).toBe(AuthenticationState.Unauthenticated);
        });

        it('stores user data in the store', async () => {
            const mockUser = { name: 'testuser', image: 'http://img.com/avatar.jpg' };
            mockLastfmApi.getUser.mockResolvedValue(mockUser);

            await checkAuthentication();

            expect(get(lastfmAuthStore).user).toEqual(mockUser);
        });

        it('clears user data if no user is found', async () => {
            lastfmAuthStore.setUser({ name: 'olduser' });
            mockLastfmApi.getUser.mockResolvedValue(null);

            await checkAuthentication();

            expect(get(lastfmAuthStore).user).toBeNull();
        });
    });

    describe('handleCallback', () => {
        it('returns false if no token in URL params', async () => {
            mockLocation.href = 'http://localhost:3000/';

            const result = await handleCallback();

            expect(result).toBe(false);
        });

        it('returns true if token is in URL params', async () => {
            mockLocation.href = 'http://localhost:3000/?token=abc123';

            const result = await handleCallback();

            expect(result).toBe(true);
        });

        it('posts token to API when token is present', async () => {
            mockLocation.href = 'http://localhost:3000/?token=abc123';

            await handleCallback();

            expect(mockLastfmApi.postToken).toHaveBeenCalledWith('abc123');
        });

        it('saves session ID to localStorage after posting token', async () => {
            mockLocation.href = 'http://localhost:3000/?token=abc123';
            mockLastfmApi.postToken.mockResolvedValue('new-session-id');

            await handleCallback();

            expect(mockLocalStorage.setItem).toHaveBeenCalledWith('SessionId', 'new-session-id');
        });

        it('cleans URL after handling callback', async () => {
            mockLocation.href = 'http://localhost:3000/?token=abc123';
            mockLocation.hash = '#/player';

            await handleCallback();

            expect(mockHistory.replaceState).toHaveBeenCalledWith({}, document.title, '/#/player');
        });

        it('checks authentication after handling callback', async () => {
            mockLocation.href = 'http://localhost:3000/?token=abc123';
            mockLastfmApi.getUser.mockResolvedValue({ name: 'newuser' });

            await handleCallback();

            // checkAuthentication is called, which calls getUser
            expect(mockLastfmApi.getUser).toHaveBeenCalled();
        });
    });
});
