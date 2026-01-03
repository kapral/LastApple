import { describe, it, expect, vi, beforeEach } from 'vitest';

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

describe('LastfmApi', () => {
    beforeEach(() => {
        vi.clearAllMocks();
        mockLocalStorage.getItem.mockReturnValue('test-session-id');
    });

    describe('getAuthUrl', () => {
        it('should fetch auth URL with encoded redirect URL', async () => {
            const redirectUrl = 'http://localhost:3000/callback';
            const mockAuthUrl = 'http://last.fm/auth?token=xyz';

            mockFetch.mockResolvedValueOnce({
                json: vi.fn().mockResolvedValue(mockAuthUrl)
            });

            const { default: LastfmApi } = await import('$lib/api/lastfmApi');
            const result = await LastfmApi.getAuthUrl(redirectUrl);

            expect(mockFetch).toHaveBeenCalledWith(
                'http://localhost:5000/api/lastfm/auth?redirectUrl=http%3A%2F%2Flocalhost%3A3000%2Fcallback'
            );
            expect(result).toBe(mockAuthUrl);
        });
    });

    describe('searchArtist', () => {
        it('should search for artist with search term', async () => {
            const searchTerm = 'Radiohead';
            const mockSearchResults = [
                { name: 'Radiohead', url: 'http://last.fm/artist/radiohead' }
            ];

            mockFetch.mockResolvedValueOnce({
                json: vi.fn().mockResolvedValue(mockSearchResults)
            });

            const { default: LastfmApi } = await import('$lib/api/lastfmApi');
            const result = await LastfmApi.searchArtist(searchTerm);

            expect(mockFetch).toHaveBeenCalledWith(
                'http://localhost:5000/api/lastfm/artist/search?term=Radiohead'
            );
            expect(result).toEqual(mockSearchResults);
        });
    });

    describe('searchTag', () => {
        it('should search for tags with search term', async () => {
            const searchTerm = 'indie';
            const mockSearchResults = [
                { name: 'indie', url: 'http://last.fm/tag/indie' }
            ];

            mockFetch.mockResolvedValueOnce({
                json: vi.fn().mockResolvedValue(mockSearchResults)
            });

            const { default: LastfmApi } = await import('$lib/api/lastfmApi');
            const result = await LastfmApi.searchTag(searchTerm);

            expect(mockFetch).toHaveBeenCalledWith(
                'http://localhost:5000/api/lastfm/tag/search?term=indie'
            );
            expect(result).toEqual(mockSearchResults);
        });
    });

    describe('postToken', () => {
        it('should post token with session header', async () => {
            const token = 'test-token';
            const mockResponse = { status: 200 };

            mockFetch.mockResolvedValueOnce(mockResponse);

            const { default: LastfmApi } = await import('$lib/api/lastfmApi');
            const result = await LastfmApi.postToken(token);

            expect(mockFetch).toHaveBeenCalledWith(
                'http://localhost:5000/api/lastfm/auth?token=test-token',
                {
                    method: 'POST',
                    headers: { 'X-SessionId': 'test-session-id' }
                }
            );
            expect(result).toBe(mockResponse);
        });
    });

    describe('logout', () => {
        it('should call logout endpoint with session header', async () => {
            const mockResponse = { status: 200 };

            mockFetch.mockResolvedValueOnce(mockResponse);

            const { default: LastfmApi } = await import('$lib/api/lastfmApi');
            const result = await LastfmApi.logout();

            expect(mockFetch).toHaveBeenCalledWith(
                'http://localhost:5000/api/lastfm/auth',
                {
                    method: 'DELETE',
                    headers: { 'X-SessionId': 'test-session-id' }
                }
            );
            expect(result).toBe(mockResponse);
        });
    });

    describe('getUser', () => {
        it('should fetch current user data', async () => {
            const mockUser = {
                name: 'testuser',
                url: 'http://last.fm/user/testuser',
                avatar: ['http://last.fm/avatar.jpg']
            };

            mockFetch.mockResolvedValueOnce({
                json: vi.fn().mockResolvedValue(mockUser)
            });

            const { default: LastfmApi } = await import('$lib/api/lastfmApi');
            const result = await LastfmApi.getUser();

            expect(mockFetch).toHaveBeenCalledWith(
                'http://localhost:5000/api/lastfm/user',
                {
                    headers: { 'X-SessionId': 'test-session-id' }
                }
            );
            expect(result).toEqual(mockUser);
        });
    });

    describe('scrobble', () => {
        it('should scrobble track with correct parameters', async () => {
            mockFetch.mockResolvedValueOnce({});

            const { default: LastfmApi } = await import('$lib/api/lastfmApi');
            await LastfmApi.scrobble('Test Song', 'Test Artist', 'Test Album', 1234567890);

            expect(mockFetch).toHaveBeenCalledWith(
                expect.stringContaining('http://localhost:5000/api/lastfm/scrobble'),
                expect.objectContaining({
                    method: 'POST',
                    headers: { 'X-SessionId': 'test-session-id' }
                })
            );
        });
    });

    describe('updateNowPlaying', () => {
        it('should update now playing with track info', async () => {
            mockFetch.mockResolvedValueOnce({});

            const { default: LastfmApi } = await import('$lib/api/lastfmApi');
            await LastfmApi.updateNowPlaying('Test Song', 'Test Artist', 'Test Album');

            expect(mockFetch).toHaveBeenCalledWith(
                expect.stringContaining('http://localhost:5000/api/lastfm/nowplaying'),
                expect.objectContaining({
                    method: 'POST',
                    headers: { 'X-SessionId': 'test-session-id' }
                })
            );
        });
    });
});
