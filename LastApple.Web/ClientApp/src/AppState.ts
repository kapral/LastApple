import { observable } from "mobx";

export class AppState {
    @observable latestStationId: string;
    currentKitStationId: string;
}