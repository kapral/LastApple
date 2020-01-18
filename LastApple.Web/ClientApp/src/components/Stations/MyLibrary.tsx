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
        const showWarning = !this.props.appState.lastfmAuthenticated && !this.props.appState.checkingLastfmAuth;
        return <div style={{ display: 'flex', flex: 1 }}>
            <div style={{ margin: '10px 10px 10px 0', color: '#ffc123', display: showWarning ? 'block' : 'none' }}>Log in to last.fm to listen to your library.</div>
            <div style={{ flex: 1, height: '54px' }}></div>
        </div>;
    }

    static Definition = {
        title: 'My last.fm Library',
        description: 'A continuous station based on your last.fm library.',
        type: MyLibrary
    };
}