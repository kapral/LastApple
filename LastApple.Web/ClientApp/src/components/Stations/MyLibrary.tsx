import React, { Component } from "react";
import { IStationParams } from "../IStationParams";
import stationApi from "../../restClients/StationApi";

export class MyLibrary extends Component<IStationParams> {
    componentDidMount(): void {
        this.props.onOptionsChanged(this.props.appState.lastfmAuthenticated);
    }

    async componentDidUpdate() {
        if(this.props.appState.lastfmAuthenticated) {
            this.props.onOptionsChanged(true);
        }

        if (this.props.triggerCreate) {
            const station = await stationApi.postStation('lastfmlibrary', 'my');

            this.props.onStationCreated(station.id);
        }
    }

    render(): React.ReactNode {
        if(this.props.appState.lastfmAuthenticated) {
            return null;
        }

        return <div style={{ margin: '10px', textAlign: 'center', color: '#ea6464' }}>You must be logged in to last.fm to be able to listen to this station.</div>;
    }

    static Definition = {
        title: 'My last.fm Library',
        description: 'A continuous station based on your last.fm library.',
        type: MyLibrary
    };
}