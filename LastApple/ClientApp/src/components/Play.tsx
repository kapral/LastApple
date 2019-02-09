import React, {Component} from "react";
import { RouteComponentProps } from "react-router";
import { PlayerControl } from "./Player/PlayerControl";

export class Play extends Component<RouteComponentProps>{
    render() {
        return <PlayerControl stationId={this.props.match.params['station']}></PlayerControl>;
    }
}