import { observable } from "mobx";

export class AppState {
    @observable latestStationId: string;
    currentKitStationId: string;
    @observable lastfmAuthenticated = false;
    @observable enableScrobbling = true;
}