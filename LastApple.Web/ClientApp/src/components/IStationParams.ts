import { BaseProps } from "../BaseProps";

export interface IStationParams extends BaseProps {
    triggerCreate: boolean;

    onOptionsChanged(isValid: boolean): void;

    onStationCreated(id: string): void;
}