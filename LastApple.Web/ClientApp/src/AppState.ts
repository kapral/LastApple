import { observable } from "mobx";

export class AppState {
    @observable latestStationId: string;
    @observable lastfmAuthenticated = false;
    @observable enableScrobbling = true;
}