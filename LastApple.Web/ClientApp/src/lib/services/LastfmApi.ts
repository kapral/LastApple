import { Environment } from '$lib/Environment';

export interface ILastfmUser {
    readonly name: string;
    readonly url: string;
    readonly avatar: Array<string>;
}

interface ScrobbleRequest {
    artist: string;
    song: string;
    album?: string;
    durationInMillis?: number;
}

class LastfmApi {
    async getAuthUrl(redirectUrl: string): Promise<string> {
        const encodedUrl = encodeURIComponent(redirectUrl);
        const authUrlResponse = await fetch(`${Environment.apiUrl}api/lastfm/auth?redirectUrl=${encodedUrl}`);
        return await authUrlResponse.json();
    }

    async searchArtist(searchTerm: string): Promise<any[]> {
        const apiResponse = await fetch(`${Environment.apiUrl}api/lastfm/artist/search?term=${encodeURIComponent(searchTerm)}`);
        return await apiResponse.json();
    }

    async postToken(token: string): Promise<Response> {
        const sessionId = typeof window !== 'undefined' ? localStorage.getItem('SessionId') : null;
        return await fetch(`${Environment.apiUrl}api/lastfm/auth?token=${token}`, { 
            method: 'POST', 
            headers: { 'X-SessionId': sessionId || '' } 
        });
    }

    async logout(): Promise<Response> {
        const sessionId = typeof window !== 'undefined' ? localStorage.getItem('SessionId') : null;
        return await fetch(`${Environment.apiUrl}api/lastfm/auth`, { 
            method: 'DELETE', 
            headers: { 'X-SessionId': sessionId || '' } 
        });
    }

    async getUser(): Promise<ILastfmUser> {
        const sessionId = typeof window !== 'undefined' ? localStorage.getItem('SessionId') : null;
        const userResponse = await fetch(`${Environment.apiUrl}api/lastfm/auth/user`, { 
            headers: { 'X-SessionId': sessionId || '' } 
        });
        return await userResponse.json();
    }

    async postNowPlaying(artist: string, song: string, album?: string, durationInMillis?: number): Promise<void> {
        const sessionId = typeof window !== 'undefined' ? localStorage.getItem('SessionId') : null;
        const requestBody: ScrobbleRequest = { artist, song, album, durationInMillis };
        
        await fetch(`${Environment.apiUrl}api/lastfm/nowPlaying`, { 
            method: 'POST', 
            headers: { 
                'X-SessionId': sessionId || '',
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(requestBody)
        });
    }

    async postScrobble(artist: string, song: string, album?: string, durationInMillis?: number): Promise<void> {
        const sessionId = typeof window !== 'undefined' ? localStorage.getItem('SessionId') : null;
        const requestBody: ScrobbleRequest = { artist, song, album, durationInMillis };
        
        await fetch(`${Environment.apiUrl}api/lastfm/scrobble`, { 
            method: 'POST', 
            headers: { 
                'X-SessionId': sessionId || '',
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(requestBody)
        });
    }
}

const lastfmApi = new LastfmApi();
export default lastfmApi;
