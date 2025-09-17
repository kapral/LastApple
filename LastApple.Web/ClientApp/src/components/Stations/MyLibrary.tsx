import React, {Component} from "react";
import {IStationParams} from "../IStationParams";
import stationApi from "../../restClients/StationApi";
import { LastfmContext } from '../../lastfm/LastfmContext';
import { AuthenticationState } from '../../authentication';

export class MyLibrary extends Component<IStationParams> {
    static contextType = LastfmContext;
    context: React.ContextType<typeof LastfmContext>;

    componentDidMount(): void {
        this.props.onOptionsChanged(this.context.authentication.state === AuthenticationState.Authenticated);
    }

    async componentDidUpdate() {
        if(this.context.authentication.state === AuthenticationState.Authenticated) {
            this.props.onOptionsChanged(true);
        }

        if (this.props.triggerCreate) {
            const station = await stationApi.postStation('lastfmlibrary', 'my');

            this.props.onStationCreated(station.id);
        }
    }

    render(): React.ReactNode {
        const showWarning = this.context.authentication.state === AuthenticationState.Unauthenticated;
        return <div className='station-parameters' style={{ display: 'flex', flex: 1 }}>
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