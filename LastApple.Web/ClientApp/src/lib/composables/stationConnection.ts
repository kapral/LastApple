import * as signalR from '@microsoft/signalr';
import { environment } from '$lib/Environment';

export interface StationConnection {
    connection: signalR.HubConnection;
    onTrackAdded: (callback: (track: any) => void) => void;
    onStationComplete: (callback: () => void) => void;
    disconnect: () => Promise<void>;
}

export async function connectToStation(stationId: string): Promise<StationConnection> {
    const connection = new signalR.HubConnectionBuilder()
        .withUrl(`${environment.apiUrl}hubs`)
        .withAutomaticReconnect()
        .build();

    await connection.start();

    return {
        connection,
        onTrackAdded: (callback) => {
            connection.on('trackAdded', callback);
        }
    };
}

export async function disconnectFromStation(connection: StationConnection): Promise<void> {
    await connection.disconnect();
}
