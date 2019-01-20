import React, { Component } from 'react';
import {PlayerControl} from "./Player/PlayerControl";
import {Search} from "./Search";

interface IHomeState {
    currentArtistId: string;
    authenticatedToLastfm: boolean;
}

export class Home extends Component<{}, IHomeState> {
    displayName = Home.name

    constructor(props){
        super(props);

        this.state = { currentArtistId: null, authenticatedToLastfm: false };
    }

    async componentDidMount() {
        const authStateResponse = await fetch('/lastfm/auth/state');

        this.setState({authenticatedToLastfm: await authStateResponse.json()});
    }

    render() {
        return <div>
            {!this.state.authenticatedToLastfm &&
            <a href={'/lastfm/auth'}>Authenticate to Last.fm</a>}
            <Search onFound={artistId => this.setState({currentArtistId: artistId})}/>
            <PlayerControl artistId={this.state.currentArtistId}/>
        </div>;
    }
}
