export interface IStationParams {
    triggerCreate: boolean;

    onOptionsChanged(isValid: boolean): void;

    onStationCreated(id: string): void;
}