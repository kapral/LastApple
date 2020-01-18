import { observable } from "mobx";

export class AppState {
    @observable latestStationId: string;
    @observable lastfmAuthenticated = false;
    @observable checkingLastfmAuth = false;
    @observable enableScrobbling = true;
}