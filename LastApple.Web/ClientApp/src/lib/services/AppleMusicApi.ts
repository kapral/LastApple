import { Environment } from '$lib/Environment';

export interface ISessionData {
    id?: string;
    musicUserToken: string;
    musicStorefrontId: string;
}

export interface IArtist {
    id: string;
    name: string;
    artworkUrl?: string;
}

export interface ITag {
    id: string;
    name: string;
}

class AppleMusicApi {
    async getDeveloperToken(): Promise<string> {
        const tokenResponse = await fetch(`${Environment.apiUrl}api/apple/auth/developertoken`);
        return await tokenResponse.json();
    }

    async getSessionData(): Promise<ISessionData> {
        const sessionId = typeof window !== 'undefined' ? localStorage.getItem('SessionId') : null;
        const response = await fetch(`${Environment.apiUrl}api/apple/auth/sessiondata`, { 
            headers: { 'X-SessionId': sessionId || '' } 
        });
        return await response.json();
    }

    async postSessionData(data: ISessionData): Promise<ISessionData> {
        const sessionId = typeof window !== 'undefined' ? localStorage.getItem('SessionId') : null;
        const response = await fetch(`${Environment.apiUrl}api/apple/auth/sessiondata`, {
            body: JSON.stringify(data),
            method: 'POST',
            headers: {
                'X-SessionId': sessionId || '',
                'Content-Type': 'application/json'
            }
        });
        return await response.json();
    }

    async deleteSessionData(): Promise<void> {
        const sessionId = typeof window !== 'undefined' ? localStorage.getItem('SessionId') : null;
        await fetch(`${Environment.apiUrl}api/apple/auth/sessiondata`, {
            method: 'DELETE',
            headers: { 'X-SessionId': sessionId || '' }
        });
    }

    async searchArtists(term: string): Promise<IArtist[]> {
        const response = await fetch(`${Environment.apiUrl}api/applemusic/search/artists?term=${encodeURIComponent(term)}`);
        return await response.json();
    }

    async searchTags(term: string): Promise<ITag[]> {
        const response = await fetch(`${Environment.apiUrl}api/applemusic/search/tags?term=${encodeURIComponent(term)}`);
        return await response.json();
    }
}

const appleMusicApi = new AppleMusicApi();
export default appleMusicApi;
