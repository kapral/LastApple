import environment from "../Environment";

export interface ISessionData {
    id?: string;
    musicUserToken: string;
    musicStorefrontId: string;
}

class AppleMusicApi {
    async getDeveloperToken(): Promise<string> {
        const tokenResponse = await fetch(`${environment.baseUrl}api/apple/auth/developertoken`);

        return await tokenResponse.json();
    }

    async getSessionData(): Promise<ISessionData> {
        const response = await fetch(`${environment.baseUrl}api/apple/auth/sessiondata`, { headers: { 'X-SessionId': localStorage.getItem('SessionId') } });

        return await response.json();
    }

    async postSessionData(data: ISessionData): Promise<ISessionData> {
        const response = await fetch(`${environment.baseUrl}api/apple/auth/sessiondata`, {
            body: JSON.stringify(data),
            method: 'POST',
            headers: {
                'X-SessionId': localStorage.getItem('SessionId'),
                'Content-Type': 'application/json'
            }
        });

        return await response.json();
    }
}

export default new AppleMusicApi();