import React, { Component } from "react";
import { Search } from "../Search";
import { IStationParams } from "../IStationParams";
import stationApi from "../../restClients/StationApi";
import lastfmApi from "../../restClients/LastfmApi";

export class SimilarArtists extends Component<IStationParams, { artist: string }> {
    constructor(props) {
        super(props);

        this.state = {
            artist: null
        };
    }

    async componentDidUpdate() {
        if (this.props.triggerCreate) {
            const station = await stationApi.postStation('similarartists', this.state.artist);

            this.props.onStationCreated(station.id);
        }
    }

    async search(term: string) {
        const results = await lastfmApi.searchArtist(term);

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