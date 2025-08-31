import AppleAuthService from '../../apple/AppleAuthService';

import AppleAuthService from '../../apple/AppleAuthService';
import musicKit from '../../musicKit';
import musicApi from '../../restClients/AppleMusicApi';

jest.mock('../../musicKit');
jest.mock('../../restClients/AppleMusicApi');

// Type the mocked modules
const mockMusicKit = musicKit as jest.Mocked<typeof musicKit>;
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
    let mockMusicKitInstance: any;

    beforeEach(() => {
        jest.clearAllMocks();
        
        mockMusicKitInstance = {
            isAuthorized: false,
            musicUserToken: 'test-token',
            storefrontId: 'us',
            authorize: jest.fn(),
            unauthorize: jest.fn(),
        };
        
        mockMusicKit.getInstance.mockResolvedValue(mockMusicKitInstance);
    });

    describe('isAuthenticated', () => {
        it('should return true if already authorized', async () => {
            mockMusicKitInstance.isAuthorized = true;

            const result = await AppleAuthService.isAuthenticated();

            expect(result).toBe(true);
            expect(mockMusicApi.getSessionData).not.toHaveBeenCalled();
        });

        it('should try to get existing authentication if not authorized', async () => {
            mockMusicKitInstance.isAuthorized = false;
            mockMusicApi.getSessionData.mockResolvedValue({
                musicUserToken: 'existing-token',
                musicStorefrontId: 'us'
            });
            
            // After setting tokens, simulate authorization
            mockMusicApi.getSessionData.mockImplementation(() => {
                mockMusicKitInstance.isAuthorized = true;
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
            mockMusicKitInstance.isAuthorized = false;
            mockMusicApi.getSessionData.mockResolvedValue(null);

            const result = await AppleAuthService.isAuthenticated();

            expect(result).toBe(false);
        });

        it('should reuse existing auth check promise when called multiple times', async () => {
            mockMusicKitInstance.isAuthorized = false;
            mockMusicApi.getSessionData.mockResolvedValue(null);

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
            mockMusicKitInstance.authorize.mockResolvedValue(undefined);
            mockMusicKitInstance.musicUserToken = 'new-token';
            mockMusicKitInstance.storefrontId = 'us';
            
            const sessionData = { id: 'session-123', musicUserToken: 'new-token', musicStorefrontId: 'us' };
            mockMusicApi.postSessionData.mockResolvedValue(sessionData);

            await AppleAuthService.authenticate();

            expect(mockMusicKitInstance.authorize).toHaveBeenCalled();
            expect(mockMusicApi.postSessionData).toHaveBeenCalledWith({
                musicUserToken: 'new-token',
                musicStorefrontId: 'us'
            });
            expect(mockLocalStorage.setItem).toHaveBeenCalledWith('SessionId', 'session-123');
        });
    });

    describe('logout', () => {
        it('should unauthorize with MusicKit and delete session data', async () => {
            mockMusicKitInstance.unauthorize.mockResolvedValue(undefined);
            mockMusicApi.deleteSessionData.mockResolvedValue(undefined);

            await AppleAuthService.logout();

            expect(mockMusicKitInstance.unauthorize).toHaveBeenCalled();
            expect(mockMusicApi.deleteSessionData).toHaveBeenCalled();
        });
    });
});