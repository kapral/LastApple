import * as signalR from '@microsoft/signalr';
import { environment } from '$lib/Environment';

export interface StationConnection {
    connection: signalR.HubConnection;
    onTrackAdded?: (trackStationId: string, trackId: string, position: number) => Promise<void>;
    onStationComplete?: () => void;
    start: () => Promise<void>;
    stop: () => Promise<void>;
}

export async function connectToStation(stationId: string): Promise<StationConnection> {
    const connection = new signalR.HubConnectionBuilder()
        .withUrl(`${environment.apiUrl}hubs`)
        .withAutomaticReconnect()
        .build();

    const stationConnection: StationConnection = {
        connection,
        start: async () => {
            await connection.start();
        },
        stop: async () => {
            await connection.stop();
        }
    };

    // Set up the trackAdded listener
    connection.on('trackAdded', async (trackStationId: string, trackId: string, position: number) => {
        if (stationConnection.onTrackAdded) {
            await stationConnection.onTrackAdded(trackStationId, trackId, position);
        }
    });

    connection.on('stationComplete', () => {
        if (stationConnection.onStationComplete) {
            stationConnection.onStationComplete();
        }
    });

    return stationConnection;
}

export async function disconnectFromStation(connection: StationConnection): Promise<void> {
    await connection.stop();
}
