import React, { Component } from "react";
import { IStationParams } from "../IStationParams";
import stationApi from "../../restClients/StationApi";
import { AppContext } from '../../AppContext';

export class MyLibrary extends Component<IStationParams> {
    static contextType = AppContext;
    context: React.ContextType<typeof AppContext>;

    componentDidMount(): void {
        this.props.onOptionsChanged(this.context.lastfmAuthenticated);
    }

    async componentDidUpdate() {
        if(this.context.lastfmAuthenticated) {
            this.props.onOptionsChanged(true);
        }

        if (this.props.triggerCreate) {
            const station = await stationApi.postStation('lastfmlibrary', 'my');

            this.props.onStationCreated(station.id);
        }
    }

    render(): React.ReactNode {
        const showWarning = !this.context.lastfmAuthenticated && !this.context.checkingLastfmAuth;
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