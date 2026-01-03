import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';

// Mock environment
vi.mock('$lib/config/environment', () => ({
    default: {
        apiUrl: 'http://localhost:5000/'
    }
}));

// Mock fetch
const mockFetch = vi.fn();
vi.stubGlobal('fetch', mockFetch);

// Mock localStorage
const mockLocalStorage = {
    getItem: vi.fn(),
    setItem: vi.fn(),
    removeItem: vi.fn(),
    clear: vi.fn()
};
vi.stubGlobal('localStorage', mockLocalStorage);

describe('AppleMusicApi', () => {
    beforeEach(() => {
        vi.clearAllMocks();
        mockLocalStorage.getItem.mockReturnValue('test-session-id');
    });

    describe('getDeveloperToken', () => {
        it('should fetch developer token from API', async () => {
            const mockToken = 'test-developer-token';
            mockFetch.mockResolvedValueOnce({
                json: vi.fn().mockResolvedValue(mockToken)
            });

            const { default: AppleMusicApi } = await import('$lib/api/appleMusicApi');
            const result = await AppleMusicApi.getDeveloperToken();

            expect(mockFetch).toHaveBeenCalledWith('http://localhost:5000/api/apple/auth/developertoken');
            expect(result).toBe(mockToken);
        });
    });

    describe('getSessionData', () => {
        it('should fetch session data with session ID header', async () => {
            const mockSessionData = {
                id: 'session-id',
                musicUserToken: 'user-token',
                musicStorefrontId: 'us'
            };

            mockFetch.mockResolvedValueOnce({
                json: vi.fn().mockResolvedValue(mockSessionData)
            });

            const { default: AppleMusicApi } = await import('$lib/api/appleMusicApi');
            const result = await AppleMusicApi.getSessionData();

            expect(mockFetch).toHaveBeenCalledWith(
                'http://localhost:5000/api/apple/auth/sessiondata',
                {
                    headers: { 'X-SessionId': 'test-session-id' }
                }
            );
            expect(result).toEqual(mockSessionData);
        });
    });

    describe('postSessionData', () => {
        it('should post session data with correct headers and body', async () => {
            const inputData = {
                musicUserToken: 'user-token',
                musicStorefrontId: 'us'
            };

            const responseData = {
                id: 'new-session-id',
                musicUserToken: 'user-token',
                musicStorefrontId: 'us'
            };

            mockFetch.mockResolvedValueOnce({
                json: vi.fn().mockResolvedValue(responseData)
            });

            const { default: AppleMusicApi } = await import('$lib/api/appleMusicApi');
            const result = await AppleMusicApi.postSessionData(inputData);

            expect(mockFetch).toHaveBeenCalledWith(
                'http://localhost:5000/api/apple/auth/sessiondata',
                {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json',
                        'X-SessionId': 'test-session-id'
                    },
                    body: JSON.stringify(inputData)
                }
            );
            expect(result).toEqual(responseData);
        });
    });

    describe('logout', () => {
        it('should call logout endpoint with DELETE method', async () => {
            mockFetch.mockResolvedValueOnce({});

            const { default: AppleMusicApi } = await import('$lib/api/appleMusicApi');
            await AppleMusicApi.logout();

            expect(mockFetch).toHaveBeenCalledWith(
                'http://localhost:5000/api/apple/auth/sessiondata',
                {
                    method: 'DELETE',
                    headers: { 'X-SessionId': 'test-session-id' }
                }
            );
        });
    });
});
