// Last.fm API client
import environment from '$lib/services/environment';

const API_URL = environment.apiUrl;

export interface ILastfmUser {
    readonly name: string;
    readonly url: string;
    readonly avatar: Array<string>;
}

interface ILastfmArtist {
    name: string;
    url?: string;
}

function getSessionId(): string | null {
    if (typeof localStorage === 'undefined') return null;
    return localStorage.getItem('SessionId');
}

const lastfmApi = {
    async getAuthUrl(redirectUrl: string): Promise<string> {
        const encodedUrl = encodeURIComponent(redirectUrl);
        const response = await fetch(`${API_URL}api/lastfm/auth?redirectUrl=${encodedUrl}`);
        return await response.json();
    },

    async searchArtist(searchTerm: string): Promise<ILastfmArtist[]> {
        const response = await fetch(`${API_URL}api/lastfm/artist/search?term=${searchTerm}`);
        return await response.json();
    },

    async searchTag(searchTerm: string): Promise<{ name: string }[]> {
        const response = await fetch(`${API_URL}api/lastfm/tag/search?term=${searchTerm}`);
        return await response.json();
    },

    async postToken(token: string): Promise<string> {
        const response = await fetch(`${API_URL}api/lastfm/auth?token=${token}`, {
            method: 'POST',
            headers: { 'X-SessionId': getSessionId() || '' }
        });
        return await response.json();
    },

    async logout(): Promise<Response> {
        return await fetch(`${API_URL}api/lastfm/auth`, {
            method: 'DELETE',
            headers: { 'X-SessionId': getSessionId() || '' }
        });
    },

    async getUser(): Promise<ILastfmUser> {
        const response = await fetch(`${API_URL}api/lastfm/auth/user`, {
            headers: { 'X-SessionId': getSessionId() || '' }
        });
        return await response.json();
    },

    async scrobble(song: string, artist: string, album?: string, timestamp?: number): Promise<void> {
        await fetch(`${API_URL}api/lastfm/scrobble`, {
            method: 'POST',
            headers: {
                'X-SessionId': getSessionId() || '',
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({ artist, song, album, timestamp })
        });
    },

    async updateNowPlaying(song: string, artist: string, album?: string): Promise<void> {
        await fetch(`${API_URL}api/lastfm/nowPlaying`, {
            method: 'POST',
            headers: {
                'X-SessionId': getSessionId() || '',
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({ artist, song, album })
        });
    }
};

export default lastfmApi;

// Named exports for convenience
export const { getAuthUrl, searchArtist, searchTag, postToken, logout, getUser, scrobble, updateNowPlaying } = lastfmApi;
