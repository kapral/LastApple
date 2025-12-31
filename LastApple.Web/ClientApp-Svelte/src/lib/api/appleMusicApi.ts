// Apple Music API client
import environment from '$lib/services/environment';

const API_URL = environment.apiUrl;

export interface ISessionData {
    id?: string;
    musicUserToken: string;
    musicStorefrontId: string;
}

function getSessionId(): string | null {
    if (typeof localStorage === 'undefined') return null;
    return localStorage.getItem('SessionId');
}

const appleMusicApi = {
    async getDeveloperToken(): Promise<string> {
        const response = await fetch(`${API_URL}api/apple/auth/developertoken`);
        return await response.json();
    },

    async getSessionData(): Promise<ISessionData> {
        const response = await fetch(`${API_URL}api/apple/auth/sessiondata`, {
            headers: { 'X-SessionId': getSessionId() || '' }
        });
        return await response.json();
    },

    async postSessionData(data: ISessionData): Promise<ISessionData> {
        const response = await fetch(`${API_URL}api/apple/auth/sessiondata`, {
            method: 'POST',
            headers: {
                'X-SessionId': getSessionId() || '',
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(data)
        });
        return await response.json();
    },

    async logout(): Promise<void> {
        await fetch(`${API_URL}api/apple/auth/sessiondata`, {
            method: 'DELETE',
            headers: { 'X-SessionId': getSessionId() || '' }
        });
    }
};

export default appleMusicApi;
