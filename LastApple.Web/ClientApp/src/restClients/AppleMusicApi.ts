import environment from "../Environment";

export interface ISessionData {
    id?: string;
    musicUserToken: string;
    musicStorefrontId: string;
}

class AppleMusicApi {
    async getDeveloperToken(): Promise<string> {
        const tokenResponse = await fetch(`${environment.apiUrl}api/apple/auth/developertoken`);

        return await tokenResponse.json();
    }

    async getSessionData(): Promise<ISessionData> {
        const response = await fetch(`${environment.apiUrl}api/apple/auth/sessiondata`, { headers: { 'X-SessionId': localStorage.getItem('SessionId') } });

        return await response.json();
    }

    async postSessionData(data: ISessionData): Promise<ISessionData> {
        const response = await fetch(`${environment.apiUrl}api/apple/auth/sessiondata`, {
            body: JSON.stringify(data),
            method: 'POST',
            headers: {
                'X-SessionId': localStorage.getItem('SessionId'),
                'Content-Type': 'application/json'
            }
        });

        return await response.json();
    }

    async deleteSessionData(): Promise<void> {
        await fetch(`${environment.apiUrl}api/apple/auth/sessiondata`, {
            method: 'DELETE',
            headers: { 'X-SessionId': localStorage.getItem('SessionId') }
        });
    }
}

const appleMusicApi = new AppleMusicApi();

export default appleMusicApi;