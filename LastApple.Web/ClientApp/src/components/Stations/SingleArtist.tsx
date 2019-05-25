import React, { Component } from "react";
import { Search } from "../Search";
import musicKit from "../../musicKit";
import { IMediaItemOptions } from "../MusicKitWrapper/MusicKitDefinitions";
import { IStationParams } from "../IStationParams";

export class SingleArtist extends Component<IStationParams, { currentArtistId: string }> {
    constructor(props) {
        super(props);

        this.state = { currentArtistId: null };
    }

    async componentDidUpdate() {
        if (this.props.triggerCreate) {
            const apiResponse = await fetch(`api/station/artist/${this.state.currentArtistId}`, { method: 'POST' });

            this.props.onStationCreated((await apiResponse.json()).id);
        }
    }

    async search(term: string) {
        const kit = await musicKit.getInstance();
        const result = await kit.api.search(term);

        if (!result.artists) {
            return [];
        }

        return result.artists.data.map(x => x);
    }

    render(): React.ReactNode {
        return <div style={{ padding: '10px' }}>
            <Search<IMediaItemOptions> search={term => this.search(term)}
                                       onChanged={artist => this.handleChanged(artist)}
                                       placeholder={'Search for an artist'}
                                       labelAccessor={x => (x as any).attributes.name}/>
        </div>
    }

    handleChanged(artist: IMediaItemOptions) {
        this.setState({ currentArtistId: artist && artist.id });
        this.props.onOptionsChanged(!!artist);
    }

    static Definition = {
        title: 'Artist',
        description: 'Play all tracks of one artist.',
        type: SingleArtist
    };
}