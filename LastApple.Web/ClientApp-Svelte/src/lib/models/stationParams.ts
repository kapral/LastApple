export interface IStationParams {
    triggerCreate: boolean;
    onStationCreated: (stationId: string) => void;
    onOptionsChanged: (valid: boolean) => void;
}