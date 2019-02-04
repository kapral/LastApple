import React, { Component } from 'react';
import {PlayerControl} from "./Player/PlayerControl";
import {Search} from "./Search";
import {LastfmAuthManager} from "./LastfmAuthManager";

interface IHomeState {
    currentArtistId: string;
}

export class Home extends Component<{}, IHomeState> {
    displayName = Home.name

    constructor(props){
        super(props);

        this.state = { currentArtistId: null };
    }

    render() {
        return <div>
            <LastfmAuthManager/>
            <Search onFound={artistId => this.setState({currentArtistId: artistId})}/>
            <PlayerControl artistId={this.state.currentArtistId}/>
        </div>;
    }
}
