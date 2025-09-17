import LastfmApi, { ILastfmUser } from '../../restClients/LastfmApi';
import environment from '../../Environment';
import AsMock from '../AsMock';

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

describe('LastfmApi', () => {
    beforeEach(() => {
        jest.clearAllMocks();
        AsMock(mockLocalStorage.getItem).mockReturnValue('test-session-id');
    });

    describe('getAuthUrl', () => {
        it('should fetch auth URL with encoded redirect URL', async () => {
            const redirectUrl = 'http://localhost:3000/callback';
            const mockAuthUrl = 'http://last.fm/auth?token=xyz';
            
            (fetch as jest.Mock).mockResolvedValueOnce({
                json: jest.fn().mockResolvedValue(mockAuthUrl),
            });

            const result = await LastfmApi.getAuthUrl(redirectUrl);

            expect(fetch).toHaveBeenCalledWith(
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
            
            (fetch as jest.Mock).mockResolvedValueOnce({
                json: jest.fn().mockResolvedValue(mockSearchResults),
            });

            const result = await LastfmApi.searchArtist(searchTerm);

            expect(fetch).toHaveBeenCalledWith(
                'http://localhost:5000/api/lastfm/artist/search?term=Radiohead'
            );
            expect(result).toEqual(mockSearchResults);
        });
    });

    describe('postToken', () => {
        it('should post token with session header', async () => {
            const token = 'test-token';
            const mockResponse = { status: 200 };
            
            (fetch as jest.Mock).mockResolvedValueOnce(mockResponse);

            const result = await LastfmApi.postToken(token);

            expect(fetch).toHaveBeenCalledWith(
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
            
            (fetch as jest.Mock).mockResolvedValueOnce(mockResponse);

            const result = await LastfmApi.logout();

            expect(fetch).toHaveBeenCalledWith(
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
        it('should fetch user data with session header', async () => {
            const mockUser: ILastfmUser = {
                name: 'testuser',
                url: 'http://last.fm/user/testuser',
                avatar: ['http://last.fm/avatar1.jpg', 'http://last.fm/avatar2.jpg']
            };
            
            (fetch as jest.Mock).mockResolvedValueOnce({
                json: jest.fn().mockResolvedValue(mockUser),
            });

            const result = await LastfmApi.getUser();

            expect(fetch).toHaveBeenCalledWith(
                'http://localhost:5000/api/lastfm/auth/user',
                {
                    headers: { 'X-SessionId': 'test-session-id' }
                }
            );
            expect(result).toEqual(mockUser);
        });
    });

    describe('postNowPlaying', () => {
        it('should post now playing with required parameters', async () => {
            (fetch as jest.Mock).mockResolvedValueOnce({});

            await LastfmApi.postNowPlaying('Artist', 'Song');

            expect(fetch).toHaveBeenCalledWith(
                'http://localhost:5000/api/lastfm/nowPlaying',
                {
                    method: 'POST',
                    headers: {
                        'X-SessionId': 'test-session-id',
                        'Content-Type': 'application/json'
                    },
                    body: JSON.stringify({
                        artist: 'Artist',
                        song: 'Song'
                    })
                }
            );
        });

        it('should post now playing with all parameters', async () => {
            (fetch as jest.Mock).mockResolvedValueOnce({});

            await LastfmApi.postNowPlaying('Artist', 'Song', 'Album', 180000);

            expect(fetch).toHaveBeenCalledWith(
                'http://localhost:5000/api/lastfm/nowPlaying',
                {
                    method: 'POST',
                    headers: {
                        'X-SessionId': 'test-session-id',
                        'Content-Type': 'application/json'
                    },
                    body: JSON.stringify({
                        artist: 'Artist',
                        song: 'Song',
                        album: 'Album',
                        durationInMillis: 180000
                    })
                }
            );
        });
    });

    describe('postScrobble', () => {
        it('should post scrobble with required parameters', async () => {
            (fetch as jest.Mock).mockResolvedValueOnce({});

            await LastfmApi.postScrobble('Artist', 'Song');

            expect(fetch).toHaveBeenCalledWith(
                'http://localhost:5000/api/lastfm/scrobble',
                {
                    method: 'POST',
                    headers: {
                        'X-SessionId': 'test-session-id',
                        'Content-Type': 'application/json'
                    },
                    body: JSON.stringify({
                        artist: 'Artist',
                        song: 'Song'
                    })
                }
            );
        });

        it('should post scrobble with all parameters', async () => {
            (fetch as jest.Mock).mockResolvedValueOnce({});

            await LastfmApi.postScrobble('Artist', 'Song', 'Album', 180000);

            expect(fetch).toHaveBeenCalledWith(
                'http://localhost:5000/api/lastfm/scrobble',
                {
                    method: 'POST',
                    headers: {
                        'X-SessionId': 'test-session-id',
                        'Content-Type': 'application/json'
                    },
                    body: JSON.stringify({
                        artist: 'Artist',
                        song: 'Song',
                        album: 'Album',
                        durationInMillis: 180000
                    })
                }
            );
        });
    });
});