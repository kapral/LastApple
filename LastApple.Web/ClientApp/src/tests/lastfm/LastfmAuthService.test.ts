import LastfmAuthService from '../../lastfm/LastfmAuthService';

// Mock the dependencies
const mockLastfmApi = {
    getUser: jest.fn(),
    getAuthUrl: jest.fn(),
    postToken: jest.fn(),
    logout: jest.fn(),
};

jest.mock('../../restClients/LastfmApi', () => ({
    default: mockLastfmApi,
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

// Mock window.location and window.history
const mockLocation = {
    href: 'http://localhost:3000/',
    replace: jest.fn(),
};
const mockHistory = {
    replaceState: jest.fn(),
};
Object.defineProperty(window, 'location', {
    value: mockLocation,
    writable: true,
});
Object.defineProperty(window, 'history', {
    value: mockHistory,
    writable: true,
});

describe('LastfmAuthService', () => {
    beforeEach(() => {
        jest.clearAllMocks();
        mockLocation.href = 'http://localhost:3000/';
    });

    describe('getAuthenticatedUser', () => {
        it('should return user data from API', async () => {
            const mockUser = {
                name: 'testuser',
                url: 'http://last.fm/user/testuser',
                avatar: ['http://last.fm/avatar.jpg']
            };
            mockLastfmApi.getUser.mockResolvedValue(mockUser);

            const result = await LastfmAuthService.getAuthenticatedUser();

            expect(mockLastfmApi.getUser).toHaveBeenCalled();
            expect(result).toEqual(mockUser);
        });
    });

    describe('authenticate', () => {
        it('should redirect to auth URL', async () => {
            const authUrl = 'http://last.fm/auth?token=xyz';
            mockLastfmApi.getAuthUrl.mockResolvedValue(authUrl);

            await LastfmAuthService.authenticate();

            expect(mockLastfmApi.getAuthUrl).toHaveBeenCalledWith('http://localhost:3000/');
            expect(mockLocation.href).toBe(authUrl);
        });
    });

    describe('tryGetAuthFromParams', () => {
        it('should return token from URL search params', () => {
            mockLocation.href = 'http://localhost:3000/?token=test-token&other=param';

            const result = LastfmAuthService.tryGetAuthFromParams();

            expect(result).toBe('test-token');
        });

        it('should return null if no token in URL', () => {
            mockLocation.href = 'http://localhost:3000/?other=param';

            const result = LastfmAuthService.tryGetAuthFromParams();

            expect(result).toBeNull();
        });

        it('should return null if URL has no search params', () => {
            mockLocation.href = 'http://localhost:3000/';

            const result = LastfmAuthService.tryGetAuthFromParams();

            expect(result).toBeNull();
        });
    });

    describe('postToken', () => {
        it('should post token and save session ID', async () => {
            const token = 'test-token';
            const sessionId = 'session-123';
            const mockResponse = {
                json: jest.fn().mockResolvedValue(sessionId),
            };
            mockLastfmApi.postToken.mockResolvedValue(mockResponse);
            mockLocation.href = 'http://localhost:3000/?token=test-token#/home';

            await LastfmAuthService.postToken(token);

            expect(mockLastfmApi.postToken).toHaveBeenCalledWith(token);
            expect(mockResponse.json).toHaveBeenCalled();
            expect(mockLocalStorage.setItem).toHaveBeenCalledWith('SessionId', sessionId);
            expect(mockHistory.replaceState).toHaveBeenCalledWith({}, document.title, '/#/home');
        });

        it('should handle URL without hash', async () => {
            const token = 'test-token';
            const sessionId = 'session-123';
            const mockResponse = {
                json: jest.fn().mockResolvedValue(sessionId),
            };
            mockLastfmApi.postToken.mockResolvedValue(mockResponse);
            mockLocation.href = 'http://localhost:3000/?token=test-token';

            await LastfmAuthService.postToken(token);

            expect(mockHistory.replaceState).toHaveBeenCalledWith({}, document.title, '/');
        });
    });

    describe('logout', () => {
        it('should call logout API', async () => {
            mockLastfmApi.logout.mockResolvedValue(undefined);

            await LastfmAuthService.logout();

            expect(mockLastfmApi.logout).toHaveBeenCalled();
        });
    });
});