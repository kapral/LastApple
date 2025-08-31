import AppleMusicApi, { ISessionData } from '../../restClients/AppleMusicApi';
import environment from '../../Environment';

// Mock environment directly by setting properties
beforeAll(() => {
    Object.defineProperty(environment, 'apiUrl', {
        value: 'http://localhost:5000/',
        writable: true,
    });
});

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

// Mock fetch
global.fetch = jest.fn();

describe('AppleMusicApi', () => {
    beforeEach(() => {
        jest.clearAllMocks();
        mockLocalStorage.getItem.mockReturnValue('test-session-id');
    });

    describe('getDeveloperToken', () => {
        it('should fetch developer token from API', async () => {
            const mockToken = 'test-developer-token';
            (fetch as jest.Mock).mockResolvedValueOnce({
                json: jest.fn().mockResolvedValue(mockToken),
            });

            const result = await AppleMusicApi.getDeveloperToken();

            expect(fetch).toHaveBeenCalledWith('http://localhost:5000/api/apple/auth/developertoken');
            expect(result).toBe(mockToken);
        });
    });

    describe('getSessionData', () => {
        it('should fetch session data with session ID header', async () => {
            const mockSessionData: ISessionData = {
                id: 'session-id',
                musicUserToken: 'user-token',
                musicStorefrontId: 'us'
            };

            (fetch as jest.Mock).mockResolvedValueOnce({
                json: jest.fn().mockResolvedValue(mockSessionData),
            });

            const result = await AppleMusicApi.getSessionData();

            expect(fetch).toHaveBeenCalledWith(
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
            const inputData: ISessionData = {
                musicUserToken: 'user-token',
                musicStorefrontId: 'us'
            };
            
            const responseData: ISessionData = {
                id: 'new-session-id',
                musicUserToken: 'user-token',
                musicStorefrontId: 'us'
            };

            (fetch as jest.Mock).mockResolvedValueOnce({
                json: jest.fn().mockResolvedValue(responseData),
            });

            const result = await AppleMusicApi.postSessionData(inputData);

            expect(fetch).toHaveBeenCalledWith(
                'http://localhost:5000/api/apple/auth/sessiondata',
                {
                    body: JSON.stringify(inputData),
                    method: 'POST',
                    headers: {
                        'X-SessionId': 'test-session-id',
                        'Content-Type': 'application/json'
                    }
                }
            );
            expect(result).toEqual(responseData);
        });
    });

    describe('deleteSessionData', () => {
        it('should delete session data with session ID header', async () => {
            (fetch as jest.Mock).mockResolvedValueOnce({});

            await AppleMusicApi.deleteSessionData();

            expect(fetch).toHaveBeenCalledWith(
                'http://localhost:5000/api/apple/auth/sessiondata',
                {
                    method: 'DELETE',
                    headers: { 'X-SessionId': 'test-session-id' }
                }
            );
        });
    });
});