import React, { Component } from "react";
import { Search } from "../Search";
import musicKit from "../../musicKit";
import { IStationParams } from "../IStationParams";
import stationApi from "../../restClients/StationApi";

export class SingleArtist extends Component<IStationParams, { currentArtistId: string }> {
    constructor(props) {
        super(props);

        this.state = { currentArtistId: null };
    }

    async componentDidUpdate() {
        if (this.props.triggerCreate) {
            const station = await stationApi.postStation('artist', this.state.currentArtistId);

            this.props.onStationCreated(station.id);
        }
    }

    async search(term: string) {
        const kit = await musicKit.getInstance();
        const parameters = { term: term, types: ['artists'], l: 'en-us' };

        const response = await kit.api.music(`/v1/catalog/${kit.storefrontId}/search`, parameters);

        if (!response.data.results.artists) {
            return [];
        }

        return response.data.results.artists.data.map(x => x);
    }

    render(): React.ReactNode {
        return <div className='station-parameters'>
            <Search<MusicKit.MediaItemOptions> search={term => this.search(term)}
                                       onChanged={artist => this.handleChanged(artist)}
                                       placeholder={'Radiohead...'}
                                       labelAccessor={x => (x as any).attributes.name}/>
        </div>
    }

    handleChanged(artist: MusicKit.MediaItemOptions) {
        this.setState({ currentArtistId: artist && artist.id });
        this.props.onOptionsChanged(!!artist);
    }

    static Definition = {
        title: 'Artist',
        description: 'Play all tracks of one artist.',
        type: SingleArtist
    };
}