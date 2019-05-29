import React, {Component} from "react";
import { PlayerControl } from "./Player/PlayerControl";
import { inject } from "mobx-react";
import { BaseRouterProps } from "../BaseRouterProps";

@inject('appState')
export class Play extends Component<BaseRouterProps>{
    private readonly stationId: string;

    constructor(props){
        super(props);

        const stationId = this.props.match.params['station'];

        if(this.props.appState.latestStationId != stationId) {
            this.props.appState.latestStationId = stationId;
        }

        this.stationId = stationId;
    }

    render() {
        return <PlayerControl stationId={this.stationId} appState={this.props.appState} ></PlayerControl>;
    }
}