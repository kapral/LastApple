// Mock the dependencies first
jest.mock('../../restClients/LastfmApi', () => ({
    __esModule: true,
    default: {
        getUser: jest.fn(),
        getAuthUrl: jest.fn(),
        postToken: jest.fn(),
        logout: jest.fn(),
    },
}));

// Mock localStorage
const mockLocalStorage = {
    getItem: jest.fn(),
    setItem: jest.fn(),
    removeItem: jest.fn(),
    clear: jest.fn(),
    length: 0,
    key: jest.fn(),
};

Object.defineProperty(window, 'localStorage', {
    value: mockLocalStorage,
    writable: true,
});

import LastfmAuthService from '../../lastfm/LastfmAuthService';

// Mock window.location and window.history
const mockLocation = {
    href: 'http://localhost:3000/',
    hash: '',
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
            const mockLastfmApi = require('../../restClients/LastfmApi').default;
            mockLastfmApi.getUser.mockResolvedValue(mockUser);

            const result = await LastfmAuthService.getAuthenticatedUser();

            expect(mockLastfmApi.getUser).toHaveBeenCalled();
            expect(result).toEqual(mockUser);
        });
    });

    describe('authenticate', () => {
        it('should redirect to auth URL', async () => {
            const authUrl = 'http://last.fm/auth?token=xyz';
            const mockLastfmApi = require('../../restClients/LastfmApi').default;
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
            const mockLastfmApi = require('../../restClients/LastfmApi').default;
            mockLastfmApi.postToken.mockResolvedValue(mockResponse);
            mockLocation.href = 'http://localhost:3000/?token=test-token#/home';
            mockLocation.hash = '#/home';

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
            const mockLastfmApi = require('../../restClients/LastfmApi').default;
            mockLastfmApi.postToken.mockResolvedValue(mockResponse);
            mockLocation.href = 'http://localhost:3000/?token=test-token';
            mockLocation.hash = '';

            await LastfmAuthService.postToken(token);

            expect(mockHistory.replaceState).toHaveBeenCalledWith({}, document.title, '/');
        });
    });

    describe('logout', () => {
        it('should call logout API', async () => {
            const mockLastfmApi = require('../../restClients/LastfmApi').default;
            mockLastfmApi.logout.mockResolvedValue(undefined);

            await LastfmAuthService.logout();

            expect(mockLastfmApi.logout).toHaveBeenCalled();
        });
    });
});