import AppleAuthService from '../../apple/AppleAuthService';
import musicKit from '../../musicKit';
import musicApi from '../../restClients/AppleMusicApi';
import AsMock from '../AsMock';
import { overrideMusicKitInstance, resetMusicKitMock } from '../utils/musicKitTestUtils';

jest.mock('../../musicKit');
jest.mock('../../restClients/AppleMusicApi');

// Type the mocked modules
const mockMusicApi = musicApi as jest.Mocked<typeof musicApi>;

// Mock localStorage
const mockLocalStorage = {
    getItem: jest.fn(),
    setItem: jest.fn(),
    removeItem: jest.fn(),
    clear: jest.fn(),
};
Object.defineProperty(window, 'localStorage', {
    value: mockLocalStorage,
});

describe('AppleAuthService', () => {

    beforeEach(() => {
        jest.clearAllMocks();
        resetMusicKitMock();

        // Clear existing auth check promise to ensure clean state
        (AppleAuthService as any).existingAuthCheckPromise = null;
    });

    describe('isAuthenticated', () => {
        it('should return true if already authorized', async () => {
            overrideMusicKitInstance({ isAuthorized: true });

            const result = await AppleAuthService.isAuthenticated();

            expect(result).toBe(true);
            expect(mockMusicApi.getSessionData).not.toHaveBeenCalled();
        });

        it('should try to get existing authentication if not authorized', async () => {
            overrideMusicKitInstance({ isAuthorized: false });
            AsMock(mockMusicApi.getSessionData).mockResolvedValue({
                musicUserToken: 'existing-token',
                musicStorefrontId: 'us'
            });

            const instance = await musicKit.getInstance();

            // After setting tokens, simulate authorization
            AsMock(mockMusicApi.getSessionData).mockImplementation(() => {
                overrideMusicKitInstance({ isAuthorized: true });
                return Promise.resolve({
                    musicUserToken: 'existing-token',
                    musicStorefrontId: 'us'
                });
            });

            const result = await AppleAuthService.isAuthenticated();

            expect(mockMusicApi.getSessionData).toHaveBeenCalled();
            expect(mockLocalStorage.setItem).toHaveBeenCalledWith('existing-token.s', 'us');
            expect(result).toBe(true);
        });

        it('should handle case when no session data exists', async () => {
            overrideMusicKitInstance({ isAuthorized: false });
            AsMock(mockMusicApi.getSessionData).mockResolvedValue(null);

            const result = await AppleAuthService.isAuthenticated();

            expect(result).toBe(false);
        });

        it('should reuse existing auth check promise when called multiple times', async () => {
            overrideMusicKitInstance({ isAuthorized: false });
            AsMock(mockMusicApi.getSessionData).mockResolvedValue(null);

            // Call isAuthenticated twice simultaneously
            const [result1, result2] = await Promise.all([
                AppleAuthService.isAuthenticated(),
                AppleAuthService.isAuthenticated()
            ]);

            expect(result1).toBe(false);
            expect(result2).toBe(false);
            // Should only call getSessionData once due to promise reuse
            expect(mockMusicApi.getSessionData).toHaveBeenCalledTimes(1);
        });
    });

    describe('authenticate', () => {
        it('should authorize with MusicKit and save session data', async () => {
            overrideMusicKitInstance({ musicUserToken: 'new-token', storefrontId: 'us' });

            const sessionData = { id: 'session-123', musicUserToken: 'new-token', musicStorefrontId: 'us' };
            AsMock(mockMusicApi.postSessionData).mockResolvedValue(sessionData);

            await AppleAuthService.authenticate();

            expect(musicKit.instance.authorize).toHaveBeenCalled();
            expect(mockMusicApi.postSessionData).toHaveBeenCalledWith({
                musicUserToken: 'new-token',
                musicStorefrontId: 'us'
            });
            expect(mockLocalStorage.setItem).toHaveBeenCalledWith('SessionId', 'session-123');
        });
    });

    describe('logout', () => {
        it('should unauthorize with MusicKit and delete session data', async () => {
            AsMock(mockMusicApi.deleteSessionData).mockResolvedValue(undefined);

            await AppleAuthService.logout();

            expect(musicKit.instance.unauthorize).toHaveBeenCalled();
            expect(mockMusicApi.deleteSessionData).toHaveBeenCalled();
        });
    });
});