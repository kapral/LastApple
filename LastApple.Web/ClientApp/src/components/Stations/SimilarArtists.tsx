import React, { Component } from "react";
import { Search } from "../Search";
import { IStationParams } from "../IStationParams";

export class SimilarArtists extends Component<IStationParams, { artist: string }> {
    constructor(props) {
        super(props);

        this.state = {
            artist: null
        };
    }

    async componentDidUpdate() {
        if (this.props.triggerCreate) {
            const apiResponse = await fetch(`api/station/similarartists/${this.state.artist}`, { method: 'POST' });

            this.props.onStationCreated((await apiResponse.json()).id);
        }
    }

    async search(term: string) {
        const apiResponse = await fetch(`api/lastfm/artist/search?term=${term}`);

        const results = await apiResponse.json();

        return results.map(x => x.name);
    }

    render(): React.ReactNode {
        return <div className={'station-parameters'} style={{ padding: '10px' }}>
            <Search<string> search={term => this.search(term)}
                                       onChanged={artist => this.handleChanged(artist)}
                                       placeholder={'Search for an artist'}/>
        </div>
    }

    handleChanged(artist: string) {
        this.setState({ artist: artist });
        this.props.onOptionsChanged(!!artist);
    }

    static Definition = {
        title: 'Similar Artists',
        description: 'A station containing an artist and similar performers.',
        type: SimilarArtists
    };
}