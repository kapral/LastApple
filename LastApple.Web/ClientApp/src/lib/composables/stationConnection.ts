import * as signalR from '@microsoft/signalr';
import { Environment } from '$lib/Environment';

export interface StationConnection {
    connection: signalR.HubConnection;
    onTrackAdded: (callback: (track: any) => void) => void;
    onStationComplete: (callback: () => void) => void;
    disconnect: () => Promise<void>;
}

export async function connectToStation(stationId: string): Promise<StationConnection> {
    const connection = new signalR.HubConnectionBuilder()
        .withUrl(`${Environment.apiBaseUrl}/hubs/station`)
        .withAutomaticReconnect()
        .build();
    
    await connection.start();
    
    // Join the station group
    await connection.invoke('JoinStation', stationId);
    
    return {
        connection,
        onTrackAdded: (callback) => {
            connection.on('TrackAdded', callback);
        },
        onStationComplete: (callback) => {
            connection.on('StationComplete', callback);
        },
        disconnect: async () => {
            await connection.invoke('LeaveStation', stationId);
            await connection.stop();
        }
    };
}

export async function disconnectFromStation(connection: StationConnection): Promise<void> {
    await connection.disconnect();
}
