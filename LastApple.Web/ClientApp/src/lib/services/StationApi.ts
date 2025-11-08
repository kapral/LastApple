import { Environment } from '$lib/Environment';
import type { IStationParams } from '$lib/types/IStationParams';

interface IStationDefinition {
    stationType: string;
}

export interface IStation {
    id: string;
    songIds: Array<string>;
    size: number;
    isContinuous: boolean;
    isGroupedByAlbum: boolean;
    definition: IStationDefinition;
}

export async function createStation(params: IStationParams): Promise<string> {
    const sessionId = typeof window !== 'undefined' ? localStorage.getItem('SessionId') : null;
    
    let url = `${Environment.apiUrl}api/station/${params.stationType}`;
    
    if (params.artistName) {
        url += `/${encodeURIComponent(params.artistName)}`;
    } else if (params.tag) {
        url += `/${encodeURIComponent(params.tag)}`;
    }
    
    const response = await fetch(url, {
        method: 'POST',
        headers: { 'X-SessionId': sessionId || '' }
    });
    
    const station: IStation = await response.json();
    return station.id;
}

export async function getStation(stationId: string): Promise<IStation> {
    const response = await fetch(`${Environment.apiUrl}api/station/${stationId}`);
    return await response.json();
}

export async function topUp(stationId: string, stationType: string, count: number): Promise<void> {
    await fetch(`${Environment.apiUrl}api/station/${stationType}/${stationId}/topup/${count}`, { 
        method: 'POST' 
    });
}

export async function deleteSongs(stationId: string, position: number, count: number): Promise<void> {
    await fetch(`${Environment.apiUrl}api/station/${stationId}/songs?position=${position}&count=${count}`, { 
        method: 'DELETE' 
    });
}
