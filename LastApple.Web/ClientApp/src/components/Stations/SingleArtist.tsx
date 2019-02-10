import React, { Component } from "react";
import { Search } from "../Search";
import { Redirect } from "react-router";

export class SingleArtist extends Component<{}, { currentArtistId: string, stationId: string, redirect: boolean }> {
    constructor(props) {
        super(props);

        this.state = {
            currentArtistId: null, stationId: null, redirect: false
        };
    }

    async playStation() {
        const apiResponse = await fetch(`api/station/artist/${this.state.currentArtistId}`, { method: 'POST' });

        this.setState({
            stationId: await apiResponse.json(),
            redirect: true
        });
    }

    render(): React.ReactNode {
        if(this.state.redirect)
            return <Redirect to={`/station/${this.state.stationId}`}/>

        return <div className={'clearfix'} style={{background: '#C8C8C8', padding: '10px'}}>
            <h5 style={{color: '#151515'}}>One artist</h5>
            <Search onFound={artistId => this.setState({ currentArtistId: artistId })} placeholder={'Find artist'}/>
            <button style={{float: 'right', margin: '10px 0 5px', background: '#100404', border: 'none', padding: '10px', color: '#C8C8C8'}} onClick={() => this.playStation()}>Play Station</button>
        </div>
    }
}