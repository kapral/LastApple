import environment from "../Environment";

interface IStationDefinition {
    stationType: string;
}

export interface IStation {
    id: string;
    songIds: Array<string>
    size: number;
    isContinuous: boolean;
    isGroupedByAlbum: boolean;
    definition: IStationDefinition;
}

class StationApi {
    async getStation(stationId: string): Promise<IStation> {
        const stationResponse = await fetch(`${environment.apiUrl}api/station/${stationId}`);

        return await stationResponse.json();
    }

    async postStation(stationType: string, stationName: string): Promise<IStation> {
        const apiResponse = await fetch(`${environment.apiUrl}api/station/${stationType}/${stationName}`, { method: 'POST', headers: { 'X-SessionId': localStorage.getItem('SessionId') } });

        return await apiResponse.json();
    }

    async topUp(stationId: string, stationType: string, count: number) {
        await fetch(`${environment.apiUrl}api/station/${stationType}/${stationId}/topup/${count}`, { method: 'POST' });
    }

    async deleteSongs(stationId: string, position: number, count: number) {
        await fetch(`${environment.apiUrl}api/station/${stationId}/songs?position=${position}&count=${count}`, { method: 'DELETE' });
    }
}

const stationApi = new StationApi();

export default stationApi;
