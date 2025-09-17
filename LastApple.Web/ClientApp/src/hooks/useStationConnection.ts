import { useCallback, useRef } from 'react';
import * as signalR from '@aspnet/signalr';
import { HubConnection } from '@aspnet/signalr';
import environment from '../Environment';

interface IAddTrackEvent {
    trackId: string;
    position: number;
}

interface UseStationConnectionProps {
    stationId: string;
    onTrackAdded: (event: IAddTrackEvent) => Promise<void>;
}

export const useStationConnection = ({ stationId, onTrackAdded }: UseStationConnectionProps) => {
    const hubConnectionRef = useRef<HubConnection | null>(null);
    const pendingEventsRef = useRef<IAddTrackEvent[]>([]);

    const subscribeToStationEvents = useCallback(async () => {
        if (hubConnectionRef.current) return;

        hubConnectionRef.current = new signalR.HubConnectionBuilder()
            .withUrl(`${environment.apiUrl}hubs`)
            .build();

        await hubConnectionRef.current.start();

        hubConnectionRef.current.on('trackAdded', async (trackStationId: string, trackId: string, position: number) => {
            if (trackStationId !== stationId) {
                return;
            }

            const event = { trackId, position };
            await onTrackAdded(event);
        });
    }, [stationId, onTrackAdded]);

    const addPendingEvent = useCallback((event: IAddTrackEvent) => {
        pendingEventsRef.current.push(event);
    }, []);

    const getPendingEvents = useCallback(() => {
        const events = [...pendingEventsRef.current];
        pendingEventsRef.current = [];
        return events;
    }, []);

    const cleanup = useCallback(() => {
        if (hubConnectionRef.current) {
            hubConnectionRef.current.off('trackAdded');
        }
    }, []);

    return {
        subscribeToStationEvents,
        addPendingEvent,
        getPendingEvents,
        cleanup
    };
};