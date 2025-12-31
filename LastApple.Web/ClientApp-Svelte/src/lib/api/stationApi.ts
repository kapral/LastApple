// Station API client
import environment from '$lib/services/environment';

const API_URL = environment.apiUrl;

export interface IStationDefinition {
    stationType: string;
}

export interface IStation {
    id: string;
    songIds: string[];
    isContinuous: boolean;
    isGroupedByAlbum: boolean;
    size: number;
    definition: IStationDefinition;
}

function getSessionId(): string | null {
    if (typeof localStorage === 'undefined') return null;
    return localStorage.getItem('SessionId');
}

const stationApi = {
    async getStation(stationId: string): Promise<IStation> {
        const response = await fetch(`${API_URL}api/station/${stationId}`);
        return await response.json();
    },

    async postStation(stationType: string, name: string | null): Promise<IStation> {
        const response = await fetch(`${API_URL}api/station/${stationType}/${name}`, {
            method: 'POST',
            headers: { 'X-SessionId': getSessionId() || '' }
        });
        return await response.json();
    },

    async topUp(stationId: string, stationType: string, count: number): Promise<void> {
        await fetch(`${API_URL}api/station/${stationType}/${stationId}/topup/${count}`, {
            method: 'POST'
        });
    },

    async deleteSongs(stationId: string, position: number, count: number): Promise<void> {
        await fetch(`${API_URL}api/station/${stationId}/songs?position=${position}&count=${count}`, {
            method: 'DELETE'
        });
    }
};

export default stationApi;
