import React, { Component } from "react";
import { IStationParams } from "../IStationParams";

export class MyLibrary extends Component<IStationParams> {
    componentDidMount(): void {
        this.props.onOptionsChanged(this.props.appState.lastfmAuthenticated);
    }

    async componentDidUpdate() {
        if(this.props.appState.lastfmAuthenticated) {
            this.props.onOptionsChanged(true);
        }

        if (this.props.triggerCreate) {
            const apiResponse = await fetch(`api/station/lastfmlibrary/my`, { method: 'POST' });

            this.props.onStationCreated((await apiResponse.json()).id);
        }
    }

    render(): React.ReactNode {
        console.log(`Last authenticated: ${this.props.appState.lastfmAuthenticated}`);

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