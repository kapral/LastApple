import React, { Component } from "react";
import { Search } from "../Search";

export class SingleArtist extends Component<{ submit: boolean, onCreated(id: string): void }, { currentArtistId: string }> {
    constructor(props) {
        super(props);

        this.state = { currentArtistId: null };
    }

    async componentDidUpdate() {
        if (this.props.submit) {
            const apiResponse = await fetch(`api/station/artist/${this.state.currentArtistId}`, { method: 'POST' });

            this.props.onCreated((await apiResponse.json()).id);
        }
    }

    render(): React.ReactNode {
        return <div style={{ padding: '10px' }}>
            <Search onFound={artistId => this.setState({ currentArtistId: artistId })} placeholder={'Type artist'}/>
        </div>
    }

    static Definition = {
        title: 'Artist',
        description: 'Play all tracks of one artist.',
        type: SingleArtist
    };
}