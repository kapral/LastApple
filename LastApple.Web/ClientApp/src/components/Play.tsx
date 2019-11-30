import React, {Component} from "react";
import { StationPlayer } from "./Player/StationPlayer";
import { inject } from "mobx-react";
import { BaseRouterProps } from "../BaseRouterProps";

interface PlayProps extends BaseRouterProps {
    showPlayer: boolean;
    stationId: string;
}

@inject('appState')
export class Play extends Component<PlayProps> {
    private get stationId(): string {
        return this.props.stationId || this.props.appState.latestStationId;
    }
    
    componentDidMount(): void {
        this.updateLatestStationId();
    }

    componentDidUpdate(): void {
        this.updateLatestStationId();
    }
    
    updateLatestStationId() {
        if (this.props.appState.latestStationId !== this.stationId) {
            this.props.appState.latestStationId = this.stationId;
        }
    }
    
    render() {
        const stationId = this.stationId;

        if (!stationId)
            return null;

        return <div style={{ display: this.props.showPlayer ? 'block' : 'none' }}>
            <StationPlayer stationId={stationId} appState={this.props.appState}></StationPlayer>
        </div>;
    }
}