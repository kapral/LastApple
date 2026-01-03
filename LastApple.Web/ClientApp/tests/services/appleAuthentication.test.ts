import { describe, it, expect, vi, beforeEach } from 'vitest';
import { get } from 'svelte/store';

// Use vi.hoisted to create mocks before they're hoisted
const { mockMusicKitInstance, mockAppleMusicApi } = vi.hoisted(() => ({
    mockMusicKitInstance: {
        isAuthorized: false,
        authorize: vi.fn().mockResolvedValue(undefined),
        unauthorize: vi.fn().mockResolvedValue(undefined),
        musicUserToken: 'mock-music-user-token',
        storefrontId: 'us'
    },
    mockAppleMusicApi: {
        postSessionData: vi.fn().mockResolvedValue({ id: 'session-123' }),
        logout: vi.fn().mockResolvedValue(undefined)
    }
}));

vi.mock('$lib/services/musicKit', () => ({
    default: {
        getInstance: vi.fn(() => Promise.resolve(mockMusicKitInstance))
    }
}));

vi.mock('$lib/api/appleMusicApi', () => ({
    default: mockAppleMusicApi
}));

// Mock localStorage
const mockLocalStorage = {
    getItem: vi.fn(),
    setItem: vi.fn(),
    removeItem: vi.fn(),
    clear: vi.fn()
};
vi.stubGlobal('localStorage', mockLocalStorage);

import { authorize, unauthorize, checkAuthorization } from '$lib/services/appleAuthentication';
import { appleAuthStore } from '$lib/stores/appleAuth';
import { AuthenticationState } from '$lib/models/authenticationState';

describe('appleAuthentication', () => {
    beforeEach(() => {
        vi.clearAllMocks();
        mockMusicKitInstance.isAuthorized = false;
        appleAuthStore.set({ state: AuthenticationState.Loading });
    });

    describe('authorize', () => {
        it('sets state to Loading initially', async () => {
            appleAuthStore.set({ state: AuthenticationState.Unauthenticated });

            const promise = authorize();

            // State should be Loading while authorizing
            expect(get(appleAuthStore).state).toBe(AuthenticationState.Loading);

            await promise;
        });

        it('sets state to Authenticated if already authorized', async () => {
            mockMusicKitInstance.isAuthorized = true;

            await authorize();

            expect(get(appleAuthStore).state).toBe(AuthenticationState.Authenticated);
        });

        it('calls kit.authorize if not already authorized', async () => {
            mockMusicKitInstance.isAuthorized = false;

            await authorize();

            expect(mockMusicKitInstance.authorize).toHaveBeenCalled();
        });

        it('does not call kit.authorize if already authorized', async () => {
            mockMusicKitInstance.isAuthorized = true;

            await authorize();

            expect(mockMusicKitInstance.authorize).not.toHaveBeenCalled();
        });

        it('sets state to Authenticated after successful authorization', async () => {
            mockMusicKitInstance.isAuthorized = false;
            mockMusicKitInstance.authorize.mockImplementation(() => {
                mockMusicKitInstance.isAuthorized = true;
                return Promise.resolve();
            });

            await authorize();

            expect(get(appleAuthStore).state).toBe(AuthenticationState.Authenticated);
        });

        it('sets state to Unauthenticated if authorization fails', async () => {
            mockMusicKitInstance.isAuthorized = false;
            mockMusicKitInstance.authorize.mockImplementation(() => {
                // Authorization fails, isAuthorized remains false
                return Promise.resolve();
            });

            await authorize();

            expect(get(appleAuthStore).state).toBe(AuthenticationState.Unauthenticated);
        });

        it('posts session data after successful authorization', async () => {
            mockMusicKitInstance.isAuthorized = false;
            mockMusicKitInstance.authorize.mockImplementation(() => {
                mockMusicKitInstance.isAuthorized = true;
                return Promise.resolve();
            });

            await authorize();

            expect(mockAppleMusicApi.postSessionData).toHaveBeenCalledWith({
                musicUserToken: 'mock-music-user-token',
                musicStorefrontId: 'us'
            });
        });

        it('saves session ID to localStorage after authorization', async () => {
            mockMusicKitInstance.isAuthorized = false;
            mockMusicKitInstance.authorize.mockImplementation(() => {
                mockMusicKitInstance.isAuthorized = true;
                return Promise.resolve();
            });

            await authorize();

            expect(mockLocalStorage.setItem).toHaveBeenCalledWith('SessionId', 'session-123');
        });
    });

    describe('unauthorize', () => {
        it('sets state to Loading initially', async () => {
            appleAuthStore.set({ state: AuthenticationState.Authenticated });

            const promise = unauthorize();

            expect(get(appleAuthStore).state).toBe(AuthenticationState.Loading);

            await promise;
        });

        it('sets state to Unauthenticated if not currently authorized', async () => {
            mockMusicKitInstance.isAuthorized = false;

            await unauthorize();

            expect(get(appleAuthStore).state).toBe(AuthenticationState.Unauthenticated);
        });

        it('calls kit.unauthorize if currently authorized', async () => {
            mockMusicKitInstance.isAuthorized = true;

            await unauthorize();

            expect(mockMusicKitInstance.unauthorize).toHaveBeenCalled();
        });

        it('does not call kit.unauthorize if not authorized', async () => {
            mockMusicKitInstance.isAuthorized = false;

            await unauthorize();

            expect(mockMusicKitInstance.unauthorize).not.toHaveBeenCalled();
        });

        it('calls appleMusicApi.logout when unauthorizing', async () => {
            mockMusicKitInstance.isAuthorized = true;

            await unauthorize();

            expect(mockAppleMusicApi.logout).toHaveBeenCalled();
        });

        it('sets state to Unauthenticated after unauthorizing', async () => {
            mockMusicKitInstance.isAuthorized = true;

            await unauthorize();

            expect(get(appleAuthStore).state).toBe(AuthenticationState.Unauthenticated);
        });
    });

    describe('checkAuthorization', () => {
        it('sets state to Loading initially', async () => {
            appleAuthStore.set({ state: AuthenticationState.Unauthenticated });

            const promise = checkAuthorization();

            expect(get(appleAuthStore).state).toBe(AuthenticationState.Loading);

            await promise;
        });

        it('sets state to Authenticated if kit is authorized', async () => {
            mockMusicKitInstance.isAuthorized = true;

            await checkAuthorization();

            expect(get(appleAuthStore).state).toBe(AuthenticationState.Authenticated);
        });

        it('sets state to Unauthenticated if kit is not authorized', async () => {
            mockMusicKitInstance.isAuthorized = false;

            await checkAuthorization();

            expect(get(appleAuthStore).state).toBe(AuthenticationState.Unauthenticated);
        });
    });
});
