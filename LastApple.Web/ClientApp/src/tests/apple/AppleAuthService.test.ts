import AppleAuthService from '../../apple/AppleAuthService';

// Mock the dependencies
const mockMusicKit = {
  getInstance: jest.fn(),
  isAuthorized: false,
  musicUserToken: 'test-token',
  storefrontId: 'us',
  authorize: jest.fn(),
  unauthorize: jest.fn(),
};

const mockMusicApi = {
  getSessionData: jest.fn(),
  postSessionData: jest.fn(),
  deleteSessionData: jest.fn(),
};

jest.mock('../../musicKit', () => ({
  default: {
    getInstance: () => Promise.resolve(mockMusicKit),
  },
}));

jest.mock('../../restClients/AppleMusicApi', () => ({
  default: mockMusicApi,
}));

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
    mockMusicKit.isAuthorized = false;
    mockMusicKit.getInstance.mockResolvedValue(mockMusicKit);
  });

  describe('isAuthenticated', () => {
    it('should return true if already authorized', async () => {
      mockMusicKit.isAuthorized = true;

      const result = await AppleAuthService.isAuthenticated();

      expect(result).toBe(true);
      expect(mockMusicApi.getSessionData).not.toHaveBeenCalled();
    });

    it('should try to get existing authentication if not authorized', async () => {
      mockMusicKit.isAuthorized = false;
      mockMusicApi.getSessionData.mockResolvedValue({
        musicUserToken: 'existing-token',
        musicStorefrontId: 'us'
      });
      
      // After setting tokens, simulate authorization
      mockMusicApi.getSessionData.mockImplementation(() => {
        mockMusicKit.isAuthorized = true;
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
      mockMusicKit.isAuthorized = false;
      mockMusicApi.getSessionData.mockResolvedValue(null);

      const result = await AppleAuthService.isAuthenticated();

      expect(result).toBe(false);
    });

    it('should reuse existing auth check promise when called multiple times', async () => {
      mockMusicKit.isAuthorized = false;
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
      mockMusicKit.authorize.mockResolvedValue(undefined);
      mockMusicKit.musicUserToken = 'new-token';
      mockMusicKit.storefrontId = 'us';
      
      const sessionData = { id: 'session-123', musicUserToken: 'new-token', musicStorefrontId: 'us' };
      mockMusicApi.postSessionData.mockResolvedValue(sessionData);

      await AppleAuthService.authenticate();

      expect(mockMusicKit.authorize).toHaveBeenCalled();
      expect(mockMusicApi.postSessionData).toHaveBeenCalledWith({
        musicUserToken: 'new-token',
        musicStorefrontId: 'us'
      });
      expect(mockLocalStorage.setItem).toHaveBeenCalledWith('SessionId', 'session-123');
    });
  });

  describe('logout', () => {
    it('should unauthorize with MusicKit and delete session data', async () => {
      mockMusicKit.unauthorize.mockResolvedValue(undefined);
      mockMusicApi.deleteSessionData.mockResolvedValue(undefined);

      await AppleAuthService.logout();

      expect(mockMusicKit.unauthorize).toHaveBeenCalled();
      expect(mockMusicApi.deleteSessionData).toHaveBeenCalled();
    });
  });
});